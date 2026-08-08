/* The "Words" tab: a short bio, then Aaron's design-philosophy blurb.
   One narrow, left-aligned column centered on the page. */
export default function Learnings() {
  return (
    <section className="notes">
      <div className="notes-col">
        <p>
          I&rsquo;m a product designer based in Toronto. I currently work at
          Anchorage Digital (your bank&rsquo;s bank for digital assets).
        </p>
        <p>
          In my first year I founded the data visualization library, designed two
          new business lines - collateral management and escrow accounts. I was
          the largest contributor to our research repository. I ran workshops on
          agentic workflows, enabling the design team to grow into the agentic
          era of design. And I unified 20 fractured operation experiences
          including settle, swap, and stake into one simplified reusable
          component set that lives in Storybook.
        </p>
        <p>
          Here&rsquo;s some things I believe in: interview users and subject
          matter experts, map out what you find, socialize it, and when you work
          on the interface, put as much care into it as any other part of the
          process.
        </p>
        <p>
          The interface is not an afterthought. It is the pure distillation of
          everything you&rsquo;ve learned about the project. It is the language the
          user understands. It is an opportunity: to lead users to their
          destination, to connect with them, to empower them.
        </p>
        <p className="notes-sign">Rigatoni Ron</p>
      </div>
    </section>
  )
}
