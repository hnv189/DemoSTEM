/**
 * The 18 printed faces (proposal, Phụ lục 4) and how they sit on the cubes.
 *
 * - `id`    stable vocabulary ID, also the illustration file name in /public/art.
 * - `text`  exactly what is printed on the face (keep "is" / "has").
 * - `slot`  the physical side of the cube the face is printed on.
 *           Each cube uses all six slots exactly once (checked by `npm test`).
 */

export type FaceSlot = 'top' | 'bottom' | 'front' | 'back' | 'left' | 'right';
export type CubeId = 'who' | 'looks' | 'personality';
export type Pronoun = 'he' | 'she';

export interface VocabFace {
  id: string;
  text: string;
  slot: FaceSlot;
  art: string;
  alt: string;
}

export interface WhoFace extends VocabFace {
  /** Fixed pronoun for this subject, or null when the speaker must choose (my best friend / my classmate). */
  pronoun: Pronoun | null;
  /** How a partner refers to this subject in a question: "What does ___ look like?" */
  questionRef: string;
}

export interface PredicateFace extends VocabFace {
  verb: 'is' | 'has';
}

export interface CubeConfig<F extends VocabFace = VocabFace> {
  id: CubeId;
  label: string;
  labelVi: string;
  number: 1 | 2 | 3;
  color: string;
  softColor: string;
  inkColor: string;
  faces: F[];
}

const art = (id: string) => `${import.meta.env.BASE_URL}art/${id}.svg`;

export const WHO: CubeConfig<WhoFace> = {
  id: 'who',
  label: 'WHO?',
  labelVi: 'Chủ ngữ',
  number: 1,
  color: '#69C7EE',
  softColor: '#E3F5FC',
  inkColor: '#12618A',
  faces: [
    { id: 'who-he', text: 'He', slot: 'top', art: art('who-he'), pronoun: 'he', questionRef: 'he', alt: 'Một bạn nói và chỉ về phía một bạn nam đứng riêng.' },
    { id: 'who-she', text: 'She', slot: 'front', art: art('who-she'), pronoun: 'she', questionRef: 'she', alt: 'Một bạn nói và chỉ về phía một bạn nữ đứng riêng.' },
    { id: 'who-lan', text: 'Lan', slot: 'right', art: art('who-lan'), pronoun: 'she', questionRef: 'Lan', alt: 'Nhân vật hư cấu Lan vẫy tay, phía trên có thẻ tên "Lan".' },
    { id: 'who-nam', text: 'Nam', slot: 'back', art: art('who-nam'), pronoun: 'he', questionRef: 'Nam', alt: 'Nhân vật hư cấu Nam vẫy tay, phía trên có thẻ tên "Nam".' },
    { id: 'who-best-friend', text: 'My best friend', slot: 'left', art: art('who-best-friend'), pronoun: null, questionRef: 'your best friend', alt: 'Một bạn đang nói, khoác tay người bạn thân, có hình trái tim.' },
    { id: 'who-classmate', text: 'My classmate', slot: 'bottom', art: art('who-classmate'), pronoun: null, questionRef: 'your classmate', alt: 'Trước bảng "Class 6A", một bạn chỉ về bạn cùng lớp.' },
  ],
};

export const LOOKS: CubeConfig<PredicateFace> = {
  id: 'looks',
  label: 'LOOKS',
  labelVi: 'Ngoại hình',
  number: 2,
  color: '#8BD8BC',
  softColor: '#E4F6EF',
  inkColor: '#1C7253',
  faces: [
    { id: 'looks-tall', text: 'is tall', slot: 'top', verb: 'is', art: art('looks-tall'), alt: 'Bạn cao đứng cạnh bạn thấp trên thước đo chiều cao; bạn cao được tô nổi.' },
    { id: 'looks-short', text: 'is short', slot: 'front', verb: 'is', art: art('looks-short'), alt: 'Bạn thấp đứng cạnh bạn cao trên thước đo chiều cao; bạn thấp được tô nổi.' },
    { id: 'looks-slim', text: 'is slim', slot: 'right', verb: 'is', art: art('looks-slim'), alt: 'Một bạn dáng mảnh khảnh, có mũi tên đo bề ngang.' },
    { id: 'looks-long-hair', text: 'has long hair', slot: 'back', verb: 'has', art: art('looks-long-hair'), alt: 'Bạn có mái tóc dài, mũi tên chỉ vào tóc.' },
    { id: 'looks-short-hair', text: 'has short hair', slot: 'left', verb: 'has', art: art('looks-short-hair'), alt: 'Bạn có mái tóc ngắn, mũi tên chỉ vào tóc.' },
    { id: 'looks-curly-hair', text: 'has curly hair', slot: 'bottom', verb: 'has', art: art('looks-curly-hair'), alt: 'Bạn có mái tóc xoăn, mũi tên chỉ vào tóc.' },
  ],
};

export const PERSONALITY: CubeConfig<PredicateFace> = {
  id: 'personality',
  label: 'PERSONALITY',
  labelVi: 'Tính cách',
  number: 3,
  color: '#FFB45F',
  softColor: '#FFF0DE',
  inkColor: '#9A530A',
  faces: [
    { id: 'personality-kind', text: 'is kind', slot: 'top', verb: 'is', art: art('personality-kind'), alt: 'Một bạn đưa tay giúp bạn bị ngã làm rơi sách.' },
    { id: 'personality-funny', text: 'is funny', slot: 'front', verb: 'is', art: art('personality-funny'), alt: 'Một bạn đội mũ, làm mặt hài hước; bạn bên cạnh cười "ha ha!".' },
    { id: 'personality-friendly', text: 'is friendly', slot: 'right', verb: 'is', art: art('personality-friendly'), alt: 'Một bạn tươi cười vẫy tay chào "Hi!", bạn kia vẫy lại.' },
    { id: 'personality-creative', text: 'is creative', slot: 'back', verb: 'is', art: art('personality-creative'), alt: 'Một bạn cầm cọ và bảng màu, đang vẽ tranh trên giá vẽ.' },
    { id: 'personality-confident', text: 'is confident', slot: 'left', verb: 'is', art: art('personality-confident'), alt: 'Một bạn đứng trên bục, cầm micro tự tin nói trước các bạn.' },
    { id: 'personality-hard-working', text: 'is hard-working', slot: 'bottom', verb: 'is', art: art('personality-hard-working'), alt: 'Một bạn chăm chú học bài bên bàn, có đèn học và chồng sách.' },
  ],
};

export const CUBES = [WHO, LOOKS, PERSONALITY] as const;
export type AnyCube = (typeof CUBES)[number];

/** Faces shown on first load (index into each cube's `faces`). */
export const INITIAL_FACES: [number, number, number] = [2, 3, 2]; // Lan / has long hair / is friendly

/** Guided example from the proposal. */
export const GUIDED_EXAMPLE = { who: 'who-lan', looks: 'looks-long-hair', personality: 'personality-friendly' } as const;

export function faceIndexById(cube: AnyCube, id: string): number {
  return cube.faces.findIndex((f) => f.id === id);
}

export function faceIndexForSlot(cube: AnyCube, slot: FaceSlot): number {
  return cube.faces.findIndex((f) => f.slot === slot);
}

export const GUIDED_FACES: [number, number, number] = [
  faceIndexById(WHO, GUIDED_EXAMPLE.who),
  faceIndexById(LOOKS, GUIDED_EXAMPLE.looks),
  faceIndexById(PERSONALITY, GUIDED_EXAMPLE.personality),
];
