// Adds what cannot live in app.json: values read from .env at build time. Expo loads .env before
// it evaluates this file. Whatever is put in `extra` ends up inside the app, so only keys meant for
// the client belong here, and the Google key must be restricted in the Cloud console.
module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY ?? '',
  },
});
