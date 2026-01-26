const API_URL = "http://localhost:5000/api";

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
  return normalize(data); // <--- Map _id to id
};

export const loginUser = async (userData: any) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Login failed");
  return normalize(data); // <--- Map _id to id
};

// ... (Keep the rest of your api.ts same, just ensuring fetch requests work) ...
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

export const sendMessageAPI = async (messageData: any) => {
    const response = await fetch(`${API_URL}/chat/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageData),
    });
    return normalize(await response.json());
};

export const fetchMessagesAPI = async (requestId: string) => {
    const response = await fetch(`${API_URL}/chat/${requestId}`);
    const data = await response.json();
    return Array.isArray(data) ? data.map(normalize) : [];
};