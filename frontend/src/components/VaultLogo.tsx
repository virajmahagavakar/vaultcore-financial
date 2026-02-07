import { Shield } from "lucide-react";

interface VaultLogoProps {
  size?: number;
  className?: string;
}

const VaultLogo = ({ size = 40, className = "" }: VaultLogoProps) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative">
        <div className="absolute inset-0 rounded-xl bg-primary/30 blur-lg" />
        <div className="relative flex items-center justify-center rounded-xl bg-primary/10 border border-primary/30 p-2">
          <Shield className="text-primary" size={size * 0.55} strokeWidth={2.5} />
        </div>
      </div>
      <span className="font-display text-xl font-bold tracking-tight text-foreground">
        VaultCore
      </span>
    </div>
  );
};

export default VaultLogo;
