import { memo } from 'react'
import { motion } from 'framer-motion'
import { useRSVP } from '../hooks/useRSVP'
import FadeIn from './FadeIn'
import SectionHeader from './SectionHeader'
import { config } from '../config/wedding'

const inputCls = 'w-full py-3 px-4 bg-white/70 border border-stone-200 rounded-xl text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/30 transition'
const { rsvp: rsvpCopy, rsvpSection } = config.copy
const sideOptions = config.rsvp.sides
const guestOptions = Array.from({ length: config.rsvp.maxGuests }, (_, index) => index + 1)
const deadlineNote = rsvpCopy.deadlineNote.replace('{deadline}', config.date.rsvpDeadline)

const RSVPSection = memo(function RSVPSection() {
  const {
    attending, setAttending,
    host, setHost,
    guests, setGuests,
    name1, setName1,
    surname1, setSurname1,
    name2, setName2,
    surname2, setSurname2,
    submitted, error, loading,
    isValid, submit,
  } = useRSVP()

  return (
    <section style={{ backgroundColor: '#faf7f4' }} className="px-6 py-14" aria-label="RSVP">
      <div className="max-w-md mx-auto">
        <FadeIn>
          <SectionHeader label={rsvpSection.label} title={rsvpSection.title} />
          <p className="text-sm text-stone-500 text-center mb-8 leading-relaxed">
            {deadlineNote}
          </p>
        </FadeIn>

        <FadeIn delay={0.15}>
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="text-center py-10"
              role="status"
              aria-live="polite"
            >
              <div className="text-5xl mb-4" aria-hidden="true">💌</div>
              <h3 className="font-armenian-serif text-2xl text-amber-900 mb-2">
                {attending === 'yes' ? rsvpCopy.successYesTitle : rsvpCopy.successNoTitle}
              </h3>
              <p className="text-stone-600 leading-relaxed">
                {attending === 'yes'
                  ? rsvpCopy.successYes
                  : rsvpCopy.successNo}
              </p>
            </motion.div>
          ) : (
            <form onSubmit={submit} className="space-y-5 max-w-sm mx-auto" noValidate>

              {/* Attending */}
              <fieldset>
                <legend className="block text-sm text-stone-500 mb-2 ml-1">{rsvpCopy.attendingQuestion}</legend>
                <div className="flex gap-3">
                  {[
                    { val: 'yes', label: rsvpCopy.attendingYesLabel },
                    { val: 'no', label: rsvpCopy.attendingNoLabel },
                  ].map(opt => (
                    <button
                      key={opt.val}
                      type="button"
                      aria-pressed={attending === opt.val}
                      onClick={() => setAttending(opt.val)}
                      className={`flex-1 py-3 px-4 rounded-full border text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-700/50 ${attending === opt.val
                        ? 'bg-amber-800 text-white border-amber-800 shadow-md'
                        : 'bg-white/60 text-stone-600 border-stone-300 hover:border-amber-700'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              {/* Host side */}
              <fieldset>
                <legend className="block text-sm text-stone-500 mb-2 ml-1">{rsvpCopy.sideQuestion}</legend>
                <div className="flex gap-2">
                  {sideOptions.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      aria-pressed={host === opt.value}
                      onClick={() => setHost(opt.value)}
                      className={`flex-1 py-2 px-3 rounded-full border text-sm transition focus:outline-none focus:ring-2 focus:ring-amber-700/50 ${host === opt.value
                        ? 'bg-amber-800 text-white border-amber-800 shadow'
                        : 'bg-white/70 text-stone-600 border-stone-300 hover:border-amber-700'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              {/* Guest count */}
              <div>
                <label htmlFor="guests-select" className="block text-sm text-stone-500 mb-1 ml-1">
                  {rsvpCopy.guestCountLabel}
                </label>
                <select
                  id="guests-select"
                  value={guests}
                  onChange={e => setGuests(Number(e.target.value))}
                  className={`${inputCls} appearance-none cursor-pointer`}
                >
                  {guestOptions.map(count => (
                    <option key={count} value={count}>{count} հյուր</option>
                  ))}
                </select>
              </div>

              {/* Guest 1 */}
              <fieldset>
                <legend className="sr-only">{rsvpCopy.firstGuestLegend}</legend>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="name1" className="sr-only">{rsvpCopy.firstNamePlaceholder}</label>
                    <input
                      id="name1"
                      type="text"
                      placeholder={rsvpCopy.firstNamePlaceholder}
                      value={name1}
                      onChange={e => setName1(e.target.value)}
                      required
                      autoComplete="given-name"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label htmlFor="surname1" className="sr-only">{rsvpCopy.lastNamePlaceholder}</label>
                    <input
                      id="surname1"
                      type="text"
                      placeholder={rsvpCopy.lastNamePlaceholder}
                      value={surname1}
                      onChange={e => setSurname1(e.target.value)}
                      required
                      autoComplete="family-name"
                      className={inputCls}
                    />
                  </div>
                </div>
              </fieldset>

              {/* Guest 2 */}
              {guests === 2 && (
                <fieldset>
                  <legend className="sr-only">{rsvpCopy.secondGuestLegend}</legend>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="name2" className="sr-only">{rsvpCopy.firstNamePlaceholder}</label>
                      <input
                        id="name2"
                        type="text"
                        placeholder={rsvpCopy.firstNamePlaceholder}
                        value={name2}
                        onChange={e => setName2(e.target.value)}
                        required
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label htmlFor="surname2" className="sr-only">{rsvpCopy.lastNamePlaceholder}</label>
                      <input
                        id="surname2"
                        type="text"
                        placeholder={rsvpCopy.lastNamePlaceholder}
                        value={surname2}
                        onChange={e => setSurname2(e.target.value)}
                        required
                        className={inputCls}
                      />
                    </div>
                  </div>
                </fieldset>
              )}

              {/* Error */}
              {error && (
                <p role="alert" aria-live="assertive" className="text-sm text-red-600 text-center">
                  {error}
                </p>
              )}

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={!isValid() || loading}
                aria-disabled={!isValid() || loading}
                whileHover={isValid() && !loading ? { scale: 1.02 } : {}}
                whileTap={isValid() && !loading ? { scale: 0.98 } : {}}
                className={`w-full py-4 text-white font-armenian-serif text-base tracking-wide rounded-full shadow-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-amber-700/60 focus:ring-offset-2 ${!isValid() || loading ? 'bg-amber-800/40 cursor-not-allowed' : 'bg-amber-800 hover:bg-amber-900'}`}
              >
                {loading ? rsvpCopy.sendingLabel : rsvpCopy.submitLabel}
              </motion.button>
            </form>
          )}
        </FadeIn>
      </div>
    </section>
  )
})

export default RSVPSection
