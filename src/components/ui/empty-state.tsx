import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#00F0FF]/10 to-[#7000FF]/10 border border-white/5 flex items-center justify-center mb-6 shadow-2xl">
        <Icon className="w-10 h-10 text-[#00F0FF] opacity-80" />
      </div>

      <h3 className="text-2xl font-bold text-white mb-3 font-display tracking-tight">
        {title}
      </h3>

      <p className="text-zinc-400 mb-8 max-w-md leading-relaxed">
        {description}
      </p>

      {(action || secondaryAction) && (
        <div className="flex gap-4">
          {action && (
            <Button 
              onClick={action.onClick}
              className="bg-white text-black hover:bg-zinc-200 font-bold"
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button 
              variant="outline" 
              onClick={secondaryAction.onClick}
              className="border-white/10 text-white hover:bg-white/5"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}