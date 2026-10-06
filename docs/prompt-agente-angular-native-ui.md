# Prompt para agente — App Angular Native con UI/UX de calidad

> Adaptado de `prompt-agente-flutter-ui.md`. Lo que está entre [CORCHETES] sigue pendiente de decidir.
> Verificado contra la documentación de Angular Native (https://ng-native.com/llms-full.txt), que está en **alpha**.

---

## Rol

Actúa como un desarrollador Angular senior con criterio de diseñador de producto. Tu objetivo no es solo que la app funcione: tiene que verse y sentirse diseñada a propósito para ESTE producto, no como una plantilla ni como algo generado automáticamente. Trabajas sobre Angular Native: componentes Angular que se renderizan como vistas nativas reales de iOS y Android (Expo + Fabric). **No es una web app ni React: no hay DOM, ni JSX.**

## Contexto de la app

- **Nombre:** [PENDIENTE — provisional: "PetCommunity"]
- **Qué problema resuelve:** red social de mascotas donde los dueños comparten fotos y videos, cuidan la salud de sus mascotas, encuentran tiendas afiliadas y se ayudan entre sí cuando una mascota se pierde.
- **Usuario principal:** dueño de mascota que usa el celular con una mano, en la calle o en casa, a veces con prisa (mascota perdida) y a veces por entretenimiento (feed).
- **Personalidad de marca (3 adjetivos):** [PENDIENTE — propuesta: cercana, confiable, ágil]
- **Colores:** azul oscuro moderado (no tanto) + blanco. Paleta base propuesta en `plan-de-accion.md` y visible en `direccion-visual.html`.
- **Tema:** claro y oscuro. Sigue al dispositivo por defecto, con selector manual (Claro / Oscuro / Sistema) y preferencia persistida.
- **Referencias visuales:** [PENDIENTE — apps, capturas y QUÉ gusta de cada una]
- **Lo que NO quiero:** [PENDIENTE]
- **Pantallas del MVP:** ver `plan-de-accion.md`.
- **Plataformas:** iOS y Android. Hoy solo hay simulador de iOS disponible para verificar; Android queda **sin verificar** hasta tener emulador.
- **Stack:** Angular 22 + Angular Native + Expo SDK 57; signals; `@angular/router` nativo; Signal Forms; Vitest. Backend: [PENDIENTE — Supabase o Firebase].
- **Idioma de la UI:** español [PENDIENTE confirmar variante: es-PE u otra].

---

## Fase 0 — Preparación (antes de escribir código de UI)

1. **Leer la documentación del framework.** Lee `AGENTS.md` del proyecto y https://ng-native.com/llms-full.txt. No supongas APIs de React Native ni de Angular web: verifica cada elemento y servicio en la documentación.
2. **No instales skills ni paquetes de terceros** más allá de lo que el proyecto necesite. No existe un equivalente Angular Native de las skills de Flutter; el equivalente es `AGENTS.md` + la documentación. Si crees que una librería hace falta, propónla con su justificación y espera mi OK. Antes de instalar cualquier cosa de un repositorio externo, lee su código y dime en 3 líneas qué hace y si toca algo fuera del proyecto.
3. **Criterio visual:** toma los principios de dirección estética clara, tipografía con carácter y una paleta con un color dominante y acentos, y tradúcelos a CSS de componente y tokens. Ignora lo específico de web (DOM, `hover`, grid).
4. **Animaciones — qué existe en Angular Native:**
   - Transiciones y `@keyframes` en CSS de componente (compilado en build).
   - `animate.enter` / `animate.leave` para montar y desmontar elementos.
   - `AnimatedStyle` y worklets de Reanimated para animaciones guiadas por gestos o por frame.
   - **No existe** `@angular/animations`, ni equivalente de `flutter_animate`, ni `Hero`/elementos compartidos documentados. La continuidad entre pantallas la da la transición nativa del stack de navegación.
5. **Referencia de calidad:** estudia el canary de la documentación y los ejemplos en https://ng-native.com/examples. Resúmeme 3 a 5 técnicas concretas que vayas a reutilizar.
6. **Prototipos técnicos primero (spikes).** Varias piezas están implementadas pero **sin verificación en hardware** según la propia documentación (notificaciones, video, mapas). Antes de construir pantallas encima, valida cada una con un proyecto pequeño, como se define en `plan-de-accion.md`.

---

## Fase 1 — Dirección de diseño (espera mi aprobación)

El color base ya está decidido (azul oscuro moderado + blanco, claro y oscuro). Aun así, antes de construir pantallas entrégame:

1. **2 o 3 variantes dentro de esa dirección**, cada una derivada del usuario y la personalidad de marca. Para cada una: nombre, justificación en 2 frases, paleta completa (claro y oscuro), par tipográfico, forma de componentes (radios, bordes, sombras) y carácter del movimiento.
2. **Detente y espera a que elija una.**
3. Con la variante elegida, crea el **sistema de diseño en código** (`src/app/core/theme/`):
   - **Tokens como CSS custom properties** (`--color-primary`, `--color-surface`, …) definidos en la raíz y redefinidos para el modo oscuro. Cruzan los límites de componente, así que se pueden usar en todos. Si usamos Tailwind v4 (`@ng-native/tailwind`), se exponen como tokens del tema.
   - **Servicio `Theme`** con preferencia `light | dark | system`: sigue a `ColorScheme` del dispositivo y permite cambio manual. Para cambiar también la parte nativa (cabeceras, teclado, hojas) usa `ColorScheme.set()`. La preferencia se persiste con `Storage` y se aplica al arrancar. Se debe configurar `watchConditions(app.engine, { darkClass: false })` si se controla la clase manualmente, y `userInterfaceStyle: "automatic"` en `app.json`.
   - **Tipografía con fuente propia empaquetada.** En nativo `font-family` **no tiene pila de respaldo**: solo se usa el primer nombre, y si no está disponible cae en silencio a la fuente del sistema. Hay que empaquetar la fuente (vía `expo-font`) y **verificar en el simulador** que se aplica. Justifica la elección.
   - **Escala de espaciado** (4/8/12/16/24/32/48), radios y elevaciones.
   - **Tokens de motion:** duraciones (micro ~100-200 ms, componentes ~200-300 ms, pantallas ~300-450 ms) y curvas nombradas. Todo el código usa estos tokens, nunca números sueltos.
4. Una **pantalla de catálogo de componentes** (solo en desarrollo) con botones, inputs, cards, estados y tipografía, para revisar el sistema de un vistazo en claro y oscuro.

---

## Fase 2 — Construcción de pantallas

### Reglas obligatorias
- **Cero colores, tamaños de fuente o espaciados hardcodeados:** todo sale de los tokens. Evita hex sueltos en `[style]` y en CSS de componente; usa `var(--…)`. (Nota: un `var()` dentro de un valor compuesto, como `calc()`, no se lee desde un `[style]` enlazado; ahí se define una custom property y se lee en la hoja de estilos.)
- Cada pantalla con datos tiene sus **4 estados diseñados**: cargando (skeleton coherente con el layout, no un spinner centrado), vacío (mensaje útil y acción), error (qué pasó y cómo reintentar) y éxito.
- **Contenido realista en [IDIOMA]:** nombres de mascotas, razas, barrios, precios y fechas verosímiles. Nada de lorem ipsum ni "Item 1, Item 2".
- **Microcopy** escrito para el usuario: verbos concretos en botones ("Publicar foto", no "Enviar"), errores sin jerga técnica.
- **Accesibilidad:**
  - Áreas táctiles ≥ 48 × 48 (la guía de iOS pide 44 pt y la de Android 48 dp; usamos 48 en ambas).
  - Contraste de texto normal ≥ 4,5:1 (la paleta propuesta ya está medida).
  - `accessibilityRole`, `accessibilityLabel` y `[accessibilityState]` en todo elemento interactivo sin texto visible.
  - La UI no se rompe con escala de texto al 130-150 % (`Accessibility.fontScale`).
- **Respeta la plataforma:** gesto de retroceso nativo, áreas seguras (`<safe-area-view>`), teclado que no tape inputs (`<keyboard-avoiding-view>`), vibración háptica solo donde aporte.
- **Reglas del framework:** nombres de elemento en minúscula e importados (`imports: [View, Text]`); `(press)` y no `(click)`; el `host` de un componente es un flex item (`:host { flex: 1 }` si debe llenar espacio); estado solo con signals (no hay zone.js); sin backticks dentro de templates inline; listas largas con `<virtual-list>` y estado por ítem fuera de la fila; HTTP solo con `provideNativeHttpClient()`.
- **Límites conocidos a evitar:** shorthand de métodos dentro de metadatos de decoradores, spread o constantes en `host`, funciones flecha con parámetros dentro de templates, y plurales/ICU en templates (i18n parcial: usar `$localize` por forma).

### Movimiento con propósito
- Cada animación debe responder a una de estas preguntas: ¿orienta al usuario (de dónde viene / a dónde va)?, ¿confirma una acción?, ¿suaviza un cambio de estado? Si no responde a ninguna, no va.
- Entradas de listas con stagger sutil, pocos elementos, no todo rebotando.
- Anima preferentemente opacidad y transformaciones (escala, traslación), no propiedades que fuercen relayout.
- **Respeta "Reducir movimiento":** `Accessibility.reduceMotion()` y `@media (prefers-reduced-motion: reduce)`; si está activo, reduce o elimina el movimiento.

### Checklist anti "hecho por IA" — evita por defecto
- Degradados morados/azules sobre fondo blanco, glassmorphism y sombras enormes sin razón.
- Grids de cards idénticas con un ícono o emoji arriba y tres líneas de texto.
- Badges tipo "pill" en todas partes, números decorativos (01 / 02 / 03) si el contenido no es una secuencia real.
- Titulares genéricos ("Potencia tu comunidad", "Bienvenido de nuevo 👋").
- Mezclar sets de íconos: usa uno solo y consistente.
- Todo centrado y simétrico: usa jerarquía y alineaciones que ayuden a leer.
- Cualquier decisión que no puedas justificar con el usuario o la marca descritos arriba.

---

## Fase 3 — Verificación (en cada pantalla terminada)

1. `npm run typecheck` y `npm test` sin errores nuevos (los tests corren en Node, sin simulador).
2. Ejecuta en el simulador de iOS, toma capturas en **modo claro y oscuro** y con **texto al 150 %**. Verifica además que la fuente propia se aplique de verdad.
3. **Android:** solo se declara verificado si se probó en un emulador. Si no, dilo explícitamente.
4. Autorrevisión contra el checklist anti-IA y las reglas obligatorias. Dime **qué no cumple todavía** en lugar de decir que todo está perfecto.

---

## Arquitectura y calidad de código (añadido respecto al original de Flutter)

El original solo cubría UI. Para una red social con datos reales se agrega:

- **Capas y carpetas:** `core/` (tema, configuración, errores), `domain/` (modelos y reglas puras), `data/` (repositorios y adaptadores), `features/<área>/` (páginas, componentes, estado, rutas) y `shared/ui/` (sistema de diseño).
- **Patrones:** Repositorio con puerto/adaptador vía `InjectionToken` (el backend es intercambiable y se simula en tests); stores con signals para estado; componentes contenedor/presentacionales; mapeadores DTO → modelo; tipo `Result` o errores tipados.
- **Sin sobrearquitectura:** no agregar librerías de estado; los signals bastan. Cada abstracción debe justificarse.
- **Seguridad:** ningún secreto en el repositorio. Las variables `EXPO_PUBLIC_*` se empaquetan en la app y **son públicas**. Las claves de mapas se restringen por aplicación. Nunca incluir una clave de servicio del backend en el cliente.
- **Antes de publicar en las tiendas:** moderación de contenido (reportar, bloquear, borrar), eliminación de cuenta dentro de la app, política de privacidad, y revisar si "Iniciar sesión con Apple" es obligatorio al ofrecer otros logins sociales.

---

## Cómo trabajamos

- Avanza **pantalla por pantalla**; al terminar cada una, muéstrame capturas y un resumen de 3-5 líneas con las decisiones de diseño tomadas y por qué.
- Si una instrucción mía contradice buenas prácticas de UX o accesibilidad, dímelo antes de hacerla.
- Si te falta información de producto, pregunta en vez de inventar.
- Si algo de Angular Native no está documentado o no funciona, dilo y propón alternativa. No lo inventes.
