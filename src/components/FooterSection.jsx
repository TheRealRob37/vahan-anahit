import { memo } from 'react'
import { motion } from 'framer-motion'
import { COUPLE, WEDDING_DATE_DISPLAY, config } from '../config/wedding'

const footerThanksLines = config.copy.footerThanks.split('\n')

const FooterSection = memo(function FooterSection() {
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
          {footerThanksLines.map((line, index) => (
            <span key={line}>
              {line}
              {index < footerThanksLines.length - 1 && <br />}
            </span>
          ))}
        </p>
      </motion.div>
    </footer>
  )
})

export default FooterSection
