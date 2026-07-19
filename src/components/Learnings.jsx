import { motion } from 'motion/react'

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

function LinkCard({ item }) {
  // Hover-lift is handled in CSS to match the Work tab cards/tiles exactly;
  // whileTap mirrors the Playground tiles.
  return (
    <motion.a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      className="learn-card"
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
        <a
          href="https://github.com/Rigatoni-Ron"
          target="_blank"
          rel="noreferrer"
          className="learn-chart"
        >
          {/* Color is the inverse of the target orange (#c97a3e): the CSS
              invert(1) filter flips it back to orange while flipping the
              light empty cells to dark so they recede into the card. */}
          <img
            className="learn-chart-img"
            src="https://ghchart.rshah.org/3685c1/Rigatoni-Ron"
            alt="GitHub contribution chart for Rigatoni-Ron"
          />
          <span className="learn-chart-foot">github.com/Rigatoni-Ron</span>
        </a>
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
