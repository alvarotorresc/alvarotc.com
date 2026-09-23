export interface StageFacts {
  year: string;
  place: string;
  os: string;
  stack: string;
}

export interface Polaroid {
  src: string;
  alt: string;
  caption: string;
  facts: StageFacts;
}

export interface StoryStage {
  id: string;
  kicker: string;
  title: string;
  paragraphs: string[];
  links: { label: string; href: string }[];
  polaroid?: Polaroid;
}

export interface RawStage {
  id: string;
  kicker: string;
  title: string;
  paragraphs: string[];
  links: { label: string; href: string }[];
  photoAlt?: string;
  caption?: string;
  facts?: StageFacts;
}

const EMPTY_FACTS: StageFacts = { year: '', place: '', os: '', stack: '' };

export function toStoryStage(stage: RawStage, src: string | undefined): StoryStage {
  const { id, kicker, title, paragraphs, links } = stage;
  if (!src) return { id, kicker, title, paragraphs, links };
  return {
    id,
    kicker,
    title,
    paragraphs,
    links,
    polaroid: {
      src,
      alt: stage.photoAlt ?? '',
      caption: stage.caption ?? '',
      facts: stage.facts ?? EMPTY_FACTS,
    },
  };
}

export function firstPolaroid(stages: StoryStage[]): Polaroid | undefined {
  return stages.find((s) => s.polaroid)?.polaroid;
}

export function polaroidFor(stages: StoryStage[], id: string): Polaroid | undefined {
  return stages.find((s) => s.id === id)?.polaroid ?? firstPolaroid(stages);
}
