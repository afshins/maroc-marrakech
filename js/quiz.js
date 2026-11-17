/* ==========================================================
   Quiz « Es-tu prêt pour le Maroc ? »
   Toutes les réponses viennent du site.
   ✏️ Pour changer une question : modifie le tableau QUESTIONS.
      « bonne » = numéro de la bonne réponse (0 = A, 1 = B, 2 = C, 3 = D).
   ========================================================== */
(function () {
  'use strict';

  var QUESTIONS = [
    {
      q: 'Avec quels pays le Maroc va-t-il organiser la Coupe du monde 2030 ?',
      reponses: ['La France et l’Italie', 'L’Espagne et le Portugal', 'L’Algérie et la Tunisie', 'Le Canada et les États-Unis'],
      bonne: 1,
      explication: 'En 2030, le Maroc organise la Coupe du monde avec l’Espagne et le Portugal.',
      section: '#pourquoi'
    },
    {
      q: 'Le Maroc est à environ combien de kilomètres de l’Espagne ?',
      reponses: ['14 km', '140 km', '1 400 km', '4 km'],
      bonne: 0,
      explication: 'Seulement 14 km, de l’autre côté du détroit de Gibraltar.',
      section: '#pourquoi'
    },
    {
      q: 'Comment s’appelle le roi du Maroc ?',
      reponses: ['Hassan II', 'Mohammed V', 'Mohammed VI', 'Abdallah II'],
      bonne: 2,
      explication: 'Le Maroc est une monarchie. Mohammed VI est roi depuis 1999.',
      section: '#pourquoi'
    },
    {
      q: 'Quelle place de Marrakech est au patrimoine de l’UNESCO ?',
      reponses: ['La place Jemaa el-Fna', 'La place de la Concorde', 'La place Bahia', 'La place Majorelle'],
      bonne: 0,
      explication: 'La place Jemaa el-Fna est au patrimoine culturel immatériel de l’UNESCO.',
      section: '#marrakech'
    },
    {
      q: 'Qui a acheté et restauré le jardin Majorelle en 1980 ?',
      reponses: ['Coco Chanel', 'Yves Saint Laurent et Pierre Bergé', 'Le roi Mohammed VI', 'Jacques Majorelle'],
      bonne: 1,
      explication: 'Le peintre Jacques Majorelle a créé le jardin. Yves Saint Laurent et Pierre Bergé l’ont restauré.',
      section: '#marrakech'
    },
    {
      q: 'Quelles sont les langues officielles du Maroc ?',
      reponses: ['L’arabe et le français', 'Le français et l’anglais', 'L’arabe et l’amazigh', 'Seulement l’arabe'],
      bonne: 2,
      explication: 'L’arabe et l’amazigh. Le français est très utilisé, mais ce n’est pas une langue officielle !',
      section: '#culture'
    },
    {
      q: 'Quel jour la famille mange-t-elle le couscous ensemble ?',
      reponses: ['Le lundi', 'Le mercredi', 'Le samedi', 'Le vendredi'],
      bonne: 3,
      explication: 'Le vendredi, la famille se réunit pour manger le couscous.',
      section: '#cuisine'
    },
    {
      q: 'En 2022, le Maroc est la première équipe africaine à jouer…',
      reponses: ['une finale de Coupe du monde', 'une demi-finale de Coupe du monde', 'aux Jeux olympiques', 'contre le Brésil'],
      bonne: 1,
      explication: 'Le Maroc a battu l’Espagne et le Portugal, puis a perdu contre la France en demi-finale.',
      section: '#football'
    }
  ];

  var LETTERS = ['A', 'B', 'C', 'D'];
  var app = document.getElementById('quiz-app');
  if (!app) return;
  var stars = document.getElementById('quiz-stars');
  var card = document.getElementById('quiz-card');
  var current = 0, score = 0, answered = false, results = [];

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function drawStars() {
    stars.innerHTML = '';
    QUESTIONS.forEach(function (_, i) {
      var cls = results[i] === true ? 'is-right' : results[i] === false ? 'is-wrong' : (i === current && current < QUESTIONS.length ? 'is-current' : '');
      stars.insertAdjacentHTML('beforeend', '<svg viewBox="-32 -32 64 64" class="' + cls + '"><use href="#star8"/></svg>');
    });
  }

  function enter() {
    card.classList.remove('is-entering');
    void card.offsetWidth;
    card.classList.add('is-entering');
  }

  function showQuestion() {
    answered = false;
    var Q = QUESTIONS[current];
    card.innerHTML = '';
    card.appendChild(el('p', 'quiz__count', 'Question ' + (current + 1) + ' / ' + QUESTIONS.length));
    card.appendChild(el('h3', 'quiz__q', Q.q));
    var list = el('ul', 'quiz__answers');
    Q.reponses.forEach(function (txt, i) {
      var li = el('li');
      var b = el('button', 'quiz__answer');
      b.type = 'button';
      b.setAttribute('data-i', i);
      b.appendChild(el('span', 'quiz__letter', LETTERS[i]));
      b.appendChild(el('span', null, txt));
      b.addEventListener('click', function () { choose(i); });
      li.appendChild(b);
      list.appendChild(li);
    });
    card.appendChild(list);
    drawStars();
    enter();
  }

  function choose(i) {
    if (answered) return;
    answered = true;
    var Q = QUESTIONS[current];
    var right = i === Q.bonne;
    if (right) score++;
    results[current] = right;
    var btns = card.querySelectorAll('.quiz__answer');
    Array.prototype.forEach.call(btns, function (b, k) {
      b.disabled = true;
      if (k === Q.bonne) b.classList.add('is-correct');
      else if (k === i) b.classList.add('is-wrong');
      else b.classList.add('is-faded');
    });

    var fb = el('div', 'quiz__feedback' + (right ? '' : ' is-wrong'));
    var p = el('p');
    p.appendChild(el('strong', null, right ? 'Bravo ! ' : 'Pas tout à fait… '));
    p.appendChild(document.createTextNode(Q.explication + ' '));
    var link = el('a', 'quiz__link', 'Revoir la section →');
    link.href = Q.section;
    p.appendChild(link);
    fb.appendChild(p);
    var last = current === QUESTIONS.length - 1;
    var next = el('button', 'btn btn--gold btn--small', last ? 'Voir mon score →' : 'Question suivante →');
    next.type = 'button';
    next.setAttribute('data-next', '');
    next.addEventListener('click', goNext);
    fb.appendChild(next);
    card.appendChild(fb);
    drawStars();
    next.focus({ preventScroll: true });
  }

  function goNext() {
    current++;
    if (current < QUESTIONS.length) showQuestion();
    else showResult();
  }

  function showResult() {
    answered = true;
    drawStars();
    var n = QUESTIONS.length;
    var title, msg;
    if (score === n) { title = 'Prêt pour Marrakech !'; msg = 'Parfait ! Tu connais le Maroc comme un vrai voyageur. Ton passeport est validé.'; }
    else if (score >= 5) { title = 'Presque prêt !'; msg = 'Très bien ! Encore un petit effort et tu pars pour Marrakech.'; }
    else { title = 'Relis le site et réessaie !'; msg = 'Pas de panique : toutes les réponses sont sur ce site.'; }

    card.innerHTML = '';
    var box = el('div', 'quiz__result');
    var stamp = el('div', 'stamp' + (score === n ? '' : ' stamp--gold'));
    stamp.appendChild(el('small', null, 'Passeport'));
    stamp.appendChild(el('strong', null, score + '/' + n));
    stamp.appendChild(el('small', null, 'Maroc'));
    box.appendChild(stamp);
    box.appendChild(el('h3', null, title));
    box.appendChild(el('p', null, msg));
    var actions = el('div', 'quiz__actions');
    var again = el('button', 'btn btn--gold', 'Recommencer ↺');
    again.type = 'button';
    again.addEventListener('click', restart);
    var map = el('a', 'btn btn--ghost', 'Voir la carte du Maroc →');
    map.href = 'map.html';
    actions.appendChild(again);
    actions.appendChild(map);
    box.appendChild(actions);
    card.appendChild(box);
    enter();
    if (score >= 6 && window.MarocFX) setTimeout(window.MarocFX.confetti, 300);
  }

  function restart() {
    current = 0; score = 0; results = [];
    showQuestion();
    var first = card.querySelector('.quiz__answer');
    if (first) first.focus({ preventScroll: true });
  }

  /* Clavier : A, B, C, D pour répondre ; Entrée pour continuer
     (seulement quand le quiz est visible à l’écran). */
  function quizOnScreen() {
    var r = app.getBoundingClientRect();
    return r.top < window.innerHeight * .8 && r.bottom > window.innerHeight * .2;
  }
  document.addEventListener('keydown', function (e) {
    if (e.altKey || e.ctrlKey || e.metaKey || !quizOnScreen()) return;
    var t = e.target;
    if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
    var k = e.key.toUpperCase();
    var idx = LETTERS.indexOf(k);
    if (idx > -1 && !answered && current < QUESTIONS.length) { e.preventDefault(); choose(idx); return; }
    if (e.key === 'Enter' && answered && !(t && (t.tagName === 'BUTTON' || t.tagName === 'A'))) {
      var nb = card.querySelector('[data-next]');
      if (nb) { e.preventDefault(); nb.click(); }
    }
  });

  showQuestion();
})();
