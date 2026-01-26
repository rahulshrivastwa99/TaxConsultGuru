import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MockBackendProvider } from "@/context/MockBackendContext";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import ClientDashboard from "./pages/ClientDashboard";
import CADashboard from "./pages/CADashboard";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <MockBackendProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/client/dashboard" element={<ClientDashboard />} />
            <Route path="/ca/dashboard" element={<CADashboard />} />
            {/* Secret Admin Route - NO link anywhere */}
            <Route path="/tcg-master-control" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </MockBackendProvider>
  </QueryClientProvider>
);

export default App;
