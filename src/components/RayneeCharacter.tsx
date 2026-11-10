import { useCallback, useEffect, useId, useRef, useState } from 'react'
import orbFace from '@/assets/media/raynee-orb-face.webp'

export type Mood = 'neutral' | 'happy' | 'curious' | 'surprised' | 'sleepy' | 'wink'

/** Gradient palette for a vector-drawn orb body. */
export type OrbPalette = {
  /** Top-left highlight */
  hi: string
  /** Body colour */
  mid: string
  /** Rim colour */
  edge: string
  /** Second tone washed in from the bottom-right */
  accent: string
}

export const moodLabels: Record<Mood, string> = {
  neutral: '平静',
  happy: '开心',
  curious: '好奇',
  surprised: '惊讶',
  sleepy: '困倦',
  wink: '俏皮',
}

const idleMoods: Mood[] = ['happy', 'curious', 'surprised', 'sleepy', 'wink']
// Gentle subset for calm mode.
const calmMoods: Mood[] = ['happy', 'curious', 'wink']
const greetings = ['你好，我是雷霓 RayNee', '今天想学点什么？', '需要我把灯光调柔和些吗？', '随时叫我就好～']

// Eye geometry measured from the orb artwork (512px space).
const EYE_W = 36
const EYE_H = 73
const EYES = [
  { cx: 201.5, cy: 254 },
  { cx: 309, cy: 254 },
] as const
const pct = (v: number) => `${(v / 512) * 100}%`

type EyeShape = { sx: number; sy: number; rot: number; arc: boolean }

function eyeShape(mood: Mood, side: 0 | 1, blinking: boolean): EyeShape {
  let s: EyeShape = { sx: 1, sy: 1, rot: 0, arc: false }
  switch (mood) {
    case 'happy':
      s = { sx: 1, sy: 1, rot: 0, arc: true }
      break
    case 'curious':
      s = side === 0 ? { sx: 1, sy: 0.6, rot: -6, arc: false } : { sx: 1.12, sy: 1.1, rot: 0, arc: false }
      break
    case 'surprised':
      s = { sx: 1.3, sy: 0.92, rot: 0, arc: false }
      break
    case 'sleepy':
      s = { sx: 1.08, sy: 0.2, rot: side === 0 ? 6 : -6, arc: false }
      break
    case 'wink':
      s = side === 0 ? { sx: 1, sy: 1, rot: 0, arc: true } : { sx: 1, sy: 1, rot: 0, arc: false }
      break
  }
  if (blinking && !s.arc) s = { ...s, sy: 0.08 }
  return s
}

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const rand = (a: number, b: number) => a + Math.random() * (b - a)

type Props = {
  className?: string
  onMoodChange?: (m: Mood) => void
  /** When set, the orb body is drawn as an SVG gradient in these colours instead of the artwork. */
  palette?: OrbPalette
  /** Show speech bubbles on hover / click. */
  bubbles?: boolean
  /** Show the decorative orbit rings. */
  orbits?: boolean
  /** Changing this value makes RayNee react (surprise → happy bounce). */
  reactKey?: string | number
  /** Body material. 'bronze' renders a polished bronze sphere with an emissive visor. */
  material?: 'artwork' | 'bronze'
  /** Calm mode: only gentle moods, and far less often. */
  calm?: boolean
}

/** RayNee as a living character: gaze tracking, blinking, idle moods, hover/click reactions. */
export function RayneeCharacter({
  className = '',
  onMoodChange,
  palette,
  bubbles = true,
  orbits = true,
  reactKey,
  material = 'artwork',
  calm = false,
}: Props) {
  const bronze = material === 'bronze'
  const rootRef = useRef<HTMLDivElement>(null)
  const [mood, setMoodState] = useState<Mood>('neutral')
  const [blinking, setBlinking] = useState(false)
  const [gaze, setGaze] = useState({ x: 0, y: 0 })
  const [squash, setSquash] = useState<[number, number]>([1, 1])
  const [bubble, setBubble] = useState<string | null>(null)
  const hovering = useRef(false)
  const reacting = useRef(false)
  const lastPointer = useRef(0)
  const greetIndex = useRef(0)
  const timers = useRef<number[]>([])

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms))
  }, [])

  const setMood = useCallback(
    (m: Mood) => {
      setMoodState(m)
      onMoodChange?.(m)
    },
    [onMoodChange],
  )

  // Gaze follows the pointer; when idle, eyes glance around on their own.
  useEffect(() => {
    let raf = 0
    let target = { x: 0, y: 0 }
    const onMove = (e: PointerEvent) => {
      const el = rootRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const dx = e.clientX - (r.left + r.width / 2)
      const dy = e.clientY - (r.top + r.height / 2)
      const dist = Math.hypot(dx, dy) || 1
      const reach = Math.min(1, dist / 260)
      target = { x: (dx / dist) * reach, y: (dy / dist) * reach }
      lastPointer.current = performance.now()
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => setGaze(target))
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    const wander = window.setInterval(() => {
      if (performance.now() - lastPointer.current < 2500 || reduceMotion()) return
      setGaze(Math.random() < 0.35 ? { x: 0, y: 0 } : { x: rand(-0.9, 0.9), y: rand(-0.6, 0.6) })
    }, calm ? 2800 : 1400)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.clearInterval(wander)
      cancelAnimationFrame(raf)
    }
  }, [calm])

  // Natural blinking, sometimes a double blink.
  useEffect(() => {
    if (reduceMotion()) return
    let t = 0
    const schedule = () => {
      t = window.setTimeout(() => {
        setBlinking(true)
        window.setTimeout(() => setBlinking(false), 130)
        if (Math.random() < 0.25) {
          window.setTimeout(() => setBlinking(true), 260)
          window.setTimeout(() => setBlinking(false), 390)
        }
        schedule()
      }, rand(2200, 5000))
    }
    schedule()
    return () => window.clearTimeout(t)
  }, [])

  // Idle mood changes.
  useEffect(() => {
    if (reduceMotion()) return
    let t = 0
    const schedule = () => {
      t = window.setTimeout(() => {
        if (!hovering.current && !reacting.current) {
          const pool = calm ? calmMoods : idleMoods
          const next = pool[Math.floor(Math.random() * pool.length)]
          setMood(next)
          later(() => {
            if (!hovering.current && !reacting.current) setMood('neutral')
          }, calm ? 2400 : next === 'sleepy' ? 2600 : 1800)
        }
        schedule()
      }, calm ? rand(14000, 22000) : rand(3600, 6200))
    }
    schedule()
    return () => window.clearTimeout(t)
  }, [later, setMood, calm])

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), [])

  const bounce = () => {
    if (reduceMotion()) return
    setSquash([1.1, 0.9])
    later(() => setSquash([0.94, 1.07]), 120)
    later(() => setSquash([1.03, 0.98]), 260)
    later(() => setSquash([1, 1]), 400)
  }

  const onEnter = () => {
    hovering.current = true
    if (!reacting.current) {
      setMood('happy')
      if (bubbles) setBubble(greetings[0])
    }
  }
  const onLeave = () => {
    hovering.current = false
    if (!reacting.current) {
      setMood('neutral')
      setBubble(null)
    }
  }
  const react = (withBubble: boolean) => {
    reacting.current = true
    greetIndex.current = (greetIndex.current + 1) % greetings.length
    setMood('surprised')
    if (withBubble) setBubble(greetings[greetIndex.current])
    bounce()
    later(() => setMood('happy'), 450)
    later(() => {
      reacting.current = false
      setMood(hovering.current ? 'happy' : 'neutral')
      if (!hovering.current) setBubble(null)
    }, 2200)
  }
  const onPoke = () => react(bubbles)

  // React whenever the caller signals a change (e.g. a new solution was picked).
  const firstReact = useRef(true)
  useEffect(() => {
    if (firstReact.current) {
      firstReact.current = false
      return
    }
    react(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reactKey])

  // Head follows gaze slightly; mood adds tilt / droop.
  const tilt = mood === 'curious' ? -9 : mood === 'sleepy' ? 7 : gaze.x * 4
  const droop = mood === 'sleepy' ? 6 : 0
  const bodyTransform = `translate(${gaze.x * 6}px, ${gaze.y * 5 + droop}px) rotate(${tilt}deg) scale(${squash[0]}, ${squash[1]})`
  // Eyes look further than the head (parallax).
  const eyeShift = mood === 'sleepy' ? { x: 0, y: 6 } : { x: gaze.x * 20, y: gaze.y * 14 }
  const ease = 'cubic-bezier(0.22, 1, 0.36, 1)'
  // Bronze: emissive cyan eyes behind the visor; artwork/palette: warm cream eyes.
  const eyeColor = bronze ? '#aef7ff' : palette ? '#fffaf0' : '#fff7df'
  const eyeGlow = bronze ? '0 0 10px rgb(120 240 255 / 0.9), 0 0 22px rgb(60 210 255 / 0.55)' : '0 0 12px rgb(255 247 223 / 0.6)'
  const blushColor = palette ? palette.accent : '#ff8a7a'

  return (
    <div
      ref={rootRef}
      className={`grid aspect-square place-items-center ${/\b(absolute|fixed)\b/.test(className) ? '' : 'relative'} ${className}`}
    >
      <div
        className={`absolute inset-[6%] rounded-full blur-[48px] transition-[opacity,background-color] duration-700 ${palette || bronze ? '' : 'bg-warm/35'}`}
        style={{
          opacity: (mood === 'happy' ? 1 : mood === 'sleepy' ? 0.5 : 0.8) * (bronze ? 0.22 : palette ? 0.45 : 1),
          backgroundColor: bronze ? '#3f8a66' : palette?.mid,
        }}
      />
      {orbits && (
        <>
          <span className="pointer-events-none absolute inset-[-22%] animate-spin-slow rounded-full border border-dashed border-white/[0.12]" />
          <span className="pointer-events-none absolute inset-[-48%] rounded-full border border-white/[0.05]" />
        </>
      )}

      {/* Speech bubble */}
      <div
        aria-live="polite"
        className={`pointer-events-none absolute bottom-[96%] left-[62%] z-10 w-max max-w-[200px] rounded-[12px] rounded-bl-[4px] border border-line-strong bg-ink/85 px-[12px] py-[8px] font-sc-regular text-[13px] leading-[1.4] font-normal text-fg shadow-[0_12px_30px_-12px_rgb(0_0_0/0.8)] backdrop-blur-md transition-all duration-300 ${
          bubble ? 'translate-y-0 opacity-100' : 'translate-y-[6px] opacity-0'
        }`}
      >
        {bubble ?? greetings[0]}
      </div>

      {/* Floating z's while sleepy */}
      <div className={`pointer-events-none absolute top-[2%] right-[4%] transition-opacity duration-500 ${mood === 'sleepy' ? 'opacity-100' : 'opacity-0'}`} aria-hidden>
        {[0, 0.6, 1.2].map((d, i) => (
          <span
            key={d}
            className="absolute animate-zzz font-mono font-bold text-white/70"
            style={{ animationDelay: `${d}s`, fontSize: 10 + i * 3, right: i * 10, top: -i * 8 }}
          >
            z
          </span>
        ))}
      </div>

      <button
        type="button"
        aria-label="和雷霓打个招呼"
        onPointerEnter={onEnter}
        onPointerLeave={onLeave}
        onFocus={onEnter}
        onBlur={onLeave}
        onClick={onPoke}
        className="relative size-full cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-bright"
      >
        <div className="size-full animate-breathe">
          <div className="relative size-full" style={{ transform: bodyTransform, transition: `transform 260ms ${ease}` }}>
            {bronze ? (
              <BronzeBody />
            ) : palette ? (
              <OrbBody palette={palette} />
            ) : (
              <img src={orbFace} alt="" draggable={false} className="size-full select-none drop-shadow-[0_18px_40px_rgb(255_150_80/0.35)]" />
            )}

            {/* Blush */}
            {[155, 357].map((cx) => (
              <span
                key={cx}
                className="absolute rounded-full blur-[6px] transition-[opacity,background-color] duration-500"
                style={{
                  backgroundColor: blushColor,
                  left: pct(cx - 26),
                  top: pct(298),
                  width: pct(52),
                  height: pct(24),
                  opacity: !bronze && (mood === 'happy' || mood === 'wink') ? 0.55 : 0,
                }}
              />
            ))}

            {/* Eyes */}
            {EYES.map((eye, i) => {
              const s = eyeShape(mood, i as 0 | 1, blinking)
              return (
                <span
                  key={i}
                  className="absolute"
                  style={{
                    left: pct(eye.cx - EYE_W / 2),
                    top: pct(eye.cy - EYE_H / 2),
                    width: pct(EYE_W),
                    height: pct(EYE_H),
                    transform: `translate(${(eyeShift.x / EYE_W) * 100}%, ${(eyeShift.y / EYE_H) * 100}%) rotate(${s.rot}deg)`,
                    transition: `transform 180ms ${ease}`,
                  }}
                >
                  <span
                    className="absolute inset-0 rounded-full"
                    style={{
                      backgroundColor: eyeColor,
                      boxShadow: eyeGlow,
                      transform: `scale(${s.sx}, ${s.sy})`,
                      opacity: s.arc ? 0 : 0.95,
                      transition: `transform ${blinking ? 70 : 220}ms ${ease}, opacity 160ms`,
                    }}
                  />
                  <svg
                    viewBox="-24 -24 48 48"
                    className="absolute top-1/2 left-1/2 w-[150%] -translate-x-1/2 -translate-y-1/2 overflow-visible"
                    style={{ opacity: s.arc ? 0.95 : 0, transition: 'opacity 160ms' }}
                  >
                    <path d="M -15 6 Q 0 -14 15 6" fill="none" stroke={eyeColor} strokeWidth="8" strokeLinecap="round" />
                  </svg>
                </span>
              )
            })}

            {/* Mouth: small smile when happy, "o" when surprised */}
            <svg
              viewBox="-20 -20 40 40"
              className="absolute overflow-visible"
              style={{ left: pct(256 - 20), top: pct(322 - 20), width: pct(40), height: pct(40) }}
              aria-hidden
            >
              <path
                d="M -9 -2 Q 0 7 9 -2"
                fill="none"
                stroke={eyeColor}
                strokeWidth="4.5"
                strokeLinecap="round"
                style={{ opacity: mood === 'happy' || mood === 'wink' ? 0.9 : 0, transition: 'opacity 200ms' }}
              />
              <ellipse
                cx="0"
                cy="0"
                rx="5.5"
                ry="7"
                fill="none"
                stroke={eyeColor}
                strokeWidth="4"
                style={{ opacity: mood === 'surprised' ? 0.9 : 0, transition: 'opacity 200ms' }}
              />
            </svg>
          </div>
        </div>
      </button>
    </div>
  )
}

const colorTransition = { transition: 'stop-color 700ms ease, stop-opacity 700ms ease' }

/** Vector re-drawing of the orb artwork whose gradient colours animate between palettes. */
// Alpha fall-off measured from the original orb artwork (offset = radius / 256, opacity 0–1).
const EDGE_FALLOFF: [number, number][] = [
  [0, 1],
  [0.4, 1],
  [0.47, 0.99],
  [0.59, 0.88],
  [0.7, 0.65],
  [0.78, 0.46],
  [0.84, 0.3],
  [0.88, 0.22],
  [0.92, 0.13],
  [0.95, 0.06],
  [0.98, 0.015],
  [1, 0],
]

function OrbBody({ palette }: { palette: OrbPalette }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '')
  const { hi, mid, edge, accent } = palette
  return (
    <svg
      viewBox="0 0 512 512"
      className="size-full overflow-visible select-none"
      style={{ filter: `drop-shadow(0 18px 40px ${mid}33)`, transition: 'filter 700ms ease' }}
      aria-hidden
    >
      <defs>
        <radialGradient id={`${id}-body`} cx="36%" cy="30%" r="78%">
          <stop offset="0" style={{ stopColor: hi, ...colorTransition }} />
          <stop offset="0.45" style={{ stopColor: mid, ...colorTransition }} />
          <stop offset="1" style={{ stopColor: edge, ...colorTransition }} />
        </radialGradient>
        <linearGradient id={`${id}-tone`} x1="0.15" y1="0.1" x2="0.9" y2="0.95">
          <stop offset="0.35" style={{ stopColor: accent, stopOpacity: 0, ...colorTransition }} />
          <stop offset="1" style={{ stopColor: accent, stopOpacity: 0.8, ...colorTransition }} />
        </linearGradient>
        {/* Soft, Gaussian-like edge matching the artwork: opaque core fading smoothly to transparent */}
        <radialGradient id={`${id}-falloff`} cx="50%" cy="50%" r="50%">
          {EDGE_FALLOFF.map(([o, a]) => (
            <stop key={o} offset={o} stopColor="#fff" stopOpacity={a} />
          ))}
        </radialGradient>
        <mask id={`${id}-edge`} maskUnits="userSpaceOnUse" x="0" y="0" width="512" height="512">
          <rect width="512" height="512" fill={`url(#${id}-falloff)`} />
        </mask>
        <filter id={`${id}-gloss`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="22" />
        </filter>
      </defs>
      <g mask={`url(#${id}-edge)`}>
        <rect width="512" height="512" fill={`url(#${id}-body)`} />
        <rect width="512" height="512" fill={`url(#${id}-tone)`} />
        <ellipse cx="200" cy="168" rx="96" ry="64" fill="#fff" opacity="0.32" filter={`url(#${id}-gloss)`} />
      </g>
      <circle cx="256" cy="256" r="198" fill="none" style={{ stroke: hi, transition: 'stroke 700ms ease' }} strokeOpacity="0.55" strokeWidth="2.5" />
      <circle cx="256" cy="256" r="186" fill="none" stroke="#fff" strokeOpacity="0.14" strokeWidth="1.5" />
    </svg>
  )
}

/**
 * Polished bronze sphere: dark-to-light bronze body, brushed concentric finish, bevelled rim with an
 * engraved groove, hard specular highlight, warm rim light, and a dark glass visor behind the eyes.
 */
function BronzeBody() {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '')
  return (
    <svg
      viewBox="0 0 512 512"
      className="size-full overflow-visible select-none"
      style={{ filter: 'drop-shadow(0 22px 36px rgb(0 0 0 / 0.65)) drop-shadow(0 0 28px rgb(46 160 110 / 0.18))' }}
      aria-hidden
    >
      <defs>
        <radialGradient id={`${id}-metal`} cx="36%" cy="30%" r="80%">
          <stop offset="0" stopColor="#b9d6c3" />
          <stop offset="0.15" stopColor="#80ab93" />
          <stop offset="0.38" stopColor="#4c7a63" />
          <stop offset="0.62" stopColor="#2b4b3c" />
          <stop offset="0.85" stopColor="#16291f" />
          <stop offset="1" stopColor="#0b1510" />
        </radialGradient>
        {/* Reflected floor light along the lower edge */}
        <radialGradient id={`${id}-bounce`} cx="55%" cy="105%" r="55%">
          <stop offset="0" stopColor="#5fbf8f" stopOpacity="0.3" />
          <stop offset="1" stopColor="#5fbf8f" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#cfe8d9" stopOpacity="0.6" />
          <stop offset="0.45" stopColor="#2f5a46" stopOpacity="0.3" />
          <stop offset="1" stopColor="#8fd3b0" stopOpacity="0.65" />
        </linearGradient>
        <linearGradient id={`${id}-spec`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e9f7ee" stopOpacity="0.7" />
          <stop offset="1" stopColor="#e9f7ee" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}-visor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a130e" stopOpacity="0.92" />
          <stop offset="1" stopColor="#030604" stopOpacity="0.96" />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <circle cx="256" cy="256" r="236" />
        </clipPath>
        <filter id={`${id}-soft`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      <circle cx="256" cy="256" r="236" fill={`url(#${id}-metal)`} />
      <g clipPath={`url(#${id}-clip)`}>
        <circle cx="256" cy="256" r="236" fill={`url(#${id}-bounce)`} />
        {/* Brushed concentric finish */}
        {Array.from({ length: 18 }, (_, i) => (
          <circle key={i} cx="256" cy="256" r={40 + i * 11} fill="none" stroke={i % 2 ? '#000' : '#fff'} strokeOpacity={i % 2 ? 0.06 : 0.05} strokeWidth="1" />
        ))}
      </g>

      {/* Bevel: engraved groove + highlight line */}
      <circle cx="256" cy="256" r="214" fill="none" stroke="#08130d" strokeOpacity="0.7" strokeWidth="4" />
      <circle cx="256" cy="256" r="209" fill="none" stroke="#a8d4bb" strokeOpacity="0.25" strokeWidth="1.2" />
      {/* Panel seams */}
      <path d="M48 256 H112 M400 256 H464" stroke="#08130d" strokeOpacity="0.6" strokeWidth="3" />
      <path d="M256 22 V64" stroke="#08130d" strokeOpacity="0.5" strokeWidth="3" />

      {/* Dark glass visor */}
      <rect x="112" y="186" width="288" height="136" rx="68" fill={`url(#${id}-visor)`} />
      <rect x="112" y="186" width="288" height="136" rx="68" fill="none" stroke="#8fc9a8" strokeOpacity="0.4" strokeWidth="2" />
      <path d="M140 204 Q256 182 372 204" fill="none" stroke="#fff" strokeOpacity="0.14" strokeWidth="6" strokeLinecap="round" />

      {/* Specular highlights */}
      <ellipse cx="180" cy="118" rx="96" ry="38" transform="rotate(-24 180 118)" fill={`url(#${id}-spec)`} opacity="0.5" />
      <circle cx="140" cy="128" r="9" fill="#f2fbf5" opacity="0.6" filter={`url(#${id}-soft)`} />

      {/* Cool environment reflection on the lower-right rim (futuristic accent) */}
      <path d="M418 360 A 220 220 0 0 1 320 452" fill="none" stroke="#6fe3f0" strokeOpacity="0.25" strokeWidth="5" strokeLinecap="round" filter={`url(#${id}-soft)`} />
      {/* Rim light */}
      <circle cx="256" cy="256" r="235" fill="none" stroke={`url(#${id}-rim)`} strokeWidth="3" />
    </svg>
  )
}
