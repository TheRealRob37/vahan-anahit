// Admin Dashboard Component
// Password-protected page for managing wedding RSVP submissions and guest data
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

import { COUPLE, WEDDING_DATE_SHORT } from '../config/wedding'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin'

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

function LoginScreen({ onLogin }) {
  const [pw, setPw] = useState('')
  const [err, setErr] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    if (pw === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_auth', '1')
      onLogin()
    } else {
      setErr(true)
      setPw('')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f5f0ea' }}>
      <form onSubmit={submit} className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-sm space-y-5">
        <h1 className="text-2xl font-semibold text-stone-800 text-center">Ադմին</h1>
        <p className="text-sm text-stone-500 text-center">{COUPLE} · {WEDDING_DATE_SHORT}</p>
        <input
          type="password"
          value={pw}
          onChange={e => { setPw(e.target.value); setErr(false) }}
          placeholder="Գաղտնաբառ"
          className={`w-full px-4 py-3 border rounded-xl text-sm outline-none transition ${err ? 'border-red-400 bg-red-50' : 'border-stone-200 focus:border-amber-700'}`}
          autoFocus
        />
        {err && <p className="text-red-500 text-xs text-center">Սխալ գաղտնաբառ</p>}
        <button
          type="submit"
          className="w-full py-3 bg-amber-800 hover:bg-amber-900 text-white rounded-full text-sm font-medium transition"
        >
          Մուտք
        </button>
      </form>
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-stone-100 text-center">
      <div className={`text-3xl font-bold mb-1 ${color}`}>{value}</div>
      <div className="text-xs text-stone-500 uppercase tracking-wider">{label}</div>
    </div>
  )
}

function EditModal({ row, onSave, onClose }) {
  const isNew = !row.id
  const [form, setForm] = useState({
    name1: row.name1 || '',
    surname1: row.surname1 || '',
    name2: row.name2 || '',
    surname2: row.surname2 || '',
    attending: row.attending || 'yes',
    host: row.host || 'vahan',
    guests: row.guests ?? 1,
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState(null)

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setErr(null)
    const payload = {
      name1: form.name1.trim(),
      surname1: form.surname1.trim(),
      name2: form.name2.trim() || null,
      surname2: form.surname2.trim() || null,
      attending: form.attending,
      host: form.host,
      guests: Number(form.guests),
    }
    if (isNew) {
      const { data, error } = await supabase.from('rsvp_responses').insert(payload).select().single()
      if (error) { setErr(error.message); setSaving(false); return }
      onSave(data)
    } else {
      const { error } = await supabase.from('rsvp_responses').update(payload).eq('id', row.id)
      if (error) { setErr(error.message); setSaving(false); return }
      onSave({ ...row, ...payload })
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-7">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold text-stone-800">{isNew ? 'Ավելացնել հյուր' : 'Խմբագրել հյուրին'}</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition text-xl leading-none">&times;</button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-stone-500 mb-1 block">Անուն 1 *</label>
              <input required value={form.name1} onChange={e => set('name1', e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm outline-none focus:border-amber-700 transition" />
            </div>
            <div>
              <label className="text-xs text-stone-500 mb-1 block">Ազգանուն 1 *</label>
              <input required value={form.surname1} onChange={e => set('surname1', e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm outline-none focus:border-amber-700 transition" />
            </div>
            {Number(form.guests) > 1 && (
              <>
                <div>
                  <label className="text-xs text-stone-500 mb-1 block">Անուն 2</label>
                  <input value={form.name2} onChange={e => set('name2', e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm outline-none focus:border-amber-700 transition" />
                </div>
                <div>
                  <label className="text-xs text-stone-500 mb-1 block">Ազգանուն 2</label>
                  <input value={form.surname2} onChange={e => set('surname2', e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm outline-none focus:border-amber-700 transition" />
                </div>
              </>
            )}
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-stone-500 mb-1 block">Կգա՞</label>
              <select value={form.attending} onChange={e => set('attending', e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm outline-none focus:border-amber-700 transition bg-white">
                <option value="yes">Այո</option>
                <option value="no">Ոչ</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-stone-500 mb-1 block">Կողմ</label>
              <select value={form.host} onChange={e => set('host', e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm outline-none focus:border-amber-700 transition bg-white">
                <option value="vahan">Փեսայի</option>
                <option value="anahit">Հարսի</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-stone-500 mb-1 block">Հյուրեր</label>
              <input type="number" min="1" max="10" value={form.guests} onChange={e => set('guests', e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm outline-none focus:border-amber-700 transition" />
            </div>
          </div>
          {err && <p className="text-red-500 text-xs">{err}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-stone-200 rounded-full text-sm text-stone-600 hover:border-stone-400 transition">
              Չեղարկել
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 bg-amber-800 hover:bg-amber-900 text-white rounded-full text-sm font-medium transition disabled:opacity-60">
              {saving ? 'Պահպանվում է...' : isNew ? 'Ավելացնել' : 'Պահպանել'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function AdminDashboard() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [sideFilter, setSideFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [editRow, setEditRow] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [deleteError, setDeleteError] = useState(null)
  const [topPlayers, setTopPlayers] = useState([])

  const fetchRSVPs = useCallback(async () => {
    setLoading(true)
    const [{ data: rsvp }, { data: scores }] = await Promise.all([
      supabase.from('rsvp_responses').select('*').order('created_at', { ascending: false }),
      supabase.from('game_scores').select('player_name, score, created_at').order('score', { ascending: false }).limit(500),
    ])
    if (rsvp) setRows(rsvp)
    if (scores) setTopPlayers(bestPerPlayer(scores, 20))
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchRSVPs()
  }, [fetchRSVPs])

  const deleteRow = async (id) => {
    const { error } = await supabase.from('rsvp_responses').delete().eq('id', id)
    if (error) {
      setDeleteError('Ջնջումը ձախողվեց: ' + error.message)
      setConfirmDeleteId(null)
      return
    }
    setDeleteError(null)
    setRows(prev => prev.filter(r => r.id !== id))
    setConfirmDeleteId(null)
  }

  const saveEdit = (updated) => {
    setRows(prev => {
      const exists = prev.some(r => r.id === updated.id)
      return exists ? prev.map(r => r.id === updated.id ? updated : r) : [updated, ...prev]
    })
  }

  const attending    = rows.filter(r => r.attending === 'yes')
  const notAttending = rows.filter(r => r.attending === 'no')
  const attendingCount    = attending.reduce((sum, r) => sum + (r.guests ?? 1), 0)
  const notAttendingCount = notAttending.reduce((sum, r) => sum + (r.guests ?? 1), 0)



  const filtered = rows.filter(r => {
    if (filter !== 'all' && r.attending !== filter) return false
    if (sideFilter !== 'all' && r.host !== sideFilter) return false
    if (search) {
      const q = search.toLowerCase()
      const name = `${r.name1} ${r.surname1} ${r.name2 || ''} ${r.surname2 || ''}`.toLowerCase()
      if (!name.includes(q)) return false
    }
    return true
  })

  function formatDate(iso) {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('hy-AM', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  function guestNames(r) {
    const names = [`${r.name1} ${r.surname1}`]
    if (r.name2 && r.surname2) names.push(`${r.name2} ${r.surname2}`)
    return names
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f5f0ea' }}>
        <div className="text-stone-400 text-sm animate-pulse">Բեռնվում է...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f0ea' }}>
      {/* Header */}
      <div className="bg-white border-b border-stone-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="/" className="text-stone-400 hover:text-amber-800 transition" title="Վերադառնալ">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M11 4L6 9l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
          <div>
            <h1 className="text-lg font-semibold text-stone-800">Հրավերք</h1>
            <p className="text-xs text-stone-400">{COUPLE} · {WEDDING_DATE_SHORT}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setEditRow({})}
            className="text-xs bg-amber-800 text-white rounded-full px-4 py-1.5 hover:bg-amber-900 transition"
          >
            + Ավելացնել
          </button>
          <button
            onClick={fetchRSVPs}
            className="text-xs text-amber-800 border border-amber-800/30 rounded-full px-4 py-1.5 hover:bg-amber-800 hover:text-white transition"
          >
            Թարմացնել
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard label="Կգան" value={attendingCount} color="text-green-600" />
          <StatCard label="Չեն Գա" value={notAttendingCount} color="text-red-500" />
        </div>

        {/* Top Players */}
        {topPlayers.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-stone-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-stone-700">◈ Լավագույն Խաղացողներ</h2>
              <span className="text-xs text-stone-400">{topPlayers.length} արդյունք</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100 bg-stone-50">
                    <th className="text-left px-5 py-2.5 text-xs font-semibold text-stone-500 uppercase tracking-wider">#</th>
                    <th className="text-left px-5 py-2.5 text-xs font-semibold text-stone-500 uppercase tracking-wider">Անուն</th>
                    <th className="text-left px-5 py-2.5 text-xs font-semibold text-stone-500 uppercase tracking-wider">Միավոր</th>
                    <th className="text-left px-5 py-2.5 text-xs font-semibold text-stone-500 uppercase tracking-wider">Ամսաթիվ</th>
                  </tr>
                </thead>
                <tbody>
                  {topPlayers.map((p, i) => (
                    <tr key={i} className="border-b border-stone-50 hover:bg-amber-50/40 transition">
                      <td className="px-5 py-3 text-xs font-medium" style={{ color: i === 0 ? '#b45309' : i === 1 ? '#78716c' : i === 2 ? '#92400e' : '#a8a29e' }}>
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                      </td>
                      <td className="px-5 py-3 font-medium text-stone-800">{p.player_name}</td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-100">
                          {p.score}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-stone-400 text-xs whitespace-nowrap">{formatDate(p.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-stone-100 flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="Որոնել անունով..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] px-4 py-2 border border-stone-200 rounded-full text-sm outline-none focus:border-amber-700 transition"
          />
          <div className="flex gap-2">
            {[
              { val: 'all', label: 'Բոլորը' },
              { val: 'yes', label: '✓ Կգան' },
              { val: 'no',  label: '✗ Չեն Գա' },
            ].map(f => (
              <button key={f.val} onClick={() => setFilter(f.val)}
                className={`px-4 py-1.5 rounded-full text-xs border transition ${filter === f.val ? 'bg-amber-800 text-white border-amber-800' : 'border-stone-300 text-stone-600 hover:border-amber-700'}`}>
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {[
              { val: 'all',    label: 'Երկու Կողմ' },
              { val: 'anahit', label: 'Հարսի Կողմ' },
              { val: 'vahan',  label: 'Փեսայի Կողմ' },
            ].map(f => (
              <button key={f.val} onClick={() => setSideFilter(f.val)}
                className={`px-4 py-1.5 rounded-full text-xs border transition ${sideFilter === f.val ? 'bg-stone-700 text-white border-stone-700' : 'border-stone-300 text-stone-600 hover:border-stone-500'}`}>
                {f.label}
              </button>
            ))}
          </div>
          <span className="text-xs text-stone-400 ml-auto">{filtered.length} արդյունք</span>
        </div>

        {deleteError && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">
            {deleteError}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">#</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Հյուրեր</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Կգա՞</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Կողմ</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Քանակ</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Ուղարկվել է</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-stone-400 text-sm">
                      Պատասխաններ չկան
                    </td>
                  </tr>
                ) : (
                  filtered.map((r, i) => (
                    <tr key={r.id} className={`border-b border-stone-50 transition ${confirmDeleteId === r.id ? 'bg-red-50' : 'hover:bg-amber-50/40'}`}>
                      <td className="px-5 py-4 text-stone-400 text-xs">{i + 1}</td>
                      <td className="px-5 py-4">
                        {guestNames(r).map((name, ni) => (
                          <div key={ni} className={ni === 0 ? 'font-medium text-stone-800' : 'text-stone-500 text-xs mt-0.5'}>
                            {name}
                          </div>
                        ))}
                      </td>
                      <td className="px-5 py-4">
                        {r.attending === 'yes' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                            ✓ Այո
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-100">
                            ✗ Ոչ
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${r.host === 'anahit' ? 'bg-pink-50 text-pink-700 border border-pink-100' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
                          {r.host === 'anahit' ? '💐 Հարսի' : '🤵 Փեսայի'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-stone-600">{r.guests}</td>
                      <td className="px-5 py-4 text-stone-400 text-xs whitespace-nowrap">{formatDate(r.created_at)}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {confirmDeleteId === r.id ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-red-600 font-medium">Ջնջե՞լ</span>
                            <button onClick={() => deleteRow(r.id)}
                              className="text-xs px-2.5 py-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition">
                              Այո
                            </button>
                            <button onClick={() => setConfirmDeleteId(null)}
                              className="text-xs px-2.5 py-1 border border-stone-300 text-stone-600 rounded-full hover:border-stone-500 transition">
                              Ոչ
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button onClick={() => setEditRow(r)}
                              className="p-1.5 text-stone-400 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition"
                              title="Խմբագրել">
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M9.5 1.5l3 3L4 13H1v-3L9.5 1.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                              </svg>
                            </button>
                            <button onClick={() => setConfirmDeleteId(r.id)}
                              className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                              title="Ջնջել">
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M2 4h10M5 4V2.5h4V4M5.5 6.5v4M8.5 6.5v4M3 4l.7 7.5h6.6L11 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-stone-100 bg-stone-50 flex justify-end">
              <button
                onClick={() => exportCSV(filtered)}
                className="text-xs text-stone-600 hover:text-amber-800 transition"
              >
                ↓ Արտահանել CSV
              </button>
            </div>
          )}
        </div>
      </div>

      {editRow && (
        <EditModal row={editRow} onSave={saveEdit} onClose={() => setEditRow(null)} />
      )}
    </div>
  )
}

function exportCSV(rows) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const headers = ['Հյուր 1', 'Հյուր 2', 'Կողմ', 'Հյուրեր']
  const lines = rows.filter(r => r.attending === 'yes').map(r => [
    `${r.name1} ${r.surname1}`,
    r.name2 ? `${r.name2} ${r.surname2}` : '',
    r.host === 'anahit' ? 'Հարսի' : 'Փեսայի',
    r.guests,
  ].map(esc).join(','))
  const csv = [headers.map(esc).join(','), ...lines].join('\r\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'rsvp-vahan-anahit.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(sessionStorage.getItem('admin_auth') === '1')
  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />
  return <AdminDashboard />
}
