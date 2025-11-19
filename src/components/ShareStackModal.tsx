"use client";

import { useState, useEffect } from "react";
import { X, Copy, Check, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateShareUrl } from "@/lib/share";
import { toast } from "sonner";
import QRCode from "qrcode";

interface ShareStackModalProps {
  itemIds: string[];
  isOpen: boolean;
  onClose: () => void;
}

export function ShareStackModal({ itemIds, isOpen, onClose }: ShareStackModalProps) {
  const [shareUrl, setShareUrl] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && itemIds.length > 0) {
      const url = generateShareUrl(itemIds);
      setShareUrl(url);

      // Generate QR code
      QRCode.toDataURL(url, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      }).then(setQrCodeUrl).catch(() => {
        // QR code generation failed - component will show share URL as fallback
      });
    }
  }, [isOpen, itemIds]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Share link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.download = 'gicm-stack-qr.png';
    link.href = qrCodeUrl;
    link.click();
    toast.success("QR code downloaded!");
  };

  const handleShareTwitter = () => {
    const text = `Check out my custom gICM stack with ${itemIds.length} items!`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const handleShareLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg bg-white rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-black/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-lime-500 grid place-items-center">
              <Share2 className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-black text-black">Share Your Stack</h2>
              <p className="text-sm text-black/60">{itemIds.length} items selected</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-black/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Share URL */}
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Share Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-4 py-2 rounded-lg border border-black/20 bg-black/5 text-sm text-black/80 font-mono"
                onClick={(e) => e.currentTarget.select()}
              />
              <Button
                onClick={handleCopy}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-black/60 mt-2">
              Anyone with this link can import your stack
            </p>
          </div>

          {/* QR Code */}
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              QR Code
            </label>
            <div className="flex flex-col items-center gap-3 p-4 bg-black/5 rounded-lg">
              {qrCodeUrl && (
                <img
                  src={qrCodeUrl}
                  alt="QR Code"
                  className="w-48 h-48 rounded-lg"
                />
              )}
              <Button
                onClick={handleDownloadQR}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Download QR Code
              </Button>
            </div>
            <p className="text-xs text-black/60 mt-2">
              Scan with your phone to share the stack
            </p>
          </div>

          {/* Social Sharing */}
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Share on Social Media
            </label>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleShareTwitter}
                className="flex-1 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white"
                size="sm"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
                Twitter
              </Button>
              <Button
                onClick={handleShareLinkedIn}
                className="flex-1 bg-[#0077b5] hover:bg-[#006399] text-white"
                size="sm"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-black/10 bg-black/5 rounded-b-2xl">
          <p className="text-xs text-black/60 text-center">
            Share your stack with teammates, on social media, or save the QR code for later
          </p>
        </div>
      </div>
    </>
  );
}
