import type { ReactNode } from 'react';
import { LogoMark } from '../../components/Logo';
import { APP_NAME, BRAND_PARENT, BRAND_TAGLINE } from '../../../shared/constants';
import { ThemeToggle } from '../../components/ThemeToggle';

export function AuthLayout({ title, subtitle, children, footer, wide }: { title: ReactNode; subtitle?: ReactNode; children: ReactNode; footer?: ReactNode; wide?: boolean }) {
  return (
    <div className="relative flex min-h-full flex-col items-center justify-center bg-bg px-4 py-12 sm:px-6">
      <ThemeToggle className="absolute top-4 right-4 sm:top-7 sm:right-7" />
      <div className={wide ? 'w-full max-w-2xl' : 'w-full max-w-[420px]'}>
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="grid h-[68px] w-[68px] place-items-center rounded-[22px] border border-border bg-surface shadow-card">
            <LogoMark size={46} />
          </div>
          <p className="mt-5 text-[10px] font-semibold tracking-[0.2em] text-faint">{BRAND_PARENT}</p>
          <p className="mt-1 text-[13px] font-semibold tracking-wide text-primary-text">{APP_NAME}</p>
          <h1 className="mt-4 text-[23px] font-semibold tracking-[-0.035em] text-fg sm:text-[25px]">{title}</h1>
          {subtitle ? <p className="mt-2 max-w-sm text-[13px] leading-5 text-muted">{subtitle}</p> : <p className="mt-2 text-[13px] text-muted">{BRAND_TAGLINE}</p>}
        </div>
        <div className="rounded-[20px] border border-border bg-surface px-5 py-6 shadow-card sm:px-7 sm:py-7">{children}</div>
        {footer && <div className="mt-5 text-center text-[13px] text-muted">{footer}</div>}
      </div>
    </div>
  );
}
