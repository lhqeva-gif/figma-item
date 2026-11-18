import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'

type View = { scale: number; x: number; y: number }

type ZoomCanvasProps = {
  /** Intrinsic size of the drawing, in canvas pixels. */
  width: number
  height: number
  /** Visible viewport height in CSS pixels; the drawing is fitted inside it initially. */
  viewportHeight: number
  label: string
  className?: string
  children: ReactNode
}

const MAX_SCALE = 2.4
const STEP = 1.25
const DRAG_THRESHOLD = 4

/** Fixed-height viewport that fits a drawing, then lets people zoom (buttons, Ctrl/⌘ + wheel, pinch) and drag to pan. */
export function ZoomCanvas({ width, height, viewportHeight, label, className = '', children }: ZoomCanvasProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [vw, setVw] = useState(0)
  const [view, setView] = useState<View>({ scale: 1, x: 0, y: 0 })
  const [animate, setAnimate] = useState(false)
  const [dragging, setDragging] = useState(false)
  const touched = useRef(false)
  const viewRef = useRef(view)
  viewRef.current = view

  // Leave room above the bottom control bar so the fitted drawing isn't covered.
  const PAD_TOP = 16
  const PAD_BOTTOM = 64
  const fitH = viewportHeight - PAD_TOP - PAD_BOTTOM
  const fit = vw ? Math.min(vw / width, fitH / height) : 1
  const minScale = fit * 0.8

  const clamp = useCallback(
    (v: View): View => {
      const axis = (pos: number, content: number, box: number) => {
        const slack = 48
        return content <= box ? Math.min(Math.max(pos, -slack), box - content + slack) : Math.min(Math.max(pos, box - content - slack), slack)
      }
      return { scale: v.scale, x: axis(v.x, width * v.scale, vw), y: axis(v.y, height * v.scale, viewportHeight) }
    },
    [width, height, vw, viewportHeight],
  )

  const fitted = useCallback(
    (): View => ({ scale: fit, x: (vw - width * fit) / 2, y: PAD_TOP + (fitH - height * fit) / 2 }),
    [fit, vw, width, height, fitH],
  )

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setVw(entry.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Keep the whole drawing in view until the visitor zooms or pans.
  useEffect(() => {
    if (vw && !touched.current) setView(fitted())
  }, [vw, fitted])

  const zoomAt = useCallback(
    (factor: number, px: number, py: number, smooth: boolean) => {
      touched.current = true
      setAnimate(smooth)
      setView((v) => {
        const scale = Math.min(Math.max(v.scale * factor, minScale), MAX_SCALE)
        const k = scale / v.scale
        return clamp({ scale, x: px - (px - v.x) * k, y: py - (py - v.y) * k })
      })
    },
    [clamp, minScale],
  )

  // Wheel zoom only with Ctrl/⌘ (trackpad pinch reports ctrlKey) so normal scrolling still moves the page.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return
      e.preventDefault()
      const r = el.getBoundingClientRect()
      zoomAt(Math.exp(-e.deltaY * 0.003), e.clientX - r.left, e.clientY - r.top, false)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [zoomAt])

  const drag = useRef<{ id: number; sx: number; sy: number; vx: number; vy: number; moved: boolean } | null>(null)

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || (e.target as HTMLElement).closest('[data-zoom-controls]')) return
    drag.current = { id: e.pointerId, sx: e.clientX, sy: e.clientY, vx: viewRef.current.x, vy: viewRef.current.y, moved: false }
  }
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    const dx = e.clientX - d.sx
    const dy = e.clientY - d.sy
    if (!d.moved) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return
      d.moved = true
      touched.current = true
      setAnimate(false)
      setDragging(true)
      e.currentTarget.setPointerCapture(e.pointerId)
    }
    setView((v) => clamp({ scale: v.scale, x: d.vx + dx, y: d.vy + dy }))
  }
  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    drag.current = null
    if (!d.moved) return
    setDragging(false)
    // Swallow the click that follows a drag so it doesn't trigger a node underneath.
    const stop = (ev: MouseEvent) => {
      ev.stopPropagation()
      ev.preventDefault()
    }
    window.addEventListener('click', stop, { capture: true, once: true })
    setTimeout(() => window.removeEventListener('click', stop, { capture: true }), 0)
  }

  const zoomCenter = (factor: number) => zoomAt(factor, vw / 2, viewportHeight / 2, true)
  const reset = () => {
    touched.current = false
    setAnimate(true)
    setView(fitted())
  }

  return (
    <div
      ref={ref}
      role="group"
      aria-label={`${label}（可缩放、拖拽）`}
      className={`relative w-full overflow-hidden rounded-[16px] select-none border border-line bg-ink/40 ${dragging ? 'cursor-grabbing' : 'cursor-grab'} ${className}`}
      style={{ height: viewportHeight, touchAction: 'none' }}
      onDragStart={(e) => e.preventDefault()}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onDoubleClick={(e) => {
        if ((e.target as HTMLElement).closest('button, a, [data-zoom-controls]')) return
        const r = e.currentTarget.getBoundingClientRect()
        zoomAt(STEP * STEP, e.clientX - r.left, e.clientY - r.top, true)
      }}
    >
      <div
        className={`absolute top-0 left-0 origin-top-left ${dragging ? '[&_*]:!cursor-grabbing' : ''} ${animate ? 'transition-transform duration-300 ease-out motion-reduce:transition-none' : ''}`}
        style={{ width, height, transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.scale})` }}
      >
        {children}
      </div>

      <div className="pointer-events-none absolute bottom-[14px] left-[16px] hidden rounded-[6px] bg-ink/70 px-[10px] py-[6px] font-sc-regular text-[12px] text-muted backdrop-blur sm:block">
        拖拽平移 · Ctrl / ⌘ + 滚轮或双指缩放
      </div>
      <div
        data-zoom-controls
        className="absolute right-[14px] bottom-[14px] flex cursor-default items-center gap-[2px] rounded-[10px] border border-line-strong bg-ink/80 p-[4px] backdrop-blur"
      >
        <ZoomButton label="缩小" onClick={() => zoomCenter(1 / STEP)} disabled={view.scale <= minScale + 0.001}>
          <path d="M5 12h14" />
        </ZoomButton>
        <span className="w-[48px] text-center font-mono text-[12px] text-muted tabular-nums" aria-live="polite">
          {Math.round(view.scale * 100)}%
        </span>
        <ZoomButton label="放大" onClick={() => zoomCenter(STEP)} disabled={view.scale >= MAX_SCALE - 0.001}>
          <path d="M12 5v14M5 12h14" />
        </ZoomButton>
        <span className="mx-[4px] h-[18px] w-px bg-line-strong" />
        <ZoomButton label="适应画布" onClick={reset}>
          <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
        </ZoomButton>
      </div>
    </div>
  )
}

function ZoomButton({ label, onClick, disabled = false, children }: { label: string; onClick: () => void; disabled?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="grid size-[32px] cursor-pointer place-items-center rounded-[7px] text-fg transition-colors hover:bg-white/[0.08] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-bright disabled:cursor-not-allowed disabled:opacity-35"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {children}
      </svg>
    </button>
  )
}
