/** Single source of truth for editable MathZone brand-page content. Update
 * the values here (no component code changes needed) when real links,
 * photos, or copy become available. */

/** GitHub username used to build the About-Me avatar via
 * https://github.com/<username>.png. */
export const GITHUB_USERNAME = 'liuzongyue6';

export const BRAND = {
  name: 'MathZone',
  tagline: '比答案更重要的是思考过程',
  taglineEn: 'The thinking process matters more than the answer',
};

export type ProgramStatus = 'available' | 'coming-soon' | 'preview';

export type ProgramCard = {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  status: ProgramStatus;
  /** Shown on 'available' | 'coming-soon' cards. Not used for 'preview'. */
  ctaLabel?: string;
  /** Shown inline on 'preview' cards as a compact QR strip. */
  qrItems?: QrItem[];
};

/** The 3 program cards shown in the stack, in display order (always top
 * to bottom, on every screen size).
 *
 * Math Kangaroo (interactive app) and PreCalculus (course materials from
 * public/slides/PreCalculus/) are the clickable programs, so they lead.
 * AP Calculus
 * has no page yet, but is highlighted with scan-to-preview QR codes
 * ('preview' status) instead of a plain "Coming Soon" badge — swap in the
 * real image paths/titles once you have them. */
export const PROGRAM_CARDS: ProgramCard[] = [
  {
    id: 'kangaroo',
    icon: '🦘',
    title: 'Math Kangaroo Visualizations',
    subtitle: '互动可视化 · Math Kangaroo题目',
    description: '通过 3D 动画与互动操作，直观拆解Math Kangaroo，理解思考过程。',
    status: 'available',
    ctaLabel: '开始探索 · Explore',
  },
  {
    id: 'precalculus',
    icon: '📈',
    title: 'PreCalculus',
    subtitle: '预备微积分 · 课程材料',
    description: '覆盖 Test-Out 与 AP Precalculus 核心内容，为 AP Calculus BC 打基础。',
    status: 'available',
    ctaLabel: '进入模块 · Enter',
  },
  {
    id: 'ap-calculus',
    icon: '∫',
    title: 'AP Calculus',
    subtitle: '微积分进阶',
    description: '面向 AP 考试',
    status: 'preview',
    // qrItems: [
    //   { id: 'ap-calc-preview-1', title: 'AP Calculus 精选视频 1', imageSrc: '/qrcodes/ap-calc-preview-1.png' },
    //   { id: 'ap-calc-preview-2', title: 'AP Calculus 精选视频 2', imageSrc: '/qrcodes/ap-calc-preview-2.png' },
    // ],
  },
];

export type SocialLink = {
  id: 'youtube' | 'xiaohongshu' | 'tiktok';
  label: string;
  /** '#' marks a placeholder that still needs a real URL. */
  href: string;
};

export const SOCIAL_LINKS: SocialLink[] = [
  { id: 'youtube', label: 'YouTube', href: 'https://www.youtube.com/@MathZoneUnlocked' },
  { id: 'xiaohongshu', label: '小红书', href: 'https://xhslink.com/m/Xy3fZLytC1' },
  {
    id: 'tiktok',
    label: 'TikTok',
    href: 'https://www.tiktok.com/@mathzoneunlocked',
  },
];

export type QrItem = {
  id: string;
  title: string;
  /** Path under public/, e.g. place the PNG at public/qrcodes/foo.png and
   * reference it here as '/qrcodes/foo.png'. */
  imageSrc: string;
  href?: string;
};

/** Flexible, freely add/remove entries. Section is hidden automatically
 * when this array is empty. Drop the referenced images into
 * kangaroo-renderer/public/qrcodes/. */
export const QR_ITEMS: QrItem[] = [
  { id: 'mit-parent-tips', title: '往期学生家长经验分享：MIT', imageSrc: '/qrcodes/AP5_experience_MIT.png', href: 'http://xhslink.com/o/5ncHSPWmF28' },
  { id: '2026-ap-unit9', title: '2026 AP Calculus BC 专属考点 Unit 9', imageSrc: '/qrcodes/AP_Unit9.png', href: 'http://xhslink.com/o/1aCAOwjDSu3' },
  { id: '2026-research-paper-for-kid', title: '研究生科研论文讲给小学生听', imageSrc: '/qrcodes/20260709_explain_paper_to_kid.png', href: 'http://xhslink.com/o/5B52HUY5ChQ' },
  { id: '2026-ap-prediction', title: '2026 AP Calculus BC 预测：我猜对了吗？', imageSrc: '/qrcodes/2026_AP_Prediction.png', href: 'http://xhslink.com/o/5ncHSPWmF28' },
];

export const ABOUT_ME = {
  bullets: [
    '同济大学机械 + 佐治亚理工计算机 双硕士',
    '全球创新大赛多次获奖',
    '多项技术论文、专利发表',
    '长期从事高等数学教学与思维训练',
    '注重解题逻辑与学习方法的培养',
  ],
};
