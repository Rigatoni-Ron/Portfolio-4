import { useState, useRef, useEffect, useCallback } from 'react'
import { UserRound } from './animate-ui/icons/user-round'
import { Users } from './animate-ui/icons/users'
import { Heart } from './animate-ui/icons/heart'
import { Clipboard } from './animate-ui/icons/clipboard'
import { LayoutDashboard } from './animate-ui/icons/layout-dashboard'
import { Search } from './animate-ui/icons/search'
import { Archive } from './animate-ui/icons/archive'
import { Orbit } from './animate-ui/icons/orbit'
import { Cog } from './animate-ui/icons/cog'
import { Terminal } from './animate-ui/icons/terminal'
import { Paintbrush } from './animate-ui/icons/paintbrush'
import { Play } from './animate-ui/icons/play'
import { Lightbulb } from './animate-ui/icons/lightbulb'
import { Brush } from './animate-ui/icons/brush'
import { Compass } from './animate-ui/icons/compass'

// ─── Data ────────────────────────────────────────────────────────────────────

const MENU_ITEMS = [
  {
    id: 'studio', label: 'Info',
    children: [
      { id: 'studio-about',   label: 'About Us' },
      { id: 'studio-team',    label: 'The Team' },
      { id: 'studio-culture', label: 'Culture' },
      { id: 'studio-press',   label: 'Press' },
    ],
  },
  {
    id: 'work', label: 'Work',
    children: [
      { id: 'work-projects', label: 'Selected Projects' },
      { id: 'work-cases',    label: 'Case Studies' },
      { id: 'work-archive',  label: 'Archive' },
    ],
  },
  {
    id: 'services', label: 'Services',
    children: [
      { id: 'services-design',   label: 'Design Systems' },
      { id: 'services-strategy', label: 'Strategy' },
      { id: 'services-dev',      label: 'Development' },
      { id: 'services-brand',    label: 'Brand Identity' },
      { id: 'services-motion',   label: 'Motion & Film' },
    ],
  },
  {
    id: 'journal', label: 'Journal',
    children: [
      { id: 'journal-insights', label: 'Insights' },
      { id: 'journal-process',  label: 'Process Notes' },
      { id: 'journal-field',    label: 'Field Notes' },
    ],
  },
  { id: 'contact', label: 'Contact', form: true, children: [] },
]

const CONTENT_MAP = {
  'studio-about':      { eyebrow: 'Info',     heading: 'About Us',          body: 'Founded with the conviction that design is a form of problem solving. We partner with ambitious teams to create work that is both beautiful and enduring.',           tags: ['Since 2018', 'Global'],          Icon: UserRound },
  'studio-team':       { eyebrow: 'Info',     heading: 'The Team',          body: 'A small group of designers, engineers, and strategists working collaboratively across disciplines to deliver exceptional outcomes for every client.',                   tags: ['12 People', 'Remote-first'],     Icon: Users },
  'studio-culture':    { eyebrow: 'Info',     heading: 'Culture',           body: "We cultivate an environment where curiosity is rewarded, ideas flow freely, and every person's contribution shapes the work we put into the world.",                   tags: ['Open', 'Collaborative'],        Icon: Heart },
  'studio-press':      { eyebrow: 'Info',     heading: 'Press',             body: "Our work and thinking have been covered by industry publications and recognised at international design festivals and award shows.",                                    tags: ["Awwwards", "It's Nice That"],   Icon: Clipboard },
  'work-projects':     { eyebrow: 'Work',     heading: 'Selected Projects', body: 'A curated view of our most significant collaborations — spanning identity, product, and experience design across sectors and scales.',                                 tags: ['40+ Projects', 'Cross-industry'], Icon: LayoutDashboard },
  'work-cases':        { eyebrow: 'Work',     heading: 'Case Studies',      body: 'In-depth explorations of our process: how we define problems, prototype solutions, and measure outcomes that matter to real people.',                                   tags: ['Process', 'Outcomes'],           Icon: Search },
  'work-archive':      { eyebrow: 'Work',     heading: 'Archive',           body: "A chronological record of our studio's output — from early experiments to the projects that shaped our current creative practice.",                                    tags: ['2018 – Now'],                    Icon: Archive },
  'services-design':   { eyebrow: 'Services', heading: 'Design Systems',    body: 'Scalable, token-based design systems that align teams and accelerate product development without compromising quality or consistency.',                                tags: ['Tokens', 'Components', 'Docs'],  Icon: Orbit },
  'services-strategy': { eyebrow: 'Services', heading: 'Strategy',          body: 'From brand positioning to product roadmaps — we help teams make confident decisions grounded in research and genuine creative insight.',                              tags: ['Research', 'Positioning'],       Icon: Cog },
  'services-dev':      { eyebrow: 'Services', heading: 'Development',       body: 'Production-grade code that brings designs to life with precision. We build with React, Next.js, and modern web technologies.',                                        tags: ['React', 'Next.js'],              Icon: Terminal },
  'services-brand':    { eyebrow: 'Services', heading: 'Brand Identity',    body: 'Comprehensive brand systems — from naming and visual identity to tone of voice and implementation across every touchpoint.',                                          tags: ['Visual', 'Voice', 'System'],     Icon: Paintbrush },
  'services-motion':   { eyebrow: 'Services', heading: 'Motion & Film',     body: 'Cinematic storytelling that communicates brand values with clarity and impact. From short-form social to long-form documentary.',                                     tags: ['Film', 'Animation'],             Icon: Play },
  'journal-insights':  { eyebrow: 'Journal',  heading: 'Insights',          body: 'Considered perspectives on design, culture, and the forces shaping our industry — written by our team and close collaborators.',                                     tags: ['Editorial', 'Monthly'],          Icon: Lightbulb },
  'journal-process':   { eyebrow: 'Journal',  heading: 'Process Notes',     body: 'Unfiltered documentation of how we work: the tools, methods, missteps, and breakthroughs that define our creative practice.',                                        tags: ['Behind the scenes'],             Icon: Brush },
  'journal-field':     { eyebrow: 'Journal',  heading: 'Field Notes',       body: 'Short dispatches from exhibitions, conferences, and encounters that feed our collective curiosity and inform the work we make.',                                      tags: ['Events', 'Culture'],             Icon: Compass },
}

// ─── Tokens ───────────────────────────────────────────────────────────────────

const T = {
  card:       '#17181b',
  text:       '#ededef',
  textMid:    '#8a8f98',
  textLight:  '#565a63',
  accent:     '#3b82f6',
  accentSoft: 'rgba(59, 130, 246, 0.12)',
  hover:      'rgba(255, 255, 255, 0.05)',
  border:     'rgba(255, 255, 255, 0.09)',
  sans:       "'Geist', system-ui, sans-serif",
}

const CARD_SHADOW = `
  0 0 0 1px rgba(255,255,255,0.09),
  0 12px 32px rgba(0,0,0,0.45),
  0 32px 64px rgba(0,0,0,0.3)
`

// ─── Global CSS ───────────────────────────────────────────────────────────────

const GLOBAL_CSS = `
  * { box-sizing: border-box; }

  @keyframes subItemIn {
    from { opacity: 0; transform: translateY(-10px) scale(0.95); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes subItemOut {
    from { opacity: 1; transform: translateY(0) scale(1); }
    to   { opacity: 0; transform: translateY(-6px) scale(0.97); }
  }
  @keyframes barIn {
    from { transform: scaleY(0) translateY(4px); opacity: 0; }
    to   { transform: scaleY(1) translateY(0); opacity: 1; }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(6px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes contentIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 0.35; }
    50%       { opacity: 0.85; }
  }
  @keyframes sentPop {
    0%   { transform: scale(0.9); opacity: 0; }
    60%  { transform: scale(1.04); }
    100% { transform: scale(1); opacity: 1; }
  }

  .nav-row  { cursor: pointer; user-select: none; -webkit-tap-highlight-color: transparent; }
  .nav-row:active  { opacity: 0.75; }
  .sub-row  { cursor: pointer; user-select: none; -webkit-tap-highlight-color: transparent; }
  .sub-row:active  { opacity: 0.75; }

  .contact-input {
    width: 100%;
    font-family: 'Geist', system-ui, sans-serif;
    font-size: 13px; font-weight: 400; color: #ededef;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 10px; padding: 9px 12px; outline: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
    resize: none; -webkit-appearance: none; line-height: 1.5;
  }
  .contact-input::placeholder { color: #565a63; }
  .contact-input:focus {
    border-color: rgba(59,130,246,0.5);
    box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
    background: rgba(255,255,255,0.05);
  }

  .send-btn {
    width: 100%; background: #3b82f6; color: #fff; border: none;
    border-radius: 10px; padding: 10px 16px;
    font-family: 'Geist', system-ui, sans-serif;
    font-size: 13.5px; font-weight: 500; letter-spacing: -0.01em;
    cursor: pointer;
    transition: background 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease;
    box-shadow: 0 2px 12px rgba(59,130,246,0.35);
  }
  .send-btn:hover { background: #4c8dff; box-shadow: 0 4px 18px rgba(59,130,246,0.45); }
  .send-btn:active { transform: scale(0.98); }
  .send-btn:disabled { background: rgba(59,130,246,0.3); box-shadow: none; cursor: default; }
`

// ─── Hooks ────────────────────────────────────────────────────────────────────


function useDebounce(value, delay) {
  const [dv, setDv] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDv(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return dv
}

// ─── Shared card wrapper ──────────────────────────────────────────────────────

function Card({ children, style }) {
  return (
    <div style={{
      backgroundColor: '#26272d', // peeks through the 1px section gaps as hairline dividers
      width: 300,
      borderRadius: 24,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
      boxShadow: CARD_SHADOW,
      ...style,
    }}>
      {children}
    </div>
  )
}

// ─── Chevron ──────────────────────────────────────────────────────────────────

function Chevron({ open, color }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
      style={{
        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 0.5s cubic-bezier(0.34, 1.52, 0.64, 1)',
        display: 'block',
      }}
    >
      <path d="M4 6L8 10L12 6" stroke={color} strokeWidth="1.6"
        strokeLinecap="round" strokeLinejoin="round"
        style={{ transition: 'stroke 0.2s ease' }}
      />
    </svg>
  )
}

// ─── SubMenuItem ──────────────────────────────────────────────────────────────

function SubMenuItem({ item, visible, delay, isActive, onSelect }) {
  const [hovered, setHovered] = useState(false)
  const hasBeenVisible = useRef(false)
  if (visible) hasBeenVisible.current = true

  const animation = visible
    ? `subItemIn 0.5s cubic-bezier(0.16,1,0.3,1) ${delay}ms both`
    : hasBeenVisible.current
      ? `subItemOut 0.2s cubic-bezier(0.4,0,0.6,1) forwards`
      : 'none'

  return (
    <div
      className="sub-row"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => { e.stopPropagation(); onSelect(item.id) }}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 10px 8px 12px', borderRadius: 10, margin: '1px 0',
        backgroundColor: isActive ? T.accentSoft : hovered ? T.hover : 'transparent',
        transition: 'background-color 0.22s ease',
        opacity: hasBeenVisible.current || visible ? undefined : 0,
        animation,
      }}
    >
      <div style={{
        width: 3, height: 16, borderRadius: 99, backgroundColor: T.accent,
        flexShrink: 0, opacity: isActive ? 1 : 0, transformOrigin: 'center',
        animation: isActive ? 'barIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards' : 'none',
        transition: 'opacity 0.2s ease',
      }} />
      <span style={{
        fontFamily: T.sans, fontSize: 13.5,
        fontWeight: isActive ? 500 : 400,
        color: isActive ? T.accent : hovered ? T.text : T.textMid,
        transition: 'color 0.22s ease', lineHeight: 1, letterSpacing: '-0.01em',
      }}>
        {item.label}
      </span>
    </div>
  )
}

// ─── SubMenu ──────────────────────────────────────────────────────────────────

function SubMenu({ items, isOpen, activeItem, onSelect }) {
  const innerRef = useRef(null)
  const [height, setHeight] = useState(0)
  useEffect(() => {
    if (innerRef.current) setHeight(innerRef.current.scrollHeight)
  }, [items])
  return (
    <div style={{
      overflow: 'hidden',
      maxHeight: isOpen ? height + 4 : 0,
      transition: isOpen
        ? 'max-height 0.55s cubic-bezier(0.16,1,0.3,1)'
        : 'max-height 0.42s cubic-bezier(0.4,0,0.2,1) 0.05s',
    }}>
      <div ref={innerRef} style={{ padding: '4px 0 10px 0' }}>
        {items.map((item, i) => (
          <SubMenuItem key={item.id} item={item}
            visible={isOpen} delay={isOpen ? 60 + i * 42 : 0}
            isActive={activeItem === item.id} onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  )
}

// ─── ContactForm ──────────────────────────────────────────────────────────────

function ContactForm({ isOpen }) {
  const innerRef = useRef(null)
  const [height, setHeight]           = useState(0)
  const [email, setEmail]             = useState('')
  const [message, setMessage]         = useState('')
  const [subject, setSubject]         = useState('')
  const [subjectLoading, setSubjectLoading] = useState(false)
  const [sent, setSent]               = useState(false)
  const [sending, setSending]         = useState(false)
  const debouncedMessage = useDebounce(message, 2000)

  useEffect(() => {
    if (!innerRef.current) return
    const ro = new ResizeObserver(() => setHeight(innerRef.current?.scrollHeight ?? 0))
    ro.observe(innerRef.current)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (!debouncedMessage || debouncedMessage.trim().length < 8) {
      setSubject(''); setSubjectLoading(false); return
    }
    // Local mock of the original AI subject endpoint: derive a subject from
    // the first words of the message after a small "thinking" delay.
    let cancelled = false
    setSubjectLoading(true)
    const t = setTimeout(() => {
      if (cancelled) return
      const words = debouncedMessage.trim().replace(/\s+/g, ' ').split(' ')
      const head = words.slice(0, 6).join(' ').replace(/[.,;:!?]+$/, '')
      const cased = head.charAt(0).toUpperCase() + head.slice(1)
      setSubject(words.length > 6 ? `${cased}\u2026` : cased)
      setSubjectLoading(false)
    }, 900)
    return () => { cancelled = true; clearTimeout(t) }
  }, [debouncedMessage])

  const handleSend = async (e) => {
    e.stopPropagation()
    if (!email || !message || sending) return
    setSending(true)
    await new Promise(r => setTimeout(r, 600))
    setSent(true); setSending(false)
    setTimeout(() => { setSent(false); setEmail(''); setMessage(''); setSubject('') }, 2800)
  }

  const canSend = email.trim().length > 0 && message.trim().length > 0 && !sending && !sent

  return (
    <div style={{
      overflow: 'hidden',
      maxHeight: isOpen ? height + 4 : 0,
      transition: isOpen
        ? 'max-height 0.55s cubic-bezier(0.16,1,0.3,1)'
        : 'max-height 0.38s cubic-bezier(0.4,0,0.6,1)',
    }}>
      <div ref={innerRef} onClick={e => e.stopPropagation()} style={{ padding: '6px 4px 12px' }}>
        {sent ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 6, padding: '20px 0 12px',
            animation: 'sentPop 0.45s cubic-bezier(0.34,1.56,0.64,1) both',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', backgroundColor: T.accentSoft,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M4 9l3.5 3.5L14 6" stroke={T.accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 500, color: T.text }}>Message sent</span>
            <span style={{ fontFamily: T.sans, fontSize: 12, color: T.textLight }}>We'll be in touch soon.</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ animation: 'fadeInUp 0.45s cubic-bezier(0.16,1,0.3,1) 70ms both' }}>
              <label style={{ display: 'block', fontFamily: T.sans, fontSize: 11, fontWeight: 500, color: T.textLight, letterSpacing: '0.02em', marginBottom: 5 }}>From</label>
              <input className="contact-input" type="email" placeholder="your@email.com"
                value={email} onChange={e => setEmail(e.target.value)} onClick={e => e.stopPropagation()} />
            </div>
            <div style={{ animation: 'fadeInUp 0.45s cubic-bezier(0.16,1,0.3,1) 110ms both' }}>
              <label style={{ display: 'block', fontFamily: T.sans, fontSize: 11, fontWeight: 500, color: T.textLight, letterSpacing: '0.02em', marginBottom: 5 }}>Message</label>
              <textarea className="contact-input" rows={4} placeholder="Write your message…"
                value={message} onChange={e => setMessage(e.target.value)} onClick={e => e.stopPropagation()} />
            </div>
            <div style={{ animation: 'fadeInUp 0.45s cubic-bezier(0.16,1,0.3,1) 150ms both' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 10, backgroundColor: T.hover, minHeight: 34 }}>
                <span style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 500, color: T.textLight, letterSpacing: '0.02em', flexShrink: 0 }}>Subject</span>
                <div style={{ width: 1, height: 12, backgroundColor: T.border, flexShrink: 0 }} />
                {subjectLoading ? (
                  <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: T.textLight, animation: `pulse 1.1s ease-in-out ${i * 160}ms infinite` }} />
                    ))}
                  </div>
                ) : subject ? (
                  <span style={{ fontFamily: T.sans, fontSize: 12.5, fontWeight: 500, color: T.accent, letterSpacing: '-0.01em', animation: 'fadeInUp 0.35s cubic-bezier(0.16,1,0.3,1) both' }}>{subject}</span>
                ) : (
                  <span style={{ fontFamily: T.sans, fontSize: 12, color: T.textLight, fontStyle: 'italic' }}>Generated from message…</span>
                )}
              </div>
            </div>
            <div style={{ animation: 'fadeInUp 0.45s cubic-bezier(0.16,1,0.3,1) 190ms both' }}>
              <button className="send-btn" disabled={!canSend} onClick={handleSend}>
                {sending ? 'Sending…' : 'Send Message'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── MenuItem ─────────────────────────────────────────────────────────────────

function MenuItem({ item, isOpen, hasActiveChild, activeSubItem, onToggle, onSubItemSelect }) {
  const [hovered, setHovered] = useState(false)
  const hasChildren  = item.children.length > 0
  const isExpandable = hasChildren || item.form
  const isEngaged    = isOpen || hasActiveChild

  return (
    <div style={{ marginBottom: 2 }}>
      <div className="nav-row"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => onToggle(item.id)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 12px', borderRadius: 12,
          backgroundColor: isOpen ? T.accentSoft : hovered ? T.hover : 'transparent',
          transition: 'background-color 0.25s ease',
        }}
      >
        <span style={{
          fontFamily: T.sans, fontSize: 15, fontWeight: isEngaged ? 600 : 500,
          letterSpacing: '-0.02em',
          color: isEngaged ? T.text : hovered ? T.text : '#b6bac2',
          flex: 1, lineHeight: 1.2, transition: 'color 0.22s ease',
        }}>
          {item.label}
        </span>
        {isExpandable && (
          <div style={{
            width: 24, height: 24, borderRadius: 8,
            backgroundColor: isOpen ? 'rgba(59,130,246,0.16)' : hovered ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.045)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'background-color 0.25s ease',
          }}>
            <Chevron open={isOpen} color={isOpen ? T.accent : T.textLight} />
          </div>
        )}
      </div>

      {hasChildren && (
        <SubMenu items={item.children} isOpen={isOpen}
          activeItem={activeSubItem} onSelect={onSubItemSelect} />
      )}
      {item.form && (
        <div style={{ paddingLeft: 8, paddingRight: 4 }}>
          <ContactForm isOpen={isOpen} />
        </div>
      )}
    </div>
  )
}

// ─── ContentPanel ─────────────────────────────────────────────────────────────

function ContentPanel({ itemId }) {
  const content = CONTENT_MAP[itemId]
  if (!content) return null

  return (
    <Card>
      {/* Eyebrow header */}
      <div style={{ backgroundColor: T.card, padding: '20px 16px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 500, color: T.textLight, letterSpacing: '0.02em' }}>
            {content.eyebrow}
          </span>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M3 2l3 3-3 3" stroke={T.textLight} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 500, color: T.textMid, letterSpacing: '0.02em' }}>
            {content.heading}
          </span>
        </div>
      </div>

      {/* Body */}
      <div style={{ backgroundColor: T.card, padding: '20px 16px 20px' }}>
        <div key={itemId} style={{ animation: 'contentIn 0.4s cubic-bezier(0.16,1,0.3,1) both' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 style={{
            fontFamily: T.sans, fontSize: 20, fontWeight: 600,
            letterSpacing: '-0.03em', color: T.text, lineHeight: 1.15,
          }}>
            {content.heading}
          </h2>
          <content.Icon
            size={20}
            animate={true}
            loop={true}
            loopDelay={800}
            style={{ color: T.textMid, display: 'block', flexShrink: 0 }}
          />
        </div>
        <p style={{
          fontFamily: T.sans, fontSize: 13, fontWeight: 400,
          color: T.textMid, lineHeight: 1.65, letterSpacing: '-0.005em',
        }}>
          {content.body}
        </p>
        </div>
      </div>

    </Card>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

const NAV_WIDTH     = 300
const CONTENT_WIDTH = 300
const PANEL_GAP     = 20
const STAGE_WIDTH   = NAV_WIDTH + PANEL_GAP + CONTENT_WIDTH   // 620
const NAV_OFFSET    = (STAGE_WIDTH - NAV_WIDTH) / 2           // 160 — centers nav when alone

function NavCard({ openId, activeId, onToggle, onSubItemSelect }) {
  return (
    <Card>
      {/* Header */}
      <div style={{ backgroundColor: T.card, padding: '20px 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 600, letterSpacing: '-0.02em', color: T.text }}>Dormant Studio</span>
        </div>
      </div>

      {/* Items */}
      <div style={{ backgroundColor: T.card, padding: '8px 12px 12px' }}>
        {MENU_ITEMS.map(item => (
          <MenuItem key={item.id} item={item}
            isOpen={openId === item.id}
            hasActiveChild={item.children.some(c => c.id === activeId)}
            activeSubItem={activeId}
            onToggle={onToggle}
            onSubItemSelect={onSubItemSelect}
          />
        ))}
      </div>
    </Card>
  )
}

// ─── Tile micro-moment: the nav card demoing itself ──────────────────────────
// Auto-cycles through the sections (open → staggered sub-items → highlight one
// → next section). Non-interactive; scaled to sit inside the Playground tile.

const TILE_SEQUENCE = ['studio', 'work', 'services', 'journal']

function AnimatedMenuTile() {
  const [step, setStep] = useState(0)
  const [activeChild, setActiveChild] = useState(null)
  const openId = TILE_SEQUENCE[step % TILE_SEQUENCE.length]

  useEffect(() => {
    // highlight a sub-item mid-dwell, then advance to the next section
    const item = MENU_ITEMS.find(m => m.id === openId)
    const child = item?.children[1] ?? item?.children[0]
    const hl = setTimeout(() => setActiveChild(child?.id ?? null), 1300)
    const next = setTimeout(() => {
      setActiveChild(null)
      setStep(s => s + 1)
    }, 3200)
    return () => { clearTimeout(hl); clearTimeout(next) }
  }, [openId])

  return (
    <div aria-hidden="true" inert style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
      paddingRight: 36, // card rides right so the tile label owns the bottom-left
      pointerEvents: 'none', borderRadius: 'inherit',
    }}>
      <style>{GLOBAL_CSS}</style>
      <div style={{ transform: 'scale(0.52)', transformOrigin: 'top right', paddingTop: 18 }}>
        <NavCard openId={openId} activeId={activeChild} onToggle={() => {}} onSubItemSelect={() => {}} />
      </div>
    </div>
  )
}

export default function AnimatedMenu({ variant = 'full' }) {
  const [openId, setOpenId]           = useState(null)
  const [activeId, setActiveId]       = useState(null)
  const [displayedId, setDisplayedId] = useState(null)
  const shimmerRef = useRef(null)

  // Keep the content panel populated with the last-selected item
  // so it remains visible during the exit animation
  useEffect(() => {
    if (activeId) setDisplayedId(activeId)
  }, [activeId])

  const handleToggle    = useCallback((id) => setOpenId(prev => prev === id ? null : id), [])
  const handleSubSelect = useCallback((id) => setActiveId(prev => prev === id ? null : id), [])

  const activeLabel = MENU_ITEMS
    .flatMap(m => m.children)
    .find(c => c.id === activeId)?.label

  const isContentVisible = !!activeId

  if (variant === 'tile') return <AnimatedMenuTile />

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      {/* Fixed-width stage — body centers this */}
      <div style={{ position: 'relative', width: STAGE_WIDTH }}>

        {/* ── Nav card — shifts left when content is shown ── */}
        <div
          ref={shimmerRef}
          style={{
            width: NAV_WIDTH,
            position: 'relative',
            transform: isContentVisible ? 'translateX(0)' : `translateX(${NAV_OFFSET}px)`,
            transition: isContentVisible
              ? 'transform 0.55s cubic-bezier(0.16,1,0.3,1)'
              : 'transform 0.55s cubic-bezier(0.16,1,0.3,1) 0.18s',
          }}
        >
          <NavCard openId={openId} activeId={activeId} onToggle={handleToggle} onSubItemSelect={handleSubSelect} />
        </div>

        {/* ── Content panel — absolutely positioned, never in flow ── */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: NAV_WIDTH + PANEL_GAP,
          width: CONTENT_WIDTH,
          opacity:    isContentVisible ? 1 : 0,
          transform:  isContentVisible ? 'translateY(0) scale(1)' : 'translateY(22px) scale(0.97)',
          pointerEvents: isContentVisible ? 'auto' : 'none',
          transition: isContentVisible
            ? 'opacity 0.42s ease 0.07s, transform 0.52s cubic-bezier(0.16,1,0.3,1) 0.07s'
            : 'opacity 0.18s ease, transform 0.18s ease',
        }}>
          <ContentPanel itemId={displayedId} />
        </div>

      </div>
    </>
  )
}
