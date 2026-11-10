import { useState } from 'react'
import { Footer, Header } from './components/Layout'
import { RayneeCharacter, moodLabels, type Mood } from './components/RayneeCharacter'
import { AccessIllustration } from './components/AccessIllustration'
import { Hero } from './components/Hero'
import { OutputDemo, QuickStart } from './components/Guides'
import { HelpSection } from './components/Support'
import { SolutionMap } from './components/SolutionMap'
import { ArchitectureMap } from './components/ArchitectureMap'
import { Corners, MediaFrame, SectionHeading } from './components/ui'
import deskLamp from '@/assets/media/desk-lamp.webp'
import floorLamp from '@/assets/media/floor-lamp.webp'
import bedsideLamp from '@/assets/media/bedside-lamp.webp'

const container = 'mx-auto w-full max-w-[1440px] px-[20px] sm:px-[40px] xl:px-[64px]'

export default function App() {
  return (
    <div className="relative flex min-h-dvh w-full flex-col bg-ink">
      <Header />
      <main>
        <Hero />
        <AgentSection />
        <ProductsSection />
        <SolutionsSection />
        <ArchitectureSection />
        <AccessSection />
        <QuickStart />
        <OutputDemo />
        <HelpSection />
      </main>
      <Footer />
    </div>
  )
}

function AgentVisual() {
  const [mood, setMood] = useState<Mood>('neutral')
  return (
    <div className="relative isolate grid h-[300px] w-full place-items-center overflow-hidden rounded-[12px] lg:w-[440px] lg:shrink-0">
      <div className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black_15%,transparent_75%)]" />
      <RayneeCharacter className="w-[200px] translate-y-[10px]" onMoodChange={setMood} />
      <div className="absolute bottom-[14px] left-[16px] flex items-center gap-[8px] font-mono text-[10px] tracking-[0.18em] text-dim uppercase">
        <span className="size-[6px] animate-pulse rounded-full bg-warm" />
        Mood
        <span className="font-sc-regular text-[12px] tracking-normal text-muted normal-case">{moodLabels[mood]}</span>
      </div>
      <span className="absolute right-[16px] bottom-[14px] font-mono text-[10px] tracking-[0.18em] text-dim uppercase">
        Tap to say hi
      </span>
      <Corners />
    </div>
  )
}

const rayneeTraits = [
  { key: 'LISTEN', title: '听得懂', desc: '一句自然的话，结合上下文理解你真正想要什么。' },
  { key: 'THINK', title: '想得到', desc: '把时间、空间与习惯纳入考虑，选出合适的做法。' },
  { key: 'ACT', title: '办得成', desc: '调用技能与设备完成任务，结果先给你确认。' },
]

// Open tools = a skill (what & how) + layers (where it runs).
const toolLayers = [
  { key: 'MCP', title: '工具连接层', desc: '标准工具协议，让 Agent 发现并调用已接入的工具与资源。', href: '#output-mcp' },
  { key: 'CLI', title: '本地执行层', desc: '命令行调用入口，衔接设备适配器与自动化流程。', href: '#output-cli' },
  { key: 'API', title: '服务调用层', desc: '面向云端服务的接口；串口、蓝牙、局域网与云端是连接路径。', href: '#guides' },
]

function Operator({ children }: { children: string }) {
  return (
    <span aria-hidden className="grid place-items-center self-center font-mono text-[32px] leading-none text-dim lg:text-[40px]">
      {children}
    </span>
  )
}

function AgentSection() {
  return (
    <section id="agent" className="mx-auto flex w-full max-w-[1440px] flex-col gap-[28px] px-[64px] pt-[64px] pb-[120px]">
      <SectionHeading
        index="01 — Agent"
        title="认识我是谁"
        lead="负责理解与决策，开放工具负责执行：技能定义做什么、怎么做，层决定在哪里做。"
      />

      <div className="mt-[12px] flex flex-col gap-[40px] lg:flex-row lg:items-center lg:gap-[64px]">
        <AgentVisual />
        <div className="flex flex-col items-start gap-[20px] lg:flex-1">
          <p className="font-sc-bold text-[36px] leading-[1.25] font-bold text-fg">雷霓 RayNee</p>
          <p className="font-sc-medium text-[22px] leading-[1.4] font-medium text-fg">你好，我是雷士照明 AI 语音助手</p>
          <p className="font-sc-regular text-[17px] leading-[1.65] font-normal text-muted">
            平台的主智能体，你说一句话，我会理解你此刻的需要，再调动合适的技能，把灯光、内容与设备一起安排好——学习时陪你专注，睡前帮你放松。
          </p>
          <ul className="grid w-full gap-[12px] sm:grid-cols-3">
            {rayneeTraits.map((t) => (
              <li key={t.key} className="flex flex-col gap-[8px] rounded-[12px] border border-line bg-white/[0.02] p-[16px]">
                <span className="font-mono text-[10px] tracking-[0.2em] text-dim">{t.key}</span>
                <span className="font-sc-medium text-[18px] leading-none font-medium text-fg">{t.title}</span>
                <span className="font-sc-regular text-[14px] leading-[1.6] font-normal text-muted">{t.desc}</span>
              </li>
            ))}
          </ul>
          <p className="font-sc-regular text-[15px] leading-[1.65] font-normal text-muted">
            我对生态开放：雷士 Agent 与第三方 Agent 都能按授权调用同一套开放工具，第三方可直接接入。
          </p>
        </div>
      </div>

      {/* Open tools = Skill + Layers */}
      <div className="mt-[20px] grid gap-[16px] border-t border-line pt-[40px] lg:grid-cols-[minmax(0,0.9fr)_auto_minmax(0,1fr)_auto_minmax(0,1.5fr)] lg:gap-[24px]">
        <div className="flex flex-col justify-center gap-[10px]">
          <span className="font-mono text-[11px] tracking-[0.2em] text-dim">OPEN TOOLS</span>
          <p className="font-sc-bold text-[28px] leading-[1.3] font-bold text-fg">开放工具</p>
          <p className="font-sc-regular text-[15px] leading-[1.65] font-normal text-muted">雷霓与第三方 Agent 可调用的全部能力。</p>
        </div>

        <Operator>=</Operator>

        <a
          href="#output-skill"
          className="group relative flex flex-col gap-[12px] overflow-hidden rounded-[14px] border border-brand-bright/30 bg-brand/[0.1] p-[20px] transition-colors hover:bg-brand/[0.16]"
        >
          <span className="flex items-center justify-between font-mono text-[11px] tracking-[0.2em] text-brand-bright">
            SKILL
            <span className="transition-transform group-hover:translate-x-[3px]">→</span>
          </span>
          <p className="font-sc-bold text-[22px] leading-[1.3] font-bold text-fg">技能</p>
          <p className="font-sc-regular text-[15px] leading-[1.65] font-normal text-muted">
            把专业经验写成可复用的任务说明：目标、步骤与输出要求。比如「晚安」这套光、一次错题讲解流程。
          </p>
          <span className="mt-auto font-sc-regular text-[13px] text-dim">定义 · 做什么、怎么做</span>
        </a>

        <Operator>+</Operator>

        <div className="flex flex-col gap-[10px]">
          <span className="flex items-center justify-between font-mono text-[11px] tracking-[0.2em] text-dim">
            LAYERS
            <span className="font-sc-regular text-[13px] tracking-normal">执行 · 在哪里做</span>
          </span>
          {toolLayers.map((l, i) => (
            <a
              key={l.key}
              href={l.href}
              className="group relative flex items-start gap-[16px] rounded-[12px] border border-line bg-white/[0.02] p-[16px] transition-colors hover:border-line-strong hover:bg-white/[0.04]"
              style={{ marginLeft: `${i * 12}px` }}
            >
              <span className="w-[44px] shrink-0 pt-[3px] font-mono text-[14px] leading-none text-fg">{l.key}</span>
              <span className="flex flex-1 flex-col gap-[6px]">
                <span className="font-sc-medium text-[16px] leading-none font-medium text-fg transition-colors group-hover:text-brand-bright">{l.title}</span>
                <span className="font-sc-regular text-[13px] leading-[1.6] font-normal text-muted">{l.desc}</span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

function ArchitectureSection() {
  return (
    <section id="architecture" className={`${container} flex flex-col gap-[40px] pt-[80px] pb-[32px] xl:pt-[104px]`}>
      <SectionHeading
        index="Architecture · 平台架构"
        title="从模型到每一盏灯的接入链路"
        lead="第三方生态应用、AI 开放能力与设备网络三层协同。将鼠标移至节点或典型链路，查看调用如何逐层抵达设备。"
      />
      <ArchitectureMap />
    </section>
  )
}

function SolutionsSection() {
  return (
    <section id="solutions" className="relative isolate border-y border-line bg-surface">
      <div className="bg-dots absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]" />
      <div className={`${container} flex flex-col gap-[24px] py-[64px] xl:py-[96px]`}>
        <SectionHeading index="03 — Solutions" title="从场景出发，探索 AI 的组合方式" lead="选择左侧解决方案，查看对应的 AI 能力组合。" />
        <div className="mt-[24px]">
          <SolutionMap />
        </div>
      </div>
    </section>
  )
}

function ProductCard({
  src,
  position,
  title,
  desc,
  heightClass,
}: {
  src: string
  position: string
  title: string
  desc: string
  heightClass: string
}) {
  return (
    <a href="#agent" className="group flex w-full flex-col gap-[16px] [word-break:break-word]">
      <MediaFrame
        src={src}
        alt={title}
        position={position}
        className={`w-full transition-shadow duration-500 group-hover:shadow-[0_0_0_1px_rgb(255_255_255/0.14),0_30px_80px_-30px_rgb(0_0_0/0.9)] ${heightClass}`}
        imgClassName="transition-transform duration-700 group-hover:scale-[1.03]"
      />
      <div className="flex items-start justify-between gap-[16px]">
        <div className="flex flex-col gap-[6px]">
          <p className="font-sc-medium text-[22px] leading-[1.4] font-medium text-fg">{title}</p>
          <p className="font-sc-regular text-[17px] leading-[1.65] font-normal text-muted">{desc}</p>
        </div>
        <span className="mt-[4px] grid size-[32px] shrink-0 place-items-center rounded-full border border-line font-mono text-[14px] text-muted transition-all group-hover:border-brand-bright/50 group-hover:bg-brand group-hover:text-white">
          ↗
        </span>
      </div>
    </a>
  )
}

function ProductsSection() {
  return (
    <section id="products" className="mx-auto flex w-full max-w-[1440px] flex-col gap-[28px] px-[64px] pt-[64px] pb-[120px]">
      <SectionHeading index="02 — Products" title="AI 产品，承载真实场景" lead="从学习空间到床头陪伴，让交互融入日常。" />
      <div className="mt-[12px] flex min-w-0 flex-col gap-[24px]">
        <div
          data-products-track
          role="region"
          aria-label="AI 产品横向滑动列表"
          tabIndex={0}
          className="grid auto-cols-[85%] grid-flow-col gap-[24px] overflow-x-auto overscroll-x-contain scroll-smooth snap-x snap-mandatory pb-[24px] [scrollbar-color:var(--color-brand)_transparent] [scrollbar-width:thin] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-bright motion-reduce:scroll-auto md:auto-cols-[44%] xl:auto-cols-[38%] xl:gap-[32px] [&>a]:snap-start"
          onKeyDown={(event) => {
            if (event.target !== event.currentTarget || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return
            event.preventDefault()
            const track = event.currentTarget
            const card = track.firstElementChild as HTMLElement | null
            const step = (card?.offsetWidth ?? track.clientWidth) + parseFloat(getComputedStyle(track).columnGap)
            track.scrollBy({
              left: event.key === 'ArrowRight' ? step : -step,
              behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
            })
          }}
        >
        <ProductCard
          src={deskLamp}
          position="50% 35%"
          title="AI 伴学台灯"
          desc="桌面学习与语音陪伴"
          heightClass="aspect-[4/3] md:aspect-[4/5]"
        />
        <ProductCard
          src={floorLamp}
          position="50% 15%"
          title="AI 伴学大路灯"
          desc="学习空间照明与伴学交互"
          heightClass="aspect-[4/3] md:aspect-[4/5]"
        />
        <ProductCard
          src={bedsideLamp}
          position="70% 50%"
          title="AI 床头灯"
          desc="未来规划 · 睡前陪伴与助眠方向"
          heightClass="aspect-[4/3] md:aspect-[4/5]"
        />
        </div>
        <div data-products-controls className="flex flex-wrap items-center justify-between gap-[16px]">
          <p className="font-sc-regular text-[13px] text-muted">左右滑动，探索更多产品</p>
          <div className="flex gap-[10px]">
            {([-1, 1] as const).map((direction) => (
              <button
                key={direction}
                type="button"
                aria-label={direction === -1 ? '查看上一款产品' : '查看下一款产品'}
                onClick={(event) => {
                  const track = event.currentTarget.closest('[data-products-controls]')?.parentElement?.querySelector<HTMLElement>('[data-products-track]')
                  if (!track) return
                  const card = track.firstElementChild as HTMLElement | null
                  const step = (card?.offsetWidth ?? track.clientWidth) + parseFloat(getComputedStyle(track).columnGap)
                  track.scrollBy({
                    left: direction * step,
                    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
                  })
                }}
                className="grid size-[44px] cursor-pointer place-items-center rounded-full border border-line-strong text-fg transition-colors hover:border-brand-bright/60 hover:bg-brand hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-bright"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" style={{ transform: direction === -1 ? 'rotate(180deg)' : undefined }}>
                  <path d="M5 12h14m-6-6 6 6-6 6" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

const guideParts = [
  { no: '04.1', title: '快速开始', desc: '四步，点亮第一盏灯', href: '#quickstart' },
  { no: '04.2', title: '使用示例', desc: '「我要看电影了」，三种走法', href: '#output' },
  { no: '04.3', title: '三种方式', desc: 'CLI · Skill · MCP', href: '#output-cli' },
]

const guideStats = [
  { value: '4', unit: '步', label: '上手流程' },
  { value: '35', unit: '分钟', label: '预计耗时' },
  { value: '3', unit: '种', label: '接入方式' },
]

/** Chapter header for the access guide; opens at the bottom so Quick Start and Output read as its body. */
function AccessSection() {
  return (
    <section id="guides" className={`${container} pt-[80px] pb-[56px] xl:pt-[104px]`}>
      <div className="relative isolate overflow-hidden rounded-t-[20px] border-t border-line bg-[linear-gradient(180deg,var(--color-surface-2)_0%,rgb(14_21_18/0.5)_70%,transparent_100%)] px-[24px] pt-[48px] sm:px-[48px] sm:pt-[64px] xl:px-[64px]">
        <div className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_60%_70%_at_78%_40%,black,transparent_75%)]" />
        <div className="absolute top-[-160px] right-[-120px] -z-10 size-[560px] rounded-full bg-brand/[0.18] blur-[120px]" />
        <div className="absolute inset-x-0 top-0 -z-10 h-px bg-[linear-gradient(90deg,transparent,rgb(46_229_157/0.4),transparent)]" />
        {/* Side rules fade out so the chapter continues into the sections below */}
        <span className="absolute top-0 bottom-0 left-0 w-px bg-[linear-gradient(180deg,var(--color-line),transparent)]" />
        <span className="absolute top-0 right-0 bottom-0 w-px bg-[linear-gradient(180deg,var(--color-line),transparent)]" />

        <div className="flex flex-col gap-[48px] lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-[28px] lg:max-w-[560px]">
            <SectionHeading index="04 — Access · 接入指南" title="从适合你的接入方式开始" lead="阅读文字指南，了解知识、内容、工具与设备的接入配置。" />
            <dl className="flex flex-wrap gap-x-[40px] gap-y-[16px]">
              {guideStats.map((s) => (
                <div key={s.label} className="flex flex-col gap-[6px]">
                  <dt className="order-2 font-sc-regular text-[13px] leading-none font-normal text-dim">{s.label}</dt>
                  <dd className="order-1 flex items-baseline gap-[4px]">
                    <span className="font-[Arial] text-[32px] leading-none text-fg">{s.value}</span>
                    <span className="font-sc-regular text-[14px] text-muted">{s.unit}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <AccessIllustration className="w-full max-w-[520px] self-center lg:w-[48%] lg:shrink-0" />
        </div>

        {/* Chapter index */}
        <nav aria-label="接入指南目录" className="mt-[56px] grid border-t border-line sm:grid-cols-3">
          {guideParts.map((p, i) => (
            <a
              key={p.no}
              href={p.href}
              className={`group relative flex items-start justify-between gap-[16px] py-[24px] transition-colors sm:px-[24px] ${
                i > 0 ? 'border-t border-line sm:border-t-0 sm:border-l' : 'sm:pl-0'
              }`}
            >
              <span className="absolute top-[-1px] left-0 h-px w-0 bg-brand-bright transition-all duration-500 group-hover:w-full" />
              <span className="flex flex-col gap-[8px]">
                <span className="font-mono text-[11px] tracking-[0.18em] text-dim">{p.no}</span>
                <span className="font-sc-medium text-[18px] leading-[1.35] font-medium text-fg transition-colors group-hover:text-brand-bright">{p.title}</span>
                <span className="font-sc-regular text-[14px] leading-[1.5] font-normal text-muted">{p.desc}</span>
              </span>
              <span className="mt-[2px] font-mono text-[16px] text-dim transition-all group-hover:translate-y-[2px] group-hover:text-brand-bright">↓</span>
            </a>
          ))}
        </nav>
      </div>
    </section>
  )
}
