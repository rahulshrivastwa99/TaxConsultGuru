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
  } = useMockBackend();

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
  const [selectedReqForBids, setSelectedReqForBids] = useState<string | null>(null);
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

  // 3. Show Spinner while loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
  const workspaceJobs = myRequests.filter((r) => r.status === "active" && r.isWorkspaceUnlocked === true);
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-lg text-foreground">
                TaxConsultGuru
              </h1>
              <p className="text-xs text-muted-foreground">Client Portal</p>
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
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="dashboard" className="px-8 flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="history" className="px-8 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Past Projects
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-10">
            {/* Searching indicator */}
        {searchingRequests.length > 0 && (
          <Card className="mb-8 border-primary/30 bg-primary/5">
            <CardContent className="py-8 text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <h3 className="font-heading text-xl font-semibold mb-2">
                Matching with Expert...
              </h3>
              <p className="text-muted-foreground">
                Please wait while we connect you with the best expert for your{" "}
                {searchingRequests[0].serviceName} request.
              </p>
            </CardContent>
          </Card>
        )}
        
        {/* Step 4: Active Workspaces */}
        {workspaceJobs.length > 0 && (
          <section className="mb-10">
            <h2 className="font-heading text-xl font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-success" />
              Secure Active Workspaces
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {workspaceJobs.map((req) => (
                <Card key={req.id} className="border-success bg-success/5 shadow-md">
                  <CardHeader className="pb-3 text-success">
                    <CardTitle className="text-lg flex items-center justify-between">
                      {req.serviceName}
                      <Badge className="bg-success text-white">UNLOCKED</Badge>
                    </CardTitle>
                    <CardDescription className="text-success/70 font-medium">Workspace Active & Secure</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 font-bold">
                      Expert Assigned: {req.caName || "Verified Expert"}
                    </p>
                    <Button 
                      className="w-full bg-success hover:bg-success/90 text-white font-bold"
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
            <h2 className="font-heading text-xl font-semibold mb-4">
              Your Active Requests
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeRequests.map((req) => (
                <Card key={req.id} className="border-success/30 bg-success/5">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {req.serviceName}
                      </CardTitle>
                      <Badge
                        variant="secondary"
                        className="bg-success text-success-foreground"
                      >
                        {req.status === "pending_approval"
                          ? "Processing"
                          : "Active"}
                      </Badge>
                    </div>
                    <CardDescription>Expert team assigned</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {req.description}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewBids(req.id)}
                      >
                        View Proposals
                      </Button>
                      <Button size="sm" onClick={() => openChat(req.id)}>
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

        {/* Bids Dialog */}
        <Dialog open={bidsDialogOpen} onOpenChange={setBidsDialogOpen}>
          <DialogContent className="sm:max-w-xl max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Available Expert Bids</DialogTitle>
              <DialogDescription>
                Review proposals from our verified CAs and hire the one that fits your needs.
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="flex-1 mt-4 pr-4">
              {isFetchingBids ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                  <p className="text-sm text-muted-foreground">Fetching latest bids...</p>
                </div>
              ) : bids.length === 0 ? (
                <div className="text-center py-12">
                  <Calculator className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p className="text-muted-foreground">No bids received yet.</p>
                  <p className="text-xs text-muted-foreground mt-1">Our experts are reviewing your request.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bids.map((bid) => (
                    <Card key={bid.id} className="border-border/50 hover:border-primary/30 transition-colors">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-sm font-bold">{bid.caId?.name || "Expert CA"}</CardTitle>
                              <CardDescription className="text-xs">{bid.caId?.experience} years experience</CardDescription>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-primary">₹{bid.price.toLocaleString()}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Total Fee</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-muted/30 p-3 rounded-lg border border-dashed text-sm text-muted-foreground mb-4">
                          <p className="italic">"{bid.proposalText}"</p>
                        </div>
                        <Button 
                          className="w-full" 
                          onClick={() => handleHireCA(bid.id)}
                          disabled={isHiring}
                        >
                          {isHiring ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Calculator className="w-4 h-4 mr-2" />}
                          Hire Now
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
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="mx-auto w-12 h-12 rounded-full bg-success/20 flex items-center justify-center mb-4">
                <ClipboardCheck className="w-6 h-6 text-success" />
              </div>
              <DialogTitle className="text-center font-heading text-xl">
                Hired!
              </DialogTitle>
              <DialogDescription className="text-center text-base py-2">
                Our support team will contact you shortly for payment.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center pt-4">
              <Button onClick={() => setHireSuccessOpen(false)} className="px-10">
                Great!
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Service Catalog */}
        <section>
          <h2 className="font-heading text-2xl font-semibold mb-2">
            Available Services
          </h2>
          <p className="text-muted-foreground mb-6">
            Select a service to request expert assistance
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service) => {
              const IconComponent = iconMap[service.icon] || FileText;
              return (
                <Card
                  key={service.id}
                  className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
                  onClick={() => setSelectedService(service)}
                >
                  <CardHeader className="pb-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Starting from
                      </span>
                      <span className="font-semibold text-primary">
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

          <TabsContent value="history">
            <section>
              <h2 className="font-heading text-2xl font-semibold mb-2">
                Project History
              </h2>
              <p className="text-muted-foreground mb-6">
                All your completed and archived projects
              </p>

              {pastProjects.length === 0 ? (
                <Card className="border-dashed py-12">
                  <CardContent className="text-center">
                    <BookOpen className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                    <p className="text-muted-foreground italic text-sm">You haven't archived any projects yet.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {pastProjects.map((req) => (
                    <Card key={req.id} className="bg-muted/30 border-muted opacity-90 grayscale-[0.5] hover:grayscale-0 transition-all">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">
                            Archived
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(req.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <CardTitle className="text-lg">{req.serviceName}</CardTitle>
                        <CardDescription className="line-clamp-1">{req.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col gap-2 p-3 bg-background/50 rounded-lg border border-dashed text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Budget:</span>
                            <span className="font-bold">₹{req.budget?.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Consultant:</span>
                            <span className="font-bold text-primary">{req.caName || "Expert"}</span>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-dashed flex items-center gap-2 text-success font-bold text-[10px] uppercase">
                          <CheckCircle className="w-3 h-3" />
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

      {/* Service Request Dialog */}
      <Dialog
        open={!!selectedService}
        onOpenChange={() => setSelectedService(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">
              Request {selectedService?.name}
            </DialogTitle>
            <DialogDescription>
              Tell us about your requirement and our expert team will take it
              from here.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="p-4 bg-secondary rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Service</span>
                <span className="font-medium">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Est. Budget
                </span>
                <span className="font-semibold text-primary">
                  ₹{selectedService?.defaultBudget.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Requirement Details
              </label>
              <Textarea
                placeholder="Briefly describe what you need help with (e.g., Company Registration style requirements)..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Expected Budget (₹)
              </label>
              <Input
                type="number"
                placeholder={`Suggested: ₹${selectedService?.defaultBudget}`}
                value={expectedBudget}
                onChange={(e) => setExpectedBudget(e.target.value === "" ? "" : Number(e.target.value))}
              />
              <p className="text-[10px] text-muted-foreground">
                Starting from ₹{selectedService?.defaultBudget.toLocaleString()}
              </p>
            </div>
            <Button
              onClick={handleRequestService}
              className="w-full"
              disabled={!description.trim() || isRequesting}
            >
              {isRequesting && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Find Expert
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Masked Chat Dialog */}
      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="sm:max-w-lg h-[600px] flex flex-col">
          <DialogHeader className="border-b pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Headphones className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <DialogTitle className="font-heading">
                  TCG Expert Team
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Your dedicated support team
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Headphones className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Start a conversation with our expert team.</p>
                  <p className="text-sm mt-1">We're here to help!</p>
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
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        msg.senderRole === "client"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-foreground"
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {/* Safe date formatting now */}
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

export default ClientDashboard;
