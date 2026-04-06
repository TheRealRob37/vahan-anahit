import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

export default function FadeIn({ children, delay = 0, className = '', direction = 'up' }) {
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
