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
  Loader2, // Import Loader
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
    getSearchingRequests,
    caAcceptRequest,
    caMessages,
    addCAMessage,
  } = useMockBackend();

  const [isListening, setIsListening] = useState(true);
  const [incomingJob, setIncomingJob] = useState<ServiceRequest | null>(null);

  // Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatRequestId, setChatRequestId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");

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
      const searching = getSearchingRequests();
      if (searching.length > 0 && !incomingJob) {
        setIncomingJob(searching[0]);
        toast.info("New job opportunity!", {
          description: `${searching[0].serviceName} - ₹${searching[0].budget}`,
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isListening, getSearchingRequests, incomingJob]);

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
      (r.status === "pending_approval" || r.status === "active"),
  );

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleAcceptJob = () => {
    if (!incomingJob || !currentUser) return;
    caAcceptRequest(incomingJob.id, currentUser.id, currentUser.name);
    toast.success("Job accepted! Pending admin approval.");
    setIncomingJob(null);
  };

  const handleDeclineJob = () => {
    setIncomingJob(null);
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
                            : "bg-success/10 text-success"
                        }
                      >
                        {job.status === "pending_approval"
                          ? "Pending Approval"
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
                      disabled={job.status === "pending_approval"}
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
      </main>

      {/* Incoming Job Popup */}
      <Dialog open={!!incomingJob} onOpenChange={() => setIncomingJob(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-warning animate-pulse flex items-center justify-center">
                <Radio className="w-4 h-4 text-warning-foreground" />
              </div>
              New Opportunity!
            </DialogTitle>
            <DialogDescription>
              A new job is available. Be the first to accept!
            </DialogDescription>
          </DialogHeader>

          {incomingJob && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-secondary rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Service</span>
                  <Badge>{incomingJob.serviceName}</Badge>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Budget</span>
                  <span className="font-semibold text-primary">
                    ₹{incomingJob.budget.toLocaleString()}
                  </span>
                </div>
                <div className="pt-2 border-t border-border mt-2">
                  <span className="text-sm text-muted-foreground">
                    Description:
                  </span>
                  <p className="text-sm mt-1">{incomingJob.description}</p>
                </div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4" />
                <span>
                  Client details are private. You'll communicate via Admin Desk.
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleDeclineJob}
              className="flex-1"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Pass
            </Button>
            <Button onClick={handleAcceptJob} className="flex-1">
              <CheckCircle className="w-4 h-4 mr-2" />
              Accept
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
                      <p className="text-sm">{msg.content}</p>
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
