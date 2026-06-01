const ACCENT = '#0D9488'; // teal — distinct from product category accents

export default function ReferenceCard({ card, onOpen }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(card)}
      className="group text-left bg-surface border border-border rounded-xl p-4 shadow-card hover:shadow-cardHover hover:border-borderHover transition-all relative overflow-hidden"
    >
      <span
        aria-hidden
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{ background: ACCENT }}
      />
      <div className="pl-2">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-[15px] font-semibold text-ink leading-snug">{card.name}</h3>
              <span
                className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider text-white"
                style={{ background: ACCENT }}
              >
                Reference
              </span>
            </div>
            <div className="mt-1 text-[11.5px] font-mono uppercase tracking-wider text-inkFaint">
              {card.subcategory}
            </div>
          </div>
        </div>

        <p className="text-[13.5px] text-inkBody leading-relaxed line-clamp-2 mb-3">
          {card.shortDescription}
        </p>

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono text-teal-700 bg-teal-50 border border-teal-200">
            RAM table
          </span>
          <span className="text-inkFaint group-hover:text-forti transition-colors text-[14px]">→</span>
        </div>
      </div>
    </button>
  );
}
