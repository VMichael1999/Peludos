import type { PhotoTone, Post, Species } from '../../domain/models.ts';

/**
 * Fills the sample feed out to a believable size: enough posts that scrolling, filtering and the
 * explore mosaic have something to show. Deterministic on purpose, so a reload, a test and a
 * screenshot all see the same feed. They sit after the hand-written posts and are older than them.
 */

const DOGS = [
  'Bruno', 'Thor', 'Coco', 'Rex', 'Lola', 'Kira', 'Toto', 'Rufo', 'Maya', 'Zeus',
  'Nina', 'Bobby', 'Chispa', 'Duque', 'Pepa', 'Samy', 'Fido', 'Kenia', 'Lupe', 'Tango',
];
const CATS = [
  'Mishi', 'Gala', 'Pelusa', 'Oliver', 'Cleo', 'Bigotes', 'Simba', 'Mora', 'Tigre', 'Nube', 'Kiwi',
  'Salem', 'Pipa', 'Dulce', 'Mina', 'Garfi', 'Lucky', 'Azul', 'Frida', 'Mochi', 'Sol',
];
const OWNERS = [
  'Andrea', 'Diego', 'Camila', 'Sofía', 'Mateo', 'Valentina', 'Joaquín', 'Renata',
  'Lucas', 'Isabella', 'Tomás', 'Daniela', 'Gabriel', 'Paula', 'Nicolás', 'Fernanda',
];
const CAPTIONS: Record<Species, readonly string[]> = {
  dog: [
    'Paseo de domingo, cero ganas de volver a casa.',
    'Descubrió el charco y ya no hay vuelta atrás.',
    'Cara de que no rompió nada. Rompió todo.',
    'Primer día en el parque nuevo.',
    'Esperando la pelota como si fuera su trabajo.',
    'Siesta después del paseo, nivel experto.',
    'Aprendió a dar la pata. Cobra en galletas.',
    'Se cree guardián de la casa. Le teme a la aspiradora.',
    'Hoy toca baño y lo sabe.',
    'Sol, pasto y cero preocupaciones.',
    'Su mirada cuando abro el refrigerador.',
    'Cumple años hoy. Hubo pastel de perro.',
  ],
  cat: [
    'Se adueñó de la caja de cartón. Otra vez.',
    'A las 3 a. m. corre por toda la casa. Como siempre.',
    'Observando el mundo desde la ventana.',
    'Dice que no tiene hambre. Es la quinta vez que come.',
    'Siesta de catorce horas, solo para estar seguro.',
    'Tiró el vaso mirándome a los ojos.',
    'Domingo de manta y cero planes.',
    'Descubrió el puntero láser. Ya no es el mismo.',
    'Dueño de la cama, inquilino yo.',
    'Cazando una sombra con mucha seriedad.',
    'Ronronea más fuerte que el motor del auto.',
    'Primer día en casa nueva, ya manda.',
  ],
};
const TONES: readonly PhotoTone[] = ['blue', 'warm', 'border'];

/** A small deterministic generator (a linear congruential one): the same numbers on every run. */
function sequence(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function build(): Post[] {
  const random = sequence(2026);
  const posts: Post[] = [];
  // Dogs and cats take turns, so neither fills a whole stretch of the feed. The hand-written posts
  // already hold 5 dogs and 4 cats, so these hold 20 dogs and 21 cats: 25 of each in all.
  const total = DOGS.length + CATS.length;
  for (let i = 0; i < total; i++) {
    const species: Species = i % 2 === 0 ? 'cat' : 'dog';
    const names = species === 'dog' ? DOGS : CATS;
    const captions = CAPTIONS[species];
    const likes = 20 + Math.floor(random() * 900);
    posts.push({
      id: `p${10 + i}`,
      petName: names[Math.floor(i / 2) % names.length]!,
      species,
      ownerName: OWNERS[(i * 5 + 3) % OWNERS.length]!,
      caption: captions[(i * 7 + Math.floor(i / 2)) % captions.length]!,
      // Older than every hand-written post, and older the further down.
      minutesAgo: 4600 + i * 170 + Math.floor(random() * 120),
      likes,
      comments: Math.floor(likes * (0.04 + random() * 0.08)),
      liked: i % 7 === 0,
      saved: i % 11 === 0,
      tone: TONES[i % TONES.length]!,
      kind: i % 6 === 5 ? 'reel' : 'photo',
    });
  }
  return posts;
}

export const GENERATED_POSTS: readonly Post[] = build();
