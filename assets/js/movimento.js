/* Bem-Feito Sistemas · movimento (GSAP + ScrollTrigger + SplitText)
   Só roda com o GSAP carregado e sem pedido de menos movimento.
   Regra: o conteúdo nunca fica escondido esperando a rolagem; o movimento parte de um estado visível. */
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
  raiz.classList.add('gsap');

  function todos(sel, base) { return Array.prototype.slice.call((base || d).querySelectorAll(sel)); }
  function aleatorio(a, b) { return Math.round(a + Math.random() * (b - a)); }
  function fmt(n) { return Math.round(n).toLocaleString('pt-BR'); }
  function piscar(el) {
    if (!el) return;
    gsap.fromTo(el, { backgroundColor: 'rgba(255,122,0,0.22)' }, { backgroundColor: 'rgba(255,122,0,0)', duration: 1.4, ease: 'power2.out', clearProps: 'backgroundColor' });
  }
  function contarAte(el, fim) {
    if (!el) return;
    var o = { v: parseFloat(String(el.textContent).replace(/\./g, '').replace(',', '.')) || 0 };
    gsap.to(o, { v: fim, duration: 0.9, ease: 'power2.out', onUpdate: function () { el.textContent = fmt(o.v); } });
  }

  /* ---------- laços "vivos": só rodam com a área na tela ---------- */
  var lacos = [];
  function laco(alvo, intervalo, passo) {
    var timer = null;
    var item = {
      ligar: function () { if (!timer) timer = setInterval(function () { if (!d.hidden) passo(); }, intervalo); },
      desligar: function () { clearInterval(timer); timer = null; }
    };
    lacos.push(item);
    ST.create({ trigger: alvo, start: 'top bottom', end: 'bottom top', onToggle: function (s) { s.isActive ? item.ligar() : item.desligar(); } });
    return item;
  }

  var mm = gsap.matchMedia();
  mm.add({
    movimento: '(prefers-reduced-motion: no-preference)',
    largo: '(min-width: 1024px)',
    mouse: '(hover: hover) and (pointer: fine)'
  }, function (ctx) {
    var c = ctx.conditions;
    if (!c.movimento) return;
    // o topo anima já; o resto da página é preparado quando o navegador fica livre, depois do carregamento
    heroi(c);
    painelVivo();
    var cancelado = false;
    var resto = function () {
      if (cancelado) return;
      ctx.add(function () {
        // no celular fica só o essencial: menos cálculo de layout, a página continua leve
        if (c.largo) { titulos(); telas(c); }
        entradas(c);
        metodo(c);
        fragmentos();
        fechamento();
        if (c.mouse) inclinar();
      });
    };
    var quandoLivre = function () {
      var fonte = d.fonts && d.fonts.ready ? d.fonts.ready : Promise.resolve();
      fonte.then(function () { (window.requestIdleCallback || function (f) { setTimeout(f, 200); })(resto, { timeout: 2500 }); });
    };
    if (d.readyState === 'complete') quandoLivre(); else window.addEventListener('load', quandoLivre, { once: true });
    return function () { cancelado = true; lacos.forEach(function (l) { l.desligar(); }); lacos = []; };
  });

  /* ---------- topo ---------- */
  function heroi() {
    var h = d.querySelector('.heroi');
    if (!h) return;
    // a entrada do topo é feita em CSS (site.css); aqui fica a inclinação que acompanha a rolagem
    var fig = h.querySelector('.tela-fig');
    if (fig) {
      // ao rolar, o painel "levanta": sai inclinado e fica de frente
      gsap.fromTo(fig, { rotateX: 16, transformPerspective: 1800 }, {
        rotateX: 0, ease: 'none',
        scrollTrigger: { trigger: h, start: 'top top', end: 'bottom 35%', scrub: 0.8 }
      });
    }
  }

  /* ---------- painel do topo vivo: OS mudam de estado, o ERP sincroniza ---------- */
  function painelVivo() {
    var h = d.querySelector('.heroi .ui');
    if (!h) return;
    var corpo = h.querySelector('tbody');
    var k = function (n) { return h.querySelector('[data-k="' + n + '"]'); };
    var erp = function (n) { return h.querySelector('[data-erp="' + n + '"]'); };
    var sinc = h.querySelector('[data-sinc]');
    var barras = h.querySelector('.ui__barras');
    var proxima = 2482;
    var servicos = ['Vistoria técnica', 'Manutenção preventiva', 'Instalação de painel', 'Troca de filtro', 'Manutenção corretiva', 'Calibração'];
    var locais = ['Pinhais', 'Colombo', 'Araucária', 'Curitiba', 'Campo Largo', 'Fazenda Rio Grande'];
    var tipos = ['concluir', 'sincronizar', 'campo', 'rota', 'sincronizar', 'nova'];
    var vez = 0;

    function estado(linha, classe, texto) {
      var st = linha.querySelector('.st');
      if (!st) return;
      st.className = 'st st--' + classe;
      st.textContent = texto;
      piscar(linha);
    }
    function somar(chave, delta, min, max) {
      var el = k(chave);
      if (!el) return;
      var atual = parseInt(el.textContent, 10) || 0;
      var novo = Math.max(min, Math.min(max, atual + delta));
      if (novo !== atual) { contarAte(el, novo); piscar(el.closest('.ui__kpi')); }
    }
    var acoes = {
      concluir: function () {
        var l = todos('tr', corpo).filter(function (tr) { return /Em campo/.test(tr.textContent); })[0];
        if (!l) return acoes.campo();
        estado(l, 'ok', 'Concluída');
        somar('os', -1, 30, 44);
        somar('campo', -1, 8, 16);
      },
      campo: function () {
        var l = todos('tr', corpo).filter(function (tr) { return /Agendada|Aguardando/.test(tr.textContent); })[0];
        if (!l) return acoes.nova();
        estado(l, 'ativo', 'Em campo');
        somar('campo', 1, 8, 16);
      },
      nova: function () {
        var tr = d.createElement('tr');
        var hora = aleatorio(14, 17) + 'h';
        tr.innerHTML = '<td>' + proxima++ + '</td><td>' + servicos[aleatorio(0, servicos.length - 1)] + '</td><td class="so-largo">' + locais[aleatorio(0, locais.length - 1)] + '</td><td class="so-medio">Equipe ' + aleatorio(1, 4) + '</td><td><span class="st st--neutro">Agendada ' + hora + '</span></td>';
        corpo.insertBefore(tr, corpo.firstChild);
        var ultima = corpo.lastElementChild;
        if (corpo.children.length > 5 && ultima) ultima.remove();
        gsap.from(tr, { opacity: 0, x: -12, duration: 0.6, ease: 'power2.out' });
        piscar(tr);
        somar('os', 1, 30, 44);
      },
      rota: function () {
        var el = k('rota');
        var atual = el ? parseInt(el.textContent, 10) : 18;
        somar('rota', atual >= 21 ? -1 : (Math.random() < 0.65 ? 1 : -1), 15, 22);
      },
      sincronizar: function () {
        if (sinc) { sinc.textContent = 'agora'; piscar(sinc.closest('.ui__p-cab')); }
        [['pedidos', 1, 4], ['notas', 0, 2], ['itens', -3, 6]].forEach(function (r) {
          var el = erp(r[0]);
          if (!el) return;
          var atual = parseInt(el.textContent.replace(/\./g, ''), 10) || 0;
          var novo = atual + aleatorio(r[1], r[2]);
          if (novo !== atual) { contarAte(el, novo); piscar(el.parentNode); }
        });
        if (barras && barras.firstElementChild) {
          barras.firstElementChild.remove();
          var b = d.createElement('i');
          var alt = aleatorio(84, 97);
          b.style.setProperty('--h', alt + '%');
          barras.appendChild(b);
          gsap.from(b, { scaleY: 0, transformOrigin: '50% 100%', duration: 0.7, ease: 'expo.out' });
        }
        var prazo = h.querySelector('[data-k="prazo"]');
        if (prazo) prazo.textContent = aleatorio(93, 96);
      }
    };
    laco(d.querySelector('.heroi'), 2800, function () {
      var tipo = tipos[vez++ % tipos.length];
      acoes[tipo]();
    });
  }

  /* ---------- títulos de seção: as palavras assentam conforme a rolagem ---------- */
  function titulos() {
    if (!temSplit) return;
    todos('.cab .t-secao, .proximo .t-secao').forEach(function (t) {
      var s = new window.SplitText(t, { type: 'words', wordsClass: 'palavra' });
      gsap.set(t, { perspective: 700 });
      var tl = gsap.timeline({ scrollTrigger: { trigger: t, start: 'top 94%', end: 'top 58%', scrub: 0.6 } });
      tl.from(s.words, { yPercent: 45, rotateX: -65, transformOrigin: '50% 100%', stagger: 0.06, ease: 'none' }, 0);
      var cab = t.closest('.cab');
      var abre = cab && cab.querySelector(':scope > p');
      if (abre) tl.from(abre, { y: 36, ease: 'none', duration: tl.duration() || 1 }, 0);
    });
  }

  /* ---------- blocos que sobem com a rolagem (sempre visíveis) ---------- */
  function entradas(c) {
    var grupos = c.largo ? [['.segmentos', '.segmento'], ['.cartoes', '.cartao'], ['.numeros', '.numero'], ['.extras', '.falta-bloco']] : [];
    grupos.forEach(function (g) {
      var pai = d.querySelector(g[0]);
      if (!pai) return;
      var tl = gsap.timeline({ scrollTrigger: { trigger: pai, start: 'top 96%', end: 'top 50%', scrub: 0.7 } });
      todos(g[1], pai).forEach(function (el, i) { tl.from(el, { y: 50 + i * 26, ease: 'none', duration: 1 }, 0); });
    });
    // ícones se desenham ao aparecer (decoração)
    var icones = todos('.faixa .i, .segmento__icone .i');
    gsap.set(icones, { strokeDasharray: 70, strokeDashoffset: 70 });
    ST.batch(icones, {
      start: 'top 95%', once: true,
      onEnter: function (lote) {
        gsap.to(lote, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut', stagger: 0.12, onComplete: function () { gsap.set(lote, { clearProps: 'strokeDasharray,strokeDashoffset' }); } });
      }
    });
  }

  /* ---------- telas entram em 3D ---------- */
  function telas(c) {
    var plat = d.querySelector('.plat__paineis');
    if (plat) {
      gsap.fromTo(plat, { rotateY: c.largo ? -16 : 0, rotateX: 8, x: c.largo ? 70 : 0, y: c.largo ? 0 : 40, transformPerspective: 1600 }, {
        rotateY: 0, rotateX: 0, x: 0, y: 0, ease: 'none',
        scrollTrigger: { trigger: '.plat', start: 'top 88%', end: 'top 25%', scrub: 0.8 }
      });
    }
    var ouv = d.querySelector('.ouvidoria .tela-fig');
    if (ouv) {
      gsap.fromTo(ouv, { rotateY: c.largo ? 14 : 0, rotateX: 8, y: 40, transformPerspective: 1400 }, {
        rotateY: 0, rotateX: 0, y: 0, ease: 'none',
        scrollTrigger: { trigger: '.prova', start: 'top 92%', end: 'top 35%', scrub: 0.8 }
      });
    }
    var proj = d.querySelector('[data-projeto]');
    if (proj) {
      gsap.fromTo(proj, { rotateX: 18, y: 60, transformPerspective: 1400 }, {
        rotateX: 0, y: 0, ease: 'none',
        scrollTrigger: { trigger: '.metodo', start: 'top 90%', end: 'top 40%', scrub: 0.8 }
      });
    }
    // troca de aba: a tela nova entra com as linhas em cascata
    d.addEventListener('bf:aba', function (e) {
      var painel = e.detail && e.detail.painel;
      if (!painel) return;
      gsap.fromTo(painel.querySelector('.tela'), { rotateY: 7, x: 24, transformPerspective: 1200 }, { rotateY: 0, x: 0, duration: 0.8, ease: 'expo.out' });
      gsap.from(todos('tbody tr, .ui__ficha, .ui__chip, .lista-itens li', painel), { y: 14, opacity: 0, duration: 0.55, stagger: 0.04, ease: 'power2.out' });
    });
  }

  /* ---------- método: a barra do projeto acompanha a rolagem ---------- */
  function metodo(c) {
    var sec = d.querySelector('[data-metodo]');
    if (!sec || typeof window.bfMarcarEtapa !== 'function') return;
    var trilho = sec.querySelector('.progresso__trilho i');
    var passos = sec.querySelector('.passos');
    if (c.largo) {
      ST.create({
        trigger: passos, start: 'top 62%', end: 'bottom 62%', scrub: true,
        onUpdate: function (s) {
          var n = Math.min(4, 1 + Math.floor(s.progress * 4));
          window.bfMarcarEtapa(n);
          if (trilho) gsap.set(trilho, { width: (6 + s.progress * 94) + '%' });
        }
      });
    } else {
      // no celular o cartão fica depois das etapas: ele mesmo percorre as quatro etapas enquanto está na tela
      var n = 1;
      laco(sec.querySelector('[data-projeto]'), 2600, function () {
        n = n % 4 + 1;
        window.bfMarcarEtapa(n);
        if (trilho) gsap.to(trilho, { width: (n * 25) + '%', duration: 0.8, ease: 'expo.out' });
      });
    }
  }

  /* ---------- fragmentos dos serviços ---------- */
  function fragmentos() {
    // processo: um marcador percorre o fluxo e para no gargalo
    var linha = d.querySelector('.fluxo-linha');
    if (linha) {
      var nos = todos('.fluxo__no', linha);
      var token = d.createElement('span');
      token.className = 'fluxo__token';
      token.setAttribute('aria-hidden', 'true');
      linha.appendChild(token);
      var centro = function (i) { return function () { var n = nos[i]; return n.offsetLeft + n.offsetWidth / 2; }; };
      var tl = gsap.timeline({ repeat: -1, repeatDelay: 0.6, paused: true });
      tl.set(token, { x: centro(0), opacity: 0 })
        .to(token, { opacity: 1, duration: 0.3 })
        .to(token, { x: centro(1), duration: 0.8, ease: 'power1.inOut' })
        .add(function () { piscar(nos[1]); })
        .to(token, { x: centro(2), duration: 0.8, ease: 'power1.inOut' })
        .to(nos[2], { boxShadow: '0 0 0 3px rgba(245,197,24,.35)', duration: 0.4, yoyo: true, repeat: 3 })
        .to(token, { x: centro(3), duration: 0.8, ease: 'power1.inOut' })
        .add(function () { piscar(nos[3]); })
        .to(token, { opacity: 0, duration: 0.3 });
      ST.create({ trigger: linha, start: 'top bottom', end: 'bottom top', onToggle: function (s) { s.isActive ? tl.play() : tl.pause(); }, onRefresh: function () { tl.invalidate(); } });
    }

    // integração: o registro de sincronização corre
    var log = d.querySelector('.log ul');
    if (log) {
      var msgs = ['Pedido 8842 enviado', 'Estoque atualizado · 1.206 itens', 'Nota fiscal 2208 recebida', 'Cliente 1187 atualizado', 'Título 559 conciliado', 'Pedido 8843 enviado', 'Preço de 42 itens atualizado'];
      var m = 0;
      var hora = 14 * 60 + 32;
      var elo = d.querySelector('.log__elo .i');
      laco(log, 2400, function () {
        hora += 1;
        var li = d.createElement('li');
        var hh = String(Math.floor(hora / 60)).padStart(2, '0') + ':' + String(hora % 60).padStart(2, '0');
        li.innerHTML = '<time>' + hh + '</time><span>' + msgs[m++ % msgs.length] + '</span><svg class="i st--ok" aria-hidden="true"><use href="#i-check"/></svg>';
        log.insertBefore(li, log.firstChild);
        if (log.children.length > 4) log.lastElementChild.remove();
        gsap.from(li, { opacity: 0, y: -10, duration: 0.5, ease: 'power2.out' });
        piscar(li);
        if (elo) gsap.fromTo(elo, { rotate: 0 }, { rotate: 180, duration: 0.7, ease: 'power2.inOut', transformOrigin: '50% 50%' });
      });
    }

    // sob medida: alguém preenche a ordem de serviço
    var form = d.querySelector('.form-frag');
    if (form) {
      var campo = form.querySelector('[data-digita]');
      var seg = todos('.seg-frag span', form);
      var botao = form.querySelector('.ui__botao');
      var texto = campo ? campo.getAttribute('data-digita') : '';
      var ocupado = false;
      laco(form, 6200, function () {
        if (ocupado || !campo) return;
        ocupado = true;
        seg.forEach(function (s, i) { s.classList.toggle('ativo', i === 1); });
        campo.textContent = '';
        var cursor = d.createElement('span');
        cursor.className = 'cursor';
        var i = 0;
        var tecla = setInterval(function () {
          campo.textContent = texto.slice(0, ++i);
          campo.appendChild(cursor);
          if (i >= texto.length) {
            clearInterval(tecla);
            setTimeout(function () {
              cursor.remove();
              seg.forEach(function (s, j) { s.classList.toggle('ativo', j === 2); });
              piscar(seg[2]);
              setTimeout(function () {
                if (botao) {
                  var original = botao.textContent;
                  gsap.fromTo(botao, { scale: 0.94 }, { scale: 1, duration: 0.5, ease: 'back.out(3)' });
                  botao.textContent = 'Ordem 2487 aberta';
                  setTimeout(function () { botao.textContent = original; ocupado = false; }, 1600);
                } else { ocupado = false; }
              }, 500);
            }, 350);
          }
        }, 55);
      });
    }
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

  /* ---------- inclinação com o mouse ---------- */
  function inclinar() {
    var itens = todos('.cartao, .heroi .tela, .projeto__caixa');
    itens.forEach(function (el) {
      var rx = gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power3.out' });
      var ry = gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power3.out' });
      var forca = el.classList.contains('cartao') ? 5 : 3;
      gsap.set(el, { transformPerspective: el.classList.contains('cartao') ? 900 : 1400 });
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - 0.5) * forca * 2);
        rx(-((e.clientY - r.top) / r.height - 0.5) * forca * 2);
      });
      el.addEventListener('pointerleave', function () { rx(0); ry(0); });
    });
  }
})();
