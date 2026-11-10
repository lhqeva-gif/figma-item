import { useEffect, useMemo, useRef, useState } from 'react'

const CANVAS_W = 1000
const CANVAS_H = 980

type NodeId =
  | 'agent'
  | 'mcpc'
  | 'skills'
  | 'localmcp'
  | 'cloudmcp'
  | 'cli'
  | 'serial'
  | 'ble'
  | 'net'
  | 'port'
  | 'btlocal'
  | 'paas'
  | 'gateway'
  | 'bleDev'
  | 'wifiDev'

type ArchNode = { id: NodeId; label: string; desc: string; x: number; y: number; w: number; h: number; strong?: boolean }

const nodes: ArchNode[] = [
  { id: 'agent', label: 'AI Agent / LLM', desc: '第三方生态中的智能体或大模型，负责理解意图并发起调用。', x: 330, y: 52, w: 240, h: 56, strong: true },
  { id: 'mcpc', label: 'MCP Client', desc: '通过 JSON-RPC 与 Agent 通信，按标准化协议连接 MCP Server。', x: 720, y: 52, w: 200, h: 56 },
  { id: 'skills', label: 'Skills', desc: 'SKILL.md、操作手册与 SOP，由 Agent 按需加载，指导步骤与工具选择。', x: 32, y: 240, w: 360, h: 176 },
  { id: 'localmcp', label: '本地 MCP Server', desc: '在本地暴露设备能力，可封装 CLI，或直接调用串口与蓝牙。', x: 584, y: 316, w: 172, h: 56 },
  { id: 'cloudmcp', label: '云端 MCP Server', desc: '在云端暴露能力，经网络访问 IoT PaaS 控制联网设备。', x: 772, y: 316, w: 172, h: 56 },
  { id: 'cli', label: 'CLI', desc: '命令行工具，可被 Agent 通过 Shell 直接执行，统一驱动串口与蓝牙。', x: 120, y: 446, w: 220, h: 60, strong: true },
  { id: 'serial', label: '串口读写能力', desc: '打开并读写串口，向透传模组下发 AT 指令。', x: 80, y: 580, w: 220, h: 42 },
  { id: 'ble', label: '蓝牙广播能力', desc: '调用本机蓝牙发送广播，直达附近的 BLE Mesh 设备。', x: 390, y: 580, w: 220, h: 42 },
  { id: 'net', label: '网络访问能力', desc: '调用 IoT PaaS 接口，进行云端设备控制与状态查询。', x: 748, y: 580, w: 220, h: 42 },
  { id: 'port', label: '串口（透传模组 AT 指令）', desc: '透传模组将 AT 指令转换为 BLE Mesh 消息。', x: 50, y: 692, w: 280, h: 48 },
  { id: 'btlocal', label: '本地蓝牙', desc: '主机自带蓝牙，以 BLE Mesh 与设备直接通信。', x: 400, y: 692, w: 200, h: 48 },
  { id: 'paas', label: 'IoT PaaS', desc: '物联网云平台，经 UDP 连接网关、经 MQTT 连接 WiFi 设备。', x: 758, y: 692, w: 200, h: 48 },
  { id: 'gateway', label: '网关', desc: '接收云端 UDP 指令，以 BLE Mesh 转发给设备。', x: 420, y: 900, w: 160, h: 52 },
  { id: 'bleDev', label: 'BLE 设备', desc: '仅支持 BLE Mesh 的灯具与终端。', x: 100, y: 900, w: 200, h: 52 },
  { id: 'wifiDev', label: 'WiFi + BLE 设备', desc: '同时支持 WiFi 与 BLE Mesh，可直连云端。', x: 700, y: 900, w: 220, h: 52 },
]

const nodeById = Object.fromEntries(nodes.map((n) => [n.id, n])) as Record<NodeId, ArchNode>

type Edge = {
  id: string
  from: NodeId
  to: NodeId
  label?: string
  d: string
  lx: number
  ly: number
  dashed?: boolean
  both?: boolean
}

const line = (x1: number, y1: number, x2: number, y2: number) => ({ d: `M ${x1} ${y1} L ${x2} ${y2}`, lx: (x1 + x2) / 2, ly: (y1 + y2) / 2 })

const edges: Edge[] = [
  { id: 'e1', from: 'agent', to: 'mcpc', label: 'JSON-RPC', d: 'M 570 80 L 716 80', lx: 643, ly: 80 },
  { id: 'e2', from: 'agent', to: 'skills', label: '按需加载 · 指导步骤与工具选择', d: 'M 360 108 C 360 180, 212 170, 212 236', lx: 270, ly: 168, dashed: true, both: true },
  { id: 'e3', from: 'agent', to: 'cli', label: 'Shell 直接执行', d: 'M 470 108 L 470 448 Q 470 462 456 462 L 344 462', lx: 476, ly: 216 },
  { id: 'e4', from: 'mcpc', to: 'localmcp', label: '标准化协议', d: 'M 780 108 L 780 200 Q 780 212 768 212 L 682 212 Q 670 212 670 224 L 670 312', lx: 722, ly: 212, both: true },
  { id: 'e5', from: 'mcpc', to: 'cloudmcp', label: '标准化协议', d: 'M 858 108 L 858 312', lx: 858, ly: 170, both: true },
  { id: 'e6', from: 'localmcp', to: 'cli', label: '封装或调用（可选）', d: 'M 620 372 L 620 476 Q 620 490 606 490 L 344 490', lx: 508, ly: 490 },
  { id: 'e7', from: 'localmcp', to: 'serial', label: '直接打开并读写（可选）', d: 'M 650 372 L 650 544 Q 650 556 638 556 L 262 556 Q 250 556 250 568 L 250 576', lx: 372, ly: 556 },
  { id: 'e8', from: 'localmcp', to: 'ble', label: '直接调用（可选）', d: 'M 700 372 L 700 552 Q 700 564 688 564 L 572 564 Q 560 564 560 576', lx: 630, ly: 564 },
  { id: 'e9', from: 'cloudmcp', to: 'net', label: '调用接口', d: 'M 858 372 L 858 576', lx: 858, ly: 474, both: true },
  { id: 'e10', from: 'cli', to: 'serial', label: '打开并读写', d: 'M 190 506 L 190 576', lx: 190, ly: 536 },
  { id: 'e11', from: 'cli', to: 'ble', label: '调用', d: 'M 300 506 L 300 536 Q 300 548 312 548 L 456 548 Q 468 548 468 560 L 468 576', lx: 384, ly: 530 },
  { id: 'e12', from: 'serial', to: 'port', d: 'M 190 622 L 190 688', lx: 190, ly: 655 },
  { id: 'e13', from: 'ble', to: 'btlocal', d: 'M 500 622 L 500 688', lx: 500, ly: 655 },
  { id: 'e14', from: 'net', to: 'paas', d: 'M 858 622 L 858 688', lx: 858, ly: 655 },
  { id: 'e15', from: 'port', to: 'bleDev', label: 'BLE Mesh', ...line(170, 740, 170, 896) },
  { id: 'e16', from: 'port', to: 'wifiDev', label: 'BLE Mesh', ...line(260, 740, 736, 896) },
  { id: 'e17', from: 'btlocal', to: 'bleDev', label: 'BLE Mesh', ...line(460, 740, 270, 896) },
  { id: 'e18', from: 'btlocal', to: 'wifiDev', label: 'BLE Mesh', ...line(540, 740, 776, 896) },
  { id: 'e19', from: 'paas', to: 'gateway', label: 'UDP', ...line(800, 740, 548, 896) },
  { id: 'e20', from: 'gateway', to: 'bleDev', label: 'BLE Mesh', ...line(420, 926, 304, 926) },
  { id: 'e21', from: 'gateway', to: 'wifiDev', label: 'BLE Mesh', ...line(580, 926, 696, 926) },
  { id: 'e22', from: 'paas', to: 'wifiDev', label: 'MQTT', d: 'M 900 744 L 900 896', lx: 900, ly: 820, both: true },
]

type Step = { node: NodeId; via?: string }
type Route = { id: string; name: string; desc: string; edges: string[]; steps: Step[] }

const routes: Route[] = [
  {
    id: 'skills',
    name: 'Skills 指导执行',
    desc: 'Agent 按需读取 SOP，选择合适工具后经 Shell 执行 CLI，就近控制设备。',
    edges: ['e2', 'e3', 'e11', 'e13', 'e17', 'e18'],
    steps: [
      { node: 'agent' },
      { node: 'skills', via: '按需加载 SOP' },
      { node: 'cli', via: 'Shell 直接执行' },
      { node: 'ble', via: '调用' },
      { node: 'btlocal' },
      { node: 'bleDev', via: 'BLE Mesh' },
    ],
  },
  {
    id: 'local',
    name: '本地 MCP 链路',
    desc: '经 MCP Client 连接本地 Server，直接驱动串口或蓝牙，适合离线与局域场景。',
    edges: ['e1', 'e4', 'e6', 'e7', 'e8', 'e12', 'e13', 'e15', 'e16', 'e17', 'e18'],
    steps: [
      { node: 'agent' },
      { node: 'mcpc', via: 'JSON-RPC' },
      { node: 'localmcp', via: '标准化协议' },
      { node: 'serial', via: '直接打开并读写' },
      { node: 'port' },
      { node: 'bleDev', via: 'BLE Mesh' },
    ],
  },
  {
    id: 'cloud',
    name: '云端 MCP 链路',
    desc: '经云端 Server 调用 IoT PaaS，通过 MQTT 或网关远程控制设备。',
    edges: ['e1', 'e5', 'e9', 'e14', 'e19', 'e20', 'e21', 'e22'],
    steps: [
      { node: 'agent' },
      { node: 'mcpc', via: 'JSON-RPC' },
      { node: 'cloudmcp', via: '标准化协议' },
      { node: 'net', via: '调用接口' },
      { node: 'paas' },
      { node: 'wifiDev', via: 'MQTT' },
    ],
  },
  {
    id: 'cli',
    name: 'CLI 直连串口',
    desc: 'Agent 直接执行 CLI 打开串口，经透传模组下发 AT 指令。',
    edges: ['e3', 'e10', 'e12', 'e15', 'e16'],
    steps: [
      { node: 'agent' },
      { node: 'cli', via: 'Shell 直接执行' },
      { node: 'serial', via: '打开并读写' },
      { node: 'port' },
      { node: 'bleDev', via: 'BLE Mesh' },
    ],
  },
]

type Focus = { kind: 'node'; id: NodeId } | { kind: 'route'; id: string } | null

/** Every edge upstream and downstream of a node, i.e. all chains passing through it. */
function chainEdges(id: NodeId) {
  const result = new Set<string>()
  const walk = (start: NodeId, dir: 'down' | 'up') => {
    const queue = [start]
    const seen = new Set<NodeId>([start])
    while (queue.length) {
      const cur = queue.shift()!
      for (const e of edges) {
        const [a, b] = dir === 'down' ? [e.from, e.to] : [e.to, e.from]
        if (a !== cur) continue
        result.add(e.id)
        if (!seen.has(b)) {
          seen.add(b)
          queue.push(b)
        }
      }
    }
  }
  walk(id, 'down')
  walk(id, 'up')
  return result
}

function useHighlight(focus: Focus) {
  return useMemo(() => {
    if (!focus) return null
    const edgeIds = focus.kind === 'node' ? chainEdges(focus.id) : new Set(routes.find((r) => r.id === focus.id)!.edges)
    const nodeIds = new Set<NodeId>(focus.kind === 'node' ? [focus.id] : [])
    for (const e of edges) {
      if (edgeIds.has(e.id)) {
        nodeIds.add(e.from)
        nodeIds.add(e.to)
      }
    }
    return { edgeIds, nodeIds }
  }, [focus])
}

export function ArchitectureMap() {
  const [hover, setHover] = useState<Focus>(null)
  const [pinned, setPinned] = useState<string>(routes[0].id)
  const focus: Focus = hover ?? { kind: 'route', id: pinned }
  const hl = useHighlight(focus)

  return (
    <div className="grid gap-[32px] xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-[40px]">
      <DesktopCanvas hl={hl} focus={focus} setHover={setHover} />
      <div className="flex flex-col gap-[20px] xl:sticky xl:top-[120px] xl:self-start">
        <RouteList pinned={pinned} focus={focus} onPin={setPinned} setHover={setHover} />
        <FocusDetail focus={focus} />
      </div>
    </div>
  )
}

type Highlight = ReturnType<typeof useHighlight>

function DesktopCanvas({ hl, focus, setHover }: { hl: Highlight; focus: Focus; setHover: (f: Focus) => void }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setScale(Math.min(1, entry.contentRect.width / CANVAS_W)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const nodeState = (id: NodeId): NodeState => (!hl ? 'idle' : hl.nodeIds.has(id) ? 'on' : 'off')
  const enter = (id: NodeId) => () => setHover({ kind: 'node', id })
  const leave = () => setHover(null)
  const nodeProps = (id: NodeId) => ({
    state: nodeState(id),
    current: focus?.kind === 'node' && focus.id === id,
    onEnter: enter(id),
    onLeave: leave,
  })

  return (
    <div ref={wrapRef} className="hidden w-full lg:block" style={{ height: CANVAS_H * scale }}>
      <div className="relative origin-top-left select-none" style={{ width: CANVAS_W, height: CANVAS_H, transform: `scale(${scale})` }}>
        <Band y={0} h={140} label="01 · 第三方生态应用" />
        <Band y={190} h={460} label="02 · AI 开放能力" brand />
        <Band y={790} h={190} label="03 · 设备网络" />
        <span className="absolute top-[658px] left-[32px] font-mono text-[11px] tracking-[0.16em] text-dim uppercase">连接通道</span>

        {/* Group frames */}
        <div className="absolute rounded-[12px] border border-line bg-white/[0.015]" style={{ left: 560, top: 240, width: 408, height: 176 }}>
          <p className="px-[20px] pt-[16px] font-sc-bold text-[18px] font-bold text-fg">MCP</p>
          <p className="px-[20px] pt-[2px] font-sc-regular text-[12px] text-muted">Model Context Protocol</p>
        </div>
        <div className="absolute rounded-[10px] border border-dashed border-line-strong" style={{ left: 32, top: 568, width: 936, height: 66 }} />

        <svg className="pointer-events-none absolute inset-0" width={CANVAS_W} height={CANVAS_H} viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`} fill="none" aria-hidden>
          <defs>
            {(['idle', 'on'] as const).map((k) => (
              <marker key={k} id={`arch-arrow-${k}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 1 L 9 5 L 0 9 z" fill={k === 'on' ? '#2ee59d' : 'rgb(255 255 255 / 0.32)'} />
              </marker>
            ))}
          </defs>
          {edges.map((e) => {
            const on = hl?.edgeIds.has(e.id) ?? false
            const off = !!hl && !on
            const marker = `url(#arch-arrow-${on ? 'on' : 'idle'})`
            return (
              <g key={e.id} className="transition-opacity duration-300" style={{ opacity: off ? 0.14 : 1 }}>
                <path
                  d={e.d}
                  stroke={on ? 'rgb(46 229 157 / 0.55)' : 'rgb(255 255 255 / 0.24)'}
                  strokeWidth={on ? 1.6 : 1.2}
                  strokeDasharray={e.dashed ? '5 5' : undefined}
                  markerEnd={marker}
                  markerStart={e.both ? marker : undefined}
                />
                {on && (
                  <path
                    d={e.d}
                    stroke="#2ee59d"
                    strokeWidth={2.4}
                    strokeLinecap="round"
                    strokeDasharray="6 35"
                    className="animate-dash motion-reduce:animate-none"
                    style={{ filter: 'drop-shadow(0 0 4px rgb(46 229 157 / 0.8))' }}
                  />
                )}
              </g>
            )
          })}
        </svg>

        {/* Protocol labels appear only along the highlighted chain */}
        {edges.map((e) =>
          e.label && hl?.edgeIds.has(e.id) ? (
            <span
              key={e.id}
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 animate-fade-up rounded-[4px] border border-brand-bright/25 bg-ink px-[7px] py-[3px] font-sc-regular text-[11px] leading-none whitespace-nowrap text-brand-bright"
              style={{ left: e.lx, top: e.ly }}
            >
              {e.label}
            </span>
          ) : null,
        )}

        <SkillsGroup {...nodeProps('skills')} />
        {nodes
          .filter((n) => n.id !== 'skills')
          .map((n) => (
            <NodeBox key={n.id} node={n} {...nodeProps(n.id)} />
          ))}
      </div>
    </div>
  )
}

function Band({ y, h, label, brand = false }: { y: number; h: number; label: string; brand?: boolean }) {
  return (
    <div
      className={`absolute left-0 w-full rounded-[18px] border ${brand ? 'border-brand-bright/25 bg-brand/[0.06]' : 'border-line bg-white/[0.012]'}`}
      style={{ top: y, height: h }}
    >
      <span className={`absolute top-[16px] left-[20px] font-mono text-[11px] tracking-[0.16em] uppercase ${brand ? 'text-brand-bright/80' : 'text-muted'}`}>
        {label}
      </span>
    </div>
  )
}

type NodeState = 'idle' | 'on' | 'off'
type NodeInteraction = { state: NodeState; current: boolean; onEnter: () => void; onLeave: () => void }

const nodeTone = (state: NodeState, current: boolean, strong?: boolean) => {
  if (current) return 'border-brand-bright bg-brand text-white shadow-[0_0_32px_-6px_rgb(46_229_157/0.7)]'
  if (state === 'on') return 'border-brand-bright/60 bg-[#0f2a1f] text-fg shadow-[0_0_24px_-10px_rgb(46_229_157/0.8)]'
  if (state === 'off') return 'border-line bg-surface-2 text-muted opacity-60'
  return strong ? 'border-brand-bright/35 bg-[#0d1d16] text-fg' : 'border-line-strong bg-surface-2 text-fg'
}

function NodeBox({ node, state, current, onEnter, onLeave }: { node: ArchNode } & NodeInteraction) {
  return (
    <button
      type="button"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      aria-label={`${node.label}：${node.desc}`}
      className={`absolute flex cursor-pointer items-center justify-center rounded-[10px] border px-[12px] text-center transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-bright ${nodeTone(state, current, node.strong)} ${
        node.strong ? 'font-sc-bold text-[17px] font-bold' : 'font-sc-medium text-[14px] font-medium'
      }`}
      style={{ left: node.x, top: node.y, width: node.w, height: node.h }}
    >
      {node.label}
    </button>
  )
}

function SkillsGroup({ state, current, onEnter, onLeave }: NodeInteraction) {
  const n = nodeById.skills
  const chip = current ? 'border-white/30 bg-white/10 text-white' : state === 'on' ? 'border-brand-bright/30 bg-brand/15 text-fg' : 'border-line-strong bg-white/[0.03] text-muted'
  return (
    <button
      type="button"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      aria-label={`${n.label}：${n.desc}`}
      className={`absolute flex cursor-pointer flex-col gap-[16px] rounded-[12px] border p-[20px] text-left transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-bright ${nodeTone(state, current)}`}
      style={{ left: n.x, top: n.y, width: n.w, height: n.h }}
    >
      <span className="flex items-baseline justify-between gap-[12px]">
        <span className="font-sc-bold text-[18px] font-bold">Skills</span>
        <span className="font-sc-regular text-[12px] opacity-75">SKILL.md / 操作手册 / SOP</span>
      </span>
      <span className="grid grid-cols-2 gap-[12px]">
        {['本地控制 Skill', '健康光推荐 Skill', 'LifeLight Skill', '…'].map((s) => (
          <span key={s} className={`flex h-[40px] items-center justify-center rounded-[8px] border font-sc-regular text-[13px] transition-colors duration-300 ${chip}`}>
            {s}
          </span>
        ))}
      </span>
    </button>
  )
}

function RouteList({ pinned, focus, onPin, setHover }: { pinned: string; focus: Focus; onPin: (id: string) => void; setHover: (f: Focus) => void }) {
  return (
    <div className="flex flex-col gap-[10px]">
      <p className="flex items-center gap-[8px] font-sc-regular text-[14px] text-muted">
        <span className="size-[6px] rounded-full bg-brand-bright/70" />
        典型链路
      </p>
      <div className="grid gap-[10px] sm:grid-cols-2 xl:grid-cols-1">
        {routes.map((r, i) => {
          const active = focus?.kind === 'route' && focus.id === r.id
          return (
            <button
              key={r.id}
              type="button"
              aria-pressed={pinned === r.id}
              onClick={() => onPin(r.id)}
              onMouseEnter={() => setHover({ kind: 'route', id: r.id })}
              onMouseLeave={() => setHover(null)}
              className={`flex cursor-pointer items-center gap-[14px] rounded-[10px] border px-[16px] py-[14px] text-left transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-bright ${
                active ? 'border-brand-bright/40 bg-brand/15' : 'border-line bg-white/[0.02] hover:border-line-strong'
              }`}
            >
              <span className={`font-mono text-[12px] ${active ? 'text-brand-bright' : 'text-dim'}`}>{String(i + 1).padStart(2, '0')}</span>
              <span className={`font-sc-medium text-[15px] font-medium ${active ? 'text-fg' : 'text-muted'}`}>{r.name}</span>
            </button>
          )
        })}
      </div>
      <p className="hidden font-sc-regular text-[13px] leading-[1.6] text-dim lg:block">将鼠标移至架构图中的任意节点，查看经过它的全部上下游链路。</p>
    </div>
  )
}

function FocusDetail({ focus }: { focus: Focus }) {
  if (!focus) return null
  if (focus.kind === 'route') {
    const r = routes.find((x) => x.id === focus.id)!
    return (
      <div key={r.id} className="flex animate-fade-up flex-col gap-[16px] rounded-[14px] border border-line bg-surface p-[20px]">
        <div className="flex flex-col gap-[6px]">
          <p className="font-sc-bold text-[18px] font-bold text-fg">{r.name}</p>
          <p className="font-sc-regular text-[14px] leading-[1.65] text-muted">{r.desc}</p>
        </div>
        <ol className="flex flex-col">
          {r.steps.map((s, i) => (
            <li key={s.node} className="flex flex-col">
              {i > 0 && (
                <span className="flex h-[26px] items-center gap-[10px] pl-[5px]">
                  <span className="h-full w-px bg-brand-bright/40" />
                  {s.via && <span className="font-sc-regular text-[11px] text-brand-bright/85">{s.via}</span>}
                </span>
              )}
              <span className="flex items-center gap-[10px] font-sc-medium text-[14px] font-medium text-fg">
                <span className="size-[11px] rounded-full border-2 border-brand-bright bg-ink" />
                {nodeById[s.node].label}
              </span>
            </li>
          ))}
        </ol>
      </div>
    )
  }
  const n = nodeById[focus.id]
  const up = [...new Set(edges.filter((e) => e.to === n.id).map((e) => nodeById[e.from].label))]
  const down = [...new Set(edges.filter((e) => e.from === n.id).map((e) => nodeById[e.to].label))]
  return (
    <div key={n.id} className="flex animate-fade-up flex-col gap-[16px] rounded-[14px] border border-brand-bright/25 bg-surface p-[20px]">
      <div className="flex flex-col gap-[6px]">
        <p className="font-sc-bold text-[18px] font-bold text-fg">{n.label}</p>
        <p className="font-sc-regular text-[14px] leading-[1.65] text-muted">{n.desc}</p>
      </div>
      <NodeList title="上游" items={up} />
      <NodeList title="下游" items={down} />
    </div>
  )
}

function NodeList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="flex flex-col gap-[8px]">
      <span className="font-mono text-[11px] tracking-[0.16em] text-dim uppercase">{title}</span>
      {items.length ? (
        <div className="flex flex-wrap gap-[6px]">
          {items.map((l) => (
            <span key={l} className="rounded-[6px] border border-line-strong bg-white/[0.03] px-[8px] py-[5px] font-sc-regular text-[12px] leading-none text-fg">
              {l}
            </span>
          ))}
        </div>
      ) : (
        <span className="font-sc-regular text-[12px] text-dim">无 · 链路起点或终点</span>
      )}
    </div>
  )
}
