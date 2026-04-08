import { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import FadeIn from './FadeIn'
import SectionHeader from './SectionHeader'

const inputCls = 'w-full py-3 px-4 bg-white/70 border border-stone-200 rounded-xl font-armenian-sans text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700/30 transition'

export default function RSVPSection() {
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
      const payload = {
        attending,
        host,
        guests,
        name1: formData.name1,
        surname1: formData.surname1,
        name2: guests === 2 ? formData.name2 : null,
        surname2: guests === 2 ? formData.surname2 : null,
      }
      const { error: sbError } = await supabase.from('rsvp_responses').insert([payload])
      if (sbError) throw sbError
      setSubmitted(true)
    } catch (err) {
      console.error(err)
      setError(`Սխալ: ${err?.message || err?.code || JSON.stringify(err)}`)
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = () => {
    if (!attending) return false
    if (!formData.name1.trim() || !formData.surname1.trim()) return false
    if (guests === 2 && (!formData.name2.trim() || !formData.surname2.trim())) return false
    return true
  }

  return (
    <section style={{ backgroundColor: '#faf7f4' }} className="px-6 py-14">
      <div className="max-w-md mx-auto">
        <FadeIn>
          <SectionHeader label="Հաստատում" title="Հաստատել մասնակցությունը" />
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
                  ? 'Շատ շնորհակալ ենք, ձեր հաստատումը ստացվել է: Դուք կարող եք միշտ դիմել մեզ հետ:'
                  : 'Ցավոք, ձեր հաստատումը չի ստացվել: Խնդրում ենք փորձել կրկին:'}
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 max-w-sm mx-auto">
              <div className="flex gap-3 justify-center">
                {[
                  { val: 'yes', label: 'Իհարկե գալու եմ' },
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
                  Դուք ում հյուրն եք
                </label>
                <div className="flex gap-2">
                  {[
                    { val: 'anahit', label: 'Հարսի հյուր' },
                    { val: 'vahan',  label: 'Փեսայի հյուր' },
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
                <input type="text" placeholder="Անուն" value={formData.name1}
                  onChange={e => setFormData({ ...formData, name1: e.target.value })}
                  required className={inputCls} />
                <input type="text" placeholder="Ազգանուն" value={formData.surname1}
                  onChange={e => setFormData({ ...formData, surname1: e.target.value })}
                  required className={inputCls} />
              </div>

              {guests === 2 && (
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="Անուն" value={formData.name2}
                    onChange={e => setFormData({ ...formData, name2: e.target.value })}
                    required className={inputCls} />
                  <input type="text" placeholder="Ազգանուն" value={formData.surname2}
                    onChange={e => setFormData({ ...formData, surname2: e.target.value })}
                    required className={inputCls} />
                </div>
              )}

              {error && (
                <p className="font-armenian-sans text-sm text-red-600 text-center">{error}</p>
              )}

              <motion.button
                type="submit"
                disabled={!isFormValid() || loading}
                whileHover={isFormValid() && !loading ? { scale: 1.02 } : {}}
                whileTap={isFormValid() && !loading ? { scale: 0.98 } : {}}
                className={`w-full py-4 text-white font-armenian-serif text-base tracking-wide rounded-full shadow-lg transition-colors duration-300 ${!isFormValid() || loading ? 'bg-amber-800/40 cursor-not-allowed' : 'bg-amber-800 hover:bg-amber-900'}`}
              >
                {loading ? '...' : 'Հաստատել'}
              </motion.button>
            </form>
          )}
        </FadeIn>
      </div>
    </section>
  )
}
