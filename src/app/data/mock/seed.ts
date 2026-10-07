import type { AppNotification, HealthRecord, LostAlert, Pet, Place, Post, Product, Story } from '../../domain/models.ts';
import { GENERATED_POSTS } from './generated-posts.ts';

/** Believable sample data, in Spanish, for the mock adapters. Nothing here is real. */

export const MY_PETS: readonly Pet[] = [
  { id: 'canela', name: 'Canela', species: 'dog', breed: 'Beagle', ageYears: 3, ownerName: 'Lucía', bio: 'Experta en robar calcetines.', posts: 48, followers: 1200, following: 230 },
  { id: 'milo', name: 'Milo', species: 'cat', breed: 'Gato europeo', ageYears: 5, ownerName: 'Lucía', bio: 'Siesta profesional, de lunes a domingo.', posts: 21, followers: 480, following: 90 },
];

const FEATURED_POSTS: readonly Post[] = [
  { id: 'p1', petName: 'Canela', species: 'dog', ownerName: 'Lucía', caption: 'Primer día de playa. Se negó a salir del agua.', minutesAgo: 120, likes: 128, comments: 14, liked: false, saved: false, tone: 'blue', kind: 'photo' },
  { id: 'p2', petName: 'Max', species: 'dog', ownerName: 'Marco', caption: 'Aprendió a abrir la puerta solo. Ahora vivimos con candado.', minutesAgo: 300, likes: 2400, comments: 86, liked: true, saved: false, tone: 'warm', kind: 'reel' },
  { id: 'p3', petName: 'Luna', species: 'cat', ownerName: 'Valeria', caption: 'Domingo de sol y cero planes.', minutesAgo: 1560, likes: 342, comments: 27, liked: false, saved: true, tone: 'border', kind: 'photo' },
  { id: 'p4', petName: 'Rocky', species: 'dog', ownerName: 'Diego', caption: 'Nuevo corte de pelo. ¿Opiniones? Él dice que está guapísimo.', minutesAgo: 1700, likes: 89, comments: 9, liked: false, saved: false, tone: 'blue', kind: 'photo' },
  { id: 'p5', petName: 'Nala', species: 'cat', ownerName: 'Camila', caption: 'Encontró la única caja de cartón de la casa.', minutesAgo: 2900, likes: 510, comments: 41, liked: false, saved: false, tone: 'warm', kind: 'photo' },
  { id: 'p6', petName: 'Toby', species: 'dog', ownerName: 'Andrés', caption: 'Paseo largo, siesta larga.', minutesAgo: 4300, likes: 203, comments: 12, liked: false, saved: false, tone: 'border', kind: 'photo' },
  { id: 'p7', petName: 'Milo', species: 'cat', ownerName: 'Lucía', caption: 'Siesta profesional. Nivel experto.', minutesAgo: 400, likes: 760, comments: 33, liked: false, saved: false, tone: 'border', kind: 'reel' },
  { id: 'p8', petName: 'Canela', species: 'dog', ownerName: 'Lucía', caption: 'Practicando la pata. Todavía negocia con premios.', minutesAgo: 900, likes: 1300, comments: 58, liked: false, saved: false, tone: 'blue', kind: 'reel' },
  { id: 'p9', petName: 'Nala', species: 'cat', ownerName: 'Camila', caption: 'El salto imposible, a cámara lenta.', minutesAgo: 1800, likes: 980, comments: 47, liked: true, saved: false, tone: 'warm', kind: 'reel' },
];

/** The hand-written posts plus the generated ones that fill the feed out to 25 dogs and 25 cats, newest first. */
export const POSTS: readonly Post[] = [...FEATURED_POSTS, ...GENERATED_POSTS].sort((a, b) => a.minutesAgo - b.minutesAgo);

export const STORIES: readonly Story[] = [
  { id: 's0', petName: 'Tu historia', species: 'dog', mine: true },
  { id: 's1', petName: 'Canela', species: 'dog', mine: false },
  { id: 's2', petName: 'Luna', species: 'cat', mine: false },
  { id: 's3', petName: 'Max', species: 'dog', mine: false },
  { id: 's4', petName: 'Nala', species: 'cat', mine: false },
  { id: 's5', petName: 'Rocky', species: 'dog', mine: false },
];

export const ALERTS: readonly LostAlert[] = [
  {
    id: 'a1', petName: 'Toby', breed: 'Golden retriever', traits: 'Golden retriever · 4 años · collar rojo · responde a su nombre',
    lastSeenAt: 'Parque Central', phone: '+51 900 000 001', minutesAgo: 25, status: 'lost', distanceKm: 0.8, pin: { x: 62, y: 40 },
    sightings: [{ id: 'v1', by: 'Marco', where: 'cerca de la panadería', minutesAgo: 8 }],
  },
  {
    id: 'a2', petName: 'Luna', breed: 'Gata carey', traits: 'Gata carey · 2 años · muy asustadiza · no tiene collar',
    lastSeenAt: 'Av. Los Olivos', phone: '+51 900 000 001', minutesAgo: 180, status: 'lost', distanceKm: 1.5, pin: { x: 30, y: 68 },
    sightings: [],
  },
  {
    id: 'a3', petName: 'Rocky', breed: 'Mestizo', traits: 'Mestizo · 6 años · mancha negra en el ojo',
    lastSeenAt: 'Parque de las Flores', phone: '+51 900 000 001', minutesAgo: 1500, status: 'found', distanceKm: 2.2, pin: { x: 74, y: 78 },
    sightings: [],
  },
  {
    id: 'a4', petName: 'Nala', breed: 'Siamesa', traits: 'Siamesa · 3 años · ojos azules',
    lastSeenAt: 'Calle Los Cedros', phone: '+51 900 000 001', minutesAgo: 2880, status: 'found', distanceKm: 1.9, pin: { x: 20, y: 34 },
    sightings: [],
  },
];

export const PLACES: readonly Place[] = [
  { id: 'l1', name: 'Huellitas Pet Shop', kind: 'shop', tagline: 'Comida y juguetes', distanceKm: 0.6, openLabel: 'Abierto hasta las 21:00', open: true, rating: 4.8, phone: '+51 900 000 002', pin: { x: 64, y: 54 } },
  { id: 'l2', name: 'Veterinaria San Roque', kind: 'vet', tagline: 'Consultas y vacunas', distanceKm: 1.2, openLabel: 'Abierto 24 horas', open: true, rating: 4.9, phone: '+51 900 000 002', pin: { x: 30, y: 40 } },
  { id: 'l3', name: 'Vet Central', kind: 'vet', tagline: 'Consultas', distanceKm: 1.5, openLabel: 'Cerrado · abre a las 08:00', open: false, rating: 4.3, phone: '+51 900 000 002', pin: { x: 52, y: 22 } },
  { id: 'l4', name: 'Clínica Mascotas Sanas', kind: 'vet', tagline: 'Cirugía y rayos X', distanceKm: 1.8, openLabel: 'Abierto hasta las 20:00', open: true, rating: 4.7, phone: '+51 900 000 002', pin: { x: 68, y: 46 } },
  { id: 'l5', name: 'Patitas Peluquería', kind: 'groomer', tagline: 'Baño y corte', distanceKm: 2.1, openLabel: 'Cierra a las 19:00', open: true, rating: 4.6, phone: '+51 900 000 002', pin: { x: 22, y: 70 } },
  { id: 'l6', name: 'Vet Amigos del Parque', kind: 'vet', tagline: 'Consultas', distanceKm: 2.4, openLabel: 'Cierra a las 18:00', open: true, rating: 4.5, phone: '+51 900 000 002', pin: { x: 80, y: 80 } },
  { id: 'l7', name: 'Vet Los Pinos', kind: 'vet', tagline: 'Urgencias', distanceKm: 2.8, openLabel: 'Abierto 24 horas', open: true, rating: 4.6, phone: '+51 900 000 002', pin: { x: 40, y: 82 } },
  { id: 'l8', name: 'Pet Mundo', kind: 'shop', tagline: 'Accesorios y camas', distanceKm: 2.9, openLabel: 'Abierto hasta las 20:30', open: true, rating: 4.4, phone: '+51 900 000 002', pin: { x: 12, y: 24 } },
  { id: 'l9', name: 'Mega Pet Norte', kind: 'shop', tagline: 'Todo para tu mascota', distanceKm: 5.4, openLabel: 'Abierto hasta las 22:00', open: true, rating: 4.7, phone: '+51 900 000 002', pin: { x: 90, y: 14 } },
];

export const PRODUCTS: readonly Product[] = [
  { id: 'r1', name: 'Alimento adulto 7 kg', category: 'Perros', price: 48.9 },
  { id: 'r2', name: 'Pelota resistente', category: 'Juguetes', price: 9.5 },
  { id: 'r3', name: 'Rascador mediano', category: 'Gatos', price: 32 },
  { id: 'r4', name: 'Collar reflectante', category: 'Accesorios', price: 14.9 },
];

export const HEALTH: Record<string, HealthRecord> = {
  canela: {
    petName: 'Canela',
    nextVaccine: { name: 'Antirrábica', inDays: 12 },
    vaccines: [
      { id: 'v1', name: 'Quíntuple', detail: 'Aplicada el 14 mar 2026', status: 'ok' },
      { id: 'v2', name: 'Antirrábica', detail: 'Vence el 17 oct 2026', status: 'soon' },
      { id: 'v3', name: 'Desparasitación', detail: 'Cada 3 meses · última 2 ago', status: 'ok' },
    ],
    weightKg: 11.2, weightDeltaKg: 0.4, weightHistory: [10.1, 10.4, 10.6, 10.8, 10.8, 11.2],
  },
  milo: {
    petName: 'Milo',
    nextVaccine: { name: 'Triple felina', inDays: 40 },
    vaccines: [
      { id: 'v1', name: 'Triple felina', detail: 'Vence el 15 nov 2026', status: 'ok' },
      { id: 'v2', name: 'Antirrábica', detail: 'Aplicada el 3 jun 2026', status: 'ok' },
      { id: 'v3', name: 'Desparasitación', detail: 'Cada 3 meses · última 20 jul', status: 'ok' },
    ],
    weightKg: 4.6, weightDeltaKg: -0.1, weightHistory: [4.8, 4.8, 4.7, 4.7, 4.7, 4.6],
  },
};

export const NOTIFICATIONS: readonly AppNotification[] = [
  { id: 'n1', kind: 'alert', who: 'Toby', text: 'se perdió a 800 m de ti. Golden retriever, collar rojo.', minutesAgo: 25, unread: true, target: '/alert/a1' },
  { id: 'n2', kind: 'health', who: 'Recordatorio:', text: 'la antirrábica de Canela vence en 12 días.', minutesAgo: 60, unread: true, target: '/health/canela' },
  { id: 'n3', kind: 'like', who: 'Marco', text: 'y 14 personas más le dieron me gusta a tu foto.', minutesAgo: 120, unread: true },
  { id: 'n4', kind: 'follow', who: 'Valeria', text: 'empezó a seguir a Canela.', minutesAgo: 1500, unread: false },
  { id: 'n5', kind: 'comment', who: 'Lucía', text: 'comentó: "¡Qué carita!"', minutesAgo: 1560, unread: false },
];
