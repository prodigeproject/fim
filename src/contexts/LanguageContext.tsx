import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "id" | "en";

// Simple bilingual content map
const translations: Record<string, Record<Language, string>> = {
  // Navigation
  "nav.home": { id: "Beranda", en: "Home" },
  "nav.about": { id: "Tentang FIM", en: "About FIM" },
  "nav.aboutMenu": { id: "Tentang", en: "About" },
  "nav.regional": { id: "Regional FIM", en: "FIM Regional" },
  "nav.fimClub": { id: "FIM Club", en: "FIM Club" },
  "nav.program": { id: "Program", en: "Programs" },
  "nav.training": { id: "Pelatihan FIM", en: "FIM Training" },
  "nav.flagship": { id: "Program Unggulan", en: "Featured Programs" },
  "nav.programs": { id: "Program", en: "Programs" },
  "nav.blog": { id: "Blog", en: "Blog" },
  "nav.faq": { id: "FAQ", en: "FAQ" },
  "nav.donate": { id: "Donasi", en: "Donate" },
  "nav.join": { id: "Gabung", en: "Join" },
  "nav.register": { id: "Daftar", en: "Register" },
  "nav.alumni": { id: "Alumni", en: "Alumni" },
  "nav.volunteer": { id: "Relawan", en: "Volunteer" },
  
  // Home page
  "home.hero.title": { id: "Forum Indonesia Muda", en: "Forum Indonesia Muda" },
  "home.hero.subtitle": { id: "Membangun Pemimpin Masa Depan Indonesia", en: "Building Indonesia's Future Leaders" },
  "home.hero.description": { id: "Komunitas anak muda Indonesia yang berkomitmen untuk berkontribusi pada pembangunan bangsa melalui kepemimpinan, inovasi, dan aksi nyata.", en: "A community of young Indonesians committed to contributing to nation building through leadership, innovation, and real action." },
  "home.hero.cta.register": { id: "Daftar Sekarang", en: "Register Now" },
  "home.hero.cta.learn": { id: "Pelajari Lebih Lanjut", en: "Learn More" },
  
  "home.stats.members": { id: "Anggota", en: "Members" },
  "home.stats.regionals": { id: "Regional", en: "Regionals" },
  "home.stats.batches": { id: "Angkatan", en: "Batches" },
  "home.stats.alumni": { id: "Alumni", en: "Alumni" },
  
  "home.about.title": { id: "Tentang FIM", en: "About FIM" },
  "home.about.description": { id: "Forum Indonesia Muda adalah komunitas pemuda yang berdedikasi untuk pembangunan Indonesia melalui pengembangan kepemimpinan dan aksi sosial.", en: "Forum Indonesia Muda is a youth community dedicated to Indonesia's development through leadership development and social action." },
  
  "home.programs.title": { id: "Program Unggulan", en: "Featured Programs" },
  "home.programs.subtitle": { id: "Berbagai program untuk mengembangkan potensi anak muda Indonesia", en: "Various programs to develop the potential of Indonesian youth" },
  
  "home.news.title": { id: "Kabar FIM", en: "FIM News" },
  "home.news.subtitle": { id: "Berita dan kegiatan terbaru dari Forum Indonesia Muda", en: "Latest news and activities from Forum Indonesia Muda" },
  "home.news.readmore": { id: "Baca Selengkapnya", en: "Read More" },
  "home.news.viewall": { id: "Lihat Semua Berita", en: "View All News" },
  
  "home.testimonials.title": { id: "Cerita Alumni", en: "Alumni Stories" },
  "home.testimonials.subtitle": { id: "Pengalaman dan dampak alumni FIM di berbagai bidang", en: "Experiences and impact of FIM alumni in various fields" },
  "home.testimonials.viewall": { id: "Lihat Semua Cerita Alumni", en: "View All Alumni Stories" },
  
  "home.partners.title": { id: "Mitra & Kolaborator", en: "Partners & Collaborators" },
  "home.partners.subtitle": { id: "Bersama membangun Indonesia yang lebih baik", en: "Together building a better Indonesia" },
  
  "home.cta.title": { id: "Siap Bergabung?", en: "Ready to Join?" },
  "home.cta.description": { id: "Jadilah bagian dari komunitas pemuda Indonesia yang berpengaruh", en: "Become part of an influential Indonesian youth community" },
  "home.cta.button": { id: "Daftar Sekarang", en: "Register Now" },
  
  // Blog page
  "blog.title": { id: "Blog & Berita", en: "Blog & News" },
  "blog.subtitle": { id: "Berita, artikel, dan cerita dari Forum Indonesia Muda", en: "News, articles, and stories from Forum Indonesia Muda" },
  "blog.search": { id: "Cari artikel...", en: "Search articles..." },
  "blog.category.all": { id: "Semua", en: "All" },
  "blog.category.pengumuman": { id: "Pengumuman", en: "Announcements" },
  "blog.category.prestasi": { id: "Prestasi", en: "Achievements" },
  "blog.category.kegiatan": { id: "Kegiatan", en: "Activities" },
  "blog.category.sosial": { id: "Sosial", en: "Social" },
  "blog.category.opini": { id: "Opini", en: "Opinion" },
  "blog.category.tips": { id: "Tips", en: "Tips" },
  "blog.readmore": { id: "Baca Selengkapnya", en: "Read More" },
  "blog.noarticles": { id: "Belum ada artikel", en: "No articles yet" },
  "blog.loadmore": { id: "Muat Lebih Banyak", en: "Load More" },
  
  // About page
  "about.title": { id: "Tentang FIM", en: "About FIM" },
  "about.subtitle": { id: "Forum Indonesia Muda - Membangun Pemimpin Masa Depan", en: "Forum Indonesia Muda - Building Future Leaders" },
  "about.vision.title": { id: "Visi", en: "Vision" },
  "about.vision.text": { id: "Menjadi wadah pengembangan pemimpin muda Indonesia yang berdampak", en: "To be a platform for developing impactful young Indonesian leaders" },
  "about.mission.title": { id: "Misi", en: "Mission" },
  "about.values.title": { id: "Nilai-Nilai", en: "Values" },
  "about.history.title": { id: "Sejarah", en: "History" },
  "about.team.title": { id: "Tim Kami", en: "Our Team" },
  
  // FAQ page
  "faq.title": { id: "Pertanyaan Umum", en: "Frequently Asked Questions" },
  "faq.subtitle": { id: "Temukan jawaban untuk pertanyaan yang sering diajukan", en: "Find answers to commonly asked questions" },
  "faq.search": { id: "Cari pertanyaan...", en: "Search questions..." },
  "faq.noresults": { id: "Tidak ada hasil yang ditemukan", en: "No results found" },
  "faq.contact": { id: "Masih ada pertanyaan? Hubungi kami", en: "Still have questions? Contact us" },
  
  // Donate page
  "donate.title": { id: "Donasi", en: "Donate" },
  "donate.subtitle": { id: "Dukung pengembangan pemuda Indonesia", en: "Support Indonesian youth development" },
  "donate.why.title": { id: "Mengapa Berdonasi?", en: "Why Donate?" },
  "donate.how.title": { id: "Cara Berdonasi", en: "How to Donate" },
  "donate.impact.title": { id: "Dampak Donasi Anda", en: "Your Donation Impact" },
  
  // Footer
  "footer.about": { id: "Tentang FIM", en: "About FIM" },
  "footer.programs": { id: "Program", en: "Programs" },
  "footer.connect": { id: "Hubungi Kami", en: "Connect With Us" },
  "footer.rights": { id: "Hak Cipta", en: "All Rights Reserved" },
  "footer.newsletter": { id: "Dapatkan Update Terbaru", en: "Get Latest Updates" },
  "footer.newsletterDesc": { id: "Berlangganan newsletter untuk info kegiatan, pendaftaran, dan berita terbaru dari FIM.", en: "Subscribe to our newsletter for activities, registration, and latest news from FIM." },
  "footer.emailPlaceholder": { id: "Masukkan email Anda", en: "Enter your email" },
  "footer.subscribe": { id: "Langganan", en: "Subscribe" },
  "footer.subscribeSuccess": { id: "Berhasil berlangganan!", en: "Successfully subscribed!" },
  "footer.subscribeSuccessDesc": { id: "Terima kasih telah berlangganan newsletter FIM.", en: "Thank you for subscribing to FIM newsletter." },
  "footer.description": { id: "Wadah bagi pemuda Indonesia untuk bertumbuh, berkolaborasi, dan menjadi cahaya kunang-kunang yang menerangi masa depan bangsa. Berdiri sejak 2003.", en: "A platform for Indonesian youth to grow, collaborate, and become fireflies illuminating the nation's future. Established since 2003." },
  "footer.navigation": { id: "Navigasi", en: "Navigation" },
  "footer.contact": { id: "Hubungi Kami", en: "Contact Us" },
  "footer.supportFim": { id: "Dukung FIM", en: "Support FIM" },
  "footer.copyright": { id: "© {year} Forum Indonesia Muda. Hak cipta dilindungi.", en: "© {year} Forum Indonesia Muda. All rights reserved." },
  "footer.madeWith": { id: "Dibuat dengan", en: "Made with" },
  "footer.forIndonesia": { id: "untuk Indonesia", en: "for Indonesia" },
  
  // Common
  "common.loading": { id: "Memuat...", en: "Loading..." },
  "common.error": { id: "Terjadi kesalahan", en: "An error occurred" },
  "common.retry": { id: "Coba Lagi", en: "Try Again" },
  "common.close": { id: "Tutup", en: "Close" },
  "common.save": { id: "Simpan", en: "Save" },
  "common.cancel": { id: "Batal", en: "Cancel" },
  "common.submit": { id: "Kirim", en: "Submit" },
  "common.back": { id: "Kembali", en: "Back" },
  "common.next": { id: "Selanjutnya", en: "Next" },
  "common.previous": { id: "Sebelumnya", en: "Previous" },
  "common.search": { id: "Cari", en: "Search" },
  "common.filter": { id: "Filter", en: "Filter" },
  "common.sort": { id: "Urutkan", en: "Sort" },
  "common.viewall": { id: "Lihat Semua", en: "View All" },
  "common.readmore": { id: "Baca Selengkapnya", en: "Read More" },
  "common.share": { id: "Bagikan", en: "Share" },
  "common.selectLanguage": { id: "Pilih Bahasa", en: "Select Language" },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("fim-language");
    return (saved as Language) || "id";
  });

  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem("fim-language", language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (translation) {
      return translation[language];
    }
    // If no translation found, return the key (or last part of key for readability)
    return key.split(".").pop() || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
