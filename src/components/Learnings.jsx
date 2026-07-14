import { motion } from 'framer-motion'

const COURSES = [
  { title: 'Interface Craft', url: 'https://www.interfacecraft.dev/', host: 'interfacecraft.dev' },
  { title: 'Design Engineering', url: 'https://www.designengineer.xyz/design-engineering', host: 'designengineer.xyz' },
]

const PODCASTS = [
  { title: 'Dive Club', url: 'https://www.youtube.com/@joindiveclub', host: 'youtube.com/@joindiveclub' },
  { title: 'Designer Tom', url: 'https://www.youtube.com/@designertom', host: 'youtube.com/@designertom' },
  { title: "Lenny's Podcast", url: 'https://www.youtube.com/@LennysPodcast', host: 'youtube.com/@LennysPodcast' },
  { title: 'Ryan Peterman', url: 'https://www.youtube.com/@RyanLPeterman', host: 'youtube.com/@RyanLPeterman' },
]

const hoverLift = {
  y: -4,
  transition: { type: 'spring', stiffness: 420, damping: 24, mass: 0.5 },
}

function LinkCard({ item }) {
  return (
    <motion.a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      className="learn-card"
      whileHover={hoverLift}
      whileTap={{ scale: 0.99 }}
    >
      <span className="learn-card-title">{item.title}</span>
      <span className="learn-card-host">{item.host}</span>
    </motion.a>
  )
}

export default function Learnings() {
  return (
    <section className="learnings">
      <div className="learn-block">
        <h2 className="learn-heading">GitHub contributions</h2>
        <motion.a
          href="https://github.com/Rigatoni-Ron"
          target="_blank"
          rel="noreferrer"
          className="learn-chart"
          whileHover={hoverLift}
        >
          <img
            className="learn-chart-img"
            src="https://ghchart.rshah.org/8b8b8b/Rigatoni-Ron"
            alt="GitHub contribution chart for Rigatoni-Ron"
          />
          <span className="learn-chart-foot">github.com/Rigatoni-Ron</span>
        </motion.a>
      </div>

      <div className="learn-block">
        <h2 className="learn-heading">Courses</h2>
        <div className="learn-grid">
          {COURSES.map((c) => (
            <LinkCard key={c.url} item={c} />
          ))}
        </div>
      </div>

      <div className="learn-block">
        <h2 className="learn-heading">Podcasts</h2>
        <div className="learn-grid">
          {PODCASTS.map((p) => (
            <LinkCard key={p.url} item={p} />
          ))}
        </div>
      </div>
    </section>
  )
}
