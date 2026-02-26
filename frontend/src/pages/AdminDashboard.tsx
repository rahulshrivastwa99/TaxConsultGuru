import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  LogOut,
  Users,
  Briefcase,
  Terminal,
  MessageCircle,
  Send,
  UserPlus,
  CheckCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Receipt,
  Headphones,
  BookOpen,
  ShieldCheck,
  AlertTriangle,
  CreditCard,
  Wallet,
  Eye,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useMockBackend,
  ActivityLog,
  ServiceRequest,
} from "@/context/MockBackendContext";
import { toast } from "sonner";

// --- MOVED OUTSIDE TO FIX THE "BLINKING" AND CLICK ISSUES ---
const SidebarItem = ({
  id,
  label,
  icon: Icon,
  badge = 0,
  activeTab,
  setActiveTab,
}: {
  id: any;
  label: string;
  icon: React.ElementType;
  badge?: number;
  activeTab: string;
  setActiveTab: (val: any) => void;
}) => {
  const isActive = activeTab === id;
  return (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all mb-1 ${
        isActive
          ? "bg-indigo-600 text-white shadow-md shadow-indigo-200/50 font-semibold"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium"
      }`}
    >
      <div className="flex items-center gap-3 text-[15px]">
        <Icon
          className={`w-[18px] h-[18px] ${
            isActive ? "text-white" : "text-slate-500"
          }`}
        />
        {label}
      </div>
      {badge > 0 && (
        <Badge
          className={`h-5 min-w-[20px] px-1.5 flex items-center justify-center border-0 ${
            isActive
              ? "bg-indigo-500 text-white hover:bg-indigo-500"
              : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
          }`}
        >
          {badge}
        </Badge>
      )}
    </button>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    isLoading,
    logout,
    users,
    requests,
    logs,
    clientMessages,
    caMessages,
    addClientMessage,
    addCAMessage,
    forwardToClient,
    forwardToCA,
    addAdmin,
    pendingCAs,
    pendingJobs,
    fetchAdminData,
    verifyCA,
    approveJob,
    rejectJob,
    unlockWorkspace,
    archiveProject,
  } = useMockBackend();

  const [activeTab, setActiveTab] = useState<
    | "bridge"
    | "team"
    | "feed"
    | "verification"
    | "moderation"
    | "payments"
    | "overwatch"
    | "payouts"
    | "history"
  >("bridge");

  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(
    null,
  );
  const [clientMessageInput, setClientMessageInput] = useState("");
  const [caMessageInput, setCAMessageInput] = useState("");

  // Add admin form state
  const [addAdminOpen, setAddAdminOpen] = useState(false);
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");

  useEffect(() => {
    if (!isLoading) {
      if (!currentUser || currentUser.role !== "admin") {
        navigate("/");
      } else {
        fetchAdminData();
      }
    }
  }, [currentUser, isLoading, navigate, fetchAdminData]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!currentUser || currentUser.role !== "admin") return null;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  const getPendingApprovalRequests = () =>
    requests.filter((r) => r.status === "pending_approval");

  const getActiveRequests = () =>
    requests.filter(
      (r) =>
        r.status === "active" ||
        r.status === "live" ||
        r.status === "completed",
    );

  const getPendingPaymentRequests = () =>
    requests.filter((r) => r.status === "awaiting_payment");

  const pendingRequests = getPendingApprovalRequests();
  const activeRequests = getActiveRequests();
  const paymentAlerts = getPendingPaymentRequests();
  const payoutRequests = requests.filter(
    (r) => r.status === "ready_for_payout",
  );
  const archivedRequests = requests.filter((r) => r.isArchived === true);
  const allActiveAndPending = [
    ...pendingRequests,
    ...activeRequests,
    ...paymentAlerts,
  ];

  const onlineClients = users.filter((u) => u.role === "client" && u.isOnline);
  const onlineCAs = users.filter((u) => u.role === "ca" && u.isOnline);
  const adminUsers = users.filter((u) => u.role === "admin");

  const getLogColor = (type: ActivityLog["type"]) => {
    switch (type) {
      case "request":
        return "text-amber-400";
      case "accept":
        return "text-blue-400";
      case "approve":
        return "text-emerald-400";
      case "forward":
        return "text-purple-400";
      case "admin_added":
        return "text-pink-400";
      default:
        return "text-slate-400";
    }
  };

  const highlightSpam = (text: string) => {
    if (!text) return "";
    const spamRegex = /(\d{10}|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
    const parts = text.split(spamRegex);
    return (
      <>
        {parts.map((part, i) =>
          part && spamRegex.test(part) ? (
            <span
              key={i}
              className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold border border-red-200"
            >
              {part}
            </span>
          ) : (
            part
          ),
        )}
      </>
    );
  };

  const hasSpam = (text: string) => {
    if (!text) return false;
    const spamRegex = /(\d{10}|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
    return spamRegex.test(text);
  };

  const sendToClient = () => {
    if (!clientMessageInput.trim() || !selectedRequest) return;
    addClientMessage(
      selectedRequest.id,
      currentUser.id,
      "TCG Expert Team",
      "admin",
      clientMessageInput,
    );
    setClientMessageInput("");
  };

  const sendToCA = () => {
    if (!caMessageInput.trim() || !selectedRequest) return;
    addCAMessage(
      selectedRequest.id,
      currentUser.id,
      "TCG Admin Desk",
      "admin",
      caMessageInput,
    );
    setCAMessageInput("");
  };

  const handleForwardToClient = (messageId: string) => {
    if (!selectedRequest) return;
    forwardToClient(selectedRequest.id, messageId);
  };

  const handleForwardToCA = (messageId: string) => {
    if (!selectedRequest) return;
    forwardToCA(selectedRequest.id, messageId);
  };

  const handleApprove = (requestId: string) => {
    approveJob(requestId);
    toast.success("Request approved! Job is now live for CAs.");
  };

  const handleAddAdmin = () => {
    if (!newAdminName || !newAdminEmail || !newAdminPassword) {
      toast.error("Please fill all fields");
      return;
    }
    addAdmin(newAdminName, newAdminEmail, newAdminPassword);
    setAddAdminOpen(false);
    setNewAdminName("");
    setNewAdminEmail("");
    setNewAdminPassword("");
  };

  const clientMsgs = selectedRequest
    ? clientMessages[selectedRequest.id] || []
    : [];
  const caMsgs = selectedRequest ? caMessages[selectedRequest.id] || [] : [];

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* --- SIDEBAR --- */}
      <aside className="w-[280px] bg-white border-r border-slate-200 flex flex-col h-full z-20 shrink-0">
        {/* Logo & Header Section */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-indigo-600 flex items-center justify-center shadow-sm">
              <Shield className="w-[22px] h-[22px] text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl tracking-tight text-slate-900 leading-tight">
                <span className="font-extrabold">Command</span>
                <span className="font-medium text-slate-700">Center</span>
              </h1>
              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mt-0.5">
                God Mode Active
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links Area */}
        <ScrollArea className="flex-1 px-4">
          <div className="py-2">
            {/* OPERATIONS SECTION */}
            <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 mt-2">
              Operations
            </p>
            <SidebarItem
              id="bridge"
              label="Bridge Chat"
              icon={MessageCircle}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
            <SidebarItem
              id="feed"
              label="Live Feed"
              icon={Activity}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
            <SidebarItem
              id="overwatch"
              label="Overwatch"
              icon={Eye}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />

            {/* REVIEW & APPROVALS SECTION */}
            <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 mt-6">
              Review & Approvals
            </p>
            <SidebarItem
              id="verification"
              label="CA Verification"
              icon={ShieldCheck}
              badge={pendingCAs.length}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
            <SidebarItem
              id="moderation"
              label="Job Moderation"
              icon={AlertTriangle}
              badge={pendingJobs.length}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />

            {/* FINANCIALS SECTION */}
            <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 mt-6">
              Financials
            </p>
            <SidebarItem
              id="payments"
              label="Pending Payments"
              icon={CreditCard}
              badge={paymentAlerts.length}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
            <SidebarItem
              id="payouts"
              label="Payouts"
              icon={Wallet}
              badge={payoutRequests.length}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />

            {/* MANAGEMENT SECTION */}
            <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 mt-6">
              Management
            </p>
            <SidebarItem
              id="team"
              label="Admin Team"
              icon={Users}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
            <SidebarItem
              id="history"
              label="Archives"
              icon={BookOpen}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </div>
        </ScrollArea>

        {/* Footer / Logout Section */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <Button
            variant="outline"
            className="w-full justify-start text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 h-11"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-3 text-slate-400" />
            Sign Out Securely
          </Button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Subtle Background Blur Decor */}
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-100/40 rounded-full blur-[100px] pointer-events-none z-0" />
        <div className="absolute bottom-[-10%] left-[20%] w-[30%] h-[30%] bg-cyan-100/40 rounded-full blur-[100px] pointer-events-none z-0" />

        <ScrollArea className="flex-1 z-10">
          <div className="p-8">
            {/* Top Stats Grid */}
            <div className="grid gap-6 md:grid-cols-4 mb-8">
              <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-1">
                        Online Clients
                      </p>
                      <p className="text-3xl font-extrabold text-slate-900">
                        {onlineClients.length}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-1">
                        Online CAs
                      </p>
                      <p className="text-3xl font-extrabold text-slate-900">
                        {onlineCAs.length}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-emerald-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-1">
                        Pending Moderation
                      </p>
                      <p className="text-3xl font-extrabold text-amber-600">
                        {pendingJobs.length}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-1">
                        Active Jobs
                      </p>
                      <p className="text-3xl font-extrabold text-indigo-600">
                        {activeRequests.length}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                      <Activity className="w-6 h-6 text-indigo-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* --- TAB CONTENTS --- */}

            {/* 1. BRIDGE CHAT */}
            {activeTab === "bridge" && (
              <div className="grid lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Job List Sidebar */}
                <Card className="bg-white border-slate-200 shadow-sm">
                  <CardHeader className="pb-3 border-b border-slate-100">
                    <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                      Active Jobs
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 space-y-2">
                    {allActiveAndPending.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-4">
                        No active jobs
                      </p>
                    ) : (
                      allActiveAndPending.map((req) => (
                        <div
                          key={req.id}
                          onClick={() => setSelectedRequest(req)}
                          className={`p-3 rounded-xl cursor-pointer transition-all border ${
                            selectedRequest?.id === req.id
                              ? "bg-indigo-50 border-indigo-200 shadow-sm"
                              : "bg-white border-transparent hover:border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-sm text-slate-800">
                              {req.serviceName}
                            </span>
                            <Badge
                              variant="secondary"
                              className={`text-[10px] px-1.5 ${
                                req.status === "pending_approval"
                                  ? "bg-amber-100 text-amber-700"
                                  : req.status === "completed"
                                    ? "bg-indigo-100 text-indigo-700"
                                    : "bg-emerald-100 text-emerald-700"
                              }`}
                            >
                              {req.status === "pending_approval"
                                ? "Pending"
                                : req.status === "completed"
                                  ? "Awaiting Client"
                                  : "Active"}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500 font-medium">
                            Client: {req.clientName}
                          </p>
                          {req.caName && (
                            <p className="text-xs text-slate-500 mt-0.5">
                              Expert: {req.caName}
                            </p>
                          )}
                          {req.status === "pending_approval" && (
                            <Button
                              size="sm"
                              className="w-full mt-3 h-8 bg-indigo-600 hover:bg-indigo-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApprove(req.id);
                              }}
                            >
                              <CheckCircle className="w-3 h-3 mr-1" /> Approve
                            </Button>
                          )}
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                {/* Split Chat View */}
                <div className="lg:col-span-3">
                  {selectedRequest ? (
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* --- LEFT: Client Chat --- */}
                      <Card className="bg-white border-slate-200 shadow-sm h-[600px] flex flex-col overflow-hidden">
                        <CardHeader className="border-b border-slate-100 py-3 bg-blue-50/50 flex flex-row items-center justify-between">
                          <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-800">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200">
                              <Users className="w-4 h-4 text-blue-600" />
                            </div>
                            Client: {selectedRequest.clientName}
                          </CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                            onClick={() =>
                              navigate(`/workspace/${selectedRequest.id}`)
                            }
                          >
                            <Shield className="w-3 h-3 mr-1" />
                            View Workspace
                          </Button>
                        </CardHeader>
                        <ScrollArea className="flex-1 p-4 bg-slate-50/50">
                          <div className="space-y-4">
                            {clientMsgs.map((msg) => {
                              const isAdmin = msg.senderRole === "admin";
                              return (
                                <div
                                  key={msg.id}
                                  className={`flex ${
                                    isAdmin ? "justify-end" : "justify-start"
                                  }`}
                                >
                                  <div
                                    className={`flex flex-col ${
                                      isAdmin ? "items-end" : "items-start"
                                    } max-w-[85%]`}
                                  >
                                    <div
                                      className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                                        isAdmin
                                          ? "bg-indigo-600 text-white rounded-br-none"
                                          : "bg-white border border-slate-200 text-slate-800 rounded-bl-none"
                                      }`}
                                    >
                                      <p>{msg.text}</p>
                                      <p
                                        className={`text-[10px] mt-1 text-right ${
                                          isAdmin
                                            ? "text-indigo-200"
                                            : "text-slate-400"
                                        }`}
                                      >
                                        {msg.timestamp.toLocaleTimeString([], {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                        {msg.isForwarded && " • Fwd"}
                                      </p>
                                    </div>
                                    {!isAdmin && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-[10px] h-6 px-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 mt-1"
                                        onClick={() =>
                                          handleForwardToCA(msg.id)
                                        }
                                      >
                                        Forward to CA
                                        <ArrowRight className="w-3 h-3 ml-1" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </ScrollArea>
                        <div className="border-t border-slate-100 p-3 bg-white flex gap-2">
                          <Input
                            placeholder="Reply as TCG Expert Team..."
                            value={clientMessageInput}
                            onChange={(e) =>
                              setClientMessageInput(e.target.value)
                            }
                            onKeyDown={(e) =>
                              e.key === "Enter" && sendToClient()
                            }
                            className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-500"
                          />
                          <Button
                            size="icon"
                            onClick={sendToClient}
                            className="bg-indigo-600 hover:bg-indigo-700 shrink-0"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>

                      {/* --- RIGHT: CA Chat --- */}
                      <Card className="bg-white border-slate-200 shadow-sm h-[600px] flex flex-col overflow-hidden">
                        <CardHeader className="border-b border-slate-100 py-3 bg-emerald-50/50">
                          <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-800">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200">
                              <Briefcase className="w-4 h-4 text-emerald-600" />
                            </div>
                            Expert: {selectedRequest.caName || "Not assigned"}
                          </CardTitle>
                        </CardHeader>
                        <ScrollArea className="flex-1 p-4 bg-slate-50/50">
                          <div className="space-y-4">
                            {caMsgs.map((msg) => {
                              const isAdmin = msg.senderRole === "admin";
                              return (
                                <div
                                  key={msg.id}
                                  className={`flex ${
                                    isAdmin ? "justify-end" : "justify-start"
                                  }`}
                                >
                                  <div
                                    className={`flex flex-col ${
                                      isAdmin ? "items-end" : "items-start"
                                    } max-w-[85%]`}
                                  >
                                    <div
                                      className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                                        isAdmin
                                          ? "bg-slate-800 text-white rounded-br-none"
                                          : "bg-white border border-slate-200 text-slate-800 rounded-bl-none"
                                      }`}
                                    >
                                      <p>{msg.text}</p>
                                      <p
                                        className={`text-[10px] mt-1 text-right ${
                                          isAdmin
                                            ? "text-slate-400"
                                            : "text-slate-400"
                                        }`}
                                      >
                                        {msg.timestamp.toLocaleTimeString([], {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                        {msg.isForwarded && " • Fwd"}
                                      </p>
                                    </div>
                                    {!isAdmin && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-[10px] h-6 px-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 mt-1"
                                        onClick={() =>
                                          handleForwardToClient(msg.id)
                                        }
                                      >
                                        <ArrowLeft className="w-3 h-3 mr-1" />
                                        Forward to Client
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </ScrollArea>
                        <div className="border-t border-slate-100 p-3 bg-white flex gap-2">
                          <Input
                            placeholder="Message CA directly..."
                            value={caMessageInput}
                            onChange={(e) => setCAMessageInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendToCA()}
                            className="bg-slate-50 border-slate-200 focus-visible:ring-slate-800"
                          />
                          <Button
                            size="icon"
                            onClick={sendToCA}
                            className="bg-slate-800 hover:bg-slate-900 shrink-0"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    </div>
                  ) : (
                    <Card className="bg-white border-slate-200 shadow-sm h-[600px] flex items-center justify-center border-dashed">
                      <div className="text-center text-slate-400">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <MessageCircle className="w-10 h-10 text-slate-300" />
                        </div>
                        <p className="font-medium text-slate-500">
                          Select a job to view the bridge chat
                        </p>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {/* 2. LIVE FEED */}
            {activeTab === "feed" && (
              <Card className="bg-white border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CardHeader className="border-b border-slate-100 bg-slate-50 flex flex-row items-center gap-3">
                  <div className="p-2 bg-slate-200 rounded-lg">
                    <Terminal className="w-5 h-5 text-slate-700" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      Live Activity Feed
                    </CardTitle>
                    <CardDescription>
                      Real-time system operations log.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Terminal Look container */}
                  <div className="bg-slate-900 rounded-xl p-4 shadow-inner border border-slate-800">
                    <ScrollArea className="h-[500px]">
                      <div className="font-mono text-sm space-y-1.5">
                        {logs.map((log) => (
                          <div key={log.id} className="flex gap-3 items-start">
                            <span className="text-slate-500 shrink-0">
                              [{formatTime(log.timestamp)}]
                            </span>
                            <span className={getLogColor(log.type)}>
                              {log.message}
                            </span>
                          </div>
                        ))}
                        <div className="terminal-cursor mt-2" />
                      </div>
                    </ScrollArea>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 3. OVERWATCH */}
            {activeTab === "overwatch" && (
              <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="bg-white border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                    <Eye className="w-48 h-48 text-indigo-900" />
                  </div>
                  <CardHeader className="border-b border-slate-100 bg-indigo-50/50">
                    <CardTitle className="flex items-center gap-2 text-indigo-900">
                      <Eye className="w-6 h-6 text-indigo-600" />
                      Live Workspace Overwatch
                    </CardTitle>
                    <CardDescription>
                      Monitor active project collaboration and quality assurance
                      in real-time.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {requests.filter(
                        (r) =>
                          r.status === "active" || r.status === "completed",
                      ).length === 0 ? (
                        <div className="col-span-full py-20 text-center opacity-50">
                          <Eye className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                          <p className="text-slate-500 font-medium">
                            No active workspaces to monitor at the moment.
                          </p>
                        </div>
                      ) : (
                        requests
                          .filter(
                            (r) =>
                              r.status === "active" || r.status === "completed",
                          )
                          .map((req) => (
                            <Card
                              key={req.id}
                              className="bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all group"
                            >
                              <CardHeader className="p-5 pb-3">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <CardTitle className="text-base font-bold text-slate-800 truncate max-w-[160px]">
                                      {req.serviceName}
                                    </CardTitle>
                                    <CardDescription className="text-[11px] mt-0.5 font-mono">
                                      ID: {req.id.substring(0, 8)}
                                    </CardDescription>
                                  </div>
                                  <Badge
                                    className={`${
                                      req.status === "active"
                                        ? "bg-emerald-100 text-emerald-700"
                                        : "bg-indigo-100 text-indigo-700"
                                    } text-[10px]`}
                                  >
                                    {req.status.toUpperCase()}
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="p-5 pt-0">
                                <div className="space-y-3 mb-5 pt-4 border-t border-slate-100">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">
                                      Client:
                                    </span>
                                    <span className="text-slate-800 font-semibold">
                                      {req.clientName}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">
                                      Expert:
                                    </span>
                                    <span className="text-slate-800 font-semibold">
                                      {req.caName || "N/A"}
                                    </span>
                                  </div>
                                </div>
                                <Button
                                  className="w-full bg-slate-900 hover:bg-slate-800 text-white h-10 font-bold group-hover:bg-indigo-600 transition-colors"
                                  onClick={() =>
                                    navigate(`/workspace/${req.id}`)
                                  }
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  Enter Overwatch
                                </Button>
                              </CardContent>
                            </Card>
                          ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* 4. CA VERIFICATION */}
            {activeTab === "verification" && (
              <Card className="bg-white border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CardHeader className="border-b border-slate-100 bg-slate-50">
                  <CardTitle className="text-slate-800">
                    Pending CA Verifications
                  </CardTitle>
                  <CardDescription>
                    Review expert credentials before allowing them on the
                    platform.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {pendingCAs.length === 0 ? (
                      <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                        <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm text-slate-500 font-medium">
                          No experts waiting for verification.
                        </p>
                      </div>
                    ) : (
                      pendingCAs.map((ca) => (
                        <div
                          key={ca.id}
                          className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-colors gap-4"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100 shrink-0">
                              <ShieldCheck className="w-7 h-7 text-indigo-600" />
                            </div>
                            <div>
                              <p className="font-bold text-lg text-slate-900">
                                {ca.name}
                              </p>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 mt-1">
                                <span className="flex items-center gap-1">
                                  <Briefcase className="w-3.5 h-3.5" />
                                  {ca.experience} Years Exp.
                                </span>
                                <span>•</span>
                                <span>{ca.email}</span>
                              </div>
                              {ca.certificationDetails && (
                                <p className="text-xs text-indigo-600 bg-indigo-50 inline-block px-2 py-1 rounded mt-2 font-medium">
                                  Creds: {ca.certificationDetails}
                                </p>
                              )}
                            </div>
                          </div>
                          <Button
                            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm w-full md:w-auto"
                            onClick={() => verifyCA(ca.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve Expert
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 5. JOB MODERATION */}
            {activeTab === "moderation" && (
              <Card className="bg-white border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CardHeader className="border-b border-slate-100 bg-amber-50/50">
                  <CardTitle className="text-slate-800 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    Pending Jobs for Moderation
                  </CardTitle>
                  <CardDescription>
                    Review client job postings for spam or direct contact info
                    before pushing them live.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {pendingJobs.length === 0 ? (
                      <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                        <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm text-slate-500 font-medium">
                          Queue is clear. No jobs pending moderation.
                        </p>
                      </div>
                    ) : (
                      pendingJobs.map((job) => (
                        <div
                          key={job.id}
                          className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <Badge className="mb-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-none px-2 py-1">
                                {job.serviceName}
                              </Badge>
                              <h3 className="font-bold text-lg text-slate-900">
                                {job.clientName}'s Request
                              </h3>
                              {hasSpam(job.description) && (
                                <Badge
                                  variant="destructive"
                                  className="mt-2 bg-red-100 text-red-700 hover:bg-red-200 border-red-200 px-2"
                                >
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  Spam/Contact Info Detected
                                </Badge>
                              )}
                            </div>
                            <div className="text-right bg-slate-50 p-3 rounded-lg border border-slate-100">
                              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                                Budget
                              </p>
                              <p className="text-xl font-extrabold text-emerald-600 mt-0.5">
                                ₹{job.budget?.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mb-5">
                            <p className="text-xs text-slate-400 mb-2 uppercase tracking-wider font-bold">
                              Description (Spam Check Active)
                            </p>
                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                              {highlightSpam(job.description)}
                            </p>
                          </div>
                          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <Button
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 bg-white"
                              onClick={() => {
                                if (
                                  confirm(
                                    "Are you sure you want to reject this job?",
                                  )
                                ) {
                                  rejectJob(job.id);
                                }
                              }}
                            >
                              Reject & Delete
                            </Button>
                            <Button
                              className="bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                              onClick={() => approveJob(job.id)}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve & Go Live
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 6. PENDING PAYMENTS */}
            {activeTab === "payments" && (
              <Card className="bg-white border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CardHeader className="border-b border-slate-100 bg-blue-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center border border-blue-200">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-slate-800">
                        Pending Payments (Hire Alerts)
                      </CardTitle>
                      <CardDescription>
                        Clients who have selected an expert. Call to collect
                        payment and unlock workspace.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                          <th className="p-4 py-3 font-semibold uppercase tracking-wider text-xs">
                            Job Details
                          </th>
                          <th className="p-4 py-3 font-semibold uppercase tracking-wider text-xs">
                            Client Info
                          </th>
                          <th className="p-4 py-3 font-semibold uppercase tracking-wider text-xs">
                            Selected CA
                          </th>
                          <th className="p-4 py-3 font-semibold uppercase tracking-wider text-xs text-right">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {paymentAlerts.length === 0 ? (
                          <tr>
                            <td
                              colSpan={4}
                              className="p-16 text-center text-slate-400 bg-slate-50/50"
                            >
                              No pending payments at this time.
                            </td>
                          </tr>
                        ) : (
                          paymentAlerts.map((req) => (
                            <tr
                              key={req.id}
                              className="hover:bg-blue-50/30 transition-colors"
                            >
                              <td className="p-4">
                                <div className="font-bold text-slate-800">
                                  {req.serviceName}
                                </div>
                                <div className="text-xs text-slate-500 mt-1 font-mono">
                                  {formatTime(new Date(req.createdAt))}
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="font-bold text-slate-800">
                                  {req.clientName}
                                </div>
                                <div className="text-xs text-slate-500 mt-0.5">
                                  {users.find((u) => u.id === req.clientId)
                                    ?.email || "Email Hidden"}
                                </div>
                              </td>
                              <td className="p-4">
                                <Badge
                                  variant="outline"
                                  className="bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold"
                                >
                                  {req.caName || "Expert Assigned"}
                                </Badge>
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex flex-col gap-2 items-end">
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-slate-600 hover:text-slate-900 border-slate-200 h-8"
                                      onClick={() =>
                                        navigate(`/workspace/${req.id}`)
                                      }
                                    >
                                      <MessageCircle className="w-3.5 h-3.5 mr-2" />
                                      Chat
                                    </Button>
                                    <Button
                                      size="sm"
                                      className="bg-blue-600 hover:bg-blue-700 h-8 shadow-sm"
                                      onClick={() => {
                                        toast.info(
                                          `Initiating follow-up for ${req.clientName}`,
                                        );
                                        setSelectedRequest(req);
                                        setActiveTab("bridge");
                                      }}
                                    >
                                      <Headphones className="w-3 h-3 mr-2" />
                                      Call
                                    </Button>
                                  </div>
                                  <Button
                                    size="sm"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-8 w-full shadow-sm"
                                    onClick={() => {
                                      if (
                                        confirm(
                                          `Are you sure you want to unlock workspace for ${req.clientName}? This marks the project as PAID & ACTIVE.`,
                                        )
                                      ) {
                                        unlockWorkspace(req.id);
                                      }
                                    }}
                                  >
                                    <Shield className="w-3 h-3 mr-2" />
                                    Mark Paid & Unlock
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 7. PAYOUTS */}
            {activeTab === "payouts" && (
              <Card className="bg-white border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CardHeader className="border-b border-slate-100 bg-purple-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center border border-purple-200">
                      <Wallet className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-slate-800">
                        Ready for Payout
                      </CardTitle>
                      <CardDescription>
                        Release payments to experts for completed work.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                          <th className="p-4 py-3 font-semibold uppercase tracking-wider text-xs">
                            Project
                          </th>
                          <th className="p-4 py-3 font-semibold uppercase tracking-wider text-xs">
                            Expert
                          </th>
                          <th className="p-4 py-3 font-semibold uppercase tracking-wider text-xs">
                            Financials
                          </th>
                          <th className="p-4 py-3 font-semibold uppercase tracking-wider text-xs text-right">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {payoutRequests.length === 0 ? (
                          <tr>
                            <td
                              colSpan={4}
                              className="p-16 text-center text-slate-400 bg-slate-50/50"
                            >
                              No projects currently awaiting payout.
                            </td>
                          </tr>
                        ) : (
                          payoutRequests.map((req) => {
                            const budget = req.budget || 0;
                            const commission = budget * 0.1;
                            const finalPayout = budget - commission;

                            return (
                              <tr
                                key={req.id}
                                className="hover:bg-purple-50/30 transition-colors"
                              >
                                <td className="p-4">
                                  <div className="font-bold text-slate-800">
                                    {req.serviceName}
                                  </div>
                                  <div className="text-[10px] text-slate-400 mt-1 font-mono uppercase tracking-wider">
                                    ID: {req.id.substring(0, 12)}...
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold shadow-sm">
                                      {req.caName?.[0] || "E"}
                                    </div>
                                    <div>
                                      <div className="font-bold text-slate-800">
                                        {req.caName || "Unknown"}
                                      </div>
                                      <div className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider">
                                        Verified Expert
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 w-fit space-y-1.5">
                                    <div className="flex justify-between gap-6 text-xs">
                                      <span className="text-slate-500 font-medium">
                                        Total:
                                      </span>
                                      <span className="font-mono text-slate-700 font-semibold">
                                        ₹{budget.toLocaleString()}
                                      </span>
                                    </div>
                                    <div className="flex justify-between gap-6 text-xs">
                                      <span className="text-pink-600 font-medium">
                                        Fee (10%):
                                      </span>
                                      <span className="font-mono text-pink-600 font-semibold">
                                        -₹{commission.toLocaleString()}
                                      </span>
                                    </div>
                                    <div className="h-px bg-slate-200 my-1.5" />
                                    <div className="flex justify-between gap-6 text-sm font-black">
                                      <span className="text-emerald-700">
                                        Payout:
                                      </span>
                                      <span className="font-mono text-emerald-700">
                                        ₹{finalPayout.toLocaleString()}
                                      </span>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4 text-right">
                                  <Button
                                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md hover:shadow-lg transition-all"
                                    onClick={() => {
                                      if (
                                        confirm(
                                          `Confirm manual payout of ₹${finalPayout.toLocaleString()} to ${
                                            req.caName
                                          }? This will archive the project.`,
                                        )
                                      ) {
                                        archiveProject(req.id);
                                        toast.success(
                                          "Payout marked complete and project archived.",
                                        );
                                      }
                                    }}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Mark Paid & Archive
                                  </Button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 8. ADMIN TEAM */}
            {activeTab === "team" && (
              <Card className="bg-white border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl">
                <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between py-4">
                  <div>
                    <CardTitle className="text-slate-800">Admin Team</CardTitle>
                    <CardDescription>
                      Manage command center access.
                    </CardDescription>
                  </div>
                  <Dialog open={addAdminOpen} onOpenChange={setAddAdminOpen}>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        className="bg-slate-900 hover:bg-slate-800"
                      >
                        <UserPlus className="w-4 h-4 mr-2" /> Add Admin
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white border-slate-200">
                      <DialogHeader>
                        <DialogTitle>Add New Admin</DialogTitle>
                        <DialogDescription>
                          Create a new admin account with full command center
                          access.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700">
                            Name
                          </label>
                          <Input
                            placeholder="Admin Name"
                            value={newAdminName}
                            onChange={(e) => setNewAdminName(e.target.value)}
                            className="border-slate-200 focus-visible:ring-indigo-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700">
                            Email
                          </label>
                          <Input
                            type="email"
                            placeholder="admin@tcg.com"
                            value={newAdminEmail}
                            onChange={(e) => setNewAdminEmail(e.target.value)}
                            className="border-slate-200 focus-visible:ring-indigo-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700">
                            Password
                          </label>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            value={newAdminPassword}
                            onChange={(e) =>
                              setNewAdminPassword(e.target.value)
                            }
                            className="border-slate-200 focus-visible:ring-indigo-500"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setAddAdminOpen(false)}
                          className="border-slate-200 text-slate-600"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleAddAdmin}
                          className="bg-indigo-600 hover:bg-indigo-700"
                        >
                          Create Admin
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {adminUsers.map((admin) => (
                      <div
                        key={admin.id}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200">
                            <Shield className="w-6 h-6 text-indigo-600" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">
                              {admin.name}
                            </p>
                            <p className="text-sm text-slate-500">
                              {admin.email}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            admin.isOnline
                              ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                              : "bg-slate-100 text-slate-500 border-slate-200"
                          }
                        >
                          {admin.isOnline ? "Online" : "Offline"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 9. HISTORY */}
            {activeTab === "history" && (
              <Card className="bg-white border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                  <CardTitle className="flex items-center gap-2 text-slate-800">
                    <BookOpen className="w-5 h-5 text-slate-600" />
                    Project Archives
                  </CardTitle>
                  <CardDescription>
                    Historical record of completed and paid projects.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                          <th className="p-4 py-3 font-semibold uppercase tracking-wider text-xs">
                            Project
                          </th>
                          <th className="p-4 py-3 font-semibold uppercase tracking-wider text-xs">
                            Users
                          </th>
                          <th className="p-4 py-3 font-semibold uppercase tracking-wider text-xs">
                            Budget
                          </th>
                          <th className="p-4 py-3 font-semibold uppercase tracking-wider text-xs">
                            Archived On
                          </th>
                          <th className="p-4 py-3 font-semibold uppercase tracking-wider text-xs text-right">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {archivedRequests.length === 0 ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="p-16 text-center text-slate-400 bg-slate-50/50"
                            >
                              The archives are currently empty.
                            </td>
                          </tr>
                        ) : (
                          archivedRequests.map((req) => (
                            <tr
                              key={req.id}
                              className="hover:bg-slate-50 transition-colors"
                            >
                              <td className="p-4">
                                <span className="font-bold text-slate-800">
                                  {req.serviceName}
                                </span>
                                <div className="text-[10px] text-slate-400 mt-1 font-mono uppercase">
                                  ID: {req.id.substring(0, 8)}
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="text-xs space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                    <span className="text-slate-500">C:</span>
                                    <span className="text-slate-800 font-semibold truncate max-w-[120px]">
                                      {req.clientName}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                    <span className="text-slate-500">E:</span>
                                    <span className="text-slate-800 font-semibold truncate max-w-[120px]">
                                      {req.caName || "N/A"}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="font-mono text-slate-700 font-semibold">
                                  ₹{(req.budget || 0).toLocaleString()}
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="text-xs text-slate-500 font-medium">
                                  {new Date(req.updatedAt).toLocaleDateString(
                                    undefined,
                                    {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    },
                                  )}
                                </div>
                              </td>
                              <td className="p-4 text-right">
                                <Badge className="bg-slate-200 text-slate-600 border-none hover:bg-slate-200">
                                  ARCHIVED
                                </Badge>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </main>
    </div>
  );
};

export default AdminDashboard;
