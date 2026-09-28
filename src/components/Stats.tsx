import { RevealGroup, RevealItem } from './Reveal'
import { STATS } from '../data'

export default function Stats() {
  return (
    <section id="stats" className="section bg-bg">
      <div className="shell">
        <div className="shell-inner">
          <RevealGroup
            className="grid grid-cols-1 gap-10 border-y border-stroke py-14 sm:grid-cols-3 sm:gap-6 md:py-16"
            stagger={0.1}
          >
            {STATS.map((stat) => (
              <RevealItem key={stat.label}>
                <div className="flex flex-col items-start gap-3 sm:items-center sm:text-center">
                  <span className="text-5xl font-extrabold leading-none tracking-[-0.04em] text-text-primary md:text-6xl lg:text-7xl">
                    {stat.value}
                  </span>
                  <span className="text-xs uppercase tracking-[0.25em] text-muted">
                    {stat.label}
                  </span>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>
    </section>
  )
}