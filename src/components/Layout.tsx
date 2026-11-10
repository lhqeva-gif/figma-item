import { useEffect, useState } from 'react'
import logoImage from '@/imports/LOGO-1.png'
import { navItems, type NavKey } from '../data/site'
import { ContactSection, hotline } from './Support'

// Which nav item is highlighted while each section is in view.
const sectionToNav: Record<string, NavKey> = {
  top: 'home',
  agent: 'capabilities',
  products: 'capabilities',
  solutions: 'solutions',
  guides: 'guides',
  quickstart: 'guides',
  output: 'guides',
  help: 'help',
  contact: 'contact',
}

function useActiveNav(): NavKey {
  const [active, setActive] = useState<NavKey>('home')
  useEffect(() => {
    const els = Object.keys(sectionToNav)
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el)
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length) setActive(sectionToNav[visible[visible.length - 1].target.id])
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return active
}

export function Header() {
  const active = useActiveNav()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-line bg-ink/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-[20px] py-[13px] sm:px-[40px] xl:px-[64px]">
        <a href="#top" className="group flex items-center gap-[10px]" aria-label="雷士 · Raycore 首页">
          <img src={logoImage} alt="雷士照明 RayCore.AI" className="h-[90px] w-auto" />
        </a>

        <nav className="hidden items-start gap-[8px] lg:flex" aria-label="主导航">
          {navItems.map((item) => {
            const isActive = item.key === active
            return (
              <a
                key={item.key}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-start justify-center rounded-[8px] p-[12px] text-[14px] leading-[1.55] whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-white/[0.07] font-sc-bold font-bold text-fg'
                    : 'font-sc-regular font-normal text-muted hover:text-fg'
                }`}
              >
                {item.label}
              </a>
            )
          })}
        </nav>

        <button
          type="button"
          className="flex size-[40px] cursor-pointer flex-col items-center justify-center gap-[5px] rounded-[8px] border border-line lg:hidden"
          aria-label={open ? '关闭菜单' : '打开菜单'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className={`h-px w-[16px] bg-fg transition-transform ${open ? 'translate-y-[3px] rotate-45' : ''}`} />
          <span className={`h-px w-[16px] bg-fg transition-transform ${open ? '-translate-y-[3px] -rotate-45' : ''}`} />
        </button>
      </div>

      {open && (
        <nav className="border-t border-line px-[20px] py-[12px] sm:px-[40px] lg:hidden" aria-label="移动端导航">
          {navItems.map((item) => (
            <a
              key={item.key}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`block rounded-[8px] p-[12px] text-[14px] leading-[1.55] ${
                item.key === active ? 'bg-white/[0.07] font-sc-bold font-bold text-fg' : 'font-sc-regular text-muted'
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  )
}

export function Footer() {
  return (
    <footer id="footer" className="border-t border-line bg-surface">
      <div className="mx-auto flex max-w-[1440px] flex-col px-[20px] sm:px-[40px] xl:px-[64px]">
        <ContactSection />
        <div className="flex flex-col gap-[24px] border-t border-line py-[40px]">
          <a href="#top" className="group flex items-center justify-center gap-[10px]" aria-label="雷士 · Raycore 首页">
            <img src={logoImage} alt="雷士照明 RayCore.AI" className="h-[90px] w-auto" />
          </a>
          <div className="flex flex-wrap items-center justify-center gap-[16px]">
            {navItems.map((item) => (
              <a
                key={item.key}
                href={item.href}
                className="flex items-start justify-center rounded-[8px] border border-line bg-white/[0.03] p-[12px] font-sc-regular text-[14px] leading-[1.55] font-normal whitespace-nowrap text-fg transition-colors hover:border-brand-bright/40 hover:text-brand-bright"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-[10px] border-t border-line py-[24px] text-center sm:flex-row sm:text-left">
          <p className="font-sc-regular text-[13px] leading-[1.6] font-normal text-dim">©惠州雷士光电科技有限公司版权所有 All rights reserved.</p>
          <p className="font-sc-regular text-[13px] leading-[1.6] font-normal text-dim">
            {hotline.hours}{' '}
            <a href={`tel:${hotline.tel}`} className="font-mono text-muted transition-colors hover:text-brand-bright">
              {hotline.display}
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
