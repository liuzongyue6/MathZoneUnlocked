import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  List,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Paper,
  Typography,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import DownloadIcon from '@mui/icons-material/Download';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { KANGAROO_SLIDE_GRADES, SLIDE_GRADE_LABELS, SLIDE_KIND_LABELS, toPublicUrl } from './slidesContent';
import type { SlideDeck, SlideGrade, SlideManifest } from './slidesContent';

const MarkdownViewer = lazy(() => import('./MarkdownViewer'));

type SlidesPageProps = {
  /** Which grade/course folders to show, in display order. */
  grades?: SlideGrade[];
};

/** Class-material viewer for parents: pick a lesson from the
 * grade-grouped list and view it — PDFs inline via an iframe (with an
 * "open in new tab" fallback for browsers, notably in-app/mobile ones,
 * that don't render embedded PDFs well), Markdown notes rendered in the
 * page, and Word handouts as a download.
 *
 * The deck list is auto-discovered at build time — see
 * scripts/build-slides-manifest.mjs — so this component only needs to
 * fetch public/slides/manifest.json, exactly like the problem picker
 * fetches problems/manifest.json in main.tsx. */
export function SlidesPage({ grades = KANGAROO_SLIDE_GRADES }: SlidesPageProps) {
  const [decks, setDecks] = useState<SlideDeck[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string>('');

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}slides/manifest.json`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load slides manifest');
        return r.json();
      })
      .then((data: SlideManifest) => setDecks(data.decks))
      .catch((e: Error) => setError(e.message));
  }, []);

  const grouped = useMemo(() => {
    if (!decks) return [];
    return grades.map((grade) => ({
      grade,
      decks: decks
        .filter((d) => d.grade === grade)
        .slice()
        .sort((a, b) => (a.date ?? '').localeCompare(b.date ?? '') || a.title.localeCompare(b.title)),
    })).filter((g) => g.decks.length > 0);
  }, [decks, grades]);

  useEffect(() => {
    if (selectedId || grouped.length === 0) return;
    setSelectedId(grouped[0].decks[0].id);
  }, [grouped, selectedId]);

  const selected = decks?.find((d) => d.id === selectedId);

  if (error) {
    return (
      <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!decks) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 8, color: 'text.secondary' }}>
        <CircularProgress size={22} />
        <Typography>Loading slides…</Typography>
      </Box>
    );
  }

  if (grouped.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', color: 'text.secondary', mt: 8 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          课件即将上线 · Slides coming soon
        </Typography>
        <Typography variant="body2">老师正在整理上课课件，敬请期待。</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 3,
        width: '100%',
        alignItems: { xs: 'stretch', md: 'flex-start' },
      }}
    >
      <Paper sx={{ width: { xs: '100%', md: 280 }, flexShrink: 0, borderRadius: 3, overflow: 'hidden' }}>
        <List dense disablePadding subheader={<li />}>
          {grouped.map((group) => (
            <li key={group.grade}>
              <ul style={{ padding: 0 }}>
                <ListSubheader sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>
                  {SLIDE_GRADE_LABELS[group.grade]}
                </ListSubheader>
                {group.decks.map((deck) => (
                  <ListItemButton
                    key={deck.id}
                    selected={deck.id === selectedId}
                    onClick={() => setSelectedId(deck.id)}
                  >
                    <ListItemText
                      primary={deck.title}
                      secondary={[SLIDE_KIND_LABELS[deck.kind], deck.date].filter(Boolean).join(' · ')}
                    />
                  </ListItemButton>
                ))}
              </ul>
            </li>
          ))}
        </List>
      </Paper>

      <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
        {selected && (
          <>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                mb: 1.5,
                flexWrap: 'wrap',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {selected.title}
              </Typography>
              {selected.kind === 'pdf' ? (
                <Button
                  component="a"
                  href={toPublicUrl(selected.fileSrc)}
                  target="_blank"
                  rel="noreferrer"
                  variant="outlined"
                  size="small"
                  startIcon={<OpenInNewIcon />}
                >
                  在新标签页打开 / 下载
                </Button>
              ) : (
                <Button
                  component="a"
                  href={toPublicUrl(selected.fileSrc)}
                  download
                  variant="outlined"
                  size="small"
                  startIcon={<DownloadIcon />}
                >
                  下载 · Download
                </Button>
              )}
            </Box>
            {selected.kind === 'pdf' && (
              <Paper
                variant="outlined"
                sx={{ borderRadius: 3, overflow: 'hidden', height: '80vh', bgcolor: 'background.default' }}
              >
                <Box
                  component="iframe"
                  src={toPublicUrl(selected.fileSrc)}
                  title={selected.title}
                  sx={{ width: '100%', height: '100%', border: 'none' }}
                >
                  <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                    <PictureAsPdfIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography>当前浏览器不支持内嵌预览，请点击上方按钮在新标签页打开。</Typography>
                  </Box>
                </Box>
              </Paper>
            )}
            {selected.kind === 'markdown' && (
              <Suspense
                fallback={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 4, color: 'text.secondary' }}>
                    <CircularProgress size={22} />
                    <Typography>Loading…</Typography>
                  </Box>
                }
              >
                <MarkdownViewer fileSrc={selected.fileSrc} />
              </Suspense>
            )}
            {selected.kind === 'docx' && (
              <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 3, sm: 6 }, textAlign: 'center' }}>
                <DescriptionIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                <Typography sx={{ mb: 2 }} color="text.secondary">
                  Word 文件无法在网页中预览，请下载后用 Word / WPS 打开。
                </Typography>
                <Button
                  component="a"
                  href={toPublicUrl(selected.fileSrc)}
                  download
                  variant="contained"
                  startIcon={<DownloadIcon />}
                >
                  下载 Word 文件
                </Button>
              </Paper>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
