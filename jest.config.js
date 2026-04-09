export default {
  // On utilise le preset ESM de ts-jest
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  // On force le traitement des .ts en tant qu'ESM
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    // Cette règle est CRUCIALE pour le mode nodenext : 
    // Elle redirige les imports finissant par .js vers les fichiers .ts sources
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    // Configuration de la transformation ts-jest pour supporter l'ESM
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
};