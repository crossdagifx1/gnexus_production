import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Mic,
    MicOff,
    Volume2,
    VolumeX,
    Play,
    Square,
    Settings,
    Globe,
    Brain,
    MessageCircle
} from 'lucide-react';
import { generateText, speechToText, textToSpeech } from '@/lib/ai';

interface VoiceMessage {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
    audioUrl?: string;
}

interface VoiceSettings {
    language: string;
    voice: string;
    speed: number;
    pitch: number;
    autoRespond: boolean;
}

const VoiceInteraction: React.FC = () => {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [messages, setMessages] = useState<VoiceMessage[]>([]);
    const [settings, setSettings] = useState<VoiceSettings>({
        language: 'en-US',
        voice: 'default',
        speed: 1.0,
        pitch: 1.0,
        autoRespond: true
    });
    const [isSupported, setIsSupported] = useState(false);
    const [volume, setVolume] = useState(1.0);

    const recognitionRef = useRef<any>(null);
    const synthesisRef = useRef<SpeechSynthesis | null>(null);

    const languages = [
        { value: 'en-US', label: 'English (US)' },
        { value: 'en-GB', label: 'English (UK)' },
        { value: 'es-ES', label: 'Spanish' },
        { value: 'fr-FR', label: 'French' },
        { value: 'de-DE', label: 'German' },
        { value: 'it-IT', label: 'Italian' },
        { value: 'pt-BR', label: 'Portuguese' },
        { value: 'ja-JP', label: 'Japanese' },
        { value: 'zh-CN', label: 'Chinese' },
        { value: 'ko-KR', label: 'Korean' },
    ];

    useEffect(() => {
        // Check browser support for speech recognition and synthesis
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const speechSynthesis = window.speechSynthesis;

        setIsSupported(!!SpeechRecognition && !!speechSynthesis);

        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = settings.language;

            recognition.onresult = (event: any) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript + ' ';
                    } else {
                        interimTranscript += transcript;
                    }
                }

                setTranscript(finalTranscript + interimTranscript);
            };

            recognition.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }

        synthesisRef.current = speechSynthesis;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            if (synthesisRef.current) {
                synthesisRef.current.cancel();
            }
        };
    }, [settings.language]);

    const startListening = () => {
        if (!recognitionRef.current || !isSupported) return;

        setTranscript('');
        setIsListening(true);
        recognitionRef.current.start();
    };

    const stopListening = () => {
        if (!recognitionRef.current) return;

        recognitionRef.current.stop();

        // Add the final transcript as a user message
        if (transcript.trim()) {
            const userMessage: VoiceMessage = {
                id: Date.now().toString(),
                text: transcript.trim(),
                isUser: true,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, userMessage]);

            // Auto-respond if enabled
            if (settings.autoRespond) {
                handleAIResponse(transcript.trim());
            }
        }
    };

    const handleAIResponse = async (userInput: string) => {
        try {
            const response = await generateText('planner', userInput);

            if (response.success && response.data) {
                const aiMessage: VoiceMessage = {
                    id: (Date.now() + 1).toString(),
                    text: response.data,
                    isUser: false,
                    timestamp: new Date()
                };

                setMessages(prev => [...prev, aiMessage]);

                // Auto-speak if enabled
                speakText(response.data);
            }
        } catch (error) {
            console.error('AI response failed:', error);
        }
    };

    const speakText = (text: string) => {
        if (!synthesisRef.current || !isSupported) return;

        // Cancel any ongoing speech
        synthesisRef.current.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = settings.language;
        utterance.rate = settings.speed;
        utterance.pitch = settings.pitch;
        utterance.volume = volume;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        synthesisRef.current.speak(utterance);
    };

    const stopSpeaking = () => {
        if (synthesisRef.current) {
            synthesisRef.current.cancel();
            setIsSpeaking(false);
        }
    };

    const clearMessages = () => {
        setMessages([]);
        setTranscript('');
    };

    const sendMessage = () => {
        if (!transcript.trim()) return;

        const userMessage: VoiceMessage = {
            id: Date.now().toString(),
            text: transcript.trim(),
            isUser: true,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setTranscript('');

        // Get AI response
        handleAIResponse(transcript.trim());
    };

    if (!isSupported) {
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="text-center py-8">
                        <VolumeX className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">Voice Interaction Not Supported</h3>
                        <p className="text-muted-foreground">
                            Your browser doesn't support speech recognition or synthesis.
                            Please try using a modern browser like Chrome, Firefox, or Edge.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Voice Interaction</h1>
                    <p className="text-muted-foreground">Hands-free AI conversation with speech recognition</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant={isListening ? 'destructive' : 'secondary'} className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${isListening ? 'animate-pulse' : ''}`} />
                        {isListening ? 'Listening' : 'Ready'}
                    </Badge>
                    {isSpeaking && (
                        <Badge variant="outline" className="flex items-center gap-1">
                            <Volume2 className="w-3 h-3" />
                            Speaking
                        </Badge>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="w-5 h-5" />
                            Voice Settings
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Language</label>
                            <Select value={settings.language} onValueChange={(value) =>
                                setSettings(prev => ({ ...prev, language: value }))
                            }>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {languages.map((lang) => (
                                        <SelectItem key={lang.value} value={lang.value}>
                                            {lang.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-sm font-medium">Speech Speed</label>
                            <input
                                type="range"
                                min="0.5"
                                max="2"
                                step="0.1"
                                value={settings.speed}
                                onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    speed: parseFloat(e.target.value)
                                }))}
                                className="w-full"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Slow</span>
                                <span>{settings.speed}x</span>
                                <span>Fast</span>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium">Volume</label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={volume}
                                onChange={(e) => setVolume(parseFloat(e.target.value))}
                                className="w-full"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Quiet</span>
                                <span>{Math.round(volume * 100)}%</span>
                                <span>Loud</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Auto-respond</label>
                            <input
                                type="checkbox"
                                checked={settings.autoRespond}
                                onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    autoRespond: e.target.checked
                                }))}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageCircle className="w-5 h-5" />
                            Voice Conversation
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Button
                                onClick={isListening ? stopListening : startListening}
                                variant={isListening ? 'destructive' : 'default'}
                                size="lg"
                                className="flex-1"
                            >
                                {isListening ? (
                                    <>
                                        <Square className="w-4 h-4 mr-2" />
                                        Stop Listening
                                    </>
                                ) : (
                                    <>
                                        <Mic className="w-4 h-4 mr-2" />
                                        Start Talking
                                    </>
                                )}
                            </Button>

                            <Button
                                onClick={isSpeaking ? stopSpeaking : () => speakText(transcript)}
                                variant="outline"
                                disabled={!transcript.trim()}
                            >
                                {isSpeaking ? (
                                    <VolumeX className="w-4 h-4" />
                                ) : (
                                    <Play className="w-4 h-4" />
                                )}
                            </Button>

                            <Button
                                onClick={clearMessages}
                                variant="outline"
                                size="sm"
                            >
                                Clear
                            </Button>
                        </div>

                        {transcript && (
                            <div className="p-3 bg-muted rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">Current Transcript</span>
                                    <Button
                                        onClick={sendMessage}
                                        size="sm"
                                        disabled={!transcript.trim()}
                                    >
                                        Send
                                    </Button>
                                </div>
                                <p className="text-sm">{transcript}</p>
                            </div>
                        )}

                        <div className="h-[400px] overflow-y-auto space-y-3 border rounded-lg p-4">
                            {messages.length === 0 ? (
                                <div className="text-center text-muted-foreground py-8">
                                    <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p>Start a conversation by clicking "Start Talking"</p>
                                </div>
                            ) : (
                                messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[70%] p-3 rounded-lg ${message.isUser
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-muted'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-medium">
                                                    {message.isUser ? 'You' : 'AI Assistant'}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {message.timestamp.toLocaleTimeString()}
                                                </span>
                                            </div>
                                            <p className="text-sm">{message.text}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default VoiceInteraction;
