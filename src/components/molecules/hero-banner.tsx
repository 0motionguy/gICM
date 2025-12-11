"use client";

import { useState } from "react";
import { BridgeModal } from "./bridge-modal";

/**
 * HeroBanner Component
 * Minimal - just provides BridgeModal functionality
 */
export function HeroBanner() {
  const [showBridge, setShowBridge] = useState(false);

  // Export the bridge toggle for other components
  if (typeof window !== "undefined") {
    (window as unknown as { openBridgeModal?: () => void }).openBridgeModal =
      () => setShowBridge(true);
  }

  return (
    <BridgeModal isOpen={showBridge} onClose={() => setShowBridge(false)} />
  );
}
