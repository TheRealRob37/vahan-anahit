import { useNavigate } from 'react-router-dom'
import WeddingGame from '../components/WeddingGame'

export default function GamePage() {
  const navigate = useNavigate()
  return (
    <div className="fixed inset-0" style={{ backgroundColor: '#1a0e06' }}>
      {/* back button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 z-10 font-armenian-sans text-xs text-amber-200/50 hover:text-amber-200/90 transition-colors"
        style={{ letterSpacing: '0.05em' }}
      >
        ← Վերադառնալ
      </button>

      {/* controls hint */}
      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 font-armenian-sans text-xs text-amber-200/30 pointer-events-none hidden sm:block">
        ← → կամ A D ստեղներ
      </p>

      <WeddingGame />
    </div>
  )
}
