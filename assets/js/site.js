/* Bem-Feito Sistemas · site
   Sem dependências. Tudo funciona sem este arquivo; ele só acrescenta. */
(function () {
  'use strict';
  var d = document;
  var raiz = d.documentElement;
  var calmo = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Eventos de conversão: GTM lê window.dataLayer (E5). O parâmetro "local" diz de onde veio o clique. */
  window.dataLayer = window.dataLayer || [];
  function evento(nome, dados) {
    var item = { event: nome };
    for (var k in dados) if (Object.prototype.hasOwnProperty.call(dados, k)) item[k] = dados[k];
    window.dataLayer.push(item);
  }
  window.bfEvento = evento;
  d.addEventListener('click', function (e) {
    var alvo = e.target.closest && e.target.closest('[data-evento]');
    if (!alvo) return;
    evento(alvo.getAttribute('data-evento'), {
      local: alvo.getAttribute('data-local') || '',
      destino: alvo.getAttribute('href') || ''
    });
  });

  /* Topo: borda mais forte depois de rolar. */
  var topo = d.querySelector('.topo');
  if (topo) {
    var marcar = function () { topo.classList.toggle('rolou', window.scrollY > 8); };
    window.addEventListener('scroll', marcar, { passive: true });
    marcar();
  }

  /* Menu do celular. */
  var botao = d.querySelector('.topo__menu');
  var menu = d.getElementById('menu');
  if (botao && menu) {
    var rotulo = botao.querySelector('span');
    var uso = botao.querySelector('use');
    var abrir = function (sim) {
      botao.setAttribute('aria-expanded', sim ? 'true' : 'false');
      menu.hidden = !sim;
      raiz.classList.toggle('menu-aberto', sim);
      if (rotulo) rotulo.textContent = sim ? 'Fechar' : 'Menu';
      if (uso) uso.setAttribute('href', sim ? '#i-fechar' : '#i-menu');
    };
    botao.addEventListener('click', function () { abrir(botao.getAttribute('aria-expanded') !== 'true'); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) abrir(false); });
    d.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && botao.getAttribute('aria-expanded') === 'true') { abrir(false); botao.focus(); }
    });
    window.addEventListener('resize', function () { if (window.innerWidth >= 1024) abrir(false); });
  }

  /* Integrações: fios do sistema central até cada sistema, medidos nas posições reais.
     No computador os sistemas ficam dos lados; no celular, embaixo, presos a uma espinha à esquerda.
     Os pontos laranja (dados indo e voltando) só aparecem sem o pedido de menos movimento. */
  var hub = d.querySelector('[data-hub]');
  if (hub && window.SVGElement) {
    var fios = hub.querySelector('.hub__fios');
    var centro = hub.querySelector('.hub__centro');
    var sistemas = Array.prototype.slice.call(hub.querySelectorAll('.sis'));
    var n = function (v) { return Math.round(v * 10) / 10; };
    var desenhar = function () {
      var H = hub.getBoundingClientRect();
      var c = centro.getBoundingClientRect();
      if (!H.width || !c.width) return;
      fios.setAttribute('viewBox', '0 0 ' + n(H.width) + ' ' + n(H.height));
      var cy = c.top - H.top + c.height / 2;
      var html = '';
      sistemas.forEach(function (s, i) {
        var r = s.getBoundingClientRect();
        var y = r.top - H.top + r.height / 2;
        var p;
        if (r.right <= c.left + 1) {          // à esquerda do centro
          var x0 = r.right - H.left, x1 = c.left - H.left, xb = (x0 + x1) / 2;
          p = 'M' + n(x0) + ' ' + n(y) + 'H' + n(xb) + 'V' + n(cy) + 'H' + n(x1);
        } else if (r.left >= c.right - 1) {   // à direita
          var x2 = r.left - H.left, x3 = c.right - H.left, xd = (x2 + x3) / 2;
          p = 'M' + n(x2) + ' ' + n(y) + 'H' + n(xd) + 'V' + n(cy) + 'H' + n(x3);
        } else {                              // embaixo (celular)
          var xe = r.left - H.left - 20;
          p = 'M' + n(xe) + ' ' + n(c.bottom - H.top) + 'V' + n(y) + 'H' + n(r.left - H.left);
        }
        html += '<path d="' + p + '"/>';
        if (!calmo) {
          var dur = 3.4 + (i % 3) * 0.45;
          var volta = i % 2 === 1 ? '1;0' : '0;1';   // metade sai do sistema, metade chega
          var mov = '<animateMotion dur="' + dur.toFixed(2) + 's" begin="-' + (i * 0.7).toFixed(2) + 's" repeatCount="indefinite" calcMode="linear" keyTimes="0;1" keyPoints="' + volta + '" path="' + p + '"/>';
          html += '<circle class="brilho" r="6">' + mov + '</circle><circle class="ponto" r="2.5">' + mov + '</circle>';
        }
      });
      fios.innerHTML = html;
    };
    var pedido = 0;
    var agendar = function () { cancelAnimationFrame(pedido); pedido = requestAnimationFrame(desenhar); };
    if (window.ResizeObserver) new ResizeObserver(agendar).observe(hub); else window.addEventListener('resize', agendar);
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(agendar);
    agendar();
    // fora da tela, os pontos param
    if (!calmo && window.IntersectionObserver && fios.pauseAnimations) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) fios.unpauseAnimations(); else fios.pauseAnimations(); });
      }).observe(hub);
    }
  }

  /* Movimento (GSAP): carregado só depois da página pronta, para não atrasar o conteúdo nem a fonte. */
  var temGsap = !!(window.gsap && window.ScrollTrigger);
  if (!calmo && !temGsap) {
    var pasta = (d.currentScript && d.currentScript.src || '').replace(/site\.js(\?.*)?$/, '');
    var arquivos = window.BF_MOVIMENTO || [pasta + 'vendor/gsap.min.js', pasta + 'vendor/ScrollTrigger.min.js', pasta + 'vendor/SplitText.min.js', pasta + 'movimento.js'];
    var carregar = function () {
      arquivos.forEach(function (src) {
        var s = d.createElement('script');
        s.src = src;
        s.async = false; // baixa em paralelo, executa na ordem
        d.head.appendChild(s);
      });
    };
    var depois = function () { (window.requestIdleCallback || function (f) { setTimeout(f, 200); })(carregar, { timeout: 1200 }); };
    if (d.readyState === 'complete') depois(); else window.addEventListener('load', depois, { once: true });
  }
})();
