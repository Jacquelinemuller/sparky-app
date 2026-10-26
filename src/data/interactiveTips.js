// Datos de los tips interactivos día por día.
// Clave: 'w{semana}-d{día}'

export const INTERACTIVE_TIPS = {
  // ============================================
  // SEMANA 1
  // ============================================
  'w1-d1': {
    layout: 'twoColumns',
    sparkyIntro: [
      '{{nombre}}, el T.D.A.H. puede dificultar la organización porque cuesta planificar, recordar, ordenar y mantener el enfoque en lo importante. ¡Con las herramientas adecuadas, sí es posible!',
      'No es que no quieras, {{nombre}}. Es que tu cerebro tiene otro camino para llegar. Cuando encuentra el suyo, vuela.'
    ],
    titleAccent: 'y organización escolar',
    subtitle: 'Cómo manejar tareas, materiales, fechas y responsabilidades.',
    disclaimer: 'No es *flojera ni desinterés*: es un cerebro que necesita *estrategias diferentes*.',
    cards: {
      problem: {
        title: '¿QUÉ PUEDE PASAR?',
        color: '#ea580c',
        rows: [
          { icon: 'calendario.png', text: 'Olvidar tareas, fechas de entrega o materiales.' },
          { icon: 'mochila.png', text: 'Mochila desordenada y pérdida de útiles o trabajos.' }
        ]
      },
      solution: {
        title: '¿QUÉ PODEMOS HACER?',
        color: '#ea580c',
        rows: [
          { icon: 'calendario.png', text: 'Usar agendas o apps para anotar tareas y fechas.' },
          { icon: 'carpeta.png', text: 'Crear carpetas o separadores para cada materia.' }
        ]
      }
    },
    reward: 15
  },

  'w1-d2': {
    layout: 'twoColumns',
    sparkyIntro: [
      '{{nombre}}, una mochila ordenada es una cabeza ordenada. Cuando tenés carpetas o separadores por materia, tu cerebro deja de gastar energía buscando cosas y la usa para lo que realmente importa.',
      'No es que no quieras. Es que tu cerebro tiene otro camino para llegar. Cuando encuentra el suyo, vuela.'
    ],
    titleAccent: 'y organización escolar',
    subtitle: 'Cómo manejar tareas, materiales, fechas y responsabilidades.',
    disclaimer: 'No es *flojera ni desinterés*: es un cerebro que necesita *estrategias diferentes*.',
    cards: {
      problem: {
        title: '¿QUÉ PUEDE PASAR?',
        color: '#ea580c',
        rows: [
          { icon: 'mochila.png', text: 'Hojas sueltas en la mochila generan caos.' },
          { icon: 'carpeta.png', text: 'Los trabajos se pierden o se mezclan.' }
        ]
      },
      solution: {
        title: '¿QUÉ PODEMOS HACER?',
        color: '#ea580c',
        rows: [
          { icon: 'carpeta.png', text: 'Usar colores o carpetas individuales.' },
          { icon: 'revision.png', text: 'Revisar la mochila y guardar todo en su lugar.' }
        ]
      }
    },
    reward: 15
  },

  'w1-d3': {
    layout: 'twoColumns',
    sparkyIntro: [
      '{{nombre}}, tu cerebro no mide el tiempo con un reloj: lo siente. Por eso "5 minutos" se vuelven una hora, o una hora pasa volando. No es falta de atención: es que necesita ver el tiempo para poder manejarlo.',
      'Cuando sentís que todo se junta y no sabés por dónde empezar, no es debilidad. Es que tu cerebro ve todo al mismo tiempo. Respirá. Un paso. Después otro.'
    ],
    titleAccent: 'y manejo del tiempo',
    subtitle: 'Aprender a calcular, dividir y administrar.',
    disclaimer: 'El tiempo no se te escapa *por vago*: se te escapa porque *tu cerebro no lo ve*.',
    cards: {
      problem: {
        title: '¿QUÉ PUEDE PASAR?',
        color: '#ea580c',
        rows: [
          { icon: 'reloj.png', text: 'Ver un trabajo enorme paraliza el cerebro.' },
          { icon: 'enriedo.png', text: 'No saber por dónde empezar y no arrancar.' }
        ]
      },
      solution: {
        title: '¿QUÉ PODEMOS HACER?',
        color: '#ea580c',
        rows: [
          { icon: 'pomodoro.png', text: 'Dividir en 3 partes chiquitas de 10 min.' },
          { icon: 'esfuerzo.png', text: 'Arrancar es más fácil con pasos cortos.' }
        ]
      }
    },
    reward: 15
  },

  'w1-d4': {
    layout: 'twoColumns',
    sparkyIntro: [
      'Empezar muchas cosas y no terminar ninguna no es falta de compromiso. Tu cerebro se entusiasma rápido, pero también se cansa rápido. Con recordatorios y pasos cortos, podés cerrar el círculo.',
      'Sentir que "no servís para esto" es la mentira más grande del T.D.A.H. No es que no puedas: es que todavía no encontraste tu manera. Y eso se entrena.'
    ],
    titleAccent: 'y rendimiento',
    subtitle: 'Cómo cerrar lo que empezás y confiar en tu proceso.',
    disclaimer: 'No se trata de hacerlo perfecto. Se trata de *avanzar cada día*.',
    cards: {
      problem: {
        title: '¿QUÉ PUEDE PASAR?',
        color: '#ea580c',
        rows: [
          { icon: 'estadistica.png', text: 'Listas con 20 cosas generan ansiedad.' },
          { icon: 'enriedo.png', text: 'Empezar todo y terminar ninguna tarea.' }
        ]
      },
      solution: {
        title: '¿QUÉ PODEMOS HACER?',
        color: '#ea580c',
        rows: [
          { icon: 'tiro al blanco.png', text: 'Enfocarse solo en las 3 más importantes.' },
          { icon: 'logro.png', text: 'Elegir misiones clave y celebrar el avance.' }
        ]
      }
    },
    reward: 15
  },

  'w1-d5': {
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
    disclaimer: 'Las estrategias *se entrenan*. No se aprenden de una vez.',
    cards: {
      problem: {
        title: 'ESTRATEGIA DE HOY',
        color: '#ea580c',
        rows: [
          { icon: 'estudio.png', text: 'Preparar el nido antes de dormir.' },
          { icon: 'mochila.png', text: 'Dejar la mochila cerrada y la ropa lista.' }
        ]
      },
      solution: {
        title: '¿POR QUÉ FUNCIONA?',
        color: '#ea580c',
        rows: [
          { icon: 'calendario.png', text: 'Evita las carreras y el estrés de la mañana.' },
          { icon: 'esfuerzo.png', text: 'Tu yo del futuro te lo va a agradecer.' }
        ]
      }
    },
    reward: 15
  },

  'w1-d6': {
    layout: 'quiz',
    sparkyIntro: [
      'Hoy es día de mirarte por dentro. No hay respuestas correctas, solo sinceras.',
      'Al final te voy a dar un mensaje pensado para vos. Pero primero, animate a contestar.'
    ],
    titleAccent: 'mi espejo de la semana',
    subtitle: 'Un momento para mirar lo que me pasa.',
    disclaimer: 'No hay respuestas correctas ni incorrectas. *Solo las tuyas*.',
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
  },

  'w1-d7': {
    layout: 'challenge',
    sparkyIntro: [
      'Recorriste toda la semana. Ya sabés cosas sobre tu cerebro que muchos adultos no saben.',
      'Ahora toca lo más importante: probar. Un reto chiquito para las próximas 2 semanas.'
    ],
    titleAccent: 'y organización escolar',
    subtitle: 'El reto de la semana.',
    disclaimer: 'No es una tarea. Es un *experimento*.',
    challenge: {
      id: 'ch-organizacion-escolar',
      title: '3 cosas del día',
      description: 'Antes de dormir, escribí las 3 cosas importantes para mañana.',
      icon: '📝',
      why: 'Porque escribir en papel lo que va a pasar mañana libera espacio en tu cabeza y te ayuda a arrancar el día más ordenado.',
      durationDays: 14
    },
    reward: 15
  },

  // ============================================
  // SEMANA 2: TDAH y procrastinación
  // ============================================
  'w2-d1': {
    layout: 'twoColumns',
    sparkyIntro: [
      '{{nombre}}, el T.D.A.H. puede hacer que iniciar tareas sea difícil porque el cerebro busca estimulación inmediata. Entenderlo es el primer paso, actuar es el cambio.',
      'No es que no quieras. Es que tu cerebro tiene otro camino para llegar. Cuando encuentra el suyo, vuela.'
    ],
    titleAccent: 'y procrastinación',
    subtitle: 'Por qué postergo y cómo empezar.',
    disclaimer: 'No es *flojera*: es dificultad para iniciar. Con estrategias, sí se puede.',
    cards: {
      problem: {
        title: '¿QUÉ PUEDE PASAR?',
        color: '#1e3a8a',
        rows: [
          { icon: 'reloj.png', text: 'Dejar todo para último momento.' },
          { icon: 'enriedo.png', text: 'Sentirse abrumado al ver la tarea.' }
        ]
      },
      solution: {
        title: '¿CÓMO PODEMOS AYUDAR?',
        color: '#1e3a8a',
        rows: [
          { icon: 'calendario.png', text: 'Establecer rutinas claras y realistas.' },
          { icon: 'revision.png', text: 'Dividir tareas en pasos pequeños.' }
        ]
      }
    },
    reward: 15
  },

  'w2-d2': {
    layout: 'twoColumns',
    sparkyIntro: [
      'Las distracciones no ganan porque seas débil. Ganan porque tu cerebro busca dopamina rápida, y el celular la da más rápido que la tarea.',
      'Cuando postergás y después te sentís culpable, no estás fallando: estás en un círculo. No empiezo → me siento mal → más cuesta empezar. Se rompe con pausas cortas y avisos amables.'
    ],
    titleAccent: 'y procrastinación',
    subtitle: 'Por qué postergo y cómo empezar.',
    disclaimer: 'No es *flojera*: es dificultad para iniciar. Con estrategias, sí se puede.',
    cards: {
      problem: {
        title: '¿QUÉ PUEDE PASAR?',
        color: '#1e3a8a',
        rows: [
          { icon: 'pantalla.png', text: 'El celular o la tele ganan siempre la batalla.' },
          { icon: 'reloj.png', text: 'Perder la noción del tiempo usando pantalla.' }
        ]
      },
      solution: {
        title: '¿CÓMO PODEMOS AYUDAR?',
        color: '#1e3a8a',
        rows: [
          { icon: 'calendario.png', text: 'Establecer rutinas claras y realistas.' },
          { icon: 'revision.png', text: 'Dividir tareas en pasos pequeños.' }
        ]
      }
    },
    reward: 15
  },

  'w2-d3': {
    layout: 'twoColumns',
    sparkyIntro: [
      'Terminar algo a medias no significa que no te importe. Significa que se hizo muy grande o muy perfecto en tu cabeza. A veces "hecho" vale más que "perfecto".',
      'Cuando algo no tiene que ver con lo que te gusta, cuesta el doble. Conectar la tarea con algo que sí te mueve, aunque sea un poquito, cambia todo.'
    ],
    titleAccent: 'y procrastinación',
    subtitle: 'Por qué postergo y cómo empezar.',
    disclaimer: 'No es *flojera*: es dificultad para iniciar. Con estrategias, sí se puede.',
    cards: {
      problem: {
        title: '¿QUÉ PUEDE PASAR?',
        color: '#1e3a8a',
        rows: [
          { icon: 'enriedo.png', text: 'Dejar todo a medias cuando se pone difícil.' },
          { icon: 'perfecto.png', text: 'Sentir que si no es perfecto, no sirve.' }
        ]
      },
      solution: {
        title: '¿QUÉ PODEMOS HACER?',
        color: '#1e3a8a',
        rows: [
          { icon: 'logro.png', text: 'Recordar que "hecho" es mejor que "perfecto".' },
          { icon: 'tiro al blanco.png', text: 'Conectar la tarea con algo que te guste.' }
        ]
      }
    },
    reward: 15
  },

  'w2-d4': {
    layout: 'single',
    sparkyIntro: [
      'Estas 6 estrategias no son para hacerlas todas. Son para elegir UNA. La que más te guste. Y probarla mañana. Solo una.',
      'Empezar hoy es más fácil de lo que parece. No es una frase linda: es que tu cerebro necesita arrancar, no terminar todo junto.'
    ],
    titleAccent: 'y procrastinación',
    subtitle: 'Por qué postergo y cómo empezar.',
    disclaimer: 'No es *flojera*: es dificultad para iniciar. Con estrategias, sí se puede.',
    cards: {
      problem: {
        title: 'EL SECRETO DE HOY',
        color: '#1e3a8a',
        rows: [
          { icon: 'advertir.png', text: 'No intentes hacer las 6 cosas de golpe.' },
          { icon: 'rutina.png', text: 'Elegir una sola y probarla mañana.' }
        ]
      },
      solution: {
        title: '¿POR QUÉ FUNCIONA?',
        color: '#1e3a8a',
        rows: [
          { icon: 'esfuerzo.png', text: 'Tu cerebro necesita arrancar, no terminar todo.' },
          { icon: 'logro.png', text: 'Un paso chiquito hoy es un gran cambio mañana.' }
        ]
      }
    },
    reward: 15
  },

  'w2-d5': {
    layout: 'single',
    sparkyIntro: [
      'Empezar es lo más difícil. Una vez que arrancás, el resto fluye solo. No pienses en toda la tarea: pensá en el primer paso.',
      'Elegí, dividí, empezá, descansá, seguí. No es una fórmula mágica: es solo el orden que calma al cerebro.'
    ],
    titleAccent: 'y procrastinación',
    subtitle: 'Por qué postergo y cómo empezar.',
    disclaimer: 'No es *flojera*: es dificultad para iniciar. Con estrategias, sí se puede.',
    cards: {
      problem: {
        title: 'EL PLAN DE ACCIÓN',
        color: '#1e3a8a',
        rows: [
          { icon: 'tiro al blanco.png', text: 'Elegir una tarea. No todas.' },
          { icon: 'pomodoro.png', text: 'Dividir en pasos chiquitos y empezar 5 min.' }
        ]
      },
      solution: {
        title: '¿QUÉ HACER DESPUÉS?',
        color: '#1e3a8a',
        rows: [
          { icon: 'pilas.png', text: 'Descansar cuando lo necesites.' },
          { icon: 'rutina.png', text: 'Seguir y volver a empezar.' }
        ]
      }
    },
    reward: 15
  },

  'w2-d6': {
    layout: 'quiz',
    sparkyIntro: [
      'Otra vez, momento de mirarte por dentro. No hay respuestas correctas, solo sinceras.',
      'Al final te voy a dar un mensaje pensado para vos.'
    ],
    titleAccent: 'mi espejo de la semana',
    subtitle: 'Un momento para mirar lo que me pasa.',
    disclaimer: 'No hay respuestas correctas ni incorrectas. *Solo las tuyas*.',
    quiz: {
      key: 'w2-d6',
      questions: [
        { id: 'q1', text: '¿Sentís que la tarea se hace gigante antes de empezar?' },
        { id: 'q2', text: '¿Te pasa que el celular o la tele ganan siempre?' },
        { id: 'q3', text: '¿Postergás y después te sentís culpable por eso?' },
        { id: 'q4', text: '¿Empezás algo y lo dejás a medias cuando se pone difícil?' },
        { id: 'q5', text: '¿Te cuesta conectar la tarea con algo que te interesa?' },
        { id: 'q6', text: '¿Sentís que "empezar" es lo más difícil de todo?' }
      ],
      options: [
        { id: 'siempre',    label: 'Siempre',    color: '#1e3a8a' },
        { id: 'aVeces',     label: 'A veces',    color: '#facc15' },
        { id: 'casiNunca',  label: 'Casi nunca', color: '#94a3b8' }
      ]
    },
    reward: 15
  },

  'w2-d7': {
    layout: 'challengeClose',
    closingChallengeId: 'ch-organizacion-escolar',
    newChallenge: {
      id: 'ch-procrastinacion-5min',
      title: 'Empezar por 5 minutos',
      description: 'Cuando no querés empezar algo, comprometete a hacerlo solo 5 minutos. Si después querés seguir, seguís. Si no, ya está.',
      icon: '⏱️',
      why: 'Porque arrancar es lo más difícil. Una vez que el cerebro entra en modo tarea, seguir es mucho más fácil. Y 5 minutos no asustan a nadie.',
      durationDays: 14
    },
    sparkyIntro: [
      'Terminaste la Semana 2. Vamos a ver cómo te fue con el reto.',
      'Y te tengo uno nuevo. Uno que hace magia cuando el cerebro se niega a arrancar.'
    ],
    titleAccent: 'y procrastinación',
    subtitle: 'El cierre de la semana.',
    disclaimer: 'No es una tarea. Es un *experimento*.',
    reward: 15
  },

  // ============================================
  // SEMANA 3: TDAH y Manejo del Tiempo
  // ============================================
  'w3-d1': {
    layout: 'twoColumns',
    sparkyIntro: [
      'El T.D.A.H. afecta la percepción del tiempo. Por eso a veces subestimamos cuánto tarda una tarea o perdemos la noción del tiempo. No es tu culpa, es tu cerebro.',
      'Planificar y visualizar ayuda a mantenerse en camino. ¡Hoy vamos a aprender a dominar el reloj!'
    ],
    titleAccent: 'y manejo del tiempo',
    subtitle: 'Aprender a calcular, dividir y administrar.',
    disclaimer: 'El T.D.A.H. puede hacer que el *tiempo* se sienta distinto. *Con estrategias*, se puede *dominar.*',
    cards: {
      problem: {
        title: '¿QUÉ PUEDE PASAR?',
        color: '#ea580c',
        rows: [
          { icon: 'reloj.png', text: 'Subestimar cuánto tarda una tarea.' },
          { icon: 'enriedo.png', text: 'Perder la noción del tiempo.' }
        ]
      },
      solution: {
        title: '¿CÓMO PODEMOS AYUDAR?',
        color: '#ea580c',
        rows: [
          { icon: 'revision.png', text: 'Hacer listas claras de lo que hay que hacer.' },
          { icon: 'pomodoro.png', text: 'Usar un temporizador y recordatorios.' }
        ]
      }
    },
    reward: 15
  },

  'w3-d2': {
    layout: 'twoColumns',
    sparkyIntro: [
      'Cuando no calculás el tiempo, las tareas se te vienen encima. Y si saltás de una cosa a otra, al final del día no terminaste nada.',
      'La clave está en ver el tiempo, no solo sentirlo. ¡Usar herramientas visuales es un superpoder!'
    ],
    titleAccent: 'y manejo del tiempo',
    subtitle: 'Aprender a calcular, dividir y administrar.',
    disclaimer: 'El T.D.A.H. puede hacer que el *tiempo* se sienta distinto. *Con estrategias*, se puede *dominar.*',
    cards: {
      problem: {
        title: '¿QUÉ PUEDE PASAR?',
        color: '#ea580c',
        rows: [
          { icon: 'estadistica.png', text: 'Pasar de una cosa a otra sin terminar.' },
          { icon: 'advertencia.png', text: 'No calcular el tiempo necesario.' }
        ]
      },
      solution: {
        title: '¿CÓMO PODEMOS AYUDAR?',
        color: '#ea580c',
        rows: [
          { icon: 'calendario.png', text: 'Hacer planificación visual de la semana.' },
          { icon: 'recordatorio.png', text: 'Poner alarmas estratégicas para cambiar de tarea.' }
        ]
      }
    },
    reward: 15
  },

  'w3-d3': {
    layout: 'twoColumns',
    sparkyIntro: [
      'A veces el problema no es la tarea en sí, sino no saber por dónde empezar. Sentirse abrumado por la cantidad de cosas es normal.',
      'No priorizar hace que todo se mezcle. Pero con el lugar adecuado y revisando tu progreso, todo cambia.'
    ],
    titleAccent: 'y manejo del tiempo',
    subtitle: 'Aprender a calcular, dividir y administrar.',
    disclaimer: 'El T.D.A.H. puede hacer que el *tiempo* se sienta distinto. *Con estrategias*, se puede *dominar.*',
    cards: {
      problem: {
        title: '¿QUÉ PUEDE PASAR?',
        color: '#ea580c',
        rows: [
          { icon: 'mochila.png', text: 'Sentirse abrumado por la cantidad de tareas.' },
          { icon: 'tiro al blanco.png', text: 'No priorizar lo más importante.' }
        ]
      },
      solution: {
        title: '¿CÓMO PODEMOS AYUDAR?',
        color: '#ea580c',
        rows: [
          { icon: 'estudio.png', text: 'Tener un lugar de estudio adecuado y libre de distracciones.' },
          { icon: 'logro.png', text: 'Revisar el progreso cada día y celebrar los avances.' }
        ]
      }
    },
    reward: 15
  },

  'w3-d4': {
    layout: 'single',
    sparkyIntro: [
      '¿Sabías que existe una fórmula secreta para dominar el tiempo? No es magia, es pura estrategia.',
      'Tocá la tarjeta de abajo para descubrir la Fórmula del Tiempo. ¡Te va a cambiar el día!'
    ],
    titleAccent: 'y manejo del tiempo',
    subtitle: 'La fórmula secreta.',
    disclaimer: 'El T.D.A.H. puede hacer que el *tiempo* se sienta distinto. *Con estrategias*, se puede *dominar.*',
    revealImage: '/tips/tarjeta.png',
    solutionImage: '/tips/icons/formula.png',
    reward: 15
  },

  'w3-d5': {
    layout: 'single',
    sparkyIntro: [
      'No necesitás hacer todo de golpe. Estas 6 estrategias marcan la diferencia en tu día a día.',
      'Mirá las dos tarjetas y descubrí por qué el tiempo no es tu enemigo, sino tu aliado.'
    ],
    titleAccent: 'y manejo del tiempo',
    subtitle: 'Las estrategias que marcan la diferencia.',
    disclaimer: 'El T.D.A.H. puede hacer que el *tiempo* se sienta distinto. *Con estrategias*, se puede *dominar.*',
    
    revealCards: [
      {
        id: 'card-estrategias',
        revealImage: '/tips/tarjeta2.png', 
        solutionImage: '/tips/icons/estrategias.png'
      },
      {
        id: 'card-trofeo',
        revealImage: '/tips/tarjeta2.png',
        solutionImage: '/tips/icons/trofeo-estrategia.png', 
        overlayIcon: '/tips/icons/trofeo.png' 
      }
    ],
    reward: 15
  },

  'w3-d6': {
    layout: 'quiz',
    sparkyIntro: [
      'Es momento de mirar cómo manejás tu tiempo. No hay respuestas incorrectas, solo un mapa para saber por dónde empezar a mejorar.',
      'Contestá con sinceridad. Al final te voy a dar un mensaje pensado para vos.'
    ],
    titleAccent: 'mi espejo de la semana',
    subtitle: 'Un momento para mirar lo que me pasa.',
    disclaimer: 'No hay respuestas correctas ni incorrectas. *Solo las tuyas*.',
    quiz: {
      key: 'w3-d6',
      questions: [
        { id: 'q1', text: '¿Te pasa subestimar cuánto tarda una tarea?' },
        { id: 'q2', text: '¿Perdés la noción del tiempo mirando el celular o jugando?' },
        { id: 'q3', text: '¿Saltás de una tarea a otra sin terminar la primera?' },
        { id: 'q4', text: '¿Te cuesta calcular cuánto tiempo necesitás para estudiar?' },
        { id: 'q5', text: '¿Sentís que el día no te alcanza para todo?' },
        { id: 'q6', text: '¿Te olvidás de hacer pausas para descansar?' }
      ],
      options: [
        { id: 'siempre',    label: 'Siempre',    color: '#ea580c' },
        { id: 'aVeces',     label: 'A veces',    color: '#facc15' },
        { id: 'casiNunca',  label: 'Casi nunca', color: '#94a3b8' }
      ]
    },
    reward: 15
  },

  'w3-d7': {
    layout: 'challenge',
    sparkyIntro: [
      '¡Semana completada! Ahora es tu turno de crear tu propia fórmula para manejar el tiempo.',
      'Vamos a armar un reto para que planifiques, te enfoques y recuerdes descansar.'
    ],
    titleAccent: 'y manejo del tiempo',
    subtitle: 'El reto de la semana.',
    disclaimer: 'No es una tarea. Es un *experimento*.',
    challenge: {
      id: 'ch-formula-tiempo',
      title: 'Mi Fórmula del Tiempo',
      description: 'Elegí una tarea, calculá cuánto tiempo te lleva, usá un temporizador y tomate una pausa de 5 minutos al terminar.',
      icon: '⏳',
      why: 'Porque aplicar la fórmula Planificar + Enfocarse + Pausa te ayuda a no abrumarte y a cerrar el ciclo de la tarea.',
      durationDays: 14
    },
    reward: 15
  },

  // ============================================
  // SEMANA 4: TDAH y Emociones Intensas
  // ============================================
  'w4-d1': {
    layout: 'twoColumns',
    sparkyIntro: [
      'Sentir mucho no es el problema. El T.D.A.H. puede hacer que las emociones se sientan más intensas y difíciles de controlar. No estás roto, solo sentís a todo volumen.',
      'Reconocer lo que siento es el primer paso para elegir cómo responder. ¡Hoy vamos a practicar eso!'
    ],
    titleAccent: 'y emociones intensas',
    subtitle: 'Sentir mucho no es el problema, no saber gestionarlo, sí.',
    disclaimer: 'Tus emociones son *válidas*, pero tus *elecciones* son lo que te llevan más lejos.',
    cards: {
      problem: {
        title: '¿QUÉ PUEDE PASAR?',
        color: '#ea580c',
        rows: [
          { icon: 'torbellino.png', text: 'Irritabilidad o cambios de humor frecuentes.' },
          { icon: 'fuego.png', text: 'Reacciones impulsivas o desproporcionadas.' }
        ]
      },
      solution: {
        title: '¿CÓMO PUEDO GESTIONARLAS?',
        color: '#1e3a8a',
        rows: [
          { icon: 'pulmon.png', text: 'Respiración profunda: 4 segundos entra, 4 segundos sale.' },
          { icon: 'notas.png', text: 'Escribir lo que siento sin juzgarme.' },
          { icon: 'caminata.png', text: 'Mover mi cuerpo: caminar, estirarme.' }
        ]
      }
    },
    reward: 15
  },

  'w4-d2': {
    layout: 'twoColumns',
    sparkyIntro: [
      'La ansiedad es como un ruido de fondo que no te deja pensar con claridad. Es normal sentirla, pero hay formas de bajarla.',
      'Hoy vamos a aprender a frenar antes de reaccionar y a buscar apoyo cuando lo necesitamos.'
    ],
    titleAccent: 'y emociones intensas',
    subtitle: 'Sentir mucho no es el problema, no saber gestionarlo, sí.',
    disclaimer: 'Tus emociones son *válidas*, pero tus *elecciones* son lo que te llevan más lejos.',
    cards: {
      problem: {
        title: '¿QUÉ PUEDE PASAR?',
        color: '#ea580c',
        rows: [
          { icon: 'ansiedad.png', text: 'Ansiedad o preocupación constante.' }
        ]
      },
      solution: {
        title: '¿CÓMO PUEDO GESTIONARLAS?',
        color: '#1e3a8a',
        rows: [
          { icon: 'semaforo.png', text: 'Tomar una pausa antes de responder.' },
          { icon: 'charla.png', text: 'Hablar con alguien de confianza.' }
        ]
      }
    },
    reward: 15
  },

  'w4-d3': {
    layout: 'twoColumns',
    sparkyIntro: [
      'Cuando las cosas no salen como queremos, la frustración puede ser enorme. Y después de un día largo, el cerebro se queda sin batería.',
      'Para esos momentos, la música y celebrar los pequeños logros son tus mejores aliados. ¡Vamos a verlos!'
    ],
    titleAccent: 'y emociones intensas',
    subtitle: 'Sentir mucho no es el problema, no saber gestionarlo, sí.',
    disclaimer: 'Tus emociones son *válidas*, pero tus *elecciones* son lo que te llevan más lejos.',
    cards: {
      problem: {
        title: '¿QUÉ PUEDE PASAR?',
        color: '#ea580c',
        rows: [
          { icon: 'roto.png', text: 'Dificultad para manejar la frustración.' },
          { icon: 'sueño.png', text: 'Agotamiento emocional después de un día exigente.' }
        ]
      },
      solution: {
        title: '¿CÓMO PUEDO GESTIONARLAS?',
        color: '#1e3a8a',
        rows: [
          { icon: 'musica.png', text: 'Escuchar música que me calme.' },
          { icon: 'corazon.png', text: 'Celebrar lo que hice bien hoy.' }
        ]
      }
    },
    reward: 15
  },

  'w4-d4': {
    layout: 'single',
    sparkyIntro: [
      'Cuando la emoción es muy grande, el cerebro se bloquea y actúa por impulso. Pero tenemos un truco de superhéroes para cuando eso pasa.',
      'Se llama "Mi Plan Rápido". Tocá la tarjeta de abajo para descubrir los 5 pasos que te devuelven el control.'
    ],
    titleAccent: 'y emociones intensas',
    subtitle: 'Mi Plan Rápido.',
    disclaimer: 'Tus emociones son *válidas*, pero tus *elecciones* son lo que te llevan más lejos.',
    revealImage: '/tips/tarjeta.png',
    solutionImage: '/tips/icons/tarjeta3.png',
    reward: 15
  },

  'w4-d5': {
    layout: 'single',
    sparkyIntro: [
      '¡Ya casi terminamos la semana! Hoy te dejo las estrategias finales para que las emociones no te dominen.',
      'Mirá estas dos tarjetas. La primera tiene tus herramientas, y la segunda un recordatorio muy especial.'
    ],
    titleAccent: 'y emociones intensas',
    subtitle: 'Estrategias y recordatorios finales.',
    disclaimer: 'Tus emociones son *válidas*, pero tus *elecciones* son lo que te llevan más lejos.',
    
    revealCards: [
      {
        id: 'card-estrategias-emociones',
        revealImage: '/tips/tarjeta2.png',
        solutionImage: '/tips/icons/tarjeta4.png'
      },
      {
        id: 'card-mensaje-final',
        revealImage: '/tips/tarjeta2.png',
        solutionImage: '/tips/icons/tarjeta5.png',
        overlayIcon: '/tips/icons/corazon.png'
      }
    ],
    reward: 15
  },

  'w4-d6': {
    layout: 'quiz',
    sparkyIntro: [
      'Llegó el momento de mirar hacia adentro. Las emociones intensas son parte de tu día, pero conocerlas es el primer paso para manejarlas.',
      'No hay respuestas correctas o incorrectas, solo las tuyas. ¡Sé sincero!'
    ],
    titleAccent: 'mi espejo de la semana',
    subtitle: 'Un momento para mirar lo que me pasa.',
    disclaimer: 'No hay respuestas correctas ni incorrectas. *Solo las tuyas*.',
    quiz: {
      key: 'w4-d6',
      questions: [
        { id: 'q1', text: '¿Te enojás o te frustrás muy rápido por cosas pequeñas?' },
        { id: 'q2', text: '¿Te cuesta calmarte cuando algo no sale como querés?' },
        { id: 'q3', text: '¿Sentís que las emociones te abruman y no sabés qué hacer?' },
        { id: 'q4', text: '¿Te preocupa mucho lo que va a pasar o lo que piensan los demás?' },
        { id: 'q5', text: '¿Te agotás emocionalmente después de un día exigente?' },
        { id: 'q6', text: '¿Te cuesta pedir ayuda cuando te sentís mal?' }
      ],
      options: [
        { id: 'siempre',    label: 'Siempre',    color: '#ea580c' },
        { id: 'aVeces',     label: 'A veces',    color: '#facc15' },
        { id: 'casiNunca',  label: 'Casi nunca', color: '#94a3b8' }
      ]
    },
    reward: 15
  },

  'w4-d7': {
    layout: 'challenge',
    sparkyIntro: [
      '¡Semana completada! Ya conocés tus emociones y sabés que tenés herramientas para manejarlas.',
      'Ahora es el momento de ponerlo en práctica con un nuevo reto. ¿Te animás?'
    ],
    titleAccent: 'y emociones intensas',
    subtitle: 'El reto de la semana.',
    disclaimer: 'No es una tarea. Es un *experimento*.',
    challenge: {
      id: 'ch-pausa-magica',
      title: 'Mi Pausa Mágica',
      description: 'Cuando sientas una emoción muy fuerte, frená y usá tu Plan Rápido: Detente, Respira, Identifica qué sentís, Elige cómo actuar y Actúa.',
      icon: 'corazon.png',
      why: 'Porque no podés controlar la ola, pero sí podés aprender a surfearla. Practicar la pausa te da tiempo para elegir mejor.',
      durationDays: 14
    },
    reward: 15
  },

  // ============================================
  // SEMANA 5: TDAH y Autorregulación e Impulsividad
  // ============================================
  'w5-d1': {
    layout: 'twoColumns',
    sparkyIntro: [
      'El T.D.A.H. puede hacer que actuar sin pensar parezca automático. Pero pensar antes de actuar es una habilidad que se entrena.',
      'Con estrategias, se puede pausar, elegir y actuar mejor. ¡Hoy empezamos con el primer paso!'
    ],
    titleAccent: 'y autorregulación e impulsividad',
    subtitle: 'Pensar antes de actuar es una habilidad que se entrena.',
    disclaimer: 'No se trata de *no equivocarse*, sino de *aprender a frenar*.',
    cards: {
      problem: {
        title: '¿QUÉ PUEDE PASAR?',
        color: '#ea580c',
        rows: [
          { icon: 'rayo.png', text: 'Actuar sin pensar y luego arrepentirse.' },
          { icon: 'dialogo.png', text: 'Interrumpir o hablar sin esperar su turno.' }
        ]
      },
      solution: {
        title: '¿CÓMO PODEMOS AYUDAR?',
        color: '#1e3a8a',
        rows: [
          { icon: 'mano.png', text: 'Enseñar la regla: pausa, piensa, elige, actúa.' },
          { icon: 'ojo.png', text: 'Usar recordatorios visuales en casa y en la escuela.' },
          { icon: 'viento.png', text: 'Practicar respiración y pausas activas.' }
        ]
      }
    },
    reward: 15
  },

  'w5-d2': {
    layout: 'twoColumns',
    sparkyIntro: [
      'A veces la emoción o la impaciencia son tan grandes que explotamos. Y esperar se vuelve una montaña rusa.',
      'Pero podemos anticiparnos a esos momentos y reforzar cada pequeño logro. ¡Vamos a ver cómo!'
    ],
    titleAccent: 'y autorregulación e impulsividad',
    subtitle: 'Pensar antes de actuar es una habilidad que se entrena.',
    disclaimer: 'No se trata de *no equivocarse*, sino de *aprender a frenar*.',
    cards: {
      problem: {
        title: '¿QUÉ PUEDE PASAR?',
        color: '#ea580c',
        rows: [
          { icon: 'enojo.png', text: 'Reacciones impulsivas que generan conflictos.' },
          { icon: 'cabezas.png', text: 'Dificultad para esperar o tolerar la frustración.' }
        ]
      },
      solution: {
        title: '¿CÓMO PODEMOS AYUDAR?',
        color: '#1e3a8a',
        rows: [
          { icon: 'advertencia.png', text: 'Anticipar situaciones que pueden disparar impulsos.' },
          { icon: 'esfuerzo.png', text: 'Reforzar cada esfuerzo, no solo los resultados.' }
        ]
      }
    },
    reward: 15
  },

  'w5-d3': {
    layout: 'twoColumns',
    sparkyIntro: [
      'Las decisiones impulsivas a veces nos traen consecuencias que no queríamos.',
      'Para cerrar la semana, la clave está en los límites claros y en validar lo que sentimos, sin dejar de lado las reglas.'
    ],
    titleAccent: 'y autorregulación e impulsividad',
    subtitle: 'Pensar antes de actuar es una habilidad que se entrena.',
    disclaimer: 'No se trata de *no equivocarse*, sino de *aprender a frenar*.',
    cards: {
      problem: {
        title: '¿QUÉ PUEDE PASAR?',
        color: '#ea580c',
        rows: [
          { icon: 'torbellino.png', text: 'Decisiones impulsivas que traen consecuencias.' }
        ]
      },
      solution: {
        title: '¿CÓMO PODEMOS AYUDAR?',
        color: '#1e3a8a',
        rows: [
          { icon: 'candado.png', text: 'Establecer límites claros y consistentes.' },
          { icon: 'corazon.png', text: 'Validar sus emociones antes de corregir.' }
        ]
      }
    },
    reward: 15
  },

  'w5-d4': {
    layout: 'single',
    sparkyIntro: [
      'Cuando sientas un impulso muy fuerte, no tienes que reaccionar de inmediato.',
      'Existe un truco de 3 pasos que cambia el resultado de todo. Tocá la tarjeta para verlo.'
    ],
    titleAccent: 'y autorregulación',
    subtitle: 'El truco de los 3 pasos.',
    disclaimer: 'Dar un *pequeño espacio* entre el impulso y la acción *cambia el resultado.*',
    revealImage: '/tips/tarjeta.png',
    solutionImage: '/tips/icons/piensa.png',
    reward: 15
  },

  'w5-d5': {
    layout: 'single',
    sparkyIntro: [
      '¡Ya casi terminamos la semana! Hoy te dejo las 6 estrategias clave para la autorregulación.',
      'Mirá las dos tarjetas. La primera tiene tus herramientas, y la segunda un recordatorio muy especial.'
    ],
    titleAccent: 'y autorregulación',
    subtitle: 'Estrategias y cierre de semana.',
    disclaimer: 'No se trata de ser perfecto. Se trata de *elegir mejor* cada día.',
    revealCards: [
      {
        id: 'card-estrategias-auto',
        revealImage: '/tips/tarjeta2.png',
        solutionImage: '/tips/icons/estrategias2.png'
      },
      {
        id: 'card-mensaje-auto',
        revealImage: '/tips/tarjeta2.png',
        solutionImage: '/tips/icons/tarjeta6.png',
        overlayIcon: '/tips/icons/trofeo.png'
      }
    ],
    reward: 15
  },

  'w5-d6': {
    layout: 'quiz',
    sparkyIntro: [
      'Llegó el momento de mirar cómo manejás tus impulsos. Actuar rápido a veces es divertido, pero pensar antes nos evita problemas.',
      'No hay respuestas correctas o incorrectas, solo las tuyas. ¡Sé sincero!'
    ],
    titleAccent: 'mi espejo de la semana',
    subtitle: 'Un momento para mirar lo que me pasa.',
    disclaimer: 'No hay respuestas correctas ni incorrectas. *Solo las tuyas*.',
    quiz: {
      key: 'w5-d6',
      questions: [
        { id: 'q1', text: '¿Te pasa actuar sin pensar y después arrepentirte?' },
        { id: 'q2', text: '¿Interrumpís a los demás o hablás sin esperar tu turno?' },
        { id: 'q3', text: '¿Te cuesta esperar tu turno en juegos o filas?' },
        { id: 'q4', text: '¿Reaccionás con enojo muy rápido cuando algo no sale como querés?' },
        { id: 'q5', text: '¿Te olvidás de respirar profundo antes de contestar?' },
        { id: 'q6', text: '¿Sentís que podrías elegir mejores opciones si frenaras un segundo?' }
      ],
      options: [
        { id: 'siempre',    label: 'Siempre',    color: '#ea580c' },
        { id: 'aVeces',     label: 'A veces',    color: '#facc15' },
        { id: 'casiNunca',  label: 'Casi nunca', color: '#94a3b8' }
      ]
    },
    reward: 15
  },

  'w5-d7': {
    layout: 'challenge',
    sparkyIntro: [
      '¡Semana completada! Aprendiste que pensar antes de actuar es una habilidad que se entrena.',
      'Ahora es el turno de ponerlo en práctica con este nuevo reto. ¡Vas a poder!'
    ],
    titleAccent: 'y autorregulación',
    subtitle: 'El reto de la semana.',
    disclaimer: 'No es una tarea. Es un *experimento*.',
    challenge: {
      id: 'ch-semaforo-emocional',
      title: 'El Semáforo del Impulso',
      description: 'Cuando sientas un impulso muy fuerte, usá el semáforo: Rojo (frená), Amarillo (pensá qué pasará), Verde (elegí la mejor acción).',
      icon: 'semaforo.png',
      why: 'Porque darle un pequeño espacio al cerebro antes de actuar te da el poder de elegir mejor y evitar consecuencias que no querías.',
      durationDays: 14
    },
    reward: 15
  },
};

export function getInteractiveTip(weekId, day) {
  return INTERACTIVE_TIPS[`w${weekId}-d${day}`] || null;
}