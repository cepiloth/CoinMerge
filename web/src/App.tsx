import { useState, useCallback, useEffect } from 'react'
import GameCanvas from './components/GameCanvas'
import GameUI from './components/GameUI'
import { CURRENCY_STAGES } from './constants/currency'

const BEST_SCORE_KEY = 'coin-merge-best-score'
const MAX_NEXT_STAGE = 2 // 10원(0), 50원(1), 100원(2)만 다음 동전으로

function randomNextStage(): number {
  return Math.floor(Math.random() * (MAX_NEXT_STAGE + 1))
}

function App() {
  const [score, setScore] = useState(0)
  const [bestScore, setBestScore] = useState(() => {
    try {
      return Number(localStorage.getItem(BEST_SCORE_KEY)) || 0
    } catch {
      return 0
    }
  })
  const [gameOver, setGameOver] = useState(false)
  const [nextCoinStage, setNextCoinStage] = useState(() => randomNextStage())

  const handleRestart = useCallback(() => {
    setScore(0)
    setGameOver(false)
    setNextCoinStage(randomNextStage())
    // TODO: GameCanvas 리셋 연동
  }, [])

  const handleDropComplete = useCallback(() => {
    setNextCoinStage(randomNextStage())
  }, [])

  const handleMergeScore = useCallback((points: number) => {
    setScore((prev) => prev + points)
  }, [])

  const handleGameOver = useCallback(() => {
    setGameOver(true)
  }, [])

  useEffect(() => {
    if (gameOver) {
      setBestScore((prev) => {
        const next = Math.max(prev, score)
        try {
          localStorage.setItem(BEST_SCORE_KEY, String(next))
        } catch {}
        return next
      })
    }
  }, [gameOver, score])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold text-text mb-2">Toss Coin Merge</h1>
      <p className="text-text/80 mb-4">Apps in Toss · 동전 합치기</p>
      <GameUI
        score={score}
        bestScore={bestScore}
        nextCoin={CURRENCY_STAGES[nextCoinStage]}
        gameOver={gameOver}
        onRestart={handleRestart}
      >
        <GameCanvas
          width={380}
          height={560}
          className="rounded-2xl shadow-lg overflow-hidden"
          nextCoinStage={nextCoinStage}
          onDropComplete={handleDropComplete}
          onMergeScore={handleMergeScore}
          onGameOver={handleGameOver}
        />
      </GameUI>
    </div>
  )
}

export default App
