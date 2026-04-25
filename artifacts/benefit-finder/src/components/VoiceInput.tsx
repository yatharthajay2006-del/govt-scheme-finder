import { useState, useEffect } from "react";
import { useParseVoiceInput } from "@workspace/api-client-react";
import { EligibilityProfile } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Mic, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";

interface VoiceInputProps {
  language: "en" | "hi";
  onTranscript: (text: string) => void;
  onParsed?: (profile: EligibilityProfile, fields: string[]) => void;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

// Ensure type safety for webkitSpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function VoiceInput({ language, onTranscript, onParsed, className, variant = "secondary", size = "default" }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [isSupported, setIsSupported] = useState(true);
  
  const parseVoiceMutation = useParseVoiceInput();
  const { toast } = useToast();
  const { t } = useI18n();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recog = new SpeechRecognition();
        recog.continuous = false;
        recog.interimResults = false;
        setRecognition(recog);
      } else {
        setIsSupported(false);
      }
    }
  }, []);

  useEffect(() => {
    if (recognition) {
      recognition.lang = language === "hi" ? "hi-IN" : "en-IN";
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
        
        if (onParsed) {
          parseVoiceMutation.mutate(
            { data: { text: transcript, language } },
            {
              onSuccess: (res) => {
                onParsed(res.profile, res.extractedFields);
                if (res.extractedFields.length > 0) {
                  toast({
                    title: "Information extracted",
                    description: `Updated ${res.extractedFields.length} fields based on your voice input.`,
                  });
                }
              },
              onError: () => {
                toast({
                  title: "Couldn't extract information",
                  description: "Please try speaking clearly or enter details manually.",
                  variant: "destructive"
                });
              }
            }
          );
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        if (event.error !== "no-speech") {
          toast({
            title: "Microphone error",
            description: "Could not hear you. Please check permissions.",
            variant: "destructive"
          });
        }
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
    }
  }, [recognition, language, onTranscript, onParsed, parseVoiceMutation, toast]);

  const toggleListening = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!recognition) return;
    
    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
      } catch (err) {
        console.error("Error starting recognition", err);
      }
    }
  };

  if (!isSupported) {
    return (
      <Button disabled variant="outline" size={size} className={`gap-2 opacity-50 ${className}`}>
        <Mic size={16} />
        {size !== "icon" && <span>{t("voice.unsupported")}</span>}
      </Button>
    );
  }

  const isLoading = parseVoiceMutation.isPending;

  return (
    <Button
      variant={isListening ? "default" : variant}
      size={size}
      onClick={toggleListening}
      disabled={isLoading}
      className={`gap-2 transition-all ${isListening ? "animate-pulse bg-red-500 hover:bg-red-600 text-white shadow-lg" : ""} ${className}`}
      type="button"
    >
      {isLoading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Mic size={16} className={isListening ? "animate-bounce" : ""} />
      )}
      {size !== "icon" && (
        <span>
          {isLoading ? "Processing..." : isListening ? t("voice.listen") : t("voice.start")}
        </span>
      )}
    </Button>
  );
}