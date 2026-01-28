/**
 * G-NEXUS AGENT PAGE - ADVANCED WORKFLOW CANVAS
 * Enhanced with sidebar controls and improved dark theme layout
 */

import { Navbar } from '@/components/Navbar';
import { SEO } from '@/components/SEO';
import { WorkflowCanvas } from '@/components/canvas';
import { AgentControls } from '@/components/agent/AgentControls';

export default function Agent() {
    return (
        <div className="flex flex-col h-screen bg-[#050505] overflow-hidden">
            <SEO
                title="Advanced AI Agent Workflow | G-Nexus Platform"
                description="Enterprise-grade AI workflow with advanced HTML generation, prompt engineering, and parallel processing"
            />

            <Navbar />

            {/* Main Content Area - positioned under navbar */}
            <div className="flex flex-1 pt-16">
                {/* Sidebar Controls */}
                <div className="w-80 bg-[#0a0a0a] border-r border-gray-800/50 overflow-y-auto">
                    <AgentControls />
                </div>

                {/* Workflow Canvas Container */}
                <div className="flex-1 relative bg-[#080808]">
                    {/* Subtle gradient background */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.05)_0%,transparent_50%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(139,92,246,0.03)_0%,transparent_50%)]" />

                    {/* Canvas Frame */}
                    <div className="absolute inset-3 border border-orange-500/10 rounded-2xl bg-[#0a0a0a] overflow-hidden shadow-2xl shadow-black/50">
                        {/* Frame header bar */}
                        <div className="h-10 bg-[#0f0f0f] border-b border-gray-800/50 flex items-center justify-between px-4">
                            <div className="flex items-center gap-3">
                                {/* Window controls */}
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-500/70 hover:bg-red-500 transition-colors cursor-pointer" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/70 hover:bg-yellow-500 transition-colors cursor-pointer" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/70 hover:bg-green-500 transition-colors cursor-pointer" />
                                </div>
                            </div>

                            {/* Title */}
                            <div className="px-4 py-1 bg-black/30 rounded-md">
                                <span className="text-[10px] text-white/50 font-mono tracking-wider">
                                    G-NEXUS ADVANCED WORKFLOW ENGINE
                                </span>
                            </div>

                            {/* Version badge */}
                            <div className="text-[10px] text-orange-500/70 font-mono">
                                v3.0
                            </div>
                        </div>

                        {/* Workflow Canvas */}
                        <div className="h-[calc(100%-40px)]">
                            <WorkflowCanvas />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
