export default function AIChatTypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      <div className="flex items-center gap-1 rounded-2xl bg-white/70 dark:bg-white/[0.025] backdrop-blur-xl border border-[var(--border-color)] px-4 py-3">
        <span
          className="inline-block h-2 w-2 rounded-full bg-indigo-400/70"
          style={{ animation: 'aiTypingBounce 1.4s ease-in-out infinite' }}
        />
        <span
          className="inline-block h-2 w-2 rounded-full bg-indigo-400/70"
          style={{ animation: 'aiTypingBounce 1.4s ease-in-out 0.2s infinite' }}
        />
        <span
          className="inline-block h-2 w-2 rounded-full bg-indigo-400/70"
          style={{ animation: 'aiTypingBounce 1.4s ease-in-out 0.4s infinite' }}
        />
      </div>
    </div>
  );
}
