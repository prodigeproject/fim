import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Home, 
  FileText, 
  User, 
  Settings,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRegistrationAuth } from "@/contexts/RegistrationAuthContext";
import { toast } from "sonner";

interface NavItem {
  icon: typeof Home;
  label: string;
  path: string;
  action?: () => void;
}

interface MobileBottomNavProps {
  className?: string;
}

export function MobileBottomNav({ className }: MobileBottomNavProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useRegistrationAuth();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Berhasil keluar");
    navigate("/portal");
  };

  const navItems: NavItem[] = [
    { icon: Home, label: "Dashboard", path: "/portal/dashboard" },
    { icon: FileText, label: "Formulir", path: "/portal/pelatihan" },
    { icon: User, label: "Profil", path: "/portal/profile" },
    { icon: LogOut, label: "Keluar", path: "", action: handleSignOut },
  ];

  const handleNavClick = (item: NavItem) => {
    if (item.action) {
      item.action();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <nav 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden safe-area-bottom",
        className
      )}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <button
              key={item.label}
              onClick={() => handleNavClick(item)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full min-w-[64px] min-h-[44px] relative touch-manipulation",
                "transition-colors duration-200",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={item.label}
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-b-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <Icon className={cn("h-5 w-5", isActive && "scale-110")} />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
