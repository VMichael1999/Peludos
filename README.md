# Peludos 🐾

Red social para mascotas: comparte fotos y reels, avisa cuando una mascota se pierde, lleva su carnet de salud y encuentra las veterinarias y tiendas más cercanas.

![Angular Native](https://img.shields.io/badge/Angular_Native-22-DD0031?logo=angular&logoColor=white)
![Expo](https://img.shields.io/badge/Expo_SDK-57-000020?logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Tests](https://img.shields.io/badge/tests-102_passing-2EA043)
![License](https://img.shields.io/badge/license-MIT-blue)

Está hecha con [Angular Native](https://ng-native.com): componentes de Angular que se dibujan como vistas nativas reales de iOS y Android (no es una web envuelta). Es un prototipo: funciona de punta a punta con datos de ejemplo, y los lugares cercanos pueden venir de Google Places.

## Qué hace

| Área | Pantallas |
|---|---|
| **Cuenta** | Entrar (con "Recordarme" y acceso rápido con Face ID o huella), crear cuenta, recuperar contraseña |
| **Comunidad** | Inicio con historias y feed, Reels a pantalla completa, Explorar con búsqueda y filtros, Crear publicación |
| **Alertas de mascota perdida** | Mapa con tu radio, reportar una mascota, detalle con avistamientos ("Lo vi") |
| **Cuidado** | Perfil de cada mascota, carnet de salud con próximas vacunas y peso |
| **Lugares** | Veterinarias, pet shops y peluquerías cercanas, ordenadas por distancia, y ficha de tienda con catálogo |
| **Cuenta y ajustes** | Notificaciones por urgencia, tema claro / oscuro / sistema, privacidad, eliminar cuenta |

El diseño completo, pantalla por pantalla, está en [`docs/pantallas.html`](docs/pantallas.html).

## Empezar

Necesitas Node 22 (con el que se desarrolló) y un simulador de iOS o Android. La mayoría de pantallas corren en **Expo Go**; el mapa nativo necesita la app de desarrollo (`npx expo run:ios`, con Xcode y CocoaPods).

```sh
git clone https://github.com/VMichael1999/Peludos.git
cd Peludos
npm install
cp .env.example .env     # opcional: ver "Mapas y ubicación"
npm start                # Metro; para el mapa nativo y los reels hace falta la app de desarrollo (ver abajo)
```

Otros comandos:

```sh
npm test            # Vitest, en Node contra una capa nativa simulada: no hace falta simulador
npm run typecheck   # compilador de Angular, que también revisa las plantillas
```

En desarrollo, la pantalla de entrada precarga un correo de prueba. La autenticación es de ejemplo: cualquier correo vale y la contraseña necesita 8 caracteres o más.

## Mapas y ubicación

Sin configurar nada, la app muestra lugares de ejemplo y lo dice en pantalla. Para ver lugares reales:

1. En [Google Cloud](https://console.cloud.google.com) habilita **Places API (New)** en tu proyecto.
2. Crea una clave y guárdala en `.env` como `GOOGLE_MAPS_API_KEY` (el archivo `.env` no se versiona).
3. Reinicia Metro con `npx expo start --clear` y permite la ubicación cuando la app la pida.

La clave viaja dentro de la app, así que **restríngela** en Google Cloud a las APIs que uses. En producción, lo seguro es pasar las llamadas por un servidor propio. Mientras pruebas en Expo Go, no la restrinjas por bundle ID de iOS: Expo Go tiene el suyo.

### Mapa nativo

El directorio de tiendas y la pantalla de Alertas usan el mapa real, `expo-maps`: Apple Maps en iOS (sin clave) y Google Maps en Android (con `GOOGLE_MAPS_API_KEY`). Muestra los 15 lugares más cercanos con un color por tipo (veterinaria, tienda, peluquería) y tu posición; tocar un marcador abre el lugar. En Alertas muestra tu posición, el radio de aviso de 3 km y un marcador rojo por mascota perdida o verde por encontrada; el botón de ubicación vuelve a centrar el mapa. Las alertas de ejemplo se colocan a su distancia de tu posición real, y las alertas reales traerán sus coordenadas. Sin coordenadas reales (lugares de ejemplo) o en Expo Go, que no incluye el módulo, se queda el mapa dibujado.

- Exige **iOS 18** o superior, que ya está en `app.json` (`expo-build-properties`).
- `expo run:ios` falla si la ruta del proyecto tiene **espacios** (por ejemplo `Angular Native`): un script de Expo no las entrecomilla. Compila desde una ruta sin espacios.
- Con CocoaPods en Ruby 2.6, exporta `LANG=en_US.UTF-8` antes de `pod install`.

## Videos de los reels

Los reels son un feed vertical de videos de mascotas de [Pixabay](https://pixabay.com/api/docs/) (clave gratuita, 100 peticiones por minuto), con categorías (Perros, Gatos, Cachorros, Gatitos, Mascotas, Animales, Divertidos). Sin clave se ven reels de ejemplo sin video.

1. Crea una clave en <https://pixabay.com/api/docs/> y guárdala en `.env` como `PIXABAY_API_KEY` (el archivo no se versiona).
2. Reinicia Metro con `npx expo start --clear` y **recompila la app de desarrollo** (`npx expo run:ios`): la clave se incorpora a la configuración al compilar.

Cómo funciona:

- **Un video a la vez.** Solo el reel en pantalla se reproduce (en bucle); se pausa al salir. El siguiente se carga en pausa para empezar al instante, y el resto no tiene reproductor.
- **Toque** pausa y reanuda. **El sonido** se silencia con el botón de arriba y se mantiene al navegar.
- **Paginación** de 10 en 10, pidiendo la siguiente cuando quedan 3 por delante, sin peticiones repetidas. Se manejan la primera carga, la carga de más páginas, el error con «Reintentar», la respuesta vacía y el fin de resultados. Los mensajes son en lenguaje llano: nunca muestran la clave ni detalles técnicos.
- **Calidad:** de las que ofrece Pixabay se elige una vertical si existe y, si no, la más ligera con lado corto de al menos 720 px.
- **Reintento automático:** el CDN de Pixabay a veces falla al primer intento con un archivo que aún no tiene en caché; el reproductor lo carga de nuevo hasta dos veces antes de mostrar el error.
- **Cambiar la búsqueda** es editar `REEL_CATEGORIES` en `reels.store.ts`; la pantalla no conoce la API ni la clave (`VideoFeedRepository` es el puerto, `PixabayVideoFeedRepository` el adaptador).

La vista nativa de video necesita que se le pase el **id** del reproductor (`__expo_shared_object_id__`), no el reproductor: así lo hace el propio `expo-video` en React. Con el objeto, la vista queda en blanco aunque el audio suene.

Pixabay pide, con cariño, mencionar la fuente: cada reel muestra al autor del video.

## Fotos de las mascotas

Con `PIXABAY_API_KEY` (la misma de los reels), las fotos de mascotas vienen de [Pixabay](https://pixabay.com/api/docs/); sin ella, de Dog CEO (perros) y The Cat API (gatos). `PetPortraits` reparte un retrato por mascota, **el mismo en todas las pantallas**: historias, publicaciones, reels, perfil, selector de mascotas y alertas. Cada nombre toma el siguiente retrato libre de un conjunto que se pide una vez por especie, y la galería del perfil sale del resto del conjunto, así el retrato no se repite en su galería. Las fotos son aleatorias y no coinciden con la raza escrita (una «Golden retriever» puede salir como otra raza); el retrato dura lo que dura la sesión.

El perfil muestra la galería de la mascota, sus reels (con una insignia de reproducción) y un resumen de salud con la próxima vacuna.

## Arquitectura

```
src/app/
├── domain/        Modelos y formato. Datos puros, sin Angular.
├── data/          Repositorios: un puerto (clase abstracta) y sus adaptadores.
│                  Hoy: adaptadores de ejemplo y Google Places con respaldo.
├── core/          Sesión, tema, iconos y utilidades transversales.
├── shared/ui/     Componentes de presentación del sistema de diseño.
├── features/      Una carpeta por área: páginas, stores y sus tests.
├── app.providers  Raíz de composición: qué adaptador sirve a cada puerto.
└── app.routes     Rutas.
```

Decisiones que conviene conocer:

- **Puertos y adaptadores.** Las pantallas dependen de una clase abstracta (`PlacesRepository`), nunca de Google ni de los datos de ejemplo. Cambiar de backend es cambiar una línea en `app.providers.ts`.
- **Cuatro estados en cada pantalla con datos.** `loadable()` convierte una carga en cargando, listo, vacío o error, y cada pantalla diseña los cuatro.
- **Signals y sin zone.js.** El estado vive en signals y `computed`; los formularios usan Signal Forms.
- **Presentación y contenedor.** Los componentes de `shared/ui` solo reciben inputs y emiten eventos; las páginas y los stores hablan con los repositorios.
- **Tema con tokens.** Los colores salen de variables CSS con `light-dark()`, así que claro, oscuro y "sistema" funcionan sin una sola rama en los componentes. Un test falla si la paleta en JavaScript se desincroniza del CSS.
- **Accesibilidad.** Áreas táctiles de 48 pt, etiquetas en todos los botones de solo ícono, y el estado activo se distingue por forma y no solo por color.

## Diseño y decisiones de producto

Todo está en [`docs/`](docs): el [plan de acción](docs/plan-de-accion.md), la [dirección visual](docs/direccion-visual.html), los [mockups](docs/pantallas.html) y la exploración del [logo](docs/logo/preview.html).

## Hoja de ruta

- [x] Fotos reales de perros (Dog CEO) y de gatos (The Cat API) detrás de un repositorio
- [x] Feed de reels con videos de Pixabay: categorías, paginación, sonido y precarga (ver "Videos de los reels")
- [ ] Selector de fotos y cámara al crear publicaciones
- [x] Mapa nativo (Apple Maps en iOS) en el directorio de tiendas
- [x] Mapa nativo también en Alertas
- [x] Fotos de mascotas en historias, perfil, publicaciones y alertas
- [x] Mapa nativo en el detalle de una alerta
- [ ] Mapa nativo al reportar una alerta
- [ ] Backend real, con tiendas afiliadas y catálogo propio
- [ ] Comentarios, chat con tiendas y notificaciones push
- [ ] Editar perfil y añadir mascotas

## Créditos

Los videos de los reels y, con clave, las fotos de mascotas vienen de [Pixabay](https://pixabay.com); cada reel muestra a su autor. Las fotos de respaldo vienen de [Dog CEO](https://dog.ceo/dog-api) (perros) y de [The Cat API](https://thecatapi.com) (gatos), dos APIs gratuitas que no piden clave para un uso ligero. Son contenido de terceros y solo se usan para llenar el prototipo; en producción las fotos son las que suben los usuarios.

## Licencia

[MIT](LICENSE).
