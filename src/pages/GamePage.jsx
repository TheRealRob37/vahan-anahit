import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import WeddingGame from '../components/WeddingGame'
import { supabase } from '../lib/supabase'
import { audio as bgMusic } from '../components/MusicPlayer'

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

// Keep only each player's best score (data must be pre-sorted by score DESC)
function bestPerPlayer(data, limit = Infinity) {
  const seen = new Set()
  const out = []
  for (const row of data) {
    if (seen.has(row.player_name)) continue
    seen.add(row.player_name)
    out.push(row)
    if (out.length >= limit) break
  }
  return out
}

export default function GamePage() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState('name') // 'name' | 'playing' | 'gameover'
  const [playerName, setPlayerName] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [finalScore, setFinalScore] = useState(0)
  const [leaderboard, setLeaderboard] = useState([])
  const [saving, setSaving] = useState(false)
  const [myRank, setMyRank] = useState(null)
  const [isRecord, setIsRecord] = useState(false)
  const inputRef = useRef(null)

  // Pause music while on game page, resume when leaving
  useEffect(() => {
    const wasPlaying = !bgMusic.paused
    bgMusic.pause()
    return () => { if (wasPlaying) bgMusic.play().catch(() => {}) }
  }, [])

  useEffect(() => {
    if (phase === 'name') setTimeout(() => inputRef.current?.focus(), 300)
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
      // check existing top score before inserting
      const { data: topRow } = await supabase
        .from('game_scores')
        .select('score')
        .order('score', { ascending: false })
        .limit(1)
        .single()
      const prevBest = topRow?.score ?? 0
      await supabase.from('game_scores').insert({ player_name: playerName, score })
      setIsRecord(score > prevBest)
      const { data } = await supabase
        .from('game_scores')
        .select('player_name, score, created_at')
        .order('score', { ascending: false })
        .limit(200)
      setLeaderboard(bestPerPlayer(data || [], 10))
      // rank = number of unique players with a better best score
      const top = bestPerPlayer(data || [])
      const rank = top.findIndex(r => r.player_name === playerName)
      setMyRank(rank >= 0 ? rank + 1 : top.length + 1)
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
    setIsRecord(false)
  }

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ backgroundColor: '#0d0805', height: '100dvh' }}
    >
      {/* back button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 z-50 font-armenian-sans text-xs transition-colors"
        style={{ color: 'rgba(253,230,138,0.35)', letterSpacing: '0.05em' }}
        onMouseEnter={e => e.currentTarget.style.color = 'rgba(253,230,138,0.8)'}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(253,230,138,0.35)'}
      >
        ← Վերադառնալ
      </button>

      {/* game canvas */}
      {phase === 'playing' && (
        <div className="absolute inset-0 z-10">
          <WeddingGame onGameOver={handleGameOver} />
        </div>
      )}

      {/* keyboard hint — desktop only */}
      {phase === 'playing' && (
        <p className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 hidden sm:block font-armenian-sans text-xs pointer-events-none"
           style={{ color: 'rgba(253,230,138,0.2)' }}>
          ← → կամ A D
        </p>
      )}

      {/* ── NAME ENTRY ── */}
      <AnimatePresence>
        {phase === 'name' && (
          <motion.div
            key="name"
            className="absolute inset-0 z-30 flex flex-col items-center justify-center px-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.35 }}
          >
            {/* stars */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {Array.from({ length: 40 }).map((_, i) => (
                <div key={i} className="absolute rounded-full" style={{
                  width: Math.random() * 2 + 1,
                  height: Math.random() * 2 + 1,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  backgroundColor: Math.random() > 0.6 ? '#F0D080' : '#fff',
                  opacity: Math.random() * 0.5 + 0.1,
                }} />
              ))}
            </div>

            <motion.div
              className="relative w-full max-w-xs"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.12, duration: 0.45 }}
            >
              <div className="rounded-2xl px-6 py-8 text-center" style={{
                backgroundColor: 'rgba(17,10,4,0.97)',
                border: '1px solid rgba(201,146,42,0.35)',
                boxShadow: '0 0 60px rgba(201,146,42,0.1)',
              }}>
                {/* ring icon */}
                <div className="mx-auto mb-4 w-12 h-12">
                  <svg viewBox="0 0 56 56" fill="none" className="w-full h-full">
                    <circle cx="28" cy="28" r="24" stroke="#C9922A" strokeWidth="3" fill="none"/>
                    <circle cx="28" cy="28" r="14" stroke="#C9922A" strokeWidth="2" fill="#0d0805"/>
                    <path d="M14 20 Q28 10 42 20" stroke="#F0D080" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7"/>
                  </svg>
                </div>

                <h1 className="font-armenian-serif text-xl font-light mb-1" style={{ color: '#F0D080' }}>
                  Բռնիր Մատանիները
                </h1>
                <p className="font-armenian-sans text-xs mb-6" style={{ color: 'rgba(240,208,128,0.35)', letterSpacing: '0.08em' }}>
                  Վահան & Անահիտ · 2026
                </p>

                <form onSubmit={handleStart} className="flex flex-col gap-3">
                  <div className="text-left">
                    <label className="font-armenian-sans text-xs block mb-1.5" style={{ color: 'rgba(253,230,138,0.45)', letterSpacing: '0.06em' }}>
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
                        fontSize: 16, // prevent iOS zoom
                      }}
                      onFocus={e => e.target.style.borderColor = 'rgba(201,146,42,0.65)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(201,146,42,0.25)'}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!inputValue.trim()}
                    className="w-full rounded-xl py-3.5 font-armenian-sans text-sm font-medium transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#C9922A', color: '#0d0805', letterSpacing: '0.06em' }}
                    onMouseEnter={e => { if (inputValue.trim()) e.currentTarget.style.backgroundColor = '#F0D080' }}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#C9922A'}
                  >
                    Սկսել Խաղը ◈
                  </button>
                </form>

                {/* ring type legend */}
                <div className="mt-5 grid grid-cols-3 gap-1 text-xs" style={{ color: 'rgba(240,208,128,0.3)' }}>
                  <div className="flex flex-col items-center gap-0.5">
                    <span style={{ color: '#C9922A' }}>◉</span>
                    <span>Ոսկի</span>
                    <span>10 pts</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <span style={{ color: '#C0C0C0' }}>◉</span>
                    <span>Արծաթ</span>
                    <span>15 pts</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <span style={{ color: '#88ccff' }}>◉</span>
                    <span>Ադամ.</span>
                    <span>30 pts</span>
                  </div>
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
            style={{ backgroundColor: 'rgba(13,8,5,0.9)', backdropFilter: 'blur(6px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <motion.div
              className="w-full max-w-xs"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.08, duration: 0.4 }}
            >
              <div className="rounded-2xl overflow-hidden" style={{
                backgroundColor: 'rgba(17,10,4,0.99)',
                border: '1px solid rgba(201,146,42,0.35)',
                boxShadow: '0 0 80px rgba(201,146,42,0.12)',
              }}>
                {/* score header */}
                <div className="px-6 pt-6 pb-4 text-center" style={{ borderBottom: '1px solid rgba(201,146,42,0.1)' }}>
                  <p className="font-armenian-sans text-xs mb-1" style={{ color: 'rgba(240,208,128,0.4)', letterSpacing: '0.1em' }}>
                    Խաղն ավարտվեց
                  </p>
                  <p className="font-armenian-serif text-5xl font-light" style={{ color: '#F0D080' }}>
                    {finalScore}
                  </p>
                  <p className="font-armenian-sans text-xs mt-0.5" style={{ color: 'rgba(240,208,128,0.3)' }}>
                    միավոր · {playerName}
                  </p>
                  {playerName.trim().toLowerCase() === 'aida' && (
                    <p className="font-armenian-sans text-xs mt-2 italic" style={{ color: 'rgba(220,136,136,0.85)' }}>
                      Աիդա, դու հարսնաքուր ես, հերիքա խաղաս 😄
                    </p>
                  )}
                  {myRank && !saving && (
                    <p className="font-armenian-sans text-xs mt-2 font-medium" style={{ color: myRank <= 3 ? '#F0D080' : 'rgba(240,208,128,0.45)' }}>
                      {isRecord ? '🏆 Ռեկորդ!' : myRank <= 3 ? `✦ ${myRank}-րդ տեղ` : `${myRank}-րդ տեղ`}
                    </p>
                  )}
                </div>

                {/* leaderboard */}
                <div className="px-5 py-3">
                  <p className="font-armenian-sans text-xs mb-2" style={{ color: 'rgba(240,208,128,0.35)', letterSpacing: '0.08em' }}>
                    Լավագույն 10
                  </p>

                  {saving ? (
                    <div className="flex justify-center py-5">
                      <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(201,146,42,0.3)', borderTopColor: '#C9922A' }} />
                    </div>
                  ) : (
                    <ol className="space-y-1">
                      {leaderboard.map((row, i) => {
                        const isMe = row.player_name === playerName && row.score === finalScore
                        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`
                        return (
                          <li key={i} className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5" style={{
                            backgroundColor: isMe ? 'rgba(201,146,42,0.1)' : 'transparent',
                            border: isMe ? '1px solid rgba(201,146,42,0.22)' : '1px solid transparent',
                          }}>
                            <span className="text-sm w-5 text-center flex-shrink-0" style={{ color: i < 3 ? '#F0D080' : 'rgba(240,208,128,0.3)' }}>
                              {medal}
                            </span>
                            <span className="font-armenian-sans text-xs flex-1 truncate" style={{ color: isMe ? '#f5efe3' : 'rgba(245,239,227,0.55)' }}>
                              {row.player_name}
                            </span>
                            <span className="font-armenian-sans text-xs font-semibold flex-shrink-0" style={{ color: isMe ? '#F0D080' : 'rgba(240,208,128,0.45)' }}>
                              {row.score}
                            </span>
                          </li>
                        )
                      })}
                    </ol>
                  )}
                </div>

                {/* actions */}
                <div className="px-5 pb-5 flex flex-col gap-2" style={{ borderTop: '1px solid rgba(201,146,42,0.1)', paddingTop: '0.875rem' }}>
                  <button
                    onClick={handlePlayAgain}
                    className="w-full rounded-xl py-3.5 font-armenian-sans text-sm font-medium transition-all duration-200"
                    style={{ backgroundColor: '#C9922A', color: '#0d0805', letterSpacing: '0.05em' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F0D080'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#C9922A'}
                  >
                    Նորից Խաղալ
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="w-full rounded-xl py-2.5 font-armenian-sans text-xs transition-all duration-200"
                    style={{ color: 'rgba(240,208,128,0.4)', border: '1px solid rgba(201,146,42,0.12)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'rgba(240,208,128,0.8)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(240,208,128,0.4)'}
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
