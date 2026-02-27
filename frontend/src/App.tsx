import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MockBackendProvider } from "@/context/MockBackendContext";
import { SocketProvider } from "@/context/SocketContext";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import ClientDashboard from "./pages/ClientDashboard";
import CADashboard from "./pages/CADashboard";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Workspace from "./pages/Workspace";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ContactSupport from "./pages/ContactSupport";
import AboutUs from "./pages/AboutUs";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SocketProvider>
      <MockBackendProvider>
        <TooltipProvider>
          <Sonner position="top-right" expand={false} richColors />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/client/dashboard" element={<ClientDashboard />} />
              <Route path="/ca/dashboard" element={<CADashboard />} />
              <Route path="/workspace/:id" element={<Workspace />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/contact" element={<ContactSupport />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/tcg-master-control" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </MockBackendProvider>
    </SocketProvider>
  </QueryClientProvider>
);

export default App;
