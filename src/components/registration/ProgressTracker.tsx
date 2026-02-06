import { motion } from "framer-motion";
import { CheckCircle, FileText, MessageSquare, Award, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressTrackerProps {
  currentStage: string;
  finalResult?: string | null;
  selectionPassed?: boolean | null;
  className?: string;
}

const STAGES = [
  { 
    key: "administrasi", 
    label: "Administrasi", 
    shortLabel: "Admin",
    icon: FileText,
    description: "Review berkas pendaftaran" 
  },
  { 
    key: "wawancara", 
    label: "Wawancara", 
    shortLabel: "Interview",
    icon: MessageSquare,
    description: "Tahap wawancara dengan tim" 
  },
  { 
    key: "pengumuman", 
    label: "Pengumuman", 
    shortLabel: "Hasil",
    icon: Award,
    description: "Pengumuman hasil seleksi" 
  },
];

export function ProgressTracker({ 
  currentStage, 
  finalResult, 
  selectionPassed,
  className 
}: ProgressTrackerProps) {
  const currentStageIndex = STAGES.findIndex(s => s.key === currentStage);
  
  const getStageStatus = (stageIndex: number) => {
    if (finalResult === "tidak_lolos") {
      if (stageIndex < currentStageIndex) return "completed";
      if (stageIndex === currentStageIndex) return "failed";
      return "pending";
    }
    if (finalResult === "lolos") {
      return "completed";
    }
    if (stageIndex < currentStageIndex) return "completed";
    if (stageIndex === currentStageIndex) {
      if (currentStage === "administrasi" && selectionPassed === true) {
        return "completed";
      }
      return "active";
    }
    return "pending";
  };

  const getProgressPercentage = () => {
    if (finalResult === "lolos") return 100;
    if (finalResult === "tidak_lolos") return ((currentStageIndex) / STAGES.length) * 100;
    if (currentStage === "administrasi" && selectionPassed === true) return 35;
    if (currentStage === "administrasi") return 15;
    if (currentStage === "wawancara") return 55;
    if (currentStage === "pengumuman") return 85;
    return 10;
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Progress Bar */}
      <div className="relative mb-8">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary via-primary to-supporting"
            initial={{ width: 0 }}
            animate={{ width: `${getProgressPercentage()}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        <motion.div
          className="absolute top-0 h-2 w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full"
          initial={{ left: "-20%" }}
          animate={{ left: "100%" }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Stage Steps */}
      <div className="relative flex justify-between">
        {/* Connection Line */}
        <div className="absolute top-6 left-[10%] right-[10%] h-1 bg-muted -z-10" />
        <motion.div
          className="absolute top-6 left-[10%] h-1 bg-gradient-to-r from-supporting to-primary -z-10"
          initial={{ width: 0 }}
          animate={{ 
            width: `${Math.min(100, (currentStageIndex / (STAGES.length - 1)) * 80)}%` 
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />

        {STAGES.map((stage, index) => {
          const status = getStageStatus(index);
          const StageIcon = stage.icon;
          
          return (
            <div key={stage.key} className="flex flex-col items-center flex-1">
              {/* Icon Circle */}
              <motion.div
                className={cn(
                  "relative w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors",
                  status === "completed" && "bg-supporting border-supporting text-supporting-foreground",
                  status === "active" && "bg-primary border-primary text-primary-foreground",
                  status === "failed" && "bg-destructive border-destructive text-destructive-foreground",
                  status === "pending" && "bg-muted border-muted-foreground/30 text-muted-foreground"
                )}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.15, duration: 0.3 }}
              >
                {status === "completed" ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  >
                    <CheckCircle className="h-6 w-6" />
                  </motion.div>
                ) : status === "active" ? (
                  <>
                    <StageIcon className="h-5 w-5" />
                    {/* Pulse Animation */}
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-primary"
                      animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </>
                ) : (
                  <StageIcon className="h-5 w-5" />
                )}
              </motion.div>

              {/* Label */}
              <motion.div
                className="mt-3 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 + 0.2, duration: 0.3 }}
              >
                <p className={cn(
                  "text-xs font-medium",
                  status === "completed" && "text-supporting",
                  status === "active" && "text-primary",
                  status === "failed" && "text-destructive",
                  status === "pending" && "text-muted-foreground"
                )}>
                  <span className="hidden sm:inline">{stage.label}</span>
                  <span className="sm:hidden">{stage.shortLabel}</span>
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5 hidden md:block">
                  {stage.description}
                </p>
              </motion.div>

              {/* Status Badge */}
              {status === "active" && (
                <motion.div
                  className="mt-2 px-2 py-0.5 bg-primary/10 rounded-full"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-primary" />
                    <span className="text-[10px] font-medium text-primary">Berlangsung</span>
                  </div>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
