import React, { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import HeroSection from './components/HeroSection'
import InvitationTextSection from './components/InvitationTextSection'
import CalendarSection from './components/CalendarSection'
import GuestPresenceSection from './components/GuestPresenceSection'
import ProgramSection from './components/ProgramSection'
import DressCodeAndRulesSection from './components/DressCodeAndRulesSection'
import DateRecapSection from './components/DateRecapSection'
import RSVPSection from './components/RSVPSection'
import ThankYouSection from './components/ThankYouSection'
import FooterSection from './components/FooterSection'

// ─── Shared UI ────────────────────────────────────────────────────────────────

function FadeIn({ children, delay = 0, className = '', direction = 'up' }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })
  const initial =
    direction === 'up'   ? { opacity: 0, y: 40 } :
    direction === 'down' ? { opacity: 0, y: -40 } :
    { opacity: 0 }
  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={isInView ? { opacity: 1, y: 0 } : initial}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function OrnamentDivider() {
  return (
    <div className="flex items-center gap-3 my-6 justify-center">
      <div className="h-px w-16 bg-amber-800/30" />
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2C10 2 12 6 16 6C12 6 16 10 16 10C16 10 12 10 10 14C8 10 4 10 4 10C4 10 8 6 4 6C8 6 10 2 10 2Z" fill="#8b6f4e" opacity="0.6"/>
      </svg>
      <div className="h-px w-16 bg-amber-800/30" />
    </div>
  )
}

function SectionHeader({ label, title, center = true, titleColor }) {
  return (
    <>
      <p className={`font-armenian-sans text-amber-700/60 text-xs tracking-[0.25em] uppercase mb-1 ${center ? 'text-center' : ''}`}>
        {label}
      </p>
      <h2
        className={`font-armenian-serif text-3xl mb-2 ${center ? 'text-center' : ''}`}
        style={{ color: titleColor || '#1c1917' }}
      >
        {title}
      </h2>
      <OrnamentDivider />
    </>
  )
}

function MapLink({ url }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 font-armenian-sans text-xs text-amber-800 border border-amber-800/30 rounded-full px-3 py-1.5 hover:bg-amber-800 hover:text-white transition-colors duration-300"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
      Տեսնել քարտեզում
    </a>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col justify-end overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={`${import.meta.env.BASE_URL}background.jpg`}
          alt=""
          className="w-full h-full object-cover object-center"
          style={{ filter: 'brightness(0.45) saturate(0.8)' }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(30,18,10,0.85) 0%, rgba(30,18,10,0.3) 50%, rgba(30,18,10,0.1) 100%)' }} />
      </div>

      {/* Save the Date — mobile: large centered stacked */}
      <div className="md:hidden absolute inset-0 flex items-center justify-center z-10" style={{ paddingBottom: '30vh' }}>
        <div className="flex flex-col items-center leading-none">
          {['Save', 'the', 'Date'].map(word => (
            <span
              key={word}
              className="font-carolina text-amber-200/50 block"
              style={{ fontSize: 'clamp(5rem, 22vw, 11rem)', lineHeight: 1 }}
            >
              {word}
            </span>
          ))}
        </div>
      </div>

      {/* Save the Date — desktop: centered inline */}
      <div className="hidden md:flex absolute inset-0 items-center justify-center z-10" style={{ paddingBottom: '30vh' }}>
        <span className="font-carolina text-amber-200/50" style={{ fontSize: 'clamp(3rem, 6vw, 5.5rem)', lineHeight: 1 }}>
          Save the Date
        </span>
      </div>

      <div className="relative z-10 text-center px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1
            className="font-armenian-serif text-white leading-none mb-4"
            style={{ fontSize: 'clamp(3rem, 12vw, 7rem)', fontWeight: 300, letterSpacing: '-0.02em' }}
          >
            Վահան
          </h1>
          <div className="flex items-center gap-4 justify-center mb-4">
            <div className="h-px flex-1 max-w-[80px] bg-amber-200/30" />
            <span className="font-armenian-serif text-amber-200/80 text-3xl font-light">&</span>
            <div className="h-px flex-1 max-w-[80px] bg-amber-200/30" />
          </div>
          <h2
            className="font-armenian-serif text-white leading-none mb-8"
            style={{ fontSize: 'clamp(3rem, 12vw, 7rem)', fontWeight: 300, letterSpacing: '-0.02em' }}
          >
            Անահիտ
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center gap-px mb-8"
        >
          {['25', '04', '26'].map((value, i) => (
            <React.Fragment key={i}>
              {i > 0 && <div className="w-px bg-amber-200/20 mx-3" />}
              <div className="text-center px-3">
                <div className="font-armenian-serif text-white/90" style={{ fontSize: 'clamp(1.8rem, 7vw, 3.5rem)', fontWeight: 300 }}>
                  {value}
                </div>
              </div>
            </React.Fragment>
          ))}
        </motion.div>

      </div>
    </section>
  )
}


function CalendarSection() {
  const days = ['Երկ', 'Երք', 'Չոր', 'Հինգ', 'Ուրբ', 'Շաբ', 'Կիր']
  const startDay = 2 // April 1, 2026 is Wednesday
  const totalDays = 30
  const cells = []
  for (let i = 0; i < startDay; i++) cells.push(null)
  for (let d = 1; d <= totalDays; d++) cells.push(d)

  return (
    <section style={{ backgroundColor: '#faf7f4' }} className="px-6 py-14">
      <div className="max-w-md mx-auto">
        <FadeIn delay={0.15}>
          <div className="w-full max-w-xs mx-auto">
            <div className="grid grid-cols-7 mb-2">
              {days.map(d => (
                <div key={d} className="text-center text-xs font-armenian-sans text-amber-800/70 font-medium py-1">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-y-1">
              {cells.map((day, i) => (
                <div key={i} className="flex items-center justify-center h-8">
                  {day === 25 ? (
                    <div className="date-circle font-armenian-serif text-sm font-semibold text-amber-900">{day}</div>
                  ) : day ? (
                    <span className="font-armenian-sans text-sm text-stone-600">{day}</span>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

function ProgramSection() {
  const events = [
    {
      time: '15:00',
      title: 'Պսակադրություն',
      venue: 'Սուրբ Հռիփսիմե եկեղեցի, Էջմիածին',
      address: 'Վաղարշապատ, Հայաստան',
      mapsUrl: 'https://maps.google.com/?q=Saint+Hripsime+Church+Vagharshapat',
    },
    {
      time: '18:00',
      title: 'Հարսանեկան ընթրիք',
      venue: '«Արիա» ռեստորան',
      address: 'Երևան, Հայաստան',
      mapsUrl: 'https://maps.google.com/?q=Restaurant+Aria+Yerevan',
    },
  ]

  return (
    <section style={{ backgroundColor: '#f0ebe3' }} className="px-6 py-14">
      <div className="max-w-md mx-auto">
        <div className="space-y-8">
          {events.map((event, i) => (
            <FadeIn key={event.title} delay={0.1 * (i + 1)}>
              <p className="font-armenian-sans text-sm text-amber-700 font-medium tracking-wider mb-1">Ժամը {event.time}</p>
              <h4 className="font-armenian-serif text-2xl text-stone-800 leading-tight">{event.title}</h4>
              <p className="font-armenian-sans text-base text-stone-500 mt-1 mb-3">{event.venue}</p>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-amber-100 shadow-sm">
                <p className="font-armenian-sans text-sm text-stone-500 mb-2">{event.address}</p>
                <MapLink url={event.mapsUrl} />
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

function DateRecapSection() {
  return (
    <section style={{ backgroundColor: '#f0ebe3' }} className="px-6 pb-14">
      <div className="max-w-md mx-auto text-center">
        <FadeIn>
          <OrnamentDivider />
          <p className="font-armenian-sans text-stone-600 text-sm leading-relaxed">
            Երեկոն խոստանում է լինել լի ջերմությամբ,<br />
            գեղեցիկ երաժշտությամբ և տոնական տրամադրությամբ։<br />
            Քանի որ այն նախատեսված է մեծահասակների համար՝<br />
            ալկոհոլային հյուրասիրությամբ և ակտիվ երեկոյով,<br />
            սիրով խնդրում ենք այս հատուկ օրը կիսել մեզ հետ առանց երեխաների։
          </p>
        </FadeIn>
      </div>
    </section>
  )
}

function GuestPresenceSection() {
  return (
    <section style={{ backgroundColor: '#f0ebe3' }} className="px-6 py-10">
      <div className="max-w-md mx-auto text-center">
        <FadeIn>
          <p className="font-armenian-sans text-stone-600 text-sm leading-relaxed">
            Ձեր ներկայությունը մեզ համար<br />
            ամենաթանկ նվերն է,<br />
            որով այս օրը կդառնա առավել լուսավոր և հիշարժան։
          </p>
        </FadeIn>
      </div>
    </section>
  )
}

function DressCodeAndRulesSection() {
  const swatches = [
    { color: '#4a2c1a', label: 'Շոկոլադագույն' },
    { color: '#6e1a2a', label: 'Բորդո' },
    { color: '#1a1a1a', label: 'Սև' },
    { color: '#1a2a4a', label: 'Մուգ կապույտ' },
    { color: '#2d6e4e', label: 'Մուգ կանաչ' },
  ]

  return (
    <section style={{ backgroundColor: '#ede8df' }} className="px-6 py-14">
      <div className="max-w-md mx-auto text-center">
        <FadeIn>
          <SectionHeader label="Հագուստ" title="Դրես-կոդ" titleColor="#4a2c1a" />
          <p className="font-armenian-sans text-sm text-stone-600 leading-relaxed max-w-sm mx-auto">
            Հագուստի գույների ընտրությունը ցանկալի է և նախընտրելի են այս գույները՝
            շոկոլադագույն, բորդո, սև, մուգ կապույտ և մուգ կանաչ
          </p>
        </FadeIn>
        <FadeIn delay={0.15}>
          <div className="flex gap-2 justify-center flex-wrap mt-4">
            {swatches.map(s => (
              <div
                key={s.label}
                role="img"
                aria-label={s.label}
                title={s.label}
                className="w-10 h-10 rounded-full shadow-md border border-white/60"
                style={{ backgroundColor: s.color }}
              />
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

const inputCls = 'w-full py-3 px-4 bg-white/70 border border-stone-200 rounded-xl font-armenian-sans text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700/30 transition'

function RSVPSection() {
  const [attending, setAttending] = useState(null)
  const [host, setHost] = useState('anahit')
  const [guests, setGuests] = useState(2)
  const [formData, setFormData] = useState({ name1: '', surname1: '', name2: '', surname2: '' })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!attending) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attending, host, guests, ...formData }),
      })
      if (!res.ok) throw new Error('Submit failed')
      setSubmitted(true)
    } catch {
      setError('Տեղի ունեցավ սխալ։ Խնդրում ենք կրկին փորձել։')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section style={{ backgroundColor: '#faf7f4' }} className="px-6 py-14">
      <div className="max-w-md mx-auto">
        <FadeIn>
          <SectionHeader label="Հաստատում" title="Հաստատեք Ձեր մասնակցությունը" />
          <p className="font-armenian-sans text-sm text-stone-500 text-center mb-8 leading-relaxed">
            Խնդրում ենք մինչև  Ապրիլի 15-ը լրացնել՝ նշելով ձեր մասնակցությունը և հյուրերի քանակը։<br />
          </p>
        </FadeIn>
        <FadeIn delay={0.15}>
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center py-10"
          >
            <div className="text-5xl mb-4">💌</div>
            <h3 className="font-armenian-serif text-2xl text-amber-900 mb-2">
              {attending === 'yes' ? 'Շնորհակալություն!' : 'Ցավոք...'}
            </h3>
            <p className="font-armenian-sans text-stone-600 leading-relaxed">
              {attending === 'yes'
                ? 'Շատ ուրախ ենք, որ կմիանաք մեզ: Ձեր մասնակցությունը կարևոր է մեզ համար։'
                : 'Ցավում ենք, որ չեք կարող միանալ մեզ: Կհանդիպենք հարսանիքից հետո։'}
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 max-w-sm mx-auto">
            <div className="flex gap-3 justify-center">
              {[
                { val: 'yes', label: 'Այո, սիրով' },
                { val: 'no', label: 'Ցավոք, չեմ կարող' },
              ].map(opt => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setAttending(opt.val)}
                  className={`flex-1 py-3 px-4 rounded-full border font-armenian-sans text-sm transition-all duration-300 ${attending === opt.val
                      ? 'bg-amber-800 text-white border-amber-800 shadow-md'
                      : 'bg-white/60 text-stone-600 border-stone-300 hover:border-amber-700'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div>
              <label className="block font-armenian-sans text-sm text-stone-500 mb-1 ml-1">
                Դուք ում հյուր եք
              </label>
              <div className="flex gap-2">
                {[
                  { val: 'anahit', label: 'Հարսի հյուր' },
                  { val: 'vahan', label: 'Փեսայի հյուր' },
                ].map(opt => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setHost(opt.val)}
                    className={`flex-1 py-2 px-3 rounded-full border text-sm font-armenian-sans transition ${host === opt.val
                        ? 'bg-amber-800 text-white border-amber-800 shadow'
                        : 'bg-white/70 text-stone-600 border-stone-300 hover:border-amber-700'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-armenian-sans text-sm text-stone-500 mb-1 ml-1">
                Հյուրերի քանակը
              </label>
              <select
                value={guests}
                onChange={e => setGuests(Number(e.target.value))}
                className={`${inputCls} appearance-none cursor-pointer`}
              >
                <option value={1}>1 հյուր</option>
                <option value={2}>2 հյուր</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="Անուն 1" value={formData.name1}
                onChange={e => setFormData({ ...formData, name1: e.target.value })}
                required className={inputCls} />
              <input type="text" placeholder="Ազգանուն 1" value={formData.surname1}
                onChange={e => setFormData({ ...formData, surname1: e.target.value })}
                required className={inputCls} />
            </div>

            {guests === 2 && (
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Անուն 2" value={formData.name2}
                  onChange={e => setFormData({ ...formData, name2: e.target.value })}
                  required className={inputCls} />
                <input type="text" placeholder="Ազգանուն 2" value={formData.surname2}
                  onChange={e => setFormData({ ...formData, surname2: e.target.value })}
                  required className={inputCls} />
              </div>
            )}

            {error && (
              <p className="font-armenian-sans text-sm text-red-600 text-center">{error}</p>
            )}

            <motion.button
              type="submit"
              disabled={!attending || loading}
              whileHover={attending && !loading ? { scale: 1.02 } : {}}
              whileTap={attending && !loading ? { scale: 0.98 } : {}}
              className={`w-full py-4 text-white font-armenian-serif text-base tracking-wide rounded-full shadow-lg transition-colors duration-300 ${!attending || loading ? 'bg-amber-800/40 cursor-not-allowed' : 'bg-amber-800 hover:bg-amber-900'}`}
            >
              {loading ? '...' : 'Ուղarkeл'}
            </motion.button>
          </form>
        )}
      </FadeIn>
      </div>
    </section>
  )
}

function ThankYouSection() {
  return (
    <div className="relative overflow-hidden" style={{ height: 'clamp(320px, 70vh, 90vh)' }}>
      <motion.img
        src={`${import.meta.env.BASE_URL}thankYou.jpg`}
        alt="Վահան և Անահիտ"
        className="w-full h-full object-cover object-top"
        initial={{ scale: 1.08 }}
        whileInView={{ scale: 1 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        viewport={{ once: true }}
        style={{ filter: 'brightness(0.75) saturate(0.85)' }}
      />
      <div
        className="absolute inset-0 flex flex-col items-center justify-end pb-14"
        style={{ background: 'linear-gradient(to top, rgba(20,12,6,0.72) 0%, rgba(20,12,6,0.15) 55%, transparent 100%)' }}
      >
        <FadeIn direction="up" className="w-full">
          <p
            className="font-carolina text-white/40 text-center"
            style={{ fontSize: 'clamp(4rem, 20vw, 10rem)', textShadow: '0 2px 32px rgba(0,0,0,0.4)', lineHeight: 1.1 }}
          >
            Thank You
          </p>
        </FadeIn>
      </div>
    </div>
  )
}

function FooterSection() {
  return (
    <footer className="text-center py-14 px-6" style={{ backgroundColor: '#2c2118' }}>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <h3 className="font-armenian-serif text-white/80 text-2xl font-light mb-2">
          Վahаn Եwu Аnahit
        </h3>
        <p className="font-armenian-sans text-amber-200/40 text-xs tracking-widest mb-6">
          25 · 04 · 2026
        </p>
        <div className="h-px w-16 bg-amber-200/20 mx-auto mb-6" />
        <p className="font-armenian-sans text-amber-200/40 text-xs leading-relaxed">
          Շնորհակալ ենք Ձեր ըմբռնման,<br />
          սիրո և մեզ հետ այս օրը կիսելու պատրաստակամության համար։
        </p>
      </motion.div>
    </footer>
  )
}

function InvitationTextSection() {
  return (
    <section style={{ backgroundColor: '#f0ebe3' }} className="px-6 py-14">
      <div className="max-w-md mx-auto text-center">
        <FadeIn>
          <p className="font-armenian-sans text-stone-600 text-sm leading-relaxed">
            Սիրով հրավիրում ենք Ձեզ<br />
            կիսելու մեր կյանքի ամենակարևոր և երջանիկ օրը,<br />
            երբ մենք կասենք մեր ամենասիրելի "այո"-ն։
          </p>
        </FadeIn>
      </div>
    </section>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WeddingInvitation() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f0ea' }}>
      <HeroSection />
      <InvitationTextSection />
      <CalendarSection />
      <GuestPresenceSection />
      <ProgramSection />
      <DressCodeAndRulesSection />
      <DateRecapSection />
      <RSVPSection />
      <ThankYouSection />
      <FooterSection />
    </div>
  )
}
