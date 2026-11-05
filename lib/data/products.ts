import type { Product } from "./types";

/**
 * Catálogo de 19 productos.
 *
 * Nombres, precios, SKU y existencias provienen de la tienda actual
 * (pilatesescencia.com, consultada el 4 de noviembre de 2026). Las fichas
 * actuales solo tienen una descripción corta; los párrafos largos y las
 * especificaciones se redactaron aquí a partir de ese texto y de las hojas de
 * datos genéricas de cada pieza.
 */

const paragraphs = (...parts: string[]): string => parts.join("\n\n");

export const products: Product[] = [
  // ---------------------------------------------------------------------------
  // Placas de desarrollo
  // ---------------------------------------------------------------------------
  {
    id: "arduino-uno-r3",
    slug: "arduino-uno-r3",
    sku: "EGR-AUR3",
    name: "Arduino Uno R3",
    category: "placas-de-desarrollo",
    price: 599.99,
    stock: 28,
    shortDescription:
      "Placa de desarrollo con microcontrolador ATmega328P, puerto USB y pines digitales y analógicos. Es la placa con la que empiezan la mayoría de las prácticas de programación y control de circuitos.",
    description: paragraphs(
      "El Arduino Uno R3 es la placa de desarrollo más usada en los laboratorios de introducción a la electrónica. Lleva un microcontrolador ATmega328P, se programa desde la computadora por USB con el IDE de Arduino y expone sus pines en conectores hembra, así que no hace falta soldar nada para empezar.",
      "Se usa en prácticas de control de LEDs, lectura de sensores analógicos, manejo de motores con PWM y comunicación serial. Como la comunidad es enorme, casi cualquier sensor o módulo del catálogo tiene una librería y un ejemplo listo para esta placa.",
      "En la caja viene la placa y un cable USB tipo A a tipo B para programarla y alimentarla desde la computadora. Si el proyecto necesita más corriente, acepta una fuente externa de 7 a 12 V por el conector de barril.",
    ),
    specs: [
      { label: "Microcontrolador", value: "ATmega328P a 16 MHz" },
      { label: "E/S digitales", value: "14 pines (6 con salida PWM)" },
      { label: "Entradas analógicas", value: "6 (ADC de 10 bits)" },
      { label: "Memoria", value: "32 KB flash, 2 KB SRAM, 1 KB EEPROM" },
      { label: "Alimentación", value: "5 V por USB o 7 a 12 V por conector de barril" },
      { label: "Conexión", value: "USB tipo B" },
    ],
    image: "/img/products/arduino.webp",
    model3d: "board",
    featured: true,
    tags: ["arduino", "uno", "microcontrolador", "placa", "atmega328p"],
    relatedSlugs: [
      "placa-de-desarrollo-esp32",
      "placa-de-pruebas-830-puntos",
      "cable-de-conexion-jumper",
      "display-lcd-16x2",
    ],
  },
  {
    id: "placa-de-desarrollo-esp32",
    slug: "placa-de-desarrollo-esp32",
    sku: "EGR-PDESP32",
    name: "Placa de Desarrollo ESP32",
    category: "placas-de-desarrollo",
    price: 499.99,
    stock: 30,
    shortDescription:
      "Placa de desarrollo con WiFi y Bluetooth integrados, pensada para proyectos de IoT y automatización. Se programa desde el IDE de Arduino o con MicroPython.",
    description: paragraphs(
      "La ESP32 es una placa de desarrollo basada en el módulo ESP32-WROOM-32 de Espressif. A diferencia del Arduino Uno, incluye WiFi y Bluetooth, un procesador de dos núcleos a 240 MHz y mucha más memoria, por lo que es la opción habitual cuando el proyecto necesita conectarse a internet o a un teléfono.",
      "En el laboratorio se usa para estaciones de monitoreo que envían datos a un servidor, control remoto por aplicación móvil, domótica y cualquier práctica de IoT. Se programa con el IDE de Arduino instalando el soporte de placas ESP32, con ESP-IDF o con MicroPython.",
      "Lleva pines macho a ambos lados para montarla directamente en una placa de pruebas y se alimenta y programa por el puerto micro USB. Toma en cuenta que trabaja a 3.3 V: sus pines no toleran 5 V, así que con sensores de 5 V hay que usar un divisor de voltaje o un convertidor de nivel.",
    ),
    specs: [
      { label: "Módulo", value: "ESP32-WROOM-32, doble núcleo Xtensa LX6 a 240 MHz" },
      { label: "Conectividad", value: "WiFi 802.11 b/g/n y Bluetooth 4.2 (clásico y BLE)" },
      { label: "Memoria", value: "520 KB SRAM y 4 MB flash" },
      { label: "GPIO", value: "Hasta 34 pines con ADC de 12 bits, DAC, PWM, I2C, SPI y UART" },
      { label: "Voltaje lógico", value: "3.3 V (alimentación de 5 V por USB o pin VIN)" },
      { label: "Conexión", value: "Micro USB con convertidor USB-serie integrado" },
    ],
    image: "/img/products/esp32.webp",
    featured: true,
    tags: ["esp32", "wifi", "bluetooth", "iot", "placa", "microcontrolador"],
    relatedSlugs: [
      "arduino-uno-r3",
      "modulo-bluetooth-hc-05",
      "sensor-de-temperatura-lm35",
      "placa-de-pruebas-830-puntos",
    ],
  },

  // ---------------------------------------------------------------------------
  // Componentes electrónicos
  // ---------------------------------------------------------------------------
  {
    id: "capacitor-ceramico-100nf",
    slug: "capacitor-ceramico-100nf",
    sku: "EGR-CC100NF",
    name: "Capacitor Cerámico 100nF",
    category: "componentes-electronicos",
    price: 12.49,
    stock: 62,
    shortDescription:
      "Capacitor cerámico de 100 nF (código 104) para filtrado y desacoplo en circuitos de baja frecuencia. Es el valor que más se repite en cualquier diseño con circuitos integrados.",
    description: paragraphs(
      "El capacitor cerámico de 100 nF, marcado como 104 en el cuerpo, es un componente pasivo que almacena una pequeña cantidad de carga eléctrica. No tiene polaridad, así que se puede conectar en cualquier sentido, y su tamaño reducido permite colocarlo muy cerca de los pines de un circuito integrado.",
      "Su uso más común en el laboratorio es el desacoplo: se coloca entre VCC y GND de cada chip para absorber los picos de corriente y evitar que el ruido de la alimentación provoque fallos. También aparece en filtros RC, circuitos antirrebote para botones, osciladores con el 555 y redes de temporización.",
      "Se vende por pieza, con terminales radiales de alambre que entran sin problema en una placa de pruebas. Conviene pedir varios: un circuito con dos o tres integrados ya necesita uno por cada chip.",
    ),
    specs: [
      { label: "Capacitancia", value: "100 nF (0.1 µF), código 104" },
      { label: "Tolerancia", value: "±20 %" },
      { label: "Voltaje máximo", value: "50 V" },
      { label: "Dieléctrico", value: "Cerámico multicapa" },
      { label: "Polaridad", value: "Ninguna" },
      { label: "Montaje", value: "Terminales radiales para agujero pasante" },
    ],
    image: "/img/products/capacitor.webp",
    model3d: "capacitor",
    featured: true,
    tags: ["capacitor", "ceramico", "100nf", "104", "filtro", "desacoplo"],
    relatedSlugs: [
      "resistor-de-precision-1k",
      "transistor-npn-2n2222",
      "placa-de-pruebas-830-puntos",
      "kit-de-prototipos-electronicos",
    ],
  },
  {
    id: "display-lcd-16x2",
    slug: "display-lcd-16x2",
    sku: "EGR-DLCD16X2",
    name: "Display LCD 16×2",
    category: "componentes-electronicos",
    price: 129.99,
    stock: 43,
    shortDescription:
      "Pantalla LCD de 16 columnas por 2 filas con retroiluminación, compatible con Arduino y otros microcontroladores. Sirve para mostrar lecturas de sensores, menús y mensajes sin necesidad de una computadora.",
    description: paragraphs(
      "El display LCD 16×2 es una pantalla alfanumérica de cristal líquido que muestra dos líneas de 16 caracteres cada una. Está controlada por el chip HD44780 o uno compatible, que es el estándar que entiende la librería LiquidCrystal de Arduino, así que ponerla a funcionar lleva unas pocas líneas de código.",
      "Se usa en el laboratorio para mostrar la temperatura de un sensor, el valor de un potenciómetro, el estado de un sistema o un menú sencillo, sin tener la placa conectada a la computadora. Se conecta en modo de 4 bits con seis pines del microcontrolador, más alimentación, retroiluminación y un potenciómetro de 10 kΩ para ajustar el contraste.",
      "Incluye la pantalla con retroiluminación LED y la tira de 16 pines macho para soldar. Si quieres ahorrar pines, puedes combinarla con un adaptador I2C que reduce la conexión a dos cables de datos.",
    ),
    specs: [
      { label: "Formato", value: "16 columnas × 2 filas, caracteres de 5×8 puntos" },
      { label: "Controlador", value: "HD44780 o compatible" },
      { label: "Alimentación", value: "5 V" },
      { label: "Interfaz", value: "Paralela de 4 u 8 bits (16 pines), compatible con LiquidCrystal" },
      { label: "Retroiluminación", value: "LED, con contraste ajustable por potenciómetro" },
      { label: "Dimensiones", value: "Aproximadamente 80 × 36 mm" },
    ],
    image: "/img/products/lcd.webp",
    featured: true,
    tags: ["lcd", "display", "pantalla", "16x2", "hd44780"],
    relatedSlugs: [
      "arduino-uno-r3",
      "sensor-de-temperatura-lm35",
      "cable-de-conexion-jumper",
      "placa-de-pruebas-830-puntos",
    ],
  },
  {
    id: "placa-de-pruebas-830-puntos",
    slug: "placa-de-pruebas-830-puntos",
    sku: "EGR-PP830",
    name: "Placa de Pruebas 830 Puntos",
    category: "componentes-electronicos",
    price: 89.99,
    stock: 59,
    shortDescription:
      "Protoboard de 830 puntos para armar circuitos sin soldar y probarlos antes de pasarlos a una placa definitiva. Es la base de casi todas las prácticas de circuitos.",
    description: paragraphs(
      "La placa de pruebas o protoboard es una base de plástico con contactos metálicos internos que permite montar circuitos insertando los componentes, sin soldadura. Las filas centrales de cinco puntos están unidas entre sí, y los dos rieles laterales corren a lo largo de la placa para distribuir alimentación y tierra.",
      "Es lo primero que se usa en una práctica: ahí se arma el divisor de voltaje, el amplificador con transistor o el circuito con el 555, se mide con el multímetro y se corrige hasta que funcione. El canal central tiene el ancho justo para montar circuitos integrados en encapsulado DIP, con una fila de pines a cada lado.",
      "Tiene 830 puntos de conexión en total: 630 en la zona central y 200 en los cuatro rieles de alimentación. Lleva cinta adhesiva en la parte trasera y pestañas laterales para unir varias placas si el circuito crece.",
    ),
    specs: [
      { label: "Puntos de conexión", value: "830 (630 en el área central y 200 en los rieles)" },
      { label: "Paso entre contactos", value: "2.54 mm" },
      { label: "Compatibilidad", value: "Terminales de 0.3 a 0.8 mm y cables de 20 a 29 AWG" },
      { label: "Rieles de alimentación", value: "4 (dos por lado)" },
      { label: "Dimensiones", value: "Aproximadamente 165 × 55 mm" },
      { label: "Montaje", value: "Base adhesiva y pestañas para unir varias placas" },
    ],
    image: "/img/products/protoboard.webp",
    featured: true,
    tags: ["protoboard", "placa de pruebas", "breadboard", "830", "prototipo"],
    relatedSlugs: [
      "cable-de-conexion-jumper",
      "arduino-uno-r3",
      "kit-de-prototipos-electronicos",
      "resistor-de-precision-1k",
    ],
  },
  {
    id: "resistor-de-precision-1k",
    slug: "resistor-de-precision-1k",
    sku: "EGR-RP1K",
    name: "Resistor de Precisión 1kΩ",
    category: "componentes-electronicos",
    price: 15.99,
    stock: 49,
    shortDescription:
      "Resistor de película metálica de 1 kΩ con tolerancia del 1 %, para circuitos donde el valor exacto importa. Uno de los valores más usados en prácticas de electrónica.",
    description: paragraphs(
      "El resistor de 1 kΩ es un componente pasivo que limita la corriente en un circuito según la ley de Ohm. La versión de precisión está fabricada con película metálica, lo que le da una tolerancia del 1 % y mucha más estabilidad frente a la temperatura que un resistor de carbón común, cuyo valor real puede variar hasta un 5 %.",
      "Se usa en divisores de voltaje, como resistencia limitadora de LEDs a 5 V, en redes de polarización de transistores, en filtros RC junto con un capacitor y en circuitos con amplificadores operacionales, donde la ganancia depende de la relación entre resistores y conviene que el valor sea exacto.",
      "Se vende por pieza, con encapsulado axial y terminales de alambre que entran directamente en una placa de pruebas. El valor se lee con el código de colores de cinco bandas: marrón, negro, negro, marrón y marrón para 1 kΩ al 1 %.",
    ),
    specs: [
      { label: "Resistencia", value: "1 kΩ" },
      { label: "Tolerancia", value: "±1 %" },
      { label: "Potencia", value: "1/4 W" },
      { label: "Tecnología", value: "Película metálica" },
      { label: "Coeficiente de temperatura", value: "±50 ppm/°C" },
      { label: "Encapsulado", value: "Axial para agujero pasante" },
    ],
    image: "/img/products/resistor.webp",
    model3d: "resistor",
    featured: true,
    tags: ["resistor", "resistencia", "1k", "precision", "pelicula metalica"],
    relatedSlugs: [
      "capacitor-ceramico-100nf",
      "transistor-npn-2n2222",
      "placa-de-pruebas-830-puntos",
      "multimetro-digital",
    ],
  },
  {
    id: "transistor-npn-2n2222",
    slug: "transistor-npn-2n2222",
    sku: "EGR-TNPN",
    name: "Transistor NPN 2N2222",
    category: "componentes-electronicos",
    price: 9.99,
    stock: 79,
    shortDescription:
      "Transistor NPN de propósito general para conmutación y amplificación de señales pequeñas. Es el primer transistor que se usa en el laboratorio para encender cargas desde un microcontrolador.",
    description: paragraphs(
      "El 2N2222 es un transistor bipolar NPN de uso general, de los más documentados que existen. Tiene tres terminales: emisor, base y colector. Una corriente pequeña en la base permite controlar una corriente mucho mayor entre colector y emisor, hasta 800 mA, que es más de lo que puede entregar cualquier pin de un microcontrolador.",
      "En prácticas se usa como interruptor para manejar un relé, un motor pequeño o varios LEDs desde un pin de Arduino, siempre con un resistor en la base. También sirve para armar amplificadores de señal pequeña en configuración emisor común, osciladores y las primeras prácticas de polarización.",
      "Se vende por pieza en encapsulado TO-92 de plástico. Antes de conectarlo conviene revisar el orden de las patas en la hoja de datos del fabricante, porque varía entre marcas; si alimenta una carga inductiva como un relé o un motor, hay que añadir un diodo en paralelo para protegerlo.",
    ),
    specs: [
      { label: "Tipo", value: "Bipolar NPN de propósito general" },
      { label: "Voltaje colector-emisor (VCEO)", value: "30 V (40 V en la versión 2N2222A)" },
      { label: "Corriente de colector máxima", value: "800 mA" },
      { label: "Ganancia de corriente (hFE)", value: "100 a 300 según la corriente de colector" },
      { label: "Potencia máxima", value: "500 mW" },
      { label: "Encapsulado", value: "TO-92" },
    ],
    image: "/img/products/transistor.webp",
    tags: ["transistor", "npn", "2n2222", "conmutacion", "amplificador"],
    relatedSlugs: [
      "resistor-de-precision-1k",
      "modulo-de-rele-5v",
      "capacitor-ceramico-100nf",
      "kit-de-prototipos-electronicos",
    ],
  },

  // ---------------------------------------------------------------------------
  // Accesorios electrónicos
  // ---------------------------------------------------------------------------
  {
    id: "cable-de-conexion-jumper",
    slug: "cable-de-conexion-jumper",
    sku: "EGR-CCJ",
    name: "Cable de Conexión Jumper",
    category: "accesorios-electronicos",
    price: 49.99,
    stock: 94,
    shortDescription:
      "Set de cables jumper para placas de pruebas, en varios colores y longitudes para identificar y ordenar las conexiones. Es el consumible que más se usa en cualquier práctica con protoboard.",
    description: paragraphs(
      "Los cables jumper son cables flexibles con terminales rígidas en los extremos que se insertan directamente en una placa de pruebas o en los pines de una placa de desarrollo. Los colores no cambian nada eléctricamente, pero sirven para seguir el circuito: por convención el rojo se usa para alimentación y el negro para tierra.",
      "Se necesitan en prácticamente todas las prácticas: conectar un sensor al Arduino, llevar la alimentación de un riel a otro en el protoboard o unir módulos entre sí. Conviene tener de los tres tipos de terminal, porque las placas de desarrollo suelen tener conectores hembra y los módulos pines macho.",
      "El set incluye cables macho-macho, macho-hembra y hembra-hembra en distintos colores y longitudes, en tiras que se pueden separar según lo que necesite cada conexión.",
    ),
    specs: [
      { label: "Tipos de terminal", value: "Macho-macho, macho-hembra y hembra-hembra" },
      { label: "Longitud", value: "10 a 20 cm según el tramo" },
      { label: "Paso de los conectores", value: "2.54 mm, compatible con protoboard y headers estándar" },
      { label: "Conductor", value: "Cobre estañado de 26 AWG aproximadamente" },
      { label: "Presentación", value: "Tiras de 40 cables separables en 10 colores" },
    ],
    image: "/img/products/jumper.webp",
    tags: ["jumper", "cables", "protoboard", "conexion", "dupont"],
    relatedSlugs: [
      "placa-de-pruebas-830-puntos",
      "arduino-uno-r3",
      "kit-de-prototipos-electronicos",
    ],
  },

  // ---------------------------------------------------------------------------
  // Herramientas electrónicas
  // ---------------------------------------------------------------------------
  {
    id: "fuente-de-alimentacion-variable",
    slug: "fuente-de-alimentacion-variable",
    sku: "EGR-FAV",
    name: "Fuente de Alimentación Variable",
    category: "herramientas-electronicas",
    price: 899.99,
    stock: 20,
    shortDescription:
      "Fuente de laboratorio regulable de 0 a 30 V y 0 a 5 A con protección contra sobrecarga, para alimentar circuitos con el voltaje y la corriente exactos que pide la práctica.",
    description: paragraphs(
      "Una fuente de alimentación variable entrega un voltaje de corriente directa ajustable, en este caso de 0 a 30 V, con un límite de corriente que también se fija a mano entre 0 y 5 A. Dos pantallas muestran en todo momento el voltaje y la corriente que está consumiendo el circuito, lo que convierte a la fuente también en un instrumento de medición.",
      "En el laboratorio se usa para alimentar cualquier montaje que no se pueda colgar del USB: amplificadores, motores, reguladores, pruebas de LEDs de potencia o circuitos de 12 V. La función más útil para un estudiante es el límite de corriente: si ajustas 100 mA antes de energizar un circuito nuevo, un corto no quema nada.",
      "Incluye la fuente con cable de alimentación y un par de cables con caimanes para conectar al circuito. Trabaja en modo de voltaje constante (CV) o de corriente constante (CC) y cambia entre ambos automáticamente según la carga.",
    ),
    specs: [
      { label: "Voltaje de salida", value: "0 a 30 V ajustable" },
      { label: "Corriente de salida", value: "0 a 5 A ajustable" },
      { label: "Modos", value: "Voltaje constante (CV) y corriente constante (CC)" },
      { label: "Indicación", value: "Pantallas digitales de voltaje y corriente" },
      { label: "Protección", value: "Sobrecarga, cortocircuito y sobretemperatura" },
      { label: "Entrada", value: "110 a 220 V CA" },
    ],
    image: "/img/products/fuente.webp",
    tags: ["fuente", "alimentacion", "regulable", "laboratorio", "30v", "5a"],
    relatedSlugs: [
      "multimetro-digital",
      "osciloscopio-portatil",
      "kit-de-herramientas-electronicas",
    ],
  },
  {
    id: "kit-de-herramientas-electronicas",
    slug: "kit-de-herramientas-electronicas",
    sku: "EGR-KHE",
    name: "Kit de Herramientas Electrónicas",
    category: "herramientas-electronicas",
    price: 399.99,
    stock: 39,
    shortDescription:
      "Kit con cautín, pinzas, desarmadores y accesorios para soldar y armar circuitos. Lo básico para dejar de depender del laboratorio y trabajar los proyectos en casa.",
    description: paragraphs(
      "El kit de herramientas reúne en un estuche lo que hace falta para soldar y ensamblar circuitos: un cautín de lápiz con punta fina, soldadura de estaño, una base para el cautín, una bomba desoldadora, pinzas de punta y de corte, desarmadores pequeños y un pelacables.",
      "Se usa cuando el prototipo del protoboard ya funciona y hay que pasarlo a una placa perforada, o cuando hay que soldar los pines de un módulo que viene sin ellos, algo muy común con sensores y pantallas. También sirve para reparar cables, cambiar un componente dañado o desoldar una pieza de una placa vieja.",
      "Todas las piezas vienen en un estuche con cierre para llevarlo al laboratorio. El cautín es de temperatura ajustable, así que sirve tanto para componentes pequeños como para terminales gruesas.",
    ),
    specs: [
      { label: "Cautín", value: "Tipo lápiz de 60 W con temperatura ajustable de 200 a 450 °C" },
      { label: "Soldadura", value: "Estaño, bomba desoldadora, base con esponja y puntas de repuesto" },
      { label: "Herramientas manuales", value: "Pinzas de punta, pinzas de corte, pelacables y pinzas antiestáticas" },
      { label: "Desarmadores", value: "Juego de precisión de punta plana y de cruz" },
      { label: "Presentación", value: "Estuche con cierre" },
    ],
    image: "/img/products/kitherramientas.webp",
    tags: ["herramientas", "cautin", "soldadura", "pinzas", "kit"],
    relatedSlugs: [
      "fuente-de-alimentacion-variable",
      "multimetro-digital",
      "kit-de-prototipos-electronicos",
    ],
  },
  {
    id: "multimetro-digital",
    slug: "multimetro-digital",
    sku: "EGR-MD",
    name: "Multímetro Digital",
    category: "herramientas-electronicas",
    price: 499.99,
    stock: 25,
    shortDescription:
      "Multímetro digital para medir voltaje, corriente y resistencia, además de probar diodos y continuidad. Es el instrumento que se usa en todas las prácticas para comprobar que el circuito hace lo que debería.",
    description: paragraphs(
      "El multímetro digital es el instrumento de medición básico en electrónica. Con un solo aparato se mide voltaje de corriente directa y alterna, corriente, resistencia, continuidad con zumbador y la caída de voltaje de un diodo, y este modelo añade capacitancia y ganancia de transistores.",
      "En cada práctica se usa para verificar que la fuente entrega el voltaje correcto, comprobar el valor real de un resistor, encontrar un cable roto con la prueba de continuidad o medir cuánta corriente consume el circuito. Aprender a usarlo bien es lo que permite entender por qué un montaje no funciona en lugar de adivinar.",
      "Incluye el multímetro, un par de puntas de prueba, la batería de 9 V y una funda protectora. Antes de medir corriente recuerda que las puntas se conectan en serie y en la entrada de amperaje, y que medir voltaje con esa configuración quema el fusible.",
    ),
    specs: [
      { label: "Pantalla", value: "LCD de 2000 cuentas con retroiluminación" },
      { label: "Voltaje", value: "Hasta 600 V en CD y CA" },
      { label: "Corriente", value: "Hasta 10 A en CD" },
      { label: "Resistencia", value: "Hasta 20 MΩ" },
      { label: "Otras funciones", value: "Continuidad con zumbador, prueba de diodos, hFE y capacitancia" },
      { label: "Alimentación", value: "Batería de 9 V (incluida)" },
    ],
    image: "/img/products/multimetro.webp",
    featured: true,
    tags: ["multimetro", "medicion", "voltaje", "corriente", "resistencia", "instrumento"],
    relatedSlugs: [
      "fuente-de-alimentacion-variable",
      "osciloscopio-portatil",
      "resistor-de-precision-1k",
      "kit-de-herramientas-electronicas",
    ],
  },
  {
    id: "osciloscopio-portatil",
    slug: "osciloscopio-portatil",
    sku: "EGR-OP",
    name: "Osciloscopio Portátil",
    category: "herramientas-electronicas",
    price: 2499.99,
    stock: 15,
    shortDescription:
      "Osciloscopio portátil con pantalla LCD y almacenamiento de capturas, para ver cómo cambia una señal en el tiempo. Pensado para prácticas de señales, PWM y comunicación serial fuera del laboratorio.",
    description: paragraphs(
      "Un osciloscopio dibuja el voltaje de una señal contra el tiempo, lo que permite ver cosas que el multímetro no muestra: la forma de una onda, su frecuencia, el ruido que lleva encima o un pulso que dura microsegundos. La versión portátil cabe en la mano, funciona con batería recargable y guarda capturas de pantalla en memoria interna.",
      "Se usa en prácticas de señales y sistemas, para verificar la salida de un oscilador con el 555, medir el ciclo de trabajo de una señal PWM de Arduino, observar la carga y descarga de un capacitor o revisar un bus serial. Tener uno propio evita hacer fila por el equipo de mesa del laboratorio.",
      "Incluye el osciloscopio, una punta de prueba con atenuación 1x/10x, un cable USB para cargar la batería y descargar las capturas, y un estuche. El ancho de banda es menor que el de un equipo de mesa: suficiente para señales de audio, PWM y comunicación serial, pero no para radiofrecuencia.",
    ),
    specs: [
      { label: "Canales", value: "1" },
      { label: "Ancho de banda", value: "1 MHz, muestreo de 5 MS/s" },
      { label: "Voltaje de entrada", value: "Hasta 400 V pico con punta 10x" },
      { label: "Pantalla", value: "LCD a color de 2.4 pulgadas" },
      { label: "Almacenamiento", value: "Capturas de pantalla en memoria interna, descarga por USB" },
      { label: "Alimentación", value: "Batería recargable por USB" },
    ],
    image: "/img/products/osciloscopio.webp",
    tags: ["osciloscopio", "portatil", "señales", "medicion", "instrumento"],
    relatedSlugs: [
      "multimetro-digital",
      "fuente-de-alimentacion-variable",
      "arduino-uno-r3",
    ],
  },

  // ---------------------------------------------------------------------------
  // Kits de aprendizaje
  // ---------------------------------------------------------------------------
  {
    id: "kit-de-prototipos-electronicos",
    slug: "kit-de-prototipos-electronicos",
    sku: "EGR-KPE",
    name: "Kit de Prototipos Electrónicos",
    category: "kits-de-aprendizaje",
    price: 299.99,
    stock: 29,
    shortDescription:
      "Kit con resistores, capacitores, transistores, LEDs y una placa de pruebas para armar los primeros circuitos. Cubre los componentes que piden en las prácticas de los primeros semestres.",
    description: paragraphs(
      "El kit de prototipos agrupa los componentes pasivos y activos que más se repiten en las prácticas de circuitos: un surtido de resistores de distintos valores, capacitores cerámicos y electrolíticos, transistores NPN y PNP, diodos, LEDs de varios colores, botones y una placa de pruebas con cables jumper para conectarlo todo.",
      "Sirve para no tener que comprar pieza por pieza antes de cada práctica. Con el contenido del kit se arman divisores de voltaje, filtros RC, rectificadores, amplificadores con transistor, temporizadores con el 555 y la mayoría de los circuitos de introducción a la electrónica analógica y digital.",
      "Todo viene organizado en una caja con compartimentos etiquetados por tipo y valor, lo que ayuda a aprender a identificar los componentes. Es un buen complemento para el Arduino Uno R3, que no incluye componentes externos.",
    ),
    specs: [
      { label: "Resistores", value: "Surtido de valores de 10 Ω a 1 MΩ, 1/4 W" },
      { label: "Capacitores", value: "Cerámicos y electrolíticos de valores comunes" },
      { label: "Semiconductores", value: "Transistores NPN y PNP, diodos rectificadores y LEDs de varios colores" },
      { label: "Placa de pruebas", value: "830 puntos con cables jumper" },
      { label: "Otros", value: "Botones, potenciómetros, zumbador y temporizador 555" },
      { label: "Presentación", value: "Caja organizadora con compartimentos" },
    ],
    image: "/img/products/kitprototipos.webp",
    tags: ["kit", "prototipos", "componentes", "protoboard", "aprendizaje"],
    relatedSlugs: [
      "placa-de-pruebas-830-puntos",
      "arduino-uno-r3",
      "cable-de-conexion-jumper",
      "kit-de-sensores-electronicos",
    ],
  },
  {
    id: "kit-de-sensores-electronicos",
    slug: "kit-de-sensores-electronicos",
    sku: "EGR-KSE",
    name: "Kit de Sensores Electrónicos",
    category: "kits-de-aprendizaje",
    price: 799.99,
    stock: 24,
    shortDescription:
      "Kit con sensores de temperatura, movimiento, luz, humedad y más, listos para conectar a Arduino o ESP32. Para prácticas de monitoreo, automatización y proyectos de IoT.",
    description: paragraphs(
      "El kit de sensores reúne módulos de medición para distintas variables físicas: temperatura y humedad, movimiento por infrarrojo, luz ambiente, sonido, distancia por ultrasonido, inclinación, gas y otros. Cada módulo viene en una pequeña placa con pines macho y, en la mayoría de los casos, con el circuito de acondicionamiento ya resuelto.",
      "Se usa en prácticas de instrumentación y en proyectos de automatización: una estación meteorológica, un sistema de alarma, control de iluminación según la luz ambiente o un robot que esquiva obstáculos. Los módulos entregan señales analógicas o digitales que se leen directamente con los pines de un Arduino o un ESP32.",
      "Los sensores vienen en una caja organizadora con separadores. Cada módulo tiene marcados sus pines (VCC, GND y señal), y para todos existen librerías y ejemplos disponibles para Arduino.",
    ),
    specs: [
      { label: "Contenido", value: "Más de 30 módulos de sensores y actuadores" },
      { label: "Variables", value: "Temperatura, humedad, luz, movimiento, sonido, distancia, inclinación y gas" },
      { label: "Salida", value: "Señal analógica o digital según el módulo" },
      { label: "Alimentación", value: "3.3 V o 5 V según el módulo" },
      { label: "Compatibilidad", value: "Arduino, ESP32, Raspberry Pi y otros microcontroladores" },
      { label: "Presentación", value: "Caja organizadora con separadores" },
    ],
    image: "/img/products/kitsensores.webp",
    tags: ["kit", "sensores", "arduino", "iot", "monitoreo", "automatizacion"],
    relatedSlugs: [
      "sensor-de-temperatura-lm35",
      "sensor-de-movimiento-pir",
      "sensor-de-luz-ldr",
      "placa-de-desarrollo-esp32",
    ],
  },

  // ---------------------------------------------------------------------------
  // Módulos electrónicos
  // ---------------------------------------------------------------------------
  {
    id: "modulo-bluetooth-hc-05",
    slug: "modulo-bluetooth-hc-05",
    sku: "EGR-MBHC05",
    name: "Módulo Bluetooth HC-05",
    category: "modulos-electronicos",
    price: 199.99,
    stock: 30,
    shortDescription:
      "Módulo Bluetooth HC-05 para comunicación serial inalámbrica entre un microcontrolador y un teléfono u otra placa. Compatible con Arduino y cualquier sistema con puerto UART.",
    description: paragraphs(
      "El HC-05 es un módulo Bluetooth clásico que funciona como un puente serial inalámbrico: todo lo que el microcontrolador envía por UART llega al dispositivo emparejado y viceversa. Puede configurarse como maestro o como esclavo mediante comandos AT, lo que permite tanto conectarlo a un teléfono como enlazar dos placas entre sí.",
      "En prácticas se usa para controlar un robot o unas luces desde una aplicación en el celular, enviar lecturas de sensores a una computadora sin cables o comunicar dos Arduinos. Basta con conectar TX y RX a los pines seriales de la placa y leer con Serial, como si fuera un cable.",
      "Viene montado en una placa adaptadora con seis pines (STATE, RXD, TXD, GND, VCC y EN) y regulador de 3.3 V integrado, así que se alimenta con 5 V. El pin RXD trabaja a 3.3 V y conviene conectarlo mediante un divisor de voltaje cuando se usa con placas de 5 V.",
    ),
    specs: [
      { label: "Versión de Bluetooth", value: "2.0 + EDR (clásico), perfil SPP" },
      { label: "Modos", value: "Maestro y esclavo, configurables por comandos AT" },
      { label: "Interfaz", value: "Serial UART, 9600 baudios por defecto" },
      { label: "Alimentación", value: "3.6 a 6 V con regulador integrado; lógica a 3.3 V" },
      { label: "Alcance", value: "Unos 10 metros sin obstáculos" },
      { label: "Emparejamiento", value: "Contraseña por defecto 1234" },
    ],
    image: "/img/products/hc05.webp",
    tags: ["bluetooth", "hc-05", "modulo", "inalambrico", "serial", "uart"],
    relatedSlugs: [
      "arduino-uno-r3",
      "placa-de-desarrollo-esp32",
      "modulo-de-rele-5v",
      "cable-de-conexion-jumper",
    ],
  },
  {
    id: "modulo-de-rele-5v",
    slug: "modulo-de-rele-5v",
    sku: "EGR-MR5V",
    name: "Módulo de Relé 5V",
    category: "modulos-electronicos",
    price: 99.99,
    stock: 40,
    shortDescription:
      "Módulo de relé de 5 V para encender y apagar cargas de mayor voltaje desde un microcontrolador. Compatible con Arduino, ESP32 y otras placas de desarrollo.",
    description: paragraphs(
      "Un relé es un interruptor electromecánico: una bobina de 5 V mueve un contacto que puede conmutar una carga completamente aislada, como un foco de 127 V o un motor de 12 V. El módulo añade a ese relé el transistor, el diodo de protección y el LED indicador necesarios para controlarlo directamente con un pin digital.",
      "Se usa en prácticas de automatización y domótica: encender una lámpara con un sensor PIR, activar una bomba según la humedad del suelo o controlar una resistencia calefactora con un termostato hecho con Arduino. Es la forma segura de que un circuito de 5 V maneje cargas que el microcontrolador no podría tocar.",
      "El módulo tiene tres pines de control (VCC, GND e IN) y una bornera de tres terminales para la carga: común, normalmente abierto y normalmente cerrado. Si vas a conectar voltaje de la red eléctrica, hazlo con supervisión y con el circuito desconectado mientras armas.",
    ),
    specs: [
      { label: "Voltaje de la bobina", value: "5 V CD" },
      { label: "Señal de control", value: "Nivel lógico de 3.3 V o 5 V, activa en bajo" },
      { label: "Capacidad de los contactos", value: "10 A a 250 V CA o 10 A a 30 V CD" },
      { label: "Contactos", value: "Un polo, dos tiros (COM, NO, NC) con bornera de tornillo" },
      { label: "Protección", value: "Optoacoplador y diodo de rueda libre" },
      { label: "Indicadores", value: "LED de alimentación y de activación" },
    ],
    image: "/img/products/rele.webp",
    tags: ["rele", "relevador", "modulo", "conmutacion", "automatizacion", "5v"],
    relatedSlugs: [
      "transistor-npn-2n2222",
      "sensor-de-movimiento-pir",
      "arduino-uno-r3",
      "placa-de-desarrollo-esp32",
    ],
  },

  // ---------------------------------------------------------------------------
  // Sensores electrónicos
  // ---------------------------------------------------------------------------
  {
    id: "sensor-de-luz-ldr",
    slug: "sensor-de-luz-ldr",
    sku: "EGR-SLLDR",
    name: "Sensor de Luz LDR",
    category: "sensores-electronicos",
    price: 29.99,
    stock: 60,
    shortDescription:
      "Fotorresistencia LDR que cambia su resistencia según la luz que recibe. Se usa para detectar día y noche, medir intensidad luminosa y encender luces automáticamente.",
    description: paragraphs(
      "El LDR (resistor dependiente de la luz) es un sensor pasivo cuya resistencia baja cuando aumenta la luz: puede pasar de más de un megaohm en la oscuridad a unos cientos de ohms a plena luz. No tiene polaridad ni necesita alimentación propia; se conecta como un resistor más.",
      "Es el sensor con el que se enseña la lectura analógica: en serie con un resistor fijo de 10 kΩ forma un divisor de voltaje cuya salida se lee en un pin analógico del Arduino. Con eso se arman luces nocturnas automáticas, seguidores solares sencillos, alarmas de apertura de cajones o medidores de luz para una estación ambiental.",
      "Se vende por pieza, en formato de disco de 5 mm con dos terminales de alambre que entran en la placa de pruebas. La respuesta no es lineal ni muy rápida, pero es suficiente para distinguir niveles de luz en cualquier práctica.",
    ),
    specs: [
      { label: "Tipo", value: "Fotorresistencia de sulfuro de cadmio (CdS)" },
      { label: "Resistencia con luz (10 lux)", value: "10 a 20 kΩ" },
      { label: "Resistencia en oscuridad", value: "1 MΩ o más" },
      { label: "Voltaje máximo", value: "150 V" },
      { label: "Potencia máxima", value: "100 mW" },
      { label: "Diámetro", value: "5 mm" },
    ],
    image: "/img/products/ldr.webp",
    tags: ["ldr", "fotorresistencia", "luz", "sensor", "analogico"],
    relatedSlugs: [
      "resistor-de-precision-1k",
      "arduino-uno-r3",
      "sensor-de-movimiento-pir",
      "kit-de-sensores-electronicos",
    ],
  },
  {
    id: "sensor-de-movimiento-pir",
    slug: "sensor-de-movimiento-pir",
    sku: "EGR-SMPIR",
    name: "Sensor de Movimiento PIR",
    category: "sensores-electronicos",
    price: 89.99,
    stock: 50,
    shortDescription:
      "Sensor PIR que detecta la presencia de personas por el calor que emiten. Se usa en alarmas, luces automáticas y prácticas de automatización con Arduino.",
    description: paragraphs(
      "El sensor PIR (infrarrojo pasivo) detecta cambios en la radiación infrarroja de su campo de visión, que es lo que ocurre cuando una persona o un animal se mueve frente a él. No emite nada: solo compara el calor que llega a sus dos elementos sensibles a través del domo de plástico, que funciona como una lente que amplía el ángulo de detección.",
      "En el laboratorio se usa para armar una alarma, encender una luz o un ventilador al entrar alguien, contar personas en una puerta o despertar a un microcontrolador que estaba en reposo. Entrega una salida digital: 3.3 V cuando detecta movimiento y 0 V en reposo, así que se lee con un simple digitalRead.",
      "El módulo trae tres pines (VCC, OUT y GND) y dos potenciómetros para ajustar la sensibilidad y el tiempo que la salida se mantiene activa. Necesita unos 30 a 60 segundos de calentamiento después de alimentarlo antes de dar lecturas confiables.",
    ),
    specs: [
      { label: "Alimentación", value: "4.5 a 20 V CD con regulador integrado" },
      { label: "Salida", value: "Digital de 3.3 V, en alto cuando detecta movimiento" },
      { label: "Rango de detección", value: "Hasta 7 m, ángulo de unos 110°" },
      { label: "Ajustes", value: "Sensibilidad y tiempo de retardo (de 5 s a 5 min) con potenciómetros" },
      { label: "Consumo", value: "Menos de 65 µA en reposo" },
      { label: "Modos", value: "Disparo único o repetible, seleccionable con puente" },
    ],
    image: "/img/products/pir.webp",
    model3d: "pir",
    featured: true,
    tags: ["pir", "movimiento", "presencia", "sensor", "infrarrojo", "hc-sr501"],
    relatedSlugs: [
      "modulo-de-rele-5v",
      "arduino-uno-r3",
      "sensor-de-luz-ldr",
      "kit-de-sensores-electronicos",
    ],
  },
  {
    id: "sensor-de-temperatura-lm35",
    slug: "sensor-de-temperatura-lm35",
    sku: "EGR-STLM35",
    name: "Sensor de Temperatura LM35",
    category: "sensores-electronicos",
    price: 59.99,
    stock: 40,
    shortDescription:
      "Sensor de temperatura LM35 con salida analógica de 10 mV por grado Celsius, listo para leer con un microcontrolador sin calibración. Para prácticas de monitoreo ambiental y control de temperatura.",
    description: paragraphs(
      "El LM35 es un sensor de temperatura integrado que entrega un voltaje proporcional a la temperatura en grados Celsius: 10 mV por cada grado, de modo que a 25 °C la salida es de 250 mV. Viene calibrado de fábrica y no necesita componentes externos, lo que lo hace mucho más sencillo que un termistor.",
      "Se usa en prácticas de instrumentación y en proyectos de control: un termostato con relé, el registro de temperatura de un cuarto, el monitoreo de un disipador o la primera práctica de lectura analógica con Arduino. La conversión en código es una sola línea: temperatura = lectura × 5.0 / 1023 × 100.",
      "Se vende por pieza en encapsulado TO-92, con tres patas: alimentación, salida y tierra. Como la salida es de pocos milivolts, conviene usar cables cortos y, si se requiere más resolución, usar la referencia analógica interna de 1.1 V del microcontrolador.",
    ),
    specs: [
      { label: "Rango de medición", value: "-55 a 150 °C" },
      { label: "Sensibilidad", value: "10 mV/°C, salida lineal" },
      { label: "Precisión", value: "±0.5 °C a 25 °C" },
      { label: "Alimentación", value: "4 a 30 V CD" },
      { label: "Consumo", value: "60 µA" },
      { label: "Encapsulado", value: "TO-92 de 3 terminales" },
    ],
    image: "/img/products/lm35.webp",
    tags: ["lm35", "temperatura", "sensor", "analogico", "to-92"],
    relatedSlugs: [
      "display-lcd-16x2",
      "arduino-uno-r3",
      "sensor-de-luz-ldr",
      "kit-de-sensores-electronicos",
    ],
  },
];
