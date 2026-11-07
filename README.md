# CartoonHub — Memórias Animadas

Projeto acadêmico de **Talita Aparecida de Oliveira** para a criação de uma aplicação front-end que consome uma API pública sobre desenhos animados.

O arquivo `ENTREGA_FINAL.md` apresenta a conferência dos requisitos. A pasta `docs` reúne o PDF teórico, o roteiro do vídeo pitch, o guia de entrega e o resumo do projeto.

## Tecnologias

- HTML5 semântico;
- CSS3 puro, sem frameworks;
- JavaScript puro;
- Fetch API;
- Rick and Morty API.

## Como executar

1. Baixe ou clone esta pasta.
2. Abra um terminal na raiz do projeto.
3. Inicie um servidor local, por exemplo:

```bash
python3 -m http.server 3000
```

4. Acesse `http://localhost:3000` no navegador.

> O projeto precisa ser executado por um servidor local para evitar restrições do navegador ao carregamento de recursos e para demonstrar o consumo real da API.

## API consumida

Endpoint utilizado:

```text
https://rickandmortyapi.com/api/character?page=1
```

A API é pública, gratuita e não exige token para este uso. A resposta possui os metadados em `info` e os personagens em `results`. A documentação oficial está disponível em:

- https://rickandmortyapi.com/documentation
- https://rickandmortyapi.com/

## Onde estão os requisitos

- `index.html`: estrutura semântica e área vazia que recebe os cards;
- `style.css`: identidade visual, responsividade e estados visuais;
- `script.js`: `fetch`, conversão da resposta para JSON, filtros e criação dinâmica dos cards;
- `manus-routes.json`: declaração da rota inicial do site.

No `script.js`, a função `createCharacterCard()` usa `document.createElement()` e a função `renderCharacters()` usa `appendChild()`. Assim, os cards não ficam prontos no HTML: eles nascem apenas depois que a API responde.

## Materiais da entrega

- `docs/documentacao-teorica.pdf`: parte teórica com 2 páginas;
- `docs/roteiro-video-pitch.pdf`: roteiro da apresentação de até 4 minutos;
- `docs/guia-de-entrega.pdf`: instruções para GitHub, vídeo e compactação;
- `docs/resumo-do-projeto.pdf`: resumo técnico;
- `ENTREGA_FINAL.pdf`: checklist final dos requisitos.

As versões `.md` dos materiais também ficam disponíveis como arquivos editáveis, mas os PDFs são recomendados para leitura e envio.
