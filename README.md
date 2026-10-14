# Bem-Feito Sistemas · site

Site institucional da Bem-Feito Sistemas (Curitiba/PR). HTML, CSS e JavaScript estáticos, sem etapa de build.

## Estrutura

| Caminho | O que é |
|---|---|
| `index.html` | Home |
| `assets/css/site.css` | Estilos, com as cores, tipos e espaços do Manual de Marca Bem-Feito |
| `assets/js/site.js` | Menu, abas, eventos de conversão (`dataLayer`) e carregamento das animações |
| `assets/js/movimento.js` | Animações com GSAP, ScrollTrigger e SplitText (arquivos em `assets/js/vendor/`) |
| `assets/js/eclipse.js` | Horizonte 3D do topo, em WebGL |
| `assets/fonts/` | Host Grotesk, licença SIL OFL 1.1 (`OFL.txt`) |
| `assets/img/` | Logo, ícone e imagem de compartilhamento |

## Ver no computador

Abra `index.html` no navegador, ou rode `python -m http.server` nesta pasta e acesse http://localhost:8000.

## Pendências de conteúdo

Os trechos marcados com `[FALTA: …]` aparecem destacados fora do domínio bemfeitosistemas.com.br (prévia). Antes de publicar no domínio, todos precisam ser preenchidos ou removidos.

## Publicação no servidor

Copiar o conteúdo desta pasta para a raiz do site no servidor (Apache), exceto `README.md` e `.nojekyll`. Não há etapa de build.

## Licenças de terceiros

- Host Grotesk: SIL Open Font License 1.1.
- GSAP 3.13: licença padrão gratuita da GreenSock (https://gsap.com/standard-license).
