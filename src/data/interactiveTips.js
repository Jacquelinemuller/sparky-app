// Datos de los tips interactivos día por día.
// Clave: 'w{semana}-d{día}'

// Datos de los tips interactivos día por día.
// Clave: 'w{semana}-d{día}'

// Datos de los tips interactivos día por día.
// Clave: 'w{semana}-d{día}'

export const INTERACTIVE_TIPS = {
  'w1-d7': {
    // 🐶 Lo que dice Sparky en su burbuja
    sparkyIntro:
      'El TDAH puede dificultar la organización porque cuesta planificar, recordar, ordenar y mantener el enfoque en lo importante. ¡Con las herramientas adecuadas, sí es posible!',

    // Título replicado
    titleAccent: 'y organización escolar',
    subtitle: 'Cómo manejar tareas, materiales, fechas y responsabilidades.',
    disclaimer: 'No es flojera ni desinterés: es un cerebro que necesita estrategias diferentes.',

    pairs: [
      {
        id: 'p1',
        problemImage: '/tips/w1-d7/calendario.png',
        problemText: 'Olvidar tareas, fechas de entrega o materiales.',
        solutionImage: '/tips/w1-d7/solution-1.png',
        solutionText: 'Usar agenda o apps para anotar tareas y fechas.'
      },
      {
        id: 'p2',
        problemImage: '/tips/w1-d7/mochila.png',
        problemText: 'Mochila desordenada y pérdida de útiles o trabajos.',
        solutionImage: '/tips/w1-d7/solution-2.png',
        solutionText: 'Crear carpetas o separadores para cada materia.'
      }
    ],
    reward: 15
  }
};

export function getInteractiveTip(weekId, day) {
  return INTERACTIVE_TIPS[`w${weekId}-d${day}`] || null;
}