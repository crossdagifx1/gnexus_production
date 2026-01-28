import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
    Accessibility, Eye, Type, Volume2, VolumeX, MousePointer, Keyboard, Monitor,
    Sun, Moon, Contrast, ZoomIn, Pause, Play, Focus, Hand, MessageSquare
} from 'lucide-react';

const AccessibilityPanel: React.FC = () => {
    const [settings, setSettings] = useState({
        screenReader: false, highContrast: false, reducedMotion: false, largeText: false, dyslexiaFont: false,
        keyboardNav: true, focusIndicators: true, autoPlayPause: true, textToSpeech: false, voiceControl: false,
        cursorSize: 'medium', colorBlindMode: 'none', textSpacing: 1, lineHeight: 1.5
    });
    const [fontSize, setFontSize] = useState([100]);
    const [cursorSize, setCursorSize] = useState([1]);

    const updateSetting = (key: string, value: any) => setSettings({ ...settings, [key]: value });

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div><h1 className="text-3xl font-bold">Accessibility</h1><p className="text-muted-foreground">Customize your experience for better accessibility</p></div>
                <Badge variant="outline" className="flex items-center gap-1"><Accessibility className="w-4 h-4" />A11y Enabled</Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Vision */}
                <Card><CardHeader><CardTitle className="flex items-center gap-2"><Eye className="w-5 h-5" />Vision</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        {[{ key: 'highContrast', label: 'High Contrast', desc: 'Increase contrast for better visibility', icon: Contrast },
                        { key: 'largeText', label: 'Large Text', desc: 'Increase default text size', icon: Type },
                        { key: 'dyslexiaFont', label: 'Dyslexia-Friendly Font', desc: 'Use OpenDyslexic font', icon: Type }
                        ].map((item) => (
                            <div key={item.key} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                <div className="flex items-center gap-3"><item.icon className="w-5 h-5 text-muted-foreground" />
                                    <div><p className="font-medium text-sm">{item.label}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div></div>
                                <Switch checked={settings[item.key as keyof typeof settings] as boolean} onCheckedChange={(c) => updateSetting(item.key, c)} />
                            </div>
                        ))}
                        <div className="space-y-2"><Label>Font Size: {fontSize}%</Label><Slider value={fontSize} onValueChange={setFontSize} min={75} max={200} step={25} /></div>
                        <div className="space-y-2"><Label>Color Blind Mode</Label>
                            <Select value={settings.colorBlindMode} onValueChange={(v) => updateSetting('colorBlindMode', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent><SelectItem value="none">None</SelectItem><SelectItem value="protanopia">Protanopia</SelectItem>
                                    <SelectItem value="deuteranopia">Deuteranopia</SelectItem><SelectItem value="tritanopia">Tritanopia</SelectItem></SelectContent>
                            </Select></div>
                    </CardContent>
                </Card>

                {/* Motion & Animation */}
                <Card><CardHeader><CardTitle className="flex items-center gap-2"><Pause className="w-5 h-5" />Motion & Animation</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        {[{ key: 'reducedMotion', label: 'Reduce Motion', desc: 'Minimize animations and transitions', icon: Pause },
                        { key: 'autoPlayPause', label: 'Pause Auto-Play', desc: 'Stop auto-playing videos/animations', icon: Play }
                        ].map((item) => (
                            <div key={item.key} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                <div className="flex items-center gap-3"><item.icon className="w-5 h-5 text-muted-foreground" />
                                    <div><p className="font-medium text-sm">{item.label}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div></div>
                                <Switch checked={settings[item.key as keyof typeof settings] as boolean} onCheckedChange={(c) => updateSetting(item.key, c)} />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Navigation */}
                <Card><CardHeader><CardTitle className="flex items-center gap-2"><Keyboard className="w-5 h-5" />Navigation</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        {[{ key: 'keyboardNav', label: 'Keyboard Navigation', desc: 'Navigate using keyboard only', icon: Keyboard },
                        { key: 'focusIndicators', label: 'Enhanced Focus Indicators', desc: 'Show clear focus outlines', icon: Focus }
                        ].map((item) => (
                            <div key={item.key} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                <div className="flex items-center gap-3"><item.icon className="w-5 h-5 text-muted-foreground" />
                                    <div><p className="font-medium text-sm">{item.label}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div></div>
                                <Switch checked={settings[item.key as keyof typeof settings] as boolean} onCheckedChange={(c) => updateSetting(item.key, c)} />
                            </div>
                        ))}
                        <div className="space-y-2"><Label>Cursor Size: {cursorSize[0] === 1 ? 'Normal' : cursorSize[0] === 2 ? 'Large' : 'Extra Large'}</Label>
                            <Slider value={cursorSize} onValueChange={setCursorSize} min={1} max={3} step={1} /></div>
                    </CardContent>
                </Card>

                {/* Audio & Speech */}
                <Card><CardHeader><CardTitle className="flex items-center gap-2"><Volume2 className="w-5 h-5" />Audio & Speech</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        {[{ key: 'screenReader', label: 'Screen Reader Support', desc: 'Optimize for screen readers', icon: MessageSquare },
                        { key: 'textToSpeech', label: 'Text to Speech', desc: 'Read content aloud', icon: Volume2 },
                        { key: 'voiceControl', label: 'Voice Control', desc: 'Control using voice commands', icon: Hand }
                        ].map((item) => (
                            <div key={item.key} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                <div className="flex items-center gap-3"><item.icon className="w-5 h-5 text-muted-foreground" />
                                    <div><p className="font-medium text-sm">{item.label}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div></div>
                                <Switch checked={settings[item.key as keyof typeof settings] as boolean} onCheckedChange={(c) => updateSetting(item.key, c)} />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <Card><CardContent className="p-4 flex items-center justify-between">
                <div><p className="font-medium">Keyboard Shortcuts</p><p className="text-sm text-muted-foreground">Press ? anywhere to view shortcuts</p></div>
                <Button variant="outline"><Keyboard className="w-4 h-4 mr-2" />View Shortcuts</Button>
            </CardContent></Card>
        </div>
    );
};

export default AccessibilityPanel;
