"use client";

import { useState } from "react";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";

interface AgentPromptViewerProps {
  content: string;
  fileName?: string;
}

const COLLAPSIBLE_SECTIONS = [
  "Production Rust Code Examples",
  "Security Checklist",
  "Real-World Example Workflows",
  "Example Workflows",
];

interface Section {
  title: string;
  content: string;
  isCollapsible: boolean;
}

export function AgentPromptViewer({ content, fileName }: AgentPromptViewerProps) {
  const sections = parseContentIntoSections(content);

  return (
    <div className="rounded-xl border border-white/10 bg-[#0F0F11] p-6 space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <FileText size={20} className="text-[#00F0FF]" />
        <div>
          <h3 className="text-sm font-semibold text-white">Full Agent Prompt</h3>
          {fileName && <p className="text-xs text-zinc-500 font-mono">{fileName}</p>}
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {sections.map((section, idx) => (
          <Section key={idx} section={section} />
        ))}
      </div>
    </div>
  );
}

function Section({ section }: { section: Section }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!section.isCollapsible) {
    return (
      <div className="prose prose-invert prose-sm max-w-none">
        {formatContent(section.content)}
      </div>
    );
  }

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden bg-white/[0.02]">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-zinc-300">{section.title}</h3>
          <span className="text-[10px] text-zinc-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
            {isExpanded ? "Collapse" : "Expand"}
          </span>
        </div>
        {isExpanded ? <ChevronUp size={16} className="text-zinc-500" /> : <ChevronDown size={16} className="text-zinc-500" />}
      </button>

      {isExpanded && (
        <div className="p-4 prose prose-invert prose-sm max-w-none border-t border-white/5 bg-black/20">
          {formatContent(section.content)}
        </div>
      )}
    </div>
  );
}

function parseContentIntoSections(text: string): Section[] {
  const lines = text.split("\n");
  const sections: Section[] = [];
  let currentTitle = "";
  let currentIsCollapsible = false;
  let currentContent: string[] = [];

  const saveCurrentSection = () => {
    if (currentTitle) {
      sections.push({
        title: currentTitle,
        content: currentContent.join("\n"),
        isCollapsible: currentIsCollapsible,
      });
    }
  };

  for (const line of lines) {
    if (line.startsWith("## ")) {
      saveCurrentSection();
      currentTitle = line.replace("## ", "");
      currentIsCollapsible = COLLAPSIBLE_SECTIONS.includes(currentTitle);
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }
  saveCurrentSection();

  if (sections.length === 0) {
    sections.push({
      title: "Content",
      content: text,
      isCollapsible: false,
    });
  }

  return sections;
}

function formatContent(text: string): JSX.Element[] {
  const lines = text.split("\n");
  const formatted: JSX.Element[] = [];
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];

  lines.forEach((line, idx) => {
    if (line.startsWith("```")) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBlockContent = [];
      } else {
        formatted.push(
          <div key={idx} className="rounded-lg bg-black/40 border border-white/10 p-3 my-2 overflow-x-auto">
            <code className="text-sm text-[#00F0FF] font-mono whitespace-pre">
              {codeBlockContent.join("\n")}
            </code>
          </div>
        );
        inCodeBlock = false;
        codeBlockContent = [];
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      return;
    }

    if (line.startsWith("### ")) {
      formatted.push(
        <h4 key={idx} className="text-sm font-bold text-white mt-4 mb-2">
          {line.replace("### ", "")}
        </h4>
      );
    } else if (line.startsWith("# ")) {
      formatted.push(
        <h2 key={idx} className="text-lg font-bold text-white mt-6 mb-3 border-b border-white/10 pb-2">
          {line.replace("# ", "")}
        </h2>
      );
    }
    else if (line.trim().startsWith("- [ ]")) {
      formatted.push(
        <div key={idx} className="flex items-start gap-2 text-sm text-zinc-400 mb-1">
          <input type="checkbox" className="mt-1 accent-[#00F0FF]" disabled />
          <span>{line.replace("- [ ]", "").trim()}</span>
        </div>
      );
    }
    else if (line.startsWith("- ") || line.startsWith("* ")) {
      formatted.push(
        <li key={idx} className="text-sm text-zinc-400 ml-4 mb-1 marker:text-zinc-600">
          {line.replace(/^[-*] /, "")}
        </li>
      );
    }
    else if (line.includes("**")) {
      const parts = line.split("**");
      formatted.push(
        <p key={idx} className="text-sm text-zinc-400 leading-relaxed mb-2">
          {parts.map((part, i) =>
            i % 2 === 1 ? (
              <strong key={i} className="font-semibold text-white">
                {part}
              </strong>
            ) : (
              part
            )
          )}
        </p>
      );
    }
    else if (line.includes("`") && !line.startsWith("```")) {
      const parts = line.split("`");
      formatted.push(
        <p key={idx} className="text-sm text-zinc-400 leading-relaxed mb-2">
          {parts.map((part, i) =>
            i % 2 === 1 ? (
              <code key={i} className="bg-white/10 px-1 py-0.5 rounded font-mono text-xs text-zinc-300">
                {part}
              </code>
            ) : (
              part
            )
          )}
        </p>
      );
    }
    else if (line.trim().length > 0) {
      formatted.push(
        <p key={idx} className="text-sm text-zinc-400 leading-relaxed mb-2">
          {line}
        </p>
      );
    }
    else {
      formatted.push(<div key={idx} className="h-2" />);
    }
  });

  return formatted;
}