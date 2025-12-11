"use client";

import { api } from "@/lib/api";
import { useDashboardStore } from "@/lib/store";
import { Search, FileText, PenTool } from "lucide-react";

export function EngineControls() {
  const { fetchEngines, fetchEvents } = useDashboardStore();

  const handleRunDiscovery = async () => {
    try {
      await api.runDiscovery();
      fetchEvents();
    } catch {
      // Discovery failed silently - UI will show lack of updates
    }
  };

  const handleGenerateBlog = async () => {
    try {
      await api.generateContent("blog");
      fetchEvents();
    } catch {
      // Blog generation failed silently - UI will show lack of updates
    }
  };

  const handleGenerateTweet = async () => {
    try {
      await api.generateContent("tweet");
      fetchEvents();
    } catch {
      // Tweet generation failed silently - UI will show lack of updates
    }
  };

  return (
    <div className="rounded-lg bg-gray-800 p-6">
      <h2 className="mb-4 text-lg font-semibold text-white">Quick Actions</h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <button
          onClick={handleRunDiscovery}
          className="flex flex-col items-center rounded-lg bg-gray-700 p-4 transition-colors hover:bg-gray-600"
        >
          <Search className="mb-2 h-6 w-6 text-blue-400" />
          <span className="text-sm text-white">Run Discovery</span>
          <span className="text-xs text-gray-400">Product Engine</span>
        </button>

        <button
          onClick={handleGenerateBlog}
          className="flex flex-col items-center rounded-lg bg-gray-700 p-4 transition-colors hover:bg-gray-600"
        >
          <FileText className="mb-2 h-6 w-6 text-green-400" />
          <span className="text-sm text-white">Generate Blog</span>
          <span className="text-xs text-gray-400">Growth Engine</span>
        </button>

        <button
          onClick={handleGenerateTweet}
          className="flex flex-col items-center rounded-lg bg-gray-700 p-4 transition-colors hover:bg-gray-600"
        >
          <PenTool className="mb-2 h-6 w-6 text-purple-400" />
          <span className="text-sm text-white">Generate Tweet</span>
          <span className="text-xs text-gray-400">Growth Engine</span>
        </button>
      </div>
    </div>
  );
}
