"use client";

import { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export function OnboardingTour() {
  useEffect(() => {
    // Check if user has seen the tour
    const hasSeenTour = localStorage.getItem("clawdbot-tour-completed");

    if (!hasSeenTour) {
      // Wait for DOM to be ready
      const timer = setTimeout(() => {
        const driverObj = driver({
          showProgress: true,
          steps: [
            {
              element: ".search-input",
              popover: {
                title: "Welcome to ClawdBot!",
                description: "Start by searching for agents, skills, commands, or MCPs. Try searching for 'solana' or 'defi'!",
                side: "bottom",
                align: "start",
              },
            },
            {
              element: ".item-card:first-of-type",
              popover: {
                title: "Browse Items",
                description: "Each card shows an item you can add to your stack. Click the + button or 'Add to Stack' to include it in your custom configuration.",
                side: "right",
                align: "start",
              },
            },
            {
              element: "#stack-preview",
              popover: {
                title: "Stack Preview",
                description: "Your selected items appear here! Watch as your stack grows with each item you add. Progressive Disclosure saves 88-92% tokens!",
                side: "left",
                align: "start",
              },
            },
            {
              element: ".export-button",
              popover: {
                title: "Export Your Stack",
                description: "Ready to use your stack? Click here to copy the one-liner install command and paste it into Claude Code or your terminal!",
                side: "top",
                align: "start",
              },
            },
          ],
          onDestroyStarted: () => {
            // Mark tour as completed when user closes or finishes
            localStorage.setItem("clawdbot-tour-completed", "true");
            driverObj.destroy();
          },
        });

        driverObj.drive();
      }, 1500); // Increased delay to ensure DOM is ready

      return () => clearTimeout(timer);
    }
  }, []);

  return null;
}

/**
 * Hook to manually trigger the tour
 */
export function useOnboardingTour() {
  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      steps: [
        {
          element: ".search-input",
          popover: {
            title: "Welcome to ClawdBot!",
            description: "Start by searching for agents, skills, commands, or MCPs.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: ".item-card:first-of-type",
          popover: {
            title: "Browse Items",
            description: "Click 'Add to Stack' to include items in your configuration.",
            side: "right",
            align: "start",
          },
        },
        {
          element: "#stack-preview",
          popover: {
            title: "Stack Preview",
            description: "Your selected items appear here!",
            side: "left",
            align: "start",
          },
        },
        {
          element: ".export-button",
          popover: {
            title: "Export Your Stack",
            description: "Copy the install command and paste it into your terminal!",
            side: "top",
            align: "start",
          },
        },
      ],
    });

    driverObj.drive();
  };

  const resetTour = () => {
    localStorage.removeItem("clawdbot-tour-completed");
    startTour();
  };

  return { startTour, resetTour };
}
