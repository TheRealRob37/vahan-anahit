import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import WeddingGame from '../components/WeddingGame'
import { supabase } from '../lib/supabase'

// ── SQL to run once in Supabase dashboard ─────────────────────────────────
// CREATE TABLE game_scores (
//   id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//   created_at  TIMESTAMPTZ DEFAULT now(),
//   player_name TEXT NOT NULL,
//   score       INTEGER NOT NULL
// );
// ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;
// CREATE POLICY "anyone can insert" ON game_scores FOR INSERT WITH CHECK (true);
// CREATE POLICY "anyone can read"   ON game_scores FOR SELECT USING (true);

export default function GamePage() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState('name')  // 'name' | 'playing' | 'gameover'
  const [playerName, setPlayerName] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [finalScore, setFinalScore] = useState(0)
  const [leaderboard, setLeaderboard] = useState([])
  const [saving, setSaving] = useState(false)
  const [myRank, setMyRank] = useState(null)
  const inputRef = useRef(null)

  // focus input on mount
  useEffect(() => {
    if (phase === 'name' && inputRef.current) inputRef.current.focus()
  }, [phase])

  function handleStart(e) {
    e.preventDefault()
    const name = inputValue.trim()
    if (!name) return
    setPlayerName(name)
    setPhase('playing')
  }

  async function handleGameOver(score) {
    setFinalScore(score)
    setPhase('gameover')
    setSaving(true)

    try {
      // save score
      await supabase.from('game_scores').insert({ player_name: playerName, score })

      // fetch top 10
      const { data } = await supabase
        .from('game_scores')
        .select('player_name, score, created_at')
        .order('score', { ascending: false })
        .limit(10)

      setLeaderboard(data || [])

      // find rank of just-submitted score
      const { count } = await supabase
        .from('game_scores')
        .select('*', { count: 'exact', head: true })
        .gt('score', score)

      setMyRank((count ?? 0) + 1)
    } catch (err) {
      console.error('Leaderboard error:', err)
    } finally {
      setSaving(false)
    }
  }

  function handlePlayAgain() {
    setPhase('name')
    setInputValue('')
    setLeaderboard([])
    setMyRank(null)
  }

  return (
    <div className="fixed inset-0" style={{ backgroundColor: '#0d0805' }}>
      {/* back button — always visible */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 z-50 font-armenian-sans text-xs transition-colors"
        style={{ color: 'rgba(253,230,138,0.35)', letterSpacing: '0.05em' }}
        onMouseEnter={e => e.currentTarget.style.color = 'rgba(253,230,138,0.8)'}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(253,230,138,0.35)'}
      >
        ← Վերադառնալ
      </button>

      {/* game canvas — always mounted so it's instant */}
      <div className={`absolute inset-0 ${phase === 'playing' ? 'z-10' : 'z-0 pointer-events-none opacity-0'}`}>
        {phase === 'playing' && (
          <WeddingGame playerName={playerName} onGameOver={handleGameOver} />
        )}
      </div>

      {/* controls hint */}
      {phase === 'playing' && (
        <p className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 font-armenian-sans text-xs pointer-events-none hidden sm:block"
           style={{ color: 'rgba(253,230,138,0.25)' }}>
          ← → կամ A D ստեղներ
        </p>
      )}

      {/* ── NAME ENTRY ── */}
      <AnimatePresence>
        {phase === 'name' && (
          <motion.div
            key="name"
            className="absolute inset-0 z-30 flex flex-col items-center justify-center px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
          >
            {/* decorative stars background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {Array.from({ length: 40 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: Math.random() * 2 + 1,
                    height: Math.random() * 2 + 1,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    backgroundColor: Math.random() > 0.6 ? '#F0D080' : '#ffffff',
                    opacity: Math.random() * 0.5 + 0.1,
                  }}
                />
              ))}
            </div>

            <motion.div
              className="relative w-full max-w-sm"
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5 }}
            >
              {/* card */}
              <div
                className="rounded-2xl px-8 py-10 text-center"
                style={{
                  backgroundColor: 'rgba(17,10,4,0.96)',
                  border: '1px solid rgba(201,146,42,0.4)',
                  boxShadow: '0 0 60px rgba(201,146,42,0.12), 0 0 0 1px rgba(201,146,42,0.08) inset',
                }}
              >
                {/* ring icon */}
                <div className="mx-auto mb-5 w-14 h-14 flex items-center justify-center">
                  <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <circle cx="28" cy="28" r="24" stroke="#C9922A" strokeWidth="3" fill="none"/>
                    <circle cx="28" cy="28" r="14" stroke="#C9922A" strokeWidth="2" fill="#0d0805"/>
                    <path d="M14 20 Q28 10 42 20" stroke="#F0D080" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7"/>
                  </svg>
                </div>

                <h1 className="font-armenian-serif text-2xl font-light mb-1" style={{ color: '#F0D080' }}>
                  Բռնիր Մատանիները
                </h1>
                <p className="font-armenian-sans text-xs mb-8" style={{ color: 'rgba(240,208,128,0.4)', letterSpacing: '0.1em' }}>
                  Վահան & Անահիտ · 2026
                </p>

                <form onSubmit={handleStart} className="flex flex-col gap-4">
                  <div className="text-left">
                    <label className="font-armenian-sans text-xs block mb-2" style={{ color: 'rgba(253,230,138,0.5)', letterSpacing: '0.08em' }}>
                      Ձեր անունը
                    </label>
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                      maxLength={30}
                      placeholder="Մուտքագրեք անունը..."
                      className="w-full rounded-xl px-4 py-3 font-armenian-sans text-sm outline-none transition-all"
                      style={{
                        backgroundColor: 'rgba(201,146,42,0.08)',
                        border: '1px solid rgba(201,146,42,0.25)',
                        color: '#f5efe3',
                        caretColor: '#C9922A',
                      }}
                      onFocus={e => e.target.style.borderColor = 'rgba(201,146,42,0.7)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(201,146,42,0.25)'}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!inputValue.trim()}
                    className="w-full rounded-xl py-3 font-armenian-sans text-sm font-medium transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: '#C9922A',
                      color: '#0d0805',
                      letterSpacing: '0.08em',
                    }}
                    onMouseEnter={e => { if (inputValue.trim()) e.currentTarget.style.backgroundColor = '#F0D080' }}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#C9922A'}
                  >
                    Սկսել Խաղը ◈
                  </button>
                </form>

                <div className="mt-6 flex justify-center gap-6 text-xs" style={{ color: 'rgba(240,208,128,0.3)' }}>
                  <span>◆ Ոսկի · 10 pts</span>
                  <span>◆ Արծաթ · 15 pts</span>
                  <span>◆ Ադամանդ · 30 pts</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── GAME OVER / LEADERBOARD ── */}
      <AnimatePresence>
        {phase === 'gameover' && (
          <motion.div
            key="gameover"
            className="absolute inset-0 z-30 flex flex-col items-center justify-center px-4"
            style={{ backgroundColor: 'rgba(13,8,5,0.88)', backdropFilter: 'blur(4px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              className="w-full max-w-sm"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.45 }}
            >
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  backgroundColor: 'rgba(17,10,4,0.98)',
                  border: '1px solid rgba(201,146,42,0.4)',
                  boxShadow: '0 0 80px rgba(201,146,42,0.15)',
                }}
              >
                {/* header */}
                <div className="px-6 pt-7 pb-5 text-center" style={{ borderBottom: '1px solid rgba(201,146,42,0.12)' }}>
                  <p className="font-armenian-sans text-xs mb-1" style={{ color: 'rgba(240,208,128,0.45)', letterSpacing: '0.12em' }}>
                    Խաղն ավարտվեց
                  </p>
                  <p className="font-armenian-serif text-4xl font-light" style={{ color: '#F0D080' }}>
                    {finalScore}
                  </p>
                  <p className="font-armenian-sans text-xs mt-0.5" style={{ color: 'rgba(240,208,128,0.35)' }}>
                    միավոր · {playerName}
                  </p>
                  {myRank && !saving && (
                    <p className="font-armenian-sans text-xs mt-2" style={{ color: myRank <= 3 ? '#F0D080' : 'rgba(240,208,128,0.5)' }}>
                      {myRank === 1 ? '🏆 Ռեկորդ!' : myRank <= 3 ? `✦ ${myRank}-րդ տեղ` : `${myRank}-րդ տեղ`}
                    </p>
                  )}
                </div>

                {/* leaderboard */}
                <div className="px-6 py-4">
                  <p className="font-armenian-sans text-xs mb-3" style={{ color: 'rgba(240,208,128,0.4)', letterSpacing: '0.1em' }}>
                    Լավագույն 10
                  </p>

                  {saving ? (
                    <div className="flex justify-center py-6">
                      <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(201,146,42,0.3)', borderTopColor: '#C9922A' }} />
                    </div>
                  ) : leaderboard.length === 0 ? (
                    <p className="text-center py-4 font-armenian-sans text-xs" style={{ color: 'rgba(240,208,128,0.3)' }}>
                      Տվյալ չկա
                    </p>
                  ) : (
                    <ol className="space-y-1.5">
                      {leaderboard.map((row, i) => {
                        const isMe = row.player_name === playerName && row.score === finalScore
                        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`
                        return (
                          <li
                            key={i}
                            className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors"
                            style={{
                              backgroundColor: isMe ? 'rgba(201,146,42,0.12)' : 'transparent',
                              border: isMe ? '1px solid rgba(201,146,42,0.25)' : '1px solid transparent',
                            }}
                          >
                            <span className="text-sm w-6 text-center flex-shrink-0" style={{ color: i < 3 ? '#F0D080' : 'rgba(240,208,128,0.35)' }}>
                              {medal}
                            </span>
                            <span className="font-armenian-sans text-xs flex-1 truncate" style={{ color: isMe ? '#f5efe3' : 'rgba(245,239,227,0.65)' }}>
                              {row.player_name}
                            </span>
                            <span className="font-armenian-sans text-xs font-medium flex-shrink-0" style={{ color: isMe ? '#F0D080' : 'rgba(240,208,128,0.55)' }}>
                              {row.score}
                            </span>
                          </li>
                        )
                      })}
                    </ol>
                  )}
                </div>

                {/* actions */}
                <div className="px-6 pb-6 flex flex-col gap-2.5" style={{ borderTop: '1px solid rgba(201,146,42,0.12)', paddingTop: '1rem' }}>
                  <button
                    onClick={handlePlayAgain}
                    className="w-full rounded-xl py-3 font-armenian-sans text-sm font-medium transition-all duration-200"
                    style={{ backgroundColor: '#C9922A', color: '#0d0805', letterSpacing: '0.06em' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F0D080'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#C9922A'}
                  >
                    Նորից Խաղալ
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="w-full rounded-xl py-2.5 font-armenian-sans text-xs transition-all duration-200"
                    style={{ color: 'rgba(240,208,128,0.45)', border: '1px solid rgba(201,146,42,0.15)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'rgba(240,208,128,0.8)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(240,208,128,0.45)'}
                  >
                    ← Վերադառնալ
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
