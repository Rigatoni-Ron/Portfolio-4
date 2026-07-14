import { Globe, Leaf, ArrowUpRight } from './icons.jsx'

export default function Header() {
  return (
    <header className="header">
      <h1>I&rsquo;m Aaron</h1>
      <p className="header-sub">
        <span>Passionate about DeFi</span>
        <span className="inline-icon">
          <Globe />
        </span>
        <span>, constantly inspired by my</span>
        {/* inspo garden link — target wired up later */}
        <a className="pill" href="#" aria-label="Visit my inspo garden">
          inspo garden
          <ArrowUpRight />
        </a>
        <span>, leveraging code to test usability + delight</span>
        <span className="inline-icon">
          <Leaf />
        </span>
      </p>
    </header>
  )
}
