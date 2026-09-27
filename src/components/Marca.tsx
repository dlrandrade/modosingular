export function Marca({ className = "", compacto = false }: { className?: string; compacto?: boolean }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg width={compacto ? 24 : 30} height={compacto ? 24 : 30} viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="16" r="14.5" fill="none" stroke="var(--line)" strokeWidth="1" />
        {[11, 8, 5].map((r, i) => (
          <path key={i} d={`M${16 - r} 16 a${r} ${r * 1.2} 0 0 1 ${r * 2} 0`}
                fill="none" stroke="var(--accent)" strokeWidth="1.5" opacity={1 - i * 0.22} />
        ))}
        <circle cx="16" cy="16" r="1.8" fill="var(--accent)" />
      </svg>
      <span className={`font-serif tracking-tight ${compacto ? "text-[1.15rem]" : "text-[1.4rem]"}`}>
        Modo Singular
      </span>
    </div>
  );
}
