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

El directorio usa el mapa real, `expo-maps`: Apple Maps en iOS (sin clave) y Google Maps en Android (con `GOOGLE_MAPS_API_KEY`). Muestra los 15 lugares más cercanos con un color por tipo (veterinaria, tienda, peluquería) y tu posición; tocar un marcador abre el lugar. Sin coordenadas reales (lugares de ejemplo) o en Expo Go, que no incluye el módulo, se queda el mapa dibujado.

- Exige **iOS 18** o superior, que ya está en `app.json` (`expo-build-properties`).
- `expo run:ios` falla si la ruta del proyecto tiene **espacios** (por ejemplo `Angular Native`): un script de Expo no las entrecomilla. Compila desde una ruta sin espacios.
- Con CocoaPods en Ruby 2.6, exporta `LANG=en_US.UTF-8` antes de `pod install`.

## Videos de los reels

Los reels se reproducen con `expo-video` y sus videos verticales vienen de [Pexels](https://www.pexels.com/api/) (clave gratuita, 200 peticiones por hora). Sin clave, cada reel conserva su marcador oscuro.

1. Crea una clave en <https://www.pexels.com/api/> y guárdala en `.env` como `PEXELS_API_KEY`.
2. Reinicia Metro con `npx expo start --clear`.

Pexels pide un enlace visible a su sitio donde se muestren sus videos.

**Estado conocido:** el reproductor carga y reproduce (`readyToPlay`, `playing`), pero la vista nativa de video no dibuja el cuadro, ni en Expo Go ni en un build de desarrollo (verificado en iOS 26.5). El mismo video sí se ve en Safari del simulador, así que el fallo está en cómo la vista `<expo-video>` recibe el reproductor. Pendiente de reportar a `@ng-native/expo`.

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
- [x] Videos para los reels desde Pexels, con clave opcional (ver "Videos de los reels")
- [ ] Que la vista de video dibuje el cuadro (reproduce, pero no se ve)
- [ ] Selector de fotos y cámara al crear publicaciones
- [ ] Mapa nativo en lugar del mapa dibujado
- [ ] Backend real, con tiendas afiliadas y catálogo propio
- [ ] Comentarios, chat con tiendas y notificaciones push
- [ ] Editar perfil y añadir mascotas

## Créditos

Las fotos de ejemplo vienen de [Dog CEO](https://dog.ceo/dog-api) (perros) y de [The Cat API](https://thecatapi.com) (gatos), dos APIs gratuitas que no piden clave para un uso ligero. Son contenido de terceros y solo se usan para llenar el prototipo; en producción las fotos son las que suben los usuarios.

## Licencia

[MIT](LICENSE).
