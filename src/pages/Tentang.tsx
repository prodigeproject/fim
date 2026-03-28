import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import { SEO } from "@/components/SEO";
import { Target, Compass, User, Users, Briefcase, Building2, Heart, Shield, Star, Handshake, Scale, UserCheck, MessageSquare, BookOpen, Brain, Clipboard, Network } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" as const } }),
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

interface AboutProfile {
  id: string;
  name: string;
  position: string;
  section: string;
  photo_url: string | null;
  sort_order: number;
  is_active: boolean;
}

const Tentang = () => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const { data: profiles } = useQuery({
    queryKey: ["about-profiles-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("about_profiles")
        .select("*")
        .eq("is_active", true)
        .order("section")
        .order("sort_order");
      if (error) throw error;
      return data as AboutProfile[];
    },
  });

  // Realtime updates
  useEffect(() => {
    const channel = supabase
      .channel("about-profiles-public-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "about_profiles" }, () => {
        queryClient.invalidateQueries({ queryKey: ["about-profiles-public"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const strukturYayasan = profiles?.filter(p => p.section === "yayasan") || [];
  const bph = profiles?.filter(p => p.section === "bph") || [];
  const biroInternal = profiles?.filter(p => p.section === "biro_internal") || [];
  const divisi = profiles?.filter(p => p.section === "divisi") || [];

  const pilarKarakter = [
    { icon: Heart, name: "Cinta Kasih", desc: "Mencintai sesama dan berbagi kebaikan" },
    { icon: Shield, name: "Integritas", desc: "Konsisten dalam nilai dan tindakan" },
    { icon: Star, name: "Kebersahajaan", desc: "Sederhana namun bermakna" },
    { icon: Target, name: "Totalitas", desc: "Memberikan yang terbaik dalam segala hal" },
    { icon: Handshake, name: "Solidaritas", desc: "Bersatu dan saling mendukung" },
    { icon: Scale, name: "Keadilan", desc: "Menegakkan kebenaran dan kesetaraan" },
    { icon: UserCheck, name: "Keteladanan", desc: "Menjadi contoh yang baik bagi sesama" },
  ];
  const pilarKepemimpinan = [
    { icon: Users, name: "Mengenal Diri", desc: "Memahami kekuatan dan kelemahan diri" },
    { icon: MessageSquare, name: "Komunikasi", desc: "Menyampaikan pesan dengan efektif" },
    { icon: Heart, name: "Akhlak", desc: "Berperilaku mulia dalam setiap tindakan" },
    { icon: BookOpen, name: "Kekuatan Belajar", desc: "Terus mengembangkan ilmu dan wawasan" },
    { icon: Brain, name: "Proses Pengambilan Keputusan", desc: "Membuat keputusan yang bijak" },
    { icon: Clipboard, name: "Manajerial", desc: "Mengelola sumber daya dengan efisien" },
    { icon: Network, name: "Pengorganisasian", desc: "Membangun tim dan sistem yang solid" },
  ];
  const sejarah = [
    { year: "2003", event: "Forum Indonesia Muda didirikan oleh sepasang suami istri Elmir Amien dan Tatty Elmir, yang disupport pakar leadership Buchori Nasution, dan rekan-rekannya sesama jurnalis di Jakarta News FM. Pelatihan pertama di Graha Pemuda Cibodas Jakarta." },
    { year: "2004", event: "FIM ke-2 kegiatan dipindahkan ke Wiladatika Jakarta, agar mudah diakses para mentor dan undangan." },
    { year: "2005", event: "Pelatihan FIM dibarengi dengan pemberangkatan relawan FIM ke Nias saat bencana gempa besar bekerjasama dengan TNI AL." },
    { year: "2007", event: "FIM telah ekspansi di 10 kota besar di Indonesia dan dibentuknya Koordinator Nasional." },
    { year: "2010", event: "Transformasi kurikulum program kaderisasi kepemimpinan FIM (FIM 9) dan peluncuran FIM tematik Rescue bekerjasama dengan MER-C." },
    { year: "2015", event: "Dibentuknya FIM Club untuk basis keminatan alumni FIM di bidang-bidang tertentu." },
    { year: "2018", event: "Dilaksanakan pelatihan FIM di 5 wilayah sekaligus (FIM 20) untuk melakukan ekspansi kaderisasi kepemimpinan di setiap wilayah di Indonesia." },
    { year: "2023", event: "Momentum 2 dekade FIM, telah menghasilkan 30 lebih angkatan pelatihan FIM, lebih dari 60 regional, dan hampir 4000 alumni." },
    { year: "2025", event: "Perdana pelatihan FIM tematik Kebijakan Publik bekerjasama dengan Nalar Institute untuk menghasilkan ahli kebijakan publik di level intermediate & advance." },
  ];

  return (
    <Layout>
      <SEO title={t("about.hero.title", "Tentang FIM")} description={t("about.hero.subtitle", "Sejarah, visi misi, struktur organisasi, dan nilai-nilai Forum Indonesia Muda.")} />
      <PageHero title={t("about.hero.title", "Tentang Forum Indonesia Muda")} subtitle={t("about.hero.subtitle", "Lebih dari dua dekade membangun generasi muda Indonesia yang berkarakter dan berjiwa pemimpin")} />

      {/* Visi Misi */}
      <section className="py-10 sm:py-16 lg:py-20 bg-secondary">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div className="grid md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="bg-card rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6"><Target className="h-8 w-8 text-primary" /></div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">{t("about.vision", "Visi")}</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">Hadirnya para pemimpin bangsa yang memiliki semangat nasionalisme dan patriotisme tinggi, berakhlak mulia, sehat dan cerdas paripurna baik secara fisik, rohani, spiritual maupun intelektual. Terwujudnya Indonesia sebagai bangsa yang mandiri dalam ekonomi, berdaulat dalam politik dan berkepribadian dalam kebudayaan.</p>
            </motion.div>
            <motion.div variants={fadeUp} className="bg-card rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg">
              <div className="w-12 sm:w-16 h-12 sm:h-16 bg-supporting/10 rounded-xl flex items-center justify-center mb-4 sm:mb-6"><Compass className="h-6 sm:h-8 w-6 sm:w-8 text-supporting" /></div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">{t("about.mission", "Misi")}</h2>
              <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-muted-foreground">
                <li className="flex items-start gap-2"><span className="text-primary font-bold">1.</span>Pembinaan pemuda dan mahasiswa untuk diarahkan kepada gagasan jiwa mandiri (entrepreneurship) dan collective leadership.</li>
                <li className="flex items-start gap-2"><span className="text-primary font-bold">2.</span>Meningkatkan pemahaman akan pentingnya arti kompetensi bagi generasi muda yang berbasis pada soft skill (7 pilar dasar kepemimpinan dan 7 pilar karakter) dan hard skill (teknologi dan profesionalisme).</li>
                <li className="flex items-start gap-2"><span className="text-primary font-bold">3.</span>Menyatukan dan mengoptimalkan berbagai potensi pemuda dan mahasiswa dalam forum silaturahim dengan berbagai latar belakang.</li>
                <li className="flex items-start gap-2"><span className="text-primary font-bold">4.</span>Membuhul solidaritas sosial untuk saling menguatkan antar sesama saudara sebangsa dan setanah air.</li>
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Kunang-kunang Quote */}
      <motion.section className="py-10 sm:py-16 bg-background" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="relative bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12">
              <div className="absolute top-3 sm:top-4 left-3 sm:left-4 text-4xl sm:text-6xl text-accent/30">"</div>
              <blockquote className="text-lg sm:text-xl lg:text-2xl text-foreground font-medium italic mb-4 sm:mb-6">Seperti kunang-kunang yang kecil namun mampu menerangi kegelapan, kami percaya setiap pemuda Indonesia memiliki cahaya yang dapat menerangi jalan bagi sesama dan bangsa.</blockquote>
              <div className="w-16 h-1 bg-accent mx-auto mb-4" />
              <p className="text-muted-foreground font-semibold">Filosofi Kunang-Kunang FIM</p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 7 Pilar + Perjalanan */}
      <section className="py-10 bg-secondary">
        <div className="container mx-auto px-4">
          <motion.div className="grid lg:grid-cols-5 gap-6 max-w-7xl mx-auto items-start" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div className="lg:col-span-2" variants={fadeUp}>
              <h2 className="text-xl lg:text-2xl font-bold text-foreground mb-1">{t("about.values", "Nilai & Pilar FIM")}</h2>
              <p className="text-muted-foreground mb-4 text-xs">Fondasi karakter dan kepemimpinan</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <h4 className="font-semibold text-foreground text-xs mb-2 flex items-center gap-1"><Heart className="h-3 w-3 text-primary" /> Karakter</h4>
                  <div className="space-y-1">
                    {pilarKarakter.map((item) => (
                      <div key={item.name} className="flex items-center gap-1.5 bg-card rounded px-2 py-1.5 shadow-sm">
                        <item.icon className="h-3 w-3 text-primary flex-shrink-0" />
                        <span className="text-xs font-medium text-foreground leading-tight">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-xs mb-2 flex items-center gap-1"><Star className="h-3 w-3 text-supporting" /> Kepemimpinan</h4>
                  <div className="space-y-1">
                    {pilarKepemimpinan.map((item) => (
                      <div key={item.name} className="flex items-center gap-1.5 bg-card rounded px-2 py-1.5 shadow-sm">
                        <item.icon className="h-3 w-3 text-supporting flex-shrink-0" />
                        <span className="text-xs font-medium text-foreground leading-tight">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div className="lg:col-span-3" variants={fadeUp}>
              <h2 className="text-xl lg:text-2xl font-bold text-foreground mb-1">{t("about.history", "Perjalanan Kami")}</h2>
              <p className="text-muted-foreground mb-4 text-xs">Sejarah Forum Indonesia Muda</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {sejarah.map((item) => (
                  <div key={item.year} className="bg-card rounded-lg p-3 shadow-sm border-l-2 border-primary">
                    <div className="font-bold text-primary text-sm mb-0.5">{item.year}</div>
                    <p className="text-foreground text-xs leading-relaxed line-clamp-4">{item.event}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Struktur Pengurus - Now from DB */}
      <section className="py-10 sm:py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-foreground mb-3 sm:mb-4" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>{t("about.structure", "Struktur Pengurus")}</motion.h2>
          <motion.p className="text-sm sm:text-base text-muted-foreground text-center max-w-2xl mx-auto mb-8 sm:mb-12" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}>Organisasi yang menggerakkan Forum Indonesia Muda</motion.p>

          {/* Yayasan */}
          {strukturYayasan.length > 0 && (
            <div className="max-w-6xl mx-auto mb-16">
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center"><Building2 className="h-6 w-6 text-primary" /></div>
                <h3 className="text-2xl font-bold text-foreground">Struktur Yayasan</h3>
              </div>
              <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
                {strukturYayasan.map((person, index) => (
                  <motion.div key={person.id} variants={fadeUp} className={`bg-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all ${index < 2 ? 'lg:col-span-1 border-2 border-primary/20' : ''}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${index < 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        {person.photo_url ? <img src={person.photo_url} alt={person.name} className="w-full h-full object-cover" /> : <User className="h-8 w-8" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">{person.name}</h4>
                        <p className={`text-sm ${index < 2 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>{person.position}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}

          {/* Pengurus FIM */}
          {bph.length > 0 && (
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="w-12 h-12 bg-supporting/10 rounded-lg flex items-center justify-center"><Users className="h-6 w-6 text-supporting" /></div>
                <h3 className="text-2xl font-bold text-foreground">Struktur Pengurus FIM</h3>
              </div>
              <motion.div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
                {bph.map((person, index) => (
                  <motion.div key={person.id} variants={fadeUp} className={`bg-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all ${index === 0 ? 'lg:col-span-4 bg-gradient-to-r from-primary/5 to-supporting/5 border-2 border-primary/20' : ''}`}>
                    <div className={`flex ${index === 0 ? 'flex-row items-center' : 'flex-col items-center text-center'} gap-4`}>
                      <div className={`${index === 0 ? 'w-20 h-20' : 'w-16 h-16'} rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${index === 0 ? 'bg-primary text-primary-foreground' : 'bg-supporting/20'}`}>
                        {person.photo_url ? <img src={person.photo_url} alt={person.name} className="w-full h-full object-cover" /> : <User className={index === 0 ? 'h-10 w-10' : 'h-8 w-8'} />}
                      </div>
                      <div className={index === 0 ? '' : 'text-center'}>
                        <h4 className={`font-bold text-foreground ${index === 0 ? 'text-lg' : ''}`}>{person.name}</h4>
                        <p className={`text-sm ${index === 0 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>{person.position}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Biro Internal */}
              {biroInternal.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-center font-semibold text-foreground mb-4 flex items-center justify-center gap-2"><Briefcase className="h-4 w-4 text-primary" />Biro Internal</h4>
                  <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
                    {biroInternal.map((person) => (
                      <motion.div key={person.id} variants={fadeUp} className="bg-muted rounded-xl p-4 text-center">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2 overflow-hidden">
                          {person.photo_url ? <img src={person.photo_url} alt={person.name} className="w-full h-full object-cover" /> : <User className="h-6 w-6 text-primary" />}
                        </div>
                        <h5 className="font-medium text-sm text-foreground">{person.name}</h5>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              )}

              {/* Kepala Divisi */}
              {divisi.length > 0 && (
                <div className="w-full">
                  <h4 className="text-center font-semibold text-foreground mb-6">Kepala Divisi & Biro</h4>
                  <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
                    {divisi.map((person) => (
                      <motion.div key={person.id} variants={fadeUp} className="bg-card rounded-xl p-4 shadow-md hover:shadow-lg transition-all border border-border">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {person.photo_url ? <img src={person.photo_url} alt={person.name} className="w-full h-full object-cover" /> : <User className="h-6 w-6 text-accent" />}
                          </div>
                          <div>
                            <h5 className="font-semibold text-foreground text-sm">{person.name}</h5>
                            <p className="text-xs text-muted-foreground">{person.position}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Tentang;
