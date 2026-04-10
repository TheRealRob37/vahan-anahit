import { Fragment } from 'react'
import { motion } from 'framer-motion'
import MusicPlayer from './MusicPlayer'
import Stars from './Stars'
import { GROOM, BRIDE, WEDDING_DATE_PARTS } from '../config/wedding'

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={`${import.meta.env.BASE_URL}background.jpg`}
          alt=""
          fetchPriority="high"
          decoding="async"
          className="w-full h-full object-cover object-center"
          style={{ filter: 'brightness(0.45) saturate(0.8)' }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(30,18,10,0.85) 0%, rgba(30,18,10,0.3) 50%, rgba(30,18,10,0.1) 100%)' }} />
        <Stars />
      </div>

      {/* Save the Date + vinyl — mobile: flex-1 so it fills space above names naturally */}
      <div className="md:hidden relative z-10 flex flex-col items-center justify-center flex-1 pb-4">
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
        <div className="mt-6">
          <MusicPlayer vinyl />
        </div>
      </div>

      {/* Save the Date + vinyl — desktop */}
      <div className="hidden md:flex absolute inset-0 flex-col items-center justify-start z-10" style={{ paddingTop: '8vh' }}>
        <span className="font-carolina text-amber-200/50" style={{ fontSize: 'clamp(3rem, 6vw, 5.5rem)', lineHeight: 1 }}>
          Save the Date
        </span>
        <div className="mt-5">
          <MusicPlayer vinyl />
        </div>
      </div>

      <div className="relative z-10 text-center px-6 pb-12 mt-auto">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1
            className="font-armenian-serif text-white leading-none mb-4"
            style={{ fontSize: 'clamp(3rem, 12vw, 7rem)', fontWeight: 300, letterSpacing: '-0.02em' }}
          >
            {GROOM}
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
            {BRIDE}
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center gap-px mb-8"
        >
          {WEDDING_DATE_PARTS.map((value, i) => (
            <Fragment key={value}>
              {i > 0 && <div className="w-px bg-amber-200/20 mx-3" />}
              <div className="text-center px-3">
                <div className="font-armenian-serif text-white/90" style={{ fontSize: 'clamp(1.8rem, 7vw, 3.5rem)', fontWeight: 300 }}>
                  {value}
                </div>
              </div>
            </Fragment>
          ))}
        </motion.div>

      </div>
    </section>
  )
}
