import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { CookiesProvider } from "./contexts/CookiesContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DomainRedirect from "./components/DomainRedirect";
import CookiesBanner from "./components/CookiesBanner";

import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import EmailVerified from "./pages/EmailVerified";
import VerifyEmail from "./pages/VerifyEmail";
import Contact from "./pages/Contact";
import HelpCenter from "./pages/HelpCenter";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

import Chat from "./pages/Chat";
import KnowledgeBase from "./pages/KnowledgeBase";
import OAuthCallback from "./pages/OAuthCallback";
import NotFound from "./pages/NotFound";
import { SharedConversation } from "./pages/SharedConversation";


// Create QueryClient outside component to prevent recreation on each render
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CookiesProvider>
      <LanguageProvider>
        <ThemeProvider>
          <AuthProvider>
          <TooltipProvider>
          <DomainRedirect />
          <Toaster />
          <Sonner />
          <CookiesBanner />

          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/email-verified" element={<EmailVerified />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/oauth/callback" element={<OAuthCallback />} />

            <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            <Route path="/knowledge" element={<ProtectedRoute><KnowledgeBase /></ProtectedRoute>} />
            <Route path="/shared/:shareId" element={<ProtectedRoute><SharedConversation /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>

          </BrowserRouter>
          </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </LanguageProvider>
    </CookiesProvider>
  </QueryClientProvider>
);

export default App;
