import { useEffect, useState } from 'react';
import { Alert, Box, CircularProgress, Paper, Typography } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { toPublicUrl } from './slidesContent';

/** remark-math only treats $$…$$ as display math when the fences sit on
 * their own lines; our notes often write `$$ … $$` on a single line, so
 * split those into fenced blocks to get centered, non-wrapping formulas. */
function fenceSingleLineDisplayMath(md: string): string {
  return md.replace(/^([ \t]*)\$\$(.+?)\$\$[ \t]*$/gm, '$1$$$$\n$1$2\n$1$$$$');
}

type MarkdownViewerProps = {
  /** Path under public/, e.g. '/slides/PreCalculus/L00_Course_Map.md'. */
  fileSrc: string;
};

/** Renders a course-notes .md file with GFM tables and $…$ / $$…$$ math.
 * Lazy-loaded from SlidesPage so the Markdown/KaTeX bundle only downloads
 * when a Markdown file is actually opened. */
export default function MarkdownViewer({ fileSrc }: MarkdownViewerProps) {
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setText(null);
    setError(null);
    fetch(toPublicUrl(fileSrc))
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load ${fileSrc}`);
        return r.text();
      })
      .then((t) => !cancelled && setText(fenceSingleLineDisplayMath(t)))
      .catch((e: Error) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [fileSrc]);

  if (error) return <Alert severity="error">{error}</Alert>;

  if (text === null) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 4, color: 'text.secondary' }}>
        <CircularProgress size={22} />
        <Typography>Loading…</Typography>
      </Box>
    );
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 3,
        p: { xs: 2, sm: 4 },
        minWidth: 0,
        overflowWrap: 'anywhere',
        lineHeight: 1.7,
        '& h1': { fontSize: '1.6rem', mt: 0, mb: 2 },
        '& h2': { fontSize: '1.3rem', mt: 4, mb: 1.5, pb: 0.5, borderBottom: 1, borderColor: 'divider' },
        '& h3': { fontSize: '1.1rem', mt: 3, mb: 1 },
        '& hr': { border: 0, borderTop: 1, borderColor: 'divider', my: 3 },
        '& blockquote': {
          m: 0,
          my: 2,
          px: 2,
          py: 0.5,
          borderLeft: 4,
          borderColor: 'primary.main',
          bgcolor: 'action.hover',
          borderRadius: 1,
        },
        // Wide tables and ASCII diagrams scroll inside the card instead of
        // stretching the page on narrow screens.
        '& table': {
          display: 'block',
          overflowX: 'auto',
          borderCollapse: 'collapse',
          my: 2,
          fontSize: '0.9rem',
          overflowWrap: 'normal',
        },
        '& th, & td': { border: 1, borderColor: 'divider', px: 1.5, py: 0.75, verticalAlign: 'top' },
        '& th': { bgcolor: 'action.hover', fontWeight: 700 },
        '& pre': {
          overflowX: 'auto',
          p: 2,
          bgcolor: 'action.hover',
          borderRadius: 2,
          fontSize: '0.8rem',
          lineHeight: 1.4,
          overflowWrap: 'normal',
        },
        '& code': { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' },
        '& .katex-display': { overflowX: 'auto', overflowY: 'hidden', py: 0.5 },
      }}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
        {text}
      </ReactMarkdown>
    </Paper>
  );
}
