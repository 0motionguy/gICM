/**
 * OPUS 67 Mode Selector Class
 * Stateful mode management with event emission
 */

import { EventEmitter } from 'eventemitter3';
import type { ModeName, ModeContext, DetectionResult } from './types.js';
import { detectMode } from './detection.js';

export interface ModeChangeEvent {
  from: ModeName;
  to: ModeName;
  manual: boolean;
  detection?: DetectionResult;
}

export interface ModeSelectorEvents {
  'mode:change': (event: ModeChangeEvent) => void;
}

/**
 * Mode Selector with event emission and history tracking
 */
export class ModeSelector extends EventEmitter<ModeSelectorEvents> {
  private currentMode: ModeName = 'auto';
  private modeHistory: Array<{ mode: ModeName; timestamp: Date; query: string }> = [];

  constructor() {
    super();
  }

  /**
   * Set mode manually
   */
  setMode(mode: ModeName): void {
    const previousMode = this.currentMode;
    this.currentMode = mode;
    this.emit('mode:change', { from: previousMode, to: mode, manual: true });
  }

  /**
   * Get current mode
   */
  getCurrentMode(): ModeName {
    return this.currentMode;
  }

  /**
   * Process a query and detect/switch mode
   */
  processQuery(context: ModeContext): DetectionResult {
    const detection = detectMode({
      ...context,
      previousMode: this.currentMode,
      userPreference: this.currentMode !== 'auto' ? this.currentMode : undefined
    });

    // Track mode history
    this.modeHistory.push({
      mode: detection.mode,
      timestamp: new Date(),
      query: context.query.slice(0, 100)
    });

    // Trim history
    if (this.modeHistory.length > 100) {
      this.modeHistory = this.modeHistory.slice(-100);
    }

    // Emit mode change if different
    if (detection.mode !== this.currentMode && this.currentMode === 'auto') {
      this.emit('mode:change', {
        from: this.currentMode,
        to: detection.mode,
        manual: false,
        detection
      });
    }

    return detection;
  }

  /**
   * Get mode usage statistics
   */
  getStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    for (const entry of this.modeHistory) {
      stats[entry.mode] = (stats[entry.mode] || 0) + 1;
    }
    return stats;
  }

  /**
   * Get mode history
   */
  getHistory(): Array<{ mode: ModeName; timestamp: Date; query: string }> {
    return [...this.modeHistory];
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.modeHistory = [];
  }
}

// Export singleton
export const modeSelector = new ModeSelector();
