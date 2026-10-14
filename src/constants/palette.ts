export const COLD_PALETTE = {
  // Canvas & surface neutrals
  dark: {
    bg: '#121518', // Grafite profundo
    surface: '#1A2026', // Cinza-ardósia suave
    surfaceSubtle: '#222A33',
    border: '#2C3642',
    borderSubtle: '#384656',
    textPrimary: '#F4F6F8', // Branco-gelo
    textSecondary: '#94A3B8', // Cinza azulado claro
    textMuted: '#64748B',
  },
  light: {
    bg: '#F4F6F8', // Branco-gelo
    surface: '#FFFFFF',
    surfaceSubtle: '#EAEFF4',
    border: '#D5DFE8',
    borderSubtle: '#C2D0DC',
    textPrimary: '#121518',
    textSecondary: '#475569',
    textMuted: '#64748B',
  },
  // Breath of contrast section (light breathing block in dark mode or inverted in light mode)
  contrastBlock: {
    bg: '#EBF0F5',
    text: '#121518',
    subtext: '#475569',
    border: '#CBD5E1',
    card: '#FFFFFF',
  },
  // Accent color (petróleo frio)
  accent: {
    base: '#0E7490', // Cyan-700 / Petróleo
    hover: '#0891B2', // Cyan-600
    subtle: '#164E63',
    light: '#E0F2FE',
  },
  // Cold, desaturated harmonic discipline palette
  subjectColors: [
    { name: 'Azul Ardósia', hex: '#4A7A96' },
    { name: 'Cinza Azulado', hex: '#5F738A' },
    { name: 'Sálvia Apagada', hex: '#4E7A74' },
    { name: 'Lavanda Fria', hex: '#6B6D8F' },
    { name: 'Índigo Frio', hex: '#465682' },
    { name: 'Chumbo Frio', hex: '#526071' },
    { name: 'Cerúleo Suave', hex: '#3B799E' },
    { name: 'Menta Fria', hex: '#4B7A6E' },
    { name: 'Gelo Petróleo', hex: '#336B73' },
    { name: 'Cinza Tempestade', hex: '#626B73' },
  ],
};

export const DEFAULT_SUBJECTS = [
  {
    id: 'subj-1',
    name: 'Engenharia de Software',
    color: '#4A7A96',
    createdAt: Date.now() - 30 * 86400000,
  },
  {
    id: 'subj-2',
    name: 'Estruturas de Dados',
    color: '#4E7A74',
    createdAt: Date.now() - 30 * 86400000,
  },
  {
    id: 'subj-3',
    name: 'Sistemas Distribuídos',
    color: '#6B6D8F',
    createdAt: Date.now() - 25 * 86400000,
  },
  {
    id: 'subj-4',
    name: 'Design de Interfaces',
    color: '#3B799E',
    createdAt: Date.now() - 20 * 86400000,
  },
  {
    id: 'subj-5',
    name: 'Matemática Discreta',
    color: '#5F738A',
    createdAt: Date.now() - 15 * 86400000,
  },
];
