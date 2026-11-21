/* La Bonne Adresse Paris – version 3
   Le catalogue est lu en direct dans la boutique Shopify (products.json) : photos, prix et stock sont toujours à jour.
   Le panier renvoie vers le vrai paiement Shopify de la boutique. */
(function () {
  "use strict";
  var SHOP = "https://labonneadresseparis.fr";
  var WA = "https://wa.me/33620641083";
  var CODE = "BLACK15", CODE_END = new Date("2026-11-28T00:00:00+01:00");
  var FREE = 50;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var norm = function (s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’']/g, " "); };
  var eur = function (n) { return n.toLocaleString("fr-FR", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }) + " €"; };
  var img = function (src, w) { if (!src) return ""; return src + (src.indexOf("?") > -1 ? "&" : "?") + "width=" + w; };
  var store = { get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  var sess = { get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} } };

  /* ---------- familles du client ---------- */
  var FC = { Gou: "Gourmande", Amb: "Ambrée", Boi: "Boisée", Flo: "Florale", Fru: "Fruitée", Mus: "Musquée", "Épi": "Épicée", Aro: "Aromatique", Hes: "Hespéridée", Pou: "Poudrée", Cui: "Cuirée", Chy: "Chyprée", Aqu: "Aquatique", Fou: "Fougère" };
  var ENVIES = [
    { f: "Gourmande", l: "Gourmands", d: "Vanille, caramel, amande, café. Doux et addictifs." },
    { f: "Boisée", l: "Boisés", d: "Santal, cèdre, oud, tabac. Élégants et affirmés." },
    { f: "Florale", l: "Floraux", d: "Rose, jasmin, fleurs blanches. Lumineux." },
    { f: "Ambrée", l: "Ambrés", d: "Ambre, résines, épices chaudes. Du sillage." },
    { f: "Fruitée", l: "Fruités", d: "Fruits rouges, poire, mangue, agrumes. Pétillants." },
    { f: "Musquée", l: "Musqués", d: "Musc blanc, peau, douceur poudrée. Intimes." }
  ];
  var GUESS = [["Gourmande", /vanill|caramel|sucre|sugar|latt|cafe|amande|marshmallow|cherry|coco|praline|candy/], ["Ambrée", /oud|ambre|amber|safran|tonka|sultan|arab|dubai/], ["Florale", /rose|fleur|flora|jasmin|iris|blanc/], ["Fruitée", /mango|peach|pear|fruit|apple|nectar|crush/], ["Hespéridée", /neroli|citron|cedrat|orange|bergamot/], ["Musquée", /musc|musk/]];
  var famDesc = function (f) { var e = ENVIES.find(function (x) { return x.f === f; }); return e ? e.d : ""; };

  /* ---------- menu du client ---------- */
  var MAISONS_MENU = ["Boucheron", "Bvlgari", "Dior", "Essential Parfums", "Fomowa Paris", "Frédéric Malle", "Giardini di Toscana", "Initio", "Jean Couturier", "Kilian Paris", "Laboya", "Les Eaux Primordiales", "Les Princes du Golfe", "Librery Paris", "Liquides Imaginaires", "Maison Crivelli", "Maison Francis Kurkdjian", "Maison Mataha", "Mancera", "Marc-Antoine Barrois", "Montale", "Nishane", "Noème Paris", "Rosendo Mateu", "Tiziana Terenzi", "Unique’e Luxury", "Xerjoff"];
  var COLL = {
    "meilleures-ventes": { t: "Meilleures ventes", d: "Les références les plus commandées du moment." },
    "parfums-de-niche": { t: "Haute parfumerie", d: "Une sélection d'exception de parfums de niche, choisie par nos experts." },
    "inspirations": { t: "Inspirations", d: "Des créations inspirées des grands parfums, à petit prix." },
    "collection-prestige": { t: "Collection Prestige", d: "La gamme Collection Prestige en eau de parfum 50 ml." },
    "signature-royale": { t: "Signature Royale", d: "Les extraits de parfum Signature Royale." },
    "les-parfums-d-igor": { t: "Les Parfums d'Igor", d: "Toutes les créations des Parfums d'Igor." },
    "parfums-de-dubai": { t: "Parfums de Dubaï", d: "Lattafa, Swiss Arabian et les maisons du Golfe." },
    "gris-montaigne": { t: "Gris Montaigne", d: "Les extraits Gris Montaigne." },
    "fixateurs-de-parfum": { t: "Fixateurs de parfum", d: "Appliquez une noisette sur peau propre, puis vaporisez votre parfum par-dessus : il tient plus longtemps." }
  };
  var MENU = [
    ["Nouveautés", "#/catalogue?sort=new"],
    ["Meilleures ventes", "#/collection/meilleures-ventes"],
    ["Haute parfumerie", "#/collection/parfums-de-niche"],
    ["Inspirations", [["Toutes les inspirations", "#/collection/inspirations"], ["Collection Prestige", "#/collection/collection-prestige"], ["Signature Royale", "#/collection/signature-royale"], ["Les Parfums d’Igor", "#/collection/les-parfums-d-igor"], ["Parfums de Dubaï", "#/collection/parfums-de-dubai"], ["Gris Montaigne", "#/collection/gris-montaigne"]]],
    ["Par envie", ENVIES.map(function (e) { return [e.l, "#/catalogue?famille=" + encodeURIComponent(e.f)]; })],
    ["Maisons", MAISONS_MENU.map(function (m) { return [m, "#/catalogue?maison=" + encodeURIComponent(m)]; })],
    ["Fixateurs", "#/collection/fixateurs-de-parfum"],
    ["Offrir", "#/offrir"]
  ];

  /* ---------- données ---------- */
  var D = [], BY = {}, COLLS = {}, READY = null;
  function shape(p, i) {
    var parts = p.title.split(/\s+[-–—]\s+/).map(function (s) { return s.trim(); });
    var name = parts[0], maison = parts[1] || "La Bonne Adresse", conc = parts.slice(2).join(" · ");
    if (/^format/i.test(maison)) { conc = maison; maison = "Maison Massimo"; }
    if (parts.length === 2 && /parfum|ml/i.test(parts[1])) { conc = parts[1]; maison = "La Bonne Adresse"; }
    var nt = norm(p.title);
    var vs = p.variants || [];
    var prices = vs.map(function (v) { return parseFloat(v.price); });
    var price = Math.min.apply(null, prices);
    var cmps = vs.map(function (v) { return parseFloat(v.compare_at_price) || 0; });
    var cmp = Math.max.apply(null, cmps);
    var ml = (nt.match(/(\d+)\s*ml/) || [])[1];
    var codes = (window.LBA_FAM || {})[p.handle];
    var fams = codes ? codes.split(",").map(function (c) { return FC[c] || c; }) : [];
    if (!fams.length) { for (var g = 0; g < GUESS.length; g++) if (GUESS[g][1].test(norm(name))) { fams = [GUESS[g][0]]; break; } }
    if (!fams.length) fams = ["Boisée"];
    var fmt = /carte cadeau/.test(nt) ? "Carte cadeau" : /fixateur/.test(nt) ? "Fixateur" : /testeur/.test(nt) ? "Testeur" : /decant|\b10ml\b|\b10 ml\b/.test(nt) ? "Décant" : /coffret/.test(nt) ? "Coffret" : "Flacon";
    var c = /extrait/.test(nt) ? "Extrait de parfum" : /eau de parfum|edp/.test(nt) ? "Eau de parfum" : /fixateur/.test(nt) ? "Fixateur" : "Parfum";
    var ims = (p.images || []).map(function (x) { return x.src; });
    return {
      i: i, id: p.id, h: p.handle, n: name, m: maison, conc: conc || c, c: c, ml: ml ? +ml : null,
      p: price, cp: cmp > price ? cmp : null, fams: fams, f: fams[0], fmt: fmt,
      a: vs.some(function (v) { return v.available; }), vs: vs.map(function (v) { return { id: v.id, t: v.title, p: parseFloat(v.price), cp: parseFloat(v.compare_at_price) || null, a: v.available, img: v.featured_image ? v.featured_image.src : null }; }),
      ims: ims, img: ims[0] || null, body: p.body_html || "", t: Date.parse(p.published_at || p.created_at) || 0,
      hp: price >= 150, best: false, parf: fmt !== "Fixateur" && fmt !== "Carte cadeau"
    };
  }
  function fetchAll(path) {
    var out = [];
    function page(n) {
      return fetch(SHOP + path + "?limit=250&page=" + n).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (j) {
        out = out.concat(j.products || []);
        if ((j.products || []).length === 250 && n < 10) return page(n + 1);
        return out;
      });
    }
    return page(1);
  }
  function load() {
    if (READY) return READY;
    var cached = null;
    try { cached = JSON.parse(sessionStorage.getItem("lba3:d2") || "null"); } catch (e) {}
    if (cached && Date.now() - cached.t < 600000) { setData(cached.d, cached.c); READY = Promise.resolve(); return READY; }
    READY = Promise.all([fetchAll("/products.json"), coll("meilleures-ventes"), coll("parfums-de-niche")]).then(function (r) {
      var d = r[0].map(shape);
      var c = { "meilleures-ventes": r[1], "parfums-de-niche": r[2] };
      setData(d, c);
      try { sessionStorage.setItem("lba3:d2", JSON.stringify({ t: Date.now(), d: d, c: c })); } catch (e) {}
    });
    return READY;
  }
  function coll(h) { return fetchAll("/collections/" + h + "/products.json").then(function (ps) { return ps.map(function (p) { return p.handle; }); }).catch(function () { return []; }); }
  function setData(d, c) {
    D = d; BY = {}; D.forEach(function (p) { BY[p.h] = p; });
    COLLS = c || {};
    (COLLS["meilleures-ventes"] || []).forEach(function (h) { if (BY[h]) BY[h].best = true; });
    (COLLS["parfums-de-niche"] || []).forEach(function (h) { if (BY[h]) BY[h].hp = true; });
  }
  function collection(h) {
    if (COLLS[h]) return Promise.resolve(COLLS[h]);
    return coll(h).then(function (list) { COLLS[h] = list; return list; });
  }
  function maisons() { var c = {}; D.forEach(function (p) { c[p.m] = (c[p.m] || 0) + 1; }); return Object.keys(c).sort(function (a, b) { return a.localeCompare(b, "fr"); }).map(function (k) { return [k, c[k]]; }); }
  function famCounts(list) { var c = {}; (list || D).forEach(function (p) { p.fams.forEach(function (f) { c[f] = (c[f] || 0) + 1; }); }); return c; }

  /* ---------- rendu des cartes ---------- */
  var ICON_BAG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 8h14l-1.2 12H6.2z"/><path d="M9 8V6a3 3 0 016 0v2"/></svg>';
  function card(p) {
    var off = p.cp ? Math.round((1 - p.p / p.cp) * 100) : 0;
    var tags = (!p.a ? '<span class="tag dark">Épuisé</span>' : "") + (off >= 5 ? '<span class="tag sale">−' + off + " %</span>" : "") + (p.fmt === "Testeur" ? '<span class="tag">Testeur</span>' : "") + (p.best && p.a && !off ? '<span class="tag">Best-seller</span>' : "");
    return '<a class="card' + (p.a ? "" : " out") + '" href="#/produit/' + esc(p.h) + '">' +
      '<div class="ph">' + (p.img ? '<img src="' + esc(img(p.img, 600)) + '" alt="' + esc(p.n + " – " + p.m) + '" loading="lazy" width="600" height="750">' : "") +
      (p.ims[1] ? '<img class="alt" src="' + esc(img(p.ims[1], 600)) + '" alt="" loading="lazy" width="600" height="750">' : "") +
      (tags ? '<div class="tags">' + tags + "</div>" : "") +
      (p.a && p.vs.length === 1 ? '<button type="button" class="quick" data-add="' + p.vs[0].id + '" aria-label="Ajouter ' + esc(p.n) + ' au panier">' + ICON_BAG + "</button>" : "") +
      "</div>" +
      '<div class="meta"><span class="mai">' + esc(p.m) + '</span><span class="nm">' + esc(p.n) + '</span><span class="cc">' + esc(p.conc) + '</span><span class="pr">' + (p.vs.length > 1 ? "Dès " : "") + eur(p.p) + (p.cp ? "<s>" + eur(p.cp) + "</s>" : "") + "</span></div></a>";
  }
  var skel = function (n) { var s = ""; for (var i = 0; i < n; i++) s += '<div class="card skel"><div class="ph"></div><div class="meta"><i></i><i style="width:50%"></i></div></div>'; return s; };

  /* ---------- navigation ---------- */
  var ARROW = '<svg viewBox="0 0 10 6" width="9" height="6" aria-hidden="true"><path d="M1 1l4 4 4-4" stroke="currentColor" fill="none" stroke-width="1.4"/></svg>';
  function renderNav() {
    $("#nav").innerHTML = MENU.map(function (m, i) {
      if (typeof m[1] === "string") return '<li><a href="' + m[1] + '">' + esc(m[0]) + "</a></li>";
      return '<li class="hd-dd"><button type="button" aria-expanded="false" aria-controls="dd' + i + '">' + esc(m[0]) + ARROW + '</button><div class="hd-panel' + (m[1].length > 12 ? " cols" : "") + '" id="dd' + i + '" hidden><ul>' + m[1].map(function (s) { return '<li><a href="' + s[1] + '">' + esc(s[0]) + "</a></li>"; }).join("") + "</ul></div></li>";
    }).join("");
    $("#navM").innerHTML = MENU.map(function (m) {
      if (typeof m[1] === "string") return '<li><a class="m-link" href="' + m[1] + '">' + esc(m[0]) + "</a></li>";
      return "<li><details><summary>" + esc(m[0]) + "</summary><ul>" + m[1].map(function (s) { return '<li><a href="' + s[1] + '">' + esc(s[0]) + "</a></li>"; }).join("") + "</ul></details></li>";
    }).join("");
    $("#ftFam").innerHTML = ENVIES.map(function (e) { return '<li><a href="#/catalogue?famille=' + encodeURIComponent(e.f) + '">' + e.l + "</a></li>"; }).join("");
    var dds = $$(".hd-dd");
    function closeAll(ex) { dds.forEach(function (d) { if (d !== ex) { d.classList.remove("on"); d.querySelector("button").setAttribute("aria-expanded", "false"); d.querySelector(".hd-panel").hidden = true; } }); }
    dds.forEach(function (d) {
      var b = d.querySelector("button"), pn = d.querySelector(".hd-panel"), t;
      function set(on) { closeAll(d); d.classList.toggle("on", on); b.setAttribute("aria-expanded", String(on)); pn.hidden = !on; }
      b.addEventListener("click", function () { set(pn.hidden); });
      if (matchMedia("(hover: hover)").matches) {
        d.addEventListener("mouseenter", function () { clearTimeout(t); set(true); });
        d.addEventListener("mouseleave", function () { t = setTimeout(function () { set(false); }, 160); });
      }
    });
    document.addEventListener("click", function (e) { if (!e.target.closest(".hd-dd")) closeAll(); if (e.target.closest(".hd-panel a")) closeAll(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") { closeAll(); closeDrawers(); } });
  }
  function openDrawer(id, btn) { var d = $(id); d.hidden = false; document.documentElement.style.overflow = "hidden"; if (btn) btn.setAttribute("aria-expanded", "true"); var f = d.querySelector("button,a"); if (f) f.focus(); }
  function closeDrawers() { $$(".drawer").forEach(function (d) { d.hidden = true; }); document.documentElement.style.overflow = ""; $("#burger").setAttribute("aria-expanded", "false"); }

  /* ---------- routeur ---------- */
  var app = $("#app");
  function route() {
    var h = location.hash.replace(/^#\/?/, "");
    var q = h.indexOf("?") > -1 ? h.slice(h.indexOf("?") + 1) : "";
    var path = h.split("?")[0].split("/");
    closeDrawers();
    stickyOff();
    if (path[0] === "faq" || h === "faq") return;
    window.scrollTo(0, 0);
    if (path[0] === "produit" && path[1]) return viewProduct(decodeURIComponent(path[1]));
    if (path[0] === "catalogue") return viewCatalogue(new URLSearchParams(q), null);
    if (path[0] === "collection" && path[1]) return viewCatalogue(new URLSearchParams(q), path[1]);
    if (path[0] === "offrir") return viewHome("offrir");
    return viewHome();
  }

  /* ---------- accueil ---------- */
  var REVIEWS = [
    ["Au top merci, je recommande fortement ce vendeur, livraison rapide", "Client TikTok Shop", "La Rose Bleue · novembre 2026"],
    ["Parfum super bien emballé, odeur magnifique en plus de la livraison en moins de 48 h. Je recommanderais sans hésiter, vous avez su me surprendre !", "Client TikTok Shop", "Montecristo · septembre 2026"],
    ["Un parfum puissant qui dure longtemps, très belle tenue et livraison très rapide, je le recommande, merci", "Acheteur eBay · achat vérifié", "l'année précédente"],
    ["Une odeur magnifique, fruitée caramel vanille ambrée, sent très bon", "Client TikTok Shop", "Ghost · septembre 2026"],
    ["Une vraie pépite ! L'odeur est incroyable, élégante et envoûtante. Le packaging est magnifique, on dirait un véritable bijou de luxe.", "Client TikTok Shop", "juillet 2026"],
    ["Incroyable parfum, il tient longtemps et a un excellent sillage.", "Client TikTok Shop", "juin 2026"],
    ["Vendeur très sérieux, je recommande, petit souci à la livraison et il a géré le SAV comme un chef", "Client TikTok Shop", "juillet 2026"],
    ["Le parfum est juste incroyable, Gris Montaigne me surprendra toujours. Le coffret est une pépite.", "Client TikTok Shop", "mai 2026"]
  ];
  var FAQ = [
    ["Vos parfums tiennent-ils longtemps sur la peau ?", "Nos parfums sont sélectionnés pour leur concentration et leur tenue. Selon la fragrance et le type de peau, le sillage peut durer plusieurs heures, sur la peau comme sur les vêtements."],
    ["Les parfums conviennent-ils aux femmes et aux hommes ?", "Oui. Notre collection propose des parfums féminins, masculins et mixtes, pensés pour s'adapter à chaque style et à chaque personnalité."],
    ["Quels sont les délais de livraison ?", "Nous expédions votre commande sous 24 à 48 h. Le délai de livraison après expédition varie selon la destination. La livraison est offerte dès 50 € en France."],
    ["Puis-je retourner un parfum s'il ne me convient pas ?", "Oui. Vous disposez de 14 jours après réception pour effectuer un retour, à condition que le produit n'ait pas été ouvert."],
    ["Que signifie le format testeur ?", "Un testeur est le même parfum que la version commerciale, livré sans l'emballage de présentation d'origine (boîte neutre ou sans boîte) et, selon les marques, parfois sans bouchon. Il est vendu moins cher. Pour offrir, choisissez de préférence la version avec boîte."],
    ["Comment récupérer ma commande en retrait ?", "Lorsque le retrait est proposé au paiement, sélectionnez « Retrait ». Attendez la confirmation de préparation et consultez le lieu de retrait et les instructions de votre commande avant de vous déplacer."],
    ["Comment choisir si je connais seulement une note ?", "Ouvrez « Trouver mon parfum », indiquez une note comme la vanille et votre budget : la conseillère vous propose trois flacons disponibles."]
  ];
  var TRUST = [
    ['<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.6"/><circle cx="17" cy="17.5" r="1.6"/>', "Livraison offerte dès 50 €", "France, expédition sous 24 à 48 h"],
    ['<path d="M4 12a8 8 0 1 0 3-6.2"/><path d="M4 4v4h4"/>', "Retours sous 14 jours", "Produit non ouvert"],
    ['<rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>', "Paiement sécurisé", "Carte, PayPal, Apple Pay, Klarna"],
    ['<path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z"/>', "4,6 / 5 sur 111 avis", "Clients TikTok Shop vérifiés"],
    ['<path d="M4 5h16v11H8l-4 4z"/>', "Une question ?", "Réponse par WhatsApp"]
  ];
  function viewHome(anchor) {
    document.title = "La Bonne Adresse Paris – Parfums de niche et petits prix";
    app.innerHTML =
      '<section class="hero"><div class="hero-grid">' +
        '<div class="hero-copy">' +
          '<p class="eyebrow" style="margin:0">Parfumerie en ligne · Paris</p>' +
          "<h1>Le parfum<br>parle <em>pour vous.</em></h1>" +
          '<p class="lead">Haute parfumerie, maisons orientales et signatures à petit prix. Dites-nous ce que vous aimez sentir, on s\'occupe du reste.</p>' +
          '<div class="hero-ctas"><button type="button" class="btn btn-dark" data-adv-open>Trouver mon parfum</button><a class="btn btn-line" href="#/catalogue?sort=new">Les nouveautés</a></div>' +
          '<div class="hero-envies"><span>Envie de :</span>' + ENVIES.slice(0, 5).map(function (e) { return '<a class="chip" href="#/catalogue?famille=' + encodeURIComponent(e.f) + '">' + e.l + "</a>"; }).join("") + "</div>" +
          '<div class="hero-facts"><div><b data-cnt="all">184</b><span>parfums</span></div><div><b data-cnt="mai">40+</b><span>maisons</span></div><div><b>4,6/5</b><span>avis clients</span></div></div>' +
        "</div>" +
        '<div class="hero-media"><img src="' + SHOP + '/cdn/shop/files/DE8194DD-EE47-4488-9283-09D569F7F821.png?width=1600" alt="Deux femmes présentent des flacons de parfum La Bonne Adresse" fetchpriority="high" width="1600" height="1200">' +
          '<div class="hero-badge"><b>−15 %</b><span>sur tout le site avec <strong>BLACK15</strong><br><small>jusqu\'au 27 novembre</small></span></div></div>' +
      "</div></section>" +
      '<section class="trust" aria-label="Nos engagements"><div class="wrap">' + TRUST.map(function (t) { return '<div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">' + t[0] + "</svg><p><b>" + t[1] + "</b><span>" + t[2] + "</span></p></div>"; }).join("") + "</div></section>" +
      '<section><div class="wrap"><div class="sec-head"><div><p class="eyebrow">Par envie</p><h2>Par quelle matière commencer ?</h2><p class="lead">Six familles pour s\'y retrouver dans tout le catalogue.</p></div><a class="link" href="#/catalogue">Tous les parfums</a></div><div class="envies" id="envies">' + ENVIES.map(function (e) { return '<a class="envie" href="#/catalogue?famille=' + encodeURIComponent(e.f) + '"><div><b>' + e.l + "</b><span>…</span></div></a>"; }).join("") + "</div></div></section>" +
      '<section style="padding-top:0"><div class="wrap"><div class="sec-head"><div><p class="eyebrow">Nouveautés</p><h2>Les dernières arrivées</h2></div><div style="display:flex;gap:18px;align-items:center"><div class="row-nav"><button type="button" data-row="-1" aria-label="Précédent">‹</button><button type="button" data-row="1" aria-label="Suivant">›</button></div><a class="link" href="#/catalogue?sort=new">Toutes les nouveautés</a></div></div><div class="row" id="rowNew">' + skel(4) + "</div></div></section>" +
      budgetHTML() +
      '<section><div class="wrap"><div class="sec-head"><div><p class="eyebrow">Les plus demandés</p><h2>Meilleures ventes</h2><p class="lead">Les références les plus commandées du moment.</p></div><a class="link" href="#/collection/meilleures-ventes">Voir toutes les meilleures ventes</a></div><div class="grid" id="gridBest">' + skel(8) + "</div></div></section>" +
      '<section class="dark"><div class="wrap"><div class="sec-head"><div><p class="eyebrow">Haute parfumerie</p><h2>Une sélection d\'exception</h2><p class="lead">Xerjoff, Frédéric Malle, Kilian, Maison Francis Kurkdjian… choisis par nos experts.</p></div><a class="btn btn-line" href="#/collection/parfums-de-niche">Découvrir la sélection</a></div><div class="grid" id="gridHp">' + skel(4) + "</div></div></section>" +
      '<section><div class="wrap fix"><div><p class="eyebrow">Fixateurs Secret Musc</p><h2>Prolongez votre parfum</h2><p class="lead" style="margin-top:14px">Appliquez une noisette sur peau propre, puis vaporisez votre parfum par-dessus : il tient plus longtemps. Fabriqués en France, en 30 ml.</p><p style="margin-top:22px"><a class="link" href="#/collection/fixateurs-de-parfum">Voir tous les fixateurs</a></p></div><div class="fix-list" id="fixList"></div></div></section>' +
      '<div class="marq" aria-label="Nos maisons"><div class="marq-in">' + MAISONS_MENU.concat(MAISONS_MENU).map(function (m, i) { return '<a href="#/catalogue?maison=' + encodeURIComponent(m) + '"' + (i >= MAISONS_MENU.length ? ' aria-hidden="true" tabindex="-1"' : "") + ">" + esc(m) + "</a>"; }).join("") + "</div></div>" +
      '<section><div class="wrap"><div class="sec-head"><div class="rev-head"><div><p class="eyebrow">Avis clients</p><h2>Ils nous ont fait confiance</h2></div><div class="rev-score"><b>4,6</b><div><span class="stars" aria-hidden="true">★★★★★</span><small>sur 111 avis TikTok Shop</small></div></div></div><div class="row-nav"><button type="button" data-row="-1" aria-label="Avis précédents">‹</button><button type="button" data-row="1" aria-label="Avis suivants">›</button></div></div>' +
        '<div class="row" id="rowRev">' + REVIEWS.map(function (r) { return '<figure class="rev" style="margin:0"><span class="stars" aria-label="5 étoiles sur 5">★★★★★</span><q>' + esc(r[0]) + "</q><small>" + esc(r[1]) + " · " + esc(r[2]) + "</small></figure>"; }).join("") + "</div>" +
        '<p class="rev-note">Avis de clients TikTok Shop et eBay (achats vérifiés), publiés tels quels. La note de 4,6 sur 5 porte sur l\'ensemble des 111 avis TikTok Shop, y compris les moins bons.</p></div></section>' +
      '<section id="offrir" style="padding-top:0"><div class="wrap"><div class="gift"><div class="gift-copy"><p class="eyebrow" style="margin:0">Offrir</p><h2>Quel parfum lui ferait plaisir ?</h2><p>Un parfum qu\'elle porte déjà, une matière qu\'il aime, un budget… La conseillère vous aide à choisir parmi les flacons disponibles. Sinon, la carte cadeau laisse le choix.</p><div class="acts"><button type="button" class="btn btn-gold" data-adv-gift>Trouver une idée cadeau</button><a class="btn btn-line" style="border-color:#F6EEE6" href="' + SHOP + '/products/carte-cadeau-la-bonne-adresse-paris">La carte cadeau</a></div><p style="font-size:.85rem"><a href="' + WA + '" target="_blank" rel="noopener">Parler à LBA sur WhatsApp</a></p></div><div class="gift-media"><img src="' + SHOP + '/cdn/shop/files/LBA-Carte-Cadeau-Studio.jpg?width=1000" alt="Carte cadeau La Bonne Adresse Paris" loading="lazy" width="1000" height="700"></div></div></div></section>' +
      '<section id="faq" style="padding-top:0"><div class="wrap faq"><div><p class="eyebrow">Questions fréquentes</p><h2>On vous répond</h2><p class="lead" style="margin-top:14px">Une autre question ? <a href="' + WA + '" target="_blank" rel="noopener">Écrivez-nous sur WhatsApp</a>.</p></div><div>' + FAQ.map(function (f) { return "<details><summary>" + esc(f[0]) + "</summary><p>" + esc(f[1]) + "</p></details>"; }).join("") + "</div></div></section>";
    bindRows();
    initBudget();
    load().then(function () {
      $$("[data-cnt=all]").forEach(function (el) { el.textContent = D.length; });
      $$("[data-cnt=mai]").forEach(function (el) { el.textContent = maisons().length; });
      var fc = famCounts();
      $("#envies").innerHTML = ENVIES.map(function (e) {
        var pick = D.filter(function (p) { return p.f === e.f && p.a && p.img; }).sort(function (a, b) { return (b.best - a.best) || (b.p - a.p); })[0];
        return '<a class="envie" href="#/catalogue?famille=' + encodeURIComponent(e.f) + '">' + (pick ? '<img src="' + esc(img(pick.img, 500)) + '" alt="" loading="lazy" width="500" height="660">' : "") + "<div><b>" + e.l + "</b><span>" + (fc[e.f] || 0) + " parfums</span></div></a>";
      }).join("");
      var news = D.filter(function (p) { return p.a && p.parf; }).sort(function (a, b) { return b.t - a.t; }).slice(0, 12);
      $("#rowNew").innerHTML = news.map(card).join("");
      var best = (COLLS["meilleures-ventes"] || []).map(function (h) { return BY[h]; }).filter(function (p) { return p && p.a; }).slice(0, 8);
      if (best.length < 4) best = D.filter(function (p) { return p.a; }).slice(0, 8);
      $("#gridBest").innerHTML = best.map(card).join("");
      var hp = (COLLS["parfums-de-niche"] || []).map(function (h) { return BY[h]; }).filter(function (p) { return p && p.a; }).sort(function (a, b) { return b.p - a.p; }).slice(0, 4);
      $("#gridHp").innerHTML = hp.map(card).join("");
      var fx = D.filter(function (p) { return p.fmt === "Fixateur"; });
      $("#fixList").innerHTML = fx.map(function (p) {
        return '<div class="fix-item"><a class="ph" href="#/produit/' + esc(p.h) + '">' + (p.img ? '<img src="' + esc(img(p.img, 300)) + '" alt="' + esc(p.n) + '" loading="lazy">' : "") + '</a><div><b>' + esc(p.n) + "</b><p>" + esc(p.fams.join(", ")) + ' · 30 ml</p><p class="pr">' + eur(p.p) + "</p></div>" + (p.a ? '<button type="button" class="btn btn-dark" data-add="' + p.vs[0].id + '">Ajouter</button>' : '<span class="tag dark">Épuisé</span>') + "</div>";
      }).join("");
      budgetRender();
      if (anchor) { var el = document.getElementById(anchor); if (el) el.scrollIntoView(); }
    }).catch(loadError);
  }
  function loadError() { toast("Le catalogue n'a pas pu être chargé. Vérifiez votre connexion puis rechargez la page."); }
  function bindRows() {
    $$("[data-row]").forEach(function (b) {
      b.addEventListener("click", function () {
        var row = b.closest(".wrap").querySelector(".row");
        row.scrollBy({ left: (+b.getAttribute("data-row")) * row.clientWidth * 0.9, behavior: "smooth" });
      });
    });
  }

  /* ---------- budget + surprise ---------- */
  var B = { max: 100, fam: null, last: null };
  function budgetHTML() {
    return '<section class="bud" id="budget"><div class="wrap">' +
      '<div class="bud-top"><div><p class="eyebrow">Par budget</p><h2>Votre budget, notre sélection</h2><p class="lead" style="margin-top:12px">Réglez votre budget, la sélection se met à jour tout de suite. Indécis ? Laissez-nous vous surprendre.</p></div>' +
      '<div class="bud-ctl"><div class="bud-val"><span>Jusqu\'à</span><output id="bOut" for="bMax">100 €</output></div>' +
      '<label class="visually-hidden" for="bMax">Budget maximum</label><input type="range" id="bMax" min="20" max="300" step="5" value="100">' +
      '<div class="chips" id="bQuick">' + [40, 60, 100, 150, 300].map(function (v) { return '<button type="button" class="chip" data-q="' + v + '">' + (v >= 300 ? "Sans limite" : "Jusqu'à " + v + " €") + "</button>"; }).join("") + "</div>" +
      '<div class="chips" id="bFam"><button type="button" class="chip" data-f="" aria-pressed="true">Toutes les envies</button>' + ENVIES.map(function (e) { return '<button type="button" class="chip" data-f="' + esc(e.f) + '">' + e.l + "</button>"; }).join("") + "</div></div></div>" +
      '<div class="bud-bar"><p id="bCount" aria-live="polite">…</p><div class="acts"><button type="button" class="btn btn-line" id="bSurprise">Demander à être surpris</button><a class="btn btn-dark" id="bAll" href="#/catalogue">Voir toute la sélection</a></div></div>' +
      '<div class="reveal" id="bReveal" hidden><a class="ph" id="bRevImg" href="#/"></a><div><p class="eyebrow" style="margin:0">Notre surprise pour vous</p><h3 id="bRevName"></h3><p id="bRevWhy"></p><div class="acts"><a class="btn btn-dark" id="bRevSee" href="#/">Voir ce parfum</a><button type="button" class="btn btn-line" id="bRevAdd">Ajouter au panier</button><button type="button" class="btn" id="bAgain" style="text-decoration:underline">Une autre surprise</button></div></div></div>' +
      '<div class="grid" id="bGrid">' + skel(4) + "</div></div></section>";
  }
  function bPool() { var nl = B.max >= 300; return D.filter(function (p) { return p.a && p.parf && (nl || p.p <= B.max) && (!B.fam || p.fams.indexOf(B.fam) > -1); }); }
  function budgetRender() {
    var r = $("#bMax"); if (!r || !D.length) return;
    var nl = B.max >= 300;
    r.style.setProperty("--p", ((B.max - 20) / 280 * 100) + "%");
    $("#bOut").textContent = nl ? "Sans limite" : B.max + " €";
    $$("#bQuick [data-q]").forEach(function (b) { b.setAttribute("aria-pressed", String(+b.getAttribute("data-q") === B.max)); });
    $$("#bFam [data-f]").forEach(function (b) { b.setAttribute("aria-pressed", String((b.getAttribute("data-f") || null) === B.fam)); });
    var pool = bPool();
    pool.sort(function (a, b) { var sa = (a.best ? 2 : 0) + (nl ? (a.hp ? 1 : 0) : a.p / B.max), sb = (b.best ? 2 : 0) + (nl ? (b.hp ? 1 : 0) : b.p / B.max); return sb - sa; });
    $("#bCount").textContent = pool.length ? pool.length + " parfum" + (pool.length > 1 ? "s" : "") + " disponible" + (pool.length > 1 ? "s" : "") + (nl ? "" : " jusqu'à " + B.max + " €") + (B.fam ? ", famille " + B.fam.toLowerCase() : "") : "Aucun parfum disponible dans ce budget : montez un peu le curseur.";
    var q = ["dispo=1"]; if (!nl) q.push("max=" + B.max); if (B.fam) q.push("famille=" + encodeURIComponent(B.fam));
    $("#bAll").setAttribute("href", "#/catalogue?" + q.join("&"));
    $("#bGrid").innerHTML = pool.slice(0, 8).map(card).join("");
    $("#bSurprise").disabled = !pool.length;
  }
  function surprise() {
    var pool = bPool(); if (!pool.length) return;
    var pick, n = 0;
    do { pick = pool[Math.floor(Math.random() * pool.length)]; n++; } while (pool.length > 1 && pick === B.last && n < 10);
    B.last = pick;
    $("#bReveal").hidden = false;
    $("#bRevImg").innerHTML = pick.img ? '<img src="' + esc(img(pick.img, 700)) + '" alt="' + esc(pick.n) + '">' : "";
    $("#bRevImg").setAttribute("href", "#/produit/" + pick.h);
    $("#bRevSee").setAttribute("href", "#/produit/" + pick.h);
    $("#bRevName").textContent = pick.n;
    $("#bRevWhy").textContent = pick.fams.join(", ") + ", signé " + pick.m + ", " + eur(pick.p) + (B.max >= 300 ? "." : " : dans votre budget de " + B.max + " €.") + " " + famDesc(pick.f);
    $("#bRevAdd").hidden = !(pick.vs.length === 1);
    $("#bRevAdd").setAttribute("data-add", pick.vs[0].id);
    $("#bReveal").scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
  function initBudget() {
    var r = $("#bMax"); if (!r) return;
    var t; r.addEventListener("input", function () { B.max = +r.value; clearTimeout(t); t = setTimeout(budgetRender, 50); });
    $("#bQuick").addEventListener("click", function (e) { var b = e.target.closest("[data-q]"); if (!b) return; B.max = +b.getAttribute("data-q"); r.value = B.max; budgetRender(); });
    $("#bFam").addEventListener("click", function (e) { var b = e.target.closest("[data-f]"); if (!b) return; B.fam = b.getAttribute("data-f") || null; budgetRender(); });
    $("#bSurprise").addEventListener("click", surprise);
    $("#bAgain").addEventListener("click", surprise);
  }

  /* ---------- catalogue ---------- */
  function viewCatalogue(u, collH) {
    var meta = collH ? (COLL[collH] || { t: collH.replace(/-/g, " "), d: "" }) : null;
    app.innerHTML = '<div class="cat-head"><div class="wrap"><nav class="crumbs" aria-label="Fil d\'Ariane"><a href="#/">Accueil</a><span>/</span><span id="crumb">Parfums</span></nav><h1 id="catT">' + esc(meta ? meta.t : "Tous les parfums") + '</h1><p class="lead" id="catD">' + esc(meta ? meta.d : "") + '</p><div class="qchips" id="qchips"></div></div></div>' +
      '<div class="wrap cat-body"><aside class="filters" id="filters" aria-label="Filtres"><div class="f-close"><b>Filtres</b><button type="button" class="ic" id="fClose" aria-label="Fermer les filtres"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>' +
      '<div class="search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/></svg><input id="q" type="search" placeholder="Un parfum, une maison, une note" aria-label="Rechercher"></div>' +
      '<div class="fg"><h4>Budget</h4><div class="bud-val" style="margin-bottom:4px"><span>Jusqu\'à</span><output id="fOut" style="font-size:1.6rem">Sans limite</output></div><input type="range" id="fMax" min="20" max="300" step="5" value="300" aria-label="Budget maximum"></div>' +
      '<div class="fg"><h4>Famille olfactive</h4><div id="fFam"></div></div>' +
      '<div class="fg"><h4>Concentration</h4><div id="fConc"></div></div>' +
      '<div class="fg"><h4>Format</h4><div id="fFmt"></div></div>' +
      '<div class="fg"><h4>Maison</h4><div id="fMai"></div><button type="button" class="more" id="maiMore">Toutes les maisons</button></div>' +
      '<div class="fg"><label><input type="checkbox" id="fDispo"> Disponibles uniquement</label></div>' +
      '<button type="button" class="btn btn-dark f-close" id="fApply" style="margin-top:16px;width:100%">Voir les résultats</button></aside>' +
      '<div style="min-width:0"><div class="toolbar"><div style="display:flex;gap:12px;align-items:center"><button type="button" class="btn btn-line ftoggle" id="fOpen" style="min-height:42px">Filtres</button><span id="count" style="color:var(--muted)">…</span></div><label style="display:flex;gap:10px;align-items:center;font-size:.86rem;color:var(--muted)">Trier <select id="sort"><option value="sel">Sélection</option><option value="new">Nouveautés</option><option value="asc">Prix croissant</option><option value="desc">Prix décroissant</option><option value="az">Nom A à Z</option></select></label></div>' +
      '<div class="active" id="active"></div><div class="grid g3" id="catGrid">' + skel(9) + '</div><p style="text-align:center;margin-top:36px"><button type="button" class="btn btn-line" id="more" hidden>Voir plus de parfums</button></p></div></div>';
    Promise.all([load(), collH ? collection(collH) : Promise.resolve(null)]).then(function (r) { initCatalogue(u, collH, r[1]); }).catch(loadError);
  }
  function initCatalogue(u, collH, handles) {
    var base = handles ? handles.map(function (h) { return BY[h]; }).filter(Boolean) : D;
    var S = { cf: new Set(), mai: new Set(), conc: new Set(), fmt: new Set(), max: null, q: "", dispo: false, sort: "sel", limit: 24 }, maiAll = false;
    var list = function (k) { return (u.get(k) || "").split(",").map(function (x) { return x.trim(); }).filter(Boolean); };
    var allF = Object.keys(famCounts(base)).sort(function (a, b) { return famCounts(base)[b] - famCounts(base)[a]; });
    list("famille").forEach(function (x) { var c = allF.find(function (f) { return norm(f) === norm(x); }); if (c) S.cf.add(c); });
    u.getAll("maison").forEach(function (x) { var m = maisons().find(function (y) { return norm(y[0]) === norm(x); }); if (m) S.mai.add(m[0]); });
    if (+u.get("max") > 0) S.max = +u.get("max");
    if (u.get("q")) S.q = u.get("q");
    if (u.get("dispo") === "1") S.dispo = true;
    if (u.get("sort")) S.sort = u.get("sort");
    var MAI = (function () { var c = {}; base.forEach(function (p) { c[p.m] = (c[p.m] || 0) + 1; }); return Object.keys(c).sort(function (a, b) { return c[b] - c[a]; }).map(function (k) { return [k, c[k]]; }); })();
    function match(p, skip) {
      if (skip !== "cf" && S.cf.size && !p.fams.some(function (f) { return S.cf.has(f); })) return false;
      if (skip !== "mai" && S.mai.size && !S.mai.has(p.m)) return false;
      if (skip !== "conc" && S.conc.size && !S.conc.has(p.c)) return false;
      if (skip !== "fmt" && S.fmt.size && !S.fmt.has(p.fmt)) return false;
      if (S.max && S.max < 300 && p.p > S.max) return false;
      if (S.dispo && !p.a) return false;
      if (S.q) { var t = norm(p.n + " " + p.m + " " + p.conc + " " + p.fams.join(" ")); if (!norm(S.q).split(/\s+/).every(function (w) { return t.indexOf(w) > -1; })) return false; }
      return true;
    }
    function results() {
      var r = base.filter(function (p) { return match(p); });
      var s = { asc: function (a, b) { return a.p - b.p; }, desc: function (a, b) { return b.p - a.p; }, az: function (a, b) { return a.n.localeCompare(b.n, "fr"); }, "new": function (a, b) { return b.t - a.t; } }[S.sort];
      r.sort(s || function (a, b) { return (b.a - a.a) || (b.best - a.best) || (handles ? 0 : b.t - a.t); });
      if (s) r.sort(function (a, b) { return b.a - a.a; });
      return r;
    }
    function checks(el, key, entries) {
      el.innerHTML = entries.map(function (e) {
        var v = e[0];
        var n = base.filter(function (p) { if (!match(p, key)) return false; return key === "cf" ? p.fams.indexOf(v) > -1 : key === "mai" ? p.m === v : key === "conc" ? p.c === v : p.fmt === v; }).length;
        var on = S[key].has(v);
        return '<label><input type="checkbox" data-k="' + key + '" value="' + esc(v) + '"' + (on ? " checked" : "") + (n || on ? "" : " disabled") + "> " + esc(e[1] || v) + "<em>" + n + "</em></label>";
      }).join("");
    }
    function toHash() {
      var q = [];
      if (S.cf.size) q.push("famille=" + Array.from(S.cf).map(encodeURIComponent).join(","));
      S.mai.forEach(function (m) { q.push("maison=" + encodeURIComponent(m)); });
      if (S.max && S.max < 300) q.push("max=" + S.max);
      if (S.q) q.push("q=" + encodeURIComponent(S.q));
      if (S.dispo) q.push("dispo=1");
      if (S.sort !== "sel") q.push("sort=" + S.sort);
      var h = "#/" + (collH ? "collection/" + collH : "catalogue") + (q.length ? "?" + q.join("&") : "");
      try { history.replaceState(null, "", h); } catch (e) {}
    }
    function render() {
      var r = results();
      checks($("#fFam"), "cf", allF.map(function (f) { return [f]; }));
      var concs = {}; base.forEach(function (p) { concs[p.c] = 1; });
      checks($("#fConc"), "conc", Object.keys(concs).sort().map(function (c) { return [c]; }));
      var fmts = {}; base.forEach(function (p) { fmts[p.fmt] = 1; });
      checks($("#fFmt"), "fmt", Object.keys(fmts).map(function (c) { return [c]; }));
      var ms = MAI.filter(function (m, i) { return maiAll || i < 10 || S.mai.has(m[0]); });
      checks($("#fMai"), "mai", ms.map(function (m) { return [m[0]]; }));
      $("#maiMore").hidden = MAI.length <= 10; $("#maiMore").textContent = maiAll ? "Réduire la liste" : "Toutes les maisons (" + MAI.length + ")";
      var fm = $("#fMax"); fm.value = S.max || 300; fm.style.setProperty("--p", (((S.max || 300) - 20) / 280 * 100) + "%");
      $("#fOut").textContent = !S.max || S.max >= 300 ? "Sans limite" : S.max + " €";
      $("#fDispo").checked = S.dispo; if (document.activeElement !== $("#q")) $("#q").value = S.q; $("#sort").value = S.sort;
      var t = collH ? (COLL[collH] || {}).t || "Sélection" : "Tous les parfums", d = collH ? (COLL[collH] || {}).d || "" : D.length + " parfums de " + maisons().length + " maisons. Filtrez par envie, maison ou budget.";
      if (!collH) {
        if (S.cf.size === 1 && !S.mai.size) { var f = Array.from(S.cf)[0]; t = "Parfums " + (ENVIES.find(function (e) { return e.f === f; }) || { l: f.toLowerCase() }).l.toLowerCase(); d = famDesc(f) || "Tous nos parfums de la famille " + f.toLowerCase() + "."; }
        else if (S.mai.size === 1 && !S.cf.size) { t = Array.from(S.mai)[0]; d = "Tous les parfums " + t + " disponibles chez La Bonne Adresse."; }
        else if (S.sort === "new" && !S.cf.size && !S.mai.size) { t = "Nouveautés"; d = "Les derniers parfums arrivés en boutique."; }
        else if (S.max && S.max < 300 && !S.cf.size) { t = "Jusqu'à " + S.max + " €"; d = "Notre sélection dans votre budget."; }
      }
      $("#catT").textContent = t; $("#catD").textContent = d; $("#crumb").textContent = t;
      document.title = t + " – La Bonne Adresse Paris";
      $("#qchips").innerHTML = ENVIES.map(function (e) { return '<button type="button" class="chip" data-qf="' + esc(e.f) + '" aria-pressed="' + (S.cf.has(e.f) && S.cf.size === 1) + '">' + e.l + "</button>"; }).join("");
      var act = [];
      S.cf.forEach(function (v) { act.push(["cf", v, v]); });
      S.mai.forEach(function (v) { act.push(["mai", v, v]); });
      S.conc.forEach(function (v) { act.push(["conc", v, v]); });
      S.fmt.forEach(function (v) { act.push(["fmt", v, v]); });
      if (S.max && S.max < 300) act.push(["max", "", "Jusqu'à " + S.max + " €"]);
      if (S.dispo) act.push(["dispo", "", "Disponibles"]);
      if (S.q) act.push(["q", "", "« " + S.q + " »"]);
      $("#active").innerHTML = act.map(function (a) { return '<button type="button" data-rm="' + a[0] + '" data-v="' + esc(a[1]) + '" aria-label="Retirer le filtre ' + esc(a[2]) + '">' + esc(a[2]) + "</button>"; }).join("") + (act.length > 1 ? '<button type="button" class="clear" data-rm="all" style="border:0;text-decoration:underline">Tout effacer</button>' : "");
      $("#count").textContent = r.length + " parfum" + (r.length > 1 ? "s" : "");
      $("#catGrid").innerHTML = r.length ? r.slice(0, S.limit).map(card).join("") : '<p class="empty" style="grid-column:1/-1">Aucun parfum ne correspond. Retirez un filtre ou <button type="button" data-adv-open style="text-decoration:underline">demandez conseil</button>.</p>';
      $("#more").hidden = r.length <= S.limit;
      $("#fApply").textContent = "Voir les " + r.length + " résultats";
      toHash();
    }
    render();
    if (u.get("focus")) setTimeout(function () { $("#q").focus(); }, 80);
    $("#filters").addEventListener("change", function (e) { var i = e.target; if (i.dataset.k) S[i.dataset.k][i.checked ? "add" : "delete"](i.value); if (i.id === "fDispo") S.dispo = i.checked; S.limit = 24; render(); });
    var mt; $("#fMax").addEventListener("input", function (e) { S.max = +e.target.value; clearTimeout(mt); mt = setTimeout(function () { S.limit = 24; render(); }, 60); });
    var qt; $("#q").addEventListener("input", function (e) { clearTimeout(qt); qt = setTimeout(function () { S.q = e.target.value.trim(); S.limit = 24; render(); }, 180); });
    $("#sort").addEventListener("change", function (e) { S.sort = e.target.value; render(); });
    $("#more").addEventListener("click", function () { S.limit += 24; render(); });
    $("#maiMore").addEventListener("click", function () { maiAll = !maiAll; render(); });
    $("#fOpen").addEventListener("click", function () { $("#filters").classList.add("open"); });
    $("#fClose").addEventListener("click", function () { $("#filters").classList.remove("open"); });
    $("#fApply").addEventListener("click", function () { $("#filters").classList.remove("open"); window.scrollTo(0, $("#catGrid").getBoundingClientRect().top + scrollY - 140); });
    app.addEventListener("click", function h(e) {
      if (!$("#catGrid")) { app.removeEventListener("click", h); return; }
      var qf = e.target.closest("[data-qf]");
      if (qf) { var f = qf.dataset.qf, only = S.cf.has(f) && S.cf.size === 1; S.cf.clear(); if (!only) S.cf.add(f); S.limit = 24; render(); return; }
      var rm = e.target.closest("[data-rm]");
      if (rm) {
        var k = rm.dataset.rm;
        if (k === "all") { S.cf.clear(); S.mai.clear(); S.conc.clear(); S.fmt.clear(); S.max = null; S.q = ""; S.dispo = false; }
        else if (k === "max") S.max = null; else if (k === "dispo") S.dispo = false; else if (k === "q") S.q = ""; else S[k].delete(rm.dataset.v);
        render();
      }
    });
  }

  /* ---------- fiche produit ---------- */
  function shipWindow() {
    var add = function (d, n) { var x = new Date(d); while (n > 0) { x.setDate(x.getDate() + 1); if (x.getDay() !== 0 && x.getDay() !== 6) n--; } return x; };
    var f = function (d) { return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }); };
    var now = new Date();
    return [f(add(now, 2)), f(add(now, 4))];
  }
  function cleanHTML(html) {
    var doc = new DOMParser().parseFromString("<div>" + html + "</div>", "text/html");
    $$("script,style,iframe,object,embed,form", doc).forEach(function (n) { n.remove(); });
    $$("*", doc).forEach(function (n) { Array.prototype.slice.call(n.attributes).forEach(function (a) { if (/^on/i.test(a.name) || (a.name === "href" && /^javascript:/i.test(a.value)) || a.name === "style") n.removeAttribute(a.name); }); });
    return doc.body.firstChild.innerHTML;
  }
  var PERKS = [['<path d="M12 3l7 3v6c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6z"/><path d="M9 12l2 2 4-4"/>', "Parfums authentiques"], ['<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.6"/><circle cx="17" cy="17.5" r="1.6"/>', "Expédié sous 48 h"], ['<path d="M4 12a8 8 0 1 0 3-6.2"/><path d="M4 4v4h4"/>', "Retours 14 jours"], ['<path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z"/>', "4,6/5 · 111 avis"]];
  function viewProduct(h) {
    app.innerHTML = '<div class="wrap" style="padding-top:28px"><div class="pdp"><div class="gal"><div></div><div class="gal-main skel"><div class="ph" style="height:100%"></div></div></div><div class="info"><div class="skel"><div class="meta"><i></i><i></i><i style="width:40%"></i></div></div></div></div></div>';
    load().then(function () {
      var p = BY[h];
      if (!p) { app.innerHTML = '<div class="wrap" style="padding-block:80px"><h1>Parfum introuvable</h1><p class="lead" style="margin:16px 0 24px">Ce parfum n\'est plus en ligne.</p><a class="btn btn-dark" href="#/catalogue">Voir tous les parfums</a></div>'; return; }
      document.title = p.n + " – " + p.m + " – La Bonne Adresse Paris";
      var v = p.vs.find(function (x) { return x.a; }) || p.vs[0];
      var sw = shipWindow();
      var off = function (x) { return x.cp && x.cp > x.p ? Math.round((1 - x.p / x.cp) * 100) : 0; };
      var priceHTML = function (x) { return eur(x.p) + (x.cp && x.cp > x.p ? "<s>" + eur(x.cp) + '</s><span class="tag sale">−' + off(x) + " %</span>" : ""); };
      var related = D.filter(function (x) { return x !== p && x.a && x.parf && x.fams.indexOf(p.f) > -1; }).sort(function (a, b) { return Math.abs(a.p - p.p) - Math.abs(b.p - p.p); }).slice(0, 4);
      var fix = D.filter(function (x) { return x.fmt === "Fixateur" && x.a; });
      var maiHref = "#/catalogue?maison=" + encodeURIComponent(p.m);
      app.innerHTML = '<div class="wrap" style="padding-top:24px"><nav class="crumbs" aria-label="Fil d\'Ariane"><a href="#/">Accueil</a><span>/</span><a href="#/catalogue?famille=' + encodeURIComponent(p.f) + '">' + esc(p.f) + "</a><span>/</span><span>" + esc(p.n) + "</span></nav>" +
        '<div class="pdp"><div class="gal" id="gal"><div class="gal-th">' + p.ims.map(function (s, i) { return '<button type="button" data-go="' + i + '" aria-label="Photo ' + (i + 1) + '" aria-current="' + (i === 0) + '"><img src="' + esc(img(s, 160)) + '" alt="" loading="lazy"></button>'; }).join("") + "</div>" +
          '<div><div class="gal-main" id="galMain"><img id="galImg" src="' + esc(img(p.img, 1200)) + '" alt="' + esc(p.n + " – " + p.m) + '" width="1200" height="1500">' + (p.ims.length > 1 ? '<button type="button" class="nav p" data-step="-1" aria-label="Photo précédente">‹</button><button type="button" class="nav n" data-step="1" aria-label="Photo suivante">›</button>' : "") + '</div><div class="gal-dots">' + p.ims.map(function (s, i) { return "<i" + (i === 0 ? ' class="on"' : "") + "></i>"; }).join("") + "</div></div></div>" +
        '<div class="info"><div><a class="mai" href="' + maiHref + '">' + esc(p.m) + "</a><h1 style=\"margin:8px 0 6px\">" + esc(p.n) + '</h1><p class="cc">' + esc(p.conc) + "</p></div>" +
          '<div class="pfams">' + p.fams.map(function (f) { return '<a class="chip" href="#/catalogue?famille=' + encodeURIComponent(f) + '">' + esc(f) + "</a>"; }).join("") + "</div>" +
          '<div class="price" id="pPrice">' + priceHTML(v) + "</div>" +
          (p.vs.length > 1 ? '<div class="sizes" id="sizes">' + p.vs.map(function (x) { return '<button type="button" data-v="' + x.id + '" aria-pressed="' + (x === v) + '" data-out="' + (x.a ? 0 : 1) + '">' + esc(x.t) + "</button>"; }).join("") + "</div>" : "") +
          '<p class="ship-est' + (p.a ? "" : " out") + '" id="pShip"><i></i><span>' + (p.a ? "<b>En stock.</b> Commandé aujourd'hui, livré entre " + sw[0] + " et " + sw[1] + "." : "<b>Épuisé</b> pour le moment. Écrivez-nous pour être prévenu du retour.") + "</span></p>" +
          '<div class="buy"><div class="qty"><button type="button" id="qM" aria-label="Moins">−</button><span id="qV">1</span><button type="button" id="qP" aria-label="Plus">+</button></div><button type="button" class="btn btn-dark" id="pAdd"' + (v.a ? "" : " disabled") + ">" + (v.a ? "Ajouter au panier" : "Épuisé") + "</button></div>" +
          (p.a ? "" : '<a class="btn btn-line" href="' + WA + '" target="_blank" rel="noopener">Me prévenir sur WhatsApp</a>') +
          '<div class="pay"><span>CB</span><span>Visa</span><span>Mastercard</span><span>PayPal</span><span>Apple Pay</span><span>Klarna</span> · Paiement 100 % sécurisé</div>' +
          (Date.now() < CODE_END ? '<p class="note-box"><b>Black Friday :</b> −15 % avec le code <b>BLACK15</b>, appliqué automatiquement à la commande depuis ce site. Soit ' + eur(Math.round(v.p * 0.85 * 100) / 100) + " pour ce parfum.</p>" : "") +
          (p.fmt === "Testeur" ? '<p class="note-box"><b>Testeur :</b> le même parfum que le flacon commercial, livré sans la boîte de présentation (parfois sans bouchon). D\'où le prix plus bas. Pour offrir, préférez la version avec boîte.</p>' : "") +
          '<div class="perks">' + PERKS.map(function (k) { return '<div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">' + k[0] + "</svg>" + k[1] + "</div>"; }).join("") + "</div>" +
          '<div class="acc"><details open><summary>Description</summary><div class="rte">' + (p.body ? cleanHTML(p.body) : "<p>" + esc(p.n) + " de " + esc(p.m) + ".</p>") + "<p>Famille olfactive : " + esc(p.fams.join(", ").toLowerCase()) + ".</p></div></details>" +
          "<details><summary>Conseils d'utilisation</summary><div class=\"rte\"><p>" + (p.c === "Extrait de parfum" ? "Extrait concentré : une à deux vaporisations suffisent, sur les points de pulsation." : "Deux à trois vaporisations sur la peau et les vêtements.") + " Évitez de frotter les poignets, cela casse les notes de tête. Pour tenir encore plus longtemps, posez d'abord un fixateur Secret Musc.</p></div></details>" +
          '<details><summary>Livraison et retours</summary><div class="rte"><p>Expédition sous 24 à 48 h, livraison offerte dès 50 € en France.</p><p>Retours sous 14 jours après réception, produit non ouvert.</p></div></details>' +
          '<details><summary>Une question ?</summary><div class="rte"><p>Échangeons sur ce que vous aimez porter : <a href="' + WA + '" target="_blank" rel="noopener">écrire sur WhatsApp</a> ou <button type="button" data-adv-open style="text-decoration:underline">demander à la conseillère</button>.</p></div></details></div>' +
        "</div></div>" +
        (fix.length && p.parf ? '<section style="padding-block:20px 0"><div class="fix-list" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr));display:grid">' + fix.map(function (x) { return '<div class="fix-item"><a class="ph" href="#/produit/' + esc(x.h) + '">' + (x.img ? '<img src="' + esc(img(x.img, 240)) + '" alt="' + esc(x.n) + '" loading="lazy">' : "") + "</a><div><b>Prolongez-le : " + esc(x.n) + "</b><p>Fixateur Secret Musc 30 ml · " + esc(x.fams.join(", ")) + '</p><p class="pr">' + eur(x.p) + '</p></div><button type="button" class="btn btn-line" data-add="' + x.vs[0].id + '">Ajouter</button></div>'; }).join("") + "</div></section>" : "") +
        (related.length ? '<section style="padding-bottom:40px"><div class="sec-head"><div><p class="eyebrow">Même famille, prix proche</p><h2>Vous aimerez aussi</h2></div><button type="button" class="link" data-adv-similar>Demander à la conseillère</button></div><div class="grid">' + related.map(card).join("") + "</div></section>" : "") +
        "</div>";
      $("#stickyBuy") || document.body.insertAdjacentHTML("beforeend", '<div class="sticky-buy" id="stickyBuy"><div><b id="sbN"></b><span id="sbP"></span></div><button type="button" class="btn btn-dark" id="sbAdd">Ajouter</button></div>');
      $("#sbN").textContent = p.n; $("#sbP").innerHTML = eur(v.p);
      var qty = 1;
      $("#qM").addEventListener("click", function () { qty = Math.max(1, qty - 1); $("#qV").textContent = qty; });
      $("#qP").addEventListener("click", function () { qty = Math.min(10, qty + 1); $("#qV").textContent = qty; });
      var add = function () { if (!v.a) return; cartAdd(v.id, qty); };
      $("#pAdd").addEventListener("click", add);
      $("#sbAdd").onclick = add; $("#sbAdd").disabled = !v.a;
      if ($("#sizes")) $("#sizes").addEventListener("click", function (e) {
        var b = e.target.closest("[data-v]"); if (!b) return;
        v = p.vs.find(function (x) { return String(x.id) === b.getAttribute("data-v"); });
        $$("#sizes [data-v]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        $("#pPrice").innerHTML = priceHTML(v); $("#sbP").innerHTML = eur(v.p);
        $("#pAdd").disabled = !v.a; $("#pAdd").textContent = v.a ? "Ajouter au panier" : "Épuisé"; $("#sbAdd").disabled = !v.a;
        if (v.img) { var k = p.ims.indexOf(v.img); if (k > -1) show(k); }
      });
      var cur = 0;
      function show(i) {
        cur = (i + p.ims.length) % p.ims.length;
        $("#galImg").src = img(p.ims[cur], 1200);
        $$("#gal [data-go]").forEach(function (b, k) { b.setAttribute("aria-current", String(k === cur)); });
        $$("#gal .gal-dots i").forEach(function (d, k) { d.classList.toggle("on", k === cur); });
      }
      $("#gal").addEventListener("click", function (e) { var g = e.target.closest("[data-go]"); if (g) show(+g.getAttribute("data-go")); var s = e.target.closest("[data-step]"); if (s) show(cur + +s.getAttribute("data-step")); });
      var x0 = null, gm = $("#galMain");
      gm.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
      gm.addEventListener("touchend", function (e) { if (x0 == null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) show(cur + (dx < 0 ? 1 : -1)); x0 = null; });
      var sb = $("#stickyBuy"), anchor = $("#pAdd");
      stickyWatch = function () { var r = anchor.getBoundingClientRect(); var on = r.bottom < 0; sb.classList.toggle("on", on); document.body.classList.toggle("has-sticky", on && innerWidth <= 900); };
      window.addEventListener("scroll", stickyWatch, { passive: true });
      ADV.ctx = p;
      viewedPush(p.h);
    }).catch(loadError);
  }
  var stickyWatch = null;
  function stickyOff() { if (stickyWatch) window.removeEventListener("scroll", stickyWatch); stickyWatch = null; var sb = $("#stickyBuy"); if (sb) sb.classList.remove("on"); document.body.classList.remove("has-sticky"); ADV.ctx = null; }
  function viewedPush(h) { var v = store.get("lba3:seen", []).filter(function (x) { return x !== h; }); v.unshift(h); store.set("lba3:seen", v.slice(0, 12)); }

  /* ---------- panier ---------- */
  var CART = store.get("lba3:cart", []);
  function variantOf(id) { for (var i = 0; i < D.length; i++) { var v = D[i].vs.find(function (x) { return String(x.id) === String(id); }); if (v) return [D[i], v]; } return null; }
  function cartSave() { store.set("lba3:cart", CART); var n = CART.reduce(function (a, c) { return a + c.q; }, 0); $("#cartN").textContent = n; $("#cartN").setAttribute("data-z", n ? "0" : "1"); }
  function cartAdd(id, q) {
    var it = CART.find(function (c) { return String(c.id) === String(id); });
    if (it) it.q = Math.min(10, it.q + (q || 1)); else CART.push({ id: id, q: q || 1 });
    cartSave();
    var pv = variantOf(id);
    toast((pv ? pv[0].n : "Parfum") + " ajouté au panier", true);
    cartRender();
  }
  function cartTotal() { return CART.reduce(function (a, c) { var pv = variantOf(c.id); return a + (pv ? pv[1].p * c.q : 0); }, 0); }
  function checkoutUrl() { return SHOP + "/cart/" + CART.map(function (c) { return c.id + ":" + c.q; }).join(",") + (Date.now() < CODE_END ? "?discount=" + CODE : ""); }
  function cartRender() {
    var el = $("#cartPanel"); if (!el) return;
    var items = CART.map(function (c) { var pv = variantOf(c.id); return pv ? { c: c, p: pv[0], v: pv[1] } : null; }).filter(Boolean);
    var tot = cartTotal(), left = Math.max(0, FREE - tot);
    el.innerHTML = '<div class="cart-head"><h3 id="cartTitle">Votre panier</h3><button type="button" class="ic" data-close aria-label="Fermer le panier"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>' +
      (items.length ? '<div class="cart-free">' + (left > 0 ? "Plus que <b>" + eur(Math.round(left * 100) / 100) + "</b> pour la livraison offerte." : "<b>Livraison offerte</b> en France.") + '<div class="bar"><i style="width:' + Math.min(100, tot / FREE * 100) + '%"></i></div></div>' +
        '<div class="cart-items">' + items.map(function (x) { return '<div class="ci"><a class="ph" href="#/produit/' + esc(x.p.h) + '">' + (x.p.img ? '<img src="' + esc(img(x.v.img || x.p.img, 200)) + '" alt="">' : "") + '</a><div><b>' + esc(x.p.n) + "</b><small>" + esc(x.p.m) + (x.p.vs.length > 1 ? " · " + esc(x.v.t) : "") + '</small><div class="qty"><button type="button" data-cq="' + x.c.id + '" data-d="-1" aria-label="Moins">−</button><span>' + x.c.q + '</span><button type="button" data-cq="' + x.c.id + '" data-d="1" aria-label="Plus">+</button></div></div><div style="text-align:right"><b style="font-family:var(--f-body);font-size:.95rem">' + eur(Math.round(x.v.p * x.c.q * 100) / 100) + '</b><button type="button" class="rm" data-crm="' + x.c.id + '">Retirer</button></div></div>'; }).join("") + "</div>" +
        '<div class="cart-foot"><div class="tot"><span>Sous-total</span><span>' + eur(Math.round(tot * 100) / 100) + "</span></div>" + (Date.now() < CODE_END ? "<small>Le code BLACK15 (−15 %) est appliqué automatiquement à la commande.</small>" : "") + '<a class="btn btn-gold" href="' + esc(checkoutUrl()) + '">Commander</a><small>Paiement sécurisé sur la boutique La Bonne Adresse Paris.</small></div>'
      : '<div class="cart-empty"><p>Votre panier est vide.</p><a class="btn btn-dark" href="#/catalogue">Découvrir les parfums</a><button type="button" class="btn btn-line" data-adv-open>Demander conseil</button></div>');
  }

  /* ---------- conseiller ---------- */
  var ADV = { ctx: null, step: null, a: {} };
  var WORDS = [[/vanill|gourmand|sucr|caramel|cafe|amande|praline|chocolat|miel/, "Gourmande"], [/bois|santal|cedre|oud|vetiver|tabac|patchouli/, "Boisée"], [/fleur|floral|rose|jasmin|iris|tubereuse|fleur d oranger/, "Florale"], [/ambre|ambré|resine|encens|oriental|chaud/, "Ambrée"], [/fruit|cerise|poire|peche|mangue|framboise|pomme/, "Fruitée"], [/musc|propre|peau|doux|poudr/, "Musquée"], [/frais|agrume|citron|bergamote|neroli|ete|marin|aquatique/, "Hespéridée"], [/epic|poivre|safran|cannelle|cardamome/, "Épicée"], [/cuir/, "Cuirée"]];
  function advOpen(mode) {
    var a = $("#adv"); a.hidden = false; $("#advFab").setAttribute("aria-expanded", "true");
    if (mode === "gift") { advReset(); ADV.a.offrir = true; bot("Un cadeau, très bonne idée. Quelle matière aime la personne ?"); askFam(); }
    else if (mode === "similar" && ADV.ctx) { advReset(); var p = ADV.ctx; bot("Voici des parfums proches de " + p.n + " : même famille, prix voisin."); showRecos(D.filter(function (x) { return x !== p && x.a && x.fams.some(function (f) { return p.fams.indexOf(f) > -1; }); }).map(function (x) { return [x.fams.filter(function (f) { return p.fams.indexOf(f) > -1; }).length * 3 - Math.abs(x.p - p.p) / 30 + Math.random(), x]; }).sort(function (x, y) { return y[0] - x[0]; }).slice(0, 3).map(function (x) { return x[1]; })); choices([["Autre recherche", advStart]]); }
    else if (!$("#advLog").children.length) advStart();
    setTimeout(function () { $("#advIn").focus({ preventScroll: true }); }, 50);
  }
  function advClose() { $("#adv").hidden = true; $("#advFab").setAttribute("aria-expanded", "false"); }
  function advReset() { $("#advLog").innerHTML = ""; ADV.a = {}; }
  function bot(t, html) { var m = document.createElement("div"); m.className = "msg bot"; if (html) m.innerHTML = t; else m.textContent = t; $("#advLog").appendChild(m); scrollLog(); }
  function me(t) { var m = document.createElement("div"); m.className = "msg me"; m.textContent = t; $("#advLog").appendChild(m); scrollLog(); }
  function scrollLog() { var l = $("#advLog"); l.scrollTop = l.scrollHeight; }
  function choices(list) {
    var c = $("#advChoices"); c.innerHTML = "";
    list.forEach(function (x) { var b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.textContent = x[0]; b.addEventListener("click", function () { me(x[0]); c.innerHTML = ""; setTimeout(x[1], 250); }); c.appendChild(b); });
  }
  function advStart() {
    advReset();
    load().then(function () {
      bot("Bonjour ! Je vous aide à trouver votre parfum en quatre questions, parmi les " + D.filter(function (p) { return p.a; }).length + " flacons disponibles. Vous pouvez aussi m'écrire ce que vous aimez.");
      bot("C'est pour vous ou pour offrir ?");
      choices([["Pour moi", function () { ADV.a.offrir = false; askFam(); }], ["Pour offrir", function () { ADV.a.offrir = true; askFam(); }], ["Surprenez-moi", function () { ADV.a = {}; recommend(true); }]]);
    });
  }
  function askFam() {
    bot("Quelle matière vous attire ?");
    choices(ENVIES.map(function (e) { return [e.l, function () { ADV.a.fam = e.f; askInt(); }]; }).concat([["Je ne sais pas", askMoment]]));
  }
  function askMoment() {
    bot("Pas de souci. Plutôt pour quand ?");
    choices([["Tous les jours", function () { ADV.a.fam = "Musquée"; ADV.a.alt = ["Fruitée", "Florale"]; askInt(); }], ["Le soir, les sorties", function () { ADV.a.fam = "Ambrée"; ADV.a.alt = ["Boisée", "Gourmande"]; askInt(); }], ["L'été", function () { ADV.a.fam = "Fruitée"; ADV.a.alt = ["Hespéridée", "Florale"]; askInt(); }], ["L'hiver", function () { ADV.a.fam = "Gourmande"; ADV.a.alt = ["Ambrée", "Boisée"]; askInt(); }]]);
  }
  function askInt() {
    bot("Vous l'aimez comment ?");
    choices([["Léger et discret", function () { ADV.a.int = "leger"; askBud(); }], ["Équilibré", function () { ADV.a.int = "moyen"; askBud(); }], ["Intense, avec du sillage", function () { ADV.a.int = "fort"; askBud(); }]]);
  }
  function askBud() {
    bot("Et votre budget ?");
    choices([["Moins de 50 €", function () { ADV.a.max = 50; recommend(); }], ["Jusqu'à 100 €", function () { ADV.a.max = 100; recommend(); }], ["Jusqu'à 200 €", function () { ADV.a.max = 200; recommend(); }], ["Peu importe", function () { ADV.a.max = null; recommend(); }]]);
  }
  function recommend(rand) {
    var A = ADV.a;
    var pool = D.filter(function (p) { return p.a && p.parf && (!A.max || p.p <= A.max); });
    var score = function (p) {
      var s = Math.random() * (rand ? 10 : 1.2);
      if (A.fam) { if (p.f === A.fam) s += 5; else if (p.fams.indexOf(A.fam) > -1) s += 3; }
      if (A.alt) A.alt.forEach(function (f) { if (p.fams.indexOf(f) > -1) s += 1.5; });
      if (A.words) A.words.forEach(function (f) { if (p.fams.indexOf(f) > -1) s += 2.5; });
      if (A.name && norm(p.n + " " + p.m).indexOf(A.name) > -1) s += 12;
      if (A.int === "fort" && p.c === "Extrait de parfum") s += 2;
      if (A.int === "leger" && (p.c !== "Extrait de parfum" || /Hespéridée|Fruitée|Musquée/.test(p.fams.join()))) s += 1.5;
      if (A.offrir && p.fmt === "Testeur") s -= 4;
      if (p.best) s += 1.5;
      return s;
    };
    var top = pool.map(function (p) { return [score(p), p]; }).sort(function (a, b) { return b[0] - a[0]; }).slice(0, 3).map(function (x) { return x[1]; });
    if (!top.length) { bot("Je n'ai rien trouvé de disponible avec ces critères. Essayons un budget un peu plus large ?"); choices([["Peu importe le budget", function () { A.max = null; recommend(); }], ["Recommencer", advStart]]); return; }
    bot(rand ? "Voici trois coups de cœur pris au hasard dans la boutique :" : "Voici ma sélection pour vous" + (A.max ? ", jusqu'à " + A.max + " €" : "") + " :");
    showRecos(top);
    var q = ["dispo=1"]; if (A.fam) q.push("famille=" + encodeURIComponent(A.fam)); if (A.max) q.push("max=" + A.max);
    bot('<a href="#/catalogue?' + q.join("&") + '" style="text-decoration:underline">Voir toute la sélection correspondante</a>', true);
    choices([["D'autres idées", function () { recommend(rand); }], ["Recommencer", advStart]]);
  }
  function showRecos(list) {
    var w = document.createElement("div"); w.className = "adv-recos";
    w.innerHTML = list.map(function (p) { return '<a class="adv-card" href="#/produit/' + esc(p.h) + '">' + (p.img ? '<img src="' + esc(img(p.img, 160)) + '" alt="">' : "<span></span>") + "<span><b>" + esc(p.n) + "</b><small>" + esc(p.m) + " · " + esc(p.fams.slice(0, 2).join(", ")) + " · " + eur(p.p) + "</small></span></a>"; }).join("");
    $("#advLog").appendChild(w); scrollLog();
  }
  function freeText(t) {
    var n = norm(t);
    load().then(function () {
      if (/livr|expedi|delai/.test(n)) { bot("Nous expédions sous 24 à 48 h, et la livraison est offerte dès 50 € en France."); return; }
      if (/retour|rembours|echang/.test(n)) { bot("Vous avez 14 jours après réception pour un retour, si le produit n'a pas été ouvert."); return; }
      if (/testeur/.test(n)) { bot("Un testeur, c'est le même parfum que le flacon commercial, sans la boîte de présentation. Il est moins cher, idéal pour soi, moins pour offrir."); return; }
      if (/authenti|faux|contrefa|vrai/.test(n)) { bot("Tous nos parfums sont authentiques et choisis un par un par la boutique."); return; }
      if (/black|code|promo|reduc/.test(n)) { bot("Jusqu'au 27 novembre, le code BLACK15 donne −15 % sur tout le site. Depuis ce site, il s'applique tout seul à la commande."); return; }
      if (/whatsapp|humain|appeler|contact|vendeu/.test(n)) { bot('Bien sûr : <a href="' + WA + '" target="_blank" rel="noopener" style="text-decoration:underline">écrivez à la boutique sur WhatsApp</a>.', true); return; }
      if (/surpr|hasard/.test(n)) { ADV.a = {}; recommend(true); return; }
      var A = ADV.a = { offrir: /offr|cadeau|copine|copain|mere|pere|maman|papa|femme|mari/.test(n) };
      var m = n.match(/(\d{2,3})\s*(€|e|eur|euros?)?/); if (m && +m[1] >= 15) A.max = +m[1];
      A.words = WORDS.filter(function (w) { return w[0].test(n); }).map(function (w) { return w[1]; });
      if (A.words.length) A.fam = A.words[0];
      if (/fort|intense|sillage|tenue/.test(n)) A.int = "fort"; else if (/leger|discret|frais/.test(n)) A.int = "leger";
      var hit = D.find(function (p) { return n.length > 3 && (norm(p.n).length > 3 && n.indexOf(norm(p.n)) > -1); }) || null;
      var mh = maisons().find(function (x) { return n.indexOf(norm(x[0])) > -1; });
      if (hit) A.name = norm(hit.n); else if (mh) A.name = norm(mh[0]);
      if (!A.fam && !A.max && !A.name) { bot("Je n'ai pas bien compris. Dites-moi une matière (vanille, oud, rose, musc…), un budget ou une maison, ou répondez à mes questions."); askFam(); return; }
      recommend();
    });
  }
  function initAdvisor() {
    $("#advFab").addEventListener("click", function () { if ($("#adv").hidden) advOpen(); else advClose(); });
    $("#advX").addEventListener("click", advClose);
    $("#advForm").addEventListener("submit", function (e) { e.preventDefault(); var v = $("#advIn").value.trim(); if (!v) return; $("#advIn").value = ""; me(v); $("#advChoices").innerHTML = ""; setTimeout(function () { freeText(v); }, 250); });
    $("#advLog").addEventListener("click", function (e) { if (e.target.closest("a[href^='#/']") && innerWidth < 560) advClose(); });
  }

  /* ---------- Black Friday, toast, copie ---------- */
  var tt;
  function toast(msg, cartLink) {
    var t = $("#toast");
    t.innerHTML = esc(msg) + (cartLink ? '<button type="button" data-open-cart>Voir le panier</button>' : "");
    t.classList.add("on"); clearTimeout(tt); tt = setTimeout(function () { t.classList.remove("on"); }, 3600);
  }
  function initBF() {
    if (Date.now() > CODE_END || sess.get("lba3:bf")) return;
    setTimeout(function () { if (!$("#adv").hidden) return; $("#bf").hidden = false; sess.set("lba3:bf", "1"); }, 7000);
    $("#bfX").addEventListener("click", function () { $("#bf").hidden = true; });
  }

  /* ---------- démarrage ---------- */
  function start() {
    renderNav(); initAdvisor(); initBF(); cartSave();
    document.addEventListener("click", function (e) {
      var t = e.target;
      if (t.closest("[data-adv-open]")) { e.preventDefault(); closeDrawers(); advOpen(); return; }
      if (t.closest("[data-adv-gift]")) { e.preventDefault(); advOpen("gift"); return; }
      if (t.closest("[data-adv-similar]")) { e.preventDefault(); advOpen("similar"); return; }
      var add = t.closest("[data-add]"); if (add) { e.preventDefault(); load().then(function () { cartAdd(add.getAttribute("data-add"), 1); }); return; }
      if (t.closest("[data-open-cart]") || t.closest("#cartBtn")) { load().then(function () { cartRender(); openDrawer("#cartDrawer"); }); return; }
      var cq = t.closest("[data-cq]"); if (cq) { var it = CART.find(function (c) { return String(c.id) === cq.getAttribute("data-cq"); }); if (it) { it.q = Math.max(0, Math.min(10, it.q + +cq.getAttribute("data-d"))); CART = CART.filter(function (c) { return c.q > 0; }); cartSave(); cartRender(); } return; }
      var cr = t.closest("[data-crm]"); if (cr) { CART = CART.filter(function (c) { return String(c.id) !== cr.getAttribute("data-crm"); }); cartSave(); cartRender(); return; }
      if (t.closest("[data-close]")) { closeDrawers(); return; }
      var cp = t.closest("[data-copy]"); if (cp) { var code = cp.getAttribute("data-copy"); try { navigator.clipboard.writeText(code); } catch (x) {} toast("Code " + code + " copié. Depuis ce site, il s'applique tout seul à la commande."); return; }
      if (t.closest("#burger")) { openDrawer("#menuDrawer", $("#burger")); return; }
      var a = t.closest("a[href^='#']"); if (a && a.getAttribute("href") === "#faq") { e.preventDefault(); if (!$("#faq")) { location.hash = "#/"; setTimeout(function () { var f = $("#faq"); if (f) f.scrollIntoView(); }, 600); } else $("#faq").scrollIntoView({ behavior: "smooth" }); }
    });
    window.addEventListener("hashchange", route);
    route();
    load().catch(loadError);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
