# Padrão de Tela de Login (split-screen com painel de marca)

Guia de aprendizado para criar novas telas de login seguindo o mesmo padrão visual e de qualidade. Baseado na tela do sistema "AB Salon Beauty: Gestão & Agenda".

---

## 1. Princípios

1. **Painel de marca + formulário limpo.** Esquerda: identidade e proposta de valor. Direita: formulário simples, fundo neutro.
2. **Mostrar o produto, não só falar dele.** Cartões simulando a interface real valem mais que parágrafos.
3. **Uma cor de marca dominante + um acento.** Aqui: rosa (base), vinho (texto) e dourado (acento, vindo da logo).
4. **Texto sempre legível.** Nunca branco ou cinza claro sobre fundo claro. Usar tons escuros da mesma família da cor de fundo.
5. **Sem cara de "feito por IA".** Evitar ícones genéricos (sparkles/estrela), emojis decorativos e excesso de elementos. Ícone só quando representa uma função real.
6. **Texto neutro quando o produto é vendável a vários nichos.** Usar "seu negócio" em vez de "salão", "clínica", etc.
7. **Sem redundância.** Se a logo já traz o nome, não repetir o nome em texto ao lado.

---

## 2. Tokens de design

### Cores (trocar pela paleta de cada marca)

| Uso                          | Valor                                                     |
| ---------------------------- | --------------------------------------------------------- |
| Fundo do painel (degradê)    | `#F9CAD5` → `#F4B6C6` (diagonal, `bg-gradient-to-br`)     |
| Texto principal / título     | `#5C1A33`                                                 |
| Destaque do título           | `#3D0F22`                                                 |
| Texto secundário / parágrafo | `#7A3350`                                                 |
| Texto terciário / descrições | `#9B4A68`                                                 |
| Acento (dourado da logo)     | `#B8912F`                                                 |
| Superfícies translúcidas     | `rgba(255,255,255,0.5)` com borda `rgba(255,255,255,0.8)` |
| Fundo do lado do formulário  | `#FAFAFA`                                                 |

**Regra de contraste:** texto sobre o fundo do painel deve ter no mínimo 4,5:1 (WCAG AA). Vinho `#5C1A33` sobre rosa claro passa de 8:1.

**Como adaptar a outra marca:** pegar a cor dominante da logo para o fundo (versão clara), escurecer a mesma matiz para o texto (versão bem escura) e usar a segunda cor da logo como acento.

### Tipografia

- Título: 44-56px, peso 600-700, `leading-[1.05]`, tracking levemente negativo.
- Parágrafo: 16px, `leading-relaxed`.
- Labels pequenos (badge, subtítulo de marca): 11px, caixa alta, `tracking-[0.18em]` a `[0.25em]`, peso 500-600.
- Descrições de módulos: 12px.

---

## 3. Estrutura do painel de marca (de cima para baixo)

1. **Topo:** monograma/ícone da marca em círculo (~40px) + subtítulo em caixa alta ("GESTÃO & AGENDA").
2. **Badge:** ponto dourado (6px, com halo) + texto curto em caixa alta ("GESTÃO COMPLETA").
3. **Título (h1):** frase de proposta de valor, com **uma palavra-chave destacada** (cor mais escura + sublinhado dourado fino).
4. **Parágrafo:** uma ou duas linhas listando o que o sistema faz.
5. **Composição visual:** 2 a 3 cartões flutuantes sobrepostos simulando o sistema (agenda do dia, métrica, alerta).
6. **Grid de módulos:** 2 colunas x 3 linhas, ícone em círculo branco + título + descrição de uma linha.
7. **Rodapé:** linha divisória fina + frase curta de marca.

### Lado do formulário

- Logo horizontal no topo, com subtítulo em caixa alta centralizado abaixo.
- "Bem-vindo de volta" (pequeno) → título "Acesse sua conta" → subtítulo.
- Campos com label acima, botão de largura total, link "Não tem uma conta? Fale com a gente".
- Rodapé com copyright e crédito do desenvolvedor.

---

## 4. Fundo e profundidade

- Degradê diagonal suave (nunca cor chapada).
- Círculo grande desfocado branco (35%) no canto superior direito.
- Círculo desfocado na cor de acento (15%) no canto inferior esquerdo.
- Anéis finos decorativos atrás do conteúdo.
- `overflow-hidden` no painel; elementos decorativos com `aria-hidden="true"` e `pointer-events-none`.

---

## 5. Cartões flutuantes

- Fundo branco, `rounded-[20px]`, sombra suave (`shadow-xl shadow-[cor-escura]/10`).
- Rotações leves e diferentes (-2°, 1°, -1°).
- Animação sutil de flutuação (translateY 0 a -6px, ~6s, ease-in-out, infinite, atrasos diferentes).
- **Sempre respeitar `prefers-reduced-motion`.**
- Dados fictícios e marcados como decorativos (`aria-hidden="true"`).
- Conteúdo sugerido: lista de agenda com status coloridos, métrica com variação em verde, alerta de estoque/pendência.

---

## 6. Armadilhas encontradas (evitar nas próximas)

1. **Ícone de estrela/sparkles** no badge denuncia site genérico. Usar ponto dourado ou nenhum ícone.
2. **Título em texto ao lado de logo que já tem o nome** gera informação duplicada.
3. **Logo com fundo colorido embutido** (PNG com rosa) forma uma "caixa" sobre o fundo. Usar PNG transparente ou SVG.
4. **Logo pequena num fundo da mesma cor** some. Dar tamanho (56-64px de altura) e contraste.
5. **Cartões sobrepostos escondendo conteúdo.** Na tela atual, o cartão de métrica cobre parte do status "Em atendimento" e "Aguardando" da agenda. Ao posicionar os cartões, conferir que nenhum texto fica cortado.
6. **Texto claro sobre fundo claro.** Sempre validar o contraste.
7. **Subtítulo do formulário limitado ao nicho** ("acompanhar seus agendamentos"). Preferir algo neutro.
8. **Excesso de elementos decorativos.** Se ficar carregado, remover o grid de módulos e manter só os cartões.
9. **Alinhamento:** logo, badge, título, parágrafo e rodapé na mesma borda esquerda.

---

## 7. Responsividade e acessibilidade

- Abaixo de `lg`: esconder os cartões flutuantes e, se necessário, o painel de marca inteiro, mantendo só o formulário com a logo.
- Usar `min-h-screen` e gaps flexíveis para não cortar conteúdo em telas baixas.
- Campos com `label` associado, `autocomplete` correto, botão de mostrar/ocultar senha com `aria-label` e estado de foco visível.
- Elementos decorativos sempre com `aria-hidden="true"`.

---

## 8. Checklist antes de entregar

- [ ] Contraste de todo texto >= 4,5:1
- [ ] Logo com fundo transparente, sem "caixa"
- [ ] Nenhum nome de marca duplicado
- [ ] Nenhum ícone genérico (sparkles, emojis)
- [ ] Textos neutros (sem limitar a um nicho, se for o caso)
- [ ] Cartões sem texto cortado ou sobreposto indevidamente
- [ ] Alinhamento esquerdo consistente
- [ ] `prefers-reduced-motion` respeitado
- [ ] Versão mobile testada
- [ ] Elementos decorativos com `aria-hidden`

---

## 9. Prompt reutilizável

Substituir tudo que estiver entre `[colchetes]`.

```
Crie uma tela de login em Next.js (App Router) com Tailwind CSS e lucide-react, no formato split-screen: painel de marca à esquerda (visível a partir de lg) e formulário à direita.

IDENTIDADE
- Nome do sistema: [NOME]
- Subtítulo da marca: [EX: GESTÃO & AGENDA]
- Logo horizontal: [/caminho/logo.png], com fundo transparente, exibida no topo do lado do formulário (h-14, w-auto, object-contain) com o subtítulo em caixa alta centralizado abaixo.
- Monograma/ícone: [/caminho/icone.png] em círculo branco de 40px com borda de acento no topo do painel de marca.
- Paleta: fundo do painel degradê de [COR CLARA 1] para [COR CLARA 2]; texto principal [COR ESCURA]; destaque do título [COR MAIS ESCURA]; texto secundário [COR MÉDIA]; terciário [COR MÉDIA CLARA]; acento [COR DE ACENTO]. Garantir contraste mínimo 4,5:1.

PAINEL ESQUERDO (de cima para baixo)
1. Topo: monograma + subtítulo (11px, caixa alta, tracking 0.25em, cor terciária).
2. Badge: ponto de acento de 6px com halo sutil + texto "[TEXTO CURTO EM CAIXA ALTA]" (11px, peso 600, tracking 0.18em). Fundo rgba(255,255,255,0.55), borda rgba(255,255,255,0.85), rounded-full, padding 6px 14px. NÃO usar ícone de estrela/sparkles nem emojis.
3. Título (h1, 44-56px, peso 700, leading 1.05): "[FRASE DE PROPOSTA DE VALOR]" com a palavra "[PALAVRA-CHAVE]" em cor mais escura e sublinhado de acento de 3px, levemente inclinado (pseudo-elemento).
4. Parágrafo: "[LISTA RESUMIDA DO QUE O SISTEMA FAZ]" em cor secundária.
5. Composição de 3 cartões flutuantes sobrepostos (brancos, rounded-[20px], shadow-xl com a cor escura a 10%, rotações -2°, 1°, -1°), com animação de flutuação de 6s e atrasos diferentes, respeitando prefers-reduced-motion:
   - Cartão grande "[TÍTULO]": lista de 3 itens com horário/nome/status colorido (dados fictícios).
   - Cartão de métrica: ícone, rótulo, valor grande e variação em verde.
   - Cartão de alerta: ícone, rótulo e valor.
   Posicionar de forma que NENHUM texto de um cartão fique coberto por outro.
6. Grid de módulos em 2 colunas: ícone em círculo branco de 32px, título 14px semibold e descrição de uma linha em 12px:
   [LISTA DE MÓDULOS: ícone lucide | título | descrição]
7. Rodapé: linha divisória de 1px com a cor escura a 15% e a frase "[FRASE DE MARCA]" em cor secundária.

FUNDO
- Degradê diagonal (bg-gradient-to-br).
- Círculo grande desfocado (blur-3xl) branco 35% no canto superior direito e círculo de acento 15% no canto inferior esquerdo.
- Dois anéis finos decorativos atrás do conteúdo.
- overflow-hidden; todos os elementos decorativos com aria-hidden="true" e pointer-events-none.

LADO DIREITO (formulário)
- Fundo #FAFAFA. Bloco centralizado com max-width de ~430px.
- "Bem-vindo de volta" (pequeno, cinza) → h2 "Acesse sua conta" → subtítulo neutro "[SUBTÍTULO SEM LIMITAR A UM NICHO]".
- Campos: [E-MAIL ou E-MAIL/USUÁRIO] e Senha (com botão "Mostrar/Ocultar" acessível). Label acima de cada campo, inputs com borda sutil e foco visível.
- Botão "Entrar" com seta, largura total, cor [COR DA MARCA], com estados hover, focus e loading.
- Link "Não tem uma conta? Fale com a gente".
- Rodapé: "© [ANO] [NOME]. Todos os direitos reservados." e "Desenvolvido por: [NOME]".

REGRAS
- Textos genéricos, sem limitar a um tipo de negócio, a menos que indicado.
- Não repetir o nome da marca em texto quando a logo já o contém.
- Alinhar à mesma borda esquerda: monograma, badge, título, parágrafo, módulos e rodapé.
- Abaixo de lg: esconder os cartões flutuantes (e o painel de marca, se necessário), mantendo logo e formulário.
- Usar min-h-screen e gaps flexíveis para não cortar conteúdo em telas baixas.
- Acessibilidade: labels associados, autocomplete correto, aria-label no botão de senha, foco visível.
- Validar o resultado contra o checklist: contraste, sem ícones genéricos, sem texto cortado nos cartões, sem duplicação de marca.
```

---

## 10. Como reaproveitar

1. Copiar o prompt da seção 9.
2. Preencher a identidade da nova marca (nome, logo, paleta, módulos).
3. Rodar no Claude Code, Cursor ou similar.
4. Conferir o checklist da seção 8, principalmente cartões sobrepostos e contraste.
5. Se a marca tiver só uma cor, derivar a paleta dela: versão clara para o fundo, versão bem escura para o texto e a cor original como acento.
