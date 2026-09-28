import { Reveal, RevealGroup, RevealItem } from './Reveal'

const LINES = [
  { text: "I don't just run campaigns.", accent: false },
  { text: 'I build brands that connect.', accent: true },
  { text: "I don't just use AI tools.", accent: false },
  { text: 'I build my own.', accent: true },
  { text: "I'm not chasing a job title.", accent: false },
  { text: "I'm building things that matter.", accent: true },
]

export default function Vision() {
  return (
    <section
      id="vision"
      aria-labelledby="vision-heading"
      className="section section-glow-center overflow-hidden bg-bg"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 55% 48% at 50% 50%, rgba(214, 46, 74, 0.14), transparent)',
        }}
      />

      <div className="shell relative z-10">
        <div className="shell-inner">
          <Reveal>
            <h2 id="vision-heading" className="eyebrow mb-10 md:mb-14">
              My Vision
            </h2>
          </Reveal>

          <RevealGroup className="flex flex-col gap-5 md:gap-6" stagger={0.08}>
            {LINES.map((line) => (
              <RevealItem key={line.text}>
                <p
                  className={
                    line.accent
                      ? 'text-3xl font-extrabold leading-[1.05] tracking-[-0.03em] text-text-primary md:text-5xl lg:text-6xl'
                      : 'text-2xl font-medium leading-[1.15] tracking-[-0.02em] text-muted md:text-4xl lg:text-5xl'
                  }
                >
                  {line.text}
                </p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>
    </section>
  )
}
