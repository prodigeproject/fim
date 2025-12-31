import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import PageTransition from "./PageTransition";
import Index from "@/pages/Index";
import Tentang from "@/pages/Tentang";
import Pelatihan from "@/pages/program/Pelatihan";
import ProgramUnggulan from "@/pages/program/ProgramUnggulan";
import Regional from "@/pages/tentang/Regional";
import FimClub from "@/pages/tentang/FimClub";
import GabungRelawan from "@/pages/GabungRelawan";
import CeritaAlumni from "@/pages/CeritaAlumni";
import Blog from "@/pages/Blog";
import Donasi from "@/pages/Donasi";
import FAQ from "@/pages/FAQ";
import NotFound from "@/pages/NotFound";

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/tentang" element={<PageTransition><Tentang /></PageTransition>} />
        <Route path="/tentang/regional" element={<PageTransition><Regional /></PageTransition>} />
        <Route path="/tentang/fim-club" element={<PageTransition><FimClub /></PageTransition>} />
        <Route path="/program/pelatihan" element={<PageTransition><Pelatihan /></PageTransition>} />
        <Route path="/program/program-unggulan" element={<PageTransition><ProgramUnggulan /></PageTransition>} />
        <Route path="/gabung-relawan" element={<PageTransition><GabungRelawan /></PageTransition>} />
        <Route path="/cerita-alumni" element={<PageTransition><CeritaAlumni /></PageTransition>} />
        <Route path="/blog" element={<PageTransition><Blog /></PageTransition>} />
        <Route path="/donasi" element={<PageTransition><Donasi /></PageTransition>} />
        <Route path="/faq" element={<PageTransition><FAQ /></PageTransition>} />
        {/* Legacy routes redirect */}
        <Route path="/program/regional" element={<PageTransition><Regional /></PageTransition>} />
        <Route path="/program/fim-club" element={<PageTransition><FimClub /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
