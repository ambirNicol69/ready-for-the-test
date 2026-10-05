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
  {
    slug: 'matematicas-fracciones', subject: 'Matemáticas', title: 'Operaciones con fracciones',
    videoId: 'myT46dRc7ck', videoTitle: 'Multiplicación y división de fracciones',
    concepts: [
      { title: 'Multiplicar', text: 'Multiplica numerador por numerador y denominador por denominador. Simplifica el resultado si ambos términos tienen factores comunes.' },
      { title: 'Dividir', text: 'Para dividir por una fracción, multiplica por su recíproco: intercambia su numerador y denominador.' },
    ],
    example: { title: 'Calcula 2/3 ÷ 4/5', steps: ['Conservamos la primera fracción y cambiamos la división por multiplicación.', 'Invertimos la segunda fracción: 4/5 pasa a 5/4.', 'Multiplicamos: (2×5)/(3×4) = 10/12.', 'Simplificamos entre 2: el resultado es 5/6.'] },
    exercise: { question: '¿Cuánto es 3/4 × 2/5?', options: ['5/9', '6/20', '6/9', '5/20'], answer: 2 },
  },
  {
    slug: 'matematicas-potencias-raices', subject: 'Matemáticas', title: 'Potencias y raíces',
    videoId: 'vNDJbFGE-74', videoTitle: 'Exponentes y radicales: conceptos y ejercicios',
    concepts: [
      { title: 'Potencia', text: 'Una potencia repite una multiplicación: aⁿ significa multiplicar la base a por sí misma n veces.' },
      { title: 'Raíz cuadrada', text: 'La raíz cuadrada de un número no negativo es el valor que, elevado al cuadrado, produce ese número.' },
    ],
    example: { title: 'Calcula 2³ + √25', steps: ['2³ = 2×2×2 = 8.', '√25 = 5, porque 5×5 = 25.', 'Sumamos los resultados: 8 + 5 = 13.'] },
    exercise: { question: '¿Cuál es el valor de 3² + √16?', options: ['13', '10', '25', '7'], answer: 1 },
  },
  {
    slug: 'matematicas-proporcionalidad', subject: 'Matemáticas', title: 'Proporcionalidad y regla de tres',
    videoId: 'lY6SRJrYjQ8', videoTitle: 'Proporcionalidad directa: regla de tres',
    concepts: [
      { title: 'Proporción directa', text: 'Dos cantidades son directamente proporcionales cuando al multiplicar una por un factor, la otra se multiplica por el mismo factor.' },
      { title: 'Regla de tres', text: 'Con tres datos conocidos, se puede hallar el cuarto manteniendo equivalentes las razones.' },
    ],
    example: { title: 'Si 3 cuadernos cuestan 90 pesos, ¿cuánto cuestan 5?', steps: ['El precio por cuaderno es 90 ÷ 3 = 30 pesos.', 'Multiplicamos el precio unitario por 5 cuadernos.', '5 × 30 = 150 pesos.'] },
    exercise: { question: 'Si 4 kg de arroz cuestan 240 pesos, ¿cuánto cuestan 7 kg al mismo precio por kilo?', options: ['360 pesos', '420 pesos', '480 pesos', '280 pesos'], answer: 2 },
  },
  {
    slug: 'matematicas-funcion-lineal', subject: 'Matemáticas', title: 'Función lineal y su gráfica',
    videoId: 'KQI7KHIBeGE', videoTitle: 'Introducción a la función lineal y su gráfica',
    concepts: [
      { title: 'Regla de correspondencia', text: 'Una función lineal relaciona x con y mediante una expresión como y = mx + b. Cada valor de x produce un valor de y.' },
      { title: 'Gráfica', text: 'Al representar varios pares (x,y) en el plano, los puntos de una función lineal quedan sobre una recta. m indica la pendiente y b el cruce con el eje y.' },
    ],
    example: { title: 'Completa valores para y = 2x + 1', steps: ['Si x = 0: y = 2(0)+1 = 1; obtenemos (0,1).', 'Si x = 1: y = 2(1)+1 = 3; obtenemos (1,3).', 'Si x = 2: y = 2(2)+1 = 5; obtenemos (2,5).', 'Ubica los tres puntos: se alinean en una recta.'] },
    exercise: { question: 'En la función y = 3x + 2, ¿cuánto vale y cuando x = 2?', options: ['8', '7', '10', '5'], answer: 1 },
  },
  {
    slug: 'matematicas-sistemas-2x2', subject: 'Matemáticas', title: 'Sistemas de ecuaciones 2×2',
    videoId: 'JphWz1vyxTk', videoTitle: 'Método de reducción para sistemas de ecuaciones',
    concepts: [
      { title: 'Sistema', text: 'Un sistema reúne ecuaciones que deben cumplirse al mismo tiempo. La solución es el par de valores que satisface todas.' },
      { title: 'Reducción', text: 'Se suman o restan ecuaciones para eliminar una incógnita; luego se sustituye el valor encontrado en una ecuación original.' },
    ],
    example: { title: 'Resuelve x + y = 7 y x − y = 1', steps: ['Sumamos las ecuaciones: 2x = 8, porque y y −y se cancelan.', 'Dividimos entre 2: x = 4.', 'Sustituimos en x + y = 7: 4 + y = 7, así que y = 3.', 'La solución es (4,3); verifica ambas ecuaciones.'] },
    exercise: { question: '¿Qué solución satisface x + y = 6 y x − y = 2?', options: ['(3,3)', '(4,2)', '(2,4)', '(5,1)'], answer: 2 },
  },
  {
    slug: 'matematicas-pitagoras', subject: 'Matemáticas', title: 'Teorema de Pitágoras',
    videoId: 'w6nh99v3r4A', videoTitle: 'Teorema de Pitágoras: explicación y ejemplos',
    concepts: [
      { title: 'Triángulo rectángulo', text: 'En un triángulo con un ángulo de 90°, la hipotenusa es el lado opuesto al ángulo recto y es el lado más largo.' },
      { title: 'Relación pitagórica', text: 'Si a y b son los catetos y c la hipotenusa, entonces a² + b² = c².' },
    ],
    example: { title: 'Halla la hipotenusa de un triángulo con catetos 6 y 8', steps: ['Aplicamos c² = 6² + 8².', 'Calculamos: c² = 36 + 64 = 100.', 'Tomamos la raíz cuadrada positiva: c = 10.'] },
    exercise: { question: 'Un triángulo rectángulo tiene catetos 5 y 12. ¿Cuánto mide la hipotenusa?', options: ['13', '17', '√119', '7'], answer: 1 },
  },
  {
    slug: 'fisica-mru', subject: 'Física', title: 'Movimiento rectilíneo uniforme',
    videoId: 'dTjV_skYekE', videoTitle: 'Movimiento rectilíneo uniforme: distancia, tiempo y rapidez',
    concepts: [
      { title: 'Rapidez constante', text: 'En el MRU un objeto se desplaza en línea recta sin cambiar su rapidez; recorre distancias iguales en tiempos iguales.' },
      { title: 'Ecuación', text: 'La distancia se calcula como d = v·t. Asegúrate de usar unidades compatibles, como km/h y horas.' },
    ],
    example: { title: 'Un ciclista viaja a 12 km/h durante 2 horas', steps: ['Identificamos v = 12 km/h y t = 2 h.', 'Usamos d = v·t.', 'd = 12 × 2 = 24 km.'] },
    exercise: { question: 'Un auto viaja a 60 km/h durante 3 horas. ¿Qué distancia recorre?', options: ['20 km', '180 km', '63 km', '120 km'], answer: 2 },
  },
  {
    slug: 'fisica-mrua', subject: 'Física', title: 'Aceleración y movimiento uniformemente acelerado',
    videoId: 'qVMa62Hx5uY', videoTitle: 'Movimiento rectilíneo uniformemente acelerado',
    concepts: [
      { title: 'Aceleración', text: 'Mide cuánto cambia la velocidad por unidad de tiempo. Se expresa en m/s².' },
      { title: 'MRUA', text: 'En este movimiento la aceleración es constante; la velocidad cambia en la misma cantidad durante intervalos de tiempo iguales.' },
    ],
    example: { title: 'Una bicicleta pasa de 2 m/s a 14 m/s en 4 s', steps: ['Usamos a = (v final − v inicial) ÷ tiempo.', 'Sustituimos: a = (14 − 2) ÷ 4.', 'La aceleración es 3 m/s².'] },
    exercise: { question: 'Un móvil aumenta su velocidad de 5 m/s a 17 m/s en 3 s. ¿Cuál es su aceleración?', options: ['4 m/s²', '6 m/s²', '12 m/s²', '22 m/s²'], answer: 1 },
  },
  {
    slug: 'fisica-segunda-ley', subject: 'Física', title: 'Segunda ley de Newton: fuerza y aceleración',
    videoId: 'j9rxmPHn7vk', videoTitle: 'Segunda ley de Newton: fuerza, masa y aceleración',
    concepts: [
      { title: 'Fuerza neta', text: 'La aceleración depende de la fuerza neta aplicada y de la masa del objeto.' },
      { title: 'Segunda ley', text: 'La relación se escribe F = m·a. En unidades del SI, la fuerza se mide en newtons (N), la masa en kg y la aceleración en m/s².' },
    ],
    example: { title: '¿Qué fuerza neta acelera 4 kg a 3 m/s²?', steps: ['Usamos F = m·a.', 'Sustituimos: F = 4 × 3.', 'La fuerza neta es 12 N.'] },
    exercise: { question: '¿Qué fuerza neta se necesita para acelerar una masa de 2 kg a 5 m/s²?', options: ['7 N', '10 N', '2.5 N', '25 N'], answer: 2 },
  },
  {
    slug: 'fisica-masa-peso', subject: 'Física', title: 'Masa, peso y gravedad',
    videoId: 'ooBZ0pNXKMg', videoTitle: 'Diferencia entre masa y peso',
    concepts: [
      { title: 'Masa', text: 'Es una propiedad del cuerpo relacionada con la cantidad de materia y su inercia. Se mide en kilogramos.' },
      { title: 'Peso', text: 'Es la fuerza gravitatoria sobre una masa: P = m·g. Se mide en newtons y cambia si cambia la gravedad.' },
    ],
    example: { title: 'Calcula el peso de 5 kg en la Tierra (g ≈ 9.8 m/s²)', steps: ['Usamos P = m·g.', 'Sustituimos: P = 5 × 9.8.', 'El peso es aproximadamente 49 N.'] },
    exercise: { question: '¿Cuál afirmación distingue correctamente masa y peso?', options: ['La masa es una fuerza y se mide en N.', 'El peso es una fuerza gravitatoria y se mide en N.', 'Masa y peso siempre tienen el mismo valor.', 'El peso se mide en kg y no depende de la gravedad.'], answer: 2 },
  },
  {
    slug: 'fisica-trabajo-energia', subject: 'Física', title: 'Trabajo y energía',
    videoId: 'xD-Sqfop7AE', videoTitle: 'Ejemplos de problemas de trabajo y energía',
    concepts: [
      { title: 'Trabajo mecánico', text: 'Una fuerza realiza trabajo cuando produce desplazamiento. Si fuerza y desplazamiento van en la misma dirección, W = F·d.' },
      { title: 'Energía cinética', text: 'Es la energía asociada al movimiento: Ec = ½mv². El trabajo neto puede cambiar la energía cinética.' },
    ],
    example: { title: 'Una fuerza de 10 N desplaza una caja 3 m en su dirección', steps: ['Usamos W = F·d porque fuerza y desplazamiento tienen la misma dirección.', 'Sustituimos: W = 10 × 3.', 'El trabajo realizado es 30 J.'] },
    exercise: { question: 'Una fuerza de 8 N empuja un objeto 4 m en la misma dirección. ¿Qué trabajo realiza?', options: ['2 J', '32 J', '12 J', '4 J'], answer: 2 },
  },
  {
    slug: 'fisica-ley-ohm', subject: 'Física', title: 'Ley de Ohm y circuitos',
    videoId: 'wHQrMuJAjak', videoTitle: 'Ley de Ohm explicada con ejemplos',
    concepts: [
      { title: 'Relación eléctrica', text: 'La ley de Ohm relaciona voltaje (V), corriente (I) y resistencia (R): V = I·R.' },
      { title: 'Unidades', text: 'El voltaje se mide en voltios, la corriente en amperios y la resistencia en ohmios. Despeja la variable que necesitas.' },
    ],
    example: { title: 'Una resistencia de 6 Ω tiene una corriente de 2 A', steps: ['Usamos V = I·R.', 'Sustituimos: V = 2 × 6.', 'El voltaje es 12 V.'] },
    exercise: { question: '¿Qué corriente circula por una resistencia de 4 Ω conectada a 12 V?', options: ['48 A', '3 A', '8 A', '0.3 A'], answer: 2 },
  },
  {
    slug: 'quimica-estructura-atomica', subject: 'Química', title: 'Estructura del átomo',
    videoId: 'LCLZg18z3f0', videoTitle: 'El átomo: protones, electrones y neutrones',
    concepts: [
      { title: 'Núcleo', text: 'En el núcleo se encuentran protones, de carga positiva, y neutrones, sin carga eléctrica.' },
      { title: 'Electrones y número atómico', text: 'Los electrones tienen carga negativa y ocupan la región alrededor del núcleo. El número atómico indica la cantidad de protones.' },
    ],
    example: { title: 'Un átomo neutro de carbono tiene número atómico 6 y masa 12', steps: ['Tiene 6 protones porque su número atómico es 6.', 'Al ser neutro, tiene 6 electrones.', 'Neutrones = número de masa − protones = 12 − 6 = 6.'] },
    exercise: { question: 'Un átomo neutro tiene número atómico 8. ¿Cuántos protones y electrones tiene?', options: ['8 protones y 8 electrones', '8 protones y 16 electrones', '16 protones y 8 electrones', '8 neutrones y ningún electrón'], answer: 1 },
  },
  {
    slug: 'quimica-tabla-periodica', subject: 'Química', title: 'Organización de la tabla periódica',
    videoId: 'KYaj0r2t8DI', videoTitle: 'La tabla periódica: grupos y períodos',
    concepts: [
      { title: 'Períodos', text: 'Las filas horizontales se llaman períodos y se relacionan con los niveles de energía ocupados por los electrones.' },
      { title: 'Grupos', text: 'Las columnas verticales se llaman grupos. Los elementos de un mismo grupo suelen tener propiedades químicas parecidas.' },
    ],
    example: { title: 'Ubica el sodio (Na)', steps: ['Busca el símbolo Na en la tabla.', 'El sodio está en el grupo 1 y en el período 3.', 'Como metal alcalino del grupo 1, suele formar un ion con carga +1.'] },
    exercise: { question: '¿Cómo se llaman las columnas verticales de la tabla periódica?', options: ['Períodos', 'Grupos', 'Isótopos', 'Capas'], answer: 2 },
  },
  {
    slug: 'quimica-estados-materia', subject: 'Química', title: 'Estados y cambios de la materia',
    videoId: 'ZdPhmPNgiEw', videoTitle: 'Estados de la materia y sus cambios',
    concepts: [
      { title: 'Estados', text: 'En sólidos las partículas permanecen muy próximas; en líquidos se deslizan; en gases están más separadas y se mueven libremente.' },
      { title: 'Cambios físicos', text: 'Fusión, evaporación, condensación y solidificación cambian el estado, pero no la identidad química de la sustancia.' },
    ],
    example: { title: '¿Qué ocurre cuando el hielo se derrite?', steps: ['El hielo absorbe energía térmica.', 'Sus partículas se mueven más y dejan la estructura rígida del sólido.', 'Pasa de sólido a líquido: es fusión y sigue siendo agua.'] },
    exercise: { question: '¿Cómo se llama el cambio de gas a líquido?', options: ['Fusión', 'Condensación', 'Sublimación', 'Solidificación'], answer: 2 },
  },
  {
    slug: 'quimica-separacion-mezclas', subject: 'Química', title: 'Separación de mezclas',
    videoId: '7xdLYY2HQHg', videoTitle: 'Métodos de separación de mezclas',
    concepts: [
      { title: 'Métodos físicos', text: 'La filtración separa un sólido insoluble de un líquido; la decantación aprovecha diferencias de densidad entre fases.' },
      { title: 'Otros métodos', text: 'La evaporación permite recuperar un sólido disuelto; la destilación separa líquidos con distintos puntos de ebullición.' },
    ],
    example: { title: 'Separa arena mezclada con agua', steps: ['La arena no se disuelve en el agua.', 'Coloca papel de filtro en un embudo.', 'Vierte la mezcla: el agua pasa y la arena queda retenida.', 'El método empleado es la filtración.'] },
    exercise: { question: '¿Qué método es adecuado para separar arena insoluble del agua?', options: ['Destilación', 'Filtración', 'Imantación', 'Cromatografía'], answer: 2 },
  },
  {
    slug: 'quimica-acidos-bases-ph', subject: 'Química', title: 'Ácidos, bases y escala de pH',
    videoId: 'RjhQ2qr-mCo', videoTitle: 'Ácidos y bases: explicación y ejemplos',
    concepts: [
      { title: 'pH', text: 'El pH indica qué tan ácida o básica es una disolución acuosa. En la escala usual, 7 es neutro, valores menores son ácidos y mayores son básicos.' },
      { title: 'Indicadores', text: 'Sustancias indicadoras cambian de color según el pH y ayudan a estimar si una disolución es ácida o básica.' },
    ],
    example: { title: 'Clasifica una disolución con pH 3', steps: ['Comparamos 3 con el valor neutro 7.', 'Como 3 es menor que 7, la disolución es ácida.', 'Un pH más bajo corresponde a mayor acidez en la escala usual.'] },
    exercise: { question: 'Una disolución tiene pH 9. ¿Cómo se clasifica?', options: ['Ácida', 'Básica', 'Neutra', 'No contiene agua'], answer: 2 },
  },
  {
    slug: 'quimica-balanceo-ecuaciones', subject: 'Química', title: 'Balanceo de ecuaciones químicas',
    videoId: 'S71KeT97ptI', videoTitle: 'Balanceo de ecuaciones químicas por tanteo',
    concepts: [
      { title: 'Conservación de átomos', text: 'En una reacción química los átomos se reorganizan; el número de átomos de cada elemento debe ser igual en reactivos y productos.' },
      { title: 'Coeficientes', text: 'Se balancea cambiando coeficientes delante de las fórmulas. No se cambian los subíndices, porque eso alteraría las sustancias.' },
    ],
    example: { title: 'Balancea H₂ + O₂ → H₂O', steps: ['Hay 2 oxígenos a la izquierda y 1 a la derecha; colocamos 2 delante de H₂O.', 'Ahora hay 4 hidrógenos a la derecha; colocamos 2 delante de H₂.', 'Ecuación balanceada: 2H₂ + O₂ → 2H₂O. Hay 4 H y 2 O en cada lado.'] },
    exercise: { question: '¿Qué coeficientes balancean N₂ + H₂ → NH₃?', options: ['1, 3, 2', '1, 2, 1', '2, 3, 1', '1, 1, 1'], answer: 1 },
  },
];
