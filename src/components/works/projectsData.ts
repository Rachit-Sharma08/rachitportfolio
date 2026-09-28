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
    accentFrom: '#3f0d19',
    accentTo: '#d62e4a',
    slug: 'fitness-website',
    repoUrl: 'https://github.com/digitalguru99908-dev/Fitness-website',
  },
  {
    id: 'neon-racer',
    title: 'Neon Car Racing',
    tag: 'Web · Game',
    accentFrom: '#2b0810',
    accentTo: '#a11f3c',
    slug: 'neon-car-racing',
    repoUrl: 'https://github.com/digitalguru99908-dev/neon-car-racing-game-',
  },
  {
    id: 'upcoming-game',
    title: 'Upcoming Game',
    tag: 'Coming Soon',
    accentFrom: '#1a080c',
    accentTo: '#3d1620',
    slug: 'upcoming-game',
  },
  {
    id: 'video-reel',
    title: 'Video Edit Reel',
    tag: 'Creative · Editing',
    accentFrom: '#4a1013',
    accentTo: '#e0574a',
    slug: 'video-edit-reel',
  },
]
