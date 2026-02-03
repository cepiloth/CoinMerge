import React, { useEffect, useRef } from 'react'
import Matter from 'matter-js'
import { CURRENCY_STAGES } from '../constants/currency'

const WALL_THICKNESS = 28
const PREVIEW_Y = 80

/** 동전(화폐) 바디에 부여하는 단계 속성 */
type CurrencyBody = Matter.Body & { currencyStage: number }
function isCurrencyBody(body: Matter.Body): body is CurrencyBody {
  return typeof (body as CurrencyBody).currencyStage === 'number'
}

/** 동전 위에 표시할 짧은 숫자/라벨 */
function getCoinDisplayLabel(stage: number): string {
  const labels: Record<number, string> = {
    0: '10',
    1: '50',
    2: '100',
    3: '500',
    4: '1K',
    5: '5K',
    6: '10K',
    7: '50K',
    8: 'G',
  }
  return labels[stage] ?? ''
}

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
  /** 다음에 나올 동전 단계 (0~7) */
  nextCoinStage: number
  /** 동전 드롭 후 호출 (다음 동전 갱신용) */
  onDropComplete: () => void
  /** 머지 시 점수 추가 */
  onMergeScore: (points: number) => void
  /** 골드바 생성 시 게임 종료 */
  onGameOver: () => void
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
  nextCoinStage,
  onDropComplete,
  onMergeScore,
  onGameOver,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<Matter.Engine | null>(null)
  const renderRef = useRef<Matter.Render | null>(null)
  const runnerRef = useRef<Matter.Runner | null>(null)
  const previewBodyRef = useRef<Matter.Body | null>(null)
  const nextCoinStageRef = useRef(nextCoinStage)
  const onDropCompleteRef = useRef(onDropComplete)
  const onMergeScoreRef = useRef(onMergeScore)
  const onGameOverRef = useRef(onGameOver)
  nextCoinStageRef.current = nextCoinStage
  onDropCompleteRef.current = onDropComplete
  onMergeScoreRef.current = onMergeScore
  onGameOverRef.current = onGameOver

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const engine = Matter.Engine.create({ gravity: { x: 0, y: 1 } })
    const { world } = engine
    engineRef.current = engine

    const stageForPreview = Math.min(7, Math.max(0, nextCoinStage))
    const firstStage = CURRENCY_STAGES[stageForPreview]
    const previewRadius = firstStage.radius

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
    const previewBody = Matter.Bodies.circle(width / 2, PREVIEW_Y, previewRadius, {
      isStatic: true,
      render: { fillStyle: firstStage.color },
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

    // 동전 위에 숫자(라벨) 그리기
    const drawCoinLabels = () => {
      const ctx = render.context
      if (!ctx) return
      const bodies = Matter.Composite.allBodies(world)
      for (const body of bodies) {
        let stage: number
        if (isCurrencyBody(body)) {
          stage = body.currencyStage
        } else if (body === previewBody) {
          stage = nextCoinStageRef.current
        } else {
          continue
        }
        const label = getCoinDisplayLabel(stage)
        if (!label) continue
        const stageData = CURRENCY_STAGES[stage]
        const radius = stageData?.radius ?? previewRadius
        const x = body.position.x
        const y = body.position.y
        const fontSize = Math.max(10, Math.min(16, Math.floor(radius * 0.55)))
        ctx.save()
        ctx.font = `600 ${fontSize}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = '#191F28'
        ctx.fillText(label, x, y)
        ctx.restore()
      }
    }
    Matter.Events.on(render, 'afterRender', drawCoinLabels)

    // 좌표를 캔버스 내부로 제한 (최대 동전 반지름 기준)
    const maxCoinRadius = Math.max(...CURRENCY_STAGES.map((s) => s.radius))
    const clampX = (x: number) =>
      Math.max(maxCoinRadius + 4, Math.min(width - maxCoinRadius - 4, x))

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
      const stageToDrop = Math.min(7, Math.max(0, nextCoinStageRef.current))
      const stageData = CURRENCY_STAGES[stageToDrop]
      const x = (clientX - rect.left) * scaleX
      const y = (clientY - rect.top) * scaleY
      const dropX = clampX(x)
      const dropY = Math.min(height - stageData.radius - 8, Math.max(stageData.radius, y))

      const coin = Matter.Bodies.circle(dropX, dropY, stageData.radius, {
        restitution: 0.3,
        friction: 0.3,
        render: { fillStyle: stageData.color },
      })
      ;(coin as CurrencyBody).currencyStage = stageToDrop
      Matter.World.add(world, coin)
      onDropCompleteRef.current()
    }

    // 4. collisionStart: 같은 단계 두 물체 충돌 시 머지 (제거 → 다음 단계 생성 → 위로 힘)
    const getMergePopVelocity = () => ({
      x: (Math.random() - 0.5) * 2,
      y: -6,
    })
    const handleCollisionStart = (event: Matter.IEventCollision<Matter.Engine>) => {
      const { pairs } = event
      for (const pair of pairs) {
        const bodyA = pair.bodyA
        const bodyB = pair.bodyB
        if (!isCurrencyBody(bodyA) || !isCurrencyBody(bodyB)) continue
        const stage = bodyA.currencyStage
        if (bodyB.currencyStage !== stage) continue
        if (stage >= CURRENCY_STAGES.length - 1) continue // 골드바는 더 이상 합치지 않음

        // 이미 다른 충돌에서 제거된 경우 스킵
        if (!world.bodies.includes(bodyA) || !world.bodies.includes(bodyB)) continue

        const nextStage = CURRENCY_STAGES[stage + 1]
        const midX = (bodyA.position.x + bodyB.position.x) / 2
        const midY = (bodyA.position.y + bodyB.position.y) / 2

        Matter.World.remove(world, [bodyA, bodyB])

        const merged = Matter.Bodies.circle(midX, midY, nextStage.radius, {
          restitution: 0.35,
          friction: 0.3,
          render: { fillStyle: nextStage.color },
        })
        ;(merged as CurrencyBody).currencyStage = stage + 1
        Matter.Body.setVelocity(merged, getMergePopVelocity())
        Matter.World.add(world, merged)
        onMergeScoreRef.current(nextStage.score)
        if (stage + 1 === 8) onGameOverRef.current()
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(20)
        }
      }
    }
    Matter.Events.on(engine, 'collisionStart', handleCollisionStart)

    container.addEventListener('mousemove', handlePointerMove)
    container.addEventListener('mousedown', handlePointerDown)
    container.addEventListener('touchmove', handlePointerMove, { passive: true })
    container.addEventListener('touchstart', (e) => {
      e.preventDefault()
      handlePointerDown(e)
    }, { passive: false })

    return () => {
      Matter.Events.off(render, 'afterRender', drawCoinLabels)
      Matter.Events.off(engine, 'collisionStart', handleCollisionStart)
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

  // nextCoinStage 변경 시 대기 동전(미리보기)만 교체
  useEffect(() => {
    const engine = engineRef.current
    if (!engine) return
    const world = engine.world
    const oldPreview = previewBodyRef.current
    if (oldPreview) Matter.World.remove(world, oldPreview)
    const stage = Math.min(7, Math.max(0, nextCoinStage))
    const stageData = CURRENCY_STAGES[stage]
    const newPreview = Matter.Bodies.circle(width / 2, PREVIEW_Y, stageData.radius, {
      isStatic: true,
      render: { fillStyle: stageData.color },
    })
    Matter.World.add(world, newPreview)
    previewBodyRef.current = newPreview
  }, [nextCoinStage, width])

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
