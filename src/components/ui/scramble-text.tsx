"use client";

import { useState, useEffect } from "react";
import { ScrambledText as BaseScrambledText } from "scrambled-text";

interface ScrambleTextProps {
  text: string;
  duration?: number;
  trigger?: "hover" | "mount";
  className?: string;
  continuous?: boolean;
}

/**
 * ScrambleText Component
 * Wrapper around scrambled-text with ClawdBot defaults
 *
 * @param text - The text to scramble
 * @param duration - Animation duration in ms (default: 400)
 * @param trigger - When to trigger animation: "hover" or "mount" (default: "mount")
 * @param className - Additional CSS classes
 * @param continuous - If true, animation loops infinitely (default: false)
 *
 * Note: For hover trigger, parent component should conditionally render
 * this component only when hovered to trigger the animation.
 */
export function ScrambleText({
  text,
  duration = 400,
  trigger = "mount",
  className = "",
  continuous = false
}: ScrambleTextProps) {
  const [scrambleKey, setScrambleKey] = useState(0);

  // Continuous loop: remount component with new key to restart animation
  useEffect(() => {
    if (!continuous) return;

    const intervalId = setInterval(() => {
      setScrambleKey(k => k + 1);
    }, duration);

    return () => clearInterval(intervalId);
  }, [continuous, duration]);

  return (
    <span className={className}>
      <BaseScrambledText
        key={continuous ? scrambleKey : undefined}
        text={text}
        duration={duration}
        interval={10}
        running={true}
        config={{
          sequential: false,
          preserveWhitespace: true,
          preserveCasing: true,
        }}
      />
    </span>
  );
}
