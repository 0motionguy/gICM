"use client";

import { motion } from "framer-motion";
import { Users, Zap, MapPin, Ghost, Search } from "lucide-react";

const ecosystemItems = [
  {
    name: "Moltbook",
    description: "AI Social Network",
    icon: Users,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
  },
  {
    name: "ClawHub",
    description: "Skills Marketplace",
    icon: Zap,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/20",
  },
  {
    name: "ClawCon",
    description: "SF Meetup (Feb 4, 2026)",
    icon: MapPin,
    color: "text-red-400",
    bg: "bg-red-400/10",
    border: "border-red-400/20",
  },
  {
    name: "OnlyCrabs",
    description: "Soul/Personality Marketplace",
    icon: Ghost,
    color: "text-pink-400",
    bg: "bg-pink-400/10",
    border: "border-pink-400/20",
  },
  {
    name: "MoltyScan",
    description: "Agent Explorer",
    icon: Search,
    color: "text-green-400",
    bg: "bg-green-400/10",
    border: "border-green-400/20",
  },
];

export function ClawbotEcosystem() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12 md:px-10">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-white md:text-3xl">
          The Clawbot Ecosystem
        </h2>
        <p className="mt-2 text-zinc-400">
          Everything you need to build, deploy, and socialize your agents.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {ecosystemItems.map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
            className={`group flex flex-col items-center rounded-xl border ${item.border} ${item.bg} p-6 text-center backdrop-blur-sm transition-all hover:-translate-y-1 hover:bg-opacity-20`}
          >
            <div
              className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full border ${item.border} ${item.bg}`}
            >
              <item.icon className={`h-6 w-6 ${item.color}`} />
            </div>
            <h3 className="mb-1 font-bold text-white">{item.name}</h3>
            <p className="text-xs text-zinc-400">{item.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
