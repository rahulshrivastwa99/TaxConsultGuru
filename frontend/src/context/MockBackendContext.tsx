import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { toast } from 'sonner';

// Types
export type UserRole = 'client' | 'ca' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isOnline: boolean;
  createdAt: Date;
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
  status: 'searching' | 'pending_approval' | 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  acceptedAt?: Date;
  approvedAt?: Date;
}

export interface ChatMessage {
  id: string;
  requestId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  timestamp: Date;
  // For admin forwarding
  forwardedFrom?: {
    originalSenderId: string;
    originalSenderName: string;
    originalSenderRole: UserRole;
  };
}

export interface ActivityLog {
  id: string;
  type: 'request' | 'accept' | 'approve' | 'forward' | 'login' | 'logout' | 'chat' | 'admin_added';
  message: string;
  timestamp: Date;
  userId?: string;
  userName?: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
  estimatedTime: string;
  defaultBudget: number;
}

// Services catalog
export const SERVICES: Service[] = [
  { id: 'gst-filing', name: 'GST Filing', description: 'Monthly/Quarterly GST return filing', icon: 'FileText', estimatedTime: '2-3 days', defaultBudget: 2500 },
  { id: 'itr-return', name: 'Income Tax Return', description: 'ITR filing for individuals and businesses', icon: 'Calculator', estimatedTime: '3-5 days', defaultBudget: 3500 },
  { id: 'company-incorporation', name: 'Company Incorporation', description: 'Private Ltd, LLP registration', icon: 'Building2', estimatedTime: '7-10 days', defaultBudget: 15000 },
  { id: 'tds-return', name: 'TDS Return', description: 'Quarterly TDS return filing', icon: 'Receipt', estimatedTime: '1-2 days', defaultBudget: 1500 },
  { id: 'audit', name: 'Statutory Audit', description: 'Complete statutory audit services', icon: 'ClipboardCheck', estimatedTime: '2-4 weeks', defaultBudget: 25000 },
  { id: 'bookkeeping', name: 'Bookkeeping', description: 'Monthly accounting services', icon: 'BookOpen', estimatedTime: 'Ongoing', defaultBudget: 5000 },
];

// Initial mock data
const INITIAL_USERS: User[] = [
  // Pre-existing admin (master@tcg.com)
  { id: 'admin-1', name: 'Master Admin', email: 'master@tcg.com', password: 'admin123', role: 'admin', isOnline: true, createdAt: new Date() },
  // Demo client
  { id: 'client-demo', name: 'Priya Sharma', email: 'priya@example.com', password: 'demo', role: 'client', isOnline: false, createdAt: new Date() },
  // Demo CA
  { id: 'ca-demo', name: 'CA Vikram Singh', email: 'vikram@example.com', password: 'demo', role: 'ca', isOnline: false, createdAt: new Date() },
];

interface MockBackendContextType {
  // Users
  users: User[];
  currentUser: User | null;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  addAdmin: (name: string, email: string, password: string) => void;
  registerUser: (name: string, email: string, password: string, role: UserRole) => Promise<User | null>;
  setUserOnline: (userId: string, online: boolean) => void;

  // Requests
  requests: ServiceRequest[];
  createRequest: (clientId: string, clientName: string, serviceType: string, serviceName: string, description: string, budget: number) => ServiceRequest;
  caAcceptRequest: (requestId: string, caId: string, caName: string) => void;
  adminApproveRequest: (requestId: string) => void;
  getRequestById: (requestId: string) => ServiceRequest | undefined;
  getSearchingRequests: () => ServiceRequest[];
  getPendingApprovalRequests: () => ServiceRequest[];
  getActiveRequests: () => ServiceRequest[];

  // Messages (Double-blind chat)
  clientMessages: Record<string, ChatMessage[]>; // Client <-> Admin (masked as "TCG Expert Team")
  caMessages: Record<string, ChatMessage[]>; // CA <-> Admin (as "TCG Admin Desk")
  addClientMessage: (requestId: string, senderId: string, senderName: string, senderRole: UserRole, content: string) => void;
  addCAMessage: (requestId: string, senderId: string, senderName: string, senderRole: UserRole, content: string) => void;
  forwardToClient: (requestId: string, messageId: string) => void;

  // Activity logs
  logs: ActivityLog[];
  addLog: (type: ActivityLog['type'], message: string, userId?: string, userName?: string) => void;
}

const MockBackendContext = createContext<MockBackendContextType | undefined>(undefined);

export const MockBackendProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [clientMessages, setClientMessages] = useState<Record<string, ChatMessage[]>>({});
  const [caMessages, setCAMessages] = useState<Record<string, ChatMessage[]>>({});
  const [logs, setLogs] = useState<ActivityLog[]>([
    { id: 'log-init', type: 'login', message: 'System initialized', timestamp: new Date() }
  ]);

  // Add log helper
  const addLog = useCallback((type: ActivityLog['type'], message: string, userId?: string, userName?: string) => {
    const log: ActivityLog = {
      id: `log-${Date.now()}`,
      type,
      message,
      timestamp: new Date(),
      userId,
      userName,
    };
    setLogs(prev => [log, ...prev]);
  }, []);

  // Login
  const login = useCallback(async (email: string, password: string): Promise<User | null> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (user) {
      const updatedUser = { ...user, isOnline: true };
      setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
      setCurrentUser(updatedUser);
      addLog('login', `${user.name} logged in`, user.id, user.name);
      return updatedUser;
    }
    return null;
  }, [users, addLog]);

  // Logout
  const logout = useCallback(() => {
    if (currentUser) {
      setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, isOnline: false } : u));
      addLog('logout', `${currentUser.name} logged out`, currentUser.id, currentUser.name);
    }
    setCurrentUser(null);
  }, [currentUser, addLog]);

  // Register user
  const registerUser = useCallback(async (name: string, email: string, password: string, role: UserRole): Promise<User | null> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) return null;
    
    const newUser: User = {
      id: `${role}-${Date.now()}`,
      name,
      email,
      password,
      role,
      isOnline: true,
      createdAt: new Date(),
    };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    addLog('login', `${name} registered as ${role}`, newUser.id, name);
    return newUser;
  }, [users, addLog]);

  // Add admin (only from admin panel)
  const addAdmin = useCallback((name: string, email: string, password: string) => {
    const newAdmin: User = {
      id: `admin-${Date.now()}`,
      name,
      email,
      password,
      role: 'admin',
      isOnline: false,
      createdAt: new Date(),
    };
    setUsers(prev => [...prev, newAdmin]);
    addLog('admin_added', `New admin ${name} was created`, currentUser?.id, currentUser?.name);
    toast.success(`Admin ${name} created successfully`);
  }, [currentUser, addLog]);

  // Set user online status
  const setUserOnline = useCallback((userId: string, online: boolean) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isOnline: online } : u));
  }, []);

  // Create request
  const createRequest = useCallback((
    clientId: string,
    clientName: string,
    serviceType: string,
    serviceName: string,
    description: string,
    budget: number
  ): ServiceRequest => {
    const request: ServiceRequest = {
      id: `req-${Date.now()}`,
      clientId,
      clientName,
      serviceType,
      serviceName,
      description,
      budget,
      status: 'searching',
      createdAt: new Date(),
    };
    setRequests(prev => [...prev, request]);
    addLog('request', `${clientName} requested ${serviceName} - ₹${budget}`, clientId, clientName);
    return request;
  }, [addLog]);

  // CA accepts request (goes to pending_approval)
  const caAcceptRequest = useCallback((requestId: string, caId: string, caName: string) => {
    setRequests(prev => prev.map(r => 
      r.id === requestId 
        ? { ...r, caId, caName, status: 'pending_approval' as const, acceptedAt: new Date() }
        : r
    ));
    addLog('accept', `${caName} accepted request #${requestId.slice(-6).toUpperCase()} - Pending Admin Approval`, caId, caName);
  }, [addLog]);

  // Admin approves request (goes to active)
  const adminApproveRequest = useCallback((requestId: string) => {
    setRequests(prev => prev.map(r => 
      r.id === requestId 
        ? { ...r, status: 'active' as const, approvedAt: new Date() }
        : r
    ));
    const request = requests.find(r => r.id === requestId);
    if (request) {
      addLog('approve', `Admin approved Job #${requestId.slice(-6).toUpperCase()} - ${request.serviceName}`, currentUser?.id, currentUser?.name);
    }
  }, [requests, currentUser, addLog]);

  // Get request by ID
  const getRequestById = useCallback((requestId: string) => {
    return requests.find(r => r.id === requestId);
  }, [requests]);

  // Get searching requests (for CA popup)
  const getSearchingRequests = useCallback(() => {
    return requests.filter(r => r.status === 'searching');
  }, [requests]);

  // Get pending approval requests (for admin)
  const getPendingApprovalRequests = useCallback(() => {
    return requests.filter(r => r.status === 'pending_approval');
  }, [requests]);

  // Get active requests
  const getActiveRequests = useCallback(() => {
    return requests.filter(r => r.status === 'active');
  }, [requests]);

  // Add client message (Client <-> Admin masked as "TCG Expert Team")
  const addClientMessage = useCallback((
    requestId: string,
    senderId: string,
    senderName: string,
    senderRole: UserRole,
    content: string
  ) => {
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      requestId,
      senderId,
      senderName,
      senderRole,
      content,
      timestamp: new Date(),
    };
    setClientMessages(prev => ({
      ...prev,
      [requestId]: [...(prev[requestId] || []), message],
    }));
    if (senderRole === 'client') {
      addLog('chat', `Client sent message in Job #${requestId.slice(-6).toUpperCase()}`, senderId, senderName);
    }
  }, [addLog]);

  // Add CA message (CA <-> Admin Desk)
  const addCAMessage = useCallback((
    requestId: string,
    senderId: string,
    senderName: string,
    senderRole: UserRole,
    content: string
  ) => {
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      requestId,
      senderId,
      senderName,
      senderRole,
      content,
      timestamp: new Date(),
    };
    setCAMessages(prev => ({
      ...prev,
      [requestId]: [...(prev[requestId] || []), message],
    }));
    if (senderRole === 'ca') {
      addLog('chat', `CA sent message in Job #${requestId.slice(-6).toUpperCase()}`, senderId, senderName);
    }
  }, [addLog]);

  // Forward CA message to Client (masked as "TCG Expert Team")
  const forwardToClient = useCallback((requestId: string, messageId: string) => {
    const caMessageList = caMessages[requestId] || [];
    const originalMessage = caMessageList.find(m => m.id === messageId);
    
    if (originalMessage) {
      const forwardedMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        requestId,
        senderId: 'system-expert',
        senderName: 'TCG Expert Team',
        senderRole: 'admin',
        content: originalMessage.content,
        timestamp: new Date(),
        forwardedFrom: {
          originalSenderId: originalMessage.senderId,
          originalSenderName: originalMessage.senderName,
          originalSenderRole: originalMessage.senderRole,
        },
      };
      setClientMessages(prev => ({
        ...prev,
        [requestId]: [...(prev[requestId] || []), forwardedMessage],
      }));
      addLog('forward', `Admin forwarded message to Client in Job #${requestId.slice(-6).toUpperCase()}`, currentUser?.id, currentUser?.name);
      toast.success('Message forwarded to client');
    }
  }, [caMessages, currentUser, addLog]);

  const value: MockBackendContextType = {
    users,
    currentUser,
    login,
    logout,
    addAdmin,
    registerUser,
    setUserOnline,
    requests,
    createRequest,
    caAcceptRequest,
    adminApproveRequest,
    getRequestById,
    getSearchingRequests,
    getPendingApprovalRequests,
    getActiveRequests,
    clientMessages,
    caMessages,
    addClientMessage,
    addCAMessage,
    forwardToClient,
    logs,
    addLog,
  };

  return (
    <MockBackendContext.Provider value={value}>
      {children}
    </MockBackendContext.Provider>
  );
};

export const useMockBackend = () => {
  const context = useContext(MockBackendContext);
  if (context === undefined) {
    throw new Error('useMockBackend must be used within a MockBackendProvider');
  }
  return context;
};
