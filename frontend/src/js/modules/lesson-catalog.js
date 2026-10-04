export const LESSONS = [
  {
    slug: 'quimica-enlaces',
    subject: 'Química',
    title: 'Enlaces químicos',
    videoId: '8FaiMx-JnmA',
    videoTitle: 'Tipos de enlaces químicos: iónico, covalente y metálico',
    concepts: [
      { title: 'Enlace iónico', text: 'Un átomo transfiere electrones a otro. Se forman iones de cargas opuestas que se atraen; suele ocurrir entre un metal y un no metal.' },
      { title: 'Enlace covalente', text: 'Dos átomos, generalmente no metálicos, comparten uno o más pares de electrones.' },
      { title: 'Enlace metálico', text: 'Los átomos metálicos comparten electrones deslocalizados, lo que ayuda a explicar la conductividad eléctrica.' },
    ],
    example: {
      title: '¿Qué enlace se forma en el cloruro de sodio (NaCl)?',
      steps: [
        'El sodio (Na) es un metal y tiene un electrón de valencia que puede ceder.',
        'El cloro (Cl) es un no metal y puede aceptar ese electrón para completar su capa externa.',
        'Al transferirse el electrón, quedan Na⁺ y Cl⁻. Sus cargas opuestas se atraen.',
        'La proporción 1:1 equilibra las cargas: la unión es iónica y la fórmula es NaCl.',
      ],
    },
    exercise: {
      question: '¿Qué sucede principalmente en un enlace covalente?',
      options: ['Se transfieren protones.', 'Se comparten pares de electrones.', 'Se destruyen los electrones.', 'Se forman únicamente iones metálicos.'],
      answer: 2,
    },
  },
  {
    slug: 'fisica-inercia',
    subject: 'Física',
    title: 'Primera ley de Newton: inercia',
    videoId: 'j-xupdmUohw',
    videoTitle: 'Las leyes de Newton explicadas con superhéroes',
    concepts: [
      { title: 'Inercia', text: 'Es la tendencia de un cuerpo a conservar su estado de reposo o de movimiento rectilíneo uniforme.' },
      { title: 'Fuerza neta cero', text: 'Si la suma de las fuerzas sobre un cuerpo es cero, su velocidad no cambia. Puede estar quieto o moverse en línea recta a velocidad constante.' },
      { title: 'Fuerzas equilibradas', text: 'Puede haber varias fuerzas actuando y aun así tener fuerza neta cero, si se equilibran entre sí.' },
    ],
    example: {
      title: 'Un libro permanece quieto sobre una mesa. ¿Por qué?',
      steps: [
        'La gravedad ejerce sobre el libro una fuerza hacia abajo llamada peso.',
        'La mesa ejerce una fuerza normal de igual magnitud hacia arriba.',
        'Las dos fuerzas se equilibran, así que la fuerza neta es cero.',
        'Como la velocidad no cambia, el libro permanece en reposo por la primera ley de Newton.',
      ],
    },
    exercise: {
      question: 'Un carrito se mueve en línea recta con velocidad constante. ¿Qué afirmación describe su fuerza neta?',
      options: ['Apunta siempre hacia adelante.', 'Es cero: las fuerzas están equilibradas.', 'Aumenta continuamente.', 'No actúa ninguna fuerza en absoluto.'],
      answer: 2,
    },
  },
  {
    slug: 'matematicas-ecuaciones',
    subject: 'Matemáticas',
    title: 'Ecuaciones de primer grado',
    videoId: 'S7SdHnXr_Mc',
    videoTitle: 'Resolver ecuaciones de primer grado desde cero',
    concepts: [
      { title: 'Igualdad', text: 'Una ecuación afirma que dos expresiones tienen el mismo valor. Resolverla es encontrar el valor de la incógnita que hace cierta esa igualdad.' },
      { title: 'Operaciones inversas', text: 'Para aislar la incógnita, deshacemos las operaciones en orden inverso: sumar se deshace restando y multiplicar se deshace dividiendo.' },
      { title: 'Equilibrio', text: 'Toda operación aplicada a un lado de la ecuación debe aplicarse también al otro para mantener la igualdad.' },
    ],
    example: {
      title: 'Resuelve 3x + 5 = 20',
      steps: [
        'Restamos 5 en ambos lados: 3x + 5 − 5 = 20 − 5.',
        'Simplificamos: 3x = 15.',
        'Dividimos ambos lados entre 3: x = 15 ÷ 3.',
        'Solución: x = 5. Comprobación: 3(5) + 5 = 20.',
      ],
    },
    exercise: {
      question: 'Resuelve 4x − 6 = 10. ¿Cuánto vale x?',
      options: ['x = 1', 'x = 4', 'x = 16', 'x = −4'],
      answer: 2,
    },
  },
];
