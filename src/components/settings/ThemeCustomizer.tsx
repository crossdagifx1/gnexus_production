import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Palette, Sun, Moon, Monitor, Check, Download, Upload, RefreshCw, Sparkles, Type, Layout, Paintbrush
} from 'lucide-react';

interface Theme { id: string; name: string; colors: { primary: string; secondary: string; accent: string; background: string; }; isDark: boolean; }

const ThemeCustomizer: React.FC = () => {
    const [activeTab, setActiveTab] = useState('presets');
    const [selectedTheme, setSelectedTheme] = useState('default');
    const [customColors, setCustomColors] = useState({ primary: '#6366f1', secondary: '#8b5cf6', accent: '#06b6d4', background: '#0f172a' });
    const [fontScale, setFontScale] = useState([100]);
    const [borderRadius, setBorderRadius] = useState([8]);
    const [isDark, setIsDark] = useState(true);
    const [animationsEnabled, setAnimationsEnabled] = useState(true);
    const [compactMode, setCompactMode] = useState(false);

    const themes: Theme[] = [
        { id: 'default', name: 'Midnight Blue', colors: { primary: '#6366f1', secondary: '#8b5cf6', accent: '#06b6d4', background: '#0f172a' }, isDark: true },
        { id: 'forest', name: 'Forest Green', colors: { primary: '#22c55e', secondary: '#16a34a', accent: '#84cc16', background: '#0a1f0a' }, isDark: true },
        { id: 'sunset', name: 'Sunset Orange', colors: { primary: '#f97316', secondary: '#ea580c', accent: '#fbbf24', background: '#1c1210' }, isDark: true },
        { id: 'ocean', name: 'Ocean Blue', colors: { primary: '#0ea5e9', secondary: '#0284c7', accent: '#38bdf8', background: '#0c1929' }, isDark: true },
        { id: 'rose', name: 'Rose Pink', colors: { primary: '#f43f5e', secondary: '#e11d48', accent: '#fb7185', background: '#1a0a10' }, isDark: true },
        { id: 'light', name: 'Clean Light', colors: { primary: '#6366f1', secondary: '#8b5cf6', accent: '#06b6d4', background: '#ffffff' }, isDark: false },
    ];

    const applyTheme = (theme: Theme) => {
        setSelectedTheme(theme.id);
        setCustomColors(theme.colors);
        setIsDark(theme.isDark);
    };

    const exportTheme = () => {
        const theme = { colors: customColors, fontScale: fontScale[0], borderRadius: borderRadius[0], isDark, animationsEnabled, compactMode };
        const blob = new Blob([JSON.stringify(theme, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'gnexus-theme.json';
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div><h1 className="text-3xl font-bold">Theme Customizer</h1><p className="text-muted-foreground">Personalize your experience</p></div>
                <div className="flex items-center gap-2">
                    <Button variant="outline"><Upload className="w-4 h-4 mr-2" />Import</Button>
                    <Button onClick={exportTheme}><Download className="w-4 h-4 mr-2" />Export</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="presets"><Sparkles className="w-4 h-4 mr-2" />Presets</TabsTrigger>
                            <TabsTrigger value="colors"><Palette className="w-4 h-4 mr-2" />Colors</TabsTrigger>
                            <TabsTrigger value="layout"><Layout className="w-4 h-4 mr-2" />Layout</TabsTrigger>
                        </TabsList>

                        <TabsContent value="presets" className="space-y-4">
                            <Card><CardHeader><CardTitle>Theme Presets</CardTitle><CardDescription>Choose a preset theme or customize your own</CardDescription></CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {themes.map((theme) => (
                                            <div key={theme.id} onClick={() => applyTheme(theme)}
                                                className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedTheme === theme.id ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'}`}>
                                                <div className="flex gap-1 mb-3">
                                                    {Object.values(theme.colors).slice(0, 3).map((color, i) => (
                                                        <div key={i} className="w-6 h-6 rounded-full" style={{ backgroundColor: color }} />
                                                    ))}
                                                </div>
                                                <p className="font-medium text-sm">{theme.name}</p>
                                                <Badge variant="outline" className="text-xs mt-1">{theme.isDark ? 'Dark' : 'Light'}</Badge>
                                                {selectedTheme === theme.id && <Check className="absolute top-2 right-2 w-5 h-5 text-primary" />}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="colors" className="space-y-4">
                            <Card><CardHeader><CardTitle>Custom Colors</CardTitle></CardHeader>
                                <CardContent className="space-y-6">
                                    {[{ key: 'primary', label: 'Primary Color' }, { key: 'secondary', label: 'Secondary Color' },
                                    { key: 'accent', label: 'Accent Color' }, { key: 'background', label: 'Background' }
                                    ].map((item) => (
                                        <div key={item.key} className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-lg border" style={{ backgroundColor: customColors[item.key as keyof typeof customColors] }} />
                                            <div className="flex-1"><Label>{item.label}</Label>
                                                <Input type="color" value={customColors[item.key as keyof typeof customColors]}
                                                    onChange={(e) => setCustomColors({ ...customColors, [item.key]: e.target.value })} className="h-10 w-full cursor-pointer" /></div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="layout" className="space-y-4">
                            <Card><CardHeader><CardTitle>Layout Settings</CardTitle></CardHeader>
                                <CardContent className="space-y-6">
                                    <div><Label>Font Scale: {fontScale}%</Label><Slider value={fontScale} onValueChange={setFontScale} min={75} max={150} step={5} className="mt-2" /></div>
                                    <div><Label>Border Radius: {borderRadius}px</Label><Slider value={borderRadius} onValueChange={setBorderRadius} min={0} max={20} step={2} className="mt-2" /></div>
                                    <div className="flex items-center justify-between"><div><Label>Animations</Label><p className="text-sm text-muted-foreground">Enable smooth transitions</p></div>
                                        <Switch checked={animationsEnabled} onCheckedChange={setAnimationsEnabled} /></div>
                                    <div className="flex items-center justify-between"><div><Label>Compact Mode</Label><p className="text-sm text-muted-foreground">Reduce spacing and padding</p></div>
                                        <Switch checked={compactMode} onCheckedChange={setCompactMode} /></div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Live Preview */}
                <Card><CardHeader><CardTitle>Live Preview</CardTitle></CardHeader>
                    <CardContent>
                        <div className="rounded-lg overflow-hidden border" style={{ backgroundColor: customColors.background }}>
                            <div className="p-4 border-b" style={{ borderColor: customColors.primary + '30' }}>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: customColors.primary }} />
                                    <span className="text-sm font-medium" style={{ color: isDark ? '#fff' : '#000' }}>Gnexus Preview</span></div>
                            </div>
                            <div className="p-4 space-y-3">
                                <div className="p-3 rounded" style={{ backgroundColor: customColors.primary, borderRadius: borderRadius[0] }}>
                                    <span className="text-white text-sm font-medium">Primary Button</span>
                                </div>
                                <div className="p-3 rounded border" style={{ backgroundColor: customColors.secondary + '20', borderColor: customColors.secondary, borderRadius: borderRadius[0] }}>
                                    <span className="text-sm" style={{ color: isDark ? '#fff' : '#000' }}>Secondary Card</span>
                                </div>
                                <div className="flex gap-2">
                                    <div className="flex-1 h-8 rounded" style={{ backgroundColor: customColors.accent, borderRadius: borderRadius[0] }} />
                                    <div className="flex-1 h-8 rounded" style={{ backgroundColor: customColors.primary, borderRadius: borderRadius[0] }} />
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setIsDark(!isDark)} className="flex-1">
                                {isDark ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}{isDark ? 'Light' : 'Dark'}
                            </Button>
                            <Button size="sm" className="flex-1"><Check className="w-4 h-4 mr-2" />Apply</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ThemeCustomizer;
