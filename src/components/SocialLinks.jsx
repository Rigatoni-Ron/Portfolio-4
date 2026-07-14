import { GitHub, LinkedIn, XMark, Mail } from './icons.jsx'

const links = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/', Icon: LinkedIn },
  { label: 'GitHub', href: 'https://github.com/', Icon: GitHub },
  { label: 'X', href: 'https://x.com/', Icon: XMark },
  { label: 'Email', href: 'mailto:aaronchartrand1@gmail.com', Icon: Mail },
]

export default function SocialLinks() {
  return (
    <nav className="social-row" aria-label="Social links">
      {links.map(({ label, href, Icon }) => (
        <a
          key={label}
          className="icon-btn"
          href={href}
          target={href.startsWith('http') ? '_blank' : undefined}
          rel="noreferrer"
          aria-label={label}
        >
          <Icon />
        </a>
      ))}
    </nav>
  )
}
