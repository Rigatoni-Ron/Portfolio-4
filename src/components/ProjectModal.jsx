import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Close, ArrowUpRight, ChevronLeft, ChevronRight } from './icons.jsx'
import { morph } from '../motion.js'
import LoanCard from './LoanCard.jsx'
import AgreementAssets from './AgreementAssets.jsx'
import SendTransfer from './SendTransfer.jsx'

/* Media carousel: slides through a project's screens. The media box takes
   each image's own aspect ratio (from its stored pixel dims) and TRANSITIONS
   between shapes — the modal adapts to the image instead of cropping it.
   Slides travel horizontally in the direction of navigation; ←/→ keys work
   while the modal is open. Single-image projects render with no chrome. */
function MediaCarousel({ project }) {
  // Product-shot experiment: show the same landscape + floating Loan Card as
  // the thumbnail, no carousel. The other screens stay in data for later.
  if (project.heroBg) {
    return (
      <motion.div className="modal-media is-heroshot" layoutId={`media-${project.id}`}>
        <img className="card-bg" src={project.heroBg} alt="" draggable="false" />
        <div className="card-heroshot-overlay ui-theme-light">
          {project.heroComponent === 'agreement' ? (
            <AgreementAssets />
          ) : project.heroComponent === 'send' ? (
            <SendTransfer />
          ) : (
            <LoanCard />
          )}
        </div>
      </motion.div>
    )
  }

  const images = project.images ?? []
  const [[idx, dir], setSlide] = useState([0, 0])
  const many = images.length > 1
  const img = images[idx] ?? null

  const go = (delta) =>
    setSlide(([i]) => [(i + delta + images.length) % images.length, delta])

  useEffect(() => {
    if (!many) return
    const onKey = (e) => {
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [many, images.length])

  return (
    <motion.div
      className="modal-media"
      layoutId={`media-${project.id}`}
      // aspect-ratio transitions (see .modal-media CSS) — the box glides
      // between image shapes as you navigate.
      style={img ? { aspectRatio: `${img.w} / ${img.h}` } : undefined}
    >
      <AnimatePresence mode="popLayout" initial={false} custom={dir}>
        {img && (
          <motion.img
            key={idx}
            className="media-img"
            src={img.src}
            alt={`${project.title} interface — screen ${idx + 1}`}
            draggable="false"
            custom={dir}
            variants={{
              enter: (d) => ({ opacity: 0, x: d > 0 ? 48 : d < 0 ? -48 : 0 }),
              center: { opacity: 1, x: 0 },
              exit: (d) => ({ opacity: 0, x: d > 0 ? -48 : d < 0 ? 48 : 0 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          />
        )}
      </AnimatePresence>

      {many && (
        <>
          <button
            type="button"
            className="carousel-arrow prev"
            aria-label="Previous image"
            onClick={(e) => {
              e.stopPropagation()
              go(-1)
            }}
          >
            <ChevronLeft />
          </button>
          <button
            type="button"
            className="carousel-arrow next"
            aria-label="Next image"
            onClick={(e) => {
              e.stopPropagation()
              go(1)
            }}
          >
            <ChevronRight />
          </button>
          <div className="carousel-dots" role="tablist" aria-label="Images">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === idx}
                aria-label={`Image ${i + 1}`}
                className={`carousel-dot ${i === idx ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation()
                  setSlide(([cur]) => [i, i > cur ? 1 : -1])
                }}
              />
            ))}
          </div>
        </>
      )}
    </motion.div>
  )
}

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
              <MediaCarousel project={project} />

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
                <div className="modal-title-row">
                  <h2 id="modal-title">{project.title}</h2>
                  {project.metrics && (
                    <div className="modal-badges">
                      {project.metrics.map((m) => (
                        <span className="metric-badge" key={m.label}>
                          <span className="metric-badge-value">{m.value}</span>
                          {m.label}
                        </span>
                      ))}
                    </div>
                  )}
                  {project.link && (
                    <a
                      className="modal-linkout"
                      href={project.link.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={project.link.label}
                    >
                      <ArrowUpRight />
                    </a>
                  )}
                </div>
                <p className="modal-desc">{project.body}</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
