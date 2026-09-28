/**
 * Skybound Spring — localized strings for the Graphics settings section.
 * The rest of the game is English-only; this panel follows navigator.language.
 */

const EN = {
  graphics: 'Graphics',
  quality: 'Quality',
  auto: 'Auto (detected: {tier})',
  low: 'Low', balanced: 'Balanced', high: 'High', ultra: 'Ultra',
  renderScale: 'Render scale',
  fromPreset: 'From preset ({tier})',
  adaptive: 'Adaptive resolution',
  showFps: 'Show frame rate',
  postFailed: 'Post-processing is unavailable on this device; the game renders without it.',
  cat: {
    shadows: 'Shadows', bloom: 'Bloom', grade: 'Color grade & vignette', antialias: 'Anti-aliasing',
    reflections: 'Reflections', particles: 'Particles', background: 'Sky animation', detail: 'Surface detail',
  },
  tier: {
    off: 'Off', on: 'On', low: 'Low', medium: 'Medium', high: 'High',
    fxaa: 'FXAA', smaa: 'SMAA', msaa: 'MSAA', static: 'Static', animated: 'Animated',
    plain: 'Plain', detailed: 'Detailed',
  },
  sum: { noShadows: 'no shadows', shadows: 'shadows', bloom: 'bloom', grade: 'grade', reflections: 'reflections', noAA: 'no AA' },
};

const GB = { ...EN, cat: { ...EN.cat, grade: 'Colour grade & vignette' } };

const ES = {
  graphics: 'Gráficos',
  quality: 'Calidad',
  auto: 'Automática (detectada: {tier})',
  low: 'Baja', balanced: 'Equilibrada', high: 'Alta', ultra: 'Ultra',
  renderScale: 'Escala de renderizado',
  fromPreset: 'Según el ajuste ({tier})',
  adaptive: 'Resolución adaptativa',
  showFps: 'Mostrar fotogramas por segundo',
  postFailed: 'El posprocesado no está disponible en este dispositivo; el juego se muestra sin él.',
  cat: {
    shadows: 'Sombras', bloom: 'Resplandor', grade: 'Corrección de color y viñeta', antialias: 'Antialiasing',
    reflections: 'Reflejos', particles: 'Partículas', background: 'Animación del cielo', detail: 'Detalle de superficies',
  },
  tier: {
    off: 'No', on: 'Sí', low: 'Baja', medium: 'Media', high: 'Alta',
    fxaa: 'FXAA', smaa: 'SMAA', msaa: 'MSAA', static: 'Estático', animated: 'Animado',
    plain: 'Simple', detailed: 'Detallado',
  },
  sum: { noShadows: 'sin sombras', shadows: 'sombras', bloom: 'resplandor', grade: 'color', reflections: 'reflejos', noAA: 'sin AA' },
};

const ES_419 = { ...ES, auto: 'Automática (detectada: {tier})', postFailed: 'El posprocesamiento no está disponible en este dispositivo; el juego se muestra sin él.' };

const DE = {
  graphics: 'Grafik',
  quality: 'Qualität',
  auto: 'Automatisch (erkannt: {tier})',
  low: 'Niedrig', balanced: 'Ausgewogen', high: 'Hoch', ultra: 'Ultra',
  renderScale: 'Renderskalierung',
  fromPreset: 'Aus Voreinstellung ({tier})',
  adaptive: 'Adaptive Auflösung',
  showFps: 'Bildrate anzeigen',
  postFailed: 'Nachbearbeitung ist auf diesem Gerät nicht verfügbar; das Spiel wird ohne sie dargestellt.',
  cat: {
    shadows: 'Schatten', bloom: 'Leuchteffekt', grade: 'Farbkorrektur & Vignette', antialias: 'Kantenglättung',
    reflections: 'Spiegelungen', particles: 'Partikel', background: 'Himmelsanimation', detail: 'Oberflächendetails',
  },
  tier: {
    off: 'Aus', on: 'An', low: 'Niedrig', medium: 'Mittel', high: 'Hoch',
    fxaa: 'FXAA', smaa: 'SMAA', msaa: 'MSAA', static: 'Statisch', animated: 'Animiert',
    plain: 'Einfach', detailed: 'Detailliert',
  },
  sum: { noShadows: 'keine Schatten', shadows: 'Schatten', bloom: 'Leuchten', grade: 'Farbkorrektur', reflections: 'Spiegelungen', noAA: 'keine Glättung' },
};

const FR = {
  graphics: 'Graphismes',
  quality: 'Qualité',
  auto: 'Automatique (détectée : {tier})',
  low: 'Basse', balanced: 'Équilibrée', high: 'Haute', ultra: 'Ultra',
  renderScale: 'Échelle de rendu',
  fromPreset: 'Selon le préréglage ({tier})',
  adaptive: 'Résolution adaptative',
  showFps: 'Afficher les images par seconde',
  postFailed: 'Le post-traitement n’est pas disponible sur cet appareil ; le jeu s’affiche sans.',
  cat: {
    shadows: 'Ombres', bloom: 'Halo lumineux', grade: 'Étalonnage et vignette', antialias: 'Anticrénelage',
    reflections: 'Reflets', particles: 'Particules', background: 'Animation du ciel', detail: 'Détail des surfaces',
  },
  tier: {
    off: 'Désactivé', on: 'Activé', low: 'Bas', medium: 'Moyen', high: 'Élevé',
    fxaa: 'FXAA', smaa: 'SMAA', msaa: 'MSAA', static: 'Statique', animated: 'Animé',
    plain: 'Simple', detailed: 'Détaillé',
  },
  sum: { noShadows: 'sans ombres', shadows: 'ombres', bloom: 'halo', grade: 'étalonnage', reflections: 'reflets', noAA: 'sans anticrénelage' },
};

const FR_CA = { ...FR, showFps: 'Afficher la fréquence d’images', auto: 'Automatique (détectée : {tier})' };

const PT_BR = {
  graphics: 'Gráficos',
  quality: 'Qualidade',
  auto: 'Automática (detectada: {tier})',
  low: 'Baixa', balanced: 'Equilibrada', high: 'Alta', ultra: 'Ultra',
  renderScale: 'Escala de renderização',
  fromPreset: 'Do predefinido ({tier})',
  adaptive: 'Resolução adaptativa',
  showFps: 'Mostrar taxa de quadros',
  postFailed: 'O pós-processamento não está disponível neste dispositivo; o jogo é exibido sem ele.',
  cat: {
    shadows: 'Sombras', bloom: 'Brilho', grade: 'Correção de cor e vinheta', antialias: 'Suavização',
    reflections: 'Reflexos', particles: 'Partículas', background: 'Animação do céu', detail: 'Detalhe das superfícies',
  },
  tier: {
    off: 'Desligado', on: 'Ligado', low: 'Baixo', medium: 'Médio', high: 'Alto',
    fxaa: 'FXAA', smaa: 'SMAA', msaa: 'MSAA', static: 'Estático', animated: 'Animado',
    plain: 'Simples', detailed: 'Detalhado',
  },
  sum: { noShadows: 'sem sombras', shadows: 'sombras', bloom: 'brilho', grade: 'cor', reflections: 'reflexos', noAA: 'sem suavização' },
};

const IT = {
  graphics: 'Grafica',
  quality: 'Qualità',
  auto: 'Automatica (rilevata: {tier})',
  low: 'Bassa', balanced: 'Bilanciata', high: 'Alta', ultra: 'Ultra',
  renderScale: 'Scala di rendering',
  fromPreset: 'Dal preset ({tier})',
  adaptive: 'Risoluzione adattiva',
  showFps: 'Mostra frequenza fotogrammi',
  postFailed: 'La post-elaborazione non è disponibile su questo dispositivo; il gioco viene mostrato senza.',
  cat: {
    shadows: 'Ombre', bloom: 'Bagliore', grade: 'Correzione colore e vignettatura', antialias: 'Antialiasing',
    reflections: 'Riflessi', particles: 'Particelle', background: 'Animazione del cielo', detail: 'Dettaglio superfici',
  },
  tier: {
    off: 'No', on: 'Sì', low: 'Basso', medium: 'Medio', high: 'Alto',
    fxaa: 'FXAA', smaa: 'SMAA', msaa: 'MSAA', static: 'Statico', animated: 'Animato',
    plain: 'Semplice', detailed: 'Dettagliato',
  },
  sum: { noShadows: 'senza ombre', shadows: 'ombre', bloom: 'bagliore', grade: 'colore', reflections: 'riflessi', noAA: 'senza AA' },
};

export const GFX_STRINGS = {
  'en-US': EN, 'en-GB': GB, 'es-419': ES_419, 'es-ES': ES, 'de-DE': DE,
  'fr-FR': FR, 'fr-CA': FR_CA, 'pt-BR': PT_BR, 'it-IT': IT,
};

/** Pick the closest supported locale for a BCP-47 tag (e.g. "es-MX" → es-419). */
export function pickLocale(tag) {
  const t = String(tag || 'en-US');
  if (GFX_STRINGS[t]) return t;
  const [lang, region] = t.split('-');
  if (lang === 'en') return ['GB', 'IE', 'AU', 'NZ', 'IN', 'ZA'].includes(region) ? 'en-GB' : 'en-US';
  if (lang === 'es') return region === 'ES' ? 'es-ES' : 'es-419';
  if (lang === 'fr') return region === 'CA' ? 'fr-CA' : 'fr-FR';
  if (lang === 'pt') return 'pt-BR';
  if (lang === 'de') return 'de-DE';
  if (lang === 'it') return 'it-IT';
  return 'en-US';
}

export function gfxStrings(tag) {
  return GFX_STRINGS[pickLocale(tag)];
}
