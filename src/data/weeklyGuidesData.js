// Base de Datos Estructurada de Láminas Semanales y Tips Diarios
// Extraído de las infografías de Universo TDAH

export const WEEKLY_GUIDES = [
  {
    id: 1,
    weekNumber: 1,
    category: 'estrategias',
    categoryName: 'Estrategias de Estudio',
    title: 'TDAH y Organización Escolar',
    subtitle: 'Cómo manejar tareas, materiales, fechas y responsabilidades sin abrumarse.',
    sheetImage: '/sheets/estrategias/estrategias 1.jpeg',
    author: 'Coach Marco - Universo TDAH',
    colorTheme: 'blue',
    summary: 'El TDAH no es flojera ni desinterés: es un cerebro que necesita estrategias visuales y pasos pequeños.',
    tips: [
      {
        day: 1,
        dayName: 'Lunes',
        title: 'Tu agenda visual o app amiga',
        explanation: 'La memoria de trabajo en el TDAH se satura rápido. Anotar las fechas apenas las dicen libera espacio en tu cabeza.',
        action: 'Anota en la app la tarea o fecha más cercana que tengas esta semana.',
        reward: 15
      },
      {
        day: 2,
        dayName: 'Martes',
        title: 'Una carpeta o separador por materia',
        explanation: 'Tener hojas sueltas en la mochila genera caos. Usar colores o carpetas individuales evita que los trabajos se pierdan.',
        action: 'Revisa tu mochila y guarda las hojas sueltas en su carpeta correspondiente.',
        reward: 15
      },
      {
        day: 3,
        dayName: 'Miércoles',
        title: 'El truco de los pasos pequeños (Chunking)',
        explanation: 'Ver un trabajo enorme paraliza el cerebro. Si lo divides en 3 partes chiquitas de 10 minutos, arrancar es mucho más fácil.',
        action: 'Elige una tarea que te dé pereza y divídela en 3 micro-pasos.',
        reward: 15
      },
      {
        day: 4,
        dayName: 'Jueves',
        title: 'La regla de las 3 prioridades',
        explanation: 'Hacer listas con 20 cosas genera ansiedad. Enfócate solo en las 3 más importantes del día.',
        action: 'Elige tus 3 misiones clave para hoy y déjalas activas en la Agenda.',
        reward: 15
      },
      {
        day: 5,
        dayName: 'Viernes',
        title: 'Alarmas y avisos amistosos',
        explanation: 'El cerebro con TDAH experimenta ceguera temporal ("ahora" vs "nunca"). Las alarmas con música o chimes te ayudan a cambiar de actividad.',
        action: 'Activa o prueba el temporizador Pomodoro de Sparky para una tarea corta.',
        reward: 15
      },
      {
        day: 6,
        dayName: 'Sábado',
        title: 'Revisar sin juzgar y celebrar cada avance',
        explanation: 'No te castigues si algo no salió perfecto. Cada micro-avance cuenta el doble cuando te cuesta concentrarte.',
        action: 'Toca a Sparky y celebra un logro que hayas conseguido esta semana.',
        reward: 15
      },
      {
        day: 7,
        dayName: 'Domingo',
        title: 'Preparar el nido antes de dormir',
        explanation: 'Dejar la mochila cerrada y la ropa lista la noche anterior evita las carreras y el estrés de la mañana.',
        action: 'Deja tu mochila lista cerca de la puerta antes de ir a dormir.',
        reward: 20
      }
    ]
  },
  {
    id: 2,
    weekNumber: 2,
    category: 'habilidades',
    categoryName: 'Habilidades de Autonomía',
    title: 'Organizar sus Cosas (Tener un lugar fijo)',
    subtitle: 'El orden externo ayuda a calmar el desorden interno de nuestra mente.',
    sheetImage: '/sheets/habilidades/habilidades 1.jpeg',
    author: 'Coach Marco - Universo TDAH',
    colorTheme: 'orange',
    summary: 'Cuando tengo todo en su lugar, encuentro lo que necesito y me siento mucho más tranquilo.',
    tips: [
      {
        day: 1,
        dayName: 'Lunes',
        title: 'Todo tiene su casa',
        explanation: 'Si una cosa no tiene un lugar asignado, terminará en el suelo o perdida. Cada objeto necesita su "casa" fija.',
        action: 'Asigna un cajón, caja o estante fijo para tus útiles escolares.',
        reward: 15
      },
      {
        day: 2,
        dayName: 'Martes',
        title: 'La carrera de los 5 minutos',
        explanation: 'No necesitas pasar horas limpiando. Dedicar 5 minutos con música rápida para guardar cosas es suficiente.',
        action: 'Pon 5 minutos en el temporizador y ordena lo que esté sobre tu mesa.',
        reward: 15
      },
      {
        day: 3,
        dayName: 'Miércoles',
        title: 'Listas visuales en lugares visibles',
        explanation: 'Colocar una tarjeta o dibujo con lo que debes revisar (mochila, cartuchera, llaves) evita olvidos.',
        action: 'Revisa tu checklist visual antes de salir de tu cuarto.',
        reward: 15
      },
      {
        day: 4,
        dayName: 'Jueves',
        title: 'Categorizar por colores',
        explanation: 'Los colores son procesados por el cerebro más rápido que las palabras. Un color por actividad ayuda un montón.',
        action: 'Usa una etiqueta de color para tus cuadernos principales.',
        reward: 15
      },
      {
        day: 5,
        dayName: 'Viernes',
        title: 'Vaciado nocturno de mochila',
        explanation: 'Sacar papeles arrugados, restos de meriendas y lápices sueltos hace que la mochila pese menos y se sienta fresca.',
        action: 'Abre el cierre principal de tu mochila y retira lo que no sirva.',
        reward: 15
      },
      {
        day: 6,
        dayName: 'Sábado',
        title: 'Reconocer el hábito, no la perfección',
        explanation: 'Tu habitación no tiene que verse como un museo; con que sepas dónde está cada cosa importante es un triunfo.',
        action: 'Felicítate por haber cuidado tus cosas durante la semana.',
        reward: 15
      },
      {
        day: 7,
        dayName: 'Domingo',
        title: 'El escritorio despejado para arrancar la semana',
        explanation: 'Tener una mesa vacía al levantarte el lunes te da una sensación de claridad y paz mental inmediata.',
        action: 'Deja despejada tu mesa de trabajo antes de dormir.',
        reward: 20
      }
    ]
  },
  {
    id: 3,
    weekNumber: 3,
    category: 'escuela',
    categoryName: 'Enfoque en la Escuela',
    title: 'Dificultad para Concentrarse en Clase',
    subtitle: 'No siempre es falta de interés: mantener la atención sostenida requiere un esfuerzo enorme.',
    sheetImage: '/sheets/escuela/escuela 1.jpeg',
    author: 'Coach Marco - Universo TDAH',
    colorTheme: 'blue',
    summary: 'Comprender la dificultad permite aplicar estrategias inteligentes en lugar de simplemente exigir más.',
    tips: [
      {
        day: 1,
        dayName: 'Lunes',
        title: 'Una instrucción a la vez',
        explanation: 'Cuando el profe o tus papás dicen 4 cosas seguidas, quédate solo con la primera y hazla antes de pensar en la siguiente.',
        action: 'Si te dan una tarea larga, concéntrate solo en el primer renglón.',
        reward: 15
      },
      {
        day: 2,
        dayName: 'Martes',
        title: 'Tapar lo que no estás haciendo',
        explanation: 'Ver una hoja llena de preguntas distrae los ojos. Usa una regla o una hoja en blanco para tapar las preguntas que aún no tocan.',
        action: 'Prueba tapar la mitad de tu ejercicio mientras respondes la primera parte.',
        reward: 15
      },
      {
        day: 3,
        dayName: 'Miércoles',
        title: 'Limpiar el campo visual del pupitre',
        explanation: 'Tener botellas, juguetes, borradores y lápices varios a la vista compite por tu atención visual.',
        action: 'Guarda en la cartuchera todo lo que no estés usando en este preciso minuto.',
        reward: 15
      },
      {
        day: 4,
        dayName: 'Jueves',
        title: 'Post-its de rescate para ideas espontáneas',
        explanation: 'Cuando estás estudiando y se te ocurre una idea genial pero que no tiene nada que ver, anótala en un papelito para verla después.',
        action: 'Escribe tu idea fugaz en una nota rápida y vuelve a tu tarea.',
        reward: 15
      },
      {
        day: 5,
        dayName: 'Viernes',
        title: 'Pausas activas de movimiento',
        explanation: 'El cerebro con TDAH necesita dopamina y flujo sanguíneo para recargarse. Levantarse y estirarse 60 segundos renueva el foco.',
        action: 'Párate de tu asiento, estira los brazos arriba y bebe medio vaso de agua.',
        reward: 15
      },
      {
        day: 6,
        dayName: 'Sábado',
        title: 'El poder del cuerpo doble (Body Doubling)',
        explanation: 'Hacer deberes al lado de alguien que también está trabajando en silencio hace que sea 3 veces más fácil no dispersarse.',
        action: 'Estudia o lee teniendo cerca a alguien en silencio o con la mascota Sparky.',
        reward: 15
      },
      {
        day: 7,
        dayName: 'Domingo',
        title: 'Descanso libre de culpa',
        explanation: 'El descanso no es un premio que te tienes que ganar sufriendo: es un combustible biológico necesario para tu cerebro.',
        action: 'Disfruta de tu juego o dibujo favorito sabiendo que hiciste tu mejor esfuerzo.',
        reward: 20
      }
    ]
  },
  {
    id: 4,
    weekNumber: 4,
    category: 'estrategias',
    categoryName: 'Estrategias de Estudio',
    title: 'Manejo del Tiempo y Rutinas Claras',
    subtitle: 'Cómo convertir el tiempo invisible en bloques visuales y predecibles.',
    sheetImage: '/sheets/estrategias/estrategias 2.jpeg',
    author: 'Coach Marco - Universo TDAH',
    colorTheme: 'amber',
    summary: 'Las rutinas visuales eliminan la incertidumbre y ayudan a saber exactamente qué esperar.',
    tips: [
      {
        day: 1,
        dayName: 'Lunes',
        title: 'El tiempo hecho visible',
        explanation: 'Los números de un reloj digital no se "sienten". Un reloj visual de arena o un temporizador circular te muestran cuánto tiempo queda.',
        action: 'Observa el círculo del Pomodoro en la app mientras realizas una actividad.',
        reward: 15
      },
      {
        day: 2,
        dayName: 'Martes',
        title: 'El colchón de tiempo (Buffer)',
        explanation: 'Si crees que tardarás 15 minutos, planifica 25. Ese espacio libre de colchón evita que te sientas frustrado si surge un imprevisto.',
        action: 'Agrega 10 minutos extra a tu próxima estimación de tarea.',
        reward: 15
      },
      {
        day: 3,
        dayName: 'Miércoles',
        title: 'La regla de empezar por lo que más cuesta',
        explanation: 'Al inicio de la tarde tu energía mental está más fresca. Quítate de encima lo pesado primero y lo demás será cuesta abajo.',
        action: 'Inicia con la tarea más desafiante hoy durante 15 minutos.',
        reward: 15
      },
      {
        day: 4,
        dayName: 'Jueves',
        title: 'Música sin letra o sonido blanco',
        explanation: 'Las canciones con letra distraen el centro de lenguaje de tu cerebro. Los sonidos de lluvia o ruido blanco aíslan los ruidos molestos.',
        action: 'Activa el sonido ambiente de lluvia en el Pomodoro de la app.',
        reward: 15
      },
      {
        day: 5,
        dayName: 'Viernes',
        title: 'El check verde de dopamina',
        explanation: 'Tachar o marcar una casilla completada libera una chispa de dopamina en tu cerebro que te motiva a seguir.',
        action: 'Completa al menos 2 tareas hoy y mira la animación de éxito.',
        reward: 15
      },
      {
        day: 6,
        dayName: 'Sábado',
        title: 'Sincronizar con la familia',
        explanation: 'Contarle a tu familia qué tienes planeado hace que todos remen en la misma dirección y nadie te interrumpa.',
        action: 'Dile a alguien en casa qué vas a lograr hoy antes de empezar.',
        reward: 15
      },
      {
        day: 7,
        dayName: 'Domingo',
        title: 'La revisión semanal en 5 minutos',
        explanation: 'Mirar qué salió bien esta semana te enseña qué trucos te funcionan mejor a ti.',
        action: 'Revisa tu racha y tus estrellas acumuladas en el Baúl de Poderes.',
        reward: 20
      }
    ]
  }
];

// Catálogo de todas las láminas disponibles para explorar en la biblioteca
export const ALL_SHEETS_LIBRARY = [
  { id: 'est-1', category: 'estrategias', title: 'TDAH y Organización Escolar', file: '/sheets/estrategias/estrategias 1.jpeg', week: 1 },
  { id: 'est-2', category: 'estrategias', title: 'Manejo del Tiempo y Rutinas', file: '/sheets/estrategias/estrategias 2.jpeg', week: 4 },
  { id: 'est-3', category: 'estrategias', title: 'Estrategias 3 - Frustración y Emociones', file: '/sheets/estrategias/estrategias 3.jpeg' },
  { id: 'est-4', category: 'estrategias', title: 'Estrategias 4 - Foco y Motivación', file: '/sheets/estrategias/estrategias 4.jpeg' },
  { id: 'est-5', category: 'estrategias', title: 'Estrategias 5 - Técnicas de Estudio', file: '/sheets/estrategias/estrategias 5.jpeg' },
  { id: 'est-6', category: 'estrategias', title: 'Estrategias 6 - Hábitos Saludables', file: '/sheets/estrategias/estrategias 6.jpeg' },
  { id: 'est-7', category: 'estrategias', title: 'Estrategias 7 - Comunicación Familiar', file: '/sheets/estrategias/estrategias 7.jpeg' },
  { id: 'est-8', category: 'estrategias', title: 'Estrategias 8 - Organización de Espacios', file: '/sheets/estrategias/estrategias 8.jpeg' },
  { id: 'est-9', category: 'estrategias', title: 'Estrategias 9 - Control de Impulsos', file: '/sheets/estrategias/estrategias 9.jpeg' },
  { id: 'est-10', category: 'estrategias', title: 'Estrategias 10 - Planes de Futuro', file: '/sheets/estrategias/estrategias 10.jpeg' },
  { id: 'hab-1', category: 'habilidades', title: 'Habilidades 1 - Organizar sus cosas', file: '/sheets/habilidades/habilidades 1.jpeg', week: 2 },
  { id: 'hab-2', category: 'habilidades', title: 'Habilidades 2 - Rutinas de Autonomía', file: '/sheets/habilidades/habilidades 2.jpeg' },
  { id: 'hab-3', category: 'habilidades', title: 'Habilidades 3 - Cuidado Personal', file: '/sheets/habilidades/habilidades 3.jpeg' },
  { id: 'hab-4', category: 'habilidades', title: 'Habilidades 4 - Manejo de Responsabilidades', file: '/sheets/habilidades/habilidades 4.jpeg' },
  { id: 'hab-5', category: 'habilidades', title: 'Habilidades 5 - Autonomía en Casa', file: '/sheets/habilidades/habilidades 5.jpeg' },
  { id: 'esc-1', category: 'escuela', title: 'Escuela 1 - Concentración en Clase', file: '/sheets/escuela/escuela 1.jpeg', week: 3 },
  { id: 'esc-2', category: 'escuela', title: 'Escuela 2 - Relación con Docentes', file: '/sheets/escuela/escuela 2.jpeg' },
  { id: 'esc-3', category: 'escuela', title: 'Escuela 3 - Tareas y Exámenes', file: '/sheets/escuela/escuela 3.jpeg' },
  { id: 'esc-4', category: 'escuela', title: 'Escuela 4 - Trabajo en Grupo', file: '/sheets/escuela/escuela 4.jpeg' },
  { id: 'extra-1', category: 'especial', title: 'Cambios en Secundaria', file: '/sheets/cambios en segundaria.jpeg' },
  { id: 'extra-2', category: 'especial', title: 'Cambios en Secundaria 2', file: '/sheets/cambios en segundaria 2.jpeg' },
  { id: 'extra-3', category: 'especial', title: 'No Dejar Cosas sin Terminar', file: '/sheets/no terminar.jpeg' }
];