/* The "Notes" tab: Aaron's design-philosophy blurb.
   One narrow, left-aligned column centered on the page. */
export default function Learnings() {
  return (
    <section className="notes">
      <div className="notes-col">
        <p>
          Here&rsquo;s some things that work: interviewing users and subject
          matter experts,
          mapping out what you find, socializing what you find, and when you
          get to the interface, put as much effort into it as any other part of
          the process.
        </p>
        <p>
          The interface is not an afterthought. It is the pure distillation of
          everything you&rsquo;ve learned about the project. It is the language the
          user understands. It is an opportunity: to lead users to their
          destination, to tell them a story, to connect with them, to help them,
          to empower them.
        </p>
        <p className="notes-sign">Rigatoni Ron</p>
      </div>
    </section>
  )
}
