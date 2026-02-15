import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, Square, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface VoiceInputProps {
    onTranscript: (text: string) => void;
    onError?: (error: string) => void;
}

export function VoiceInput({ onTranscript, onError }: VoiceInputProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [audioLevel, setAudioLevel] = useState(0);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationIdRef = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            stopRecording();
            if (animationIdRef.current) {
                cancelAnimationFrame(animationIdRef.current);
            }
        };
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Set up audio visualization
            audioContextRef.current = new AudioContext();
            const source = audioContextRef.current.createMediaStreamSource(stream);
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 256;
            source.connect(analyserRef.current);

            visualizeAudio();

            // Set up media recorder
            mediaRecorderRef.current = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });

            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = async () => {
                setIsRecording(false);
                setAudioLevel(0);

                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                await transcribeAudio(audioBlob);

                // Clean up
                stream.getTracks().forEach(track => track.stop());
                if (audioContextRef.current) {
                    audioContextRef.current.close();
                }
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            toast.info('Recording started');
        } catch (error: any) {
            toast.error('Microphone access denied');
            onError?.(error.message);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            if (animationIdRef.current) {
                cancelAnimationFrame(animationIdRef.current);
            }
        }
    };

    const visualizeAudio = () => {
        if (!analyserRef.current) return;

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

        const updateLevel = () => {
            if (!analyserRef.current) return;

            analyserRef.current.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
            setAudioLevel(average / 255); // Normalize to 0-1

            animationIdRef.current = requestAnimationFrame(updateLevel);
        };

        updateLevel();
    };

    const transcribeAudio = async (audioBlob: Blob) => {
        setIsTranscribing(true);

        try {
            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.webm');

            const response = await fetch('/api.php?action=transcribe_audio', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Transcription failed');
            }

            const data = await response.json();

            if (data.success && data.data.text) {
                onTranscript(data.data.text);
                toast.success('Transcription complete');
            } else {
                throw new Error(data.error || 'Transcription failed');
            }
        } catch (error: any) {
            toast.error('Transcription error: ' + error.message);
            onError?.(error.message);
        } finally {
            setIsTranscribing(false);
        }
    };

    return (
        <div className="relative">
            <Button
                variant={isRecording ? 'destructive' : 'outline'}
                size="icon"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isTranscribing}
                className="relative overflow-hidden"
            >
                {isTranscribing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : isRecording ? (
                    <Square className="w-4 h-4" />
                ) : (
                    <Mic className="w-4 h-4" />
                )}

                {/* Audio level visualization */}
                {isRecording && (
                    <motion.div
                        className="absolute inset-0 bg-destructive/20"
                        animate={{
                            scale: 1 + audioLevel * 0.5,
                            opacity: audioLevel
                        }}
                        transition={{ duration: 0.05 }}
                    />
                )}
            </Button>

            {/* Recording indicator */}
            {isRecording && (
                <motion.div
                    className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                />
            )}
        </div>
    );
}
