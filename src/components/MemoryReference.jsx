import { useEffect } from 'react';

function formatRam(m) {
  if (typeof m.ramGB === 'number' && m.ramGB > 0) {
    const approx = m.confidence && m.confidence !== 'high';
    return (approx ? '~' : '') + m.ramGB + ' GB';
  }
  return null;
}

const CONFIDENCE_CHIP = {
  high: 'text-green bg-greenDim border-greenBorder',
  medium: 'text-amber bg-amberDim border-amberBorder',
  low: 'text-inkFaint bg-surfaceAlt border-border',
};

function ModelRow({ m }) {
  const ram = formatRam(m);
  return (
    <div className="flex items-start justify-between gap-3 px-3 py-2 rounded-lg odd:bg-surfaceAlt/60">
      <div className="min-w-0">
        <div className="text-[13px] text-ink font-medium">{m.model}</div>
        {m.note && (
          <div className="text-[11px] text-inkFaint leading-snug mt-0.5">{m.note}</div>
        )}
      </div>
      <div className="shrink-0 text-right">
        {ram ? (
          <span className="font-mono text-[13px] text-ink font-semibold">{ram}</span>
        ) : (
          <span className="font-mono text-[12px] text-inkFaint">not published</span>
        )}
        {m.confidence && m.confidence !== 'high' && ram && (
          <div
            className={`inline-flex items-center mt-0.5 px-1 rounded text-[9px] font-mono uppercase tracking-wider border ${
              CONFIDENCE_CHIP[m.confidence] || CONFIDENCE_CHIP.low
            }`}
            title="Community-sourced estimate — verify against the unit's own 'get hardware status'."
          >
            est.
          </div>
        )}
      </div>
    </div>
  );
}

export default function MemoryReference({ card, onClose }) {
  useEffect(() => {
    if (!card) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [card, onClose]);

  if (!card) return null;
  const ref = card.reference || {};
  const groups = ref.groups || [];
  const meta = ref.meta || {};

  return (
    <div
      className="fixed inset-0 z-50 flex animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label="Memory / RAM by model"
    >
      <div className="absolute inset-0 bg-black/35" onClick={onClose} />
      <div className="ml-auto w-full sm:w-[480px] h-full bg-surface shadow-panel border-l border-border overflow-y-auto animate-slideIn relative">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 inline-flex items-center justify-center rounded-md text-inkDim hover:text-ink hover:bg-surfaceAlt"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="px-6 sm:px-7 pt-7 pb-6 border-b border-border">
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.12em] text-inkFaint mb-2">
            <span>Reference</span>
            <span>&middot;</span>
            <span>{card.subcategory}</span>
          </div>
          <h2 className="text-[22px] font-bold text-ink tracking-tight mb-2">{card.name}</h2>
          <p className="text-[14px] text-inkBody leading-relaxed">{card.shortDescription}</p>
        </div>

        <div className="px-6 sm:px-7 py-6 space-y-7">
          {groups.map((g) => (
            <section key={g.label}>
              <h4 className="text-[11px] font-mono uppercase tracking-[0.12em] text-inkFaint mb-1.5">
                {g.label}
              </h4>
              {g.note && (
                <p className="text-[12px] text-inkDim leading-relaxed mb-2.5">{g.note}</p>
              )}
              <div className="space-y-0.5">
                {g.models.map((m) => (
                  <ModelRow key={m.model} m={m} />
                ))}
              </div>
            </section>
          ))}

          {meta.note && (
            <div className="px-3 py-2.5 rounded-lg bg-infoDim border border-infoBorder text-info text-[12px] leading-relaxed">
              {meta.note}
            </div>
          )}

          {meta.sources?.length > 0 && (
            <section>
              <h4 className="text-[11px] font-mono uppercase tracking-[0.12em] text-inkFaint mb-2.5">
                Sources
              </h4>
              <div className="space-y-1.5">
                {meta.sources.map((s) => (
                  <a
                    key={s.url}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-surfaceAlt hover:bg-hover border border-border hover:border-borderHover transition-colors text-[13px] text-ink group"
                  >
                    <span className="min-w-0 truncate">{s.label}</span>
                    <span className="text-inkFaint group-hover:text-forti transition-colors shrink-0">↗</span>
                  </a>
                ))}
              </div>
            </section>
          )}

          {meta.lastResearched && (
            <div className="pt-3 border-t border-border text-[11.5px] font-mono text-inkFaint">
              RAM data researched: {meta.lastResearched}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
