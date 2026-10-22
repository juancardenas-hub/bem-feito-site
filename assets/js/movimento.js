/* Bem-Feito Sistemas · movimento (GSAP + ScrollTrigger + SplitText) · v2
   Só roda com o GSAP carregado e sem pedido de menos movimento.
   Regra: o conteúdo nunca fica escondido esperando a rolagem; o movimento parte de um estado visível.
   v2: movimento discreto. No topo, um ponto percorre o fluxo "do processo ao sistema" e volta pela evolução.
   As fotos da faixa Imersão e do Próximo passo têm um paralaxe leve (só no computador).
   v3: a Home ficou enxuta e cada solução ganhou a sua página; os seletores valem para todas. */
(function () {
  'use strict';
  var d = document;
  var raiz = d.documentElement;
  var gsap = window.gsap;
  if (!gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(window.ScrollTrigger);
  var temSplit = !!window.SplitText;
  if (temSplit) gsap.registerPlugin(window.SplitText);
  var ST = window.ScrollTrigger;

  function todos(sel, base) { return Array.prototype.slice.call((base || d).querySelectorAll(sel)); }

  var mm = gsap.matchMedia();
  mm.add({
    movimento: '(prefers-reduced-motion: no-preference)',
    largo: '(min-width: 1024px)'
  }, function (ctx) {
    var c = ctx.conditions;
    if (!c.movimento) return;
    raiz.classList.add('gsap');
    var paraFluxo = fluxo(c);
    var cancelado = false;
    var resto = function () {
      if (cancelado) return;
      ctx.add(function () {
        // no celular fica só o essencial: a página continua leve
        if (c.largo) { titulos(); entradas(); paralaxe(); }
        fechamento();
      });
    };
    var quandoLivre = function () {
      var fonte = d.fonts && d.fonts.ready ? d.fonts.ready : Promise.resolve();
      fonte.then(function () { (window.requestIdleCallback || function (f) { setTimeout(f, 200); })(resto, { timeout: 2500 }); });
    };
    if (d.readyState === 'complete') quandoLivre(); else window.addEventListener('load', quandoLivre, { once: true });
    return function () { cancelado = true; if (paraFluxo) paraFluxo(); raiz.classList.remove('gsap'); };
  });

  /* ---------- topo: o ponto percorre o fluxo, etapa por etapa, e volta pela evolução ---------- */
  function fluxo(c) {
    var lista = d.querySelector('[data-fluxo]');
    if (!lista) return null;
    var nos = todos('.fluxo__no', lista);
    var laco = lista.querySelector('.fluxo__laco');
    if (nos.length < 2) return null;
    var ponto = d.createElement('li');
    ponto.className = 'fluxo__ponto';
    ponto.setAttribute('aria-hidden', 'true');
    ponto.setAttribute('role', 'presentation');
    lista.appendChild(ponto);

    var tl = null;
    var visivel = true;
    // posições de layout (sem transformações), relativas à lista
    function centro(el) { return { x: el.offsetLeft + el.offsetWidth / 2, y: el.offsetTop + el.offsetHeight / 2 }; }
    function ativar(alvo) {
      nos.forEach(function (n, i) { n.classList.toggle('ativo', i === alvo); });
      if (laco) laco.classList.toggle('ativo', alvo === 'laco');
    }
    function montar() {
      if (tl) tl.kill();
      ativar(-1);
      var p = nos.map(centro);
      tl = gsap.timeline({ repeat: -1, repeatDelay: 0.6, paused: !visivel, defaults: { ease: 'power1.inOut' } });
      tl.set(ponto, { x: p[0].x, y: p[0].y, opacity: 0 })
        .call(ativar, [0])
        .to(ponto, { opacity: 1, duration: 0.3 }, '+=0.9');
      for (var i = 1; i < p.length; i++) {
        tl.to(ponto, { x: p[i].x, y: p[i].y, duration: c.largo ? 1.05 : 0.85 })
          .call(ativar, [i])
          .to({}, { duration: i === p.length - 1 ? 1.4 : 0.75 });
      }
      if (laco) {
        if (c.largo) {
          // desce do sistema, volta por baixo e sobe de novo ao processo
          var base = laco.offsetTop + laco.offsetHeight - 0.5;
          tl.to(ponto, { y: base, duration: 0.55, ease: 'power1.in' })
            .call(ativar, ['laco'])
            .to(ponto, { x: p[0].x, duration: 2.6, ease: 'none' })
            .to(ponto, { y: p[0].y, duration: 0.6, ease: 'power1.out' });
        } else {
          var q = centro(laco);
          tl.to(ponto, { x: q.x, y: q.y, duration: 0.85 })
            .call(ativar, ['laco'])
            .to({}, { duration: 1.4 })
            .to(ponto, { opacity: 0, duration: 0.3 });
        }
      }
    }
    montar();
    var gatilho = ST.create({
      trigger: lista, start: 'top bottom', end: 'bottom top',
      onToggle: function (s) { visivel = s.isActive; if (!tl) return; if (visivel) tl.play(); else tl.pause(); }
    });
    // ao mudar o tamanho da tela, as posições mudam: monta de novo
    var aoAtualizar = function () { montar(); };
    ST.addEventListener('refresh', aoAtualizar);
    return function () {
      ST.removeEventListener('refresh', aoAtualizar);
      gatilho.kill();
      if (tl) tl.kill();
      ativar(-1);
      if (ponto.parentNode) ponto.parentNode.removeChild(ponto);
    };
  }

  /* ---------- títulos de seção: as palavras assentam conforme a rolagem ---------- */
  function titulos() {
    if (!temSplit) return;
    todos('.cab .t-secao, .imersao .t-secao, .dono .t-secao, .proximo .t-secao').forEach(function (t) {
      // o logo dentro do título ("O que a Bem-Feito faz.") não é dividido, e o nome continua no texto lido
      var marcas = t.querySelectorAll('svg');
      var nome = '';
      if (marcas.length) {
        var copia = t.cloneNode(true);
        Array.prototype.forEach.call(copia.querySelectorAll('svg'), function (m) { m.replaceWith(m.getAttribute('aria-label') || ''); });
        nome = copia.textContent.replace(/\s+/g, ' ').trim();
      }
      var s = new window.SplitText(t, { type: 'words', wordsClass: 'palavra', ignore: marcas.length ? marcas : undefined });
      if (nome) t.setAttribute('aria-label', nome);
      gsap.set(t, { perspective: 700 });
      var tl = gsap.timeline({ scrollTrigger: { trigger: t, start: 'top 94%', end: 'top 60%', scrub: 0.6 } });
      tl.from(s.words, { yPercent: 40, rotateX: -60, transformOrigin: '50% 100%', stagger: 0.06, ease: 'none' }, 0);
    });
  }

  /* ---------- blocos que sobem com a rolagem (sempre visíveis) ---------- */
  function entradas() {
    [['.pilares', '.pilar'], ['.opcoes', '.opcao'], ['.etapas__lista', '.etapa']].forEach(function (g) {
      todos(g[0]).forEach(function (pai) {
        var tl = gsap.timeline({ scrollTrigger: { trigger: pai, start: 'top 96%', end: 'top 55%', scrub: 0.7 } });
        todos(g[1], pai).forEach(function (el, i) { tl.from(el, { y: 36 + i * 18, ease: 'none', duration: 1 }, 0); });
      });
    });
  }

  /* ---------- fotos: a imagem anda um pouco mais devagar que a página (a moldura corta o excesso) ---------- */
  function paralaxe() {
    todos('[data-paralaxe]').forEach(function (moldura) {
      var img = moldura.querySelector('img');
      if (!img) return;
      gsap.fromTo(img, { yPercent: -4, scale: 1.1 }, {
        yPercent: 4, scale: 1.1, ease: 'none',
        scrollTrigger: { trigger: moldura, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
  }

  /* ---------- próximo passo: a moldura se fecha ---------- */
  function fechamento() {
    var caixa = d.querySelector('.proximo__caixa');
    if (!caixa) return;
    var linhas = todos('.proximo__linha', caixa);
    var cruzes = todos('.cruz', caixa);
    var tl = gsap.timeline({ scrollTrigger: { trigger: caixa, start: 'top 80%', once: true } });
    tl.from(linhas, { scaleX: 0, transformOrigin: '50% 50%', duration: 1.4, ease: 'expo.inOut' })
      .from(cruzes, { rotate: 90, scale: 0, duration: 0.8, ease: 'back.out(2)', stagger: 0.08 }, 0.6);
  }
})();
