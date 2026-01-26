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
  Loader2, // <--- Import Loader
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    isLoading, // <--- 1. Get Loading State
    logout,
    users,
    requests,
    logs,
    clientMessages,
    caMessages,
    addClientMessage,
    addCAMessage,
    forwardToClient,
    adminApproveRequest,
    getPendingApprovalRequests,
    getActiveRequests,
    addAdmin,
  } = useMockBackend();

  const [activeTab, setActiveTab] = useState<"bridge" | "team" | "feed">(
    "bridge",
  );
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(
    null,
  );
  const [clientMessageInput, setClientMessageInput] = useState("");
  const [caMessageInput, setCAMessageInput] = useState("");

  // Add admin form
  const [addAdminOpen, setAddAdminOpen] = useState(false);
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");

  useEffect(() => {
    // 2. Wait for loading to finish before checking user/role
    if (!isLoading) {
      if (!currentUser || currentUser.role !== "admin") {
        navigate("/");
      }
    }
  }, [currentUser, isLoading, navigate]);

  // 3. Show Dark Theme Spinner while loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // 4. Safety Check
  if (!currentUser || currentUser.role !== "admin") return null;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const pendingRequests = getPendingApprovalRequests();
  const activeRequests = getActiveRequests();
  const allActiveAndPending = [...pendingRequests, ...activeRequests];

  const onlineClients = users.filter((u) => u.role === "client" && u.isOnline);
  const onlineCAs = users.filter((u) => u.role === "ca" && u.isOnline);
  const adminUsers = users.filter((u) => u.role === "admin");

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

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

  const handleForward = (messageId: string) => {
    if (!selectedRequest) return;
    forwardToClient(selectedRequest.id, messageId);
  };

  const handleApprove = (requestId: string) => {
    adminApproveRequest(requestId);
    toast.success("Request approved! Job is now active.");
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
        {/* Stats */}
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
                Pending Approval
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-warning">
                {pendingRequests.length}
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
              <MessageCircle className="w-4 h-4 mr-2" />
              Bridge Chat
            </TabsTrigger>
            <TabsTrigger
              value="team"
              className="data-[state=active]:bg-primary"
            >
              <Users className="w-4 h-4 mr-2" />
              Team/Staff
            </TabsTrigger>
            <TabsTrigger
              value="feed"
              className="data-[state=active]:bg-primary"
            >
              <Terminal className="w-4 h-4 mr-2" />
              Live Feed
            </TabsTrigger>
          </TabsList>

          {/* Bridge Chat Tab */}
          <TabsContent value="bridge" className="mt-6">
            <div className="grid lg:grid-cols-4 gap-6">
              {/* Job List */}
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
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedRequest?.id === req.id
                            ? "bg-primary/20 border border-primary"
                            : "bg-slate-700/50 hover:bg-slate-700"
                        }`}
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
                                : "bg-success/20 text-success"
                            }
                          >
                            {req.status === "pending_approval"
                              ? "Pending"
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
                        {req.status === "pending_approval" && (
                          <Button
                            size="sm"
                            className="w-full mt-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApprove(req.id);
                            }}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approve
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
                    {/* Client Chat (Left) */}
                    <Card className="bg-slate-800/50 border-slate-700 h-[500px] flex flex-col">
                      <CardHeader className="border-b border-slate-700 py-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                            <Users className="w-3 h-3" />
                          </div>
                          Client: {selectedRequest.clientName}
                        </CardTitle>
                      </CardHeader>
                      <ScrollArea className="flex-1 p-3">
                        <div className="space-y-3">
                          {clientMsgs.map((msg) => (
                            <div
                              key={msg.id}
                              className={`flex ${msg.senderRole === "client" ? "justify-start" : "justify-end"}`}
                            >
                              <div
                                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                                  msg.senderRole === "client"
                                    ? "bg-slate-700"
                                    : "bg-primary"
                                }`}
                              >
                                <p>{msg.content}</p>
                                <p className="text-xs opacity-60 mt-1">
                                  {msg.timestamp.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                  {msg.forwardedFrom && " • Forwarded"}
                                </p>
                              </div>
                            </div>
                          ))}
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
                        <Button size="icon" onClick={sendToClient}>
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>

                    {/* CA Chat (Right) */}
                    <Card className="bg-slate-800/50 border-slate-700 h-[500px] flex flex-col">
                      <CardHeader className="border-b border-slate-700 py-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                            <Briefcase className="w-3 h-3" />
                          </div>
                          CA: {selectedRequest.caName || "Not assigned"}
                        </CardTitle>
                      </CardHeader>
                      <ScrollArea className="flex-1 p-3">
                        <div className="space-y-3">
                          {caMsgs.map((msg) => (
                            <div
                              key={msg.id}
                              className={`flex ${msg.senderRole === "ca" ? "justify-start" : "justify-end"}`}
                            >
                              <div className="max-w-[85%]">
                                <div
                                  className={`rounded-lg px-3 py-2 text-sm ${
                                    msg.senderRole === "ca"
                                      ? "bg-slate-700"
                                      : "bg-green-600"
                                  }`}
                                >
                                  <p>{msg.content}</p>
                                  <p className="text-xs opacity-60 mt-1">
                                    {msg.timestamp.toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </p>
                                </div>
                                {/* Forward button for CA messages */}
                                {msg.senderRole === "ca" && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-xs text-purple-400 mt-1"
                                    onClick={() => handleForward(msg.id)}
                                  >
                                    <Forward className="w-3 h-3 mr-1" />
                                    Forward to Client
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      <div className="border-t border-slate-700 p-3 flex gap-2">
                        <Input
                          placeholder="Message CA..."
                          value={caMessageInput}
                          onChange={(e) => setCAMessageInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && sendToCA()}
                          className="bg-slate-700 border-slate-600"
                        />
                        <Button size="icon" onClick={sendToCA}>
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

          {/* Team/Staff Tab */}
          <TabsContent value="team" className="mt-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Admin Team
                </CardTitle>
                <Dialog open={addAdminOpen} onOpenChange={setAddAdminOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add New Admin
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

          {/* Live Feed Tab */}
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
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
