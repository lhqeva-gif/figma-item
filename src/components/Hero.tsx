import { useEffect, useRef, useState } from 'react'
import deskLamp from '@/assets/media/desk-lamp.webp'
import floorLamp from '@/assets/media/floor-lamp.webp'
import bedsideLamp from '@/assets/media/bedside-lamp.webp'
import orbImage from '@/assets/media/raynee-orb.webp'
import { capabilities } from '../data/site'
import { RayneeCharacter } from './RayneeCharacter'
import { Button } from './ui'

const container = 'mx-auto w-full max-w-[1440px] px-[20px] sm:px-[40px] xl:px-[64px]'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function Hero() {
  return (
    <section id="top" className="relative isolate overflow-hidden border-b border-line">
      <HeroBackdrop />

      <div className={`${container} pt-[56px] pb-[40px] sm:pt-[72px] xl:pt-[88px]`}>
        <div className="flex flex-col gap-[40px] lg:flex-row lg:items-center lg:gap-[40px]">
          <div className="relative z-10 flex flex-col items-start gap-[24px] lg:w-[560px] lg:shrink-0">
            <h1 className="font-sc-bold text-[38px] font-bold text-fg sm:text-[52px] [word-break:break-word]">
              <span className="block leading-[1.2]">让 AI 走进产品，</span>
              <span className="block leading-[1.2]">
                <span className="bg-[linear-gradient(90deg,#eef3f0_0%,#bfe6d4_55%,#2ee59d_100%)] bg-clip-text text-transparent">
                  让能力连接场景。
                </span>
                <span
                  aria-hidden
                  className="ml-[4px] inline-block h-[0.85em] w-[4px] translate-y-[0.12em] animate-blink rounded-[1px] bg-brand-bright"
                />
              </span>
            </h1>
            <p className="font-sc-regular text-[17px] leading-[1.65] font-normal text-muted">
              雷霓 RayNee 与生态伙伴共同调用 AI、知识与工具，把交互能力转化为可落地的产品和服务。
            </p>
            <div className="mt-[16px] flex flex-wrap items-center gap-x-[14px] gap-y-[10px] border-t border-line pt-[20px]">
              <span className="font-mono text-[11px] tracking-[0.18em] text-dim uppercase">Open Protocols</span>
              <div className="flex flex-wrap gap-[8px]">
                {['Skills', 'MCP', 'CLI', 'API'].map((t) => (
                  <span
                    key={t}
                    className="rounded-[6px] border border-line bg-white/[0.02] px-[8px] py-[4px] font-mono text-[12px] leading-none text-muted"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="relative lg:min-w-0 lg:flex-1">
            <AICore />
            <AgentConsole />
          </div>
        </div>
      </div>

      <CapabilityTicker />
    </section>
  )
}

/* ---------------------------------------------------------------- backdrop */

function HeroBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <NeuralField className="absolute inset-0 size-full [mask-image:radial-gradient(ellipse_75%_80%_at_68%_45%,black_30%,transparent_80%)]" />
      {/* Perspective grid floor */}
      <div className="absolute inset-x-0 bottom-0 h-[46%] overflow-hidden [mask-image:linear-gradient(to_top,black_10%,transparent_95%)]">
        <div className="bg-grid absolute inset-x-[-50%] bottom-0 h-[200%] origin-bottom animate-grid-scroll [transform:perspective(520px)_rotateX(64deg)]" />
      </div>
      <div className="absolute -top-[280px] right-[-140px] size-[680px] rounded-full bg-brand/[0.14] blur-[140px]" />
      <div className="absolute top-[30%] right-[18%] size-[320px] rounded-full bg-warm/[0.07] blur-[110px]" />
      <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgb(255_255_255/0.12),transparent)]" />
    </div>
  )
}

/** Canvas particle network: drifting nodes linked by proximity; links to the pointer glow green. */
function NeuralField({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const reduce = prefersReducedMotion()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let w = 0
    let h = 0
    let raf = 0
    let visible = true
    const pointer = { x: -9999, y: -9999 }
    type Pt = { x: number; y: number; vx: number; vy: number; hot: boolean }
    let pts: Pt[] = []

    const resize = () => {
      const r = canvas.getBoundingClientRect()
      w = r.width
      h = r.height
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const n = Math.round(Math.min(96, (w * h) / 13000))
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        hot: Math.random() < 0.1,
      }))
    }

    const LINK = 130
    const POINTER = 180
    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      for (const p of pts) {
        if (!reduce) {
          p.x += p.vx
          p.y += p.vy
          if (p.x < 0 || p.x > w) p.vx *= -1
          if (p.y < 0 || p.y > h) p.vy *= -1
        }
      }
      ctx.lineWidth = 1
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i]
        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j]
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          if (d < LINK) {
            ctx.strokeStyle = `rgba(255,255,255,${(1 - d / LINK) * 0.13})`
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
        const dp = Math.hypot(a.x - pointer.x, a.y - pointer.y)
        if (dp < POINTER) {
          ctx.strokeStyle = `rgba(46,229,157,${(1 - dp / POINTER) * 0.45})`
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(pointer.x, pointer.y)
          ctx.stroke()
        }
      }
      for (const p of pts) {
        ctx.fillStyle = p.hot ? 'rgba(46,229,157,0.85)' : 'rgba(255,255,255,0.38)'
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.hot ? 1.8 : 1.1, 0, Math.PI * 2)
        ctx.fill()
      }
      if (!reduce && visible) raf = requestAnimationFrame(draw)
    }

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      pointer.x = e.clientX - r.left
      pointer.y = e.clientY - r.top
    }
    const onLeave = () => {
      pointer.x = pointer.y = -9999
    }

    resize()
    draw()
    const ro = new ResizeObserver(() => {
      resize()
      if (reduce) draw()
    })
    ro.observe(canvas)
    const io = new IntersectionObserver(([entry]) => {
      const was = visible
      visible = entry.isIntersecting
      if (visible && !was && !reduce) raf = requestAnimationFrame(draw)
    })
    io.observe(canvas)
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return <canvas ref={ref} className={className} />
}

/* ----------------------------------------------------------------- AI core */

const C = 270 // centre of the 540×540 HUD coordinate space

function AICore() {
  const ticks = Array.from({ length: 72 }, (_, i) => i)
  return (
    <div
      role="img"
      aria-label="品牌主视觉 / Agent 与 AI 产品组合"
      className="relative mx-auto aspect-square w-full max-w-[400px] sm:max-w-[540px]"
    >
      {/* Radar sweep inside the main ring */}
      <div className="absolute inset-[11%] overflow-hidden rounded-full">
        <div className="absolute inset-0 animate-[spin_7s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_290deg,rgb(46_229_157/0.14)_360deg)]" />
      </div>

      <svg viewBox="0 0 540 540" className="absolute inset-0 size-full overflow-visible" aria-hidden>
        <defs>
          <radialGradient id="core-fill" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffb45e" stopOpacity="0.10" />
            <stop offset="60%" stopColor="#0e1512" stopOpacity="0.0" />
          </radialGradient>
        </defs>
        <circle cx={C} cy={C} r={262} fill="none" stroke="rgb(255 255 255 / 0.06)" />
        <circle cx={C} cy={C} r={210} fill="url(#core-fill)" stroke="rgb(255 255 255 / 0.1)" />

        <g className="animate-[spin_80s_linear_infinite]" style={{ transformOrigin: `${C}px ${C}px` }}>
          <circle cx={C} cy={C} r={236} fill="none" stroke="rgb(255 255 255 / 0.12)" strokeDasharray="2 7" />
        </g>

        <g className="animate-[spin_14s_linear_infinite]" style={{ transformOrigin: `${C}px ${C}px` }}>
          <circle cx={C} cy={C} r={210} fill="none" stroke="#2ee59d" strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round" strokeDasharray="70 1250" />
        </g>
        <g className="animate-[spin_22s_linear_infinite_reverse]" style={{ transformOrigin: `${C}px ${C}px` }}>
          <circle cx={C} cy={C} r={182} fill="none" stroke="#ffb45e" strokeOpacity="0.45" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="40 1104" />
        </g>

        <g className="animate-[spin_120s_linear_infinite_reverse]" style={{ transformOrigin: `${C}px ${C}px` }}>
          {ticks.map((i) => {
            const long = i % 6 === 0
            const a = (i / ticks.length) * Math.PI * 2
            const r1 = 160
            const r2 = long ? 148 : 154
            return (
              <line
                key={i}
                x1={C + Math.cos(a) * r1}
                y1={C + Math.sin(a) * r1}
                x2={C + Math.cos(a) * r2}
                y2={C + Math.sin(a) * r2}
                stroke={long ? 'rgb(255 255 255 / 0.32)' : 'rgb(255 255 255 / 0.14)'}
              />
            )
          })}
        </g>

        {/* Crosshair */}
        <g stroke="rgb(255 255 255 / 0.08)">
          <line x1={C - 262} y1={C} x2={C - 222} y2={C} />
          <line x1={C + 222} y1={C} x2={C + 262} y2={C} />
          <line x1={C} y1={C - 262} x2={C} y2={C - 222} />
          <line x1={C} y1={C + 222} x2={C} y2={C + 262} />
        </g>
      </svg>

      <RayneeCharacter
        material="bronze"
        calm
        bubbles={false}
        orbits={false}
        className="absolute top-1/2 left-1/2 w-[min(200px,40%)] -translate-x-1/2 -translate-y-1/2"
      />

      <CoreNode x={18.2} y={27.7} side="left" label="语音交互" voice />
      <CoreNode x={77.5} y={22.5} side="right" label="视觉与文档理解" />
      <CoreNode x={83} y={70.5} side="below" label="RAG 知识库接入与问答" />

      <span className="absolute top-[3%] left-[3%] hidden font-mono text-[10px] tracking-[0.2em] text-dim sm:block">
        RAYNEE · CORE
      </span>
    </div>
  )
}

function CoreNode({
  x,
  y,
  side,
  label,
  voice = false,
}: {
  x: number
  y: number
  side: 'left' | 'right' | 'below'
  label: string
  voice?: boolean
}) {
  const chipPos =
    side === 'left'
      ? 'right-[18px] top-1/2 -translate-y-1/2'
      : side === 'right'
        ? 'left-[18px] top-1/2 -translate-y-1/2'
        : 'top-[18px] left-1/2 -translate-x-1/2'
  const wire =
    side === 'left'
      ? 'right-[4px] top-1/2 h-px w-[14px]'
      : side === 'right'
        ? 'left-[4px] top-1/2 h-px w-[14px]'
        : 'top-[4px] left-1/2 h-[14px] w-px'
  return (
    <div className="absolute" style={{ left: `${x}%`, top: `${y}%` }}>
      <span className="absolute size-[9px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand-bright/70 bg-ink" />
      <span className="absolute size-[9px] -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-brand-bright/30" />
      <span className={`absolute hidden bg-white/25 sm:block ${wire}`} />
      <div
        className={`absolute hidden items-center gap-[8px] rounded-[8px] border border-line-strong bg-ink/80 px-[10px] py-[7px] whitespace-nowrap backdrop-blur-md sm:flex ${chipPos}`}
      >
        {voice ? <VoiceWave /> : <span className="size-[5px] rounded-full bg-brand-bright/80" />}
        <span className="font-sc-regular text-[12px] leading-none font-normal text-fg">{label}</span>
      </div>
    </div>
  )
}

function VoiceWave() {
  return (
    <span className="flex h-[12px] items-center gap-[2px]" aria-hidden>
      {[0, 0.15, 0.3, 0.45, 0.6].map((d) => (
        <span
          key={d}
          className="h-full w-[2px] origin-center animate-wave rounded-full bg-brand-bright"
          style={{ animationDelay: `${d}s` }}
        />
      ))}
    </span>
  )
}

/* ----------------------------------------------------------- agent console */

type Scenario = { query: string; steps: string[]; device: { img: string; name: string; action: string } }

const scenarios: Scenario[] = [
  {
    query: '今晚陪我复习数学错题',
    steps: ['对话与需求理解', 'RAG 知识库接入与问答', '内容与方案生成'],
    device: { img: deskLamp, name: 'AI 伴学台灯', action: '切换至阅读光' },
  },
  {
    query: '我准备睡了，放点轻音乐',
    steps: ['语音交互', '个性化推荐与匹配', '任务编排与执行'],
    device: { img: bedsideLamp, name: 'AI 床头灯', action: '灯光 30 分钟渐暗' },
  },
  {
    query: '把书房灯光调到专注模式',
    steps: ['语音交互', '对话与需求理解', '任务编排与执行'],
    device: { img: floorLamp, name: 'AI 伴学大路灯', action: '已开启专注模式' },
  },
]

const TYPE_MS = 75
const STEP_MS = 650

function AgentConsole() {
  const [index, setIndex] = useState(0)
  const [chars, setChars] = useState(0)
  const [step, setStep] = useState(0)
  const s = scenarios[index]
  const total = s.steps.length + 1 // steps + device result

  useEffect(() => {
    if (prefersReducedMotion()) {
      setChars(s.query.length)
      setStep(total)
      const t = window.setTimeout(() => setIndex((i) => (i + 1) % scenarios.length), 6000)
      return () => window.clearTimeout(t)
    }
    setChars(0)
    setStep(0)
    const timers: number[] = []
    const typed = 400 + s.query.length * TYPE_MS
    for (let i = 1; i <= s.query.length; i++) timers.push(window.setTimeout(() => setChars(i), 400 + i * TYPE_MS))
    for (let k = 1; k <= total; k++) timers.push(window.setTimeout(() => setStep(k), typed + 300 + k * STEP_MS))
    timers.push(window.setTimeout(() => setIndex((i) => (i + 1) % scenarios.length), typed + 300 + total * STEP_MS + 2800))
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [index, s.query.length, total])

  const typing = chars < s.query.length

  return (
    <div className="relative z-10 mx-auto -mt-[24px] w-full max-w-[380px] overflow-hidden rounded-[14px] border border-line-strong bg-ink/80 shadow-[0_30px_80px_-30px_rgb(0_0_0/0.9)] backdrop-blur-xl sm:-mt-[56px] lg:absolute lg:bottom-[4%] lg:left-[-2%] lg:mt-0 lg:w-[340px]">
      <div className="flex items-center justify-between border-b border-line px-[14px] py-[10px]">
        <div className="flex items-center gap-[8px]">
          <img src={orbImage} alt="" className="size-[18px]" />
          <span className="font-sc-medium text-[13px] leading-none font-medium text-fg">雷霓 RayNee</span>
        </div>
        <span className="flex items-center gap-[6px] font-mono text-[10px] tracking-[0.16em] text-dim uppercase">
          <span className="size-[6px] animate-pulse rounded-full bg-brand-bright" />
          Agent Live
        </span>
      </div>

      <div className="flex min-h-[188px] flex-col gap-[10px] px-[14px] py-[12px]" aria-live="polite">
        <p className="flex items-start gap-[8px] font-sc-regular text-[14px] leading-[1.55] font-normal text-fg">
          <span className="font-mono text-brand-bright">›</span>
          <span>
            {s.query.slice(0, chars)}
            {typing && <span className="ml-[1px] inline-block h-[1em] w-[2px] translate-y-[0.15em] animate-blink bg-fg" />}
          </span>
        </p>

        <ul className="flex flex-col gap-[6px]">
          {s.steps.map((label, i) =>
            i < step ? (
              <li key={`${index}-${label}`} className="flex animate-fade-up items-center gap-[8px] text-[12px] leading-none">
                {i < step - 1 || step > s.steps.length ? (
                  <span className="grid size-[14px] place-items-center rounded-[4px] bg-brand/30 font-mono text-[9px] text-brand-bright">✓</span>
                ) : (
                  <span className="size-[14px] animate-spin rounded-full border border-white/20 border-t-brand-bright" />
                )}
                <span className="font-mono text-[10px] tracking-wider text-dim">CALL</span>
                <span className="font-sc-regular font-normal text-muted">{label}</span>
              </li>
            ) : null,
          )}
        </ul>

        {step >= total && (
          <div key={`${index}-device`} className="mt-auto flex animate-fade-up items-center gap-[10px] rounded-[10px] border border-line bg-white/[0.03] p-[8px]">
            <img src={s.device.img} alt="" className="size-[36px] rounded-[6px] object-cover" />
            <div className="flex min-w-0 flex-1 flex-col gap-[4px]">
              <span className="font-sc-medium text-[13px] leading-none font-medium text-fg">{s.device.name}</span>
              <span className="truncate font-sc-regular text-[12px] leading-none font-normal text-muted">{s.device.action}</span>
            </div>
            <span className="rounded-[6px] bg-brand/25 px-[6px] py-[4px] font-mono text-[10px] leading-none text-brand-bright">DONE</span>
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------- ticker strip */

function CapabilityTicker() {
  const items = [...capabilities, ...capabilities]
  return (
    <div className="relative border-t border-line bg-ink/40 py-[14px] [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
      <div className="flex w-max animate-marquee gap-[40px] pr-[40px]" aria-hidden>
        {items.map((c, i) => (
          <span key={`${c.id}-${i}`} className="flex items-center gap-[10px] whitespace-nowrap">
            <span className="font-mono text-[11px] tracking-widest text-dim">{String((i % capabilities.length) + 1).padStart(2, '0')}</span>
            <span className="font-sc-regular text-[14px] leading-none font-normal text-muted">{c.label}</span>
            <span className="ml-[30px] size-[4px] rotate-45 bg-brand-bright/50" />
          </span>
        ))}
      </div>
      <p className="sr-only">可复用 AI 能力：{capabilities.map((c) => c.label).join('、')}</p>
    </div>
  )
}
