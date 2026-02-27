import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Calculator,
  ClipboardCheck,
  Building2,
  Receipt,
  BookOpen,
  LogOut,
  User,
  Loader2,
  MessageCircle,
  Send,
  Headphones,
  Shield,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMockBackend, SERVICES } from "@/context/MockBackendContext";
import { useSocket } from "@/context/SocketContext";
import { toast } from "sonner";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText,
  Calculator,
  ClipboardCheck,
  Building2,
  Receipt,
  BookOpen,
};

const ClientDashboard = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    isLoading, // 1. Get Loading State
    logout,
    requests,
    createRequest,
    fetchBidsForRequest,
    hireCA,
    clientMessages,
    addClientMessage,
    refreshData,
  } = useMockBackend();
  const { socket } = useSocket();

  const [selectedService, setSelectedService] = useState<
    (typeof SERVICES)[0] | null
  >(null);
  const [description, setDescription] = useState("");
  const [expectedBudget, setExpectedBudget] = useState<number | "">("");
  const [isRequesting, setIsRequesting] = useState(false);

  // Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatRequestId, setChatRequestId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");

  // Bidding State
  const [bidsDialogOpen, setBidsDialogOpen] = useState(false);
  const [selectedReqForBids, setSelectedReqForBids] = useState<string | null>(
    null,
  );
  const [bids, setBids] = useState<any[]>([]);
  const [isFetchingBids, setIsFetchingBids] = useState(false);
  const [isHiring, setIsHiring] = useState(false);
  const [hireSuccessOpen, setHireSuccessOpen] = useState(false);

  useEffect(() => {
    // 2. Wait for loading to finish before checking user
    if (!isLoading && !currentUser) {
      navigate("/");
    }
  }, [currentUser, isLoading, navigate]);

  useEffect(() => {
    if (!socket || currentUser?.role !== "client") return;

    const handleNewBid = (data: any) => {
      toast.success("New Bid Received!", {
        description: "An expert has submitted a proposal for your project.",
      });
      refreshData();
    };

    const handleWorkspaceUnlocked = (data: any) => {
      toast.success("Workspace Unlocked!", {
        description:
          "Your session is now active. You can chat with your expert.",
      });
      refreshData();
    };

    socket.on("new_bid_received", handleNewBid);
    socket.on("workspace_unlocked", handleWorkspaceUnlocked);

    return () => {
      socket.off("new_bid_received", handleNewBid);
      socket.off("workspace_unlocked", handleWorkspaceUnlocked);
    };
  }, [socket, currentUser, refreshData]);

  // 3. Show Spinner while loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // 4. Safety Check
  if (!currentUser) return null;

  const myRequests = requests.filter((r) => r.clientId === currentUser.id);
  const activeRequests = myRequests.filter(
    (r) =>
      r.status === "active" ||
      r.status === "pending_approval" ||
      r.status === "awaiting_payment" ||
      r.status === "live",
  );
  const searchingRequests = myRequests.filter((r) => r.status === "searching");
  const workspaceJobs = myRequests.filter(
    (r) => r.status === "active" && r.isWorkspaceUnlocked === true,
  );
  const pastProjects = myRequests.filter((r) => r.isArchived === true);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleRequestService = async () => {
    if (!selectedService || !currentUser) return;

    setIsRequesting(true);
    // Simulate slight delay for UX
    await new Promise((resolve) => setTimeout(resolve, 500));

    await createRequest(
      currentUser.id,
      currentUser.name,
      selectedService.id,
      selectedService.name,
      description,
      selectedService.defaultBudget,
      Number(expectedBudget) || selectedService.defaultBudget,
    );

    toast.success("Request submitted! Matching with expert...");
    setSelectedService(null);
    setDescription("");
    setExpectedBudget("");
    setIsRequesting(false);
  };

  const openChat = (requestId: string) => {
    setChatRequestId(requestId);
    setChatOpen(true);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !chatRequestId || !currentUser) return;
    addClientMessage(
      chatRequestId,
      currentUser.id,
      currentUser.name,
      "client",
      newMessage,
    );
    setNewMessage("");
  };

  const handleViewBids = async (requestId: string) => {
    setSelectedReqForBids(requestId);
    setBidsDialogOpen(true);
    setIsFetchingBids(true);
    try {
      const data = await fetchBidsForRequest(requestId);
      setBids(data);
    } catch (e) {
      toast.error("Failed to load bids");
    } finally {
      setIsFetchingBids(false);
    }
  };

  const handleHireCA = async (bidId: string) => {
    if (!selectedReqForBids) return;
    setIsHiring(true);
    try {
      await hireCA(selectedReqForBids, bidId);
      setBidsDialogOpen(false);
      setHireSuccessOpen(true);
    } catch (e) {
      // Error handled by context
    } finally {
      setIsHiring(false);
    }
  };

  const messages = chatRequestId ? clientMessages[chatRequestId] || [] : [];

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 transition-all shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-xl tracking-tight text-slate-900 leading-none">
                {"Tax"}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">
                  Consult
                </span>
                {"Guru"}
              </h1>
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-1">
                Client Portal
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 mr-2 text-sm bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center border border-slate-200 shadow-sm">
                <User className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              <span className="font-semibold text-slate-700">
                {currentUser.name}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-slate-600 border-slate-300 hover:bg-slate-100 hover:text-slate-900 h-10 rounded-lg font-medium"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full container mx-auto px-6 py-8 max-w-6xl pb-24">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="mb-8 bg-slate-200/60 p-1.5 rounded-xl inline-flex h-14 border border-slate-200">
            <TabsTrigger
              value="dashboard"
              className="px-6 h-full rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 font-bold text-slate-600"
            >
              <ClipboardCheck className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="px-6 h-full rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 font-bold text-slate-600"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Past Projects
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="dashboard"
            className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            {/* Searching indicator */}
            {searchingRequests.length > 0 && (
              <Card className="mb-8 border-indigo-200 bg-indigo-50 shadow-sm rounded-2xl overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse" />
                <CardContent className="py-8 text-center relative z-10">
                  <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
                  <h3 className="font-extrabold text-xl text-slate-900 mb-2">
                    Matching with Expert...
                  </h3>
                  <p className="text-slate-600 font-medium">
                    Please wait while we connect you with the best expert for
                    your{" "}
                    <span className="font-bold text-indigo-700">
                      {searchingRequests[0].serviceName}
                    </span>{" "}
                    request.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Active Workspaces */}
            {workspaceJobs.length > 0 && (
              <section className="mb-10">
                <h2 className="text-xl font-extrabold text-slate-900 mb-5 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-emerald-600" />
                  Secure Active Workspaces
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {workspaceJobs.map((req) => (
                    <Card
                      key={req.id}
                      className="bg-emerald-600 border-emerald-700 shadow-xl shadow-emerald-200/50 rounded-2xl relative overflow-hidden group"
                    >
                      <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                        <Shield className="w-32 h-32 text-white" />
                      </div>
                      <CardHeader className="pb-3 relative z-10">
                        <div className="flex justify-between items-start mb-2">
                          <CardTitle className="text-lg font-bold text-white leading-tight">
                            {req.serviceName}
                          </CardTitle>
                          <Badge className="bg-white text-emerald-700 border-none font-bold text-[10px] tracking-wider uppercase shrink-0 ml-2">
                            UNLOCKED
                          </Badge>
                        </div>
                        <CardDescription className="text-emerald-100 font-medium text-sm">
                          Workspace Active & Secure
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="relative z-10 pt-2">
                        <p className="text-sm text-emerald-50 mb-5 font-bold">
                          Expert Assigned: {req.caName || "Verified Expert"}
                        </p>
                        <Button
                          className="w-full bg-white hover:bg-slate-50 text-emerald-700 font-bold h-11 rounded-xl shadow-sm group-hover:shadow-md transition-all"
                          onClick={() => {
                            toast.success("Redirecting to Secure Workspace...");
                            navigate(`/workspace/${req.id}`);
                          }}
                        >
                          <Shield className="w-4 h-4 mr-2" />
                          Enter Secure Workspace
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Active Requests */}
            {activeRequests.length > 0 && (
              <section className="mb-10">
                <h2 className="text-xl font-extrabold text-slate-900 mb-5">
                  Your Active Requests
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {activeRequests.map((req) => (
                    <Card
                      key={req.id}
                      className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow rounded-2xl flex flex-col"
                    >
                      <CardHeader className="pb-4 border-b border-slate-50">
                        <div className="flex items-start justify-between mb-2">
                          <CardTitle className="text-base font-bold text-slate-900 leading-tight pr-2">
                            {req.serviceName}
                          </CardTitle>
                          <Badge
                            variant="secondary"
                            className={`text-[10px] px-2 py-0.5 uppercase tracking-wider font-bold shrink-0 ${
                              req.status === "pending_approval"
                                ? "bg-amber-100 text-amber-700"
                                : req.status === "awaiting_payment"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {req.status === "pending_approval"
                              ? "Processing"
                              : req.status === "awaiting_payment"
                                ? "Payment Due"
                                : "Active"}
                          </Badge>
                        </div>
                        <CardDescription className="text-xs font-medium text-slate-500">
                          {req.status === "awaiting_payment"
                            ? "Expert selected. Awaiting manual payment."
                            : "Expert team assigned"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-4 mt-auto flex flex-col">
                        <p className="text-sm text-slate-600 mb-5 line-clamp-2 leading-relaxed">
                          {req.description}
                        </p>
                        <div className="flex gap-2 mt-auto">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 h-10 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-colors"
                            onClick={() => handleViewBids(req.id)}
                          >
                            View Proposals
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 h-10 font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
                            onClick={() => openChat(req.id)}
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Admin
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Service Catalog */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-extrabold text-slate-900">
                  Available Services
                </h2>
                <Badge className="bg-indigo-100 text-indigo-700 border-none font-bold px-2 py-0.5 hidden sm:inline-flex">
                  Request Expert Assistance
                </Badge>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {SERVICES.map((service) => {
                  const IconComponent = iconMap[service.icon] || FileText;
                  return (
                    <Card
                      key={service.id}
                      className="cursor-pointer bg-white border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-indigo-300 transition-all rounded-2xl flex flex-col"
                      onClick={() => setSelectedService(service)}
                    >
                      <CardHeader className="pb-2">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4">
                          <IconComponent className="w-6 h-6 text-indigo-600" />
                        </div>
                        <CardTitle className="text-lg font-bold text-slate-900 leading-tight">
                          {service.name}
                        </CardTitle>
                        <CardDescription className="text-sm text-slate-500 leading-relaxed line-clamp-2 mt-1">
                          {service.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-4 mt-auto">
                        <div className="flex items-center justify-between text-sm bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                            Starting from
                          </span>
                          <span className="font-extrabold text-indigo-600 text-base">
                            ₹{service.defaultBudget.toLocaleString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          </TabsContent>

          {/* HISTORY TAB */}
          <TabsContent
            value="history"
            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="mb-8">
                <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
                  Project History
                </h2>
                <p className="text-slate-500 font-medium">
                  Review all your completed and archived projects in one place.
                </p>
              </div>

              {pastProjects.length === 0 ? (
                <Card className="border-dashed border-2 border-slate-200 bg-slate-50 rounded-2xl py-16 shadow-none">
                  <CardContent className="text-center">
                    <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mx-auto mb-4 border border-slate-200 shadow-sm">
                      <BookOpen className="w-10 h-10 text-slate-300" />
                    </div>
                    <p className="text-slate-600 font-bold text-lg">
                      You haven't archived any projects yet.
                    </p>
                    <p className="text-slate-500 font-medium text-sm mt-1">
                      Completed jobs will appear here.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {pastProjects.map((req) => (
                    <Card
                      key={req.id}
                      className="bg-slate-50/50 border-slate-200 opacity-90 grayscale-[0.3] hover:grayscale-0 hover:bg-white hover:shadow-md transition-all rounded-2xl"
                    >
                      <CardHeader className="pb-3 border-b border-slate-100">
                        <div className="flex items-center justify-between mb-3">
                          <Badge
                            variant="outline"
                            className="text-[10px] uppercase font-bold tracking-widest bg-white border-slate-300 text-slate-600"
                          >
                            Archived
                          </Badge>
                          <span className="text-[11px] font-mono font-medium text-slate-400">
                            {new Date(req.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <CardTitle className="text-base font-bold text-slate-900">
                          {req.serviceName}
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-500 line-clamp-1 mt-1">
                          {req.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="flex flex-col gap-2 p-4 bg-white rounded-xl border border-slate-200 text-sm shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 font-medium">
                              Budget:
                            </span>
                            <span className="font-bold text-slate-700">
                              ₹{req.budget?.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 font-medium">
                              Consultant:
                            </span>
                            <span className="font-bold text-indigo-600">
                              {req.caName || "Expert"}
                            </span>
                          </div>
                        </div>
                        <div className="mt-5 flex items-center justify-center gap-2 text-emerald-600 font-bold text-[11px] uppercase tracking-wider bg-emerald-50 py-2 rounded-lg border border-emerald-100">
                          <CheckCircle className="w-4 h-4" />
                          Work & Payout Completed
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </TabsContent>
        </Tabs>
      </main>

      {/* --- MINIMAL LIGHT FOOTER --- */}
      <footer className="mt-auto border-t border-slate-200 bg-white/60 backdrop-blur-md">
        <div className="container mx-auto px-6 py-6 max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500 font-medium">
            © {new Date().getFullYear()} TaxConsultGuru. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm font-semibold text-slate-500">
            <a
              href="/privacy"
              className="hover:text-indigo-600 transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="/terms"
              className="hover:text-indigo-600 transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="/contact"
              className="hover:text-indigo-600 transition-colors"
            >
              Support
            </a>
          </div>
        </div>
      </footer>

      {/* Service Request Dialog */}
      <Dialog
        open={!!selectedService}
        onOpenChange={() => setSelectedService(null)}
      >
        <DialogContent className="sm:max-w-[420px] bg-white border-slate-200 rounded-2xl p-6 shadow-2xl">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-xl font-extrabold text-slate-900">
              Request {selectedService?.name}
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-slate-500 mt-1">
              Tell us about your requirement and our expert team will take it
              from here.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 pt-4">
            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-indigo-900/60 uppercase tracking-wider">
                  Service
                </span>
                <span className="font-bold text-indigo-900">
                  {selectedService?.name}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-indigo-900/60 uppercase tracking-wider">
                  Est. Budget
                </span>
                <span className="font-extrabold text-indigo-700 text-lg">
                  ₹{selectedService?.defaultBudget.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                Requirement Details
              </label>
              <Textarea
                placeholder="Briefly describe what you need help with..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 rounded-xl resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                Expected Budget (₹)
              </label>
              <Input
                type="number"
                placeholder={`Suggested: ₹${selectedService?.defaultBudget}`}
                value={expectedBudget}
                onChange={(e) =>
                  setExpectedBudget(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                className="h-11 bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 rounded-xl font-medium"
              />
              <p className="text-[11px] font-medium text-slate-400 pl-1">
                Starting from ₹{selectedService?.defaultBudget.toLocaleString()}
              </p>
            </div>

            <Button
              onClick={handleRequestService}
              className="w-full h-12 font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md mt-2"
              disabled={!description.trim() || isRequesting}
            >
              {isRequesting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Find Expert"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bids Dialog */}
      <Dialog open={bidsDialogOpen} onOpenChange={setBidsDialogOpen}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] flex flex-col bg-white border-slate-200 rounded-2xl p-0 overflow-hidden shadow-2xl">
          <DialogHeader className="p-6 pb-4 border-b border-slate-100 bg-slate-50">
            <DialogTitle className="text-xl font-extrabold text-slate-900">
              Available Expert Proposals
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-slate-500 mt-1">
              Review proposals from our verified experts and hire the best fit.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 p-6 bg-slate-50/50">
            {isFetchingBids ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
                <p className="text-sm font-bold text-slate-600">
                  Fetching latest proposals...
                </p>
              </div>
            ) : bids.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mx-auto mb-4 border border-slate-200 shadow-sm">
                  <Calculator className="w-10 h-10 text-slate-300" />
                </div>
                <p className="text-slate-600 font-bold text-lg">
                  No proposals received yet.
                </p>
                <p className="text-sm font-medium text-slate-500 mt-1">
                  Our experts are currently reviewing your request.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {bids.map((bid) => (
                  <Card
                    key={bid.id}
                    className="bg-white border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all rounded-2xl"
                  >
                    <CardHeader className="pb-3 border-b border-slate-50">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                            <User className="w-6 h-6 text-indigo-600" />
                          </div>
                          <div>
                            <CardTitle className="text-base font-bold text-slate-900">
                              {bid.caId?.name || "Expert"}
                            </CardTitle>
                            <CardDescription className="text-xs font-semibold text-emerald-600 mt-0.5 bg-emerald-50 px-2 py-0.5 rounded inline-block">
                              {bid.caId?.experience} Yrs Experience
                            </CardDescription>
                          </div>
                        </div>
                        <div className="text-right bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-0.5">
                            Fee Quote
                          </p>
                          <p className="text-xl font-extrabold text-indigo-600">
                            ₹{bid.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-700 leading-relaxed mb-5 relative">
                        <span className="absolute -top-3 left-4 bg-slate-100 px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest rounded">
                          Message from Expert
                        </span>
                        <p className="italic">"{bid.proposalText}"</p>
                      </div>
                      <Button
                        className="w-full h-11 font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                        onClick={() => handleHireCA(bid.id)}
                        disabled={isHiring}
                      >
                        {isHiring ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <ClipboardCheck className="w-4 h-4 mr-2" />
                            Hire & Proceed to Payment
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Hire Success Modal */}
      <Dialog open={hireSuccessOpen} onOpenChange={setHireSuccessOpen}>
        <DialogContent className="sm:max-w-sm bg-white border-slate-200 rounded-3xl p-8 shadow-2xl text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-emerald-100 border-4 border-emerald-50 flex items-center justify-center mb-6">
            <ClipboardCheck className="w-10 h-10 text-emerald-600" />
          </div>
          <DialogTitle className="font-extrabold text-2xl text-slate-900 mb-2">
            Expert Hired!
          </DialogTitle>
          <DialogDescription className="text-sm font-medium text-slate-500 leading-relaxed mb-8">
            Excellent choice. Our support team will contact you shortly to
            complete the manual payment process and unlock your secure
            workspace.
          </DialogDescription>
          <Button
            onClick={() => setHireSuccessOpen(false)}
            className="w-full h-12 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white"
          >
            Got it, thanks!
          </Button>
        </DialogContent>
      </Dialog>

      {/* Masked Chat Dialog */}
      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="sm:max-w-md h-[600px] flex flex-col bg-white border-slate-200 rounded-2xl p-0 overflow-hidden gap-0 shadow-2xl">
          <DialogHeader className="border-b border-slate-100 px-6 py-4 bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm">
                <Headphones className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <DialogTitle className="text-base font-extrabold text-slate-900 leading-tight">
                  TCG Support Team
                </DialogTitle>
                <DialogDescription className="text-xs font-medium text-slate-500 mt-0.5">
                  Your dedicated platform assistance
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 p-5 bg-slate-50/50">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-white border border-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Headphones className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-600 font-bold">
                    Start a conversation.
                  </p>
                  <p className="text-sm font-medium text-slate-500 mt-1">
                    We're here to help coordinate with your expert.
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.senderRole === "client"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm ${
                        msg.senderRole === "client"
                          ? "bg-indigo-600 text-white rounded-br-none"
                          : "bg-white border border-slate-200 text-slate-800 rounded-bl-none"
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <p
                        className={`text-[10px] mt-1 text-right font-medium ${
                          msg.senderRole === "client"
                            ? "text-indigo-200"
                            : "text-slate-400"
                        }`}
                      >
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          <div className="border-t border-slate-100 p-4 bg-white flex gap-2">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="bg-slate-50 border-slate-200 h-11 rounded-xl focus-visible:ring-indigo-500"
            />
            <Button
              onClick={sendMessage}
              size="icon"
              className="h-11 w-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-sm shrink-0"
            >
              <Send className="w-4 h-4 text-white" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientDashboard;
