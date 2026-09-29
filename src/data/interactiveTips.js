// Datos de los tips interactivos día por día.
// Clave: 'w{semana}-d{día}'
//
// layout: 'twoColumns' (default) | 'single' | 'quiz'
// titleImage: (opcional) ruta a una imagen que reemplaza el título HTML

// ============================================
// SEMANA 1
// ============================================

const DIA_1 = {
  layout: 'twoColumns',
  sparkyIntro:
    'El TDAH puede dificultar la organización porque cuesta planificar, recordar, ordenar y mantener el enfoque en lo importante. ¡Con las herramientas adecuadas, sí es posible!',
  titleAccent: 'y organización escolar',
  subtitle: 'Cómo manejar tareas, materiales, fechas y responsabilidades.',
  disclaimer: 'No es flojera ni desinterés: es un cerebro que necesita estrategias diferentes.',
  pairs: [
    {
      id: 'p1',
      problemImage: '/tips/w1-d7/calendario.png',
      solutionImage: '/tips/w1-d7/solution-1.png'
    }
  ],
  reward: 15
};

const DIA_2 = {
  layout: 'twoColumns',
  sparkyIntro:
    'Una mochila ordenada es una cabeza ordenada. Cuando tenés carpetas o separadores por materia, tu cerebro deja de gastar energía buscando cosas y la usa para lo que realmente importa.',
  titleAccent: 'y organización escolar',
  subtitle: 'Cómo manejar tareas, materiales, fechas y responsabilidades.',
  disclaimer: 'No es flojera ni desinterés: es un cerebro que necesita estrategias diferentes.',
  pairs: [
    {
      id: 'p1',
      problemImage: '/tips/w1-d7/d2tiempo.png',
      solutionImage: '/tips/w1-d7/solution-2.png'
    }
  ],
  reward: 15
};

const DIA_3 = {
  layout: 'twoColumns',
  sparkyIntro: [
    'Tu cerebro no mide el tiempo con un reloj: lo siente. Por eso "5 minutos" se vuelven una hora, o una hora pasa volando. No es falta de atención: es que necesita ver el tiempo para poder manejarlo.',
    'Cuando sentís que todo se junta y no sabés por dónde empezar, no es debilidad. Es que tu cerebro ve todo al mismo tiempo. Respirá. Un paso. Después otro.'
  ],
  titleAccent: 'y manejo del tiempo',
  subtitle: 'Aprender a calcular, dividir y administrar.',
  disclaimer: 'El tiempo no se te escapa por vago: se te escapa porque tu cerebro no lo ve.',
  pairs: [
    {
      id: 'p1',
      problemImage: '/tips/w1-d7/d3proyectos.png',
      solutionImage: '/tips/w1-d7/solution-3.png'
    }
  ],
  reward: 15
};

const DIA_4 = {
  layout: 'twoColumns',
  sparkyIntro: [
    'Empezar muchas cosas y no terminar ninguna no es falta de compromiso. Tu cerebro se entusiasma rápido, pero también se cansa rápido. Con recordatorios y pasos cortos, podés cerrar el círculo.',
    'Sentir que "no servís para esto" es la mentira más grande del TDAH. No es que no puedas: es que todavía no encontraste tu manera. Y eso se entrena.'
  ],
  titleAccent: 'y rendimiento',
  subtitle: 'Cómo cerrar lo que empezás y confiar en tu proceso.',
  disclaimer: 'No se trata de hacerlo perfecto. Se trata de avanzar cada día.',
  pairs: [
    {
      id: 'p1',
      problemImage: '/tips/w1-d7/d4rendimiento.png',
      solutionImage: '/tips/w1-d7/solution-4.png'
    }
  ],
  reward: 15
};

const DIA_5 = {
  layout: 'single',
  sparkyIntro: [
    'Hoy te dejo unas estrategias. Tocá la huellita cuando estés listo.',
    'No hay apuro. Leelas, probalas, y mañana vemos cómo te fue.',
    'Antes de dormir, dedicá 5 minutos a planificar el día siguiente. No para prever todo: solo para saber por dónde arrancar mañana. Tu yo del futuro te lo va a agradecer.',
    'Hay 6 cosas que hacen la diferencia: rutinas claras, espacio ordenado, pausas activas, revisar lo hecho, apoyo sin invadir, y reconocer tus esfuerzos. No todas juntas. Una a la vez.',
    'Con organización, estrategias y apoyo, podés tomar el control de tu día y alcanzar tus metas. No es una frase linda: es cómo funciona el cerebro cuando lo acompañás bien.'
  ],
  titleAccent: 'y organización escolar',
  subtitle: 'Una estrategia para probar hoy.',
  disclaimer: 'Las estrategias se entrenan. No se aprenden de una vez.',
  pairs: [
    {
      id: 'p1',
      problemImage: '/tips/w1-d7/estrategia5.png',
      solutionImage: '/tips/w1-d7/msj5.png'
    }
  ],
  reward: 15
};

const DIA_6 = {
  layout: 'quiz',
  sparkyIntro: [
    'Hoy es día de mirarte por dentro. No hay respuestas correctas, solo sinceras.',
    'Al final te voy a dar un mensaje pensado para vos. Pero primero, animate a contestar.'
  ],
  titleAccent: 'mi espejo de la semana',
  subtitle: 'Un momento para mirar lo que me pasa.',
  disclaimer: 'No hay respuestas correctas ni incorrectas. Solo las tuyas.',
  quiz: {
    key: 'w1-d6',
    questions: [
      { id: 'q1', text: '¿Te pasa olvidar fechas de tareas, exámenes o entregas?' },
      { id: 'q2', text: '¿Tu mochila termina con papeles sueltos y cosas mezcladas?' },
      { id: 'q3', text: '¿Sentís que "5 minutos" se convierten en una hora sin darte cuenta?' },
      { id: 'q4', text: '¿Empezás varias cosas y terminás dejando algunas a medias?' },
      { id: 'q5', text: '¿Aparece la frase "no sirvo para esto" cuando algo no te sale?' },
      { id: 'q6', text: '¿Te cuesta encontrar un lugar tranquilo y ordenado para estudiar?' }
    ],
    options: [
      { id: 'siempre',    label: 'Siempre',    color: '#ea580c' },
      { id: 'aVeces',     label: 'A veces',    color: '#facc15' },
      { id: 'casiNunca',  label: 'Casi nunca', color: '#94a3b8' }
    ]
  },
  reward: 15
};
// ============================================
// DÍA 7 SEMANA 1: El reto de la semana
// ============================================
const DIA_7 = {
  layout: 'challenge',
  sparkyIntro: [
    'Recorriste toda la semana. Ya sabés cosas sobre tu cerebro que muchos adultos no saben.',
    'Ahora toca lo más importante: probar. Un reto chiquito para los próximos 7 días.'
  ],
  titleAccent: 'y organización escolar',
  subtitle: 'El reto de la semana.',
  disclaimer: 'No es una tarea. Es un experimento.',
  challenge: {
    id: 'ch-organizacion-escolar',
    title: '3 cosas del día',
    description: 'Antes de dormir, escribí las 3 cosas importantes para mañana.',
    icon: '📝',
    why: 'Porque escribir en papel lo que va a pasar mañana libera espacio en tu cabeza y te ayuda a arrancar el día más ordenado.',
    durationDays: 7
  },
  reward: 15
};

// ============================================
// SEMANA 2: TDAH y procrastinación
// ============================================

const W2_DIA_1 = {
  layout: 'twoColumns',
  titleImage: '/tips/w2/titulosem2.png',
  sparkyIntro:
    'El TDAH puede hacer que iniciar tareas sea difícil porque el cerebro busca estimulación inmediata. Entenderlo es el primer paso, actuar es el cambio.',
  titleAccent: 'y procrastinación',
  subtitle: 'Por qué postergo y cómo empezar.',
  disclaimer: 'No es flojera: es dificultad para iniciar. Con estrategias, sí se puede.',
  pairs: [
    {
      id: 'p1',
      problemImage: '/tips/w2/sem2d1pro.png',
      solutionImage: '/tips/w2/sem2d1sol.png'
    }
  ],
  reward: 15
};

const W2_DIA_2 = {
  layout: 'twoColumns',
  titleImage: '/tips/w2/titulosem2.png',
  sparkyIntro: [
    'Las distracciones no ganan porque seas débil. Ganan porque tu cerebro busca dopamina rápida, y el celular la da más rápido que la tarea.',
    'Cuando postergás y después te sentís culpable, no estás fallando: estás en un círculo. No empiezo → me siento mal → más cuesta empezar. Se rompe con pausas cortas y avisos amables.'
  ],
  titleAccent: 'y procrastinación',
  subtitle: 'Por qué postergo y cómo empezar.',
  disclaimer: 'No es flojera: es dificultad para iniciar. Con estrategias, sí se puede.',
  pairs: [
    {
      id: 'p1',
      problemImage: '/tips/w2/sem2d2pro.png',
      solutionImage: '/tips/w2/sem2d2sol.png'
    }
  ],
  reward: 15
};

const W2_DIA_3 = {
  layout: 'twoColumns',
  titleImage: '/tips/w2/titulosem2.png',
  sparkyIntro: [
    'Terminar algo a medias no significa que no te importe. Significa que se hizo muy grande o muy perfecto en tu cabeza. A veces "hecho" vale más que "perfecto".',
    'Cuando algo no tiene que ver con lo que te gusta, cuesta el doble. Conectar la tarea con algo que sí te mueve, aunque sea un poquito, cambia todo.'
  ],
  titleAccent: 'y procrastinación',
  subtitle: 'Por qué postergo y cómo empezar.',
  disclaimer: 'No es flojera: es dificultad para iniciar. Con estrategias, sí se puede.',
  pairs: [
    {
      id: 'p1',
      problemImage: '/tips/w2/sem2d3pro.png',
      solutionImage: '/tips/w2/sem2d3sol.png'
    }
  ],
  reward: 15
};

// ============================================
// REGISTRO
// ============================================
export const INTERACTIVE_TIPS = {
  'w1-d1': DIA_1,
  'w1-d2': DIA_2,
  'w1-d3': DIA_3,
  'w1-d4': DIA_4,
  'w1-d5': DIA_5,
  'w1-d6': DIA_6,
  'w1-d7': DIA_7,
  'w2-d1': W2_DIA_1,
  'w2-d2': W2_DIA_2,
  'w2-d3': W2_DIA_3
};

export function getInteractiveTip(weekId, day) {
  return INTERACTIVE_TIPS[`w${weekId}-d${day}`] || null;
}