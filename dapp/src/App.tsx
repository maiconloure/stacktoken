import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import Questions from "./pages/Questions";
import AskQuestion from "./pages/AskQuestion";
import NotFound from "./pages/NotFound";
import { Providers } from "./providers";
import 'dotenv/config'
import "./lib/i18n";

const queryClient = new QueryClient();

const App = () => (
  <Providers>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/questions" element={<Questions />} />
                <Route path="/ask" element={<AskQuestion />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </Providers>
);

export default App;
