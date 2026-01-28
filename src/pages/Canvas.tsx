/**
 * Canvas Page - Advanced Parallel Workflow Canvas
 * Features: Zustand state, parallel execution, live HTML preview
 * Dark theme with flow section directly under navbar
 */

import { Navbar } from '@/components/Navbar';
import { SEO } from '@/components/SEO';
import { WorkflowCanvas } from '@/components/canvas';

export default function CanvasPage() {
    return (
        <div className="flex flex-col min-h-screen bg-[#050505]">
            <SEO
                title="AI Workflow Canvas | G-Nexus"
                description="Parallel AI workflow with unlimited nodes and live HTML preview"
            />

            <Navbar />

            {/* Canvas Container - positioned right under navbar */}
            <div className="flex-1 w-full pt-20">
                <WorkflowCanvas />
            </div>
        </div>
    );
}
