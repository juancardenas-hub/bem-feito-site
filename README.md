# Bem-Feito Sistemas · site

Site institucional da Bem-Feito Sistemas (Curitiba/PR). HTML, CSS e JavaScript estáticos, sem etapa de build.

## Estrutura

| Caminho | O que é |
|---|---|
| `index.html` | Home |
| `sob-medida/index.html` | Página de Sistemas sob medida |
| `integracoes/index.html` | Página de Integrações (compatibilidade com ERP, legados, bancos, notas, financeiro e WhatsApp) |
| `parceiros/index.html` | Página da Plataforma para parceiros |
| `assets/css/site.css` | Estilos, com as cores, tipos e espaços do Manual de Marca Bem-Feito |
| `assets/js/site.js` | Menu, eventos de conversão (`dataLayer`), fios do diagrama de integrações e carregamento das animações |
| `assets/js/movimento.js` | Animações com GSAP, ScrollTrigger e SplitText (arquivos em `assets/js/vendor/`) |
| `assets/fonts/` | Host Grotesk, licença SIL OFL 1.1 (`OFL.txt`) |
| `assets/img/` | Logo, ícone, fotos e imagem de compartilhamento |
| `sitemap.xml`, `robots.txt` | Mapa do site para o Google |

## Ver no computador

Abra `index.html` no navegador, ou rode `python -m http.server` nesta pasta e acesse http://localhost:8000.

## Contatos

O número do WhatsApp aparece nos links `https://wa.me/...` das quatro páginas (topo, botões, rodapé e botão verde flutuante). Para trocar, substitua o número em todos os arquivos `index.html`. O e-mail e o @ ficam no rodapé de cada página.

## Pendências de conteúdo

Os trechos marcados com `[FALTA: …]` aparecem destacados fora do domínio bemfeitosistemas.com.br (prévia). Antes de publicar no domínio, todos precisam ser preenchidos ou removidos.

## Publicação no servidor

Copiar o conteúdo desta pasta para a raiz do site no servidor (Apache), exceto `README.md` e `.nojekyll`. Não há etapa de build.

## Licenças de terceiros

- Host Grotesk: SIL Open Font License 1.1.
- GSAP 3.13: licença padrão gratuita da GreenSock (https://gsap.com/standard-license).
