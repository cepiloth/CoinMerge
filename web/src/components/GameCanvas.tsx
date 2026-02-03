import React, { useEffect, useRef } from 'react'
import Matter from 'matter-js'

const WALL_THICKNESS = 24
const COIN_RADIUS = 28
const PREVIEW_Y = 56

/**
 * GameCanvas의 props 인터페이스
 */
interface IGameCanvasProps {
  /** 캔버스 너비 (px) */
  width?: number
  /** 캔버스 높이 (px) */
  height?: number
  /** 추가 클래스명 */
  className?: string
}

/**
 * Matter.js 물리 엔진이 연동된 게임 캔버스.
 * 마운트 시 엔진 초기화, 언마운트 시 정리.
 * 좌/우/바닥 벽, 상단 대기 동전(마우스 추적), 클릭/터치 시 동전 낙하.
 */
const GameCanvas: React.FC<IGameCanvasProps> = ({
  width = 400,
  height = 600,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<Matter.Engine | null>(null)
  const renderRef = useRef<Matter.Render | null>(null)
  const runnerRef = useRef<Matter.Runner | null>(null)
  const previewBodyRef = useRef<Matter.Body | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const engine = Matter.Engine.create({ gravity: { x: 0, y: 1 } })
    const { world } = engine
    engineRef.current = engine

    // 1. 정적 벽: 좌 / 우 / 바닥
    const ground = Matter.Bodies.rectangle(
      width / 2,
      height + WALL_THICKNESS / 2,
      width + WALL_THICKNESS * 2,
      WALL_THICKNESS,
      { isStatic: true }
    )
    const leftWall = Matter.Bodies.rectangle(
      -WALL_THICKNESS / 2,
      height / 2,
      WALL_THICKNESS,
      height + WALL_THICKNESS * 2,
      { isStatic: true }
    )
    const rightWall = Matter.Bodies.rectangle(
      width + WALL_THICKNESS / 2,
      height / 2,
      WALL_THICKNESS,
      height + WALL_THICKNESS * 2,
      { isStatic: true }
    )
    Matter.World.add(world, [ground, leftWall, rightWall])

    // 2. 상단 대기 동전 (정적, 마우스/터치에 따라 위치 갱신)
    const previewBody = Matter.Bodies.circle(width / 2, PREVIEW_Y, COIN_RADIUS, {
      isStatic: true,
      render: { fillStyle: '#3182F6' },
    })
    previewBodyRef.current = previewBody
    Matter.World.add(world, previewBody)

    // 3. 렌더러 및 러너
    const render = Matter.Render.create({
      engine,
      element: container,
      options: {
        width,
        height,
        wireframes: false,
        background: '#F2F4F6',
      },
    })
    renderRef.current = render
    Matter.Render.run(render)

    const runner = Matter.Runner.create()
    runnerRef.current = runner
    Matter.Runner.run(runner, engine)

    // 좌표를 캔버스 내부로 제한 (대기 동전용)
    const clampX = (x: number) =>
      Math.max(COIN_RADIUS + 4, Math.min(width - COIN_RADIUS - 4, x))

    const updatePreviewPosition = (clientX: number, _clientY: number) => {
      const rect = container.getBoundingClientRect()
      const scaleX = width / rect.width
      const x = (clientX - rect.left) * scaleX
      Matter.Body.setPosition(previewBody, { x: clampX(x), y: PREVIEW_Y })
    }

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0]?.clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0]?.clientY : e.clientY
      if (clientX != null && clientY != null) updatePreviewPosition(clientX, clientY)
    }

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const rect = container.getBoundingClientRect()
      const scaleX = width / rect.width
      const scaleY = height / rect.height
      const clientX = 'touches' in e ? e.touches[0]?.clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0]?.clientY : e.clientY
      if (clientX == null || clientY == null) return
      const x = (clientX - rect.left) * scaleX
      const y = (clientY - rect.top) * scaleY
      const dropX = clampX(x)
      const dropY = Math.min(height - COIN_RADIUS - 8, Math.max(COIN_RADIUS, y))

      const coin = Matter.Bodies.circle(dropX, dropY, COIN_RADIUS, {
        restitution: 0.3,
        friction: 0.3,
        render: { fillStyle: '#3182F6' },
      })
      Matter.World.add(world, coin)
    }

    container.addEventListener('mousemove', handlePointerMove)
    container.addEventListener('mousedown', handlePointerDown)
    container.addEventListener('touchmove', handlePointerMove, { passive: true })
    container.addEventListener('touchstart', (e) => {
      e.preventDefault()
      handlePointerDown(e)
    }, { passive: false })

    return () => {
      container.removeEventListener('mousemove', handlePointerMove)
      container.removeEventListener('mousedown', handlePointerDown)
      container.removeEventListener('touchmove', handlePointerMove)
      container.removeEventListener('touchstart', handlePointerDown as EventListener)

      if (runnerRef.current) Matter.Runner.stop(runnerRef.current)
      if (renderRef.current) Matter.Render.stop(renderRef.current)
      if (engineRef.current) Matter.Engine.clear(engineRef.current)
      if (container.contains(render.canvas)) container.removeChild(render.canvas)

      engineRef.current = null
      renderRef.current = null
      runnerRef.current = null
      previewBodyRef.current = null
    }
  }, [width, height])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width, height, touchAction: 'none' }}
      role="application"
      aria-label="동전 합치기 게임 캔버스"
    />
  )
}

export default GameCanvas
