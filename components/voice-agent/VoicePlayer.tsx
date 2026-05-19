import { useRef, useState } from "react";
import { Play, Pause, Volume2 } from "lucide-react";

export function VoicePlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  };

  return (
    <div className="mt-3 flex items-center gap-3 rounded-md border border-border/60 bg-background/40 px-3 py-2">
      <button
        type="button"
        onClick={toggle}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90"
        aria-label={playing ? "Pause voice response" : "Play voice response"}
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 translate-x-[1px]" />}
      </button>
      <Volume2 className="h-4 w-4 text-muted-foreground" />
      <span className="text-xs text-muted-foreground">Voice response</span>
      <audio
        ref={audioRef}
        src={src}
        onEnded={() => setPlaying(false)}
        onPause={() => setPlaying(false)}
        className="hidden"
      />
    </div>
  );
}
