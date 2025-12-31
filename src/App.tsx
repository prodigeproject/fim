import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import Tentang from "./pages/Tentang";
import Pelatihan from "./pages/program/Pelatihan";
import ProgramUnggulan from "./pages/program/ProgramUnggulan";
import Regional from "./pages/tentang/Regional";
import FimClub from "./pages/tentang/FimClub";
import GabungRelawan from "./pages/GabungRelawan";
import CeritaAlumni from "./pages/CeritaAlumni";
import Blog from "./pages/Blog";
import Donasi from "./pages/Donasi";
import FAQ from "./pages/FAQ";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <ThemeProvider defaultTheme="system">
      <LanguageProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/tentang" element={<Tentang />} />
                <Route path="/tentang/regional" element={<Regional />} />
                <Route path="/tentang/fim-club" element={<FimClub />} />
                <Route path="/program/pelatihan" element={<Pelatihan />} />
                <Route path="/program/program-unggulan" element={<ProgramUnggulan />} />
                <Route path="/gabung-relawan" element={<GabungRelawan />} />
                <Route path="/cerita-alumni" element={<CeritaAlumni />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/donasi" element={<Donasi />} />
                <Route path="/faq" element={<FAQ />} />
                {/* Legacy routes redirect */}
                <Route path="/program/regional" element={<Regional />} />
                <Route path="/program/fim-club" element={<FimClub />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </LanguageProvider>
    </ThemeProvider>
  </HelmetProvider>
);

export default App;
