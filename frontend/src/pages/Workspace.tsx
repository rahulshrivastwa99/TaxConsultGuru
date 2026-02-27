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

    // Join the specific room for this request
    socket.emit("join", id);
    console.log(`🏠 [Workspace] Joined room: ${id}`);

    const handleReceiveMessage = (msg: any) => {
      // Though MockBackendContext handles global messages, 
      // we refresh here to ensure local component state is perfectly in sync
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
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <div className="animate-pulse flex flex-col items-center">
          <Shield className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold">Loading Secure Workspace...</h2>
        </div>
      </div>
    );
  }

  // Double check status after loading
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
      // In a real app, you'd upload to S3/Cloudinary and then call sendMessageWrapper with fileUrl
      setTimeout(() => {
        sendMessageWrapper(id!, `Shared a file: ${file.name}`, currentUser.role, false, undefined, "https://example.com/file", file.name);
        toast.success("File shared successfully");
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#f0f2f5] dark:bg-background overflow-hidden font-sans">
      {/* Top Header */}
      <header className="border-b bg-card py-3 px-6 flex items-center justify-between shadow-sm z-20">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-md">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-heading text-base font-bold leading-tight">
                {request.serviceName}
              </h1>
              <p className="text-[10px] text-success font-bold flex items-center gap-1 uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                Active • End-to-End Encrypted
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end mr-4">
            <span className="text-[10px] text-muted-foreground uppercase font-bold">Project ID</span>
            <span className="text-xs font-mono">{id?.substring(0, 12)}</span>
          </div>
          <Button variant="outline" size="sm" className="hidden sm:flex gap-2 rounded-full border-primary/20 hover:bg-primary/5">
            <Users className="w-4 h-4" />
            Participants
          </Button>
          <Separator orientation="vertical" className="h-8 mx-2" />
          <Button variant="ghost" size="icon" className="rounded-full">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Project Context */}
        <aside className="hidden lg:flex w-80 border-r bg-white dark:bg-card flex-col overflow-hidden z-10 shadow-[4px_0_10px_-5px_rgba(0,0,0,0.05)]">
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4">
                  Project Details
                </h3>
                <Card className="border-none bg-muted/30 shadow-none rounded-2xl overflow-hidden">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-xs font-bold uppercase text-primary">Requirement</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-foreground/80 leading-relaxed italic">
                      "{request.description}"
                    </p>
                    <div className="mt-4 pt-4 border-t border-dashed space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Budget</span>
                        <Badge variant="secondary" className="font-bold bg-primary/10 text-primary">₹{request.budget.toLocaleString()}</Badge>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Expert</span>
                        <span className="font-bold">{request.caName || "Analyzing..."}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4 flex items-center justify-between">
                  Secure Documents
                  <Search className="w-3.5 h-3.5 text-muted-foreground cursor-pointer hover:text-primary transition-colors" />
                </h3>
                <div className="space-y-3">
                  {[
                    { name: "Requirement_Brief.pdf", size: "1.2 MB" },
                    { name: "Tax_Docs_2025.zip", size: "4.5 MB" },
                    { name: "Aadhar_PAN.pdf", size: "850 KB" },
                  ].map((file, i) => (
                    <div
                      key={i}
                      className="group flex items-center gap-3 p-3 rounded-xl bg-muted/20 hover:bg-primary/5 border border-transparent hover:border-primary/20 transition-all cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-lg bg-white dark:bg-background flex items-center justify-center shadow-sm">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium truncate">{file.name}</div>
                        <div className="text-[10px] text-muted-foreground">{file.size} • Finalised</div>
                      </div>
                      <Download className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    className="w-full mt-3 border-dashed border-2 rounded-xl py-6 flex flex-col gap-1 hover:bg-primary/5 hover:border-primary transition-all"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="w-5 h-5 mb-1" />
                    <span className="text-xs font-bold uppercase tracking-tighter">Share New Document</span>
                  </Button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileUpload}
                  />
                </div>
              </div>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-2xl border border-yellow-200 dark:border-yellow-900/30">
                <div className="flex items-center gap-2 mb-2 text-yellow-700 dark:text-yellow-500">
                  <Shield className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase">Compliance Alert</span>
                </div>
                <p className="text-[11px] text-yellow-800/80 dark:text-yellow-400/80 leading-snug">
                  To ensure payment security, never share bank details directly. All transactions are protected via TCG Escrow.
                </p>
              </div>
            </div>
          </ScrollArea>
        </aside>

        {/* Right Area - Chat */}
        <div className="flex-1 flex flex-col relative bg-[#e5ddd5] dark:bg-[#0b141a]">
          {/* WhatsApp Style Wallpaper Overlay */}
          <div className="absolute inset-0 opacity-[0.06] dark:opacity-[0.03] pointer-events-none" 
               style={{ backgroundImage: "url('https://w0.peakpx.com/wallpaper/580/543/HD-wallpaper-whatsapp-background-whatsapp-texture.jpg')", backgroundSize: "400px" }} />
          
          <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 relative scroll-smooth" ref={scrollRef}>
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Security Header */}
              <div className="flex justify-center mb-8">
                <div className="bg-[#fff9c4] dark:bg-[#182229] border border-yellow-200/50 dark:border-none rounded-lg px-4 py-2 flex items-center gap-2 shadow-sm max-w-sm">
                  <Shield className="w-3 h-3 text-yellow-700 dark:text-yellow-500" />
                  <span className="text-[11px] text-yellow-800 dark:text-yellow-500/80 text-center font-medium">
                    {currentUser.role === 'admin' 
                      ? "Admin Overwatch Mode: Viewing session for quality assurance. Reply disabled." 
                      : "Messages are end-to-end encrypted. No one outside of this chat, not even TCG, can read them."
                    }
                  </span>
                </div>
              </div>

              {messages.length === 0 ? (
                <div className="text-center py-20 opacity-30 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                    <MessageSquare className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Secure Workspace Active</h3>
                  <p className="text-sm max-w-xs mx-auto">Collaboration is ready. Start the conversation with your tax expert below.</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.senderId === currentUser.id;
                  const showDate = idx === 0 || messages[idx-1].timestamp.toDateString() !== msg.timestamp.toDateString();
                  
                  return (
                    <React.Fragment key={msg.id}>
                      {showDate && (
                        <div className="flex justify-center my-6">
                          <Badge variant="secondary" className="bg-white/80 dark:bg-[#182229] dark:text-white/60 text-[10px] font-bold py-1 px-3 shadow-sm rounded-lg uppercase tracking-widest border-none">
                            {msg.timestamp.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                          </Badge>
                        </div>
                      )}
                      <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-1`}>
                        <div className={`relative max-w-[85%] md:max-w-[70%] px-3 py-2 rounded-xl shadow-sm ${
                          isMe 
                            ? "bg-[#d9fdd3] dark:bg-[#005c4b] text-[#111b21] dark:text-[#e9edef] rounded-tr-none" 
                            : "bg-white dark:bg-[#202c33] text-[#111b21] dark:text-[#e9edef] rounded-tl-none"
                        }`}>
                          {!isMe && (
                            <div className="text-[11px] font-bold text-primary mb-0.5">{msg.senderName}</div>
                          )}
                          <div className="text-[14px] leading-relaxed break-words whitespace-pre-wrap">
                            {msg.text}
                          </div>
                          
                          {msg.fileUrl && (
                            <div className={`mt-2 p-2 rounded-lg flex items-center gap-3 border ${
                              isMe ? "bg-black/5 dark:bg-black/20 border-black/5" : "bg-muted dark:bg-black/10 border-transparent"
                            }`}>
                              <div className="w-10 h-10 rounded bg-primary/20 flex items-center justify-center text-primary">
                                <FileArchive className="w-6 h-6" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-[12px] font-bold truncate">{msg.fileName || "Shared Document"}</div>
                                <div className="text-[10px] opacity-60 uppercase font-bold tracking-tighter">SECURE FILE</div>
                              </div>
                              {currentUser.role === 'admin' ? (
                                <div className="text-[10px] text-muted-foreground bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded border border-dashed italic">
                                  [Document Shared: {msg.fileName}]
                                </div>
                              ) : (
                                <Download className="w-4 h-4 cursor-pointer hover:text-primary transition-colors" />
                              )}
                            </div>
                          )}
                          
                          <div className="flex justify-end items-center gap-1 mt-1 -mr-1">
                            <span className="text-[10px] opacity-50 font-medium lowercase">
                              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isMe && <Shield className="w-2.5 h-2.5 text-primary opacity-60" />}
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })
              )}
            </div>
          </div>

          {/* CA 'Mark as Completed' Button */}
          {currentUser.role === 'ca' && request.status === 'active' && (
            <div className="p-4 bg-primary/5 border-t border-primary/10 text-center">
              <Button 
                className="bg-primary hover:bg-primary/90 text-white font-bold px-8 rounded-full shadow-lg"
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
          )}

          {/* Client 'Approve Work' Button */}
          {currentUser.role === 'client' && request.status === 'completed' && (
            <div className="p-8 bg-indigo-50 dark:bg-indigo-950/20 border-t border-indigo-100 dark:border-indigo-900/30 text-center flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-100">Work Submitted for Approval</h3>
                <p className="text-sm text-indigo-700/70 dark:text-indigo-400/70 max-w-md mx-auto">
                  The expert has marked the work as finished. Please review the documents and messages. 
                  Once satisfied, click the button below to release the payment.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                <Button 
                  size="lg"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-12 h-14 rounded-xl shadow-xl hover:scale-105 transition-all text-base"
                  onClick={() => {
                    if(confirm("By approving this work, you confirm satisfaction with the expert's output. The project will move to the payout stage.")) {
                      approveWork(id!);
                    }
                  }}
                >
                   Approve Work & Prepare Payout
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-destructive text-destructive hover:bg-destructive/5 font-bold px-8 h-14 rounded-xl shadow-md transition-all text-base"
                  onClick={() => {
                    if(confirm("Are you sure you want to request changes? This will move the project back to 'Active' status and notify the expert.")) {
                      rejectWork(id!);
                    }
                  }}
                >
                   Request Changes
                </Button>
              </div>
            </div>
          )}

          {/* Chat Input - HIDDEN FOR ADMIN & HIDDEN FOR CLIENT IF COMPLETED */}
          {(currentUser.role !== 'admin' && !(currentUser.role === 'client' && request.status === 'completed')) && (
            <div className="p-4 bg-[#f0f2f5] dark:bg-[#202c33] border-t dark:border-white/5 relative z-20">
              <div className="max-w-4xl mx-auto flex flex-col gap-2">
                {/* Proactive Anti-Bypass Alert */}
                {isBlocked && (
                  <div className="flex items-center gap-2 text-destructive text-[11px] font-bold bg-destructive/10 p-2 rounded-lg border border-destructive/20 animate-in fade-in slide-in-from-bottom-2">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Contact details are not allowed. Please remove them to send your message.
                  </div>
                )}
                
                <div className="flex items-center gap-4">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full text-muted-foreground hover:text-primary transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="w-5 h-5 -rotate-45" />
                  </Button>
                  
                  <div className="flex-1 relative">
                    <Input
                      className="rounded-xl border-none bg-white dark:bg-[#2a3942] focus-visible:ring-0 h-11 px-4 shadow-sm text-sm"
                      placeholder="Type a secure message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    />
                  </div>
                  
                  <Button 
                    size="icon" 
                    className={`rounded-full shadow-lg transition-all h-11 w-11 shrink-0 ${
                      isBlocked || !newMessage.trim() 
                        ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50" 
                        : "bg-primary hover:bg-primary/90 text-white"
                    }`}
                    onClick={handleSendMessage}
                    disabled={isBlocked || !newMessage.trim()}
                  >
                    <Send className="w-5 h-5 ml-0.5" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Admin Read-Only Notice */}
          {currentUser.role === 'admin' && (
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 border-t border-indigo-100 dark:border-indigo-900/30 text-center">
              <p className="text-xs font-bold text-indigo-700 dark:text-indigo-400 flex items-center justify-center gap-2">
                <Shield className="w-4 h-4" />
                ADMIN OVERWATCH: READ-ONLY ACCESS
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Workspace;
