/**
 * G-NEXUS AGENT - COMING SOON PAGE
 * Advanced design with animated elements and futuristic aesthetics
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Cpu, Network, Zap, ArrowRight, Mail, Bell, Clock, ChevronRight } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function AgentPage() {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [particles, setParticles] = useState<Array<{ x: number; y: number; size: number; delay: number }>>([]);

    // Generate floating particles
    useEffect(() => {
        const newParticles = Array.from({ length: 50 }, (_, i) => ({
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 3 + 1,
            delay: Math.random() * 5
        }));
        setParticles(newParticles);
    }, []);

    // Track mouse for gradient effect
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth) * 100,
                y: (e.clientY / window.innerHeight) * 100
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            setSubscribed(true);
            setTimeout(() => setSubscribed(false), 3000);
        }
    };

    const features = [
        {
            icon: <Network className="w-6 h-6" />,
            title: "Multi-Agent Collaboration",
            description: "Multiple AI agents working together to solve complex tasks"
        },
        {
            icon: <Cpu className="w-6 h-6" />,
            title: "Advanced Reasoning",
            description: "Chain-of-thought processing for complex problem solving"
        },
        {
            icon: <Zap className="w-6 h-6" />,
            title: "Real-Time Learning",
            description: "Agents that adapt and learn from interactions"
        }
    ];

    const timeline = [
        { phase: "Phase 1", title: "Core Architecture", status: "completed" },
        { phase: "Phase 2", title: "Agent Framework", status: "completed" },
        { phase: "Phase 3", title: "Integration & Testing", status: "in-progress" },
        { phase: "Phase 4", title: "Public Launch", status: "upcoming" }
    ];

    return (
        <div className="min-h-screen bg-[#050505] overflow-hidden relative">
            <SEO
                title="AI Agent Platform | G-Nexus - Coming Soon"
                description="The next generation of AI agents is arriving. Be the first to experience autonomous AI assistants."
            />

            <Navbar />

            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                {/* Gradient Orbs */}
                <motion.div
                    className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-orange-500/10 blur-[120px]"
                    animate={{
                        x: mousePosition.x * 2 - 100,
                        y: mousePosition.y * 2 - 100
                    }}
                    transition={{ duration: 0.5 }}
                />
                <motion.div
                    className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-500/10 blur-[100px]"
                    animate={{
                        x: (100 - mousePosition.x) * 2 - 100,
                        y: (100 - mousePosition.y) * 2 - 100
                    }}
                    transition={{ duration: 0.5 }}
                />

                {/* Floating Particles */}
                {particles.map((particle, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full bg-orange-500/20"
                        style={{
                            left: `${particle.x}%`,
                            top: `${particle.y}%`,
                            width: particle.size,
                            height: particle.size
                        }}
                        animate={{
                            y: [0, -100, 0],
                            opacity: [0, 1, 0]
                        }}
                        transition={{
                            duration: 10,
                            delay: particle.delay,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    />
                ))}
            </div>

            {/* Main Content */}
            <div className="relative z-10 pt-24">
                {/* Hero Section */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center"
                    >
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 mb-8"
                        >
                            <Sparkles className="w-4 h-4 text-orange-500" />
                            <span className="text-sm text-orange-400 font-medium">Coming Soon</span>
                        </motion.div>

                        {/* Headline */}
                        <h1 className="text-5xl md:text-7xl font-bold mb-6">
                            <span className="bg-gradient-to-r from-white via-gray-200 to-gray-500 bg-clip-text text-transparent">
                                Next Generation
                            </span>
                            <br />
                            <span className="bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">
                                AI Agents
                            </span>
                        </h1>

                        {/* Subheadline */}
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12">
                            Experience the future of autonomous AI assistants. Multi-agent collaboration,
                            advanced reasoning, and real-time learning — all in one powerful platform.
                        </p>

                        {/* CTA Section */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                            <form onSubmit={handleSubscribe} className="flex w-full max-w-md">
                                <div className="relative flex-1">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <Input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-12 pr-4 py-6 bg-white/5 border-white/10 rounded-l-xl text-white placeholder:text-gray-500 focus:border-orange-500/50 focus:ring-orange-500/20"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="px-8 py-6 bg-gradient-to-r from-orange-500 to-orange-600 rounded-r-xl hover:from-orange-600 hover:to-orange-700"
                                >
                                    {subscribed ? (
                                        <motion.span initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                                            ✓ Subscribed
                                        </motion.span>
                                    ) : (
                                        <>
                                            Notify Me
                                            <Bell className="w-4 h-4 ml-2" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </div>

                        {/* Countdown */}
                        <div className="flex items-center justify-center gap-8 mb-20">
                            {[
                                { value: "14", label: "Days" },
                                { value: "08", label: "Hours" },
                                { value: "45", label: "Minutes" },
                                { value: "22", label: "Seconds" }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 + i * 0.1 }}
                                    className="text-center"
                                >
                                    <div className="text-4xl md:text-5xl font-bold text-white mb-1">
                                        {item.value}
                                    </div>
                                    <div className="text-sm text-gray-500 uppercase tracking-wider">
                                        {item.label}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Features Section */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="grid md:grid-cols-3 gap-8"
                    >
                        {features.map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.2 }}
                                className="group p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-orange-500/30 hover:bg-orange-500/5 transition-all duration-300"
                            >
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500/20 to-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <div className="text-orange-400">
                                        {feature.icon}
                                    </div>
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-400">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>

                {/* Roadmap Section */}
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl font-bold text-white text-center mb-12">
                            Development Roadmap
                        </h2>

                        <div className="relative">
                            {/* Progress Line */}
                            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-500 via-purple-500 to-gray-700" />

                            {/* Timeline Items */}
                            <div className="space-y-8">
                                {timeline.map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.2 }}
                                        className="flex items-center gap-6 pl-8 relative"
                                    >
                                        {/* Status Indicator */}
                                        <div className={`
                                            absolute left-0 w-16 h-16 rounded-full flex items-center justify-center border-2
                                            ${item.status === 'completed' ? 'bg-green-500/20 border-green-500' : ''}
                                            ${item.status === 'in-progress' ? 'bg-orange-500/20 border-orange-500 animate-pulse' : ''}
                                            ${item.status === 'upcoming' ? 'bg-gray-800/50 border-gray-600' : ''}
                                        `}>
                                            {item.status === 'completed' && (
                                                <div className="w-6 h-6 rounded-full bg-green-500" />
                                            )}
                                            {item.status === 'in-progress' && (
                                                <div className="w-4 h-4 rounded-full bg-orange-500 animate-ping" />
                                            )}
                                        </div>

                                        <div className="flex-1 p-6 rounded-xl bg-white/5 border border-white/10 ml-10">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="text-sm text-orange-400 font-medium">
                                                        {item.phase}
                                                    </span>
                                                    <h4 className="text-lg font-semibold text-white mt-1">
                                                        {item.title}
                                                    </h4>
                                                </div>
                                                <Badge
                                                    className={`
                                                        ${item.status === 'completed' ? 'bg-green-500/20 text-green-400 border-green-500/30' : ''}
                                                        ${item.status === 'in-progress' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : ''}
                                                        ${item.status === 'upcoming' ? 'bg-gray-700 text-gray-400 border-gray-600' : ''}
                                                    `}
                                                >
                                                    {item.status.replace('-', ' ')}
                                                </Badge>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* CTA Banner */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative p-12 rounded-3xl bg-gradient-to-br from-orange-500/10 via-purple-500/10 to-pink-500/10 border border-white/10 overflow-hidden"
                    >
                        {/* Animated Background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-purple-500/5 to-pink-500/5" />
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            style={{ width: '200%' }}
                        />

                        <div className="relative text-center">
                            <h2 className="text-3xl font-bold text-white mb-4">
                                Be Among the First
                            </h2>
                            <p className="text-gray-400 mb-8 max-w-lg mx-auto">
                                Join our exclusive early access program and help shape the future of AI agents.
                            </p>
                            <Button
                                size="lg"
                                className="bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700"
                            >
                                Get Early Access
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </div>
                    </motion.div>
                </div>

                {/* Footer */}
                <div className="border-t border-white/10 py-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-2 text-gray-500">
                                <Clock className="w-4 h-4" />
                                <span>Last updated: February 2024</span>
                            </div>
                            <div className="flex items-center gap-6">
                                <a href="#" className="text-gray-500 hover:text-white transition-colors text-sm">
                                    Privacy Policy
                                </a>
                                <a href="#" className="text-gray-500 hover:text-white transition-colors text-sm">
                                    Terms of Service
                                </a>
                                <a href="#" className="text-gray-500 hover:text-white transition-colors text-sm">
                                    Contact
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
