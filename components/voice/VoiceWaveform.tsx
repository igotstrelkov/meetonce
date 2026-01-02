interface VoiceWaveformProps {
  isActive: boolean;
}

export function VoiceWaveform({ isActive }: VoiceWaveformProps) {
  return (
    <div className="flex items-center justify-center gap-1 h-24">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className={`w-1 bg-primary rounded-full transition-all duration-300 ${
            isActive ? "animate-wave" : "h-2"
          }`}
          style={{
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
}
