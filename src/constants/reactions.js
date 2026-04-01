import {
  CHAOS_SOUND_KEYS,
  FUNNY_SOUND_KEYS,
  SOFT_SOUND_KEYS,
} from './soundManifest';

/** Reaction lines after a tap — core set + extras for random generator */
export const TAP_REACTIONS = [
  'AYO 😳',
  'WHAT WAS THAT',
  'AGAIN 😭',
  'HELLO??',
  'CHILL',
  'OK LOUD',
  'RESPECT',
  'THERE IT IS',
  'WORK',
  'AGAIN AGAIN',
  'CALM DOWN',
];

/** Prompts that cycle / randomize when waiting for next tap */
export const WAITING_PROMPTS = ['Harder 👀', 'Again', 'Do it.', 'One more.', 'Louder'];

export const MODES = {
  funny: {
    id: 'funny',
    label: 'Funny',
    accentFrom: '#e879f9',
    accentTo: '#a855f7',
    flash: 'rgba(255, 255, 255, 0.92)',
    soundKeys: FUNNY_SOUND_KEYS,
  },
  chaos: {
    id: 'chaos',
    label: 'Chaos',
    accentFrom: '#f472b6',
    accentTo: '#fb7185',
    flash: 'rgba(253, 224, 71, 0.75)',
    soundKeys: CHAOS_SOUND_KEYS,
  },
  soft: {
    id: 'soft',
    label: 'Soft',
    accentFrom: '#94a3b8',
    accentTo: '#c084fc',
    flash: 'rgba(196, 181, 253, 0.85)',
    soundKeys: SOFT_SOUND_KEYS,
  },
};
