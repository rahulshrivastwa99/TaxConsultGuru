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
  isOnline?: boolean;
  isVerified?: boolean;
  experience?: number;
  certificationDetails?: string;
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
  expectedBudget?: number;
  status: "searching" | "pending_approval" | "live" | "active" | "completed" | "cancelled" | "awaiting_payment" | "ready_for_payout" | "payout_completed";
  createdAt: Date;
  updatedAt: Date;
  hiredCA?: string;
  isWorkspaceUnlocked?: boolean;
  isArchived?: boolean;
}

export interface Bid {
  id: string;
  requestId: string;
  caId: any; // User object if populated, string otherwise
  price: number;
  proposalText: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  requestId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  timestamp: Date;
  isForwarded?: boolean;
  intendedFor?: "client" | "ca";
  fileUrl?: string | null;
  fileName?: string | null;
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
  login: (email: string, password: string, role: UserRole) => Promise<User | null>;
  logout: () => void;
  registerUser: (
    name: string,
    email: string,
    password: string,
    role: UserRole,
    experience?: number,
    certificationDetails?: string,
  ) => Promise<User | null>;
  createRequest: (
    clientId: string,
    clientName: string,
    serviceType: string,
    serviceName: string,
    description: string,
    budget: number,
    expectedBudget?: number,
  ) => Promise<void>;
  caAcceptRequest: (
    requestId: string,
    caId: string,
    caName: string,
  ) => Promise<void>;
  pendingCAs: User[];
  pendingJobs: ServiceRequest[];
  fetchAdminData: () => Promise<void>;
  verifyCA: (id: string) => Promise<void>;
  approveJob: (id: string) => Promise<void>;
  rejectJob: (id: string) => Promise<void>;
  getLiveJobs: () => ServiceRequest[];
  completeRequest: (id: string) => Promise<void>;
  approveWork: (id: string) => Promise<void>;
  rejectWork: (id: string) => Promise<void>;
  forceApprove: (id: string) => Promise<void>;
  archiveProject: (id: string) => Promise<void>;
  placeBid: (bidData: {
    requestId: string;
    price: number;
    proposalText: string;
  }) => Promise<void>;
  fetchBidsForRequest: (requestId: string) => Promise<Bid[]>;
  hireCA: (requestId: string, bidId: string) => Promise<void>;
  unlockWorkspace: (id: string) => Promise<void>;
  clientMessages: Record<string, ChatMessage[]>;
  caMessages: Record<string, ChatMessage[]>;
  allMessages: ChatMessage[];
  addClientMessage: (
    requestId: string,
    senderId: string,
    senderName: string,
    senderRole: UserRole,
    text: string,
  ) => Promise<void>;
  addCAMessage: (
    requestId: string,
    senderId: string,
    senderName: string,
    senderRole: UserRole,
    text: string,
  ) => Promise<void>;
  sendMessageWrapper: (
    requestId: string,
    text: string,
    senderRole: UserRole,
    isForwarded?: boolean,
    intendedFor?: "client" | "ca",
    fileUrl?: string | null,
    fileName?: string | null,
  ) => Promise<void>;
  forwardToClient: (requestId: string, messageId: string) => Promise<void>;
  forwardToCA: (requestId: string, messageId: string) => Promise<void>; 
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
  const [pendingCAs, setPendingCAs] = useState<User[]>([]);
  const [pendingJobs, setPendingJobs] = useState<ServiceRequest[]>([]);

  // Format Helpers
  const formatRequest = (r: any): ServiceRequest => ({
    ...r,
    id: r.id || r._id,
    createdAt: new Date(r.createdAt),
    updatedAt: new Date(r.updatedAt || r.createdAt),
  });

  const formatMessage = (m: any): ChatMessage => ({
    ...m,
    id: m.id || m._id,
    text: m.text || m.content || "",
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

    socket.on("request_alert", (updatedRequest: any) => {
      const formatted = formatRequest(updatedRequest);
      setRequests((prev) => {
        const index = prev.findIndex((r) => r.id === formatted.id);
        if (index !== -1) {
          // Update existing
          const newRequests = [...prev];
          newRequests[index] = formatted;
          return newRequests;
        }
        // Add new
        return [formatted, ...prev];
      });

      // Notify if it's a new 'live' job for CAs or a assigned job for Client
      if (
        (formatted.status as string) === "live" &&
        currentUser?.role === "ca"
      ) {
        toast.info(`New Job Available: ${formatted.serviceName}`);
      }
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
      if (formattedReqs.length > 0 && currentUser?.token) {
        const msgPromises = formattedReqs.map((r: any) =>
          api.fetchMessagesAPI(r.id, currentUser.token!).catch(() => []),
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

  const fetchAdminData = async () => {
    if (!currentUser?.token) return;
    try {
      const [pCAs, pJobs] = await Promise.all([
        api.fetchPendingCAs(currentUser.token),
        api.fetchPendingJobs(currentUser.token),
      ]);
      setPendingCAs(pCAs);
      setPendingJobs(pJobs);
    } catch (e) {
      console.error("Failed to fetch admin data", e);
    }
  };

  const verifyCA = async (id: string) => {
    if (!currentUser?.token) return;
    try {
      await api.verifyCA(id, currentUser.token);
      toast.success("CA Verified!");
      await fetchAdminData();
    } catch (e) {
      toast.error("Failed to verify CA");
    }
  };

  const approveJob = async (id: string) => {
    if (!currentUser?.token) return;
    try {
      const { request } = await api.approveJob(id, currentUser.token);
      toast.success("Job Approved!");
      socket.emit("new_request", request); // Alert others
      await fetchAdminData();
      await refreshData();
    } catch (e) {
      toast.error("Failed to approve job");
    }
  };

  // --- ACTIONS (Same logic as before, just calling API now) ---
  const rejectJob = async (id: string) => {
    if (!currentUser?.token) return;
    try {
      await api.rejectJob(id, currentUser.token);
      toast.success("Job Rejected!");
      await fetchAdminData();
      await refreshData();
    } catch (e) {
      toast.error("Failed to reject job");
    }
  };

  const login = async (email: string, password: string, role: UserRole) => {
    try {
      const user = await api.loginUser({ email, password, role });
      setCurrentUser(user);
      localStorage.setItem("userInfo", JSON.stringify(user));
      await refreshData();
      return user;
    } catch (error: any) {
      toast.error(error.message);
      return null;
    }
  };

  const placeBid = async (bidData: {
    requestId: string;
    price: number;
    proposalText: string;
  }) => {
    if (!currentUser?.token) return;
    try {
      await api.placeBid(bidData.requestId, bidData, currentUser.token);
      toast.success("Bid placed successfully!");
    } catch (e: any) {
      toast.error(e.message || "Failed to place bid");
    }
  };

  const fetchBidsForRequest = async (requestId: string) => {
    if (!currentUser?.token) return [];
    try {
      return await api.fetchBidsForRequest(requestId, currentUser.token);
    } catch (e) {
      console.error("Failed to fetch bids", e);
      return [];
    }
  };

  const hireCA = async (requestId: string, bidId: string) => {
    if (!currentUser?.token) return;
    try {
      await api.hireCAAPI(bidId, currentUser.token);
      toast.success("CA Hired! Status moved to Awaiting Payment.");
      await refreshData();
    } catch (e: any) {
      toast.error(e.message || "Failed to hire CA");
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
    experience?: number,
    certificationDetails?: string,
  ) => {
    try {
      const user = await api.registerUser({
        name,
        email,
        password,
        role,
        experience,
        certificationDetails,
      });
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
    expectedBudget?: number,
  ) => {
    try {
      const newReq = await api.createRequest({
        clientId,
        clientName,
        serviceType,
        serviceName,
        description,
        budget,
        expectedBudget,
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
      const updated = await api.updateRequestStatus(requestId, "accept", {
        caId,
        caName,
      });
      socket.emit("new_request", updated); // Alert Admin
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


  const sendMessageWrapper = async (
    requestId: string,
    text: string,
    senderRole: UserRole,
    isForwarded = false,
    intendedFor?: "client" | "ca",
    fileUrl: string | null = null,
    fileName: string | null = null,
  ) => {
    if (!currentUser || !currentUser.token) return;
    const msgData: any = {
      text,
      isForwarded,
    };
    if (fileUrl) msgData.fileUrl = fileUrl;
    if (fileName) msgData.fileName = fileName;
    if (intendedFor) msgData.intendedFor = intendedFor;
    
    try {
      console.debug("[sendMessageWrapper] sending:", msgData);
      const savedMsg = await api.sendMessageAPI(requestId, msgData, currentUser.token);
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
    text: string,
  ) => {
    // Use the provided role (e.g. 'admin' when Admin sends from Client box)
    // Mark intendedFor as 'client' so admin messages from Client box route correctly
    await sendMessageWrapper(requestId, text, role, false, "client");
  };

  const addCAMessage = async (
    requestId: string,
    _sid: string,
    _sname: string,
    role: UserRole,
    text: string,
  ) => {
    // Use the provided role (e.g. 'admin' when Admin sends from CA box)
    // Mark intendedFor as 'ca' so admin messages from CA box route correctly
    await sendMessageWrapper(requestId, text, role, false, "ca");
  };

  // 1. FORWARD TO CLIENT (Existing - Refined)
  const forwardToClient = async (requestId: string, messageId: string) => {
    const original = allMessages.find((m) => m.id === messageId);
    if (!original) return;

    // Admin sends this content to the Client thread
    // isForwarded flag helps us style it if needed
    await sendMessageWrapper(
      requestId,
      `From Expert: ${original.text}`,
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
      `From Client: ${original.text}`,
      "admin",
      true,
      "ca",
    );
    toast.success("Forwarded to CA");
  };

  // --- FIX: ADD ADMIN FUNCTIONALITY ---
  const addAdmin = async (name: string, email: string, password: string) => {
    try {
      // Directly call API to register a new admin without logging out the current user
      await api.registerUser({ name, email, password, role: "admin" });
      toast.success("New Admin added successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to add admin");
    }
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
        const chatText = (msg.text || "").toString();
        if (chatText.startsWith("From Expert:")) {
          clientMessages[msg.requestId].push(msg);
        } else if (chatText.startsWith("Client Request:")) {
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
    clientMessages,
    caMessages,
    allMessages,
    addClientMessage,
    addCAMessage,
    sendMessageWrapper,
    forwardToClient,
    forwardToCA,
    verifyCA,
    approveJob,
    rejectJob,
    placeBid,
    fetchBidsForRequest,
    hireCA,
    unlockWorkspace: async (id: string) => {
      try {
        const token = currentUser?.token;
        if (!token) throw new Error("No token found");
        await api.unlockWorkspaceAPI(id, token);
        toast.success("Workspace unlocked successfully!");
        await refreshData();
      } catch (error: any) {
        toast.error(error.message || "Failed to unlock workspace");
      }
    },
    fetchAdminData,
    pendingCAs,
    pendingJobs,
    addAdmin,
    getLiveJobs: () => requests.filter((r) => (r.status as string) === "live"),
    getActiveRequests: () => requests.filter((r) => r.status === "active" || (r.status as string) === "live" || r.status === "completed"),
    getPendingApprovalRequests: () => requests.filter((r) => r.status === "pending_approval"),
    completeRequest: async (id: string) => {
      try {
        const token = currentUser?.token;
        if (!token) throw new Error("No token found");
        await api.completeRequestAPI(id, token);
        toast.success("Work marked as completed!");
        await refreshData();
      } catch (error: any) {
        toast.error(error.message || "Failed to complete work");
      }
    },
    approveWork: async (id: string) => {
      try {
        const token = currentUser?.token;
        if (!token) throw new Error("No token found");
        await api.approveWorkAPI(id, token);
        toast.success("Work approved successfully!");
        await refreshData();
      } catch (error: any) {
        toast.error(error.message || "Failed to approve work");
      }
    },
    rejectWork: async (id: string) => {
      try {
        const token = currentUser?.token;
        if (!token) throw new Error("No token found");
        await api.rejectWorkAPI(id, token);
        toast.success("Changes requested. Project is active again.");
        await refreshData();
      } catch (error: any) {
        toast.error(error.message || "Failed to reject work");
      }
    },
    forceApprove: async (id: string) => {
      try {
        const token = currentUser?.token;
        if (!token) throw new Error("No token found");
        await api.forceApproveAPI(id, token);
        toast.success("Admin Intervention: Work force-approved!");
        await refreshData();
      } catch (error: any) {
        toast.error(error.message || "Failed to force approve");
      }
    },
    archiveProject: async (id: string) => {
      try {
        const token = currentUser?.token;
        if (!token) throw new Error("No token found");
        await api.archiveProjectAPI(id, token);
        toast.success("Project archived successfully!");
        await refreshData();
      } catch (error: any) {
        toast.error(error.message || "Failed to archive project");
      }
    },
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