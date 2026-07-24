/* The "Notes" tab: Aaron's design-philosophy blurb.
   One narrow, left-aligned column centered on the page. */
export default function Learnings() {
  return (
    <section className="notes">
      <div className="notes-col">
        <p>
          Design is a lot of things to a lot of people, and everyone has strong
          opinions on what it is and how the process should work. I interview
          users and subject matter experts. I map out what I find. I tell people
          what I
          find. And when I get to the UI, I put as much effort into it as any
          other part of the process.
        </p>
        <p>
          The UI is not an afterthought. It is the pure distillation of
          everything I&rsquo;ve learned about the project. It is the language the
          user understands. It is an opportunity: to lead users to their
          destination, to tell them a story, to connect with them, to help them,
          to empower them.
        </p>
        <p className="notes-sign">Rigatoni Ron</p>
      </div>
    </section>
  )
}
