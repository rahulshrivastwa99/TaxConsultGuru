// frontend/src/context/MockBackendContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { toast } from "sonner";
import { io, Socket } from "socket.io-client";
import * as api from "../lib/api";

// --- DYNAMIC CONFIGURATION ---
// Ye line automatic detect karegi ki Local chalana hai ya Live
const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// --- TYPES ---
export type UserRole = "client" | "ca" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  token?: string;
}

export interface ServiceRequest {
  id: string;
  clientId: string;
  clientName: string;
  caId?: string;
  caName?: string;
  serviceType: string;
  serviceName: string;
  description: string;
  budget: number;
  status: "searching" | "pending_approval" | "active" | "completed";
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  requestId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  timestamp: Date;
  isForwarded?: boolean;
  intendedFor?: "client" | "ca";
}

export interface ActivityLog {
  id: string;
  type: "request" | "accept" | "approve" | "forward" | "admin_added" | "info";
  message: string;
  timestamp: Date;
}

// --- CONSTANTS ---
export interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
  defaultBudget: number;
}

export const SERVICES: Service[] = [
  {
    id: "gst-filing",
    name: "GST Filing",
    description: "Monthly/Quarterly GST return filing",
    icon: "FileText",
    defaultBudget: 2500,
  },
  {
    id: "itr-return",
    name: "Income Tax Return",
    description: "ITR filing for individuals and businesses",
    icon: "Calculator",
    defaultBudget: 3500,
  },
  {
    id: "company-incorporation",
    name: "Company Incorporation",
    description: "Private Ltd, LLP registration",
    icon: "Building2",
    defaultBudget: 15000,
  },
  {
    id: "tds-return",
    name: "TDS Return",
    description: "Quarterly TDS return filing",
    icon: "Receipt",
    defaultBudget: 1500,
  },
  {
    id: "audit",
    name: "Statutory Audit",
    description: "Complete statutory audit services",
    icon: "ClipboardCheck",
    defaultBudget: 25000,
  },
  {
    id: "bookkeeping",
    name: "Bookkeeping",
    description: "Monthly accounting services",
    icon: "BookOpen",
    defaultBudget: 5000,
  },
];
// (Services Constant same rahega, no change needed here)

// --- CONTEXT INTERFACE ---
interface BackendContextType {
  currentUser: User | null;
  isLoading: boolean;
  requests: ServiceRequest[];
  users: User[];
  logs: ActivityLog[];
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  registerUser: (
    name: string,
    email: string,
    password: string,
    role: UserRole,
  ) => Promise<User | null>;
  createRequest: (
    clientId: string,
    clientName: string,
    serviceType: string,
    serviceName: string,
    description: string,
    budget: number,
  ) => Promise<void>;
  caAcceptRequest: (
    requestId: string,
    caId: string,
    caName: string,
  ) => Promise<void>;
  adminApproveRequest: (requestId: string) => Promise<void>;
  getSearchingRequests: () => ServiceRequest[];
  getPendingApprovalRequests: () => ServiceRequest[];
  getActiveRequests: () => ServiceRequest[];
  clientMessages: Record<string, ChatMessage[]>;
  caMessages: Record<string, ChatMessage[]>;
  addClientMessage: (
    requestId: string,
    senderId: string,
    senderName: string,
    senderRole: UserRole,
    content: string,
  ) => Promise<void>;
  addCAMessage: (
    requestId: string,
    senderId: string,
    senderName: string,
    senderRole: UserRole,
    content: string,
  ) => Promise<void>;
  forwardToClient: (requestId: string, messageId: string) => Promise<void>;
  forwardToCA: (requestId: string, messageId: string) => Promise<void>; // <--- NEW
  addAdmin: (name: string, email: string, password: string) => void;
}

const MockBackendContext = createContext<BackendContextType | undefined>(
  undefined,
);

// Initialize Socket with Dynamic URL
const socket: Socket = io(BACKEND_URL);

export const MockBackendProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [allMessages, setAllMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Note: Since we use a real backend, we don't fetch all users to the frontend for security/performance.
  // We initialize this as empty to prevent the AdminDashboard crash.
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  // Format Helpers
  const formatRequest = (r: any): ServiceRequest => ({
    ...r,
    id: r.id || r._id,
    createdAt: new Date(r.createdAt),
  });

  const formatMessage = (m: any): ChatMessage => ({
    ...m,
    id: m.id || m._id,
    timestamp: new Date(m.createdAt || m.timestamp),
  });

  // 1. INITIALIZE APP
  useEffect(() => {
    const init = async () => {
      const savedUser = localStorage.getItem("userInfo");
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          setCurrentUser(user);
          await refreshData();
        } catch (e) {
          console.error("Failed to parse user", e);
          localStorage.removeItem("userInfo");
        }
      }
      setIsLoading(false);
    };

    init();

    // Socket Listeners
    socket.on("connect", () =>
      console.log("🟢 Socket Connected to:", BACKEND_URL),
    );

    socket.on("request_alert", (newRequest: any) => {
      setRequests((prev) => [formatRequest(newRequest), ...prev]);
      toast.info(`New Job Available: ${newRequest.serviceName}`);
    });

    socket.on("receive_message", (msg: any) => {
      const formatted = formatMessage(msg);
      console.debug("[socket.receive_message] incoming:", msg);
      setAllMessages((prev) => {
        if (prev.find((m) => m.id === formatted.id)) return prev;
        return [...prev, formatted];
      });
    });

    return () => {
      socket.off("request_alert");
      socket.off("receive_message");
    };
  }, []);

  const refreshData = async () => {
    try {
      // 1. Fetch Requests
      const reqs = await api.fetchRequests();
      const formattedReqs = reqs.map(formatRequest);
      setRequests(formattedReqs);

      // 2. NEW: Fetch Chat History for all requests
      // This ensures messages appear when you reload the page
      if (formattedReqs.length > 0) {
        const msgPromises = formattedReqs.map((r: any) =>
          api.fetchMessagesAPI(r.id).catch(() => []),
        );

        const responses = await Promise.all(msgPromises);
        const allMsgs = responses.flat().map(formatMessage);

        // Sort by time so they appear in order
        allMsgs.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

        setAllMessages(allMsgs);
      }
    } catch (e) {
      console.error("Failed to fetch data", e);
    }
  };

  // --- ACTIONS (Same logic as before, just calling API now) ---
  const login = async (email: string, password: string) => {
    try {
      const user = await api.loginUser({ email, password });
      setCurrentUser(user);
      localStorage.setItem("userInfo", JSON.stringify(user));
      await refreshData();
      return user;
    } catch (error: any) {
      toast.error(error.message);
      return null;
    }
  };

  const logout = () => {
    localStorage.removeItem("userInfo");
    setCurrentUser(null);
    setRequests([]);
    setAllMessages([]);
    window.location.href = "/";
  };

  const registerUser = async (
    name: string,
    email: string,
    password: string,
    role: UserRole,
  ) => {
    try {
      const user = await api.registerUser({ name, email, password, role });
      setCurrentUser(user);
      localStorage.setItem("userInfo", JSON.stringify(user));
      return user;
    } catch (error: any) {
      toast.error(error.message);
      return null;
    }
  };

  const createRequest = async (
    clientId: string,
    clientName: string,
    serviceType: string,
    serviceName: string,
    description: string,
    budget: number,
  ) => {
    try {
      const newReq = await api.createRequest({
        clientId,
        clientName,
        serviceType,
        serviceName,
        description,
        budget,
      });
      socket.emit("new_request", newReq); // Emit for real-time
    } catch (e) {
      toast.error("Failed to create request");
    }
  };

  const caAcceptRequest = async (
    requestId: string,
    caId: string,
    caName: string,
  ) => {
    try {
      await api.updateRequestStatus(requestId, "accept", { caId, caName });
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? { ...r, status: "pending_approval", caId, caName }
            : r,
        ),
      );
    } catch (e) {
      toast.error("Failed to accept job");
    }
  };

  const adminApproveRequest = async (requestId: string) => {
    try {
      await api.updateRequestStatus(requestId, "approve");
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: "active" } : r)),
      );
    } catch (e) {
      toast.error("Failed to approve");
    }
  };

  const sendMessageWrapper = async (
    requestId: string,
    content: string,
    senderRole: UserRole,
    isForwarded = false,
    intendedFor?: "client" | "ca",
  ) => {
    if (!currentUser) return;
    const msgData: any = {
      requestId,
      senderId: currentUser.id,
      senderRole,
      content,
      isForwarded,
    };
    if (intendedFor) msgData.intendedFor = intendedFor;
    try {
      console.debug("[sendMessageWrapper] sending:", msgData);
      const savedMsg = await api.sendMessageAPI(msgData);
      const formatted = formatMessage(savedMsg);
      // Preserve intendedFor locally if backend doesn't persist it
      if (intendedFor && !(formatted as any).intendedFor) {
        (formatted as any).intendedFor = intendedFor;
      }
      setAllMessages((prev) => {
        console.debug("[sendMessageWrapper] saved formatted:", formatted);
        if (prev.find((m) => m.id === formatted.id)) return prev;
        return [...prev, formatted];
      });
      socket.emit("send_message", savedMsg);
    } catch (e) {
      toast.error("Message failed");
    }
  };

  const addClientMessage = async (
    requestId: string,
    _sid: string,
    _sname: string,
    role: UserRole,
    content: string,
  ) => {
    // Use the provided role (e.g. 'admin' when Admin sends from Client box)
    // Mark intendedFor as 'client' so admin messages from Client box route correctly
    await sendMessageWrapper(requestId, content, role, false, "client");
  };

  const addCAMessage = async (
    requestId: string,
    _sid: string,
    _sname: string,
    role: UserRole,
    content: string,
  ) => {
    // Use the provided role (e.g. 'admin' when Admin sends from CA box)
    // Mark intendedFor as 'ca' so admin messages from CA box route correctly
    await sendMessageWrapper(requestId, content, role, false, "ca");
  };

  // 1. FORWARD TO CLIENT (Existing - Refined)
  const forwardToClient = async (requestId: string, messageId: string) => {
    const original = allMessages.find((m) => m.id === messageId);
    if (!original) return;

    // Admin sends this content to the Client thread
    // isForwarded flag helps us style it if needed
    await sendMessageWrapper(
      requestId,
      `From Expert: ${original.content}`,
      "admin",
      true,
      "client",
    );
    toast.success("Forwarded to Client");
  };

  // 2. FORWARD TO CA (New Feature)
  const forwardToCA = async (requestId: string, messageId: string) => {
    const original = allMessages.find((m) => m.id === messageId);
    if (!original) return;

    // Admin sends this content to the CA thread
    // NOTE: We strip the client's name to maintain "Double Blind"
    await sendMessageWrapper(
      requestId,
      `Client Request: ${original.content}`,
      "admin",
      true,
      "ca",
    );
    toast.success("Forwarded to CA");
  };

  const addAdmin = () => {
    toast.info("Use Admin API via Postman/Seeder");
  };

  // 3. MESSAGE FILTERING (Crucial Logic Fix)
  const clientMessages: Record<string, ChatMessage[]> = {};
  const caMessages: Record<string, ChatMessage[]> = {};

  allMessages.forEach((msg) => {
    if (!clientMessages[msg.requestId]) clientMessages[msg.requestId] = [];
    if (!caMessages[msg.requestId]) caMessages[msg.requestId] = [];

    // Rule 1: Messages between Client and Admin go to Client Box
    // (Client ne bheja) OR (Admin ne Client ko bheja - Logic: Admin msg but NOT forwarded from Client)
    if (msg.senderRole === "client") {
      clientMessages[msg.requestId].push(msg);
    }
    // If Admin sent the message, route it to the intended thread only.
    // We decide based on `intendedFor` field which is set when admin sends messages.
    // This prevents admin msgs from appearing in both boxes.
    else if (msg.senderRole === "admin") {
      // Prefer explicit routing via `intendedFor` when present
      const intendedFor = (msg as any).intendedFor;
      if (intendedFor === "client") {
        clientMessages[msg.requestId].push(msg);
      } else if (intendedFor === "ca") {
        caMessages[msg.requestId].push(msg);
      } else {
        // Fallback to legacy content-prefix detection when intendedFor isn't available
        // (for old messages that might not have intendedFor)
        const text = (msg.content || "").toString();
        if (text.startsWith("From Expert:")) {
          clientMessages[msg.requestId].push(msg);
        } else if (text.startsWith("Client Request:")) {
          caMessages[msg.requestId].push(msg);
        } else if (msg.isForwarded) {
          // Forwarded messages without intendedFor default to client (legacy behavior)
          clientMessages[msg.requestId].push(msg);
        }
        // Note: If intendedFor is missing and no prefix matches, the message won't appear
        // in either box. This is intentional to prevent misrouting.
      }
    }
    // Rule 2: Messages between CA and Admin go to CA Box
    else if (msg.senderRole === "ca") {
      caMessages[msg.requestId].push(msg);
    }
  });

  const value = {
    currentUser,
    isLoading,
    requests,
    users,
    logs,
    login,
    logout,
    registerUser,
    createRequest,
    caAcceptRequest,
    adminApproveRequest,
    getSearchingRequests: () =>
      requests.filter((r) => r.status === "searching"),
    getPendingApprovalRequests: () =>
      requests.filter((r) => r.status === "pending_approval"),
    getActiveRequests: () => requests.filter((r) => r.status === "active"),
    clientMessages,
    caMessages,
    addClientMessage,
    addCAMessage,
    forwardToClient,
    forwardToCA, // <--- Add this
    addAdmin,
  };

  return (
    <MockBackendContext.Provider value={value}>
      {children}
    </MockBackendContext.Provider>
  );
};

export const useMockBackend = () => {
  const context = useContext(MockBackendContext);
  if (context === undefined)
    throw new Error("useMockBackend must be used within a Provider");
  return context;
};
