import { Download } from './icons.jsx'

/*
 * CV page. Own entry (cv.html) so it opens in its own tab and prints cleanly.
 * Content comes from the Figma resume, with the Anchorage work enriched by the
 * numbers the site's recently-shipped section already carries.
 * The PDF is still the browser's own print output — vector type, selectable
 * text and live links, no dependency — but printed ahead of time by
 * scripts/cv-pdf.mjs and committed, because Vercel's build image has no
 * Chrome. cv.css flips to a light sheet for print, and that's what renders it.
 */

const EXPERIENCE = [
  {
    company: 'Anchorage Digital',
    meta: 'The first federally chartered digital asset bank',
    roles: [{ title: 'Senior Product Designer', dates: 'Jul 2025 to Present' }],
    // Grouped by product: settlements first, then collateral.
    badges: [
      { value: '+20%', label: 'settlement volume' },
      { value: '2×', label: 'settlements / mo' },
      { value: '+62%', label: 'pledged AUC' },
      { value: '4×', label: 'collateral deals' },
    ],
    points: [
      'Designed Collateral Management as a 0 to 1 product, letting institutions borrow and lend digital assets while managing interest accrual and liquidations. Took it from a planned reskin of a back office tool to a product that shows position state visually and recommends the next best action, so a margin call arrives with a top up or pay down already suggested.',
      'Designed off-exchange settlement, so institutions can trade on exchanges while their funds stay in bank custody. Over $1B settled.',
      'Designed tri-party escrow accounts: clear roles, release conditions, and an audit trail all three parties can trust.',
      'Put unified actions on the roadmap, where it had not been, then led the redesign of 20 operations into one reusable component set. Swap, bridge, convert, deposit, withdraw, settle, pledge, unlock collateral, and twelve more. A new operation now reuses it wholesale instead of starting from scratch, and flows people called hard to follow became short, clear steps.',
      'Founded the data visualization library. Reusable charts fed by GraphQL, now used by the DeFi wallet, fiat banking, custody, and loans teams, and by dozens of designers and engineers.',
      'Ran agentic workflow workshops for all 20 designers, then one to one sessions until it stuck. Designers now open PRs and change code in production.',
      'Lead several weekly design critiques, and mentor designers as their onboarding buddy, elevating craft alongside ramp time.',
      'Ran usability sessions and research interviews with clients holding $100MM and up, and became the largest contributor to the research repository.',
    ],
  },
  {
    company: 'Rivalry Corp',
    meta: 'Crypto prediction market',
    roles: [
      { title: 'Senior Product Designer', dates: 'Apr 2024 to Jun 2025' },
      { title: 'Product Designer', dates: 'May 2022 to Apr 2024' },
    ],
    badges: [
      { value: '+621%', label: 'wallet connect rate' },
      { value: '40k+', label: 'wallets onboarded' },
      { value: '46.2%', label: 'less design and dev time' },
    ],
    points: [
      'Crypto onboarding, fiat and crypto ramps, wallets, staking, and airdrops across iOS, Android, and mobile web. 40k+ wallets onboarded in the first month.',
      'Wallet connect rebuilt from 2,000+ survey responses and user testing. Connect rates up 621%.',
      'Fiat and crypto processing tools, and the analytics dashboard.',
      'Three design systems, for crypto, betting, and SaaS tooling. 46.2% less design and dev time.',
    ],
  },
  {
    company: 'DeFi Swapping App',
    meta: 'Contract',
    roles: [{ title: 'Lead Product Designer', dates: 'Nov 2024 to Feb 2025' }],
    points: [
      'Built the MVP for a DeFi crypto wallet swapping app on iOS.',
      'Used web data to steer the decisions, then took it from hi-fi designs to a working prototype in node based tools, Origami and Play.',
    ],
  },
  {
    company: 'Cash App',
    meta: 'Contract',
    roles: [{ title: 'Branding Designer', dates: 'May 2022 to Aug 2022' }],
    points: [
      'Conceived and designed a 3D sculpture built for a fish tank as part of a creative campaign, working inside the brand guidelines. Seen by millions online.',
    ],
  },
  {
    company: 'Shop Okie Dokie',
    meta: 'B2B and B2C e-commerce',
    roles: [{ title: 'UX Designer', dates: 'Oct 2016 to Apr 2022' }],
    points: [
      'Designed the B2B and B2C e-commerce experiences.',
      'Ran interviews to find user pain points, needs, and desires, and turned what surfaced into opportunities.',
      'Validated solutions by analyzing metrics and running usability tests.',
    ],
  },
]

const SKILLS = [
  'Rapid prototyping',
  'Usability testing',
  'User research',
  'Outcome driven strategy',
  'Data analysis',
  'Information architecture',
  'Wireframing',
  'Hi-fidelity design',
  'Accessibility',
  'Interaction design',
  'Validating solutions',
  'User journeys',
  'Design systems',
  'Design critique',
  'Mentorship',
  'User personas',
  'Lottie and JSON animation',
  'Gamification',
  'HTML, CSS, JS',
  '2D and 3D animation',
]

const STACK = [
  'Figma',
  'Claude Code',
  'Conductor',
  'VS Code',
  'Framer',
  'Supernova',
  'Notion',
  'Linear',
  'GitHub',
  'Mixpanel',
  'Google Analytics',
  'Jitter',
]

export default function Cv() {
  return (
    <main className="cv">
      <header className="cv-head">
        <div className="cv-id">
          <h1>Aaron Chartrand</h1>
          <p className="cv-role">Senior Product Designer</p>
          <p className="cv-blurb">
            Code based prototyping, user research, and design systems.
          </p>
          <p className="cv-location">Toronto, Canada</p>

          {/* Part of the header block, so it sits on the same rhythm as the
              lines above it rather than a section away. */}
          <nav className="cv-contact" aria-label="Contact">
            <a href="mailto:aaronchartrand1@gmail.com">aaronchartrand1@gmail.com</a>
            <a href="https://www.aaronchartrand.me/" target="_blank" rel="noreferrer">
              aaronchartrand.me
            </a>
            <a
              href="https://www.linkedin.com/in/aaron-chartrand-495229217/"
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn
            </a>
            <a href="https://github.com/Rigatoni-Ron" target="_blank" rel="noreferrer">
              GitHub
            </a>
          </nav>
        </div>

        {/* A real file, not window.print() — that opened a print dialog and
            tripped Safari's "this webpage is trying to print" warning. The PDF
            is committed rather than generated on deploy, so edits to this page
            leave it stale; scripts/ensure-cv-pdf.mjs rebuilds it on dev, build,
            and commit, so there is nothing to remember. */}
        <a className="cv-dl" href="/aaron-chartrand-cv.pdf" download>
          <Download />
          Download PDF
        </a>
      </header>

      <section className="cv-section">
        <h2>Experience</h2>
        <div className="cv-entries">
          {EXPERIENCE.map((job) => (
            <article className="cv-entry" key={job.company}>
              <div className="cv-entry-head">
                <h3>{job.company}</h3>
                <span className="cv-meta">{job.meta}</span>
              </div>

              {/* Two titles at one company get a connector, so they read as a
                  progression rather than two unrelated jobs. */}
              <div className={`cv-roles${job.roles.length > 1 ? ' is-stacked' : ''}`}>
                {job.roles.map((r) => (
                  <div className="cv-role-row" key={r.title}>
                    <span className="cv-role-title">{r.title}</span>
                    <span className="cv-dates">{r.dates}</span>
                  </div>
                ))}
              </div>

              {job.badges && (
                <div className="cv-badges">
                  {job.badges.map((b) => (
                    <span className="cv-badge" key={b.label}>
                      <span className="cv-badge-value">{b.value}</span>
                      {b.label}
                    </span>
                  ))}
                </div>
              )}

              <ul className="cv-points">
                {job.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="cv-section cv-two-up">
        <div>
          <h2>Skills</h2>
          <ul className="cv-tags">
            {SKILLS.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2>Current tech stack</h2>
          <ul className="cv-tags">
            {STACK.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="cv-foot">
        <span>Aaron Chartrand</span>
        <a href="https://www.aaronchartrand.me/">aaronchartrand.me</a>
      </footer>
    </main>
  )
}
