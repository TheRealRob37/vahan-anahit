import { AnimatePresence, motion } from 'framer-motion'

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function highlightGuestName(guest, query) {
  const trimmedQuery = query.trim()

  if (!trimmedQuery) return guest

  const matcher = new RegExp(`(${escapeRegExp(trimmedQuery)})`, 'ig')
  const parts = guest.split(matcher)

  return parts.map((part, index) => {
    if (part.toLowerCase() !== trimmedQuery.toLowerCase()) {
      return <span key={`${guest}-${index}`}>{part}</span>
    }

    return (
      <mark
        key={`${guest}-${index}`}
        className="rounded-md bg-amber-200/70 px-1 py-0.5 text-amber-950"
      >
        {part}
      </mark>
    )
  })
}

export default function TableList({ tables, query, selectedSideLabel }) {
  if (!selectedSideLabel) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[1.75rem] border border-dashed border-stone-300 bg-white/70 px-6 py-12 text-center shadow-sm"
      >
        <p className="font-armenian-serif text-2xl text-stone-800">Սկզբում ընտրեք կողմը</p>
        <p className="mx-auto mt-3 max-w-md font-armenian-sans text-sm leading-relaxed text-stone-500">
          Ընտրեք հարսի կամ փեսայի կողմը, որպեսզի տեսնեք սեղանները և որոնեք հյուրին։
        </p>
      </motion.div>
    )
  }

  if (!tables.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[1.75rem] border border-stone-200 bg-white/75 px-6 py-12 text-center shadow-sm"
      >
        <p className="font-armenian-serif text-2xl text-stone-800">Հյուր չի գտնվել</p>
        <p className="mx-auto mt-3 max-w-md font-armenian-sans text-sm leading-relaxed text-stone-500">
          "{query.trim()}" որոնմամբ {selectedSideLabel} բաժնում հյուր չի գտնվել։
        </p>
      </motion.div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <AnimatePresence mode="popLayout">
        {tables.map((table, index) => {
          const guestLabel = query.trim()
            ? `${table.guests.length} համընկնում`
            : `${table.guests.length} հյուր`

          return (
            <motion.article
              key={table.table}
              layout
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 18 }}
              transition={{ duration: 0.35, delay: index * 0.04 }}
              className="rounded-[1.75rem] border border-white/70 bg-gradient-to-br from-white/90 via-white/80 to-[#faf7f4] p-5 shadow-[0_18px_50px_rgba(74,44,26,0.08)]"
            >
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <p className="font-armenian-sans text-[0.65rem] uppercase tracking-[0.24em] text-amber-700/60">
                    Սեղան
                  </p>
                  <h3 className="mt-2 font-armenian-serif text-3xl text-stone-800">
                    {table.table}
                  </h3>
                </div>

                <span className="inline-flex rounded-full border border-amber-200/80 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900">
                  {guestLabel}
                </span>
              </div>

              <ul className="space-y-2.5">
                {table.guests.map((guest) => (
                  <li
                    key={`${table.table}-${guest}`}
                    className="rounded-2xl border border-stone-100 bg-white/80 px-3.5 py-3 text-sm text-stone-700 shadow-sm"
                  >
                    {highlightGuestName(guest, query)}
                  </li>
                ))}
              </ul>
            </motion.article>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
