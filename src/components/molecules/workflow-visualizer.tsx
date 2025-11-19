"use client";

import { motion } from "framer-motion";
import { Search, Terminal, Rocket, ArrowRight, Sparkles } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

const steps = [
    {
        id: "discover",
        title: "Discover",
        description: "Find the perfect AI agent, skill, or workflow for your stack.",
        icon: Search,
        color: "text-[#00F0FF]",
        bg: "bg-[#00F0FF]/10",
        border: "border-[#00F0FF]/20",
    },
    {
        id: "install",
        title: "Install",
        description: "Add to your project with a single command using our CLI.",
        icon: Terminal,
        color: "text-[#D97757]",
        bg: "bg-[#D97757]/10",
        border: "border-[#D97757]/20",
    },
    {
        id: "build",
        title: "Build",
        description: "Accelerate your development with pre-built, verified capabilities.",
        icon: Rocket,
        color: "text-[#10A37F]",
        bg: "bg-[#10A37F]/10",
        border: "border-[#10A37F]/20",
    },
];

export function WorkflowVisualizer() {
    return (
        <div className="w-full max-w-7xl mx-auto px-6 md:px-10 py-12">
            <div className="relative">
                {/* Connecting Line (Desktop) */}
                <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                    {steps.map((step, index) => (
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2, duration: 0.5 }}
                        >
                            <GlassCard className="h-full flex flex-col items-center text-center p-8 relative overflow-hidden group hover:border-white/20 transition-colors">
                                {/* Background Glow */}
                                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-b from-${step.color.replace('text-', '')}/5 to-transparent`} />

                                {/* Step Number */}
                                <div className="absolute top-4 right-4 text-[10px] font-mono text-white/20 font-bold">
                                    0{index + 1}
                                </div>

                                {/* Icon */}
                                <div className={`h-24 w-24 rounded-3xl ${step.bg} ${step.border} border grid place-items-center mb-6 relative group-hover:scale-110 transition-transform duration-500`}>
                                    <step.icon size={40} className={step.color} />

                                    {/* Floating Particles */}
                                    <motion.div
                                        animate={{
                                            y: [-5, 5, -5],
                                            opacity: [0.5, 1, 0.5]
                                        }}
                                        transition={{
                                            duration: 3,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                        className="absolute -top-2 -right-2"
                                    >
                                        <Sparkles size={16} className="text-white/40" />
                                    </motion.div>
                                </div>

                                {/* Content */}
                                <h3 className="text-xl font-bold text-white mb-3 font-display">{step.title}</h3>
                                <p className="text-sm text-zinc-400 leading-relaxed max-w-[250px]">
                                    {step.description}
                                </p>

                                {/* Arrow for next step (except last) */}
                                {index < steps.length - 1 && (
                                    <div className="hidden md:block absolute -right-4 top-12 text-white/10 transform translate-x-1/2">
                                        <ArrowRight size={24} />
                                    </div>
                                )}
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
