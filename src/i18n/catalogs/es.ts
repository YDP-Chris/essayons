import type { StringCatalog } from '../types.ts'

export const es: StringCatalog = {
  nav: {
    backToLabs: 'Volver a los laboratorios',
    restartTutorial: 'Reiniciar tutorial',
    mainNavigation: 'Navegación principal',
    skipToContent: 'Saltar al contenido',
    episodes: 'Episodios',
    teach: 'Panel del profesor',
    openMenu: 'Abrir menú',
    closeMenu: 'Cerrar menú',
    home: 'Inicio',
    siteHeader: 'Encabezado del sitio',
  },
  hero: {
    headline: 'Aprende estrellando cosas.',
    subheading:
      'Simulaciones interactivas que enseñan física, civismo, economía, historia y más — a través de la exploración práctica.',
    cta: 'Comienza a explorar',
  },
  episodes: {
    chooseYourLab: 'Elige tu laboratorio.',
    comingSoon: 'Próximamente',
    orbitLab: {
      name: 'Laboratorio Orbital',
      hook: 'Estrella satélites contra la Tierra hasta entender la gravedad.',
    },
    citizenLab: {
      name: 'Laboratorio Cívico',
      hook: 'Dirige una democracia. Mira qué se rompe.',
    },
    marketLab: {
      name: 'Laboratorio de Mercados',
      hook: 'Mira cómo la oferta y la demanda se encuentran. Colapsa mercados.',
    },
    timelineLab: {
      name: 'Laboratorio de Línea Temporal',
      hook: 'Derrumba imperios. Reescribe la historia.',
    },
    waveLab: {
      name: 'Laboratorio de Ondas',
      hook: 'Pulsa cuerdas. Observa la resonancia. Siente la física.',
    },
    geneLab: {
      name: 'Laboratorio Genético',
      hook: 'Cría generaciones. Observa cómo emergen los rasgos.',
    },
    bridgeLab: {
      name: 'Laboratorio de Puentes',
      hook: 'Construye estructuras. Aplica cargas. Míralas fallar.',
    },
    circuitLab: {
      name: 'Laboratorio de Circuitos',
      hook: 'Construye circuitos. Aplica voltaje. Ve fluir electrones.',
    },
  },
  domains: {
    physics: 'Física',
    civics: 'Civismo',
    economics: 'Economía',
    history: 'Historia',
    biology: 'Biología',
    engineering: 'Ingeniería',
  },
  valueProps: {
    whyEssayons: '¿Por qué Essayons?',
    realComputation: {
      title: 'Computación real',
      description:
        'Cada simulación ejecuta modelos reales. Gravedad, elecciones, mercados — calculados en vivo, no animaciones pregrabadas.',
    },
    zeroFriction: {
      title: 'Cero fricción',
      description:
        'Sin cuentas, sin instalaciones, sin esperas. Haz clic en un enlace y empieza a aprender en segundos.',
    },
    anyDomain: {
      title: 'Cualquier disciplina',
      description:
        'Física hoy, civismo mañana. Una plataforma, muchas disciplinas — todo a través de la exploración práctica.',
    },
  },
  teacher: {
    forEducators: 'Para educadores',
    description:
      'Comparte un enlace y tus estudiantes estarán aprendiendo. Sin configuración, sin cuentas, sin solicitudes de TI. Essayons es gratis e instantáneo.',
    instantDeployment: 'Despliegue instantáneo — solo comparte un URL',
    freeForAll: 'Gratis para estudiantes y profesores',
    noAccounts: 'Sin cuentas ni datos personales requeridos',
    teacherTools: 'Herramientas para profesores',
  },
  footer: {
    tagline: 'Intentemos.',
    copyright: '© {year} Essayons. Todos los derechos reservados.',
  },
  simulation: {
    play: 'Reproducir',
    pause: 'Pausa',
    reset: 'Reiniciar',
    playSimulation: 'Reproducir simulación',
    pauseSimulation: 'Pausar simulación',
    resetSimulation: 'Reiniciar simulación',
    relaunch: 'Relanzar',
    relaunchSimulation: 'Relanzar simulación con parámetros actuales',
    relaunchTooltip: 'Reiniciar la física con la configuración actual — mantiene la misma misión',
    speed: 'Velocidad de simulación',
    episodeNotFound: 'Episodio no encontrado: {id}',
    missionCompleted: 'Misión completada exitosamente.',
    missionFailed: 'Misión fallida.',
    running: 'Simulación en ejecución.',
    paused: 'Simulación en pausa.',
    ready: 'Simulación lista.',
  },
  panels: {
    parameters: 'Parámetros',
    reference: 'Referencia',
    mission: 'Misión',
    objectives: 'Objetivos',
    hints: 'Pistas',
    showHint: 'Mostrar pista ({current}/{total})',
    missionFailedRetry: 'Misión fallida. Ajusta tus parámetros e inténtalo de nuevo.',
    noReferenceContent: 'No hay contenido de referencia disponible.',
    referenceCategories: 'Categorías de referencia',
  },
  referenceCategories: {
    concept: 'Conceptos',
    equation: 'Ecuaciones',
    history: 'Historia',
    'fun-fact': 'Datos curiosos',
  },
  teacherDashboard: {
    title: 'Panel del profesor',
    wordmark: 'Essayons',
  },
  locale: {
    selectLanguage: 'Seleccionar idioma',
  },
}
