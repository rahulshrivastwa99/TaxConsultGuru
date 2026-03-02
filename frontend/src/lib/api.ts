// frontend/src/lib/api.ts

// Hamesha Environment variable check karega. Agar nahi mila to Localhost lega.
const envUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
// Sanitize URL: Remove trailing slash if present to avoid double slashes in paths
const BASE_URL = envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
const API_URL = `${BASE_URL}/api`;

// Helper for default headers and credentials
const getFetchOptions = (method = "GET", body?: any, token?: string) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  return {
    method,
    headers,
    credentials: "include" as const,
    ...(body ? { body: JSON.stringify(body) } : {}),
  };
};

// Helper to normalize ID
const normalize = (data: any) => {
  if (data && data._id) {
    return { ...data, id: data._id };
  }
  return data;
};

// --- AUTH ---
export const registerUser = async (userData: any) => {
  const response = await fetch(`${API_URL}/auth/register`, getFetchOptions("POST", userData));
  const data = await response.json();
  if (!response.ok) {
    const error: any = new Error(data.message || "Registration failed");
    error.status = response.status;
    throw error;
  }
  return normalize(data);
};

export const loginUser = async (userData: { email: string; password: string; role: string }) => {
  const response = await fetch(`${API_URL}/auth/login`, getFetchOptions("POST", userData));
  const data = await response.json();
  if (!response.ok) {
    const error: any = new Error(data.message || "Login failed");
    error.status = response.status;
    throw error;
  }
  return normalize(data);
};

export const verifyOtp = async (otpData: { email: string; otp: string }) => {
  const response = await fetch(`${API_URL}/auth/verify-otp`, getFetchOptions("POST", otpData));
  const data = await response.json();
  if (!response.ok) {
    const error: any = new Error(data.message || "Failed to verify OTP");
    error.status = response.status;
    throw error;
  }
  return normalize(data);
};

export const fetchMe = async (token: string) => {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    credentials: "include",
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch profile");
  return normalize(data);
};

// --- REQUESTS ---
export const createRequest = async (requestData: any) => {
  const response = await fetch(`${API_URL}/requests/create`, getFetchOptions("POST", requestData));
  return normalize(await response.json());
};

export const fetchRequests = async () => {
  const response = await fetch(`${API_URL}/requests/all`, { credentials: "include" });
  const data = await response.json();
  return Array.isArray(data) ? data.map(normalize) : [];
};

export const updateRequestStatus = async (id: string, action: 'accept' | 'approve', data?: any) => {
  const response = await fetch(`${API_URL}/requests/${id}/${action}`, getFetchOptions("PUT", data));
  return normalize(await response.json());
};

// --- CHAT ---
export const sendMessageAPI = async (requestId: string, messageData: any, token: string) => {
  const response = await fetch(`${API_URL}/chat/${requestId}/messages`, getFetchOptions("POST", messageData, token));
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to send message");
  return normalize(data);
};

// NEW: Upload file with Cloudinary & Multer support via FormData
export const sendMessageWithFile = async (
  requestId: string,
  messageData: { text: string, senderId: string, senderRole: string, senderName: string },
  file: File,
  token: string
) => {
  const formData = new FormData();
  formData.append('text', messageData.text);
  formData.append('senderId', messageData.senderId);
  formData.append('senderRole', messageData.senderRole);
  formData.append('senderName', messageData.senderName);
  formData.append('file', file);

  const response = await fetch(`${API_URL}/chat/${requestId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // Do NOT set Content-Type here; browser sets it with boundaries automatically for FormData!
    },
    body: formData,
    credentials: "include",
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to send message with file");
  return normalize(data);
};

export const fetchMessagesAPI = async (requestId: string, token: string) => {
  const response = await fetch(`${API_URL}/chat/${requestId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch messages");
  return Array.isArray(data) ? data.map(normalize) : normalize(data);
};

// --- ADMIN ---
export const fetchPendingCAs = async (token: string) => {
  const response = await fetch(`${API_URL}/admin/pending-cas`, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    credentials: "include",
  });
  return (await response.json()).map(normalize);
};

export const verifyCA = async (id: string, token: string) => {
  const response = await fetch(`${API_URL}/admin/verify-ca/${id}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    credentials: "include",
  });
  return normalize(await response.json());
};

export const fetchPendingJobs = async (token: string) => {
  const response = await fetch(`${API_URL}/admin/pending-jobs`, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    credentials: "include",
  });
  return (await response.json()).map(normalize);
};

export const fetchAllUsers = async (token: string) => {
  const response = await fetch(`${API_URL}/admin/users`, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    credentials: "include",
  });
  return (await response.json()).map(normalize);
};

export const approveJob = async (id: string, token: string) => {
  const response = await fetch(`${API_URL}/admin/approve-job/${id}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    credentials: "include",
  });
  return normalize(await response.json());
};

export const rejectJob = async (id: string, token: string) => {
  const response = await fetch(`${API_URL}/admin/reject-job/${id}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    credentials: "include",
  });
  return normalize(await response.json());
};

export const fetchLiveJobs = async () => {
  const response = await fetch(`${API_URL}/requests/all?status=live`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  const data = await response.json();
  return Array.isArray(data) ? data.map(normalize) : [];
};

// --- BIDS ---
export const placeBid = async (requestId: string, bidData: any, token: string) => {
  const response = await fetch(`${API_URL}/requests/${requestId}/bids`, getFetchOptions("POST", bidData, token));
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to place bid");
  return normalize(data);
};

export const fetchBidsForRequest = async (requestId: string, token: string) => {
  const response = await fetch(`${API_URL}/requests/${requestId}/bids`, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    credentials: "include",
  });
  const data = await response.json();
  return Array.isArray(data) ? data.map(normalize) : [];
};

export const hireCAAPI = async (bidId: string, token: string) => {
  const response = await fetch(`${API_URL}/bids/${bidId}/hire`, getFetchOptions("POST", {}, token));
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to hire CA");
  return normalize(data);
};

export const unlockWorkspaceAPI = async (id: string, token: string) => {
  const response = await fetch(`${API_URL}/admin/requests/${id}/unlock`, getFetchOptions("PATCH", {}, token));
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to unlock workspace");
  return normalize(data);
};

export const completeRequestAPI = async (id: string, token: string) => {
  const response = await fetch(`${API_URL}/requests/${id}/complete`, getFetchOptions("PATCH", {}, token));
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to complete request");
  return normalize(data);
};

export const approveWorkAPI = async (id: string, token: string) => {
  const response = await fetch(`${API_URL}/requests/${id}/approve-work`, getFetchOptions("PATCH", {}, token));
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to approve work");
  return normalize(data);
};

export const archiveProjectAPI = async (id: string, token: string) => {
  const response = await fetch(`${API_URL}/admin/requests/${id}/archive`, getFetchOptions("PATCH", {}, token));
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to archive project");
  return normalize(data);
};

export const rejectWorkAPI = async (id: string, token: string) => {
  const response = await fetch(`${API_URL}/requests/${id}/reject-work`, getFetchOptions("PATCH", {}, token));
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to reject work");
  return normalize(data);
};

export const forceApproveAPI = async (id: string, token: string) => {
  const response = await fetch(`${API_URL}/admin/requests/${id}/force-approve`, getFetchOptions("PATCH", {}, token));
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to force approve");
  return normalize(data);
};

export const updateRequestDescription = async (id: string, description: string, token: string) => {
  const response = await fetch(`${API_URL}/admin/requests/${id}`, getFetchOptions("PATCH", { description }, token));
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to update description");
  return normalize(data);
};