import { Box, Divider, Typography } from '@mui/material';
import { AboutMe } from './AboutMe';
import { BrandHero } from './BrandHero';
import { ProgramsGrid } from './ProgramsGrid';
import { QR_ITEMS } from './homeContent';
import { QrCodeGallery } from './QrCodeGallery';

type HomeScreenProps = {
  onEnterKangaroo: () => void;
  onEnterPreCalculus: () => void;
};

/** MathZone brand landing page: hero (with social follow icons), program
 * grid, a small recommended-content QR section, and instructor bio — in
 * that order. */
export function HomeScreen({ onEnterKangaroo, onEnterPreCalculus }: HomeScreenProps) {
  const handleSelectProgram = (id: string) => {
    if (id === 'kangaroo') onEnterKangaroo();
    if (id === 'precalculus') onEnterPreCalculus();
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <BrandHero />

      <ProgramsGrid onSelectProgram={handleSelectProgram} />

      {QR_ITEMS.length > 0 && (
        <>
          <Divider sx={{ maxWidth: 1080, mx: 'auto' }} />
          <Box component="section" sx={{ maxWidth: 900, mx: 'auto', px: 3, py: { xs: 5, sm: 6 } }}>
            <Typography variant="h5" sx={{ fontWeight: 700, textAlign: 'center', mb: 3 }}>
              学生内容/授课内容精选 · 小红书二维码/链接查看
            </Typography>
            <QrCodeGallery items={QR_ITEMS} size={220} />
          </Box>
        </>
      )}

      <Divider sx={{ maxWidth: 1080, mx: 'auto' }} />

      <AboutMe />
    </Box>
  );
}
