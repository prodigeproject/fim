import { Calendar, Users, MapPin, Award } from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";

interface RegistrationStatsProps {
  className?: string;
}

export function RegistrationStats({ className }: RegistrationStatsProps) {
  const stats = [
    { 
      icon: Calendar, 
      value: 34, 
      prefix: ">", 
      suffix: "",
      label: "Angkatan" 
    },
    { 
      icon: Users, 
      value: 4000, 
      prefix: "", 
      suffix: "+",
      label: "Alumni" 
    },
    { 
      icon: MapPin, 
      value: 61, 
      prefix: "", 
      suffix: "",
      label: "Regional" 
    },
    { 
      icon: Award, 
      value: 100, 
      prefix: "", 
      suffix: "+",
      label: "Proyek/Tahun" 
    },
  ];

  return (
    <div className={className}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatItem key={stat.label} stat={stat} />
        ))}
      </div>
    </div>
  );
}

interface StatItemProps {
  stat: {
    icon: React.ComponentType<{ className?: string }>;
    value: number;
    prefix: string;
    suffix: string;
    label: string;
  };
}

function StatItem({ stat }: StatItemProps) {
  const { ref, formattedCount } = useCountUp({
    end: stat.value,
    duration: 2000,
    prefix: stat.prefix,
    suffix: stat.suffix,
  });

  return (
    <div 
      ref={ref}
      className="bg-card rounded-xl p-4 lg:p-6 text-center shadow-md hover:shadow-lg transition-shadow"
    >
      <stat.icon className="h-7 w-7 text-primary mx-auto mb-2" />
      <div className="text-2xl lg:text-3xl font-bold text-foreground mb-1">
        {formattedCount}
      </div>
      <div className="text-xs lg:text-sm text-muted-foreground">
        {stat.label}
      </div>
    </div>
  );
}
