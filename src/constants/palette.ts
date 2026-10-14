export const PUNK_PALETTE = {
  // Canvas & surfaces
  dark: {
    bg: '#0B0C0E', // Preto-tinta
    surface: '#15181D', // Grafite colagem
    surfaceSubtle: '#1F242C',
    border: '#333A44',
    borderHard: '#000000',
    textPrimary: '#F5F2EB', // Off-white xerox
    textSecondary: '#A2A9B5',
    textMuted: '#68707E',
  },
  light: {
    bg: '#F3EFE6', // Papel xerox amarelado
    surface: '#FFFFFF',
    surfaceSubtle: '#EAE4D6',
    border: '#111317', // Tinta preta pura
    borderHard: '#000000',
    textPrimary: '#111317', // Tinta preta fotocópia
    textSecondary: '#3C424C',
    textMuted: '#666F7D',
  },
  // Main punch accent: Vermelho-tinta
  accent: {
    base: '#DC2626', // Vermelho-tinta silk-screen
    hover: '#B91C1C',
    bright: '#EF4444',
    tape: 'rgba(245, 235, 205, 0.78)',
  },
  // Muted screenprint discipline colors (alto contraste entre si, sem neon)
  subjectColors: [
    { name: 'Vermelho Cartaz', hex: '#DC2626' },
    { name: 'Azul-Aço', hex: '#2563EB' },
    { name: 'Mostarda Impressa', hex: '#D97706' },
    { name: 'Verde-Oliva', hex: '#4D7C0F' },
    { name: 'Ciano-Sujo', hex: '#0E7490' },
    { name: 'Magenta Zine', hex: '#BE185D' },
    { name: 'Ferrugem', hex: '#C2410C' },
    { name: 'Roxo Stencil', hex: '#6D28D9' },
    { name: 'Chumbo Prensa', hex: '#475569' },
  ],
};

export const DEFAULT_SUBJECTS = [
  {
    id: 'subj-1',
    name: 'Engenharia de Software',
    color: '#DC2626', // Vermelho-tinta
    createdAt: Date.now() - 30 * 86400000,
  },
  {
    id: 'subj-2',
    name: 'Estruturas de Dados',
    color: '#2563EB', // Azul-aço
    createdAt: Date.now() - 30 * 86400000,
  },
  {
    id: 'subj-3',
    name: 'Sistemas Distribuídos',
    color: '#D97706', // Mostarda
    createdAt: Date.now() - 25 * 86400000,
  },
  {
    id: 'subj-4',
    name: 'Design Gráfico & UI',
    color: '#0E7490', // Ciano-sujo
    createdAt: Date.now() - 20 * 86400000,
  },
  {
    id: 'subj-5',
    name: 'Teoria da Computação',
    color: '#4D7C0F', // Verde-oliva
    createdAt: Date.now() - 15 * 86400000,
  },
];
