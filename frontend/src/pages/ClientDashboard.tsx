import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Calculator, ClipboardCheck, Building2, Receipt, 
  BookOpen, LogOut, User, Loader2, MessageCircle, Send,
  Headphones
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMockBackend, SERVICES } from '@/context/MockBackendContext';
import { toast } from 'sonner';

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
    logout, 
    requests, 
    createRequest,
    clientMessages,
    addClientMessage,
  } = useMockBackend();

  const [selectedService, setSelectedService] = useState<typeof SERVICES[0] | null>(null);
  const [description, setDescription] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);
  
  // Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatRequestId, setChatRequestId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');

  if (!currentUser) {
    navigate('/');
    return null;
  }

  const myRequests = requests.filter(r => r.clientId === currentUser.id);
  const activeRequests = myRequests.filter(r => r.status === 'active' || r.status === 'pending_approval');
  const searchingRequests = myRequests.filter(r => r.status === 'searching');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleRequestService = async () => {
    if (!selectedService || !currentUser) return;
    
    setIsRequesting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    createRequest(
      currentUser.id,
      currentUser.name,
      selectedService.id,
      selectedService.name,
      description,
      selectedService.defaultBudget
    );
    
    toast.success('Request submitted! Matching with expert...');
    setSelectedService(null);
    setDescription('');
    setIsRequesting(false);
  };

  const openChat = (requestId: string) => {
    setChatRequestId(requestId);
    setChatOpen(true);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !chatRequestId || !currentUser) return;
    addClientMessage(chatRequestId, currentUser.id, currentUser.name, 'client', newMessage);
    setNewMessage('');
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
              <h1 className="font-heading font-bold text-lg text-foreground">TaxConsultGuru</h1>
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
        {/* Searching indicator */}
        {searchingRequests.length > 0 && (
          <Card className="mb-8 border-primary/30 bg-primary/5">
            <CardContent className="py-8 text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <h3 className="font-heading text-xl font-semibold mb-2">Matching with Expert...</h3>
              <p className="text-muted-foreground">
                Please wait while we connect you with the best expert for your {searchingRequests[0].serviceName} request.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Active Requests */}
        {activeRequests.length > 0 && (
          <section className="mb-10">
            <h2 className="font-heading text-xl font-semibold mb-4">Your Active Requests</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeRequests.map(req => (
                <Card key={req.id} className="border-success/30 bg-success/5">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{req.serviceName}</CardTitle>
                      <Badge variant="secondary" className="bg-success text-success-foreground">
                        {req.status === 'pending_approval' ? 'Processing' : 'Active'}
                      </Badge>
                    </div>
                    <CardDescription>
                      Expert team assigned
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{req.description}</p>
                    <Button size="sm" onClick={() => openChat(req.id)}>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Chat with Expert
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Service Catalog */}
        <section>
          <h2 className="font-heading text-2xl font-semibold mb-2">Available Services</h2>
          <p className="text-muted-foreground mb-6">Select a service to request expert assistance</p>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map(service => {
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
                      <span className="text-muted-foreground">Starting from</span>
                      <span className="font-semibold text-primary">₹{service.defaultBudget.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </main>

      {/* Service Request Dialog */}
      <Dialog open={!!selectedService} onOpenChange={() => setSelectedService(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">Request {selectedService?.name}</DialogTitle>
            <DialogDescription>
              Tell us about your requirement and our expert team will take it from here.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="p-4 bg-secondary rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Service</span>
                <span className="font-medium">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Est. Budget</span>
                <span className="font-semibold text-primary">₹{selectedService?.defaultBudget.toLocaleString()}</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Describe your requirement</label>
              <Textarea
                placeholder="Briefly describe what you need help with..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
              />
            </div>
            <Button onClick={handleRequestService} className="w-full" disabled={!description.trim() || isRequesting}>
              {isRequesting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Find Expert
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Masked Chat Dialog - Client sees "TCG Expert Team" */}
      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="sm:max-w-lg h-[600px] flex flex-col">
          <DialogHeader className="border-b pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Headphones className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <DialogTitle className="font-heading">TCG Expert Team</DialogTitle>
                <DialogDescription className="text-xs">Your dedicated support team</DialogDescription>
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
                messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderRole === 'client' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        msg.senderRole === 'client'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-foreground'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
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
