import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  LogOut,
  Users,
  Briefcase,
  Terminal,
  MessageCircle,
  Forward,
  Send,
  UserPlus,
  CheckCircle,
  Loader2,
  ArrowRight, // Added for "Forward to CA" icon
  ArrowLeft, // Added for "Forward to Client" icon
  Receipt,
  Headphones,
  BookOpen,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useMockBackend,
  ActivityLog,
  ServiceRequest,
} from "@/context/MockBackendContext";
import { toast } from "sonner";

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
    forwardToCA, // <--- 1. ADDED THIS (Make sure it's in your Context)
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
    "bridge" | "team" | "feed" | "verification" | "moderation" | "payments" | "overwatch" | "payouts" | "history"
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
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
      (r) => r.status === "active" || r.status === "live" || r.status === "completed",
    );

  const getPendingPaymentRequests = () =>
    requests.filter((r) => r.status === "awaiting_payment");

  const pendingRequests = getPendingApprovalRequests();
  const activeRequests = getActiveRequests();
  const paymentAlerts = getPendingPaymentRequests();
  const payoutRequests = requests.filter(r => r.status === 'ready_for_payout');
  const archivedRequests = requests.filter(r => r.isArchived === true);
  const allActiveAndPending = [...pendingRequests, ...activeRequests, ...paymentAlerts];

  const onlineClients = users.filter((u) => u.role === "client" && u.isOnline);
  const onlineCAs = users.filter((u) => u.role === "ca" && u.isOnline);
  const adminUsers = users.filter((u) => u.role === "admin");

  const getLogColor = (type: ActivityLog["type"]) => {
    switch (type) {
      case "request":
        return "text-warning";
      case "accept":
        return "text-blue-400";
      case "approve":
        return "text-success";
      case "forward":
        return "text-purple-400";
      case "admin_added":
        return "text-pink-400";
      default:
        return "text-muted-foreground";
    }
  };

  const highlightSpam = (text: string) => {
    if (!text) return "";
    // Detect 10-digit numbers or general email patterns
    const spamRegex = /(\d{10}|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
    const parts = text.split(spamRegex);
    return (
      <>
        {parts.map((part, i) =>
          part && spamRegex.test(part) ? (
            <span
              key={i}
              className="bg-red-500/30 text-red-200 px-1 rounded font-bold border border-red-500/50"
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

  // --- SENDING LOGIC ---

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

  // --- FORWARDING LOGIC ---

  const handleForwardToClient = (messageId: string) => {
    if (!selectedRequest) return;
    forwardToClient(selectedRequest.id, messageId);
  };

  // 2. ADDED HANDLER FOR CA FORWARDING
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
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-700 py-4 px-6 bg-slate-900/95 sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            <div>
              <h1 className="font-heading font-bold text-lg">
                TCG Command Center
              </h1>
              <p className="text-xs text-slate-400">God Mode Active</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-300 hover:bg-slate-800"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Exit
          </Button>
        </div>
      </header>

      <div className="container mx-auto p-6">
        {/* Stats Row */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">
                Online Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-100">
                {onlineClients.length}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">
                Online CAs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-100">
                {onlineCAs.length}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">
                Pending Verification (CA)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-pink-400">
                {pendingCAs.length}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">
                Pending Approval (Jobs)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-warning">
                {pendingJobs.length}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">
                Active Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-success">
                {activeRequests.length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as typeof activeTab)}
        >
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger
              value="bridge"
              className="data-[state=active]:bg-primary"
            >
              <MessageCircle className="w-4 h-4 mr-2" /> Bridge Chat
            </TabsTrigger>
            <TabsTrigger
              value="team"
              className="data-[state=active]:bg-primary"
            >
              <Users className="w-4 h-4 mr-2" /> Team/Staff
            </TabsTrigger>
            <TabsTrigger
              value="feed"
              className="data-[state=active]:bg-primary"
            >
              <Terminal className="w-4 h-4 mr-2" /> Live Feed
            </TabsTrigger>
            <TabsTrigger
              value="verification"
              className="data-[state=active]:bg-pink-600"
            >
              <Shield className="w-4 h-4 mr-2" /> CA Verification
            </TabsTrigger>
            <TabsTrigger
              value="moderation"
              className="data-[state=active]:bg-warning"
            >
              <Briefcase className="w-4 h-4 mr-2" /> Job Moderation
            </TabsTrigger>
            <TabsTrigger
              value="payments"
              className="data-[state=active]:bg-success"
            >
              <Receipt className="w-4 h-4 mr-2" /> Pending Payments
              {paymentAlerts.length > 0 && (
                <Badge className="ml-2 bg-white text-success animate-bounce h-5 px-1.5 min-w-[20px]">
                  {paymentAlerts.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="overwatch"
              className="data-[state=active]:bg-indigo-600"
            >
              <Shield className="w-4 h-4 mr-2" /> Overwatch
            </TabsTrigger>
            <TabsTrigger
              value="payouts"
              className="data-[state=active]:bg-purple-600"
            >
              <Receipt className="w-4 h-4 mr-2" /> Payouts
              {payoutRequests.length > 0 && (
                <Badge className="ml-2 bg-white text-purple-600 h-5 px-1.5 min-w-[20px]">
                  {payoutRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="data-[state=active]:bg-slate-700"
            >
              <BookOpen className="w-4 h-4 mr-2" /> History
            </TabsTrigger>
          </TabsList>

          {/* Bridge Chat Tab */}
          <TabsContent value="bridge" className="mt-6">
            <div className="grid lg:grid-cols-4 gap-6">
              {/* Job List Sidebar */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-sm">Active Jobs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {allActiveAndPending.length === 0 ? (
                    <p className="text-sm text-slate-400">No active jobs</p>
                  ) : (
                    allActiveAndPending.map((req) => (
                      <div
                        key={req.id}
                        onClick={() => setSelectedRequest(req)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedRequest?.id === req.id ? "bg-primary/20 border border-primary" : "bg-slate-700/50 hover:bg-slate-700"}`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-sm">
                            {req.serviceName}
                          </span>
                          <Badge
                            variant="secondary"
                            className={
                              req.status === "pending_approval"
                                ? "bg-warning/20 text-warning"
                                : req.status === "completed"
                                ? "bg-indigo-600/20 text-indigo-400"
                                : "bg-success/20 text-success"
                            }
                          >
                            {req.status === "pending_approval"
                              ? "Pending"
                              : req.status === "completed"
                              ? "Awaiting Client"
                              : "Active"}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400">
                          Client: {req.clientName}
                        </p>
                        {req.caName && (
                          <p className="text-xs text-slate-400">
                            CA: {req.caName}
                          </p>
                        )}
                        {req.expectedBudget && (
                          <p className="text-xs font-semibold text-blue-400 mt-1">
                            Exp. Budget: ₹{req.expectedBudget.toLocaleString()}
                          </p>
                        )}
                        {req.status === "pending_approval" && (
                          <Button
                            size="sm"
                            className="w-full mt-2"
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
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* --- LEFT: Client Chat --- */}
                    <Card className="bg-slate-800/50 border-slate-700 h-[500px] flex flex-col">
                      <CardHeader className="border-b border-slate-700 py-3 bg-blue-900/10 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                            <Users className="w-3 h-3 text-white" />
                          </div>
                          Client: {selectedRequest.clientName}
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-[10px] bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20"
                          onClick={() => navigate(`/workspace/${selectedRequest.id}`)}
                        >
                          <Shield className="w-3 h-3 mr-1" />
                          View Full Workspace
                        </Button>
                      </CardHeader>
                      <ScrollArea className="flex-1 p-3">
                        <div className="space-y-3">
                          {clientMsgs.map((msg) => {
                            const isAdmin = msg.senderRole === "admin";
                            return (
                              <div
                                key={msg.id}
                                className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                              >
                                <div
                                  className={`flex flex-col ${isAdmin ? "items-end" : "items-start"} max-w-[85%]`}
                                >
                                  <div
                                    className={`rounded-lg px-3 py-2 text-sm ${isAdmin ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-200"}`}
                                  >
                                    <p>{msg.text}</p>
                                    <p className="text-xs opacity-60 mt-1 text-right">
                                      {msg.timestamp.toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                      {msg.isForwarded && " • Fwd"}
                                    </p>
                                  </div>

                                  {/* 3. FORWARD BUTTON (Visible only on Client Messages) */}
                                  {!isAdmin && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-[10px] h-6 px-2 text-blue-400 hover:text-blue-300 mt-1"
                                      onClick={() => handleForwardToCA(msg.id)}
                                    >
                                      Forward to CA{" "}
                                      <ArrowRight className="w-3 h-3 ml-1" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </ScrollArea>
                      <div className="border-t border-slate-700 p-3 flex gap-2">
                        <Input
                          placeholder="Reply as TCG Expert Team..."
                          value={clientMessageInput}
                          onChange={(e) =>
                            setClientMessageInput(e.target.value)
                          }
                          onKeyDown={(e) => e.key === "Enter" && sendToClient()}
                          className="bg-slate-700 border-slate-600"
                        />
                        <Button
                          size="icon"
                          onClick={sendToClient}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>

                    {/* --- RIGHT: CA Chat --- */}
                    <Card className="bg-slate-800/50 border-slate-700 h-[500px] flex flex-col">
                      <CardHeader className="border-b border-slate-700 py-3 bg-green-900/10">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                            <Briefcase className="w-3 h-3 text-white" />
                          </div>
                          CA: {selectedRequest.caName || "Not assigned"}
                        </CardTitle>
                      </CardHeader>
                      <ScrollArea className="flex-1 p-3">
                        <div className="space-y-3">
                          {caMsgs.map((msg) => {
                            const isAdmin = msg.senderRole === "admin";
                            return (
                              <div
                                key={msg.id}
                                className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                              >
                                <div
                                  className={`flex flex-col ${isAdmin ? "items-end" : "items-start"} max-w-[85%]`}
                                >
                                  <div
                                    className={`rounded-lg px-3 py-2 text-sm ${isAdmin ? "bg-green-600 text-white" : "bg-slate-700 text-slate-200"}`}
                                  >
                                    <p>{msg.text}</p>
                                    <p className="text-xs opacity-60 mt-1 text-right">
                                      {msg.timestamp.toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                      {msg.isForwarded && " • Fwd"}
                                    </p>
                                  </div>

                                  {/* 4. FORWARD BUTTON (Visible only on CA Messages) */}
                                  {!isAdmin && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-[10px] h-6 px-2 text-green-400 hover:text-green-300 mt-1"
                                      onClick={() =>
                                        handleForwardToClient(msg.id)
                                      }
                                    >
                                      <ArrowLeft className="w-3 h-3 mr-1" />{" "}
                                      Forward to Client
                                    </Button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </ScrollArea>
                      <div className="border-t border-slate-700 p-3 flex gap-2">
                        <Input
                          placeholder="Message CA directly..."
                          value={caMessageInput}
                          onChange={(e) => setCAMessageInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && sendToCA()}
                          className="bg-slate-700 border-slate-600"
                        />
                        <Button
                          size="icon"
                          onClick={sendToCA}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  </div>
                ) : (
                  <Card className="bg-slate-800/50 border-slate-700 h-[500px] flex items-center justify-center">
                    <div className="text-center text-slate-400">
                      <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Select a job to view the bridge chat</p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Team/Staff Tab (UNCHANGED) */}
          <TabsContent value="team" className="mt-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" /> Admin Team
                </CardTitle>
                <Dialog open={addAdminOpen} onOpenChange={setAddAdminOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <UserPlus className="w-4 h-4 mr-2" /> Add New Admin
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-800 border-slate-700">
                    <DialogHeader>
                      <DialogTitle>Add New Admin</DialogTitle>
                      <DialogDescription className="text-slate-400">
                        Create a new admin account. This is the only way to add
                        admins.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Name</label>
                        <Input
                          placeholder="Admin name"
                          value={newAdminName}
                          onChange={(e) => setNewAdminName(e.target.value)}
                          className="bg-slate-700 border-slate-600"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <Input
                          type="email"
                          placeholder="admin@tcg.com"
                          value={newAdminEmail}
                          onChange={(e) => setNewAdminEmail(e.target.value)}
                          className="bg-slate-700 border-slate-600"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Password</label>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          value={newAdminPassword}
                          onChange={(e) => setNewAdminPassword(e.target.value)}
                          className="bg-slate-700 border-slate-600"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setAddAdminOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleAddAdmin}>Create Admin</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {adminUsers.map((admin) => (
                    <div
                      key={admin.id}
                      className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <Shield className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{admin.name}</p>
                          <p className="text-sm text-slate-400">
                            {admin.email}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className={
                          admin.isOnline ? "bg-success/20 text-success" : ""
                        }
                      >
                        {admin.isOnline ? "Online" : "Offline"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Live Feed Tab (UNCHANGED) */}
          <TabsContent value="feed" className="mt-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="flex flex-row items-center gap-2">
                <Terminal className="w-5 h-5" />
                <CardTitle>Live Activity Feed</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="font-mono text-sm space-y-1">
                    {logs.map((log) => (
                      <div key={log.id} className="flex gap-2">
                        <span className="text-slate-500">
                          [{formatTime(log.timestamp)}]
                        </span>
                        <span className={getLogColor(log.type)}>
                          {log.message}
                        </span>
                      </div>
                    ))}
                    <div className="terminal-cursor" />
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CA Verification Tab */}
          <TabsContent value="verification" className="mt-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle>Pending CA Verifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingCAs.length === 0 ? (
                    <p className="text-sm text-slate-400 py-8 text-center border border-dashed border-slate-700 rounded-lg">
                      No CAs waiting for verification.
                    </p>
                  ) : (
                    pendingCAs.map((ca) => (
                      <div
                        key={ca.id}
                        className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-700"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center border border-pink-500/20">
                            <Users className="w-6 h-6 text-pink-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-100">
                              {ca.name}
                            </p>
                            <div className="flex gap-3 text-xs text-slate-400 mt-1">
                              <span>Experience: {ca.experience} Years</span>
                              <span>Email: {ca.email}</span>
                            </div>
                            {ca.certificationDetails && (
                              <p className="text-[10px] text-pink-400/80 mt-1 italic">
                                {ca.certificationDetails}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="bg-success hover:bg-success/90 text-white"
                          onClick={() => verifyCA(ca.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Verify CA
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Job Moderation Tab */}
          <TabsContent value="moderation" className="mt-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle>Pending Jobs for Moderation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingJobs.length === 0 ? (
                    <p className="text-sm text-slate-400 py-8 text-center border border-dashed border-slate-700 rounded-lg">
                      No jobs pending moderation.
                    </p>
                  ) : (
                    pendingJobs.map((job) => (
                      <div
                        key={job.id}
                        className="p-4 bg-slate-700/30 rounded-lg border border-slate-700"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <Badge className="mb-2 bg-primary/20 text-primary hover:bg-primary/30 border-none">
                              {job.serviceName}
                            </Badge>
                            <h3 className="font-medium text-slate-100">
                              {job.clientName}'s Request
                            </h3>
                            {hasSpam(job.description) && (
                              <Badge
                                variant="destructive"
                                className="mt-2 animate-pulse"
                              >
                                ⚠️ SPAM WARNING: Contact Info Detected
                              </Badge>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-400">Budget</p>
                            <p className="text-lg font-bold text-success">
                              ₹{job.budget?.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="bg-slate-900/50 p-3 rounded border border-slate-700 mb-4">
                          <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider font-bold">
                            Description (Spam Check Active)
                          </p>
                          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                            {highlightSpam(job.description)}
                          </p>
                        </div>
                        <div className="flex justify-end gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-slate-400 border-slate-600 hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => {
                              if (confirm("Are you sure you want to reject this job?")) {
                                rejectJob(job.id);
                              }
                            }}
                          >
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            className="bg-primary hover:bg-primary/90"
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
          </TabsContent>

          {/* Pending Payments Section */}
          <TabsContent value="payments" className="mt-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                    <Receipt className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Pending Payments (Hire Alerts)</CardTitle>
                    <CardDescription>
                      These clients have selected an expert. Call them to confirm manual payment.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-900/50 rounded-lg overflow-hidden border border-slate-700">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-slate-800 text-slate-400">
                        <th className="p-4 font-medium">Job Details</th>
                        <th className="p-4 font-medium">Client Info</th>
                        <th className="p-4 font-medium">Selected CA</th>
                        <th className="p-4 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {paymentAlerts.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-10 text-center text-slate-500">
                            No pending payments at this time.
                          </td>
                        </tr>
                      ) : (
                        paymentAlerts.map((req) => (
                          <tr key={req.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="p-4 font-medium">
                              <div>{req.serviceName}</div>
                              <div className="text-xs text-slate-500 mt-1">
                                {formatTime(new Date(req.createdAt))}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="font-semibold text-slate-200">{req.clientName}</div>
                              <div className="text-xs text-slate-400">
                                {users.find(u => u.id === req.clientId)?.email || "Email Hidden"}
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                {req.caName || "Expert Assigned"}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <div className="flex flex-col gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 h-8 border border-indigo-500/20"
                                  onClick={() => navigate(`/workspace/${req.id}`)}
                                >
                                  <MessageCircle className="w-3.5 h-3.5 mr-2" />
                                  View Chat
                                </Button>
                                <Button 
                                  size="sm" 
                                  className="bg-success hover:bg-success/90 h-8"
                                  onClick={() => {
                                    toast.info(`Initiating follow-up for ${req.clientName}`);
                                    setSelectedRequest(req);
                                  }}
                                >
                                  <Headphones className="w-3 h-3 mr-2" />
                                  Call Now
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-primary hover:bg-primary/90 text-white font-bold h-8"
                                                                                                                                                                                                                                                                                            onClick={() => {
                                    if(confirm(`Are you sure you want to unlock workspace for ${req.clientName}? This marks the project as PAID & ACTIVE.`)) {
                                      unlockWorkspace(req.id);
                                    }
                                  }}
                                >
                                  <Shield className="w-3 h-3 mr-2" />
                                  Unlock Workspace
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
          </TabsContent>
          {/* Overwatch Tab */}
          <TabsContent value="overwatch" className="mt-6">
            <div className="grid gap-6">
              <Card className="bg-slate-800/50 border-slate-700 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                   <Shield className="w-24 h-24 text-indigo-400" />
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-indigo-400">
                    <Shield className="w-6 h-6" />
                    Live Workspace Overwatch
                  </CardTitle>
                  <CardDescription>
                    Monitor active project collaboration and quality assurance in real-time.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {requests.filter(r => r.status === 'active' || r.status === 'completed').length === 0 ? (
                        <div className="col-span-full py-20 text-center opacity-40">
                            <MessageCircle className="w-16 h-16 mx-auto mb-4" />
                            <p>No active workspaces to monitor at the moment.</p>
                        </div>
                    ) : (
                        requests.filter(r => r.status === 'active' || r.status === 'completed').map(req => (
                            <Card key={req.id} className="bg-slate-700/30 border-slate-600 hover:border-indigo-500/50 transition-all group">
                                <CardHeader className="p-4 pb-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-sm font-bold truncate max-w-[150px]">{req.serviceName}</CardTitle>
                                            <CardDescription className="text-[10px]">ID: {req.id.substring(0,8)}</CardDescription>
                                        </div>
                                        <Badge className={`${req.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'} text-[10px]`}>
                                            {req.status.toUpperCase()}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <div className="space-y-2 mb-4 pt-3 border-t border-slate-600/50">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-400">Client:</span>
                                            <span className="text-slate-200 font-medium">{req.clientName}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-400">Expert:</span>
                                            <span className="text-slate-200 font-medium">{req.caName || "N/A"}</span>
                                        </div>
                                    </div>
                                    <Button 
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-xs h-9 font-bold group-hover:scale-[1.02] transition-transform"
                                        onClick={() => navigate(`/workspace/${req.id}`)}
                                    >
                                        <MessageCircle className="w-3.5 h-3.5 mr-2" />
                                        View Chat (Overwatch)
                                    </Button>
                                </CardContent>
                            </Card>
                        ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Payouts Tab */}
          <TabsContent value="payouts" className="mt-6">
            <Card className="bg-slate-800/50 border-slate-700 shadow-xl overflow-hidden">
              <CardHeader className="border-b border-slate-700 bg-purple-900/10">
                <CardTitle className="flex items-center gap-2 text-purple-400">
                  <Receipt className="w-6 h-6" />
                  Ready for Payout
                </CardTitle>
                <CardDescription>
                  Calculate commissions and release payments to experts for completed and approved work.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-slate-900/50 text-slate-400 border-b border-slate-700">
                        <th className="p-4 font-bold">Project Details</th>
                        <th className="p-4 font-bold">Expert Info</th>
                        <th className="p-4 font-bold">Financial Breakdown</th>
                        <th className="p-4 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      {payoutRequests.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-20 text-center text-slate-500 italic">
                            No projects are currently awaiting payout.
                          </td>
                        </tr>
                      ) : (
                        payoutRequests.map((req) => {
                          const budget = req.budget || 0;
                          const commission = budget * 0.1;
                          const finalPayout = budget - commission;

                          return (
                            <tr key={req.id} className="hover:bg-slate-700/20 transition-colors">
                              <td className="p-4">
                                <span className="font-bold text-slate-200">{req.serviceName}</span>
                                <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-tighter">ID: {req.id}</div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold">
                                    {req.caName?.[0] || 'E'}
                                  </div>
                                  <div>
                                    <div className="font-medium">{req.caName || "Unknown Expert"}</div>
                                    <div className="text-[10px] text-slate-400">Verified Expert</div>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="space-y-1 bg-black/20 p-3 rounded-lg border border-slate-700 w-fit">
                                  <div className="flex justify-between gap-8 text-[11px]">
                                    <span className="text-slate-400">Total Budget:</span>
                                    <span className="font-mono text-slate-200">₹{budget.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between gap-8 text-[11px]">
                                    <span className="text-pink-400">Platform (10%):</span>
                                    <span className="font-mono text-pink-400">-₹{commission.toLocaleString()}</span>
                                  </div>
                                  <div className="h-px bg-slate-700 my-1" />
                                  <div className="flex justify-between gap-8 text-xs font-bold">
                                    <span className="text-success">Net Payout:</span>
                                    <span className="font-mono text-success">₹{finalPayout.toLocaleString()}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 text-right">
                                <Button
                                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold h-10 px-6 rounded-lg shadow-lg hover:scale-[1.02] transition-all"
                                  onClick={() => {
                                    if(confirm(`Release ₹${finalPayout.toLocaleString()} to ${req.caName} and archive this project?`)) {
                                      archiveProject(req.id);
                                    }
                                  }}
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Archive Job (Payout Done)
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
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="mt-6">
            <Card className="bg-slate-800/50 border-slate-700 shadow-xl overflow-hidden">
              <CardHeader className="border-b border-slate-700">
                <CardTitle className="flex items-center gap-2 text-slate-300">
                  <BookOpen className="w-6 h-6" />
                  Project Archives & History
                </CardTitle>
                <CardDescription>
                  View all past projects that have been completed, paid out, and archived.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-slate-900/50 text-slate-400 border-b border-slate-700">
                        <th className="p-4 font-bold">Project</th>
                        <th className="p-4 font-bold">Participants</th>
                        <th className="p-4 font-bold">Financials</th>
                        <th className="p-4 font-bold">Completion Date</th>
                        <th className="p-4 font-bold text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      {archivedRequests.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-20 text-center text-slate-500 italic">
                            The archives are currently empty.
                          </td>
                        </tr>
                      ) : (
                        archivedRequests.map((req) => (
                          <tr key={req.id} className="hover:bg-slate-700/20 transition-colors">
                            <td className="p-4">
                              <span className="font-bold text-slate-200">{req.serviceName}</span>
                              <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-tighter">ID: {req.id}</div>
                            </td>
                            <td className="p-4">
                              <div className="text-xs space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                  <span className="text-slate-400">Client:</span>
                                  <span className="text-slate-200 font-medium">{req.clientName}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                                  <span className="text-slate-400">Expert:</span>
                                  <span className="text-slate-200 font-medium">{req.caName || "N/A"}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="font-mono text-slate-200">₹{(req.budget || 0).toLocaleString()}</div>
                              <div className="text-[10px] text-green-400 font-bold uppercase tracking-tighter mt-0.5">PAYOUT COMPLETE</div>
                            </td>
                            <td className="p-4">
                              <div className="text-xs text-slate-400">
                                {new Date(req.updatedAt).toLocaleDateString(undefined, {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                            </td>
                            <td className="p-4 text-right">
                              <Badge className="bg-slate-700 text-slate-300 border-slate-600">ARCHIVED</Badge>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
