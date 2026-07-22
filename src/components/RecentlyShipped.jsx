import { motion } from 'motion/react'
import { projects } from '../data.js'
import { morph } from '../motion.js'
import LoanCard from './LoanCard.jsx'

export default function RecentlyShipped({ onOpen, activeId, closingId }) {
  return (
    <section aria-labelledby="ship-title">
      <h2 className="section-title" id="ship-title">
        Recently shipped
      </h2>
      <div className="ship-list">
        {projects.map((p) => {
          const isActive = activeId === p.id
          const isClosing = closingId === p.id
          return (
            <motion.button
              key={p.id}
              // Shared identity with the modal — framer morphs between the two.
              layoutId={`card-${p.id}`}
              className="card"
              onClick={() => onOpen(p)}
              aria-label={`Open ${p.title}`}
              transition={morph}
              // Hidden while its modal is open (kept in flow so siblings don't shift).
              // While closing, it's the element that morphs back — lift it above the
              // fading overlay so the reverse morph is fully visible.
              animate={{ opacity: isActive ? 0 : 1 }}
              style={{
                zIndex: isActive || isClosing ? 60 : 1,
                pointerEvents: isActive ? 'none' : 'auto',
              }}
            >
              <motion.div
                className={`card-media${
                  p.heroBg ? ' is-heroshot' : p.cutout ? ` is-cutout is-cutout-${p.cutout}` : ''
                }`}
                layoutId={`media-${p.id}`}
              >
                {p.heroBg ? (
                  <>
                    <img className="card-bg" src={p.heroBg} alt="" draggable="false" />
                    <div className="card-heroshot-overlay">
                      <LoanCard />
                    </div>
                  </>
                ) : (
                  p.images?.[0] && (
                    <img
                      className="media-img"
                      src={p.images[0].src}
                      alt=""
                      draggable="false"
                    />
                  )
                )}
              </motion.div>
              <div className="card-body">
                <h3 className="card-title">{p.title}</h3>
                <p className="card-desc">{p.desc}</p>
              </div>
            </motion.button>
          )
        })}
      </div>
    </section>
  )
}
