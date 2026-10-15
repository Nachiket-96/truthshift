// Minimal service worker so Android Chrome offers "Install app".
// It does not cache anything: the app always talks to the live backend.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", event => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
