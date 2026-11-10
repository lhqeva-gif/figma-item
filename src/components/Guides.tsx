import { useEffect, useState, type ReactNode } from 'react'
import { SectionHeading } from './ui'

const container = 'mx-auto w-full max-w-[1440px] px-[20px] sm:px-[40px] xl:px-[64px]'

/* ------------------------------------------------------------ code block */

type Lang = 'BASH' | 'JSON'

function CodeLine({ line, lang }: { line: string; lang: Lang }) {
  if (lang === 'BASH') {
    if (line.trimStart().startsWith('#')) return <span className="text-dim">{line}</span>
    const i = line.indexOf('#')
    if (i > 0)
      return (
        <>
          <span className="text-fg">{line.slice(0, i)}</span>
          <span className="text-dim">{line.slice(i)}</span>
        </>
      )
    return <span className="text-fg">{line}</span>
  }
  // JSON: env line highlighted (it holds the value to replace), keys in green.
  if (line.includes('"env"')) return <span className="text-warm">{line}</span>
  const m = line.match(/^(\s*)("[^"]+")(\s*:)(.*)$/)
  if (m)
    return (
      <>
        {m[1]}
        <span className="text-brand-bright">{m[2]}</span>
        <span className="text-muted">{m[3]}</span>
        <span className="text-fg">{m[4]}</span>
      </>
    )
  return <span className="text-muted">{line}</span>
}

export function CodeBlock({ lang, code }: { lang: Lang; code: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }
  return (
    <div className="overflow-hidden rounded-[12px] border border-line bg-[#080c0a]">
      <div className="flex items-center justify-between border-b border-line bg-white/[0.025] px-[16px] py-[8px]">
        <span className="font-mono text-[10px] tracking-[0.18em] text-dim">{lang}</span>
        <button
          type="button"
          onClick={copy}
          className="cursor-pointer rounded-[6px] px-[8px] py-[4px] font-sc-regular text-[12px] leading-none text-muted transition-colors hover:bg-white/[0.06] hover:text-fg"
        >
          {copied ? '已复制' : '复制'}
        </button>
      </div>
      <pre className="overflow-x-auto px-[16px] py-[14px] font-mono text-[13px] leading-[1.85]">
        <code>
          {code.split('\n').map((l, i) => (
            <div key={i} className="whitespace-pre">
              <CodeLine line={l} lang={lang} />
            </div>
          ))}
        </code>
      </pre>
    </div>
  )
}

/* ----------------------------------------------------------- quick start */

const step1 = `# 装 CLI（Node 18+ / Python 3.10+ 均可）
npm i -g @nvc/cli
# 绑定网关并自检：网络、令牌、灯具数量
nvc auth login
nvc doctor`

const step3 = `{
  "mcpServers": {
    "nvc-home": {
      "command": "npx",
      "args": ["-y", "@nvc/mcp-server"],
      "env": { "NVC_TOKEN": "替换成你的令牌" }
    }
  }
}`

const step4 = `nvc light living --json        # 读状态，不改变任何灯
nvc scene movie --dry-run      # 预演：会动哪 4 盏灯
nvc scene movie --yes          # 确认后执行`

function Step({ n, title, time, desc, children }: { n: string; title: string; time: string; desc: string; children: ReactNode }) {
  return (
    <li className="group/step relative grid grid-cols-[40px_1fr] gap-x-[12px] pb-[40px] last:pb-0 sm:grid-cols-[64px_1fr] sm:gap-x-[16px]">
      <span className="absolute top-[34px] bottom-[6px] left-[10px] w-px bg-line group-last/step:hidden" />
      <span className="pt-[2px] font-mono text-[18px] leading-none text-dim sm:text-[20px]">{n}</span>
      <div className="flex min-w-0 flex-col gap-[14px]">
        <div className="flex flex-wrap items-center justify-between gap-[12px]">
          <h3 className="font-sc-bold text-[20px] leading-[1.35] font-bold text-fg">{title}</h3>
          <span className="rounded-full border border-line bg-white/[0.03] px-[10px] py-[4px] font-sc-regular text-[12px] leading-none text-muted">
            {time}
          </span>
        </div>
        <p className="font-sc-regular text-[16px] leading-[1.7] font-normal text-muted">{desc}</p>
        {children}
      </div>
    </li>
  )
}

function GuideCard({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <a
      href={href}
      className="group flex flex-col gap-[8px] rounded-[12px] border border-line bg-white/[0.02] p-[16px] transition-colors hover:border-brand-bright/40 hover:bg-brand/[0.08]"
    >
      <span className="flex items-center gap-[6px] font-sc-medium text-[16px] leading-none font-medium text-fg">
        {title}
        <span className="transition-transform group-hover:translate-x-[3px]">→</span>
      </span>
      <span className="font-sc-regular text-[13px] leading-[1.6] font-normal text-muted">{desc}</span>
    </a>
  )
}

export function QuickStart() {
  return (
    <section id="quickstart" className={`${container} flex flex-col gap-[40px] pb-[80px] xl:pb-[104px]`}>
      <div className="flex flex-col gap-[16px] md:flex-row md:items-end md:justify-between">
        <SectionHeading index="Quick Start" title="四步，点亮第一盏灯" lead="不用一次全上。先选一种技能，把客厅的灯点亮，再决定要不要接第二种。" />
        <a href="#output" className="shrink-0 font-sc-medium text-[15px] font-medium text-brand-bright transition-opacity hover:opacity-80">
          完整接入指南 →
        </a>
      </div>

      <ol className="flex flex-col">
        <Step n="01" title="确认灯和网关都在线" time="约 5 分钟" desc="先让 nvc 认出你的网关和灯具。这一步只读，不会动任何一盏灯。">
          <CodeBlock lang="BASH" code={step1} />
        </Step>
        <Step
          n="02"
          title="选一种技能，别贪多"
          time="约 10 分钟"
          desc="要脚本控制与二次开发选 CLI；要按场景打光选 Skill（默认装 CLI）；要标准接口连客户端选 MCP。三条路径互不依赖，装一种就能用。"
        >
          <div className="grid gap-[12px] sm:grid-cols-2">
            <GuideCard href="#output-cli" title="CLI 入门" desc="从 nvc light --help 开始，学会开关、调光与 --json。" />
            <GuideCard href="#output-skill" title="Skill 入门" desc="写第一个控灯 SKILL.md，把「晚安」这套光固化下来。" />
          </div>
        </Step>
        <Step
          n="03"
          title="接入你的客户端"
          time="约 15 分钟"
          desc="Skill 放进客户端的 skills 目录；MCP 在配置文件里加一段 mcpServers。都是纯文本，改完重启客户端生效。"
        >
          <CodeBlock lang="JSON" code={step3} />
        </Step>
        <Step
          n="04"
          title="先只读，再动灯"
          time="约 5 分钟"
          desc="第一次永远先验证「能读到」，再验证「能控」。场景先用 --dry-run 看会动哪几盏灯，确认无误再执行。"
        >
          <CodeBlock lang="BASH" code={step4} />
        </Step>
      </ol>
    </section>
  )
}

/* ------------------------------------------------------------ output demo */

type Tab = 'cli' | 'skill' | 'mcp'
type Out = { text: string; tone?: 'ok' | 'warn' | 'dim' | 'cmd' | 'key' }

const outputs: Record<Tab, Out[]> = {
  cli: [
    { text: '$ nvc scene movie --dry-run', tone: 'cmd' },
    { text: '✓ 命中场景 movie · 4 盏灯 · 1 组窗帘', tone: 'ok' },
    { text: '✓ 客厅主灯 100% → 0%', tone: 'ok' },
    { text: '✓ 电视墙灯带 60% → 10% · 2700K', tone: 'ok' },
    { text: '! dry-run 模式，未下发任何指令', tone: 'warn' },
    { text: '→ 确认无误后追加 --yes 执行', tone: 'dim' },
  ],
  skill: [
    { text: '# SKILL.md · 观影', tone: 'cmd' },
    { text: '触发：「我要看电影了」「开始观影」', tone: 'dim' },
    { text: '- 客厅主灯 → 关闭（3 秒渐暗）', tone: 'ok' },
    { text: '- 电视墙灯带 → 10% · 2700K', tone: 'ok' },
    { text: '- 窗帘 → 关闭', tone: 'ok' },
    { text: '回应：「已为你切到观影光，享受电影吧」', tone: 'dim' },
  ],
  mcp: [
    { text: '→ tools/call  set_scene', tone: 'cmd' },
    { text: '{ "scene": "movie", "room": "living", "dry_run": true }', tone: 'key' },
    { text: '← result', tone: 'cmd' },
    { text: '{ "lights": 4, "curtains": 1, "status": "preview" }', tone: 'key' },
    { text: '! 预览结果，客户端确认后再以 dry_run: false 调用', tone: 'warn' },
  ],
}

const toneClass: Record<NonNullable<Out['tone']>, string> = {
  cmd: 'text-fg',
  ok: 'text-brand-bright',
  warn: 'text-warm',
  dim: 'text-muted',
  key: 'text-[#9fd8ff]',
}

const tabs: { id: Tab; label: string }[] = [
  { id: 'cli', label: 'CLI' },
  { id: 'skill', label: 'Skill' },
  { id: 'mcp', label: 'MCP' },
]

export function OutputDemo() {
  const [tab, setTab] = useState<Tab>('cli')
  const [shown, setShown] = useState(0)
  const lines = outputs[tab]

  // Links like #output-skill select a tab and scroll to the demo.
  useEffect(() => {
    const sync = () => {
      const m = window.location.hash.match(/^#output-(cli|skill|mcp)$/)
      if (m) {
        setTab(m[1] as Tab)
        document.getElementById('output')?.scrollIntoView({ behavior: 'smooth' })
      }
    }
    sync()
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  // Reveal output line by line on every tab change.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(lines.length)
      return
    }
    setShown(0)
    const timers = lines.map((_, i) => window.setTimeout(() => setShown(i + 1), 180 + i * 260))
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [tab, lines])

  return (
    <section id="output" className={`${container} pb-[80px] xl:pb-[104px]`}>
      <div className="flex flex-col gap-[40px] lg:flex-row lg:items-center lg:justify-between lg:gap-[64px]">
        <div className="flex flex-col gap-[16px] lg:max-w-[400px]">
          <SectionHeading
            index="Output"
            title="「我要看电影了」，三种走法"
            lead="同一句需求，三种技能给出的反馈完全不同：CLI 是执行回执，Skill 是光配方，MCP 是工具调用。"
          />
        </div>

        <div className="w-full overflow-hidden rounded-[16px] border border-line-strong bg-[#0b0e10] shadow-[0_40px_100px_-40px_rgb(0_0_0/0.9)] lg:max-w-[660px]">
          <div className="flex items-center justify-between gap-[12px] px-[16px] py-[12px]">
            <div className="flex items-center gap-[8px]">
              <span className="size-[10px] rounded-full bg-[#ff5f57]" />
              <span className="size-[10px] rounded-full bg-[#febc2e]" />
              <span className="size-[10px] rounded-full bg-[#28c840]" />
              <span className="ml-[8px] font-mono text-[12px] text-dim">~ nvc · 客厅</span>
            </div>
            <div className="flex gap-[2px] rounded-[8px] p-[2px]" role="tablist" aria-label="技能类型">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.id}
                  onClick={() => setTab(t.id)}
                  className={`cursor-pointer rounded-[6px] px-[12px] py-[6px] font-mono text-[12px] leading-none transition-colors ${
                    tab === t.id ? 'bg-white/[0.1] text-fg' : 'text-dim hover:text-muted'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="min-h-[236px] px-[16px] pt-[6px] pb-[18px] font-mono text-[13px] leading-[2]" role="tabpanel" aria-live="polite">
            {lines.slice(0, shown).map((l, i) => (
              <div key={`${tab}-${i}`} className={`animate-fade-up break-all ${toneClass[l.tone ?? 'dim']}`}>
                {l.text}
              </div>
            ))}
            <div className="text-fg">
              {tab === 'cli' ? '$ ' : ''}
              <span className="inline-block h-[1em] w-[7px] translate-y-[0.15em] animate-blink bg-fg/80" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
