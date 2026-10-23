# UMBRA

A standalone static exhibition for GitHub Pages. No framework, build, server, account or third-party runtime. Deploy this directory at a repository root. All URLs are relative.

Native vertical scrolling moves through a graphite exhibition hall built with CSS perspective and real artwork frames. No wheel interception, scroll library, second smoothing controller, video, WebGL or continuous render loop. Four room controls offer direct navigation. Select a work for a large local image, detailed observation, source record, zoom and previous/next navigation. Escape closes the native dialog.

Reduced motion replaces travel with direct room selection and keeps the catalogue and work viewer. Without JavaScript, the collection and credits remain normal readable content.

The images are verified public-domain works from The Metropolitan Museum of Art Open Access collection. Attribution and original dimensions are recorded in `assets/LICENSES.md` and `assets/artworks.json`. No original source was enlarged. Medium images are promoted as the camera approaches; full detail is loaded only when opened.

`document.documentElement.dataset` exposes `renderFrames`, `drawCalls`, `triangles`, `renderDpr` and `renderMode`. For this CSS site the frame count measures actual scroll paint updates, with draw calls and triangles zero. No updates are scheduled while idle, hidden or outside the gallery viewport.

## iPhone Safari composition, October2026

The mobile experience now reserves explicit photographic or live-model frames in normal document flow. It does not move the hero object into arbitrary gaps between text blocks. Header, content, forms and footer share the mobile reading grid; desktop retains its cinematic composition. Exact local static font weights avoid variable-default differences across browser engines. Relevant touch interactions, portrait/landscape transitions and live scene visibility were checked in Playwright WebKit. This is browser emulation, not a physical iPhone test.
