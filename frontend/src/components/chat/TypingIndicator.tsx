export default function TypingIndicator() {
  return (
    <div className="flex justify-start mt-5">
      <div className="bg-slate-800 rounded-xl px-5 py-4 text-white" role="status" aria-live="polite">
        🤖 AURA is thinking...
      </div>
    </div>
  );
}
