import { useEffect, useState } from 'react'

// Editorial diagram in a 520×320 space: six matte planes converging into one.
const W = 520
const H = 320

const C = {
  green: '#35FF9A',
  teal: '#00BFAC',
  gray: '#CACACA',
  blue: '#00AAFF',
  panel: '#DDE3E8', // cool light-gray matte plane
  hair: '#CACACA',
}

// Oblique plane: left edge at x, top-left y, depth d (to the right), rising by k, height h.
type Plane = { x: number; y: number; d: number; k: number; h: number }
const corners = ({ x, y, d, k, h }: Plane) => ({
  tl: [x, y] as const,
  tr: [x + d, y - k] as const,
  br: [x + d, y - k + h] as const,
  bl: [x, y + h] as const,
})
const poly = (p: Plane) => {
  const c = corners(p)
  return [c.tl, c.tr, c.br, c.bl].map((pt) => pt.join(',')).join(' ')
}

const inputs = [
  { key: 'SKILLS', color: C.green },
  { key: 'MCP', color: C.teal },
  { key: 'CLI', color: C.blue },
  { key: 'API', color: C.gray },
  { key: 'KNOWLEDGE', color: C.teal },
  { key: 'DEVICE', color: C.blue },
]

const planes: Plane[] = inputs.map((_, i) => ({ x: 24 + i * 40, y: 150 + i * 4, d: 104, k: 34, h: 140 - i * 8 }))
const core: Plane = { x: 356, y: 142, d: 128, k: 40, h: 166 }
const coreC = corners(core)

// Point on the core's left edge where trace i lands.
const entry = (i: number) => [core.x, core.y + 26 + i * 22] as const
// Point on plane i's right edge (its midpoint) where trace i leaves.
const exit = (i: number) => {
  const c = corners(planes[i])
  return [c.tr[0], (c.tr[1] + c.br[1]) / 2] as const
}
const tracePath = (i: number) => {
  const [x0, y0] = exit(i)
  const [x1, y1] = entry(i)
  const knee = x0 + 12 + (5 - i) * 4
  return `M${x0} ${y0} H${knee} L${x1 - 14} ${y1} H${x1}`
}

const paths = ['串口', '蓝牙', '局域网', '云端']

const mono = { fontFamily: 'var(--font-mono)', letterSpacing: '0.22em' } as const

export function AccessIllustration({ className = '' }: { className?: string }) {
  const [motion, setMotion] = useState(false)
  useEffect(() => setMotion(!window.matchMedia('(prefers-reduced-motion: reduce)').matches), [])

  const last = corners(planes[5])

  return (
    <div
      className={`flex flex-col gap-[16px] ${className}`}
      role="img"
      aria-label="六个接入层（Skills、MCP、CLI、API、知识、设备）汇聚为雷霓核心；连接路径：串口、蓝牙、局域网、云端"
    >
      <div className="relative aspect-[520/320] w-full">
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full overflow-visible" aria-hidden shapeRendering="geometricPrecision">
          <defs>
            <pattern id="acc-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="6" stroke={C.gray} strokeOpacity="0.45" strokeWidth="1" />
            </pattern>
            <clipPath id="acc-provisional">
              {/* Lower half of the last input plane */}
              <polygon points={`${last.tl[0]},${(last.tl[1] + last.bl[1]) / 2} ${last.tr[0]},${(last.tr[1] + last.br[1]) / 2} ${last.br.join(',')} ${last.bl.join(',')}`} />
            </clipPath>
          </defs>

          {/* Swiss grid: hairline columns + thirds */}
          <g stroke={C.hair} strokeOpacity="0.1" strokeWidth="0.5">
            {Array.from({ length: 11 }, (_, i) => (
              <line key={`v${i}`} x1={i * 52} y1="0" x2={i * 52} y2={H} />
            ))}
            <line x1="0" y1={H / 3} x2={W} y2={H / 3} />
            <line x1="0" y1={(H * 2) / 3} x2={W} y2={(H * 2) / 3} />
          </g>
          {/* Registration ticks */}
          <g stroke={C.hair} strokeOpacity="0.5" strokeWidth="0.75">
            {[
              [0, 0],
              [W, 0],
              [0, H],
              [W, H],
            ].map(([x, y]) => (
              <g key={`${x}-${y}`}>
                <line x1={x - 5} y1={y} x2={x + 5} y2={y} />
                <line x1={x} y1={y - 5} x2={x} y2={y + 5} />
              </g>
            ))}
          </g>

          {/* Header micro-labels in the open upper third */}
          <text x="0" y="22" fontSize="8.5" fill={C.gray} fillOpacity="0.8" style={mono}>
            FIG. 04 — ACCESS LAYERS
          </text>
          <text x={W} y="22" fontSize="8.5" fill={C.gray} fillOpacity="0.8" textAnchor="end" style={mono}>
            06 → 01
          </text>
          <line x1="0" y1="32" x2="156" y2="32" stroke={C.hair} strokeOpacity="0.35" strokeWidth="0.5" />

          {/* Convergence hairlines: every plane's top and bottom edges run to the core */}
          <g stroke={C.hair} strokeOpacity="0.28" strokeWidth="0.75">
            {planes.map((p, i) => {
              const c = corners(p)
              return (
                <g key={i}>
                  <line x1={c.tr[0]} y1={c.tr[1]} x2={coreC.tl[0]} y2={coreC.tl[1]} />
                  <line x1={c.br[0]} y1={c.br[1]} x2={coreC.bl[0]} y2={coreC.bl[1]} />
                </g>
              )
            })}
          </g>

          {/* Six translucent matte planes */}
          {planes.map((p, i) => (
            <polygon key={i} points={poly(p)} fill={C.panel} fillOpacity={0.05 + i * 0.012} stroke={C.panel} strokeOpacity="0.4" strokeWidth="0.75" strokeLinejoin="miter" />
          ))}
          {/* Provisional zone on the DEVICE plane */}
          <rect x="0" y="0" width={W} height={H} fill="url(#acc-hatch)" clipPath="url(#acc-provisional)" />

          {/* Core plane: where the six converge */}
          <polygon points={poly(core)} fill={C.panel} fillOpacity="0.1" stroke={C.green} strokeWidth="1.5" strokeLinejoin="miter" />
          <g stroke={C.panel} strokeOpacity="0.16" strokeWidth="0.5">
            {[1, 2, 3].map((t) => {
              const f = t / 4
              return (
                <line
                  key={`c${t}`}
                  x1={core.x + core.d * f}
                  y1={core.y - core.k * f}
                  x2={core.x + core.d * f}
                  y2={core.y - core.k * f + core.h}
                />
              )
            })}
            {[1, 2, 3, 4, 5].map((t) => {
              const f = t / 6
              return <line key={`r${t}`} x1={core.x} y1={core.y + core.h * f} x2={core.x + core.d} y2={core.y - core.k + core.h * f} />
            })}
          </g>
          <text x="10" y="16" fontSize="8.5" fill={C.green} style={mono} transform={`translate(${core.x} ${core.y}) skewY(${(-Math.atan(core.k / core.d) * 180) / Math.PI})`}>
            RAYNEE / CORE
          </text>

          {/* Data traces, one per input, landing on the core */}
          {inputs.map((inp, i) => (
            <path key={inp.key} id={`acc-trace-${i}`} d={tracePath(i)} fill="none" stroke={inp.color} strokeWidth={i === 0 ? 1.5 : 1} strokeOpacity={i === 0 ? 1 : 0.85} strokeLinejoin="miter" />
          ))}
          {inputs.map((inp, i) => {
            const [ex, ey] = exit(i)
            const [nx, ny] = entry(i)
            return (
              <g key={`dots-${inp.key}`}>
                <rect x={ex - 2} y={ey - 2} width="4" height="4" fill={inp.color} />
                <rect x={nx - 2} y={ny - 2} width="4" height="4" fill={inp.color} />
              </g>
            )
          })}
          {/* Moving packets (small squares) along the traces */}
          {motion &&
            inputs.map((inp, i) => (
              <rect key={`pk-${inp.key}`} x="-1.5" y="-1.5" width="3" height="3" fill={inp.color}>
                <animateMotion dur={`${2.4 + i * 0.35}s`} repeatCount="indefinite" begin={`${i * 0.4}s`}>
                  <mpath href={`#acc-trace-${i}`} />
                </animateMotion>
              </rect>
            ))}

          {/* Index labels with hairline leaders, staggered on two baselines */}
          {planes.map((p, i) => {
            const c = corners(p)
            const ly = i % 2 === 0 ? 304 : 316
            return (
              <g key={`lbl-${i}`}>
                <line x1={c.bl[0]} y1={c.bl[1]} x2={c.bl[0]} y2={ly - 8} stroke={C.hair} strokeOpacity="0.45" strokeWidth="0.5" />
                <rect x={c.bl[0] - 1.5} y={c.bl[1] - 1.5} width="3" height="3" fill={inputs[i].color} />
                <text x={c.bl[0]} y={ly} fontSize="7.5" fill={C.gray} style={mono}>
                  {String(i + 1).padStart(2, '0')} {inputs[i].key}
                </text>
              </g>
            )
          })}
          <text x={last.tr[0] + 4} y={(last.tr[1] + last.br[1]) / 2 + 30} fontSize="7" fill={C.gray} fillOpacity="0.7" style={mono}>
            PROVISIONAL
          </text>

          {/* Core status block */}
          <g>
            {[C.green, C.teal, C.blue, C.gray].map((col, i) => (
              <rect key={col + i} x={W - 5} y={coreC.tr[1] + 10 + i * 10} width="5" height="5" fill={col} />
            ))}
            <text x={W} y={coreC.tr[1] + 64} fontSize="7" fill={C.gray} textAnchor="end" style={mono}>
              6/6
            </text>
            <text x={W} y={coreC.tr[1] + 74} fontSize="7" fill={C.green} textAnchor="end" style={mono}>
              LIVE
            </text>
          </g>
        </svg>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-[8px]">
        {paths.map((p) => (
          <span
            key={p}
            className="flex items-center gap-[6px] rounded-full border border-line bg-white/[0.03] px-[10px] py-[5px] font-sc-regular text-[12px] leading-none font-normal text-muted"
          >
            <span className="h-[8px] w-[2px] rounded-full bg-white/30" />
            {p}
          </span>
        ))}
      </div>
    </div>
  )
}
