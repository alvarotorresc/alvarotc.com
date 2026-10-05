---
name: Cheesy
tagline: 'Lessons, openings, endgames and tactics, in your browser.'
intro: 'Learn from scratch with short lessons, play openings and endgames against the computer, solve tactics puzzles and analyse with an engine. Moves read in words, not notation, and a glossary explains the jargon. No account, nothing to install and no ads: your progress stays in your browser.'
kind: web
status: published
tier: lab
order: 8
repo: https://github.com/alvarotorresc/cheesy
url: https://cheesy.alvarotc.com
license: GPL-3.0
stack: [Angular, TypeScript, Stockfish]
githubRepo: alvarotorresc/cheesy
icon: '../../../assets/projects/cheesy/icon.png'
cover: '../../../assets/projects/cheesy/cover-en.png'
coverMobile: '../../../assets/projects/cheesy/cover-mobile-en.png'
promo: '../../../assets/projects/cheesy/promo-en.png'
facts:
  - { label: 'Content', value: '21 openings, 14 endgames, 13 positions' }
  - { label: 'Learn', value: '36 lessons, in three levels' }
  - { label: 'Glossary', value: '89 terms, each with its board' }
  - { label: 'Puzzles', value: '550 from Lichess, in batches of 10' }
  - { label: 'Languages', value: 'Spanish and English' }
  - { label: 'Accounts', value: 'None; progress stays in your browser' }
  - { label: 'Engine', value: 'Stockfish 19, in the browser' }
screenshotsIntro: 'Learn, the glossary and Practise more, then Openings, Endgames, Positions and Analysis.'
screenshots:
  - src: '../../../assets/projects/cheesy/screen-learn-en.png'
    alt: 'The Learn page: the “Continue: The skewer” button and five cards, the Beginner, Intermediate and Advanced levels with their number of lessons, the Glossary and Practise more, and below the note that progress is kept only in the browser.'
    caption: 'Lessons from beginner to advanced'
  - src: '../../../assets/projects/cheesy/screen-lesson-en.png'
    alt: 'The first step of the lesson “The fork”: a board with a white knight and two arrows to the black king and rook, the text that explains it in words, the progress “Step 1 of 7” and the bubble of the term “Check” open, with its definition, a mini board and the “See in the glossary” link.'
    caption: 'A lesson, step by step'
  - src: '../../../assets/projects/cheesy/screen-glossary-en.png'
    alt: 'The glossary in the dark theme, filtered by the Tactics family: the search box, the filters by level and by family, the count of terms in the family and the first row of cards, each with its example board, its level, its definition and the lesson where it is learnt.'
    caption: 'Chess words, with a board'
  - src: '../../../assets/projects/cheesy/screen-puzzles-en.png'
    alt: 'The Practise more list in the dark theme: real Lichess puzzles grouped by lesson, with three lessons started, “16 of 50 on the first try” in Hanging pieces and 8 of 50 in The fork and The pin, and the rest still to start.'
    caption: 'Lichess puzzles by theme'
  - src: '../../../assets/projects/cheesy/screen-puzzle-en.png'
    alt: 'An unsolved puzzle of The fork: the board, the progress “Puzzle 1 of 10”, the prompt “You play White. Black just moved: pawn to c5. Find the best move.” and the “Next puzzle” button disabled.'
    caption: 'A puzzle to solve'
  - src: '../../../assets/projects/cheesy/screen-01-aperturas-en.png'
    alt: 'The opening catalogue: the filters by first move, family, side and progress, and the row “1.e4 e5: open games” with four openings, each with its mini board, its progress and the “Play” and “Practise” buttons.'
    caption: 'The 21 openings, with filters'
  - src: '../../../assets/projects/cheesy/screen-02-jugar-en.png'
    alt: 'A game of the Ruy Lopez as White, in the dark theme: the board after Black’s third move, the notice “Your move”, the theory panel with the Morphy Defence explained in words and the note “You are in our lines”, and the move list.'
    caption: 'An opening, with its theory'
  - src: '../../../assets/projects/cheesy/screen-03-practicar-en.png'
    alt: 'Practice of the main line of the Sicilian Najdorf as Black: the board seen from Black’s side after White’s sixth move, the progress “Move 6 of 13”, the count of mistakes on this move at 0 of 3 and the move list.'
    caption: 'A line, played from memory'
  - src: '../../../assets/projects/cheesy/screen-05-final-en.png'
    alt: 'The Lucena position, to win with White: the board, the goal checklist with “The win is still on” and the tablebase panel open, with the theoretical result “You win”, “You mate in 17” and the “Show hint” button.'
    caption: 'An endgame against the tablebase'
  - src: '../../../assets/projects/cheesy/screen-07-posicion-en.png'
    alt: 'An unsolved tactical exercise: the board, the note “Black to play · 1 move of yours”, the instruction “Find the winning move” and the “Hint” and “Show solution” buttons.'
    caption: 'A position to solve'
  - src: '../../../assets/projects/cheesy/screen-08-analisis-en.png'
    alt: 'The analysis board in the dark theme with a Ruy Lopez game: the engine on at depth 20, the evaluation bar, the three best lines, a green arrow on the best move and the move list with a folded variation.'
    caption: 'Analysis with engine and variations'
featuresIntro: 'Learn, the four sections and what they share.'
featureBlockLimit: 6
features:
  - title: 'Learn, from scratch to plans'
    text: 'Short lessons in steps: some explain and others ask you to find the move, pick the answer or play the position to the end. There are three levels of 12 lessons: beginner, intermediate (tactics and endgames) and advanced (strategy and plans).'
    image: '../../../assets/projects/cheesy/screen-lesson-en.png'
  - title: 'Practise more, with real puzzles'
    text: 'Eleven lessons of the intermediate level bring 50 puzzles each, taken from games in the open Lichess puzzle database (CC0). They come in batches of ten, from easiest to hardest, with no points or streaks.'
    image: '../../../assets/projects/cheesy/screen-puzzle-en.png'
  - title: 'A glossary with boards'
    text: 'Every word of the jargon has a plain definition and an example board. In the texts, terms are underlined: hover over one and a bubble tells you what it means.'
    image: '../../../assets/projects/cheesy/screen-glossary-en.png'
  - title: 'Openings to play and to practise'
    text: 'In Play, the rival answers from the covered lines, or is Stockfish at five levels; a theory panel names the variation and warns when you leave the lines. In Practise only the move of the line counts, and a line is mastered after three clean runs in a row.'
    image: '../../../assets/projects/cheesy/screen-02-jugar-en.png'
  - title: 'Endgames against a perfect rival'
    text: 'Win the won endgames and hold the drawn ones for fifteen moves. The rival plays from the Lichess tablebase and a panel gives the theoretical verdict.'
    image: '../../../assets/projects/cheesy/screen-04-finales-en.png'
  - title: 'Analysis with variations and engine'
    text: 'A free board, with the moves in a tree with variations. The engine is optional: evaluation bar, three best lines and an arrow. Imports FEN and PGN and gives links to share.'
    image: '../../../assets/projects/cheesy/screen-08-analisis-en.png'
  - title: 'Positions that give nothing away'
    text: 'You look for the winning move. The name and theme of each position stay hidden until you solve it, so they do not tell you what to look for.'
  - title: 'Moves in words'
    text: 'By default, moves are written in words: “Knight to f3” instead of “Nf3”. A switch in the header turns on notation, and hovering over a move highlights its square on the board.'
  - title: 'With the keyboard'
    text: 'Every board works without a mouse: arrow keys to move around, Enter to pick and play, Escape to cancel. A screen reader announces each square and what is on it.'
  - title: 'No account, in your browser'
    text: 'No accounts, no server of its own and no ads. Progress is kept in your browser and visits are counted with Umami, without cookies.'
  - title: 'Content checked by machine'
    text: 'Before they ship, openings, endgames, positions and lessons are validated automatically: legal moves with chessops, engine checks with Stockfish and the endgames against the Lichess tablebase.'
  - title: 'Spanish and English, light and dark'
    text: 'The interface is in both languages and the theme follows your system.'
  - title: 'Free software'
    text: 'Under GPL-3.0, with the code on GitHub.'
illustration: '../../../assets/projects/cheesy/icon.png'
built:
  - 'Angular 22 and TypeScript. The board is chessground and the rules, chessops.'
  - 'Stockfish 19, the single-thread lite build, in a Web Worker in the browser.'
  - 'In endgames, the position is looked up in the Lichess tablebase.'
  - 'Progress is kept in IndexedDB, in your browser. No backend.'
  - 'Lessons are written in TypeScript and built into JSON. Their tests check the moves with chessops, the exercises with Stockfish and the endgames with the Lichess tablebase.'
  - 'A script picks the Practise more puzzles from the open Lichess database, by theme and difficulty.'
  - 'About 2027 app tests and 748 content tests.'
  - 'Hosted on Netlify. Visits are counted with a self-hosted Umami, without cookies.'
  - 'Free software under GPL-3.0, code at [github.com/alvarotorresc/cheesy](https://github.com/alvarotorresc/cheesy).'
changelog:
  - version: 'v0.2.0'
    date: 2026-10-05
    note: 'Learn: 36 lessons in three levels, a glossary with boards and Practise more, with 550 Lichess puzzles. Moves in words by default, and every board works with the keyboard.'
  - version: 'v0.1.0'
    date: 2026-09-30
    note: 'The first version: 21 openings to play and practise, 14 endgames against the Lichess tablebase, 13 tactical positions and an analysis board with an engine, in Spanish and English.'
---

I play chess every week with my brother and wanted one place to practise openings, endgames and tactics against the computer, without creating an account.

I also wanted a board that never blocks you: except in Practise, which is strict on purpose, you can play any legal move and the app reacts to it.

When I shared it with some friends, the problem was a different one: they could not read notation and the jargon lost them. That is where moves in words, the glossary and Learn came from, to start from scratch.
