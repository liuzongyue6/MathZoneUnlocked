/** Shared types for class-material content (PPT->PDF slides, Markdown
 * notes, Word handouts). The actual deck list is NOT hand-maintained here —
 * it's auto-discovered at build time by scripts/build-slides-manifest.mjs,
 * which scans public/slides/<grade>/*.{pdf,md,docx} and writes
 * public/slides/manifest.json (fetched at runtime by SlidesPage). Just drop
 * a file into the right grade/course folder and it shows up automatically;
 * no code changes needed. Optionally give it a nicer display title/date via
 * public/slides/titles.json (see public/slides/README.txt). */

export type SlideGrade = 'MK_G1_2' | 'MK_G5_6' | 'PreCalculus';

/** How SlidesPage shows a file: inline PDF, rendered Markdown, or a
 * download-only Word document. */
export type SlideKind = 'pdf' | 'markdown' | 'docx';

export type SlideDeck = {
  id: string;
  grade: SlideGrade;
  kind: SlideKind;
  /** Display title shown in the lesson list, e.g. '第1讲：图形与规律'.
   * Auto-derived from the filename unless overridden in titles.json. */
  title: string;
  /** 'YYYY-MM-DD', shown as a secondary caption; optional. */
  date?: string;
  /** Path under public/, e.g. '/slides/MK_G1_2/foo.pdf'. */
  fileSrc: string;
};

export type SlideManifest = {
  decks: SlideDeck[];
};

/** Human-readable label + display order for each grade band. */
export const SLIDE_GRADE_LABELS: Record<SlideGrade, string> = {
  MK_G1_2: 'Grade 1-2',
  MK_G5_6: 'Grade 5-6',
  PreCalculus: 'PreCalculus',
};

/** Short type tag shown under each item in the lesson list. */
export const SLIDE_KIND_LABELS: Record<SlideKind, string> = {
  pdf: 'PDF',
  markdown: '讲义 · Notes',
  docx: 'Word',
};

/** Grade bands shown in the Math Kangaroo "上课课件" tab. */
export const KANGAROO_SLIDE_GRADES: SlideGrade[] = ['MK_G1_2', 'MK_G5_6'];

/** Resolves a public/ path (e.g. '/slides/MK_G1_2/foo.pdf') against the
 * Vite base URL, matching the pattern used for QR code images. Encodes
 * each segment so filenames with spaces work. */
export function toPublicUrl(path: string): string {
  const encoded = path
    .replace(/^\//, '')
    .split('/')
    .map(encodeURIComponent)
    .join('/');
  return `${import.meta.env.BASE_URL}${encoded}`;
}
