import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { UserPlus, FileText, ClipboardCheck, Users, GraduationCap, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const steps = [
  {
    icon: UserPlus,
    titleKey: "journey.register",
    titleFallback: "Pendaftaran",
    descKey: "journey.registerDesc",
    descFallback: "Daftar online dan buat akun di portal FIM",
    color: "hsl(var(--primary))",
    bgColor: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    icon: FileText,
    titleKey: "journey.form",
    titleFallback: "Isi Formulir",
    descKey: "journey.formDesc",
    descFallback: "Lengkapi data diri, motivasi, dan rekomendasi",
    color: "hsl(var(--accent))",
    bgColor: "bg-accent/10",
    iconColor: "text-accent-foreground",
  },
  {
    icon: ClipboardCheck,
    titleKey: "journey.selection",
    titleFallback: "Seleksi Berkas",
    descKey: "journey.selectionDesc",
    descFallback: "Tim seleksi meninjau kelengkapan dan kualitas berkas",
    color: "hsl(var(--supporting))",
    bgColor: "bg-supporting/10",
    iconColor: "text-supporting",
  },
  {
    icon: Users,
    titleKey: "journey.interview",
    titleFallback: "Wawancara",
    descKey: "journey.interviewDesc",
    descFallback: "Sesi wawancara dengan tim rekrutmen FIM",
    color: "hsl(var(--primary))",
    bgColor: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    icon: GraduationCap,
    titleKey: "journey.training",
    titleFallback: "Pelatihan",
    descKey: "journey.trainingDesc",
    descFallback: "Ikuti pelatihan kepemimpinan intensif selama 6 bulan",
    color: "hsl(var(--accent))",
    bgColor: "bg-accent/10",
    iconColor: "text-accent-foreground",
  },
  {
    icon: Sparkles,
    titleKey: "journey.alumni",
    titleFallback: "Jadi Alumni",
    descKey: "journey.alumniDesc",
    descFallback: "Bergabung dengan jaringan 4000+ alumni di seluruh Indonesia",
    color: "hsl(var(--supporting))",
    bgColor: "bg-supporting/10",
    iconColor: "text-supporting",
  },
];

export default function FIMJourneyTimeline() {
  const { t } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [activeStep, setActiveStep] = useState<number | null>(null);

  return (
    <section className="py-16 bg-secondary overflow-hidden" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full mb-2">
            {t("journey.badge", "PERJALANAN DI FIM")}
          </span>
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
            {t("journey.title", "Dari Pendaftaran Hingga Alumni")}
          </h2>
          <p className="text-muted-foreground mt-2 max-w-lg mx-auto text-sm">
            {t("journey.subtitle", "6 langkah perjalanan transformatif di Forum Indonesia Muda")}
          </p>
        </motion.div>

        {/* Desktop: Horizontal Timeline */}
        <div className="hidden md:block">
          <div className="relative">
            {/* Connection Line */}
            <motion.div
              className="absolute top-10 left-[8%] right-[8%] h-0.5 bg-border"
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              style={{ transformOrigin: "left" }}
            />
            {/* Animated progress line */}
            <motion.div
              className="absolute top-10 left-[8%] right-[8%] h-0.5 bg-primary"
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ duration: 2, delay: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
              style={{ transformOrigin: "left" }}
            />

            <div className="grid grid-cols-6 gap-4">
              {steps.map((step, index) => (
                <motion.div
                  key={step.titleKey}
                  className="flex flex-col items-center text-center cursor-pointer group"
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.15 }}
                  onMouseEnter={() => setActiveStep(index)}
                  onMouseLeave={() => setActiveStep(null)}
                >
                  {/* Step Number + Icon */}
                  <motion.div
                    className={`relative w-20 h-20 rounded-full ${step.bgColor} flex items-center justify-center mb-4 border-2 border-background shadow-lg z-10`}
                    whileHover={{ scale: 1.15, y: -5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  >
                    <step.icon className={`h-8 w-8 ${step.iconColor}`} />
                    <span className="absolute -top-1 -right-1 w-6 h-6 bg-primary text-primary-foreground rounded-full text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                  </motion.div>

                  {/* Title */}
                  <h3 className="font-bold text-sm text-foreground mb-1 group-hover:text-primary transition-colors">
                    {t(step.titleKey, step.titleFallback)}
                  </h3>

                  {/* Description - expands on hover */}
                  <motion.p
                    className="text-xs text-muted-foreground leading-relaxed"
                    initial={false}
                    animate={{
                      opacity: activeStep === index ? 1 : 0.7,
                      height: activeStep === index ? "auto" : "2.5rem",
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {t(step.descKey, step.descFallback)}
                  </motion.p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile: Vertical Timeline */}
        <div className="md:hidden relative pl-8">
          {/* Vertical line */}
          <motion.div
            className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-primary"
            initial={{ scaleY: 0 }}
            animate={isInView ? { scaleY: 1 } : {}}
            transition={{ duration: 1.5, delay: 0.3 }}
            style={{ transformOrigin: "top" }}
          />

          <div className="space-y-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.titleKey}
                className="relative flex gap-4"
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.12 }}
              >
                {/* Dot */}
                <div className={`absolute -left-8 w-8 h-8 rounded-full ${step.bgColor} flex items-center justify-center border-2 border-background shadow-md z-10`}>
                  <step.icon className={`h-4 w-4 ${step.iconColor}`} />
                </div>

                {/* Content */}
                <div className="bg-card rounded-xl p-4 shadow-sm border flex-1 ml-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-primary">Langkah {index + 1}</span>
                  </div>
                  <h3 className="font-bold text-sm text-foreground">
                    {t(step.titleKey, step.titleFallback)}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t(step.descKey, step.descFallback)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
