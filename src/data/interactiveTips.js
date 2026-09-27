// Datos de los tips interactivos día por día.
// Clave: 'w{semana}-d{día}'

export const INTERACTIVE_TIPS = {
  'w1-d7': {
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
  }
};

export function getInteractiveTip(weekId, day) {
  return INTERACTIVE_TIPS[`w${weekId}-d${day}`] || null;
}