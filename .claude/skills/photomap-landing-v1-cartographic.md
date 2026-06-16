# Personal Photo Map — Landing v1 (Cartográfica · curvas de nível)

> Documentação da landing "atlas de memórias" — mesma engenharia da v3 do PersonalBudget, identidade cartográfica própria.
> Arquivo de origem: `photomap-landing-v1-cartographic.html`
>
> ⚠️ **Nota de conteúdo:** as features descritas na página (geotag automático, agrupamento, linha do tempo, leitura de EXIF, países visitados) foram **inferidas** de um "mapa de fotos pessoal". O site real é uma SPA, então o fetch só retornou meta tags — as features reais do produto ainda precisam ser confirmadas e ajustadas no copy/bento/mockup.

---

## Direção visual

**Conceito:** atlas cartográfico editorial. O motivo-assinatura são **curvas de nível topográficas** geradas por código (o equivalente ao guilloché da v3). Paleta de fotografia "golden hour": âmbar quente + teal frio sobre tinta-noite.

| Token | Valor | Uso |
|---|---|---|
| `--bg` / `--bg2` | `#0A0C11` / `#0E1118` | Fundo (azul quase preto) |
| `--amber` | `#EBB572` | Cor de marca / acento quente |
| `--teal` | `#6FD0C4` | Acento frio (curvas, detalhes) |
| `--rose` | `#E58A7B` | Pins / variação |
| `--cream` | `#ECE7DC` | Texto |
| `--paper` | `#ECE6D8` | Bordas de foto (polaroid) |
| `--muted` | `#8B90A0` | Texto secundário |

**Tipografia:** Instrument Serif (display editorial), Schibsted Grotesk (corpo), Spline Sans Mono (coordenadas e labels técnicos).

---

## Estrutura da página

1. **Cursor customizado** — ponto + anel com inércia que "engole" elementos e mostra rótulos (`soltar`, `agrupar`, `navegar`…).
2. **Loader** — coordenadas contando até `38.7223° N · 9.1393° W` ("triangulando memórias").
3. **Hero** — tipografia massiva "Cada foto, um lugar." + curvas de nível respirando ao fundo.
4. **Mockup de mapa scroll-scrubbed** — janela do app com mapa real que se levanta em 3D ao rolar.
5. **Ticker** — features em marquee que entorta com a velocidade do scroll.
6. **Bento grid** — 6 células com micro-demos cartográficas vivas.
7. **Manifesto** — texto que acende palavra por palavra sobre lugares e memórias.
8. **Galeria** — duas fileiras infinitas de cards de lugares (gradientes, sem fotos de terceiros).
9. **Depoimentos** — duas fileiras em sentidos opostos, reativas ao scroll.
10. **CTA** — "Coloque suas memórias no mapa" + curvas de nível + botão com pulso.
11. **Footer** — wordmark "PhotoMap" em contorno com varredura de luz.

---

## Assinatura: curvas de nível por código

Função `contour(svg, rings, baseR, gap, op)`: para cada anel, traça um caminho fechado onde o raio é perturbado por harmônicos de seno/cosseno (`r * (1 + h1·sin(3θ) + h2·cos(5θ))`), dando o aspecto irregular de mapa topográfico. Os anéis se alternam entre dois grupos: um respira (`contBreathe`, scale), outro gira muito devagar (`contSpin`, 220s). Cada 4º anel usa âmbar; o resto, teal. Máscara radial suaviza as bordas. Usada em 3 escalas: hero, CTA e dentro de uma célula.

---

## Mapa do hero (mockup)

- **Graticule** gerado por `graticule(svg, stepX, stepY, landblobs)`: linhas de lat/long + massas de terra estilizadas (paths de blob desenhados à mão) com leve fill e contorno teal.
- **Bússola** com agulha oscilando (`compass`, alternate).
- **Pins** posicionados por `%` sobre o mapa; caem em sequência com bounce (`pinDrop`) e pulso contínuo (`ping`).
- **Rota** desenhada com `stroke-dashoffset` ligando os pins.
- **Polaroid** salta de um pin selecionado (`popIn`).
- **Thumbnails** na lateral entram escalonados (`thumbIn`).
- Tudo disparado por `IntersectionObserver` quando o mockup entra na tela; depois o mockup se levanta em 3D no scroll (scrub com inércia via `lerp`).

---

## Catálogo de animações

### Bento — micro-demos vivas
- **Solte a foto → lugar (cA):** uma polaroid "voa" pro mapa (`fly`), some, e um pin cai (`dpin`) enquanto a coordenada/cidade troca em loop (Lisboa → Tóquio → Reykjavík → Barcelona).
- **Agrupamento (cB):** 4 pins colapsam num badge "+24" e voltam a se espalhar (`merged` toggled a cada 2.4s).
- **Linha do tempo (cC):** ponto desliza 2019→2024 com trilha preenchendo (CSS infinito).
- **EXIF (cD):** leitura de GPS/abertura/velocidade + check "posicionado no mapa".
- **Privado (cE):** cadeado + mini curvas de nível.
- **Cobertura (cF):** contador "47 países" disparado ao entrar na viewport.

### Reativo à velocidade do scroll
- `vel = sy - lastSy`, suavizado em `velS`.
- Ticker: `skewX(velS * -.25)`.
- Galeria e depoimentos: velocidade base + componente de `velS`, sentidos opostos.

### Física de cursor / botões
- Cursor: anel segue com `lerp(rx, mx, .18)`; em hover vira pílula âmbar com rótulo (`data-cursor`).
- Botões magnéticos: alvo no `mousemove`, posição com mola via `lerp(cx, tx, .16)`.

### Manifesto scroll-lit
- Texto dividido em `<span class="mw">` por palavra (palavras-chave marcadas com `*` no fonte → `.key`); progresso da seção fixa define quantas estão `.lit`.

---

## Notas técnicas

- **Master loop único:** um só `requestAnimationFrame(master)` cuida de cursor, scrub do mapa, ticker, galeria, depoimentos, manifesto e molas.
- **Fotos sem direitos de terceiros:** todas as "imagens" são gradientes CSS (golden hour, oceano, floresta, dusk, deserto, céu magenta) — zero dependência, zero problema de copyright.
- **Acessibilidade:** `prefers-reduced-motion` desativa animações, remove cursor/loader, mostra mockup plano, pins/polaroids estáticos e todas as palavras do manifesto acesas.
- **Performance:** `will-change` nos elementos com transform contínuo; scroll só atualiza `sy` (cálculos no rAF).
- **Zero dependências** — HTML/CSS/JS puro, single file.

---

## Pendência importante antes de produção

Confirmar as **features reais** do PhotoMap e ajustar:
- Texto do bento (6 células) e do ticker.
- Conteúdo do mockup (nomes de álbuns/viagens, colunas da sidebar).
- Copy do hero e do manifesto.

A SPA não expõe o conteúdo via fetch; passar lista de features, README ou screenshots resolve.

---

## Para portar pro stack (React 18 + TS + Chakra + Framer Motion)

- Curvas de nível → componente `<Contour rings baseR gap />` que monta o SVG; animação por CSS mantém leve.
- Scroll-scrubbing do mapa → `useScroll` + `useTransform` (`scrollYProgress` da seção do mockup).
- Pins / rota → `motion.div` com `variants` + `staggerChildren`; rota com `pathLength` animado do Framer.
- Manifesto → `useScroll` mapeando progresso para índice de palavra acesa.
- Cursor / magnético / velocidade → hooks isolados (`useCursor`, `useMagnetic`, `useScrollVelocity`) com `useSpring`.
- Bento demos → componentes pequenos com `useEffect` + timers; pausar fora da viewport (`useInView`).
- Tokens → `extendTheme` (`colors.amber`, `colors.teal`, `colors.rose`, `colors.cream`).
- Fotos reais → trocar gradientes por `<img>` com lazy-load e `object-fit:cover`.
