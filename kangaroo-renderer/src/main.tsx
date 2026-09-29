import { StrictMode, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  AppBar,
  Alert,
  Box,
  CircularProgress,
  Container,
  CssBaseline,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
  Toolbar,
  Typography,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/600.css';
import '@fontsource/roboto/700.css';
import { theme } from './theme';
import { ProblemPlayer } from './player/ProblemPlayer';
import { HomeScreen } from './ui/home/HomeScreen';
import { GamesPage } from './ui/games/GamesPage';
import { SlidesPage } from './ui/slides/SlidesPage';
import type { SlideGrade } from './ui/slides/slidesContent';
import { useProblemStore } from './stores/problemStore';
import type { ProblemConfig, ProblemManifest, ProblemManifestEntry } from './types/problem';
import './index.css';

const DEFAULT_TITLE = 'Math Kangaroo Visualizations';

type AppMode = 'interactive' | 'slides' | 'games';

const PRECALCULUS_SLIDE_GRADES: SlideGrade[] = ['PreCalculus'];

// Dev-only hook so automated checks (and manual console poking) can drive
// the store directly: __problemStore.getState().setFoldAngle(90) etc.
if (import.meta.env.DEV) {
  (window as unknown as { __problemStore?: typeof useProblemStore }).__problemStore =
    useProblemStore;
}

/** "MK_G1_2" -> "Grade 1-2"; falls back to the raw grade string if unparseable. */
function formatGradeLabel(grade: string): string {
  const match = grade.match(/G(\d+)_(\d+)/);
  if (!match) return grade;
  return `Grade ${match[1]}-${match[2]}`;
}

function App() {
  const [manifest, setManifest] = useState<ProblemManifestEntry[] | null>(null);
  const [selected, setSelected] = useState<string>('');
  const [config, setConfig] = useState<ProblemConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'home' | 'app' | 'precalculus'>('home');
  const [mode, setMode] = useState<AppMode>('interactive');

  // Browser tab title doubles as the problem's "final page name" — the
  // JSON filename (meta.id) already encodes grade + year, e.g.
  // MK_G1_2_2021_GearRatio, so surface it verbatim rather than the
  // human-readable meta.title.
  useEffect(() => {
    document.title = config ? `${config.meta.id} · ${DEFAULT_TITLE}` : DEFAULT_TITLE;
  }, [config]);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}problems/manifest.json`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load problem manifest');
        return r.json();
      })
      .then((data: ProblemManifest) => {
        setManifest(data.problems);
        // ?problem=<id> deep-links straight to a specific problem.
        const requested = new URLSearchParams(window.location.search).get('problem');
        const initial =
          (requested && data.problems.find((p) => p.id === requested)) || data.problems[0];
        if (initial) {
          setSelected(initial.id);
        }
        // A ?problem= deep link is an explicit intent to open the app directly.
        if (requested && initial) {
          setView('app');
        }
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!manifest || !selected) return;
    const problem = manifest.find((p) => p.id === selected);
    if (!problem) return;

    setConfig(null);
    setError(null);

    fetch(`${import.meta.env.BASE_URL}${problem.path}`)
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load ${import.meta.env.BASE_URL}${problem.path}`);
        return r.json();
      })
      .then((data: ProblemConfig) => setConfig(data))
      .catch((e: Error) => setError(e.message));
  }, [manifest, selected]);

  const grouped = useMemo(() => {
    if (!manifest) return [];
    const grades = Array.from(new Set(manifest.map((p) => p.grade))).sort();
    return grades.map((grade) => ({
      grade,
      problems: manifest
        .filter((p) => p.grade === grade)
        .slice()
        .sort((a, b) => a.year.localeCompare(b.year)),
    }));
  }, [manifest]);

  const handleChange = (event: SelectChangeEvent) => {
    setSelected(event.target.value);
  };

  if (view === 'home') {
    return (
      <HomeScreen
        onEnterKangaroo={() => setView('app')}
        onEnterPreCalculus={() => setView('precalculus')}
      />
    );
  }

  if (view === 'precalculus') {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AppBar position="static" color="transparent" elevation={0}>
          <Toolbar sx={{ gap: 3, py: 1.5 }}>
            <Typography
              component="button"
              onClick={() => setView('home')}
              variant="h6"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                bgcolor: 'transparent',
                border: 'none',
                p: 0,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
              aria-label="Back to MathZone home"
            >
              📈 PreCalculus
            </Typography>
          </Toolbar>
        </AppBar>
        <Container maxWidth="lg" sx={{ flex: 1, display: 'flex', flexDirection: 'column', pb: 6, pt: 2 }}>
          <SlidesPage grades={PRECALCULUS_SLIDE_GRADES} />
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar sx={{ gap: 3, flexWrap: 'wrap', py: 1.5 }}>
          <Typography
            component="button"
            onClick={() => setView('home')}
            variant="h6"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              bgcolor: 'transparent',
              border: 'none',
              p: 0,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
            aria-label="Back to MathZone home"
          >
            🦘 Math Kangaroo Visualizations
          </Typography>
          <Tabs
            value={mode}
            onChange={(_e, value: AppMode) => setMode(value)}
            sx={{ minHeight: 0 }}
          >
            <Tab value="interactive" label="互动可视化" sx={{ minHeight: 0, py: 1 }} />
            <Tab value="slides" label="上课课件" sx={{ minHeight: 0, py: 1 }} />
            <Tab value="games" label="小游戏" sx={{ minHeight: 0, py: 1 }} />
          </Tabs>
          {mode === 'interactive' && (
            <FormControl size="small" sx={{ minWidth: 260, ml: 'auto' }}>
              <InputLabel id="problem-select-label">Problem</InputLabel>
              <Select
                labelId="problem-select-label"
                label="Problem"
                value={selected}
                onChange={handleChange}
                disabled={!manifest || manifest.length === 0}
              >
                {grouped.map((group) => [
                  <MenuItem key={group.grade} disabled divider sx={{ opacity: 1, fontWeight: 700 }}>
                    {formatGradeLabel(group.grade)}
                  </MenuItem>,
                  ...group.problems.map((p) => (
                    <MenuItem key={p.id} value={p.id} sx={{ pl: 3 }}>
                      {p.id}
                    </MenuItem>
                  )),
                ])}
              </Select>
            </FormControl>
          )}
        </Toolbar>
      </AppBar>

      <Container
        maxWidth={mode === 'slides' || mode === 'games' ? 'lg' : 'md'}
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: mode === 'interactive' ? 'center' : 'stretch',
          pb: 6,
          pt: 2,
        }}
      >
        {mode === 'slides' ? (
          <SlidesPage />
        ) : mode === 'games' ? (
          <GamesPage />
        ) : (
          <>
            {error && (
              <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
                {error}
              </Alert>
            )}
            {!error && config && <ProblemPlayer key={config.meta.id} config={config} />}
            {!error && !config && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 8, color: 'text.secondary' }}>
                <CircularProgress size={22} />
                <Typography>Loading problem…</Typography>
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
);
