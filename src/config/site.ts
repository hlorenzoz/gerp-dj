export type Locale = 'es' | 'gl';

export const site = {
  name: 'GERP DJ',
  whatsapp: {
    number: '34613340500', // full international format, digits only (wa.me)
    display: '+34 613 34 05 00',
    channelUrl: 'https://whatsapp.com/channel/CHANNEL_ID', // placeholder until the client creates the channel
  },
  // Hidden, not deleted: a disabled feature is neither built nor linked.
  features: { tour: false, music: false, sets: false, shop: false, socials: false },
  shopUrl: 'https://shop.example.com', // placeholder
  socials: [
    { name: 'Instagram', url: '#' },
    { name: 'TikTok', url: '#' },
    { name: 'YouTube', url: '#' },
    { name: 'Spotify', url: '#' },
    { name: 'SoundCloud', url: '#' },
  ], // placeholders
  pressPdf: (locale: Locale) => `/press/dossier-gerp-dj-${locale}.pdf`,
} as const;
