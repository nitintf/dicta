import { useEffect, useRef, type HTMLAttributes } from 'react'

import { cn } from '@/lib/cn'

export type LiveWaveformProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'onError'
> & {
  active?: boolean
  processing?: boolean
  audioLevel?: number // Audio level from backend (0-100)
  barWidth?: number
  barHeight?: number
  barGap?: number
  barRadius?: number
  barColor?: string
  fadeEdges?: boolean
  fadeWidth?: number
  height?: string | number
  sensitivity?: number
  mode?: 'scrolling' | 'static'
}

export const LiveWaveform = ({
  active = false,
  processing = false,
  audioLevel,
  barWidth = 3,
  barGap = 1,
  barRadius = 1.5,
  barColor,
  fadeEdges = true,
  fadeWidth = 24,
  barHeight: baseBarHeight = 4,
  height = 64,
  sensitivity = 1,
  mode = 'static',
  className,
  ...props
}: LiveWaveformProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const processingAnimationRef = useRef<number | null>(null)
  const lastActiveDataRef = useRef<number[]>([])
  const transitionProgressRef = useRef(0)
  const staticBarsRef = useRef<number[]>([])
  const targetBarsRef = useRef<number[]>([]) // Target values for smooth interpolation
  const needsRedrawRef = useRef(true)
  const gradientCacheRef = useRef<CanvasGradient | null>(null)
  const lastWidthRef = useRef(0)

  const heightStyle = typeof height === 'number' ? `${height}px` : height

  // Handle canvas resizing
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const resizeObserver = new ResizeObserver(() => {
      const rect = container.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1

      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`

      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.scale(dpr, dpr)
      }

      gradientCacheRef.current = null
      lastWidthRef.current = rect.width
      needsRedrawRef.current = true
    })

    resizeObserver.observe(container)
    return () => resizeObserver.disconnect()
  }, [])

  // Handle processing animation (when not active)
  useEffect(() => {
    if (processing && !active) {
      let time = 0
      transitionProgressRef.current = 0

      const animateProcessing = () => {
        time += 0.06 // Increased from 0.03 for faster animation
        transitionProgressRef.current = Math.min(
          1,
          transitionProgressRef.current + 0.04 // Increased from 0.02 for faster transition
        )

        const processingData = []
        const barCount = Math.floor(
          (containerRef.current?.getBoundingClientRect().width || 200) /
            (barWidth + barGap)
        )

        const halfCount = Math.floor(barCount / 2)

        for (let i = 0; i < barCount; i++) {
          const normalizedPosition = (i - halfCount) / halfCount
          const centerWeight = 1 - Math.abs(normalizedPosition) * 0.4

          const wave1 = Math.sin(time * 1.5 + normalizedPosition * 3) * 0.25
          const wave2 = Math.sin(time * 0.8 - normalizedPosition * 2) * 0.2
          const wave3 = Math.cos(time * 2 + normalizedPosition) * 0.15
          const combinedWave = wave1 + wave2 + wave3
          const processingValue = (0.2 + combinedWave) * centerWeight

          let finalValue = processingValue
          if (
            lastActiveDataRef.current.length > 0 &&
            transitionProgressRef.current < 1
          ) {
            const lastDataIndex = Math.min(
              i,
              lastActiveDataRef.current.length - 1
            )
            const lastValue = lastActiveDataRef.current[lastDataIndex] || 0
            finalValue =
              lastValue * (1 - transitionProgressRef.current) +
              processingValue * transitionProgressRef.current
          }

          processingData.push(Math.max(0.05, Math.min(1, finalValue)))
        }

        staticBarsRef.current = processingData
        needsRedrawRef.current = true
        processingAnimationRef.current =
          requestAnimationFrame(animateProcessing)
      }

      animateProcessing()

      return () => {
        if (processingAnimationRef.current) {
          cancelAnimationFrame(processingAnimationRef.current)
        }
      }
    } else if (!active && !processing) {
      const hasData = staticBarsRef.current.length > 0

      if (hasData) {
        let fadeProgress = 0
        const fadeToIdle = () => {
          fadeProgress += 0.03
          if (fadeProgress < 1) {
            staticBarsRef.current = staticBarsRef.current.map(
              value => value * (1 - fadeProgress)
            )
            needsRedrawRef.current = true
            requestAnimationFrame(fadeToIdle)
          } else {
            staticBarsRef.current = []
          }
        }
        fadeToIdle()
      }
    }
  }, [processing, active, barWidth, barGap])

  // Handle backend audio level updates
  useEffect(() => {
    if (!active || audioLevel === undefined) {
      return
    }

    const normalizedLevel = Math.min(1, Math.max(0, audioLevel / 100))

    // For static mode, create symmetric bars based on audio level with variation
    const barCount = Math.floor(
      (containerRef.current?.getBoundingClientRect().width || 200) /
        (barWidth + barGap)
    )
    const halfCount = Math.floor(barCount / 2)
    const newBars: number[] = []

    // Initialize staticBarsRef if empty
    if (staticBarsRef.current.length === 0) {
      staticBarsRef.current = new Array(barCount).fill(0.02)
    }

    for (let i = 0; i < barCount; i++) {
      const normalizedPosition = Math.abs((i - halfCount) / halfCount)
      // Reduced center bias from 0.6 to 0.3 so edge bars participate more
      const centerWeight = 1 - normalizedPosition * 0.3

      // Add slight random variation per bar for more organic feel
      const variation = 0.9 + Math.random() * 0.2 // 0.9 to 1.1

      // Apply sensitivity boost with variation
      const baseValue =
        normalizedLevel * centerWeight * sensitivity * 8 * variation
      const value = Math.max(0.02, Math.min(1, baseValue))

      newBars.push(value)
    }

    // Set target bars for smooth interpolation
    targetBarsRef.current = newBars
    needsRedrawRef.current = true
  }, [audioLevel, active, mode, barWidth, barGap, sensitivity])

  // Animation loop for rendering
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let rafId: number

    const animate = () => {
      const rect = canvas.getBoundingClientRect()

      // Smooth interpolation towards target values
      if (active && targetBarsRef.current.length > 0) {
        const smoothingFactor = 0.15 // Lower = smoother but slower, higher = faster but jerkier

        // Interpolate each bar towards its target
        for (let i = 0; i < staticBarsRef.current.length; i++) {
          const current = staticBarsRef.current[i] || 0.02
          const target = targetBarsRef.current[i] || 0.02

          // Lerp: current + (target - current) * smoothingFactor
          staticBarsRef.current[i] =
            current + (target - current) * smoothingFactor
        }

        needsRedrawRef.current = true
      }

      // Only redraw if needed
      if (!needsRedrawRef.current && !active) {
        rafId = requestAnimationFrame(animate)
        return
      }

      if (active) {
        needsRedrawRef.current = true // Keep redrawing while active for smooth animation
      }

      ctx.clearRect(0, 0, rect.width, rect.height)

      const computedBarColor =
        barColor ||
        (() => {
          const style = getComputedStyle(canvas)
          // Try to get the computed color value directly
          const color = style.color
          return color || '#000'
        })()

      const step = barWidth + barGap
      const barCount = Math.floor(rect.width / step)
      const centerY = rect.height / 2

      // Draw bars
      const dataToRender = processing
        ? staticBarsRef.current
        : active
          ? staticBarsRef.current
          : staticBarsRef.current.length > 0
            ? staticBarsRef.current
            : []

      for (let i = 0; i < barCount && i < dataToRender.length; i++) {
        const value = dataToRender[i] || 0.1
        const x = i * step
        const barHeight = Math.max(baseBarHeight, value * rect.height * 0.8)
        const y = centerY - barHeight / 2

        ctx.fillStyle = computedBarColor
        ctx.globalAlpha = 0.4 + value * 0.6

        if (barRadius > 0) {
          ctx.beginPath()
          ctx.roundRect(x, y, barWidth, barHeight, barRadius)
          ctx.fill()
        } else {
          ctx.fillRect(x, y, barWidth, barHeight)
        }
      }

      // Apply edge fading
      if (fadeEdges && fadeWidth > 0 && rect.width > 0) {
        // Cache gradient if width hasn't changed
        if (!gradientCacheRef.current || lastWidthRef.current !== rect.width) {
          const gradient = ctx.createLinearGradient(0, 0, rect.width, 0)
          const fadePercent = Math.min(0.3, fadeWidth / rect.width)

          // destination-out: removes destination where source alpha is high
          // We want: fade edges out, keep center solid
          // Left edge: start opaque (1) = remove, fade to transparent (0) = keep
          gradient.addColorStop(0, 'rgba(255,255,255,1)')
          gradient.addColorStop(fadePercent, 'rgba(255,255,255,0)')
          // Center stays transparent = keep everything
          gradient.addColorStop(1 - fadePercent, 'rgba(255,255,255,0)')
          // Right edge: fade from transparent (0) = keep to opaque (1) = remove
          gradient.addColorStop(1, 'rgba(255,255,255,1)')

          gradientCacheRef.current = gradient
          lastWidthRef.current = rect.width
        }

        ctx.globalCompositeOperation = 'destination-out'
        ctx.fillStyle = gradientCacheRef.current
        ctx.fillRect(0, 0, rect.width, rect.height)
        ctx.globalCompositeOperation = 'source-over'
      }

      ctx.globalAlpha = 1

      rafId = requestAnimationFrame(animate)
    }

    rafId = requestAnimationFrame(animate)

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [
    active,
    processing,
    sensitivity,
    barWidth,
    baseBarHeight,
    barGap,
    barRadius,
    barColor,
    fadeEdges,
    fadeWidth,
    mode,
  ])

  return (
    <div
      className={cn('relative h-full w-full flex-1', className)}
      ref={containerRef}
      style={{ height: heightStyle }}
      aria-label={
        active
          ? 'Live audio waveform'
          : processing
            ? 'Processing audio'
            : 'Audio waveform idle'
      }
      role="img"
      {...props}
    >
      {!active && !processing && (
        <div className="border-muted-foreground/20 absolute top-1/2 right-0 left-0 -translate-y-1/2 border-t-2 border-dotted" />
      )}
      <canvas
        className="block h-full w-full"
        ref={canvasRef}
        aria-hidden="true"
      />
    </div>
  )
}
