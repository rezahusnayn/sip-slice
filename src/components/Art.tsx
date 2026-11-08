/** Brand line-art: an original monstera leaf motif inspired by the café's mural,
 *  and a cup mark echoing the logo silhouette (drawn fresh, not traced). */

export function MonsteraLeaf({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 220" fill="none" aria-hidden="true" focusable="false">
      <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path className="draw" d="M100 214 C 98 170, 96 120, 100 18" />
        <path
          className="draw"
          d="M100 18 C 150 22, 190 70, 186 120 C 182 165, 140 196, 100 200 C 60 196, 18 165, 14 120 C 10 70, 50 22, 100 18 Z"
        />
        <path className="draw" d="M100 60 C 130 52, 160 60, 178 80" />
        <path className="draw" d="M100 98 C 135 92, 166 104, 186 124" />
        <path className="draw" d="M100 138 C 130 136, 156 150, 168 168" />
        <path className="draw" d="M100 60 C 70 52, 40 60, 22 80" />
        <path className="draw" d="M100 98 C 65 92, 34 104, 14 124" />
        <path className="draw" d="M100 138 C 70 136, 44 150, 32 168" />
      </g>
    </svg>
  );
}

export function CupMark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" aria-hidden="true" focusable="false">
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path className="steam" strokeWidth="3" d="M54 40 C 44 32, 62 24, 52 12" />
        <path className="steam" strokeWidth="3" d="M68 42 C 60 34, 76 28, 68 18" />
        <path strokeWidth="4" d="M24 56 C 30 52, 90 52, 96 56 C 94 78, 82 94, 60 96 C 40 94, 28 80, 24 56 Z" />
        <path strokeWidth="4" d="M96 62 C 110 62, 110 80, 92 82" />
        <path strokeWidth="3" d="M20 104 C 40 98, 80 98, 100 104" />
      </g>
    </svg>
  );
}
