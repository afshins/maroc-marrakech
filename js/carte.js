/* ==========================================================
   Page « Carte du Maroc » : villes cliquables
   ========================================================== */
(function () {
  'use strict';

  var CITIES = {
    marrakech: {
      kicker: 'La ville rouge',
      name: 'Marrakech',
      text: 'Notre destination ! La place Jemaa el-Fna, le jardin Majorelle, les souks et le palais Bahia t’attendent.',
      link: 'index.html#marrakech', linkText: 'Découvrir Marrakech →'
    },
    rabat: {
      kicker: 'La capitale',
      name: 'Rabat',
      text: 'Rabat est la capitale du Maroc. C’est la ville du roi et du gouvernement.',
      link: 'index.html#pourquoi', linkText: 'Le Maroc, un royaume →'
    },
    casablanca: {
      kicker: 'La plus grande ville',
      name: 'Casablanca',
      text: 'Casablanca est la plus grande ville du Maroc, au bord de l’océan Atlantique. Le train la relie à Marrakech.',
      link: 'index.html#voyage', linkText: 'Se déplacer en train →'
    },
    fes: {
      kicker: 'Une ville impériale',
      name: 'Fès',
      text: 'Fès est célèbre pour sa très vieille médina, pleine de petites rues et d’artisans. Le train relie Marrakech à Fès.',
      link: 'index.html#voyage', linkText: 'Se déplacer en train →'
    },
    tanger: {
      kicker: 'Face à l’Espagne',
      name: 'Tanger',
      text: 'Tout au nord, Tanger est au bord du détroit de Gibraltar. L’Espagne est à environ 14 km du Maroc !',
      link: 'index.html#pourquoi', linkText: 'Tout près de l’Europe →'
    },
    agadir: {
      kicker: 'La plage',
      name: 'Agadir',
      text: 'Agadir est une ville de plage au sud du pays, sur l’océan Atlantique.',
      link: null
    }
  };

  var card = document.getElementById('city-card');
  if (!card) return;
  var kicker = document.getElementById('city-kicker');
  var nameEl = document.getElementById('city-name');
  var textEl = document.getElementById('city-text');
  var linkEl = document.getElementById('city-link');
  var pins = Array.prototype.slice.call(document.querySelectorAll('.pin[data-city]'));
  var btns = Array.prototype.slice.call(document.querySelectorAll('.carte__cities button[data-city]'));

  function select(key) {
    var c = CITIES[key];
    if (!c) return;
    kicker.textContent = c.kicker;
    nameEl.textContent = c.name;
    textEl.textContent = c.text;
    if (c.link) { linkEl.href = c.link; linkEl.textContent = c.linkText; linkEl.hidden = false; }
    else linkEl.hidden = true;
    pins.forEach(function (p) {
      var on = p.getAttribute('data-city') === key;
      p.classList.toggle('is-active', on);
      p.setAttribute('aria-pressed', String(on));
    });
    btns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-city') === key)); });
    card.classList.remove('is-new');
    void card.offsetWidth; // relance l’animation
    card.classList.add('is-new');
  }

  pins.forEach(function (p) {
    p.addEventListener('click', function () { select(p.getAttribute('data-city')); });
    p.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(p.getAttribute('data-city')); }
    });
  });
  btns.forEach(function (b) {
    b.addEventListener('click', function () { select(b.getAttribute('data-city')); });
  });

  select('marrakech');
})();
