export const PANEL_SPACING = 8
export const PANEL_COUNT = 4

export interface WorkProject {
  id: string
  title: string
  tag: string
  accentFrom: string
  accentTo: string
  slug: string
  repoUrl?: string
}

export const WORK_PROJECTS: WorkProject[] = [
  {
    id: 'fitness',
    title: 'Fitness Website',
    tag: 'Web · Fitness',
    accentFrom: '#4E85BF',
    accentTo: '#89AACC',
    slug: 'fitness-website',
    repoUrl: 'https://github.com/digitalguru99908-dev/Fitness-website',
  },
  {
    id: 'neon-racer',
    title: 'Neon Car Racing',
    tag: 'Web · Game',
    accentFrom: '#D946EF',
    accentTo: '#8B2FC9',
    slug: 'neon-car-racing',
    repoUrl: 'https://github.com/digitalguru99908-dev/neon-car-racing-game-',
  },
  {
    id: 'upcoming-game',
    title: 'Upcoming Game',
    tag: 'Coming Soon',
    accentFrom: '#3A3F4B',
    accentTo: '#5C6370',
    slug: 'upcoming-game',
  },
  {
    id: 'video-reel',
    title: 'Video Edit Reel',
    tag: 'Creative · Editing',
    accentFrom: '#4E85BF',
    accentTo: '#2F6FA3',
    slug: 'video-edit-reel',
  },
]