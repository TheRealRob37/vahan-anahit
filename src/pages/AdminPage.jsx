import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin'

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
        <p className="text-sm text-stone-500 text-center">Վահան & Անահիտ · 25.04.2026</p>
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

function AdminDashboard() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [sideFilter, setSideFilter] = useState('all')
  const [search, setSearch] = useState('')

  const fetchRSVPs = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('rsvp_responses')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setRows(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchRSVPs()
  }, [fetchRSVPs])

  const attending = rows.filter(r => r.attending === 'yes')
  const notAttending = rows.filter(r => r.attending === 'no')
  const totalGuests = attending.reduce((sum, r) => sum + (r.guests || 0), 0)
  const brideGuests = attending.filter(r => r.host === 'anahit').reduce((sum, r) => sum + (r.guests || 0), 0)
  const groomGuests = attending.filter(r => r.host === 'vahan').reduce((sum, r) => sum + (r.guests || 0), 0)

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
    if (r.name2) names.push(`${r.name2} ${r.surname2}`)
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
        <div>
          <h1 className="text-lg font-semibold text-stone-800">Հրավերք</h1>
          <p className="text-xs text-stone-400">Վահան & Անահիտ · 25.04.2026</p>
        </div>
        <button
          onClick={fetchRSVPs}
          className="text-xs text-amber-800 border border-amber-800/30 rounded-full px-4 py-1.5 hover:bg-amber-800 hover:text-white transition"
        >
          Թարմացնել
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard label="Ընդամենը" value={rows.length} color="text-stone-800" />
          <StatCard label="Կգան" value={attending.length} color="text-green-600" />
          <StatCard label="Չեն Գա" value={notAttending.length} color="text-red-500" />
          <StatCard label="Հյուրեր" value={totalGuests} color="text-amber-700" />
          <div className="bg-white rounded-xl p-5 shadow-sm border border-stone-100 col-span-2 md:col-span-1">
            <div className="text-xs text-stone-500 uppercase tracking-wider mb-2">Ըստ Կողմի</div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-600">Հարսի</span>
              <span className="font-semibold text-amber-700">{brideGuests}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-stone-600">Փեսայի</span>
              <span className="font-semibold text-amber-700">{groomGuests}</span>
            </div>
          </div>
        </div>

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
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-stone-400 text-sm">
                      Պատասխաններ չկան
                    </td>
                  </tr>
                ) : (
                  filtered.map((r, i) => (
                    <tr key={r.id} className="border-b border-stone-50 hover:bg-amber-50/40 transition">
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
    </div>
  )
}

function exportCSV(rows) {
  const headers = ['Անուն 1', 'Ազգանուն 1', 'Անուն 2', 'Ազգանուն 2', 'Կգա՞', 'Կողմ', 'Հյուրեր', 'Ուղարկվել է']
  const lines = rows.map(r => [
    r.name1, r.surname1, r.name2 || '', r.surname2 || '',
    r.attending, r.host, r.guests,
    new Date(r.created_at).toLocaleString()
  ].map(v => `"${v}"`).join(','))
  const csv = [headers.join(','), ...lines].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
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
