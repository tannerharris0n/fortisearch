export default function Nav() {
  return (
    <header className="sticky top-0 z-30 bg-surface border-b border-border">
      <div className="max-w-[1280px] mx-auto px-5 lg:px-8 h-14 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <span
            className="inline-flex items-center justify-center w-7 h-7 rounded-md text-white font-mono text-sm font-semibold"
            style={{ background: '#EE3124' }}
          >
            FS
          </span>
          <span className="text-[17px] font-bold tracking-tight text-ink">FortiSearch</span>
        </a>
        <a
          href="https://github.com/tannerharris0n/FortiSearch"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[13px] text-inkDim hover:text-ink px-3 py-1.5 rounded-md hover:bg-surfaceAlt transition-colors"
        >
          GitHub <span className="opacity-60">↗</span>
        </a>
      </div>
    </header>
  );
}
