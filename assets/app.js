(function () {
  var d = document, body = d.body;
  body.classList.remove("no-js");

  // Menu
  var mb = d.querySelector(".menu-btn");
  function setMenu(open) {
    body.classList.toggle("menu-open", open);
    if (mb) { mb.setAttribute("aria-expanded", String(open)); mb.querySelector("b").textContent = open ? "CLOSE" : "MENU"; }
  }
  if (mb) mb.addEventListener("click", function () { setMenu(!body.classList.contains("menu-open")); });
  d.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  d.querySelectorAll(".overlay a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });

  // Header turns solid after the hero
  var head = d.querySelector(".site-head");
  function onScroll() { if (head) head.classList.toggle("solid", window.scrollY > 40); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  // Hero headline word-in
  d.querySelectorAll(".reveal-words").forEach(function (el) {
    var i = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var frag = d.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(d.createTextNode(part)); return; }
            var s = d.createElement("span"); s.className = "w"; s.textContent = part;
            s.style.animationDelay = (0.06 * i++) + "s"; frag.appendChild(s);
          });
          c.parentNode.replaceChild(frag, c);
        } else if (c.nodeType === 1 && c.tagName === "EM") {
          c.classList.add("w"); c.style.animationDelay = (0.06 * i++) + "s";
        } else if (c.nodeType === 1) walk(c);
      });
    })(el);
  });

  // Statement: words darken as you scroll
  var st = d.querySelector(".statement");
  if (st) {
    var words = [];
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var frag = d.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(d.createTextNode(p)); return; }
            var s = d.createElement("span"); s.className = "w"; s.textContent = p; words.push(s); frag.appendChild(s);
          });
          c.parentNode.replaceChild(frag, c);
        } else if (c.nodeType === 1) { if (c.tagName === "EM") { c.classList.add("w"); words.push(c); } else walk(c); }
      });
    })(st);
    function paint() {
      var r = st.getBoundingClientRect(), vh = window.innerHeight;
      var p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
      var k = Math.round(p * words.length);
      words.forEach(function (w, i) { w.classList.toggle("on", i < k); });
    }
    window.addEventListener("scroll", paint, { passive: true }); paint();
  }

  // Scroll reveal
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { rootMargin: "0px 0px -8% 0px" });
    d.querySelectorAll(".rv").forEach(function (el) { io.observe(el); });
  } else d.querySelectorAll(".rv").forEach(function (el) { el.classList.add("in"); });

  // Article side TOC: highlight current section
  var links = d.querySelectorAll(".aside a[href^='#']");
  if (links.length && "IntersectionObserver" in window) {
    var map = {};
    links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { links.forEach(function (a) { a.classList.remove("on"); }); var a = map[e.target.id]; if (a) a.classList.add("on"); } });
    }, { rootMargin: "-20% 0px -70% 0px" });
    Object.keys(map).forEach(function (id) { var el = d.getElementById(id); if (el) so.observe(el); });
  }

  // Filter (glossary, matrix)
  var q = d.querySelector("[data-filter]");
  if (q) {
    var items = Array.prototype.slice.call(d.querySelectorAll(q.dataset.filter));
    var active = "all", count = d.querySelector("[data-count]");
    function run() {
      var term = q.value.trim().toLowerCase(), n = 0;
      items.forEach(function (el) {
        var ok = (!term || el.textContent.toLowerCase().indexOf(term) > -1) && (active === "all" || (el.dataset.cat || "").split(" ").indexOf(active) > -1);
        el.hidden = !ok; if (ok) n++;
      });
      if (count) count.textContent = n;
    }
    q.addEventListener("input", run);
    d.querySelectorAll(".filters button").forEach(function (b) {
      b.addEventListener("click", function () {
        active = b.dataset.cat;
        d.querySelectorAll(".filters button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        run();
      });
    });
    run();
  }

  // One open accordion row at a time
  d.querySelectorAll("[data-accordion]").forEach(function (g) {
    g.addEventListener("toggle", function (e) {
      if (e.target.open) g.querySelectorAll("details.row[open]").forEach(function (x) { if (x !== e.target) x.open = false; });
    }, true);
  });
})();
