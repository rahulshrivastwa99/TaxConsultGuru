import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  LogOut,
  User,
  Radio,
  WifiOff,
  MessageCircle,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  Shield,
  Loader2,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useMockBackend,
  SERVICES,
  ServiceRequest,
} from "@/context/MockBackendContext";
import { toast } from "sonner";

const CADashboard = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    isLoading, // 1. Get Loading State
    logout,
    requests,
    getLiveJobs,
    placeBid,
    caMessages,
    addCAMessage,
  } = useMockBackend();

  const [isListening, setIsListening] = useState(true);
  const [seenJobIds, setSeenJobIds] = useState<Set<string>>(new Set());

  // Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatRequestId, setChatRequestId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");

  // Bidding State
  const [selectedJobToBid, setSelectedJobToBid] = useState<ServiceRequest | null>(null);
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const [bidAmount, setBidAmount] = useState("");
  const [proposalText, setProposalText] = useState("");
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);

  useEffect(() => {
    // 2. Wait for loading to finish before checking user
    if (!isLoading) {
      if (!currentUser || currentUser.role !== "ca") {
        navigate("/");
      }
    }
  }, [currentUser, isLoading, navigate]);

  useEffect(() => {
    if (!isListening) return;

    const interval = setInterval(() => {
      const live = getLiveJobs();
      const newJobs = live.filter(job => !seenJobIds.has(job.id));
      
      if (newJobs.length > 0) {
        const nextJob = newJobs[0];
        setSeenJobIds(prev => new Set(prev).add(nextJob.id));
        
        toast.info("New Job Opportunity!", {
          description: `${nextJob.serviceName} - ₹${nextJob.budget.toLocaleString()}`,
          action: {
            label: "Bid Now",
            onClick: () => handleOpenBidDialog(nextJob),
          },
          duration: 10000,
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isListening, getLiveJobs, seenJobIds]);

  // 3. Show Spinner while loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // 4. Safety Check
  if (!currentUser || currentUser.role !== "ca") return null;

  // Jobs this CA has accepted (pending approval or active)
  const myJobs = requests.filter(
    (r) =>
      r.caId === currentUser.id &&
      (r.status === "pending_approval" || r.status === "active" || r.status === "awaiting_payment"),
  );

  const workspaceJobs = requests.filter((r) => r.caId === currentUser.id && r.status === "active" && r.isWorkspaceUnlocked === true);
  const pastJobs = requests.filter((r) => r.caId === currentUser.id && r.isArchived === true);

  // Jobs available for bidding (not accepted by any CA, not completed, not cancelled)
  const availableJobs = requests.filter(
    (r) =>
      !r.caId &&
      r.status !== "completed" &&
      r.status !== "cancelled" &&
      r.status !== "pending_approval", // Exclude jobs already bid on and pending approval
  );

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleOpenBidDialog = (job: ServiceRequest) => {
    setBidAmount(job.budget.toString());
    setSelectedJobToBid(job);
    setBidDialogOpen(true);
  };

  const handleSubmitBid = async () => {
    if (!selectedJobToBid || !currentUser || !bidAmount || !proposalText) {
      toast.error("Please fill all fields");
      return;
    }

    setIsSubmittingBid(true);
    try {
      await placeBid({
        requestId: selectedJobToBid?.id || "",
        price: Number(bidAmount),
        proposalText: proposalText,
      });
      // Mark as seen so it doesn't pop up again
      setSeenJobIds((prev) => new Set(prev).add(selectedJobToBid.id));
      setBidDialogOpen(false);
      setSelectedJobToBid(null);
      setBidAmount("");
      setProposalText("");
    } catch (e) {
      // Error handled by context toast
    } finally {
      setIsSubmittingBid(false);
    }
  };


  const openChat = (requestId: string) => {
    setChatRequestId(requestId);
    setChatOpen(true);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !chatRequestId || !currentUser) return;
    addCAMessage(
      chatRequestId,
      currentUser.id,
      currentUser.name,
      "ca",
      newMessage,
    );
    setNewMessage("");
  };

  const messages = chatRequestId ? caMessages[chatRequestId] || [] : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-lg text-foreground">
                TaxConsultGuru
              </h1>
              <p className="text-xs text-muted-foreground">CA Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">{currentUser.name}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="jobs" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="jobs" className="px-8 flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              My Work
            </TabsTrigger>
            <TabsTrigger value="history" className="px-8 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Job History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-10">
            {!currentUser.isVerified && (
          <Card className="mb-8 border-warning/50 bg-warning/5">
            <CardContent className="py-4 flex items-center gap-3">
              <Shield className="w-5 h-5 text-warning" />
              <div className="flex-1">
                <p className="text-sm font-medium text-warning-foreground">
                  Your account is pending verification
                </p>
                <p className="text-xs text-muted-foreground">
                  Your account is pending verification. You will see jobs once approved by Admin.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Listening Toggle */}
        <Card
          className={`mb-8 ${
            isListening ? "border-success/50 bg-success/5" : "border-muted"
          }`}
        >
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center ${
                      isListening ? "bg-success" : "bg-muted"
                    }`}
                  >
                    {isListening ? (
                      <Radio className="w-7 h-7 text-success-foreground" />
                    ) : (
                      <WifiOff className="w-7 h-7 text-muted-foreground" />
                    )}
                  </div>
                  {isListening && (
                    <div className="absolute inset-0 rounded-full bg-success pulse-ring" />
                  )}
                </div>
                <div>
                  <h3 className="font-heading text-xl font-semibold">
                    {isListening ? "Listening for Jobs" : "Not Available"}
                  </h3>
                  <p className="text-muted-foreground">
                    {isListening
                      ? "You will receive job opportunities in real-time"
                      : "Toggle to start receiving job requests"}
                  </p>
                </div>
              </div>
              <Button
                variant={isListening ? "outline" : "default"}
                size="lg"
                onClick={() => setIsListening(!isListening)}
              >
                {isListening ? "Go Offline" : "Go Online"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Step 4: Active Workspaces */}
        {workspaceJobs.length > 0 && (
          <section className="mb-10">
            <h2 className="font-heading text-xl font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Secure Client Workspaces
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {workspaceJobs.map((job) => (
                <Card key={job.id} className="border-primary bg-primary/5 shadow-md">
                  <CardHeader className="pb-3 text-primary">
                    <CardTitle className="text-lg flex items-center justify-between">
                      {job.serviceName}
                      <Badge className="bg-primary text-white text-[10px]">LOCKED CHAT</Badge>
                    </CardTitle>
                    <CardDescription className="text-primary/70 font-medium">Client: {job.clientName}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 font-bold italic">
                      "Workspace unlocked by admin after payment"
                    </p>
                    <Button 
                      className="w-full bg-primary hover:bg-primary/90 text-white font-bold"
                      onClick={() => {
                        toast.success("Entering Secure Client Workspace...");
                        navigate(`/workspace/${job.id}`);
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

        {/* Active Jobs */}
        <section className="mb-10">
          <h2 className="font-heading text-xl font-semibold mb-4">
            My Jobs ({myJobs.length})
          </h2>
          {myJobs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No active jobs.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Stay online to receive new opportunities.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {myJobs.map((job) => (
                <Card key={job.id} className="border-primary/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {job.serviceName}
                      </CardTitle>
                      <Badge
                        variant="secondary"
                        className={
                          job.status === "pending_approval"
                            ? "bg-warning/10 text-warning"
                            : job.status === "awaiting_payment"
                            ? "bg-blue-500/10 text-blue-500"
                            : "bg-success/10 text-success"
                        }
                      >
                        {job.status === "pending_approval"
                          ? "Pending Approval"
                          : job.status === "awaiting_payment"
                          ? "Awaiting Payment"
                          : "Active"}
                      </Badge>
                    </div>
                    <CardDescription>
                      Budget:{" "}
                      <span className="font-semibold text-foreground">
                        ₹{job.budget.toLocaleString()}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {job.description}
                    </p>
                    <Button
                      size="sm"
                      onClick={() => openChat(job.id)}
                      disabled={job.status === "pending_approval" || !currentUser.isVerified}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Admin Desk
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Find New Jobs Section */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-xl font-semibold">
              Find New Jobs
            </h2>
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
              Live Opportunities
            </Badge>
          </div>
          
          {availableJobs.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-10 text-center">
                <p className="text-muted-foreground">No new jobs available at the moment.</p>
                <p className="text-xs text-muted-foreground mt-1">We'll notify you as soon as a client posts a request.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {availableJobs.map((job) => (
                <Card key={job.id} className="border-primary/20 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base text-primary">{job.serviceName}</CardTitle>
                      <span className="text-xs font-bold text-success">₹{(job.budget || 0).toLocaleString()}</span>
                    </div>
                    <CardDescription className="text-xs line-clamp-1">{job.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <Button 
                      className="w-full text-xs h-8" 
                      variant="outline"
                      onClick={() => handleOpenBidDialog(job)}
                    >
                      Apply / Bid
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Services info */}
        <section>
          <h2 className="font-heading text-xl font-semibold mb-4">
            Services You Can Accept
          </h2>
          <div className="flex flex-wrap gap-2">
            {SERVICES.map((service) => (
              <Badge key={service.id} variant="secondary" className="px-4 py-2">
                {service.name}
              </Badge>
            ))}
          </div>
        </section>
      </TabsContent>

          <TabsContent value="history">
            <section>
              <h2 className="font-heading text-2xl font-semibold mb-2 text-primary">
                Earnings & Project History
              </h2>
              <p className="text-muted-foreground mb-6">
                Review your past successes and total earnings.
              </p>

              {pastJobs.length === 0 ? (
                <Card className="border-dashed py-12">
                  <CardContent className="text-center">
                    <Briefcase className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                    <p className="text-muted-foreground italic text-sm">You haven't completed or archived any jobs yet.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {pastJobs.map((job) => {
                    const commission = (job.budget || 0) * 0.1;
                    const netEarnings = (job.budget || 0) - commission;
                    
                    return (
                      <Card key={job.id} className="border-slate-200 bg-slate-50/50 hover:bg-white transition-all shadow-sm">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded">PAYOUT RELEASED</span>
                            <span className="text-[10px] text-muted-foreground">{new Date(job.updatedAt).toLocaleDateString()}</span>
                          </div>
                          <CardTitle className="text-lg text-slate-800">{job.serviceName}</CardTitle>
                          <CardDescription className="text-xs">Client: {job.clientName}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 bg-white/80 p-3 rounded-lg border border-slate-100 text-xs shadow-inner">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Gross Amount:</span>
                              <span className="font-semibold">₹{job.budget?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-pink-600">
                              <span>Admin Fee (10%):</span>
                              <span>-₹{commission.toLocaleString()}</span>
                            </div>
                            <div className="h-px bg-slate-100 my-1" />
                            <div className="flex justify-between font-bold text-success text-sm">
                              <span>Your Earnings:</span>
                              <span>₹{netEarnings.toLocaleString()}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </section>
          </TabsContent>
        </Tabs>
      </main>

      {/* Actual Bidding Modal */}
      <Dialog open={bidDialogOpen} onOpenChange={setBidDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Place Your Bid</DialogTitle>
            <DialogDescription>
              Submit your best price and a short proposal to the client.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="price" className="text-sm font-medium">
                Your Quote (₹)
              </label>
              <Input
                id="price"
                type="number"
                placeholder="Enter amount"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="proposal" className="text-sm font-medium">
                Short Proposal
              </label>
              <ScrollArea className="h-32 w-full rounded-md border">
                <textarea
                  id="proposal"
                  className="flex min-h-[80px] w-full rounded-md bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Tell the client why you are the best fit..."
                  value={proposalText}
                  onChange={(e) => setProposalText(e.target.value)}
                />
              </ScrollArea>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBidDialogOpen(false)}
              disabled={isSubmittingBid}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitBid} disabled={isSubmittingBid}>
              {isSubmittingBid ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting
                </>
              ) : (
                "Submit Bid"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CA Chat Dialog - Talks to "TCG Admin Desk" */}
      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="sm:max-w-lg h-[600px] flex flex-col">
          <DialogHeader className="border-b pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <DialogTitle className="font-heading">
                  TCG Admin Desk
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Report progress & get instructions
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Report your progress here.</p>
                  <p className="text-sm mt-1">
                    Admin will relay updates to the client.
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.senderRole === "ca" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        msg.senderRole === "ca"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-foreground"
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <p className="text-xs opacity-70 mt-1">
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

          <div className="border-t pt-4 flex gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <Button onClick={sendMessage} size="icon">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CADashboard;
