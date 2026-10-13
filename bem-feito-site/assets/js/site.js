/* Bem-Feito Sistemas · site
   Sem dependências. Tudo funciona sem este arquivo; ele só acrescenta. */
(function () {
  'use strict';
  var d = document;
  var raiz = d.documentElement;
  var calmo = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var temIO = 'IntersectionObserver' in window;

  /* Eventos de conversão: GTM lê window.dataLayer (E5). */
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

  /* Abas (módulos da plataforma). Sem JS, todos os painéis aparecem. */
  Array.prototype.forEach.call(d.querySelectorAll('[role="tablist"]'), function (lista) {
    var abas = Array.prototype.slice.call(lista.querySelectorAll('[role="tab"]'));
    var ativar = function (aba, foco, avisar) {
      var mudou = aba.getAttribute('aria-selected') !== 'true';
      abas.forEach(function (a) {
        var sel = a === aba;
        a.setAttribute('aria-selected', sel ? 'true' : 'false');
        a.tabIndex = sel ? 0 : -1;
        var painel = d.getElementById(a.getAttribute('aria-controls'));
        if (painel) painel.hidden = !sel;
      });
      if (foco) aba.focus();
      if (avisar !== false && mudou) {
        d.dispatchEvent(new CustomEvent('bf:aba', { detail: { aba: aba, painel: d.getElementById(aba.getAttribute('aria-controls')) } }));
      }
    };
    abas.forEach(function (aba, i) {
      aba.addEventListener('click', function () { ativar(aba, false); });
      aba.addEventListener('keydown', function (e) {
        var passo = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (passo) { e.preventDefault(); ativar(abas[(i + passo + abas.length) % abas.length], true); }
        else if (e.key === 'Home') { e.preventDefault(); ativar(abas[0], true); }
        else if (e.key === 'End') { e.preventDefault(); ativar(abas[abas.length - 1], true); }
      });
    });
    var inicial = abas.filter(function (a) { return a.getAttribute('aria-selected') === 'true'; })[0] || abas[0];
    if (inicial) ativar(inicial, false, false);
  });

  /* Números que contam: o valor final já está no HTML; a contagem só roda quando aparece. */
  var temGsap = !!(window.gsap && window.ScrollTrigger);
  if (temIO && !calmo) {
    var contar = function (el) {
      var fim = parseFloat(el.getAttribute('data-contar'));
      if (isNaN(fim)) return;
      var sufixo = el.getAttribute('data-sufixo') || '';
      var inicio = null;
      var duracao = 1100;
      var quadro = function (t) {
        if (inicio === null) inicio = t;
        var p = Math.min(1, (t - inicio) / duracao);
        var v = Math.round(fim * (1 - Math.pow(1 - p, 3)));
        el.textContent = v.toLocaleString('pt-BR') + sufixo;
        if (p < 1) window.requestAnimationFrame(quadro);
      };
      window.requestAnimationFrame(quadro);
    };
    var obsNum = new IntersectionObserver(function (itens) {
      itens.forEach(function (it) {
        if (!it.isIntersecting) return;
        obsNum.unobserve(it.target);
        contar(it.target);
      });
    }, { threshold: 0.6 });
    Array.prototype.forEach.call(d.querySelectorAll('[data-contar]'), function (n) { obsNum.observe(n); });
  }

  /* Método: a etapa ativa e o cartão do projeto. Com GSAP, quem move é o movimento.js. */
  var metodo = d.querySelector('[data-metodo]');
  if (metodo) {
    var passos = Array.prototype.slice.call(metodo.querySelectorAll('[data-passo]'));
    var projeto = metodo.querySelector('[data-projeto]');
    var nomes = ['', 'Imersão', 'Arquitetura', 'Construção', 'Evolução'];
    var proximas = ['', 'Mapa do processo atual', 'Protótipo navegável', 'Versão 2 para testar', 'Pacote de melhorias do mês'];
    var atual = 2;
    var marcarEtapa = function (n) {
      if (n === atual) return;
      atual = n;
      passos.forEach(function (p) { p.classList.toggle('ativo', Number(p.getAttribute('data-passo')) === n); });
      if (!projeto) return;
      projeto.style.setProperty('--etapa', n);
      var nome = projeto.querySelector('[data-etapa-nome]');
      var texto = projeto.querySelector('[data-etapa-texto]');
      var prox = projeto.querySelector('[data-proxima]');
      if (nome) nome.textContent = nomes[n];
      if (texto) texto.textContent = 'Etapa ' + n + ' de 4';
      if (prox) prox.textContent = proximas[n];
      Array.prototype.forEach.call(projeto.querySelectorAll('[data-estado]'), function (lista) {
        lista.hidden = Number(lista.getAttribute('data-estado')) !== n;
      });
    };
    window.bfMarcarEtapa = marcarEtapa;
  }

  /* Movimento (GSAP): carregado só depois da página pronta, para não atrasar o conteúdo nem a fonte. */
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
