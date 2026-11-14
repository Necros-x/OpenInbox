import { APP_NAME } from '../../shared/constants';

// Temporary monogram until the approved NECROS Mail logo is supplied.
// Keep this independent of the icon files so the final artwork can replace it cleanly.
export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <rect width="64" height="64" rx="16" fill="#1c1b19" />
      <rect x="1" y="1" width="62" height="62" rx="15" fill="none" stroke="#c2a16d" strokeOpacity=".65" strokeWidth="2" />
      <path d="M20 44V20l24 24V20" fill="none" stroke="#dbbd86" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ name = APP_NAME }: { name?: string }) {
  return (
    <div className="flex items-center gap-2">
      <LogoMark />
      <span className="text-[15px] font-semibold tracking-tight text-fg">{name}</span>
    </div>
  );
}
