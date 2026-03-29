import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import logoFim from "@/assets/logo-fim.png";
import heroLeadership from "@/assets/hero-leadership.jpg";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Users,
  ExternalLink,
  MessageSquare,
  BookOpen,
  HelpCircle,
  LogIn,
  UserPlus,
  Calendar,
  Info,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BatchTimeline } from "@/components/registration/BatchTimeline";
import { RegistrationStats } from "@/components/registration/RegistrationStats";
import { format, parseISO, differenceInDays, differenceInHours, differenceInMinutes } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { enUS } from "date-fns/locale";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface RegistrationSettings {
  id: string;
  batch_name: string;
  batch_number: number;
  is_registration_open: boolean;
  registration_start_date: string | null;
  registration_end_date: string | null;
  max_participants: number | null;
  description: string | null;
  is_active: boolean;
  admin_review_start_date: string | null;
  admin_review_end_date: string | null;
  admin_result_announcement_date: string | null;
  interview_start_date: string | null;
  interview_end_date: string | null;
  final_result_announcement_date: string | null;
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

export default function RegistrationLanding() {
  const { t, language } = useLanguage();
  const currentLocale = language === 'en' ? enUS : idLocale;
  const { data: batchData, isLoading } = useQuery({
    queryKey: ["registration-landing-batch"],
    queryFn: async () => {
      const { data: pinnedBatch } = await supabase
        .from("registration_settings")
        .select("*")
        .eq("is_pinned", true)
        .limit(1)
        .maybeSingle();

      if (pinnedBatch) return pinnedBatch as RegistrationSettings;

      const { data, error } = await supabase
        .from("registration_settings")
        .select("*")
        .eq("is_active", true)
        .order("batch_number", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as RegistrationSettings | null;
    },
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60,
  });

  const isOpen = batchData?.is_registration_open ?? false;
  const registrationEndDate = batchData?.registration_end_date;
  const registrationStartDate = batchData?.registration_start_date;

  const [countdown, setCountdown] = useState<string>("");

  useEffect(() => {
    const targetDate = isOpen ? registrationEndDate : registrationStartDate;
    if (!targetDate) return;

    const updateCountdown = () => {
      const target = parseISO(targetDate);
      const now = new Date();
      const days = differenceInDays(target, now);
      const hours = differenceInHours(target, now) % 24;
      const minutes = differenceInMinutes(target, now) % 60;

      if (days < 0 || (days === 0 && hours < 0)) {
        setCountdown("");
        return;
      }
      if (days > 0) setCountdown(`${days} ${t('portal.countdown.days', 'hari')} ${hours} ${t('portal.countdown.hours', 'jam')} ${t('portal.countdown.remaining', 'lagi')}`);
      else if (hours > 0) setCountdown(`${hours} ${t('portal.countdown.hours', 'jam')} ${minutes} ${t('portal.countdown.minutes', 'menit')} ${t('portal.countdown.remaining', 'lagi')}`);
      else setCountdown(`${minutes} ${t('portal.countdown.minutes', 'menit')} ${t('portal.countdown.remaining', 'lagi')}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [isOpen, registrationEndDate, registrationStartDate]);

  const benefits = [
    { title: t("portal.benefits.character", "Pengembangan Karakter"), desc: t("portal.benefits.characterDesc", "Membangun integritas, kepedulian, dan nilai-nilai kepemimpinan") },
    { title: t("portal.benefits.competency", "Pengembangan Kompetensi"), desc: t("portal.benefits.competencyDesc", "Meningkatkan skill kepemimpinan, kebijakan publik, dan soft skills") },
    { title: t("portal.benefits.network", "Jaringan Nasional"), desc: t("portal.benefits.networkDesc", "Terhubung dengan ribuan alumni dari 61 regional di Indonesia") },
    { title: t("portal.benefits.impact", "Dampak Nyata"), desc: t("portal.benefits.impactDesc", "Kesempatan untuk berkontribusi melalui proyek sosial") },
  ];

  const requirements = [
    t("portal.requirements.age", "WNI usia 18-35 tahun"),
    t("portal.requirements.education", "Pendidikan minimal SMA/sederajat"),
    t("portal.requirements.commitment", "Berkomitmen mengikuti seluruh rangkaian program"),
    t("portal.requirements.concern", "Memiliki kepedulian terhadap isu sosial"),
    t("portal.requirements.contribute", "Bersedia berkontribusi di ekosistem FIM"),
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <SEO
        title={`Pendaftaran ${batchData?.batch_name || "FIM"}`}
        description="Daftar dan bergabung dengan Forum Indonesia Muda. Program kepemimpinan untuk pemuda Indonesia."
      />

      <div className="min-h-screen bg-background">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-4 py-6 relative z-20"
        >
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img src={logoFim} alt="FIM Logo" className="h-10" />
              <span className="font-semibold text-foreground hidden sm:block">
                Forum Indonesia Muda
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              {isOpen && (
                <>
                  <Link to="/portal/login">
                    <Button variant="ghost" size="sm" className="min-h-[44px]">
                      <LogIn className="h-4 w-4 mr-2" />
                      {t('portal.login', 'Masuk')}
                    </Button>
                  </Link>
                  <Link to="/portal/signup">
                    <Button size="sm" className="min-h-[44px]">
                      <UserPlus className="h-4 w-4 mr-2" />
                      {t('portal.register', 'Daftar')}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </motion.header>

        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img src={heroLeadership} alt="" className="w-full h-full object-cover" aria-hidden="true" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-primary/95" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />
          </div>

          <div className="relative z-10 container mx-auto px-4 py-16 lg:py-24">
            <div className="max-w-4xl mx-auto text-center">
              {/* Status Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 dark:bg-card/90 shadow-md mb-6 backdrop-blur-sm"
              >
                {isOpen ? (
                  <>
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-supporting opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-supporting" />
                    </span>
                    <span className="text-sm font-medium text-supporting">
                      {t('portal.statusOpen', 'Pendaftaran Dibuka')}
                    </span>
                  </>
                ) : (
                  <>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      {t('portal.statusClosed', 'Pendaftaran Belum Dibuka')}
                    </span>
                  </>
                )}
              </motion.div>

              {/* Main Title */}
              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="text-4xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg"
              >
                {batchData?.batch_name || "Forum Indonesia Muda"}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="text-lg lg:text-xl text-white/90 mb-6 max-w-2xl mx-auto drop-shadow"
              >
                {batchData?.description ||
                  t('portal.defaultDescription', 'Program kepemimpinan untuk membentuk pemuda Indonesia yang berkarakter dan berdampak')}
              </motion.p>

              {/* Countdown */}
              {countdown && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/20 backdrop-blur-sm text-white mb-8 border border-white/30"
                >
                  <Calendar className="h-5 w-5" />
                  <span className="font-semibold">
                    {isOpen
                      ? t('portal.closesIn', 'Pendaftaran ditutup dalam')
                      : t('portal.opensIn', 'Pendaftaran dibuka dalam')}:{" "}
                    {countdown}
                  </span>
                </motion.div>
              )}

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                {isOpen ? (
                  <>
                    <Link to="/portal/signup">
                      <Button size="lg" className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 min-h-[48px]">
                        {t('portal.registerNow', 'Daftar Sekarang')}
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                    <Link to="/portal/login">
                      <Button size="lg" variant="ghost" className="w-full sm:w-auto border border-white text-white hover:bg-white/20 min-h-[48px]">
                        <LogIn className="mr-2 h-5 w-5" />
                        {t('portal.hasAccount', 'Sudah Punya Akun')}
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <a href="https://whatsapp.com/channel/0029VbAqbD78PgsCdYd6hK2T" target="_blank" rel="noopener noreferrer">
                      <Button size="lg" className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 min-h-[48px]">
                        <MessageSquare className="mr-2 h-5 w-5" />
                        {t('portal.getNotification', 'Dapatkan Notifikasi')}
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </a>
                    <Link to="/program/pelatihan">
                      <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/20 min-h-[48px]">
                        <BookOpen className="mr-2 h-5 w-5" />
                        {t('portal.learnProgram', 'Pelajari Program')}
                      </Button>
                    </Link>
                  </>
                )}
              </motion.div>
            </div>
          </div>

          {/* Smooth fade-out at bottom of hero — no divider line */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />
        </section>

        {/* Stats Section */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="container mx-auto px-4 py-8"
        >
          <RegistrationStats />
        </motion.section>

        {/* Timeline Section */}
        {batchData && (
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeUp}
            className="container mx-auto px-4 py-12"
          >
            <div className="max-w-4xl mx-auto">
              <BatchTimeline batchData={batchData} />
            </div>
          </motion.section>
        )}

        {/* Benefits & Requirements */}
        <section className="container mx-auto px-4 py-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8"
          >
            {/* Benefits */}
            <motion.div variants={scaleIn} className="bg-card rounded-2xl p-6 lg:p-8 shadow-lg">
              <div className="flex items-center gap-2 mb-6">
                <CheckCircle className="h-5 w-5 text-supporting" />
                <h3 className="text-lg font-semibold text-foreground">{t("portal.benefits.title", "Manfaat Mengikuti FIM")}</h3>
              </div>
              <div className="space-y-4">
                {benefits.map((benefit, i) => (
                  <motion.div
                    key={benefit.title}
                    variants={fadeUp}
                    custom={i}
                    className="flex items-start gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-supporting/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="h-4 w-4 text-supporting" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{benefit.title}</p>
                      <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Requirements */}
            <motion.div variants={scaleIn} className="bg-card rounded-2xl p-6 lg:p-8 shadow-lg">
              <div className="flex items-center gap-2 mb-6">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">{t("portal.requirements.title", "Persyaratan Pendaftar")}</h3>
              </div>
              <div className="space-y-3">
                {requirements.map((req, index) => (
                  <motion.div key={index} variants={fadeUp} custom={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">{index + 1}</span>
                    </div>
                    <p className="text-muted-foreground">{req}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Info Box when closed */}
        {!isOpen && registrationStartDate && (
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="container mx-auto px-4 py-8"
          >
            <div className="max-w-2xl mx-auto">
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex items-start gap-4">
                <Info className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">{t("portal.registrationWillOpen", "Pendaftaran Akan Dibuka")}</h3>
                  <p className="text-muted-foreground">
                    {t("portal.registrationWillOpenDesc", "Pendaftaran untuk {batchName} akan dibuka pada {date}. Ikuti channel WA untuk mendapatkan notifikasi saat pendaftaran dibuka.")
                      .replace("{batchName}", batchData?.batch_name || "")
                      .replace("{date}", format(parseISO(registrationStartDate), "d MMMM yyyy", { locale: currentLocale }))}
                  </p>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* WA Channel Banner */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="container mx-auto px-4 py-8"
        >
          <div className="max-w-2xl mx-auto">
            <a
              href="https://whatsapp.com/channel/0029VbAqbD78PgsCdYd6hK2T"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 bg-supporting/10 hover:bg-supporting/20 transition-colors rounded-xl p-4 text-foreground"
            >
              <MessageSquare className="h-5 w-5 text-supporting" />
              <span className="text-sm font-medium">
                📢 {t("portal.followWaChannel", "Ikuti Channel WA FIMers Update untuk info terbaru!")}
              </span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </motion.section>

        {/* Bottom CTA */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="container mx-auto px-4 py-12"
        >
          <div className="max-w-2xl mx-auto text-center">
            <motion.h2 variants={fadeUp} className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
              Siap Menjadi Bagian dari FIM?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground mb-6">
              Bergabunglah dengan ribuan alumni FIM yang telah berkontribusi untuk Indonesia.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              {isOpen ? (
                <Link to="/portal/signup">
                  <Button size="lg">
                    Daftar Sekarang
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <a href="https://whatsapp.com/channel/0029VbAqbD78PgsCdYd6hK2T" target="_blank" rel="noopener noreferrer">
                  <Button size="lg">
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Dapatkan Notifikasi
                  </Button>
                </a>
              )}
              <Link to="/faq">
                <Button size="lg" variant="outline">
                  <HelpCircle className="mr-2 h-5 w-5" />
                  FAQ
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.section>

        {/* Footer */}
        <footer className="container mx-auto px-4 py-8 border-t border-border">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Forum Indonesia Muda</p>
            <div className="flex items-center gap-6">
              <Link to="/program/pelatihan" className="hover:text-foreground">Program</Link>
              <Link to="/cerita-alumni" className="hover:text-foreground">Alumni</Link>
              <Link to="/faq" className="hover:text-foreground">FAQ</Link>
              <Link to="/" className="hover:text-foreground">Beranda</Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
