# Plan de acción — PetCommunity (nombre provisional)

Red social de mascotas con feed y reels, alertas de mascota perdida, salud de la mascota y tiendas afiliadas. Construida con **Angular Native** (alpha) para iOS y Android.

> Estado: **planificación**. Nada de la app está programado todavía.

---

## 1. Visión y alcance

| Módulo | Qué es | Etapa |
|---|---|---|
| **Cuenta y perfiles** | Registro, login, perfil de persona y **perfil por mascota** | MVP |
| **Feed social** | Publicar fotos, likes, comentarios, seguir, guardar | MVP |
| **Mascota perdida** | Alerta con mapa, avistamientos, "encontrada" | MVP |
| **Salud** | Carnet de vacunas, recordatorios, peso, documentos | Etapa 2 |
| **Tiendas (directorio)** | Tiendas afiliadas con catálogo y contacto | Etapa 2 |
| **Reels e historias** | Video corto vertical, historias de 24 h | Etapa 3 |
| **Mensajes y notificaciones por cercanía** | Chat directo, push por radio | Etapa 3 |
| **Compras en la app** | Carrito, pagos, pedidos, panel de tiendas | Etapa 4 |
| **Adopciones y grupos** | Refugios, comunidades por raza | Etapa 4 |

**Principio:** un solo gancho al inicio (la alerta de mascota perdida atrae usuarios); el resto se agrega por etapas.

## 2. Decisiones pendientes (bloquean partes del plan)

1. **País y variante de idioma** (define pagos, moneda, textos y normas). Se asume español; confirmar variante.
2. **¿Portafolio o producto real?** Cambia cuánto invertir en moderación, pagos y legal.
3. **Backend:** Supabase o Firebase. No hay integración nativa de ninguno en Angular Native: se consumen por HTTP (`provideNativeHttpClient()`) o con su cliente JavaScript, **a validar en el spike S4**.
4. **Modelo de ingresos** (comisión, suscripción de tiendas, anuncios o gratis por ahora).
5. **Nombre definitivo** y referencias visuales.

## 3. Riesgos principales

| Riesgo | Por qué importa | Mitigación |
|---|---|---|
| **Framework en alpha** | La documentación indica que muchas piezas tienen pruebas unitarias pero **no verificación en hardware** | Spikes (sección 6) antes de construir encima |
| **Solo simulador de iOS** | Android sin verificar | Declarar Android "sin verificar" hasta tener emulador |
| **Mapas** | iOS usa Apple Maps; Google Maps solo en Android y exige clave | Spike S2; decidir si basta Apple Maps en iOS |
| **Video** | Subida, compresión, almacenamiento y reproducción fluida | Dejar reels para la Etapa 3; MVP solo fotos |
| **Contenido de usuarios** | Las tiendas de apps exigen reportar, bloquear y borrar | Incluir moderación básica en el MVP |
| **Datos sensibles** | Ubicación y fotos | Privacidad por defecto; no mostrar la posición exacta del dueño |
| **Fuentes** | En nativo no hay pila de respaldo; si falla, cae a la del sistema sin avisar | Empaquetar y verificar en simulador |
| **i18n parcial** | Plurales/ICU y atributos `i18n-` fallan | Solo español al inicio; textos centralizados |

## 4. Arquitectura

### 4.1 Capas

```
src/app/
  core/            tema (tokens, servicio Theme), configuración, errores, DI tokens
  domain/          modelos y reglas puras (sin Angular ni red)
  data/            repositorios: puertos (interfaces) + adaptadores (backend real y falsos)
  features/
    auth/  feed/  pets/  lost-pets/  health/  stores/  profile/
      pages/       componentes contenedor (rutas, inyectan stores)
      ui/          componentes presentacionales (inputs/outputs)
      state/       stores con signals
      <x>.routes.ts
  shared/ui/       sistema de diseño: Button, Card, Avatar, Skeleton, EmptyState, ErrorState…
```

Regla de dependencias: `features` → `domain` y `data` (por el puerto) → nunca al revés. `domain` no importa nada del framework.

### 4.2 Patrones de diseño (y para qué)

| Patrón | Dónde | Motivo |
|---|---|---|
| **Repositorio + puerto/adaptador** (`InjectionToken`) | `data/` | El backend es intercambiable y se sustituye por un falso en tests |
| **Store con signals** (estado + `computed`) | `features/*/state` | Estado reactivo sin librería externa; el framework es zoneless |
| **Contenedor / presentacional** | `pages/` vs `ui/` | Componentes `ui` fáciles de probar y reutilizar |
| **Mapeador (adapter) DTO → modelo** | `data/` | Aísla los cambios del backend |
| **Estrategia** | Tema (`light`/`dark`/`system`), fuentes de ubicación | Intercambiar comportamiento sin condicionales dispersos |
| **Resultado tipado (`Result`)** | repositorios | Errores explícitos, sin excepciones sueltas |
| **Interceptor HTTP** | `core/` | Token de sesión y manejo de errores en un solo lugar |

**Sin sobrearquitectura:** no se agrega NgRx ni similares. Cada abstracción debe poder justificarse.

### 4.3 Reglas del framework que condicionan el código

- Elementos en minúscula e importados (`<view>`, `<text>`, `<pressable>`); sin DOM; `(press)`, no `(click)`.
- Estado con signals; no hay zone.js.
- Listas largas con `<virtual-list>`; el estado por ítem va fuera de la fila (las filas se reciclan).
- Navegación con `@angular/router` sobre stacks nativos; `<native-header>` para la barra.
- Evitar: shorthand de métodos en decoradores, spread en `host`, flechas con parámetros en templates, ICU en templates.
- En desarrollo, las rutas con carga diferida pausan al pedir el código a Metro: valorar precarga.

### 4.4 Pruebas

- **Unitarias y de componente:** Vitest en Node con la capa nativa simulada (`@ng-native/testing`); los repositorios se prueban con adaptadores falsos.
- **Servicios de dispositivo:** se simulan con su token `SOURCE`.
- **Extremo a extremo:** Maestro (a evaluar).
- **Calidad:** `npm run typecheck` y `npm test` obligatorios en cada cambio.

## 5. Sistema de diseño

### 5.1 Paleta base (medida)

Azul oscuro moderado + blanco, con un acento cálido para llamadas a la acción y rojo reservado a las alertas de mascota perdida. Los contrastes están calculados (WCAG): texto normal necesita ≥ 4,5:1.

| Token | Claro | Oscuro | Contraste clave |
|---|---|---|---|
| `--color-bg` | `#F6F8FC` | `#0B1220` | |
| `--color-surface` | `#FFFFFF` | `#121C30` | |
| `--color-surface-2` | `#EEF2FA` | `#1A2742` | |
| `--color-primary` | `#1F4FA3` | `#8DB2F5` | texto sobre fondo: 7,76 / 7,95 |
| `--color-on-primary` | `#FFFFFF` | `#0B1220` | sobre primario: 7,76 / 8,75 |
| `--color-primary-container` | `#DCE6F8` | `#203A6B` | |
| `--color-accent` | `#F2A93B` | `#F5B650` | texto sobre acento: 9,29 / 10,32 |
| `--color-text` | `#0E1626` | `#E9EFFB` | 18,08 / 14,75 |
| `--color-text-muted` | `#5B6784` | `#9AA7C4` | 5,65 / 7,05 |
| `--color-border` | `#D9E0EE` | `#263553` | |
| `--color-danger` | `#C93636` | `#FF7A7A` | 5,17 / 6,74 |
| `--color-success` | `#177A4C` | `#4CC38A` | 5,35 / 7,68 |

Pendiente: variantes dentro de esta dirección, par tipográfico y escala de radios/sombras (Fase 1 del prompt).

### 5.2 Tema claro / oscuro

- Servicio `Theme` con preferencia `light | dark | system`.
- Sigue al dispositivo por defecto; cambio manual desde Ajustes.
- Se persiste con `Storage` y se aplica al arrancar.
- Cambia también la parte nativa con `ColorScheme.set()`.
- `app.json` con `"userInterfaceStyle": "automatic"`.

## 5b. Navegación y pantallas

Decidido con el dueño del proyecto: navegación **por iconos, sin texto**, como Instagram. Maqueta completa en [`pantallas.html`](pantallas.html).

**Barra inferior (5 iconos fijos):** Inicio · Reels · Explorar (lupa) · Alertas · Perfil (la foto del usuario como icono).

**Barra superior de Inicio:** logo a la izquierda; a la derecha Crear (+), **Notificaciones (campanita con contador)** y Mensajes. La campanita sustituye al título.

Como los iconos solos son menos descubribles:
- Cada uno lleva `accessibilityLabel` y `accessibilityState`.
- El icono activo se distingue por **forma** (relleno, trazo más grueso y punto), no solo por color.
- El icono de Alertas muestra un punto rojo si hay una mascota perdida cercana.
- Validar con usuarios reales que el icono de Alertas se entiende; si no, añadir una pista la primera vez.

**Dónde vive lo que no tiene pestaña:** Salud dentro del perfil de cada mascota; Tiendas dentro de Explorar y en el mapa; Ajustes (tema, privacidad, eliminar cuenta) dentro del perfil.

| # | Pantalla | Etapa |
|---|---|---|
| 1 | Entrar / crear cuenta | MVP |
| 2 | Inicio (feed, historias, aviso de alerta cercana) | MVP |
| 3 | Crear publicación | MVP |
| 4 | Explorar | MVP |
| 5 | Alertas (mapa + lista), Perdidas y Encontradas | MVP |
| 6 | Reportar mascota perdida | MVP |
| 7 | Detalle de alerta y avistamientos | MVP |
| 8 | Perfil de mascota (cambiar de mascota) | MVP |
| 9 | Notificaciones | MVP |
| 10 | Ajustes: apariencia, privacidad, cuenta | MVP |
| 11 | Carnet de salud | Etapa 2 |
| 12 | Directorio de tiendas y veterinarias | Etapa 2 |
| 13 | Detalle de tienda con catálogo | Etapa 2 |
| 14 | Reels (reproductor vertical) | Etapa 3 |
| 15 | Mensajes | Etapa 3 |

Los iconos son un solo set consistente (trazo uniforme). En la app se usará `ng-icons`, que la documentación lista como soporte de iconos vectoriales; hay que verificarlo en el spike S1.

## 6. Prototipos técnicos (spikes)

Cada uno es un proyecto pequeño que responde "¿funciona en Angular Native?". **No se construyen pantallas reales hasta cerrar al menos S1 a S4.**

| # | Spike | Qué se valida | Criterio de salida |
|---|---|---|---|
| **S1** | Tema y tokens | Tokens con custom properties, cambio claro/oscuro/sistema, persistencia, fuente propia empaquetada | La fuente se ve aplicada y el tema cambia entero (incluida la parte nativa) en simulador |
| **S2** | Mapa y ubicación | `<expo-map>`, marcadores, ubicación del usuario y permisos | Pin de "mascota perdida" visible y tocable; se decide Apple Maps vs Google en iOS |
| **S3** | Feed con fotos | Selector de imagen/cámara, `<virtual-list>`, skeleton, estado vacío y de error | Feed fluido con ~200 ítems; subida de foto simulada |
| **S4** | Auth y backend | Login, sesión persistida, consumo HTTP (`provideNativeHttpClient`) o cliente JS del backend | Registro, login y lectura de datos reales desde el simulador |
| **S5** | Video | Reproductor (`expo-video`) en lista vertical | Un reel reproduce y se detiene fuera de pantalla |
| **S6** | Notificaciones | Permiso, token de dispositivo, notificación recibida | Notificación local y remota recibidas (la documentación marca esto como no verificado en dispositivo) |

## 7. Fases de construcción

| Fase | Contenido | Entregable |
|---|---|---|
| **F0** | Decisiones pendientes (sección 2) y spikes S1 a S4 | Informe de qué funciona y qué no |
| **F1** | Dirección de diseño aprobada y **sistema de diseño en código** + catálogo de componentes | `core/theme`, `shared/ui`, pantalla de catálogo |
| **F2** | **MVP:** auth, perfil de mascota, publicar foto, feed, likes/comentarios, alerta de mascota perdida con mapa, moderación básica | App usable en simulador |
| **F3** | Salud (carnet y recordatorios) y directorio de tiendas | Notificaciones locales de vacunas |
| **F4** | Reels, historias, mensajes, push por cercanía (tras S5 y S6) | |
| **F5** | Compras con pagos, panel de tiendas, adopciones, grupos | |

Cada pantalla se entrega con sus **4 estados** (cargando, vacío, error, éxito), en claro y oscuro, con texto al 150 %, y con un resumen de decisiones.

## 8. Antes de publicar en las tiendas

- Moderación: reportar, bloquear, ocultar y borrar contenido.
- Eliminación de cuenta dentro de la app.
- Política de privacidad y términos.
- Revisar si **"Iniciar sesión con Apple"** es obligatorio al ofrecer otros logins sociales.
- Claves de mapas restringidas por aplicación; ningún secreto en el repositorio (`EXPO_PUBLIC_*` es público).
- Compilación de release probada (no solo desarrollo).

## 9. Siguiente paso inmediato

1. ~~Aprobar la paleta~~ (aprobada) y revisar la navegación y las pantallas (`pantallas.html`).
2. Responder las decisiones de la sección 2.
3. Crear el proyecto base con la plantilla y arrancar el spike **S1**.
