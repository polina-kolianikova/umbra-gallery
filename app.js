const $ = (selector) => document.querySelector(selector);
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const journey = $(".gallery-journey"),
  viewport = $(".gallery-viewport"),
  world = $(".hall-world");
const frames = [...document.querySelectorAll(".art-frame")],
  portals = [...document.querySelectorAll(".portal")],
  stops = [...document.querySelectorAll("[data-stop]")];
const clamp = (value, a = 0, b = 1) => Math.min(b, Math.max(a, value));
const works = [
  {
    slug: "cypresses",
    title: "Wheat Field with Cypresses",
    short: "Wheat Field<br>with Cypresses",
    artist: "Vincent van Gogh",
    date: "1889",
    medium: "Oil on canvas",
    size: "73.2 × 93.4 cm",
    ratio: 3184 / 4000,
    maxWidth: 2560,
    maxHeight: 2038,
    object: 436535,
    note: "Follow the sky before you follow the trees. The brushwork moves between the golden field, the distant hills and the turning clouds. A whole landscape held in the rhythm of a painted mark.",
  },
  {
    slug: "wave",
    title: "Under the Wave off Kanagawa",
    short: "Under the Wave<br>off Kanagawa",
    artist: "Katsushika Hokusai",
    date: "c. 1830 to 1832",
    medium: "Woodblock print; ink and color on paper",
    size: "From Thirty-six Views of Mount Fuji",
    ratio: 2594 / 3859,
    maxWidth: 2560,
    maxHeight: 1721,
    object: 45434,
    note: "The wave fills the room, but look toward the horizon. Mount Fuji is small and still. Hold both scales in view: the immense movement close to us, and the mountain that quietly remains.",
  },
  {
    slug: "primroses",
    title: "Still Life with Apples and a Pot of Primroses",
    short: "Apples &<br>Primroses",
    artist: "Paul Cézanne",
    date: "c. 1890",
    medium: "Oil on canvas",
    size: "A still life from the open collection",
    ratio: 3021 / 3807,
    maxWidth: 2560,
    maxHeight: 2031,
    object: 435882,
    note: "Stay with the relationship between things. Rounded fruit, folded cloth and small leaves are held together by colour and the slight tension of their arrangement. Ordinary objects become an entire world.",
  },
  {
    slug: "venice",
    title: "Venice, from the Porch of Madonna della Salute",
    short: "Venice,<br>in the light",
    artist: "J. M. W. Turner",
    date: "c. 1835",
    medium: "Oil on canvas",
    size: "Venice, seen across the lagoon",
    ratio: 1461 / 1959,
    maxWidth: 1959,
    maxHeight: 1461,
    object: 437853,
    note: "Let the architecture dissolve into its light. Warm buildings meet cool water, and the boats sit between them. Look for the place where a solid edge becomes atmosphere.",
  },
];
let active = 0,
  modalIndex = 0,
  paintCount = 0,
  raf = 0,
  visible = true,
  manualStop = 0;
let width = innerWidth,
  height = innerHeight,
  travel = 0;
function diagnostics(mode) {
  const d = document.documentElement.dataset;
  d.renderFrames = String(paintCount);
  d.drawCalls = "0";
  d.triangles = "0";
  d.renderDpr = "1";
  d.renderMode = mode;
}
function loadWork(index) {
  const image = frames[index]?.querySelector("img");
  if (image?.dataset.src) {
    image.src = image.dataset.src;
    image.srcset = image.dataset.srcset;
    delete image.dataset.src;
    delete image.dataset.srcset;
  }
}
function sizeScene() {
  width = viewport.clientWidth;
  height = viewport.clientHeight;
  travel = Math.max(1, journey.offsetHeight - innerHeight);
  const mobile = width <= 650;
  frames.forEach((frame, index) => {
    let w = Math.min(mobile ? width * 0.88 : width * 0.58, 900);
    let h = w * works[index].ratio + 24;
    const maximum = height * (mobile ? 0.39 : 0.51);
    if (h > maximum) {
      w = (maximum - 24) / works[index].ratio;
      h = maximum;
    }
    frame.style.width = `${w}px`;
    frame.style.height = `${h}px`;
    frame.style.marginLeft = `${-w / 2}px`;
    frame.style.marginTop = `${-h / 2}px`;
  });
  portals.forEach((portal) => {
    const w = mobile ? width * 1.25 : width * 0.85,
      h = height * 0.85;
    portal.style.width = `${w}px`;
    portal.style.height = `${h}px`;
    portal.style.marginLeft = `${-w / 2}px`;
    portal.style.marginTop = `${-h / 2}px`;
  });
}
function setActive(index) {
  if (index === active && $("#caption-title").dataset.ready) return;
  active = index;
  const work = works[index];
  $("#caption-title").innerHTML = work.short;
  $("#caption-title").dataset.ready = "true";
  $("#caption-artist").textContent = work.artist;
  $("#caption-index").textContent =
    `${String(index + 1).padStart(2, "0")} / 04`;
  $("#caption-medium").textContent =
    `${work.date.toUpperCase()} / ${work.medium.toUpperCase()}`;
  stops.forEach((button, i) =>
    button.setAttribute("aria-pressed", String(index === i)),
  );
  loadWork(index);
  if (index < 3) loadWork(index + 1);
}
function paint() {
  raf = 0;
  if (document.hidden) {
    diagnostics("hidden");
    return;
  }
  if (!visible) {
    diagnostics("offscreen");
    return;
  }
  const raw = reduced.matches
    ? manualStop / 3
    : clamp(-journey.getBoundingClientRect().top / travel);
  const q = raw * 3;
  const mobile = width <= 650;
  const span = mobile ? 760 : 1050;
  const i = Math.min(2, Math.floor(q)),
    fraction = q - i;
  const sideA = i % 2 === 0 ? -1 : 1,
    sideB = (i + 1) % 2 === 0 ? -1 : 1;
  const smooth = fraction * fraction * (3 - 2 * fraction);
  const side = q >= 3 ? 1 : sideA + (sideB - sideA) * smooth;
  const cameraX = side * (mobile ? 35 : 145),
    cameraZ = q * span - 180;
  world.style.transform = `translate3d(${-cameraX}px,0,${cameraZ}px)`;
  frames.forEach((frame, index) => {
    const distance = index - q,
      side = index % 2 === 0 ? -1 : 1;
    const x = side * (mobile ? 78 : 325);
    const z = -index * span;
    const angle = side * (mobile ? 7 : 18);
    frame.style.transform = `translate3d(${x}px,${index % 2 ? -10 : 5}px,${z}px) rotateY(${-angle}deg)`;
    const shown = distance > -0.42 && distance < 2.4;
    frame.style.visibility = shown ? "visible" : "hidden";
    frame.tabIndex = Math.round(q) === index && shown ? 0 : -1;
    frame.inert = !shown;
  });
  portals.forEach((portal, index) => {
    const relative = (index + 0.55 - q) * span;
    portal.style.transform = `translate3d(0,0,${-(index + 0.55) * span}px)`;
    portal.style.visibility =
      relative > -600 && relative < 2500 ? "visible" : "hidden";
  });
  $(".room-sign").style.opacity = String(1 - clamp(raw / 0.16));
  setActive(Math.round(q));
  paintCount++;
  diagnostics("idle");
}
function requestPaint() {
  if (!raf && !document.hidden && visible) raf = requestAnimationFrame(paint);
}
function goTo(index) {
  if (reduced.matches) {
    manualStop = index;
    setActive(index);
    requestPaint();
    return;
  }
  const top =
    journey.getBoundingClientRect().top + scrollY + travel * (index / 3);
  window.scrollTo({ top, behavior: "smooth" });
}
stops.forEach((button, index) => {
  button.addEventListener("click", () => goTo(index));
  button.addEventListener("keydown", (event) => {
    let next;
    if (event.key === "ArrowRight") next = (index + 1) % 4;
    if (event.key === "ArrowLeft") next = (index + 3) % 4;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = 3;
    if (next !== undefined) {
      event.preventDefault();
      stops[next].focus();
      goTo(next);
    }
  });
});
document.documentElement.classList.add("js-gallery");
document.documentElement.classList.toggle("no-motion", reduced.matches);
window.addEventListener("scroll", requestPaint, { passive: true });
window.addEventListener("resize", () => {
  sizeScene();
  requestPaint();
});
reduced.addEventListener("change", () => {
  manualStop = active;
  document.documentElement.classList.toggle("no-motion", reduced.matches);
  sizeScene();
  requestPaint();
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    cancelAnimationFrame(raf);
    raf = 0;
    diagnostics("hidden");
  } else requestPaint();
});
if ("IntersectionObserver" in window)
  new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
      if (visible) requestPaint();
      else {
        cancelAnimationFrame(raf);
        raf = 0;
        diagnostics("offscreen");
      }
    },
    { threshold: 0 },
  ).observe(viewport);
const dialog = $(".work-dialog"),
  detailImage = $("#detail-image"),
  imageWrap = $(".detail-image-wrap");
let returnFocus;
function showWork(index) {
  modalIndex = (index + 4) % 4;
  const work = works[modalIndex];
  detailImage.src = `assets/images/${work.slug}-2560.webp`;
  detailImage.width = work.maxWidth;
  detailImage.height = work.maxHeight;
  detailImage.alt = `${work.title}, ${work.artist}, ${work.date}`;
  $("#detail-artist").textContent = work.artist;
  $("#detail-title").textContent = work.title;
  $("#detail-facts").textContent =
    `${work.date}. ${work.medium}. ${work.size}.`;
  $("#detail-note").textContent = work.note;
  $("#detail-source").href =
    `https://www.metmuseum.org/art/collection/search/${work.object}`;
  $("#detail-counter").textContent =
    `${String(modalIndex + 1).padStart(2, "0")} / 04`;
  imageWrap.classList.remove("zoomed");
  imageWrap.scrollTop = 0;
  imageWrap.scrollLeft = 0;
  $("#zoom-work").setAttribute("aria-pressed", "false");
  $("#zoom-work").textContent = "see the detail +";
}
function openWork(index) {
  returnFocus = document.activeElement;
  showWork(index);
  dialog.showModal();
  document.body.style.overflow = "hidden";
}
document
  .querySelectorAll("[data-open]")
  .forEach((button) =>
    button.addEventListener("click", () =>
      openWork(Number(button.dataset.open)),
    ),
  );
$("[data-current-open]").addEventListener("click", () => openWork(active));
$(".detail-close").addEventListener("click", () => dialog.close());
dialog.addEventListener("close", () => {
  document.body.style.overflow = "";
  returnFocus?.focus({ preventScroll: true });
});
$("#previous-work").addEventListener("click", () => showWork(modalIndex - 1));
$("#next-work").addEventListener("click", () => showWork(modalIndex + 1));
dialog.addEventListener("keydown", (event) => {
  if (imageWrap.classList.contains("zoomed")) {
    const directions = {
      ArrowRight: [48, 0],
      ArrowLeft: [-48, 0],
      ArrowDown: [0, 48],
      ArrowUp: [0, -48],
    };
    const direction = directions[event.key];
    if (direction) {
      event.preventDefault();
      imageWrap.scrollBy({
        left: direction[0],
        top: direction[1],
        behavior: "auto",
      });
    }
    return;
  }
  if (event.key === "ArrowRight") {
    event.preventDefault();
    showWork(modalIndex + 1);
  }
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    showWork(modalIndex - 1);
  }
});
$("#zoom-work").addEventListener("click", () => {
  const zoomed = imageWrap.classList.toggle("zoomed");
  $("#zoom-work").setAttribute("aria-pressed", String(zoomed));
  $("#zoom-work").textContent = zoomed
    ? "return to the whole −"
    : "see the detail +";
});
sizeScene();
setActive(0);
diagnostics("idle");
requestPaint();
