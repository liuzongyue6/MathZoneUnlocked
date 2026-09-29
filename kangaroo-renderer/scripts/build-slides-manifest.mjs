// Scans public/slides/<grade>/*.{pdf,md,docx} and regenerates public/slides/manifest.json
// so SlidesPage can discover class decks with zero hand-edited registry --
// mirrors the Python side's kangaroo-content/generators/_registry.py
// rebuild_manifest() for problems. Run automatically via the predev/prebuild
// npm hooks; safe to re-run any time (fully derived from what's on disk).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SLIDES_DIR = path.join(__dirname, '..', 'public', 'slides');
const TITLES_OVERRIDE_PATH = path.join(SLIDES_DIR, 'titles.json');
const MANIFEST_PATH = path.join(SLIDES_DIR, 'manifest.json');

const GRADE_DIR_RE = /^MK_G(\d+)_(\d+)$/;
/** Non-Kangaroo course folders, listed after the MK grade bands in this order. */
const COURSE_DIRS = ['PreCalculus'];
/** File extension -> SlideKind the viewer knows how to show. */
const DECK_EXTS = { '.pdf': 'pdf', '.md': 'markdown', '.docx': 'docx' };

function isDeckDir(name) {
  return GRADE_DIR_RE.test(name) || COURSE_DIRS.includes(name);
}

function gradeSortKey(grade) {
  const match = grade.match(GRADE_DIR_RE);
  return match ? [Number(match[1]), Number(match[2])] : [Infinity, COURSE_DIRS.indexOf(grade)];
}

/** 'MathKangaroo_G1_2_26_Summer_10_Classes.pdf' -> 'MathKangaroo G1 2 26 Summer 10 Classes' */
function humanizeFilename(filename) {
  return path
    .basename(filename, path.extname(filename))
    .replace(/[_-]+/g, ' ')
    .trim();
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function loadTitleOverrides() {
  if (!fs.existsSync(TITLES_OVERRIDE_PATH)) return {};
  try {
    return JSON.parse(fs.readFileSync(TITLES_OVERRIDE_PATH, 'utf-8'));
  } catch (err) {
    console.warn(`[build-slides-manifest] failed to parse ${TITLES_OVERRIDE_PATH}:`, err.message);
    return {};
  }
}

function main() {
  const overrides = loadTitleOverrides();
  const decks = [];

  if (fs.existsSync(SLIDES_DIR)) {
    const gradeDirs = fs
      .readdirSync(SLIDES_DIR, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && isDeckDir(entry.name))
      .map((entry) => entry.name)
      .sort((a, b) => {
        const [a0, a1] = gradeSortKey(a);
        const [b0, b1] = gradeSortKey(b);
        return (a0 === b0 ? 0 : a0 - b0) || a1 - b1;
      });

    for (const grade of gradeDirs) {
      const gradeDir = path.join(SLIDES_DIR, grade);
      const deckFiles = fs
        .readdirSync(gradeDir)
        .filter((f) => path.extname(f).toLowerCase() in DECK_EXTS)
        .sort();

      for (const filename of deckFiles) {
        const override = overrides[filename] ?? {};
        const ext = path.extname(filename).toLowerCase();
        const kind = DECK_EXTS[ext];
        // PDFs keep the original id scheme; other kinds get the extension
        // appended so e.g. foo.pdf and foo.md don't collide.
        const slug = slugify(path.basename(filename, path.extname(filename)));
        decks.push({
          id: `${grade.toLowerCase().replace(/_/g, '-')}-${slug}${kind === 'pdf' ? '' : `-${ext.slice(1)}`}`,
          grade,
          kind,
          title: override.title ?? humanizeFilename(filename),
          date: override.date,
          fileSrc: `/slides/${grade}/${filename}`,
        });
      }
    }
  }

  fs.mkdirSync(SLIDES_DIR, { recursive: true });
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify({ decks }, null, 2) + '\n', 'utf-8');
  console.log(`[build-slides-manifest] wrote ${decks.length} deck(s) to ${path.relative(process.cwd(), MANIFEST_PATH)}`);
}

main();
