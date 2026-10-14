/* Bem-Feito Sistemas · eclipse
   O horizonte do topo em 3D (WebGL puro, sem biblioteca): um globo escuro com a grade da marca,
   girando devagar, com o aro laranja e pulsos de dados correndo pelos meridianos.
   Sem WebGL, ou com pedido de menos movimento, fica o horizonte desenhado em CSS. */
(function () {
  'use strict';
  var palco = document.querySelector('[data-eclipse]');
  if (!palco) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var horizonte = palco.querySelector('.horizonte');
  if (!horizonte) return;

  var ACIMA = 220; // px de tela acima do palco, para o halo
  var canvas = document.createElement('canvas');
  canvas.className = 'eclipse';
  canvas.setAttribute('aria-hidden', 'true');
  // Só com placa de vídeo de verdade: em renderização por software (máquinas fracas, robôs de teste) fica o horizonte em CSS.
  var forcar = /[?&]gl=1/.test(location.search);
  var gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: false, powerPreference: 'low-power', failIfMajorPerformanceCaveat: !forcar });
  if (!gl) return;
  var info = gl.getExtension('WEBGL_debug_renderer_info');
  var placa = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : '';
  if (!forcar && /swiftshader|llvmpipe|softpipe|software|basic render/i.test(placa)) return;
  var derivadas = !!gl.getExtension('OES_standard_derivatives');

  var VERT = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.0,1.0);}';
  var FRAG = [
    derivadas ? '#extension GL_OES_standard_derivatives : enable\n#define DERIV 1' : '',
    '#ifdef GL_FRAGMENT_PRECISION_HIGH',
    'precision highp float;',
    '#else',
    'precision mediump float;',
    '#endif',
    'uniform vec2 uRes; uniform float uTempo; uniform float uDpr; uniform float uRim; uniform float uRaio;',
    'uniform vec2 uMouse; uniform float uRolagem; uniform float uIntro;',
    'const vec3 FUNDO = vec3(0.0431);',
    'const vec3 LARANJA = vec3(1.0, 0.478, 0.0);',
    'const vec3 QUENTE = vec3(1.0, 0.80, 0.62);',
    'const vec3 GRADE = vec3(0.19, 0.183, 0.175);',
    'float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }',
    'void main(){',
    '  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);',
    '  vec2 c = vec2(uRes.x * 0.5, uRim + uRaio);',
    '  vec2 d = (p - c) / uRaio;',
    '  float dist = length(d);',
    '  float borda = (dist - 1.0) * uRaio;',
    '  float px = uDpr;',
    '  vec2 luz = normalize(vec2(uMouse.x * 0.35, -1.0));',
    '  float topo = clamp(dot(d / max(dist, 0.0001), luz), 0.0, 1.0);',
    '  float foco = smoothstep(0.6, 1.0, topo);',
    '  float fora = max(borda, 0.0);',
    '  float brilho = (0.8 + 0.35 * uRolagem) * uIntro;',
    '  vec3 halo = LARANJA * exp(-fora / (85.0 * px)) * 0.40 * foco + QUENTE * exp(-fora / (6.0 * px)) * 0.55 * foco;',
    '  vec3 cor = FUNDO + halo * brilho;',
    '  if (borda < 0.0) {',
    '    float zr = sqrt(max(1.0 - dist * dist, 0.0));',
    '    vec3 n = vec3(d.x, -d.y, zr);',
    '    float inc = 0.42 + uRolagem * 0.22 + uMouse.y * 0.03;',
    '    float ci = cos(inc); float si = sin(inc);',
    '    n = vec3(n.x, n.y * ci - n.z * si, n.y * si + n.z * ci);',
    '    float giro = uTempo * 0.022 + uMouse.x * 0.06 + uRolagem * 0.4;',
    '    float cg = cos(giro); float sg = sin(giro);',
    '    n = vec3(n.x * cg + n.z * sg, n.y, -n.x * sg + n.z * cg);',
    '    float lat = asin(clamp(n.y, -1.0, 1.0));',
    '    float lon = atan(n.z, n.x);',
    '    vec2 g = vec2(lon, lat) * 5.7295780;',
    '    vec3 sup = mix(vec3(0.028), vec3(0.055, 0.04, 0.03), pow(1.0 - zr, 2.0));',
    '    #ifdef DERIV',
    '    vec2 fw = max(fwidth(g), vec2(0.0001));',
    '    vec2 q = abs(fract(g - 0.5) - 0.5) / fw;',
    '    float linha = (1.0 - min(min(q.x, q.y), 1.0)) * smoothstep(0.015, 0.09, zr);',
    '    sup += GRADE * linha * (0.5 + 0.9 * (1.0 - zr));',
    '    vec2 cel = floor(g + 0.5);',
    '    vec2 f = (fract(g + 0.5) - 0.5) / fw;',
    '    float h = hash(cel);',
    '    float aceso = step(0.84, h) * (0.55 + 0.45 * sin(uTempo * 1.4 + h * 50.0));',
    '    float ponto = smoothstep(2.6 * px, 1.0 * px, length(f));',
    '    sup += LARANJA * aceso * ponto * smoothstep(0.03, 0.12, zr) * 1.15;',
    '    float mer = floor(g.x + 0.5);',
    '    float hm = hash(vec2(mer, 7.0));',
    '    float naLinha = 1.0 - min(q.x, 1.0);',
    '    float fluxo = fract(g.y * 0.08 + uTempo * (0.05 + hm * 0.06) + hm);',
    '    float pulso = smoothstep(0.0, 0.025, fluxo) * smoothstep(0.08, 0.025, fluxo);',
    '    sup += LARANJA * naLinha * pulso * step(0.7, hm) * smoothstep(0.03, 0.15, zr) * 1.3;',
    '    #endif',
    '    float aro = exp(borda / (9.0 * px)) * foco;',
    '    sup += QUENTE * aro * 0.9 * brilho + LARANJA * pow(1.0 - zr, 4.0) * 0.5 * foco * brilho;',
    '    cor = mix(cor, sup, smoothstep(0.0, 1.5 * px, -borda));',
    '  }',
    '  gl_FragColor = vec4(cor, 1.0);',
    '}'
  ].join('\n');

  function shader(tipo, fonte) {
    var s = gl.createShader(tipo);
    gl.shaderSource(s, fonte);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { gl.deleteShader(s); return null; }
    return s;
  }
  var vs = shader(gl.VERTEX_SHADER, VERT);
  var fs = shader(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return;
  var prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);
  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var aPos = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
  var u = {};
  ['uRes', 'uTempo', 'uDpr', 'uRim', 'uRaio', 'uMouse', 'uRolagem', 'uIntro'].forEach(function (n) { u[n] = gl.getUniformLocation(prog, n); });

  palco.insertBefore(canvas, palco.firstChild);

  var dpr = 1, rim = 0, raio = 0, largura = 0, altura = 0;
  function medir() {
    var celular = window.innerWidth < 768;
    dpr = Math.min(window.devicePixelRatio || 1, celular ? 1 : 1.5);
    var cs = getComputedStyle(horizonte);
    largura = canvas.clientWidth;
    altura = canvas.clientHeight;
    rim = (ACIMA + parseFloat(cs.top)) * dpr;
    raio = (parseFloat(cs.width) / 2) * dpr;
    canvas.width = Math.max(1, Math.round(largura * dpr));
    canvas.height = Math.max(1, Math.round(altura * dpr));
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  var mouse = { x: 0, y: 0, ax: 0, ay: 0 };
  window.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse') return;
    mouse.ax = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.ay = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  var inicio = performance.now();
  var intro = 0;
  var visivel = true;
  var rodando = false;
  var primeiro = true;
  var ultimo = 0;
  var QUADRO = 1000 / 30; // 30 quadros por segundo bastam para um giro lento e poupam bateria

  function desenhar(agora) {
    var t = (agora - inicio) / 1000;
    intro = Math.min(1, intro + 0.012);
    var e = 1 - Math.pow(1 - intro, 3);
    mouse.x += (mouse.ax - mouse.x) * 0.04;
    mouse.y += (mouse.ay - mouse.y) * 0.04;
    var fim = palco.offsetTop + palco.offsetHeight;
    var rol = Math.max(0, Math.min(1, window.scrollY / Math.max(1, fim)));
    gl.uniform2f(u.uRes, canvas.width, canvas.height);
    gl.uniform1f(u.uTempo, t);
    gl.uniform1f(u.uDpr, dpr);
    gl.uniform1f(u.uRim, rim);
    gl.uniform1f(u.uRaio, raio);
    gl.uniform2f(u.uMouse, mouse.x, mouse.y);
    gl.uniform1f(u.uRolagem, rol);
    gl.uniform1f(u.uIntro, 0.35 + 0.65 * e);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (primeiro) { primeiro = false; palco.classList.add('eclipse-ativo'); }
  }
  function quadro(agora) {
    if (!visivel || document.hidden) { rodando = false; return; }
    if (agora - ultimo >= QUADRO - 2) { ultimo = agora; desenhar(agora); }
    window.requestAnimationFrame(quadro);
  }
  function ligar() {
    if (rodando || !visivel || document.hidden) return;
    rodando = true;
    window.requestAnimationFrame(quadro);
  }

  function comecar() {
    medir();
    if ('ResizeObserver' in window) new ResizeObserver(function () { medir(); if (!rodando) desenhar(performance.now()); }).observe(palco);
    else window.addEventListener('resize', medir);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (itens) { visivel = itens[0].isIntersecting; if (visivel) ligar(); }, { rootMargin: '120px 0px' }).observe(palco);
    }
    document.addEventListener('visibilitychange', ligar);
    canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); visivel = false; palco.classList.remove('eclipse-ativo'); });
    ligar();
  }

  // Liga depois que a página termina de carregar, para não disputar com o conteúdo.
  var depois = function () { (window.requestIdleCallback || function (f) { setTimeout(f, 300); })(comecar, { timeout: 1500 }); };
  if (document.readyState === 'complete') depois(); else window.addEventListener('load', depois);
})();
