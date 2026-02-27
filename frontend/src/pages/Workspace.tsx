import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMockBackend } from "@/context/MockBackendContext";
import { useSocket } from "@/context/SocketContext";
import {
  Shield,
  FileArchive,
  Send,
  Paperclip,
  ArrowLeft,
  FileText,
  Download,
  MoreVertical,
  Search,
  MessageSquare,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Workspace = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, requests, isLoading, allMessages, sendMessageWrapper, completeRequest, approveWork, rejectWork, refreshData } = useMockBackend();
  const { socket } = useSocket();
  const [newMessage, setNewMessage] = useState("");
  const [isBlocked, setIsBlocked] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const request = requests.find((r) => r.id === id);
  const messages = allMessages.filter((m) => m.requestId === id);

  // Status-based Access Control
  useEffect(() => {
    if (!isLoading && request && !["active", "completed", "ready_for_payout", "payout_completed"].includes(request.status)) {
      toast.warning("This workspace is not available.");
      navigate(-1);
    }
  }, [request, navigate]);

  // Real-time Anti-Bypass Validation
  useEffect(() => {
    const contactRegex = /(\d{10}|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
    if (contactRegex.test(newMessage)) {
      setIsBlocked(true);
    } else {
      setIsBlocked(false);
    }
  }, [newMessage]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Socket Room Joining and Message Handling
  useEffect(() => {
    if (!socket || !id || isLoading) return;

    socket.emit("join", id);
    console.log(`🏠 [Workspace] Joined room: ${id}`);

    const handleReceiveMessage = (msg: any) => {
      if (msg.requestId === id) {
        console.log(`📩 [Workspace] Real-time message received in room ${id}`);
        refreshData();
      }
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.emit("leave", id);
      socket.off("receive_message", handleReceiveMessage);
      console.log(`🚪 [Workspace] Left room: ${id}`);
    };
  }, [socket, id, isLoading, refreshData]);

  if (isLoading || !request || !currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 dark:bg-background">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center mb-6">
            <Shield className="w-10 h-10 text-primary animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Establishing Secure Connection...
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">Validating workspace credentials</p>
        </div>
      </div>
    );
  }

  if (!["active", "completed", "ready_for_payout", "payout_completed"].includes(request.status)) return null;

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isBlocked) return;
    try {
      await sendMessageWrapper(id!, newMessage, currentUser.role);
      setNewMessage("");
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast.info(`Uploading ${file.name}... (Simulated)`);
      setTimeout(() => {
        sendMessageWrapper(id!, `Shared a file: ${file.name}`, currentUser.role, false, undefined, "https://example.com/file", file.name);
        toast.success("File shared successfully");
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50/50 dark:bg-[#09090b] overflow-hidden font-sans selection:bg-primary/20">
      {/* Premium Header */}
      <header className="border-b border-slate-200/60 dark:border-white/5 bg-white/70 dark:bg-black/40 backdrop-blur-xl py-3 px-6 flex items-center justify-between shadow-sm z-30 sticky top-0">
        <div className="flex items-center gap-5">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-heading text-lg font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
                {request.serviceName}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  E2E Encrypted
                </span>
                <span className="text-slate-300 dark:text-slate-700 mx-1">•</span>
                <span className="text-[12px] font-medium text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {request.status === 'active' ? 'In Progress' : 'Completed'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-3 mr-2 bg-slate-100/50 dark:bg-white/5 px-4 py-1.5 rounded-xl border border-slate-200/50 dark:border-white/5">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Client</span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {request.clientName || 'Loading...'}
              </span>
            </div>
            <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-primary/70 font-bold uppercase tracking-wider">Expert</span>
              {request.caName ? (
                <span className="text-xs font-semibold text-primary truncate max-w-[150px]">
                  {request.caName}
                </span>
              ) : (
                <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-200/50 uppercase">
                  Assigning...
                </span>
              )}
            </div>
          </div>
          
          {request.status === 'searching' && currentUser.role === 'admin' && (
            <Badge variant="outline" className="animate-pulse bg-amber-50 text-amber-600 border-amber-200">
              <Clock className="w-3.5 h-3.5 mr-1" />
              Waiting for Expert
            </Badge>
          )}

          <Button variant="outline" size="sm" className="hidden sm:flex gap-2 rounded-full border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm font-medium">
            <Users className="w-4 h-4 text-primary" />
            Participants
          </Button>
          <Separator orientation="vertical" className="h-6 opacity-30 mx-1" />
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100 dark:hover:bg-white/10">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Sleek Left Sidebar */}
        <aside className="hidden lg:flex w-[340px] border-r border-slate-200/60 dark:border-white/5 bg-white/50 dark:bg-[#09090b]/80 backdrop-blur-md flex-col overflow-hidden z-20 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)]">
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-8">
              {/* Project Brief */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-primary" />
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                    Project Brief
                  </h3>
                </div>
                
                <div className="p-5 rounded-2xl bg-white dark:bg-[#121214] border border-slate-200/60 dark:border-white/5 shadow-sm">
                  <div className="flex justify-between items-center text-[15px]">
                    <span className="text-muted-foreground font-medium">Budget</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      ₹{request.budget.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Secure Vault */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileArchive className="w-4 h-4 text-primary" />
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                      Secure Vault
                    </h3>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`w-6 h-6 rounded-full transition-colors ${isSearchOpen ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                  >
                    <Search className="w-3.5 h-3.5" />
                  </Button>
                </div>

                {isSearchOpen && (
                  <div className="animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        placeholder="Search workspace..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-9 pl-9 bg-white dark:bg-[#121214] border-slate-200/60 dark:border-white/5 rounded-xl text-sm"
                        autoFocus
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2.5">
                  {messages.filter(m => m.fileUrl).length === 0 ? (
                    <div className="text-center p-4 rounded-2xl border border-dashed border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 text-muted-foreground text-[13px]">
                      No documents securely vaulted yet.
                    </div>
                  ) : (
                    messages.filter(m => m.fileUrl).map((msg, i) => (
                      <div
                        key={i}
                        className="group flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-[#121214] border border-slate-200/60 dark:border-white/5 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer"
                        onClick={() => {
                          if (msg.fileUrl && msg.fileUrl !== 'https://example.com/file') {
                            window.open(msg.fileUrl, '_blank');
                          } else {
                            toast.info("This is a simulated file and cannot be downloaded.");
                          }
                        }}
                      >
                        <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-bold text-slate-800 dark:text-slate-200 truncate">{msg.fileName || "Secure_Document"}</div>
                          <div className="text-[11px] font-medium text-muted-foreground mt-0.5">
                            {msg.timestamp.toLocaleDateString()}
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                          <Download className="w-4 h-4 text-primary" />
                        </div>
                      </div>
                    ))
                  )}
                  
                  <Button 
                    variant="outline" 
                    className="w-full mt-2 h-auto py-4 border-dashed border-2 rounded-2xl border-slate-300 dark:border-slate-800 hover:border-primary hover:bg-primary/5 transition-all text-muted-foreground hover:text-primary gap-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="w-4 h-4" />
                    <span className="text-sm font-semibold">Upload Document</span>
                  </Button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileUpload}
                  />
                </div>
              </div>

              {/* Security Shield */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200/50 dark:border-amber-900/30">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-500">
                    Trust & Safety
                  </span>
                </div>
                <p className="text-[12px] text-amber-900/70 dark:text-amber-400/80 leading-relaxed font-medium">
                  Never share sensitive credentials or bank details. All transactions are protected via the platform escrow system.
                </p>
              </div>
            </div>
          </ScrollArea>
        </aside>

        {/* Right Area - Modern Chat Interface */}
        <div className="flex-1 flex flex-col relative bg-slate-50 dark:bg-[#0a0a0c]">
          {/* Subtle Pattern Background Instead of WhatsApp */}
          <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.02] pointer-events-none" 
               />

          {/* Soft Gradient Orbs */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />
          
          <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8 relative scroll-smooth z-10" ref={scrollRef}>
            <div className="max-w-3xl mx-auto space-y-6">
              
              <div className="flex justify-center mb-10">
                <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md border border-slate-200/60 dark:border-white/10 rounded-full px-5 py-2.5 flex items-center gap-2.5 shadow-sm">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span className="text-[12px] text-slate-600 dark:text-slate-300 font-medium">
                    {currentUser.role === 'admin' 
                      ? "Admin Overwatch Mode: Viewing session for quality assurance. Reply disabled." 
                      : "Messages are end-to-end encrypted. TCG cannot read or listen to them."
                    }
                  </span>
                </div>
              </div>

              {messages.length === 0 ? (
                <div className="text-center py-32 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="w-24 h-24 rounded-full bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 shadow-xl flex items-center justify-center mb-6 relative">
                    <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-20" />
                    <MessageSquare className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-3">
                    Secure Workspace Initiated
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                    This channel is strictly for project communication. Any files shared here are securely vaulted.
                  </p>
                </div>
              ) : (
                messages
                  .filter((msg) => !searchQuery || msg.text.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((msg, idx, filteredArr) => {
                  // `msg.senderId` is safely normalized to string by `MockBackendContext`'s `formatMessage`.
                  let isMe = false;
                  let isRightAligned = false;
                  
                  if (currentUser.role === 'admin') {
                    // Admin view: Client on the Right, CA on the Left. 
                    // Admin's own messages (if they somehow sent one) would be right aligned too.
                    isRightAligned = (msg.senderRole === 'client' || msg.senderRole === 'admin');
                  } else {
                    // Normal view: Own messages on the Right.
                    isMe = msg.senderId === currentUser.id;
                    isRightAligned = isMe;
                  }

                  const showDate = idx === 0 || filteredArr[idx-1].timestamp.toDateString() !== msg.timestamp.toDateString();
                  
                  // Grouping logic: only show name if it's the first message from this sender in a sequence
                  const showSenderLabel = (!isMe || currentUser.role === 'admin') && (idx === 0 || filteredArr[idx-1].senderId !== msg.senderId || showDate);

                  return (
                    <React.Fragment key={msg.id}>
                      {showDate && (
                        <div className="flex justify-center my-8">
                          <span className="bg-slate-100/80 dark:bg-white/5 backdrop-blur-sm text-slate-500 dark:text-slate-400 text-[11px] font-bold py-1.5 px-4 rounded-full uppercase tracking-widest border border-slate-200/50 dark:border-white/5">
                            {msg.timestamp.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      )}
                      
                      <div className={`flex flex-col ${isRightAligned ? "items-end" : "items-start"} mb-4 group`}>
                        {showSenderLabel && (
                           <div className="text-xs text-gray-400 font-medium pb-1 ml-1 flex items-center gap-1">
                             {msg.senderRole === "ca" ? "CA" : msg.senderRole === "client" ? "Client" : "Admin"} - {msg.senderName}
                           </div>
                        )}
                        <div className={`relative max-w-[85%] md:max-w-[70%] px-4 py-3 transition-all ${
                          isRightAligned 
                            ? "bg-blue-500 text-white rounded-2xl rounded-tr-sm"
                            : "bg-white border border-slate-100 text-slate-800 rounded-2xl rounded-tl-sm dark:bg-[#1a1c23] dark:border-white/5 dark:text-slate-200"
                        }`}>
                          <div className="text-[14.5px] leading-relaxed break-words whitespace-pre-wrap">
                            {msg.text}
                          </div>
                          
                          {msg.fileUrl && (
                            <div className={`mt-3 p-3 rounded-xl flex items-center gap-3 border ${
                              isRightAligned ? "bg-white/10 border-white/5" : "bg-slate-50 dark:bg-black/20 border-slate-100 dark:border-white/5"
                            }`}>
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                isRightAligned ? "bg-white/20 text-white" : "bg-blue-50 text-blue-500 dark:bg-blue-500/10 dark:text-blue-400"
                              }`}>
                                <FileArchive className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-[13px] font-bold truncate">{msg.fileName || "Shared Document"}</div>
                                <div className={`text-[10px] uppercase font-bold tracking-wider mt-0.5 ${
                                  isRightAligned ? "text-white/70" : "text-slate-500"
                                }`}>
                                  FILE
                                </div>
                              </div>
                              {currentUser.role === 'admin' ? (
                                <div className="text-[10px] bg-black/5 px-2 py-1 rounded border border-dashed italic opacity-70">
                                  Logged
                                </div>
                              ) : (
                                <Button size="icon" variant={isRightAligned ? "ghost" : "outline"} className={`w-8 h-8 rounded-full ${
                                  isRightAligned ? "hover:bg-white/20 text-white" : "hover:text-blue-500"
                                }`}>
                                  <Download className="w-3.5 h-3.5" />
                                </Button>
                              )}
                            </div>
                          )}
                          
                          <div className={`text-[10px] font-medium mt-1.5 flex justify-end items-center gap-1.5 ${
                            isRightAligned ? "text-blue-100" : "text-slate-400"
                          }`}>
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })
              )}
            </div>
          </div>

          {/* Action Modals - CA Completions */}
          {currentUser.role === 'ca' && request.status === 'active' && (
            <div className="p-5 bg-white/80 dark:bg-black/50 backdrop-blur-md border-t border-slate-200/60 dark:border-white/5 z-20">
              <div className="max-w-3xl mx-auto flex items-center justify-between bg-blue-50 border border-blue-100 rounded-2xl p-4">
                <div>
                  <h4 className="font-bold text-blue-800 text-sm">Have you finished the deliverables?</h4>
                  <p className="text-xs text-blue-600/80 mt-0.5">Marking as completed will send the project for client approval.</p>
                </div>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-full shadow-sm transition-colors"
                  onClick={() => {
                    if(confirm("Are you sure you have completed the work? This will notify the client for approval.")) {
                      completeRequest(id!);
                    }
                  }}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as Completed
                </Button>
              </div>
            </div>
          )}

          {/* Action Modals - Client Approval */}
          {currentUser.role === 'client' && request.status === 'completed' && (
            <div className="p-6 bg-white/80 dark:bg-black/50 backdrop-blur-md border-t border-slate-200/60 dark:border-white/5 z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
              <div className="max-w-3xl mx-auto bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-3xl p-6 text-center flex flex-col items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">Work Ready for Review</h3>
                  <p className="text-sm text-blue-700/80 dark:text-blue-300/80 max-w-md mx-auto mt-1">
                    Please review the documents and correspondence. Once satisfied, approve the work to release the payment.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 h-12 rounded-full shadow-md transition-all"
                    onClick={() => {
                      if(confirm("By approving this work, you confirm satisfaction. The project will move to the payout stage.")) {
                        approveWork(id!);
                      }
                    }}
                  >
                     Approve & Release Payment
                  </Button>
                  <Button 
                    variant="outline"
                    className="border-gray-200 text-gray-700 hover:bg-gray-50 font-bold px-6 h-12 rounded-full transition-all bg-white shadow-sm"
                    onClick={() => {
                      if(confirm("Are you sure you want to request changes? This will move the project back to 'Active' status.")) {
                        rejectWork(id!);
                      }
                    }}
                  >
                     Request Changes
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Input Area */}
          {(currentUser.role !== 'admin' && !(currentUser.role === 'client' && request.status === 'completed')) && (
            <div className="p-4 md:p-6 bg-slate-50 dark:bg-[#121214]/80 backdrop-blur-xl border-t border-slate-200/60 dark:border-white/5 z-20">
              <div className="max-w-4xl mx-auto flex flex-col gap-3">
                
                {isBlocked && (
                  <div className="flex items-center gap-2 text-destructive text-[12px] font-bold bg-destructive/10 px-3 py-2 rounded-xl border border-destructive/20 animate-in slide-in-from-bottom-2">
                    <AlertTriangle className="w-4 h-4 ml-1" />
                    Security Policy: Please remove direct contact details to send your message.
                  </div>
                )}
                
                <div className="flex items-end gap-3">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-12 w-12 rounded-full shrink-0 border-gray-200 bg-white hover:bg-gray-50 text-gray-500 shadow-sm transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="w-5 h-5" />
                  </Button>
                  
                  <div className="flex-1 relative flex items-center">
                    <Input
                      className="rounded-full bg-white border-gray-200 px-6 h-12 shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 text-[15px] w-full transition-all"
                      placeholder="Type your message securely..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    />
                  </div>
                  
                  <Button 
                    size="icon" 
                    className={`h-12 w-12 rounded-full shrink-0 transition-colors p-3 ${
                      isBlocked || !newMessage.trim() 
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-200 shadow-sm" 
                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                    }`}
                    onClick={handleSendMessage}
                    disabled={isBlocked || !newMessage.trim()}
                  >
                    <Send className="w-5 h-5 ml-0.5" />
                  </Button>
                </div>
                
                <div className="text-center">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest flex justify-center items-center gap-1.5 opacity-70">
                    <Shield className="w-3 h-3" /> Encrypted Transmission
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Admin Read-Only Notice */}
          {currentUser.role === 'admin' && (
            <div className="p-4 bg-slate-100/50 dark:bg-white/5 backdrop-blur-md border-t border-slate-200 dark:border-white/10 text-center">
              <p className="text-xs font-bold tracking-widest text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
                <Shield className="w-4 h-4" />
                ADMIN OVERWATCH • READ-ONLY ACCESS
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Workspace;

