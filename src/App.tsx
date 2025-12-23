import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Tentang from "./pages/Tentang";
import Pelatihan from "./pages/program/Pelatihan";
import Regional from "./pages/program/Regional";
import FimClub from "./pages/program/FimClub";
import CeritaAlumni from "./pages/CeritaAlumni";
import Blog from "./pages/Blog";
import Donasi from "./pages/Donasi";
import FAQ from "./pages/FAQ";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/tentang" element={<Tentang />} />
          <Route path="/program/pelatihan" element={<Pelatihan />} />
          <Route path="/program/regional" element={<Regional />} />
          <Route path="/program/fim-club" element={<FimClub />} />
          <Route path="/cerita-alumni" element={<CeritaAlumni />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/donasi" element={<Donasi />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
