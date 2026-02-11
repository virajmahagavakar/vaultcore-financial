import { Shield } from "lucide-react";

interface VaultLogoProps {
  size?: number;
  className?: string;
}

const VaultLogo = ({ size = 40, className = "", showText = true }: VaultLogoProps & { showText?: boolean }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative">
        <div className="absolute inset-0 rounded-xl bg-primary/40 blur-lg animate-pulse-glow" />
        <div className="relative flex items-center justify-center rounded-xl bg-primary/10 border border-primary/50 p-2 shadow-glow">
          <Shield className="text-primary drop-shadow-[0_0_8px_rgba(14,165,233,0.5)]" size={size * 0.55} strokeWidth={2.5} />
        </div>
      </div>
      {showText && (
        <span className="font-display text-xl font-bold tracking-tight text-white drop-shadow-md">
          VaultCore
        </span>
      )}
    </div>
  );
};

export default VaultLogo;
