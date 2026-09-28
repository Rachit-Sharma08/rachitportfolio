import {
  Bot,
  MessageCircle,
  Volume2,
  Waves,
  Sparkles,
  BrainCircuit,
  BarChart3,
  Megaphone,
  Zap,

  GraduationCap,
} from 'lucide-react'
import RevealHeading from './RevealHeading'
import { Reveal, RevealGroup, RevealItem } from './Reveal'

const TOOLS = [
  { icon: Bot, label: 'OpenCode', sub: 'Coding Agent' },
  { icon: MessageCircle, label: 'OpenAI GPT', sub: 'AI Assistant' },
  { icon: Volume2, label: 'ElevenLabs', sub: 'Voice AI' },
  { icon: Waves, label: 'Cartesia AI', sub: 'Voice Engine' },
  { icon: Sparkles, label: 'Claude', sub: 'Anthropic AI' },
]

const SKILLS = [
  { icon: BrainCircuit, label: '25+ AI Tools' },
  { icon: BarChart3, label: 'Digital Marketing' },
  { icon: Megaphone, label: 'AI-Powered Campaigns' },
  { icon: Zap, label: 'Real Projects, Real Impact' },
  { icon: GraduationCap, label: 'Learning Every Day' },
]

export default function Capabilities() {
  return (
    <section id="capabilities" className="section section-glow-right bg-bg" aria-labelledby="capabilities-heading">
      <div className="shell">
        <div className="shell-inner">
        <RevealHeading
          as="h2"
          id="capabilities-heading"
          segments={[{ text: 'My ' }, { text: 'Capabilities', italic: true }]}
          className="mb-14 text-4xl font-extrabold leading-[0.95] tracking-[-0.03em] text-text-primary sm:text-5xl md:mb-20 md:text-6xl lg:text-7xl"
          delay={0.1}
        />

        <div className="space-y-12">
          <div>
            <Reveal>
              <p className="mb-6 text-xs uppercase tracking-[0.3em] text-muted">
                Tools I use
              </p>
            </Reveal>
            <RevealGroup className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5" stagger={0.06}>
              {TOOLS.map((item) => (
                <RevealItem key={item.label} className="h-full">
                  <div className="glass lift group flex h-full flex-col items-center gap-3 p-5 text-center">
                    <item.icon
                      size={24}
                      strokeWidth={1.4}
                      className="text-accent-ink transition-colors duration-500 group-hover:text-accent"
                    />
                    <div>
                      <span className="block text-sm text-text-primary">
                        {item.label}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted">
                        {item.sub}
                      </span>
                    </div>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>

          <div>
            <Reveal>
              <p className="mb-6 text-xs uppercase tracking-[0.3em] text-muted">
                What I bring
              </p>
            </Reveal>
            <RevealGroup className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5" stagger={0.06}>
              {SKILLS.map((item) => (
                <RevealItem key={item.label} className="h-full">
                  <div className="glass lift group flex h-full flex-col items-center gap-3 p-5 text-center">
                    <item.icon
                      size={24}
                      strokeWidth={1.4}
                      className="text-accent-ink transition-colors duration-500 group-hover:text-accent"
                    />
                    <span className="text-sm text-text-primary">{item.label}</span>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </div>
        </div>
      </div>
    </section>
  )
}
