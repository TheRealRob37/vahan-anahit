import { motion } from 'framer-motion'
import FadeIn from './FadeIn'

export default function ThankYouSection() {
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
