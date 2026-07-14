import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Close, ArrowUpRight } from './icons.jsx'
import { morph } from '../motion.js'

export default function ProjectModal({ project, onClose }) {
  useEffect(() => {
    if (!project) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [project, onClose])

  return (
    <>
      {/* Dark/blur layer — fades on its own, never covers the morphing box. */}
      <AnimatePresence>
        {project && (
          <motion.div
            key="overlay"
            className="modal-overlay"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {project && (
          <motion.button
            key="close"
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Close />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Persistent centering layer; the modal is a DIRECT AnimatePresence child
          so on close the card (same layoutId) morphs back from the modal's box. */}
      <div className="modal-layer">
        <AnimatePresence>
          {project && (
            <motion.div
              key={project.id}
              layoutId={`card-${project.id}`}
              className="modal"
              onClick={(e) => e.stopPropagation()}
              transition={morph}
              // On close the card (same layoutId) performs the shrink-back.
              // Kill framer's default crossfade of the departing modal so it
              // doesn't linger as a second box in the center.
              exit={{ opacity: 0, transition: { duration: 0 } }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
            >
              <motion.div className="modal-media" layoutId={`media-${project.id}`}>
                {project.image && (
                  <img
                    className="media-img"
                    src={project.image}
                    alt={`${project.title} interface`}
                    draggable="false"
                  />
                )}
              </motion.div>

              {/* Fades in on open. No exit animation on purpose: on close the
                  modal unmounts instantly so only the card's morph is visible,
                  avoiding a second "ghost" box lingering in the center. */}
              <motion.div
                className="modal-body"
                initial={{ opacity: 0, y: 6 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { delay: 0.12, duration: 0.28 },
                }}
              >
                <div className="modal-eyebrow">
                  <span>{project.role}</span>
                  <span>·</span>
                  <span>{project.year}</span>
                </div>
                <h2 id="modal-title">{project.title}</h2>
                <p className="modal-desc">{project.body}</p>

                {project.highlights && (
                  <ul className="modal-highlights">
                    {project.highlights.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                )}

                <div className="modal-tags">
                  {project.tags.map((t) => (
                    <span className="tag" key={t}>
                      {t}
                    </span>
                  ))}
                </div>

                {project.link && (
                  <a
                    className="modal-link"
                    href={project.link.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {project.link.label}
                    <ArrowUpRight />
                  </a>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
