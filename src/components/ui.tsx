import type { ReactNode } from 'react'
import orbImage from '@/assets/media/raynee-orb.webp'

type ButtonProps = {
  href: string
  children: ReactNode
  variant?: 'primary' | 'secondary'
  /** Open in a new tab (for off-site links). */
  external?: boolean
}

export function Button({ href, children, variant = 'primary', external = false }: ButtonProps) {
  const base =
    'group/btn relative inline-flex items-center justify-center gap-[8px] overflow-clip rounded-[8px] border p-[12px] font-sc-medium text-[16px] font-medium leading-none whitespace-nowrap transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-bright'
  const styles =
    variant === 'primary'
      ? 'border-brand bg-brand text-white shadow-[0_8px_28px_-10px_rgb(0_135_85/0.55)] hover:border-brand-hover hover:bg-brand-hover hover:shadow-[0_10px_32px_-8px_rgb(0_160_102/0.65)]'
      : 'border-line-strong bg-white/[0.03] text-fg hover:border-white/30 hover:bg-white/[0.07]'
  return (
    <a href={href} className={`${base} ${styles}`} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
      {children}
    </a>
  )
}

type MediaFrameProps = {
  src: string
  alt: string
  className?: string
  /** CSS object-position, used to keep the product in frame for each crop. */
  position?: string
  imgClassName?: string
}

/** Product photography in the shared dark frame: hairline ring, corner ticks, bottom fade. */
export function MediaFrame({ src, alt, className = '', position = 'center', imgClassName = '' }: MediaFrameProps) {
  return (
    <div className={`relative isolate overflow-hidden rounded-[12px] border border-line bg-surface ${className}`}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={`absolute inset-0 -z-10 size-full object-cover ${imgClassName}`}
        style={{ objectPosition: position }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(5_8_7/0)_45%,rgb(5_8_7/0.55)_100%)]" />
      <div className="pointer-events-none absolute inset-0 rounded-[12px] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.06)]" />
      <Corners />
    </div>
  )
}

export function Corners({ tone = 'border-white/35' }: { tone?: string }) {
  const c = `pointer-events-none absolute size-[14px] ${tone}`
  return (
    <>
      <span className={`${c} top-[10px] left-[10px] border-t border-l`} />
      <span className={`${c} top-[10px] right-[10px] border-t border-r`} />
      <span className={`${c} bottom-[10px] left-[10px] border-b border-l`} />
      <span className={`${c} right-[10px] bottom-[10px] border-r border-b`} />
    </>
  )
}

type OrbProps = {
  className?: string
  /** Show slowly rotating orbit rings around the orb. */
  orbits?: boolean
}

/** RayNee agent visual: the orb with a warm halo and optional orbit rings. */
export function RayneeOrb({ className = '', orbits = true }: OrbProps) {
  return (
    <div className={`grid aspect-square place-items-center ${/\b(absolute|fixed)\b/.test(className) ? '' : 'relative'} ${className}`}>
      <div className="absolute inset-[6%] rounded-full bg-warm/35 blur-[48px]" />
      {orbits && (
        <>
          <span className="absolute inset-[-22%] animate-spin-slow rounded-full border border-dashed border-white/[0.12]" />
          <span className="absolute inset-[-48%] rounded-full border border-white/[0.05]" />
          <span className="absolute top-1/2 right-[-22%] size-[7px] -translate-y-1/2 rounded-full bg-brand-bright/80 shadow-[0_0_10px_2px_rgb(46_229_157/0.45)]" />
        </>
      )}
      <img
        src={orbImage}
        alt="雷霓 RayNee"
        className="relative size-full animate-float object-contain drop-shadow-[0_18px_40px_rgb(255_150_80/0.35)]"
      />
    </div>
  )
}

export function SectionHeading({ index, title, lead }: { index: string; title: string; lead: string }) {
  return (
    <div className="flex flex-col gap-[16px]">
      <span className="flex items-center gap-[10px] font-mono text-[12px] tracking-[0.18em] text-muted uppercase">
        <span className="h-px w-[20px] bg-brand-bright/70" />
        {index}
      </span>
      <h2 className="font-sc-bold text-[26px] leading-[1.35] font-bold text-fg sm:text-[30px]">{title}</h2>
      <p className="max-w-[960px] font-sc-regular text-[17px] leading-[1.65] font-normal text-muted">{lead}</p>
    </div>
  )
}
