import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import FadeIn from '../components/FadeIn'
import FooterSection from '../components/FooterSection'
import SearchInput from '../components/SearchInput'
import SectionHeader from '../components/SectionHeader'
import SideSelector from '../components/SideSelector'
import TableList from '../components/TableList'
import { audio as bgMusic } from '../components/MusicPlayer'
import { BRIDE, COUPLE, GROOM } from '../config/wedding'
import { seatingData } from '../data/seating'

function normalizeSide(value) {
  if (value === 'groom' || value === 'bride') {
    return value
  }

  return null
}

function matchesGuestName(guest, query) {
  return guest.toLowerCase().includes(query.toLowerCase())
}

export default function SeatingPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedSide, setSelectedSide] = useState(() => normalizeSide(searchParams.get('side')))
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef(null)

  const sideParam = normalizeSide(searchParams.get('side'))
  const sideOptions = [
    {
      value: 'groom',
      label: 'Փեսայի կողմ',
      description: `${GROOM}ի ընտանիք և ընկերներ`,
      accentClass: 'from-amber-100/80 via-white to-[#faf4ea]',
    },
    {
      value: 'bride',
      label: 'Հարսի կողմ',
      description: `${BRIDE}ի ընտանիք և ընկերներ`,
      accentClass: 'from-rose-100/70 via-white to-[#fdf3f4]',
    },
  ]

  useEffect(() => {
    const wasPlaying = !bgMusic.paused
    bgMusic.pause()

    return () => {
      if (wasPlaying) bgMusic.play().catch(() => {})
    }
  }, [])

  useEffect(() => {
    setSelectedSide((currentSide) => (
      currentSide === sideParam ? currentSide : sideParam
    ))
  }, [sideParam])

  useEffect(() => {
    if (sideParam === selectedSide) return

    const nextParams = new URLSearchParams(searchParams)

    if (selectedSide) {
      nextParams.set('side', selectedSide)
    } else {
      nextParams.delete('side')
    }

    setSearchParams(nextParams, { replace: true })
  }, [searchParams, selectedSide, setSearchParams, sideParam])

  useEffect(() => {
    if (selectedSide) {
      searchInputRef.current?.focus()
    }
  }, [selectedSide])

  const selectedOption = sideOptions.find((option) => option.value === selectedSide) ?? null
  const filteredTables = selectedSide
    ? seatingData[selectedSide]
      .map((table) => ({
        ...table,
        guests: searchQuery.trim()
          ? table.guests.filter((guest) => matchesGuestName(guest, searchQuery.trim().toLowerCase()))
          : table.guests,
      }))
      .filter((table) => table.guests.length > 0)
    : []

  return (
    <div className="min-h-screen overflow-hidden" style={{ backgroundColor: '#f5f0ea' }}>
      <div className="relative px-6 py-12 sm:py-16">
        <div
          className="absolute inset-x-0 top-0 h-[360px] opacity-70"
          style={{
            background:
              'radial-gradient(circle at top, rgba(245, 158, 11, 0.16), transparent 60%), radial-gradient(circle at 85% 20%, rgba(244, 114, 182, 0.12), transparent 28%)',
          }}
        />

        <div className="relative mx-auto max-w-5xl">
          <FadeIn className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-stone-300/80 bg-white/70 px-4 py-2 font-armenian-sans text-xs uppercase tracking-[0.18em] text-stone-600 transition hover:border-amber-700 hover:text-amber-900"
            >
              <span aria-hidden="true">&larr;</span>
              Վերադառնալ հրավերին
            </Link>
          </FadeIn>

          <FadeIn delay={0.05}>
            <section className="rounded-[2rem] border border-white/70 bg-white/55 px-5 py-8 shadow-[0_24px_80px_rgba(74,44,26,0.08)] backdrop-blur-sm sm:px-8 sm:py-10">
              <SectionHeader label="Տեղաբաշխում" title="Սեղանների դասավորություն" />

              <p className="mx-auto max-w-2xl text-center font-armenian-sans text-sm leading-relaxed text-stone-500">
                Ընտրեք ձեր կողմը կամ որոնեք անունով, որպեսզի արագ գտնեք ճիշտ սեղանը {COUPLE}-ի հարսանեկան երեկոյի համար։
              </p>

              <div className="mt-8 grid gap-5 lg:grid-cols-[1.1fr,0.9fr]">
                <div className="rounded-[1.75rem] border border-amber-100/70 bg-[#faf7f4]/90 p-4 sm:p-5">
                  <p className="mb-3 font-armenian-sans text-[0.65rem] uppercase tracking-[0.24em] text-amber-700/60">
                    Ընտրեք կողմը
                  </p>
                  <SideSelector
                    options={sideOptions}
                    selectedSide={selectedSide}
                    onSelect={setSelectedSide}
                  />
                </div>

                <div className="rounded-[1.75rem] border border-stone-200/70 bg-white/80 p-4 sm:p-5">
                  <p className="mb-3 font-armenian-sans text-[0.65rem] uppercase tracking-[0.24em] text-amber-700/60">
                    Գտնել հյուրին
                  </p>
                  <SearchInput
                    value={searchQuery}
                    onChange={setSearchQuery}
                    disabled={!selectedSide}
                    inputRef={searchInputRef}
                  />
                </div>
              </div>

              <div className="mt-8">
                {selectedOption && (
                  <div className="mb-5">
                    <h3 className="font-armenian-serif text-3xl text-stone-800">
                      {selectedOption.label}
                    </h3>
                  </div>
                )}

                <TableList
                  tables={filteredTables}
                  query={searchQuery}
                  selectedSideLabel={selectedOption?.label}
                />
              </div>
            </section>
          </FadeIn>
        </div>
      </div>

      <FooterSection minimal />
    </div>
  )
}
