import { useState } from 'react'
import qrImage from '@/assets/media/nvc-qr.png'
import { SectionHeading } from './ui'

const container = 'mx-auto w-full max-w-[1440px] px-[20px] sm:px-[40px] xl:px-[64px]'

const faqs = [
  {
    q: '雷霓 RayNee 和第三方 Agent 有什么区别？',
    a: '雷霓是雷士的主智能体，负责理解意图并调度专业技能。第三方 Agent 按授权也能调用同一套开放能力，可以直接接入，不必经过雷霓。',
  },
  {
    q: 'CLI、Skill、MCP 应该先选哪一个？',
    a: '要脚本控制与二次开发选 CLI；要按场景打光选 Skill（默认装 CLI）；要标准接口连客户端选 MCP。三条路径互不依赖，先装一种就能用。',
  },
  {
    q: '接入前需要准备什么？',
    a: '一台在线的网关和已配网的灯具，以及 Node 18+ 或 Python 3.10+ 环境。安装 CLI 后执行 nvc auth login 绑定网关，再用 nvc doctor 自检网络、令牌与灯具数量。',
  },
  {
    q: '第一次调试会不会误动家里的灯？',
    a: '建议先只读、再控制：用 --json 读取状态不会改变任何灯；场景先加 --dry-run 预演会动哪几盏灯，确认无误后再追加 --yes 执行。',
  },
  {
    q: '支持哪些连接方式？',
    a: 'API 提供服务调用入口；串口、蓝牙、局域网与云端是连接路径。具体可用范围由产品版本、资源与接入条件决定。',
  },
  {
    q: '令牌应该如何保管？',
    a: '令牌只写在本机环境变量或客户端配置的 env 中（例如 NVC_TOKEN），不要提交到代码仓库或分享到公开渠道。怀疑泄露时请重新执行 nvc auth login 更换。',
  },
]

function FaqItem({ q, a, open, onToggle, id }: { q: string; a: string; open: boolean; onToggle: () => void; id: string }) {
  return (
    <li className="border-b border-line">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={onToggle}
          className="group flex w-full cursor-pointer items-center justify-between gap-[24px] py-[22px] text-left"
        >
          <span className={`font-sc-medium text-[18px] leading-[1.45] font-medium transition-colors ${open ? 'text-fg' : 'text-fg/85 group-hover:text-fg'}`}>
            {q}
          </span>
          <span
            aria-hidden
            className={`relative grid size-[28px] shrink-0 place-items-center rounded-full border transition-colors ${
              open ? 'border-brand-bright/50 bg-brand/20' : 'border-line group-hover:border-line-strong'
            }`}
          >
            <span className="absolute h-px w-[10px] bg-fg" />
            <span className={`absolute h-[10px] w-px bg-fg transition-transform duration-300 ${open ? 'scale-y-0' : ''}`} />
          </span>
        </button>
      </h3>
      <div id={id} className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <p className="max-w-[760px] pb-[22px] font-sc-regular text-[16px] leading-[1.75] font-normal text-muted">{a}</p>
        </div>
      </div>
    </li>
  )
}

export function HelpSection() {
  const [open, setOpen] = useState(0)
  return (
    <section id="help" className="border-y border-line bg-surface">
      <div className={`${container} grid gap-[40px] py-[80px] lg:grid-cols-[minmax(0,400px)_1fr] lg:gap-[80px] xl:py-[104px]`}>
        <div className="flex flex-col gap-[28px] lg:sticky lg:top-[120px] lg:self-start">
          <SectionHeading index="05 — Help" title="帮助中心" lead="接入与使用中最常遇到的问题，先在这里找找答案。" />
        </div>
        <ul className="border-t border-line">
          {faqs.map((f, i) => (
            <FaqItem key={f.q} id={`faq-${i}`} q={f.q} a={f.a} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
          ))}
        </ul>
      </div>
    </section>
  )
}

const channels = [
  {
    tag: 'PARTNERSHIP',
    title: '生态合作',
    desc: '品牌与渠道合作、解决方案共建、设备与内容接入合作。',
  },
  {
    tag: 'DEVELOPER',
    title: '开发者支持',
    desc: 'CLI、Skill、MCP 接入问题，令牌与权限申请，文档与示例反馈。',
  },
  {
    tag: 'SERVICE',
    title: '产品与售后',
    desc: 'AI 伴学台灯、伴学大路灯等产品的使用咨询、维修与售后服务。',
  },
]

export const hotline = { display: '400-894-0606', tel: '4008940606', hours: '服务热线（8:00-21:00）' }

/** Contact block; rendered at the top of the footer so contact info and site footer read as one unit. */
export function ContactSection() {
  return (
    <section id="contact" className="flex flex-col gap-[40px] pt-[80px] pb-[48px] xl:pt-[104px]">
      <SectionHeading index="06 — Contact" title="联系我们" lead="按你的需求选择对应的联系渠道，我们会尽快回复。" />
      <div className="grid gap-[20px] md:grid-cols-3">
        {channels.map((c) => (
          <div
            key={c.tag}
            className="group relative flex flex-col gap-[16px] overflow-hidden rounded-[16px] border border-line bg-ink/40 p-[24px] transition-colors hover:border-line-strong"
          >
            <span className="absolute inset-x-0 top-0 h-px w-0 bg-brand-bright transition-all duration-500 group-hover:w-full" />
            <span className="font-mono text-[11px] tracking-[0.2em] text-dim">{c.tag}</span>
            <p className="font-sc-bold text-[22px] leading-[1.35] font-bold text-fg">{c.title}</p>
            <p className="flex-1 font-sc-regular text-[15px] leading-[1.7] font-normal text-muted">{c.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid items-center gap-[28px] rounded-[16px] border border-line bg-ink/40 p-[24px] sm:p-[32px] md:grid-cols-[1fr_auto]">
        <div className="flex flex-col gap-[14px] sm:flex-row sm:items-center sm:gap-[40px]">
          <div className="flex flex-col gap-[10px]">
            <span className="flex items-center gap-[8px] font-mono text-[11px] tracking-[0.2em] text-dim">
              <span className="size-[6px] rounded-full bg-brand-bright" />
              HOTLINE
            </span>
            <a
              href={`tel:${hotline.tel}`}
              className="font-[Arial] text-[32px] leading-none tracking-[0.02em] text-fg transition-colors hover:text-brand-bright sm:text-[40px]"
            >
              {hotline.display}
            </a>
            <span className="font-sc-regular text-[14px] leading-none font-normal text-muted">{hotline.hours}</span>
          </div>
          <p className="max-w-[360px] font-sc-regular text-[14px] leading-[1.7] font-normal text-muted sm:border-l sm:border-line sm:pl-[40px]">
            生态合作、开发者支持与产品售后均可拨打官方服务热线，工作人员会为你转接对应团队。
          </p>
        </div>
        <figure className="flex items-center gap-[16px]">
          <img src={qrImage} alt="雷士照明二维码" className="size-[104px] rounded-[8px] bg-white p-[6px]" />
          <figcaption className="flex flex-col gap-[6px]">
            <span className="font-sc-medium text-[15px] leading-none font-medium text-fg">扫码关注雷士照明</span>
            <span className="font-sc-regular text-[13px] leading-none font-normal text-dim">获取产品资讯与服务</span>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
