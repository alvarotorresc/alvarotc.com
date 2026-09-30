---
title: 'Hi, I am Álvaro. I like software that respects the person using it.'
intro: 'Software Engineer in Seville. This is the long version: who I am, where I come from and what I do when I close the laptop.'
values:
  - icon: tux
    title: 'Free software'
    text: 'I publish the code of everything I make. If you use something of mine, you can read how it works, build it yourself and take it elsewhere.'
  - icon: lock
    title: 'Privacy and security'
    text: 'I do not ask you for an account unless it is needed, I do not track you and I think about protecting your data from day one.'
  - icon: cat
    title: 'Animals'
    text: 'I am vegan and I help animal shelters in Seville. That is where Huellas comes from.'
  - icon: megaphone
    title: 'Building in public'
    text: 'I share what I build while I build it: what worked, what broke and why I decided it that way.'
stages:
  - id: daw-2018
    kicker: '2018'
    title: 'Web application development'
    icon: gradcap
    paragraphs:
      - 'Two years of a vocational degree at IES Velázquez in Seville. Java, JavaScript and databases, and the first time I saw clearly that what drew me in was what happens on the server, not what you see on the screen.'
      - 'Outside class I earned the freeCodeCamp algorithms and data structures certification, competed in Codefest 2019 at Everis and went to every meetup and code fest I could. In this trade you learn as much from people as from the docs.'
    photo: ../../assets/about/ies-2018.jpg
    photoAlt: 'My desk in 2018: a monitor switched on, a red backlit keyboard and a Java book on the table.'
    caption: '2018 · My desk, studying web development'
    facts:
      year: '2018'
      place: 'Seville'
      os: 'Windows and Ubuntu'
      stack: 'Java, JavaScript, HTML, CSS'
  - id: z1-2020
    kicker: '2020'
    title: 'Z1 Digital Studio'
    icon: rocket
    paragraphs:
      - 'My first job. I built digital products for clients in the US and Canada: I maintained and extended apps in production with lots of users, such as [Waking Up](https://www.wakingup.com/) and [Storytelling with Data](https://www.storytellingwithdata.com/), and I worked on projects in energy, security and social media.'
      - 'Python and Django, Node and TypeScript, REST and GraphQL APIs with Apollo and Graphene. Everything in Docker on AWS, with CI/CD on GitHub Actions: code only reached production once the rest of the team approved the pull request.'
      - 'I learned to really work as a team, with Scrum or Kanban depending on the client, and that good test coverage is what lets you sleep at night.'
    photo: ../../assets/about/z1-2020.jpg
    photoAlt: 'A Z1 Digital Studio tote bag with the motto “Creativity is necessary, Honesty is essential” and the company logo.'
    caption: '2020 · Z1 Digital Studio'
    facts:
      year: '2020'
      place: 'Seville, remote'
      os: 'macOS'
      stack: 'Python, Django, Node, TypeScript'
  - id: therapyside-2022
    kicker: '2022'
    title: 'Therapyside'
    icon: chat
    paragraphs:
      - 'The backend of [Therapyside](https://www.therapyside.com/), an online therapy platform with more than 5,000 daily active users. I started with new features on Django REST Framework, such as couples therapy or a new onboarding, and ended up touching almost everything underneath.'
      - 'I migrated the project from Python 2.7 to 3.7, moved the in-house websockets to Django Channels, rebuilt push and email notifications on Celery, Redis and Mailchimp, tuned PostgreSQL queries and set up the tests with Pytest. I also got the product ready for Italy and the UK, translating it into Italian and English, and built an internal platform so marketing, sales and other teams could manage patients, subscriptions and charts.'
      - 'And daily support with the operations team, with the issues that came in through Zendesk. That is where I learned that in production, boring is a virtue.'
    photo: ../../assets/about/therapyside-2022.jpg
    photoAlt: 'Me on the platform at Santa Justa station in Seville, wearing a mask, a backpack and a Therapyside hoodie.'
    caption: '2022 · Therapyside'
    facts:
      year: '2022'
      place: 'Madrid, remote'
      os: 'macOS'
      stack: 'Python, Django Channels, Celery, Redis'
  - id: soltel-2025
    kicker: '2025'
    title: 'Soltel'
    icon: server
    paragraphs:
      - 'Microservices in Java 17 and Node 22 that talk to each other and to external agents. This is where I learned to think about systems I do not fully control: every service has to survive the one next to it failing.'
      - 'I built a case-scoring system from scratch with Drools and designed its databases in Oracle and MongoDB.'
      - 'I am now migrating several public grant and scholarship systems into a single robust one that talks to external systems through Kafka queues.'
    photo: ../../assets/about/soltel-2025.jpg
    photoAlt: 'Placeholder: Soltel'
    caption: '2025 · Soltel'
    facts:
      year: '2025'
      place: 'Seville, remote'
      os: 'Windows'
      stack: 'Java 17, Node 22, Angular, Drools'
  - id: own-2026
    kicker: '2026'
    title: 'My own things'
    icon: construction
    paragraphs:
      - 'Outside work I build my own things: [Bito](/projects/bito), [Quedamos](/projects/quedamos), [BaseCero](/projects/basecero), [Cheesy](/projects/cheesy) and now [Huellas](/projects/huellas). All free software, with the decisions written down on the blog.'
      - 'I build in public. I document the process on the blog, on video and on social media: what worked, what broke and why. Decisions, not tutorials.'
    photo: ../../assets/about/desk-2026.jpg
    photoAlt: 'Placeholder: my desk in 2026'
    caption: '2026 · Seville'
    facts:
      year: '2026'
      place: 'Seville'
      os: 'Nobara'
      stack: 'Python, TypeScript, Astro, Go, Docker'
  - id: free-software
    kicker: 'Principles'
    title: 'Why I publish everything as free software'
    icon: tux
    paragraphs:
      - 'I build the parts of a product that nobody sees until they break: APIs, data models, queues, deploys. I have been doing it in production for more than six years.'
      - 'What interests me most is that what I build can be used without having to trust anyone. That is why everything I publish is free software: you can read it, build it and fork it.'
      - 'And that is why my apps work without an account when none is needed, with no trackers and with data protected by design. I self-host the most essential services, so my files stay private and secure.'
    links:
      - label: 'github.com/alvarotorresc'
        href: 'https://github.com/alvarotorresc'
      - label: '/projects/bito'
        href: '/projects/bito'
    photo: ../../assets/about/linux.jpg
    photoAlt: 'Placeholder: Linux desktop'
    caption: 'Ubuntu since 2018 · Nobara since 2022'
    facts:
      year: '2018'
      place: 'Seville'
      os: 'Ubuntu, Nobara'
      stack: 'Fedora Server, Docker, Caddy, Nginx, Proxmox'
  - id: animals
    kicker: 'Animals'
    title: 'Animals, and why I am vegan'
    icon: leaf
    paragraphs:
      - 'I have been vegan since 2021. I realised there was no need to exploit animals to live a full and healthy life, and since then respect for them has been one of the core values of my everyday life.'
      - 'I have volunteered at animal shelters in Seville since 2024, and that experience is where [Huellas](/projects/huellas) comes from, the platform to reunite lost pets with their families that I am building now.'
    photo: ../../assets/about/cats.jpg
    photoAlt: 'Two cats on a cat tree: a tabby lying on top and a black cat sitting next to it.'
    caption: 'Shelter · Seville'
    facts:
      year: '2024'
      place: 'Seville'
      os: '-'
      stack: '-'
  - id: guitar
    kicker: 'Music'
    title: 'Electric guitar'
    icon: guitar
    paragraphs:
      - 'I love music, above all rock and metal, and the electric guitar in particular. I play an Ibanez.'
      - 'I am still learning, with live lessons, videos and online courses. Sometimes I record myself on Linux to use it in one of my videos.'
    photo: ../../assets/about/guitar.jpg
    photoAlt: 'My Ibanez electric guitar, black with a red pickguard, resting on a chair with its embroidered strap.'
    caption: 'Ibanez · rock and metal'
    facts:
      year: '2025'
      place: 'Seville'
      os: '-'
      stack: 'Ardour'
  - id: chess
    kicker: 'Game'
    title: 'Chess'
    icon: chess
    paragraphs:
      - 'I started in 2022, when my older brother taught me to play. Since then we play every week, share resources and watch games together.'
      - 'I play on Lichess, which is free software too. Always up for a game: [alvarotorrescarrasco](https://lichess.org/@/alvarotorrescarrasco). And since I wanted a place to practise openings and endgames without an account, I made [Cheesy](/projects/cheesy).'
    photo: ../../assets/about/chess.jpg
    photoAlt: 'A game in progress on a folding wooden board, with the white pieces in the foreground.'
    caption: 'Lichess · alvarotorrescarrasco'
    facts:
      year: '2022'
      place: 'Lichess'
      os: '-'
      stack: '-'
  - id: boxing
    kicker: 'Sport'
    title: 'Boxing'
    icon: boxing
    paragraphs:
      - 'I train at a club in my neighbourhood. It is all amateur: I have never competed, I just train.'
      - 'It helps me a lot to switch off and let go of all the mental load of this job. It is the only place where I do not think about software.'
    photo: ../../assets/about/boxing.jpg
    photoAlt: 'My white Leone 1947 boxing gloves, with the logo in gold, on a parquet floor.'
    caption: 'Boxing · Seville'
    facts:
      year: '2024'
      place: 'Seville'
      os: '-'
      stack: '-'
  - id: rpg
    kicker: 'Role-playing'
    title: 'Dungeons & Dragons'
    icon: dice
    paragraphs:
      - 'I love role-playing games. I play Dungeons & Dragons as a player with a small group of close friends spread all over Spain, and now and then I join an in-person game at local clubs.'
      - 'My favourite class is the bard, and I love playing my guitar during the sessions.'
    photo: ../../assets/about/rpg.jpg
    photoAlt: 'My role-playing dice, black with red numbers, on a desk mat.'
    caption: 'D&D · the party bard'
    facts:
      year: '-'
      place: 'Online and in person'
      os: '-'
      stack: '-'
mock: false
---
