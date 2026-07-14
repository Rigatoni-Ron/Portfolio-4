import { motion } from 'framer-motion'
import { playground } from '../data.js'
import { ArrowUpRight } from './icons.jsx'

export default function Playground() {
  return (
    <section aria-labelledby="play-title">
      <h2 className="section-title" id="play-title">
        Playground
      </h2>
      <div className="play-grid">
        {playground.map((c) => (
          <motion.button
            key={c.id}
            className="tile"
            whileTap={{ scale: 0.99 }}
            aria-label={`Open ${c.title}`}
          >
            <div className="tile-meta">
              <div>
                <div className="tile-title">{c.title}</div>
                <div className="tile-tag">{c.tag}</div>
              </div>
              <span className="tile-arrow">
                <ArrowUpRight />
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </section>
  )
}
