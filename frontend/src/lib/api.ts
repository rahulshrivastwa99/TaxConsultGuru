// frontend/src/lib/api.ts

// Hamesha Environment variable check karega. Agar nahi mila to Localhost lega.
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_URL = `${BASE_URL}/api`;

// Helper to normalize ID
const normalize = (data: any) => {
  if (data && data._id) {
    return { ...data, id: data._id };
  }
  return data;
};

// --- AUTH ---
export const registerUser = async (userData: any) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Registration failed");
  return normalize(data);
};

export const loginUser = async (userData: { email: string; password: string; role: string }) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Login failed");
  return normalize(data);
};

export const verifyOtp = async (otpData: { email: string; otp: string }) => {
  const response = await fetch(`${API_URL}/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(otpData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to verify OTP");
  return normalize(data);
};

// --- REQUESTS ---
export const createRequest = async (requestData: any) => {
  const response = await fetch(`${API_URL}/requests/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestData),
  });
  return normalize(await response.json());
};

export const fetchRequests = async () => {
  const response = await fetch(`${API_URL}/requests/all`);
  const data = await response.json();
  return Array.isArray(data) ? data.map(normalize) : [];
};

export const updateRequestStatus = async (id: string, action: 'accept' | 'approve', data?: any) => {
  const response = await fetch(`${API_URL}/requests/${id}/${action}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data || {}),
  });
  return normalize(await response.json());
};

// --- CHAT ---
export const sendMessageAPI = async (requestId: string, messageData: any, token: string) => {
  const response = await fetch(`${API_URL}/chat/${requestId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(messageData),
  });
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
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to send message with file");
  return normalize(data);
};

export const fetchMessagesAPI = async (requestId: string, token: string) => {
  const response = await fetch(`${API_URL}/chat/${requestId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to fetch messages");
  return Array.isArray(data) ? data.map(normalize) : normalize(data);
};

// --- ADMIN ---
export const fetchPendingCAs = async (token: string) => {
  const response = await fetch(`${API_URL}/admin/pending-cas`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return (await response.json()).map(normalize);
};

export const verifyCA = async (id: string, token: string) => {
  const response = await fetch(`${API_URL}/admin/verify-ca/${id}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
  return normalize(await response.json());
};

export const fetchPendingJobs = async (token: string) => {
  const response = await fetch(`${API_URL}/admin/pending-jobs`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return (await response.json()).map(normalize);
};

export const fetchAllUsers = async (token: string) => {
  const response = await fetch(`${API_URL}/admin/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return (await response.json()).map(normalize);
};

export const approveJob = async (id: string, token: string) => {
  const response = await fetch(`${API_URL}/admin/approve-job/${id}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
  return normalize(await response.json());
};

export const rejectJob = async (id: string, token: string) => {
  const response = await fetch(`${API_URL}/admin/reject-job/${id}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
  return normalize(await response.json());
};

export const fetchLiveJobs = async () => {
  const response = await fetch(`${API_URL}/requests/all?status=live`);
  const data = await response.json();
  return Array.isArray(data) ? data.map(normalize) : [];
};

// --- BIDS ---
export const placeBid = async (requestId: string, bidData: any, token: string) => {
  const response = await fetch(`${API_URL}/requests/${requestId}/bids`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(bidData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to place bid");
  return normalize(data);
};

export const fetchBidsForRequest = async (requestId: string, token: string) => {
  const response = await fetch(`${API_URL}/requests/${requestId}/bids`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  return Array.isArray(data) ? data.map(normalize) : [];
};

export const hireCAAPI = async (bidId: string, token: string) => {
  const response = await fetch(`${API_URL}/bids/${bidId}/hire`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to hire CA");
  return normalize(data);
};

export const unlockWorkspaceAPI = async (id: string, token: string) => {
  const response = await fetch(`${API_URL}/admin/requests/${id}/unlock`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to unlock workspace");
  return normalize(data);
};

export const completeRequestAPI = async (id: string, token: string) => {
  const response = await fetch(`${API_URL}/requests/${id}/complete`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to complete request");
  return normalize(data);
};

export const approveWorkAPI = async (id: string, token: string) => {
  const response = await fetch(`${API_URL}/requests/${id}/approve-work`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to approve work");
  return normalize(data);
};

export const archiveProjectAPI = async (id: string, token: string) => {
  const response = await fetch(`${API_URL}/admin/requests/${id}/archive`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to archive project");
  return normalize(data);
};

export const rejectWorkAPI = async (id: string, token: string) => {
  const response = await fetch(`${API_URL}/requests/${id}/reject-work`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to reject work");
  return normalize(data);
};

export const forceApproveAPI = async (id: string, token: string) => {
  const response = await fetch(`${API_URL}/admin/requests/${id}/force-approve`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to force approve");
  return normalize(data);
};