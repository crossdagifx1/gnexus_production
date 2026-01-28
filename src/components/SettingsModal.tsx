import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Bell,
    Volume2,
    Zap,
    Shield,
    Smartphone,
    Globe,
    Cpu,
    Palette,
    Database,
    Languages,
    Keyboard,
    RefreshCw,
    HardDrive,
    Eye,
    Moon,
    Sun,
    Monitor
} from "lucide-react";
import { toast } from "sonner";

interface SettingsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
    const [temperature, setTemperature] = useState([0.7]);
    const [maxTokens, setMaxTokens] = useState([2048]);

    const handleClearCache = () => {
        toast.promise(
            new Promise((resolve) => setTimeout(resolve, 1500)),
            {
                loading: 'Clearing system cache...',
                success: 'Cache cleared successfully',
                error: 'Failed to clear cache',
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[800px] h-[600px] bg-[#0a0a0a] border-white/10 text-gray-200 flex flex-col p-0 overflow-hidden gap-0">
                <div className="p-6 border-b border-white/5 bg-[#0a0a0a]/50 backdrop-blur-xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-mono text-cyan-400 flex items-center gap-2">
                            <Cpu className="w-6 h-6 animate-pulse" />
                            SYSTEM CONTROL
                        </DialogTitle>
                        <DialogDescription className="text-gray-500 font-mono text-xs tracking-wider">
                            CONFIGURE G-CORE NEURAL PARAMETERS
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <Tabs defaultValue="general" className="flex-1 flex overflow-hidden">
                    <div className="w-[200px] border-r border-white/5 bg-[#0f0f0f]">
                        <TabsList className="flex flex-col h-full justify-start bg-transparent p-2 space-y-1 w-full">
                            <TabsTrigger
                                value="general"
                                className="w-full justify-start px-3 py-2 text-sm font-medium data-[state=active]:bg-white/10 data-[state=active]:text-cyan-400 rounded-md transition-all hover:bg-white/5 hover:text-gray-200 text-gray-400"
                            >
                                <Globe className="w-4 h-4 mr-3" />
                                General
                            </TabsTrigger>
                            <TabsTrigger
                                value="brain"
                                className="w-full justify-start px-3 py-2 text-sm font-medium data-[state=active]:bg-white/10 data-[state=active]:text-purple-400 rounded-md transition-all hover:bg-white/5 hover:text-gray-200 text-gray-400"
                            >
                                <Zap className="w-4 h-4 mr-3" />
                                AI Brain
                            </TabsTrigger>
                            <TabsTrigger
                                value="appearance"
                                className="w-full justify-start px-3 py-2 text-sm font-medium data-[state=active]:bg-white/10 data-[state=active]:text-pink-400 rounded-md transition-all hover:bg-white/5 hover:text-gray-200 text-gray-400"
                            >
                                <Palette className="w-4 h-4 mr-3" />
                                Appearance
                            </TabsTrigger>
                            <TabsTrigger
                                value="data"
                                className="w-full justify-start px-3 py-2 text-sm font-medium data-[state=active]:bg-white/10 data-[state=active]:text-green-400 rounded-md transition-all hover:bg-white/5 hover:text-gray-200 text-gray-400"
                            >
                                <Database className="w-4 h-4 mr-3" />
                                Data & Storage
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <ScrollArea className="flex-1 bg-[#0a0a0a]">
                        <div className="p-6 space-y-8">
                            {/* GENERAL TAB */}
                            <TabsContent value="general" className="mt-0 space-y-6 animate-in fade-in-50 slide-in-from-left-2 duration-300">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-mono text-cyan-400/70 border-b border-white/5 pb-2">INTERFACE PREFERENCES</h3>

                                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-md bg-blue-500/20 text-blue-400">
                                                <Volume2 className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-sm">Sound Effects</div>
                                                <div className="text-xs text-gray-500">Audio feedback for interactions</div>
                                            </div>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>

                                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-md bg-yellow-500/20 text-yellow-400">
                                                <Bell className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-sm">Push Notifications</div>
                                                <div className="text-xs text-gray-500">Alerts for task completion</div>
                                            </div>
                                        </div>
                                        <Switch />
                                    </div>

                                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-md bg-gray-500/20 text-gray-400">
                                                <Keyboard className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-sm">Keyboard Shortcuts</div>
                                                <div className="text-xs text-gray-500">Enable advanced hotkeys</div>
                                            </div>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                </div>
                                <div className="space-y-4 pt-4">
                                    <h3 className="text-sm font-mono text-cyan-400/70 border-b border-white/5 pb-2">LOCALIZATION</h3>
                                    <div className="flex flex-col gap-3">
                                        <Label>Language</Label>
                                        <Select defaultValue="en">
                                            <SelectTrigger className="w-full bg-white/5 border-white/10">
                                                <SelectValue placeholder="Select Language" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#1a1a1a] border-white/10 text-gray-200">
                                                <SelectItem value="en">English (US)</SelectItem>
                                                <SelectItem value="es">Español</SelectItem>
                                                <SelectItem value="fr">Français</SelectItem>
                                                <SelectItem value="jp">日本語</SelectItem>
                                                <SelectItem value="ru">Русский</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* BRAIN TAB */}
                            <TabsContent value="brain" className="mt-0 space-y-6 animate-in fade-in-50 slide-in-from-left-2 duration-300">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-mono text-purple-400/70 border-b border-white/5 pb-2">MODEL CONFIGURATION</h3>

                                    <div className="space-y-4 p-4 border border-purple-500/20 rounded-lg bg-purple-500/5">
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <Label className="text-purple-300">Creativity (Temperature)</Label>
                                                <span className="text-xs font-mono text-purple-400">{temperature[0]}</span>
                                            </div>
                                            <Slider
                                                value={temperature}
                                                onValueChange={setTemperature}
                                                max={1}
                                                step={0.1}
                                                className="py-4"
                                            />
                                            <p className="text-xs text-gray-500">Higher values produce more creative but less focused results.</p>
                                        </div>

                                        <div className="space-y-2 pt-4 border-t border-purple-500/20">
                                            <div className="flex justify-between">
                                                <Label className="text-purple-300">Response Length (Max Tokens)</Label>
                                                <span className="text-xs font-mono text-purple-400">{maxTokens[0]}</span>
                                            </div>
                                            <Slider
                                                value={maxTokens}
                                                onValueChange={setMaxTokens}
                                                min={256}
                                                max={4096}
                                                step={256}
                                                className="py-4"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-md bg-green-500/20 text-green-400">
                                                <Globe className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-sm">Web Search Access</div>
                                                <div className="text-xs text-gray-500">Allow real-time internet data</div>
                                            </div>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                </div>
                            </TabsContent>

                            {/* APPEARANCE TAB */}
                            <TabsContent value="appearance" className="mt-0 space-y-6 animate-in fade-in-50 slide-in-from-left-2 duration-300">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-mono text-pink-400/70 border-b border-white/5 pb-2">VISUAL ENHANCEMENTS</h3>

                                    <div className="grid grid-cols-3 gap-3">
                                        <button className="flex flex-col items-center gap-2 p-3 rounded-lg border border-cyan-500/50 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-all">
                                            <Monitor className="w-5 h-5" />
                                            <span className="text-xs font-medium">Cyberpunk</span>
                                        </button>
                                        <button className="flex flex-col items-center gap-2 p-3 rounded-lg border border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:border-white/20 transition-all">
                                            <Moon className="w-5 h-5" />
                                            <span className="text-xs font-medium">Dark</span>
                                        </button>
                                        <button className="flex flex-col items-center gap-2 p-3 rounded-lg border border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:border-white/20 transition-all">
                                            <Sun className="w-5 h-5" />
                                            <span className="text-xs font-medium">Light</span>
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors mt-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-md bg-pink-500/20 text-pink-400">
                                                <Eye className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-sm">Reduced Motion</div>
                                                <div className="text-xs text-gray-500">Disable heavy animations</div>
                                            </div>
                                        </div>
                                        <Switch />
                                    </div>

                                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-md bg-blue-500/20 text-blue-400">
                                                <Smartphone className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-sm">Compact Mode</div>
                                                <div className="text-xs text-gray-500">Incerased information density</div>
                                            </div>
                                        </div>
                                        <Switch />
                                    </div>
                                </div>
                            </TabsContent>

                            {/* DATA TAB */}
                            <TabsContent value="data" className="mt-0 space-y-6 animate-in fade-in-50 slide-in-from-left-2 duration-300">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-mono text-green-400/70 border-b border-white/5 pb-2">DATA MANAGEMENT</h3>

                                    <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-4">
                                        <div className="flex items-center gap-3 mb-2">
                                            <HardDrive className="w-5 h-5 text-gray-400" />
                                            <div className="flex-1">
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="text-gray-300">Local Storage Usage</span>
                                                    <span className="text-gray-400">12%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                                    <div className="h-full bg-green-500 w-[12%]"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <Button variant="outline" className="w-full justify-start text-red-400 hover:text-red-300 border-red-500/20 hover:bg-red-500/10" onClick={handleClearCache}>
                                                <RefreshCw className="w-4 h-4 mr-2" />
                                                Clear System Cache
                                            </Button>
                                            <Button variant="outline" className="w-full justify-start text-gray-400 border-white/10 hover:bg-white/5">
                                                <Database className="w-4 h-4 mr-2" />
                                                Export All Data (JSON)
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-lg border border-red-500/20 bg-red-500/5">
                                        <div className="flex items-start gap-3">
                                            <Shield className="w-5 h-5 text-red-500 mt-1" />
                                            <div className="space-y-2">
                                                <h4 className="text-sm font-medium text-red-400">Danger Zone</h4>
                                                <p className="text-xs text-red-400/70">
                                                    Irreversible actions. Proceed with caution.
                                                </p>
                                                <Button variant="destructive" size="sm" className="bg-red-500/20 text-red-500 hover:bg-red-500/30 border-red-500/50">
                                                    Delete All Data
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                        </div>
                    </ScrollArea>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
