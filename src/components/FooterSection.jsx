import { memo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { COUPLE, WEDDING_DATE_DISPLAY } from '../config/wedding'

const FooterSection = memo(function FooterSection() {
  const navigate = useNavigate()
  const [clicked, setClicked] = useState(false)
  return (
    <footer className="text-center py-14 px-6" style={{ backgroundColor: '#2c2118' }}>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <h3 className="font-armenian-serif text-white/80 text-2xl font-light mb-2">
          {COUPLE}
        </h3>
        <p className="font-armenian-sans text-amber-200/40 text-xs tracking-widest mb-6">
          {WEDDING_DATE_DISPLAY}
        </p>
        <div className="h-px w-16 bg-amber-200/20 mx-auto mb-6" />
        <p className="font-armenian-sans text-amber-200/40 text-xs leading-relaxed">
          Շնորհակալ ենք Ձեր ըմբռնման,<br />
          սիրո և մեզ հետ այս օրը կիսելու պատրաստակամության համար։
        </p>
        {!clicked ? (
          <button
            onClick={() => setClicked(true)}
            className="mt-8 inline-flex items-center gap-2 font-armenian-sans text-xs tracking-widest transition-all duration-300 border rounded-full px-5 py-2"
            style={{ color: 'rgba(253,230,138,0.55)', borderColor: 'rgba(253,230,138,0.2)' }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'rgba(253,230,138,0.9)'
              e.currentTarget.style.borderColor = 'rgba(253,230,138,0.5)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'rgba(253,230,138,0.55)'
              e.currentTarget.style.borderColor = 'rgba(253,230,138,0.2)'
            }}
          >
            ◈ ՉՍԵՂՄԵԼ
          </button>
        ) : (
          <div className="mt-8 flex flex-col items-center gap-3">
            <p className="font-armenian-sans text-xs" style={{ color: 'rgba(253,230,138,0.6)' }}>
              Դե, եթե սեղմեցիր, արի խաղանք
            </p>
            <button
              onClick={() => navigate('/game')}
              className="inline-flex items-center gap-2 font-armenian-sans text-xs tracking-widest transition-all duration-300 border rounded-full px-5 py-2"
              style={{ color: 'rgba(253,230,138,0.55)', borderColor: 'rgba(253,230,138,0.2)' }}
              onMouseEnter={e => {
                e.currentTarget.style.color = 'rgba(253,230,138,0.9)'
                e.currentTarget.style.borderColor = 'rgba(253,230,138,0.5)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'rgba(253,230,138,0.55)'
                e.currentTarget.style.borderColor = 'rgba(253,230,138,0.2)'
              }}
            >
              ◈ Սկսել
            </button>
          </div>
        )}
      </motion.div>
    </footer>
  )
})

export default FooterSection
