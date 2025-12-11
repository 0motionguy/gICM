"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";
import { useApiError, fetchWithError } from "@/hooks/use-api-error";
import { toast } from "sonner";

interface WaitlistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WaitlistModal({ open, onOpenChange }: WaitlistModalProps) {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const { isLoading, executeAsync } = useApiError();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    await executeAsync(
      () =>
        fetchWithError("/api/waitlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }),
      {
        context: "Waitlist",
        successMessage:
          "Successfully joined! Check your email for confirmation.",
        onSuccess: () => {
          setSuccess(true);

          // Close modal after 2.5 seconds
          setTimeout(() => {
            onOpenChange(false);
            setSuccess(false);
            setEmail("");
          }, 2500);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/10 bg-[#0F0F11] shadow-2xl shadow-[#00F0FF]/10 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-white">
            Join the Waitlist
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Get early access to gICM. We'll notify you when alpha keys are
            available.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-[#00F0FF]" />
            <h3 className="mb-2 text-xl font-bold text-white">
              You're on the list!
            </h3>
            <p className="text-sm text-zinc-400">
              Check your email for confirmation.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold text-white">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-zinc-500 focus:border-[#00F0FF] focus:ring-[#00F0FF]/20"
                  required
                  disabled={isLoading}
                  autoFocus
                />
              </div>
              <p className="text-xs text-zinc-500">
                We respect your privacy. No spam, ever.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#00F0FF] font-bold text-black hover:bg-[#00F0FF]/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Joining...
                  </>
                ) : (
                  "Join Waitlist"
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                className="w-full text-zinc-400 hover:bg-white/5 hover:text-white"
              >
                Maybe Later
              </Button>
            </div>

            <div className="border-t border-white/10 pt-4">
              <p className="text-center text-xs text-zinc-500">
                By joining, you agree to our{" "}
                <a href="/privacy" className="text-[#00F0FF] hover:underline">
                  Privacy Policy
                </a>{" "}
                and{" "}
                <a href="/terms" className="text-[#00F0FF] hover:underline">
                  Terms of Service
                </a>
                .
              </p>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
