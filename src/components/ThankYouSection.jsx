import { motion } from 'framer-motion'
import FadeIn from './FadeIn'
import { config } from '../config/wedding'

const thankYouImage = `${import.meta.env.BASE_URL}${config.assets.thankYouImage}`
const thankYouAlt = config.assets.thankYouAlt
const thankYouTitle = config.copy.thankYou.title

export default function ThankYouSection() {
  return (
    <div className="relative overflow-hidden" style={{ height: 'clamp(320px, 70vh, 90vh)' }}>
      {/* Mobile: photo */}
      <motion.img
        src={thankYouImage}
        alt={thankYouAlt}
        loading="lazy"
        decoding="async"
        className="md:hidden w-full h-full object-cover object-top"
        initial={{ scale: 1.08 }}
        whileInView={{ scale: 1 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        viewport={{ once: true }}
        style={{ filter: 'brightness(0.75) saturate(0.85)' }}
      />

      {/* Desktop: golden luxury background */}
      <div
        className="hidden md:block absolute inset-0"
        style={{ background: 'linear-gradient(135deg, #2c1a08 0%, #6b4c1e 25%, #c9922a 50%, #e8c96d 65%, #c9922a 80%, #6b4c1e 100%)' }}
      />
      {/* Subtle texture overlay */}
      <div
        className="hidden md:block absolute inset-0 opacity-20"
        style={{ backgroundImage: 'radial-gradient(ellipse at 30% 50%, rgba(255,220,100,0.4) 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, rgba(180,120,20,0.3) 0%, transparent 60%)' }}
      />

      {/* Mobile overlay */}
      <div
        className="md:hidden absolute inset-0 flex flex-col items-center justify-end pb-14"
        style={{ background: 'linear-gradient(to top, rgba(20,12,6,0.72) 0%, rgba(20,12,6,0.15) 55%, transparent 100%)' }}
      />

      {/* Text — both */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <FadeIn direction="up" className="w-full">
          <p
            className="font-carolina text-center"
            style={{
              fontSize: 'clamp(4rem, 20vw, 10rem)',
              lineHeight: 1.1,
              color: 'rgba(255,255,255,0.25)',
            }}
          >
            {thankYouTitle}
          </p>
        </FadeIn>
      </div>
    </div>
  )
}
