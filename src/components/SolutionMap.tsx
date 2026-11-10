import { useEffect, useRef, useState } from 'react'
import {
  assetPath,
  capabilities,
  leftConnectors,
  rightConnectors,
  solutions,
  type Solution,
} from '../data/site'
import { RayneeCharacter, type OrbPalette } from './RayneeCharacter'

const CANVAS_W = 1312
const CANVAS_H = 700

export function SolutionMap() {
  const [selected, setSelected] = useState(0)
  const solution = solutions[selected]
  const active = new Set<string>(solution.caps)

  return (
    <div className="flex flex-col gap-x-[48px] gap-y-0">
      <DesktopCanvas selected={selected} onSelect={setSelected} active={active} />
      <MobileMap selected={selected} onSelect={setSelected} active={active} />
      <SelectedSolution solution={solution} />
    </div>
  )
}

type MapProps = { selected: number; onSelect: (i: number) => void; active: Set<string> }

function DesktopCanvas({ selected, onSelect, active }: MapProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setScale(Math.min(1, entry.contentRect.width / CANVAS_W)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={wrapRef} className="hidden w-full lg:block" style={{ height: CANVAS_H * scale }}>
      <div
        className="relative origin-top-left"
        style={{ width: CANVAS_W, height: CANVAS_H, transform: `scale(${scale})` }}
      >
        {/* Ambient glow behind the agent */}
        <div className="pointer-events-none absolute top-[200px] left-[456px] size-[400px] rounded-full bg-brand/[0.12] blur-[100px]" />

        {leftConnectors.map((c, i) => (
          <ConnectorLine key={`l${i}`} left={310} {...c} on={i === selected} files={c} />
        ))}
        {rightConnectors.map((c, i) => (
          <ConnectorLine key={`r${i}`} left={764} {...c} on={active.has(capabilities[i].id)} files={c} />
        ))}

        <div className="absolute top-[34px] left-0 flex w-[310px] flex-col gap-[12px]">
          <ColumnLabel>应用解决方案</ColumnLabel>
          {solutions.map((s, i) => (
            <SolutionButton key={s.id} label={s.name} active={i === selected} onClick={() => onSelect(i)} />
          ))}
        </div>

        <div className="absolute top-[98px] left-[1002px] flex w-[310px] flex-col gap-[12px]">
          <ColumnLabel>可复用 AI 能力</ColumnLabel>
          {capabilities.map((c) => (
            <CapabilityPill key={c.id} label={c.label} active={active.has(c.id)} />
          ))}
        </div>

        {/* Orb centre stays at (656, 378), where the connector lines meet. */}
        <div className="absolute top-[238px] left-[516px] flex w-[280px] flex-col items-center gap-[12px]">
          <AgentCore solutionId={solutions[selected].id} />
          <p className="w-full text-center font-sc-bold text-[28px] leading-[1.55] font-bold text-fg">雷霓 RayNee</p>
          <p className="w-full text-center font-sc-regular text-[14px] leading-[1.55] font-normal text-muted">
            主智能体 · 专业能力组合
          </p>
        </div>
      </div>
    </div>
  )
}

type ConnectorProps = {
  left: number
  top: number
  h: number
  on: boolean
  files: { off: [string, number]; on: [string, number] }
}

function ConnectorLine({ left, top, h, on, files }: ConnectorProps) {
  const layer = (file: string, svgH: number, className: string, visible: boolean) => (
    <span
      aria-hidden
      className={`svg-mask absolute block w-[238px] transition-opacity duration-500 ${className}`}
      style={{
        left,
        top: top - (svgH - h) / 2,
        height: svgH,
        opacity: visible ? 1 : 0,
        maskImage: `url(${assetPath(file)})`,
        WebkitMaskImage: `url(${assetPath(file)})`,
      }}
    />
  )
  return (
    <>
      {layer(files.off[0], files.off[1], 'bg-white/[0.13]', !on)}
      {layer(
        files.on[0],
        files.on[1],
        'animate-flow bg-[linear-gradient(90deg,#008755_0%,#2ee59d_20%,#008755_40%,#008755_100%)] bg-[length:476px_100%] drop-shadow-[0_0_6px_rgb(46_229_157/0.6)]',
        on,
      )}
    </>
  )
}

function ColumnLabel({ children }: { children: string }) {
  return (
    <p className="flex items-center gap-[8px] font-sc-regular text-[14px] leading-[1.55] font-normal text-muted">
      <span className="size-[6px] rounded-full bg-brand-bright/70" />
      {children}
    </p>
  )
}

function SolutionButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`group relative flex h-[52px] w-full shrink-0 cursor-pointer items-center rounded-[8px] border p-[14px] text-left transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-bright ${
        active
          ? 'border-brand-bright/30 bg-brand text-white shadow-[0_0_28px_-8px_rgb(0_135_85/0.6)]'
          : 'border-line bg-white/[0.025] text-muted hover:border-line-strong hover:bg-white/[0.05] hover:text-fg'
      }`}
    >
      <span className="font-sc-regular text-[18px] leading-[1.55] font-normal [word-break:break-word]">{label}</span>
      <span
        className={`ml-auto size-[6px] rounded-full transition-colors ${active ? 'bg-white' : 'bg-white/15 group-hover:bg-brand-bright/60'}`}
      />
    </button>
  )
}

function CapabilityPill({ label, active }: { label: string; active: boolean }) {
  return (
    <div
      className={`relative flex h-[52px] w-full shrink-0 items-center gap-[10px] rounded-[8px] border p-[14px] transition-all duration-500 ${
        active
          ? 'border-brand-bright/30 bg-brand/[0.15] text-white shadow-[inset_0_0_24px_-10px_rgb(46_229_157/0.3)]'
          : 'border-line bg-white/[0.015] text-dim'
      }`}
    >
      <span
        className={`size-[6px] shrink-0 rounded-full transition-all duration-500 ${active ? 'bg-brand-bright shadow-[0_0_8px_1px_rgb(46_229_157/0.5)]' : 'bg-white/15'}`}
      />
      <span className="font-sc-regular text-[18px] leading-[1.55] font-normal [word-break:break-word]">{label}</span>
    </div>
  )
}

// Each solution gets its own gradient for RayNee's body.
const orbPalettes: Record<string, OrbPalette> = {
  education: { hi: '#fff3c4', mid: '#ffd36b', edge: '#ffa36e', accent: '#ff8f8f' },
  elder: { hi: '#ffeede', mid: '#ffbe94', edge: '#f2856d', accent: '#ff9db0' },
  sleep: { hi: '#ece7ff', mid: '#a99bff', edge: '#6c5ad8', accent: '#d58cff' },
  home: { hi: '#ddfff4', mid: '#6be6c4', edge: '#1fa88c', accent: '#62c9ff' },
  emotion: { hi: '#ffe6f1', mid: '#ffa2c8', edge: '#e2628f', accent: '#ffb38a' },
  space: { hi: '#e3f5ff', mid: '#84ccff', edge: '#3f7fe2', accent: '#8f9bff' },
  lighting: { hi: '#fff7d9', mid: '#ffcb52', edge: '#f08b26', accent: '#ff6f61' },
  sales: { hi: '#f2ffdc', mid: '#bdeb66', edge: '#4fb86b', accent: '#ffd36b' },
  aftercare: { hi: '#e8edff', mid: '#97abff', edge: '#7a5cf0', accent: '#6fd8ff' },
  health: { hi: '#e0fcff', mid: '#74e2ea', edge: '#2f9fd1', accent: '#8ef0b0' },
}

function AgentCore({ solutionId }: { solutionId: string }) {
  return (
    <div className="relative size-[280px] shrink-0">
      <span className="absolute inset-0 animate-pulse-ring rounded-full border border-warm/30" />
      <span className="absolute inset-0 animate-pulse-ring rounded-full border border-white/15 [animation-delay:1.6s]" />
      <div className="absolute inset-0 rounded-full border border-line-strong bg-surface-2 shadow-[inset_0_0_48px_rgb(255_180_94/0.08)]" />
      <RayneeCharacter
        palette={orbPalettes[solutionId]}
        reactKey={solutionId}
        bubbles={false}
        orbits={false}
        className="absolute top-1/2 left-1/2 size-[280px] -translate-x-1/2 -translate-y-1/2"
      />
    </div>
  )
}

function MobileMap({ selected, onSelect, active }: MapProps) {
  return (
    <div className="flex flex-col gap-[32px] lg:hidden">
      <div className="flex flex-col gap-[12px]">
        <ColumnLabel>应用解决方案</ColumnLabel>
        <div className="grid grid-cols-1 gap-[10px] sm:grid-cols-2">
          {solutions.map((s, i) => (
            <SolutionButton key={s.id} label={s.name} active={i === selected} onClick={() => onSelect(i)} />
          ))}
        </div>
      </div>
      <div className="flex flex-col items-center gap-[12px] py-[8px]">
        <AgentCore solutionId={solutions[selected].id} />
        <p className="text-center font-sc-bold text-[28px] leading-[1.55] font-bold text-fg">雷霓 RayNee</p>
        <p className="text-center font-sc-regular text-[14px] leading-[1.55] font-normal text-muted">
          主智能体 · 专业能力组合
        </p>
      </div>
      <div className="flex flex-col gap-[12px]">
        <ColumnLabel>可复用 AI 能力</ColumnLabel>
        <div className="grid grid-cols-1 gap-[10px] sm:grid-cols-2">
          {capabilities.map((c) => (
            <CapabilityPill key={c.id} label={c.label} active={active.has(c.id)} />
          ))}
        </div>
      </div>
    </div>
  )
}

function SelectedSolution({ solution }: { solution: Solution }) {
  return (
    <div key={solution.id} className="flex animate-fade-up flex-col items-center gap-[12px] text-center" aria-live="polite">
      <p className="font-sc-bold text-[28px] leading-[1.55] font-bold text-fg">{solution.name}</p>
      <p className="font-sc-regular text-[18px] leading-[1.55] font-normal text-muted">{solution.description}</p>
    </div>
  )
}
