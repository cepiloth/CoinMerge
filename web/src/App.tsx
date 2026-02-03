import GameCanvas from './components/GameCanvas'

function App() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold text-text mb-2">Toss Coin Merge</h1>
      <p className="text-text/80 mb-4">Apps in Toss · 동전 합치기</p>
      <GameCanvas width={380} height={560} className="rounded-2xl shadow-lg overflow-hidden" />
    </div>
  )
}

export default App
