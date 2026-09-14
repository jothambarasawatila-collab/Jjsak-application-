import {
  SchoolTenant,
  SchoolBrandingDetails,
  PortalThemePreset,
  SchoolBannerConfig,
  UserRole,
} from '../types';

export interface ThemePresetDefinition {
  id: PortalThemePreset;
  name: string;
  categoryLabel: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  headerGradientClass: string;
  headerFromHex: string;
  headerViaHex: string;
  headerToHex: string;
  buttonClass: string;
  badgeClass: string;
  accentBorderClass: string;
  cardBgClass: string;
  navClass: string;
  footerClass: string;
  pillActiveClass: string;
  tagColorClass: string;
}

export const PORTAL_THEME_PRESETS: Record<PortalThemePreset, ThemePresetDefinition> = {
  blue: {
    id: 'blue',
    name: 'School A – Blue Theme (Royal Blue)',
    categoryLabel: 'Royal Blue & Cobalt',
    description: 'Crisp, authoritative institutional cobalt and sapphire with sky accents.',
    primaryColor: '#1E40AF',
    secondaryColor: '#3B82F6',
    backgroundColor: '#F0F4FF',
    headerGradientClass: 'from-[#1E3A8A] via-[#1E40AF] to-[#2563EB]',
    headerFromHex: '#1E3A8A',
    headerViaHex: '#1E40AF',
    headerToHex: '#2563EB',
    buttonClass: 'bg-[#1E40AF] hover:bg-[#1D4ED8] text-white shadow-sm',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
    accentBorderClass: 'border-blue-500',
    cardBgClass: 'bg-white border-blue-100/60 shadow-xs',
    navClass: 'bg-slate-900 border-blue-900/40 text-blue-100',
    footerClass: 'bg-blue-950 text-blue-200 border-blue-900/50',
    pillActiveClass: 'bg-white text-[#1E40AF] shadow-xs',
    tagColorClass: 'text-blue-700 bg-blue-100/70 border-blue-200',
  },
  green: {
    id: 'green',
    name: 'School B – Green Theme (Forest & Emerald)',
    categoryLabel: 'Forest & Emerald Green',
    description: 'Vibrant organic forest tones inspiring growth, vitality, and discipline.',
    primaryColor: '#065F46',
    secondaryColor: '#10B981',
    backgroundColor: '#F0FDF4',
    headerGradientClass: 'from-[#064E3B] via-[#065F46] to-[#059669]',
    headerFromHex: '#064E3B',
    headerViaHex: '#065F46',
    headerToHex: '#059669',
    buttonClass: 'bg-[#065F46] hover:bg-[#047857] text-white shadow-sm',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    accentBorderClass: 'border-emerald-500',
    cardBgClass: 'bg-white border-emerald-100/60 shadow-xs',
    navClass: 'bg-slate-900 border-emerald-900/40 text-emerald-100',
    footerClass: 'bg-emerald-950 text-emerald-200 border-emerald-900/50',
    pillActiveClass: 'bg-white text-[#065F46] shadow-xs',
    tagColorClass: 'text-emerald-700 bg-emerald-100/70 border-emerald-200',
  },
  purple: {
    id: 'purple',
    name: 'School C – Purple Theme (Royal Violet)',
    categoryLabel: 'Royal Purple & Violet',
    description: 'Distinguished imperial purple and violet reflecting creativity and intellect.',
    primaryColor: '#581C87',
    secondaryColor: '#8B5CF6',
    backgroundColor: '#FAF5FF',
    headerGradientClass: 'from-[#4C1D95] via-[#581C87] to-[#7C3AED]',
    headerFromHex: '#4C1D95',
    headerViaHex: '#581C87',
    headerToHex: '#7C3AED',
    buttonClass: 'bg-[#581C87] hover:bg-[#6D28D9] text-white shadow-sm',
    badgeClass: 'bg-purple-50 text-purple-800 border-purple-200',
    accentBorderClass: 'border-purple-500',
    cardBgClass: 'bg-white border-purple-100/60 shadow-xs',
    navClass: 'bg-slate-900 border-purple-900/40 text-purple-100',
    footerClass: 'bg-purple-950 text-purple-200 border-purple-900/50',
    pillActiveClass: 'bg-white text-[#581C87] shadow-xs',
    tagColorClass: 'text-purple-700 bg-purple-100/70 border-purple-200',
  },
  maroon: {
    id: 'maroon',
    name: 'School D – Maroon Theme (Heritage Crimson)',
    categoryLabel: 'Heritage Maroon & Crimson',
    description: 'Classic collegiate burgundy and deep crimson celebrating institutional tradition.',
    primaryColor: '#881337',
    secondaryColor: '#E11D48',
    backgroundColor: '#FFF1F2',
    headerGradientClass: 'from-[#4C0519] via-[#881337] to-[#9F1239]',
    headerFromHex: '#4C0519',
    headerViaHex: '#881337',
    headerToHex: '#9F1239',
    buttonClass: 'bg-[#881337] hover:bg-[#9F1239] text-white shadow-sm',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
    accentBorderClass: 'border-rose-500',
    cardBgClass: 'bg-white border-rose-100/60 shadow-xs',
    navClass: 'bg-slate-900 border-rose-900/40 text-rose-100',
    footerClass: 'bg-rose-950 text-rose-200 border-rose-900/50',
    pillActiveClass: 'bg-white text-[#881337] shadow-xs',
    tagColorClass: 'text-rose-700 bg-rose-100/70 border-rose-200',
  },
  orange: {
    id: 'orange',
    name: 'School E – Orange Theme (Sunset Amber)',
    categoryLabel: 'Sunset Amber & Warm Rust',
    description: 'Dynamic, high-energy warm ochre and burnt orange with vibrant contrast.',
    primaryColor: '#9A3412',
    secondaryColor: '#EA580C',
    backgroundColor: '#FFF7ED',
    headerGradientClass: 'from-[#7C2D12] via-[#9A3412] to-[#EA580C]',
    headerFromHex: '#7C2D12',
    headerViaHex: '#9A3412',
    headerToHex: '#EA580C',
    buttonClass: 'bg-[#9A3412] hover:bg-[#C2410C] text-white shadow-sm',
    badgeClass: 'bg-orange-50 text-orange-800 border-orange-200',
    accentBorderClass: 'border-orange-500',
    cardBgClass: 'bg-white border-orange-100/60 shadow-xs',
    navClass: 'bg-slate-900 border-orange-900/40 text-orange-100',
    footerClass: 'bg-amber-950 text-orange-200 border-orange-900/50',
    pillActiveClass: 'bg-white text-[#9A3412] shadow-xs',
    tagColorClass: 'text-orange-700 bg-orange-100/70 border-orange-200',
  },
  teal: {
    id: 'teal',
    name: 'Teal Theme (Oceanic & Turquoise)',
    categoryLabel: 'Oceanic Teal',
    description: 'Sophisticated deep cyan and teal tones radiating clarity and calm diligence.',
    primaryColor: '#0F766E',
    secondaryColor: '#14B8A6',
    backgroundColor: '#F0FDFA',
    headerGradientClass: 'from-[#115E59] via-[#0F766E] to-[#0D9488]',
    headerFromHex: '#115E59',
    headerViaHex: '#0F766E',
    headerToHex: '#0D9488',
    buttonClass: 'bg-[#0F766E] hover:bg-[#115E59] text-white shadow-sm',
    badgeClass: 'bg-teal-50 text-teal-800 border-teal-200',
    accentBorderClass: 'border-teal-500',
    cardBgClass: 'bg-white border-teal-100/60 shadow-xs',
    navClass: 'bg-slate-900 border-teal-900/40 text-teal-100',
    footerClass: 'bg-teal-950 text-teal-200 border-teal-900/50',
    pillActiveClass: 'bg-white text-[#0F766E] shadow-xs',
    tagColorClass: 'text-teal-700 bg-teal-100/70 border-teal-200',
  },
  navy: {
    id: 'navy',
    name: 'Navy Theme (Midnight Academy)',
    categoryLabel: 'Midnight Navy & Slate',
    description: 'Timeless dark academy navy blue paired with steel and slate accents.',
    primaryColor: '#0F172A',
    secondaryColor: '#334155',
    backgroundColor: '#F8FAFC',
    headerGradientClass: 'from-[#020617] via-[#0F172A] to-[#1E293B]',
    headerFromHex: '#020617',
    headerViaHex: '#0F172A',
    headerToHex: '#1E293B',
    buttonClass: 'bg-[#0F172A] hover:bg-[#1E293B] text-white shadow-sm',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
    accentBorderClass: 'border-slate-700',
    cardBgClass: 'bg-white border-slate-200/80 shadow-xs',
    navClass: 'bg-slate-950 border-slate-800 text-slate-100',
    footerClass: 'bg-slate-950 text-slate-300 border-slate-800',
    pillActiveClass: 'bg-white text-[#0F172A] shadow-xs',
    tagColorClass: 'text-slate-800 bg-slate-100 border-slate-200',
  },
  crimson: {
    id: 'crimson',
    name: 'Ruby Crimson (JJSAK Default)',
    categoryLabel: 'JJSAK Standard Crimson',
    description: 'Iconic Kenyan crimson scarlet reflecting the core JJSAK educational engine.',
    primaryColor: '#C51E28',
    secondaryColor: '#E11D48',
    backgroundColor: '#FFF5F5',
    headerGradientClass: 'from-[#991B1B] via-[#C51E28] to-[#DC2626]',
    headerFromHex: '#991B1B',
    headerViaHex: '#C51E28',
    headerToHex: '#DC2626',
    buttonClass: 'bg-[#C51E28] hover:bg-[#B91C1C] text-white shadow-sm',
    badgeClass: 'bg-red-50 text-red-800 border-red-200',
    accentBorderClass: 'border-[#C51E28]',
    cardBgClass: 'bg-white border-red-100/60 shadow-xs',
    navClass: 'bg-slate-900 border-red-900/40 text-red-100',
    footerClass: 'bg-red-950 text-red-200 border-red-900/50',
    pillActiveClass: 'bg-white text-[#C51E28] shadow-xs',
    tagColorClass: 'text-[#C51E28] bg-red-100/70 border-red-200',
  },
  amber: {
    id: 'amber',
    name: 'Golden Amber Theme (Sunburst)',
    categoryLabel: 'Golden Amber & Ochre',
    description: 'Warm gold and deep amber radiating intellectual light and optimism.',
    primaryColor: '#B45309',
    secondaryColor: '#F59E0B',
    backgroundColor: '#FEFCE8',
    headerGradientClass: 'from-[#78350F] via-[#B45309] to-[#D97706]',
    headerFromHex: '#78350F',
    headerViaHex: '#B45309',
    headerToHex: '#D97706',
    buttonClass: 'bg-[#B45309] hover:bg-[#92400E] text-white shadow-sm',
    badgeClass: 'bg-amber-50 text-amber-900 border-amber-200',
    accentBorderClass: 'border-amber-500',
    cardBgClass: 'bg-white border-amber-100/60 shadow-xs',
    navClass: 'bg-slate-900 border-amber-900/40 text-amber-100',
    footerClass: 'bg-amber-950 text-amber-200 border-amber-900/50',
    pillActiveClass: 'bg-white text-[#B45309] shadow-xs',
    tagColorClass: 'text-amber-800 bg-amber-100 border-amber-200',
  },
  custom: {
    id: 'custom',
    name: 'Custom School Palette',
    categoryLabel: 'Custom Institutional Branding',
    description: 'Hand-picked bespoke institutional colors tailored to your specific school guidelines.',
    primaryColor: '#1E293B',
    secondaryColor: '#64748B',
    backgroundColor: '#F8FAFC',
    headerGradientClass: 'from-slate-900 via-slate-800 to-slate-700',
    headerFromHex: '#0F172A',
    headerViaHex: '#1E293B',
    headerToHex: '#334155',
    buttonClass: 'bg-slate-800 hover:bg-slate-700 text-white shadow-sm',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
    accentBorderClass: 'border-slate-600',
    cardBgClass: 'bg-white border-slate-200/80 shadow-xs',
    navClass: 'bg-slate-900 border-slate-800 text-slate-100',
    footerClass: 'bg-slate-950 text-slate-200 border-slate-800',
    pillActiveClass: 'bg-white text-slate-900 shadow-xs',
    tagColorClass: 'text-slate-800 bg-slate-100 border-slate-200',
  },
};

/**
 * Validates role-based permission to modify institutional branding.
 * ONLY Head of Institution, Deputy Head, Director of Academics, and School Administrators may modify branding.
 * Teachers, students, and parents are strictly unauthorized.
 */
export function canModifySchoolBranding(role?: UserRole | string): boolean {
  if (!role) return false;
  const authorizedRoles: (UserRole | string)[] = [
    'SUPER_ADMIN',
    'SYSTEM_ADMIN',
    'HEAD_OF_INSTITUTION',
    'DEPUTY_HEAD_OF_INSTITUTION',
    'DIRECTOR_OF_ACADEMICS',
    'HEAD',
    'HEADTEACHER',
    'DEPUTY',
    'DEPUTY_HEADTEACHER',
    'DIRECTOR_ACADEMICS',
    'ADMIN',
  ];
  return authorizedRoles.includes(role);
}

/**
 * Calculates relative luminance for WCAG contrast ratio verification
 */
function getLuminance(hex: string): number {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length !== 6) return 0.5;
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const a = [r, g, b].map((v) => {
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

/**
 * Computes WCAG Contrast Ratio between two hex colors
 */
export function calculateContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return Number(((brightest + 0.05) / (darkest + 0.05)).toFixed(2));
}

/**
 * Generates an SVG Data URI Monogram Crest for a school when no custom logo is uploaded
 */
export function generateSchoolMonogramUri(
  schoolName: string,
  primaryColor: string = '#1E40AF',
  secondaryColor: string = '#3B82F6'
): string {
  const words = (schoolName || 'School').trim().split(/\s+/);
  let initials = words.slice(0, 3).map((w) => w.charAt(0).toUpperCase()).join('');
  if (initials.length === 1 && words[0].length >= 2) {
    initials = words[0].slice(0, 2).toUpperCase();
  }
  if (!initials) initials = 'SCH';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
    <defs>
      <linearGradient id="crestGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${primaryColor}"/>
        <stop offset="100%" stop-color="${secondaryColor}"/>
      </linearGradient>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.25"/>
      </filter>
    </defs>
    <rect width="200" height="200" rx="36" fill="url(#crestGrad)" filter="url(#shadow)"/>
    <rect x="12" y="12" width="176" height="176" rx="28" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-opacity="0.35" stroke-dasharray="8 4"/>
    <circle cx="100" cy="92" r="54" fill="#FFFFFF" fill-opacity="0.12"/>
    <text x="100" y="104" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="44" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">${initials}</text>
    <text x="100" y="152" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="800" fill="#FFFFFF" fill-opacity="0.95" text-anchor="middle" letter-spacing="2">EXCELLENCE</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Resolved School Theme configuration with fully computed CSS styles, gradients, and typography
 */
export interface ResolvedSchoolTheme {
  themePreset: PortalThemePreset;
  themeName: string;
  categoryLabel: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  headerGradientClass: string;
  headerFromHex: string;
  headerViaHex: string;
  headerToHex: string;
  buttonClass: string;
  badgeClass: string;
  accentBorderClass: string;
  cardBgClass: string;
  navClass: string;
  footerClass: string;
  pillActiveClass: string;
  tagColorClass: string;
  
  // Custom Dynamic Inline Styles
  headerInlineStyle: React.CSSProperties;
  buttonPrimaryStyle: React.CSSProperties;
  buttonSecondaryStyle: React.CSSProperties;
  badgeStyle: React.CSSProperties;
  borderAccentStyle: React.CSSProperties;
  
  // School Identity & Branding Assets
  schoolName: string;
  schoolCode: string;
  monogram: string;
  address: string;
  phone: string;
  email: string;
  motto: string;
  vision: string;
  mission: string;
  coreValues: string[];
  logoUrl: string;
  stampUrl: string;
  banners: SchoolBannerConfig;
  
  // Accessibility Verification
  contrastRatioWithWhite: number;
  isAccessible: boolean;
}

/**
 * Resolves the complete, isolated theme configuration for a given school tenant.
 * Stored under the school's tenant profile. Theme settings of one school NEVER affect another school.
 */
export function resolveSchoolTheme(
  tenant?: SchoolTenant | null,
  fallbackSchoolName: string = 'JJSAK Educational Institution'
): ResolvedSchoolTheme {
  const schoolName = tenant?.schoolName || fallbackSchoolName;
  const schoolCode = tenant?.schoolCode || 'JJSAK';
  const branding = tenant?.schoolBranding;

  // 1. Detect preset
  let presetKey: PortalThemePreset = branding?.themePreset || 'crimson';

  // If primaryColor matches an established preset, infer that preset
  if (!branding?.themePreset && branding?.primaryColor) {
    const match = Object.entries(PORTAL_THEME_PRESETS).find(
      ([, def]) => def.primaryColor.toLowerCase() === branding.primaryColor?.toLowerCase()
    );
    if (match) {
      presetKey = match[0] as PortalThemePreset;
    } else {
      presetKey = 'custom';
    }
  }

  const basePreset = PORTAL_THEME_PRESETS[presetKey] || PORTAL_THEME_PRESETS.crimson;

  const primaryColor = branding?.primaryColor || basePreset.primaryColor;
  const secondaryColor = branding?.secondaryColor || basePreset.secondaryColor;
  const backgroundColor = branding?.backgroundColor || basePreset.backgroundColor;

  const motto = branding?.motto || tenant?.motto || 'Striving for Holistic Excellence, Integrity & Leadership';
  const vision = branding?.vision || 'To be a benchmark center of competency-based junior academic excellence in Kenya.';
  const mission = branding?.mission || 'Nurturing versatile, disciplined, and technologically empowered junior learners.';
  const coreValues = branding?.coreValues || ['Integrity', 'Excellence', 'Innovation', 'Discipline', 'Respect'];

  const logoUrl =
    branding?.logoUrl ||
    tenant?.logoUrl ||
    generateSchoolMonogramUri(schoolName, primaryColor, secondaryColor);

  const stampUrl =
    branding?.stampUrl ||
    tenant?.stampUrl ||
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200';

  const banners: SchoolBannerConfig = {
    welcomeBannerText: branding?.banners?.welcomeBannerText || `Welcome to ${schoolName} Portal`,
    mottoBannerText: branding?.banners?.mottoBannerText || motto,
    visionBannerText: branding?.banners?.visionBannerText || vision,
    missionBannerText: branding?.banners?.missionBannerText || mission,
    bannerStyle: branding?.banners?.bannerStyle || 'gradient',
    bannerImageUrl: branding?.banners?.bannerImageUrl,
    showWelcomeBanner: branding?.banners?.showWelcomeBanner ?? true,
    showMottoBanner: branding?.banners?.showMottoBanner ?? true,
    showVisionBanner: branding?.banners?.showVisionBanner ?? false,
  };

  const contrastRatioWithWhite = calculateContrastRatio(primaryColor, '#FFFFFF');
  const isAccessible = contrastRatioWithWhite >= 4.5;

  const headerFromHex = basePreset.headerFromHex || primaryColor;
  const headerViaHex = basePreset.headerViaHex || primaryColor;
  const headerToHex = basePreset.headerToHex || secondaryColor;

  return {
    themePreset: presetKey,
    themeName: basePreset.name,
    categoryLabel: basePreset.categoryLabel,
    description: basePreset.description,
    primaryColor,
    secondaryColor,
    backgroundColor,
    headerGradientClass: basePreset.headerGradientClass,
    headerFromHex,
    headerViaHex,
    headerToHex,
    buttonClass: basePreset.buttonClass,
    badgeClass: basePreset.badgeClass,
    accentBorderClass: basePreset.accentBorderClass,
    cardBgClass: basePreset.cardBgClass,
    navClass: basePreset.navClass,
    footerClass: basePreset.footerClass,
    pillActiveClass: basePreset.pillActiveClass,
    tagColorClass: basePreset.tagColorClass,

    headerInlineStyle: {
      background: `linear-gradient(135deg, ${headerFromHex} 0%, ${headerViaHex} 50%, ${headerToHex} 100%)`,
    },
    buttonPrimaryStyle: {
      backgroundColor: primaryColor,
      color: '#FFFFFF',
    },
    buttonSecondaryStyle: {
      backgroundColor: secondaryColor,
      color: '#FFFFFF',
    },
    badgeStyle: {
      backgroundColor: `${primaryColor}15`,
      borderColor: `${primaryColor}40`,
      color: primaryColor,
    },
    borderAccentStyle: {
      borderColor: primaryColor,
    },

    schoolName,
    schoolCode,
    monogram: schoolName.split(' ').filter(Boolean).map(w => w[0]).slice(0, 3).join('').toUpperCase() || 'SCH',
    address: tenant?.address || tenant?.postalAddress || 'P.O. Box 450 - 30200, Kitale',
    phone: tenant?.phone || tenant?.officialPhone || '+254 722 345 678',
    email: tenant?.email || tenant?.officialEmail || 'info@school.sc.ke',
    motto,
    vision,
    mission,
    coreValues,
    logoUrl,
    stampUrl,
    banners,

    contrastRatioWithWhite,
    isAccessible,
  };
}

/**
 * Creates a brand-new default isolated branding config for newly created schools
 */
export function createDefaultSchoolBranding(
  schoolName: string,
  preset: PortalThemePreset = 'blue'
): SchoolBrandingDetails {
  const def = PORTAL_THEME_PRESETS[preset] || PORTAL_THEME_PRESETS.blue;
  return {
    themePreset: preset,
    primaryColor: def.primaryColor,
    secondaryColor: def.secondaryColor,
    backgroundColor: def.backgroundColor,
    cardColorStyle: 'clean-white',
    navMenuColorStyle: 'theme-matched',
    headerColorStyle: 'gradient',
    footerColorStyle: 'brand-accent',
    buttonColorStyle: 'brand-primary',
    motto: 'Striving for Academic Excellence and Moral Integrity',
    vision: `To be the foremost center of quality CBC junior education in the county.`,
    mission: `Equipping learners with 21st-century foundational competencies and ethical character.`,
    coreValues: ['Integrity', 'Academic Diligence', 'Creativity', 'Teamwork'],
    logoUrl: generateSchoolMonogramUri(schoolName, def.primaryColor, def.secondaryColor),
    stampUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200',
    banners: {
      welcomeBannerText: `Welcome to ${schoolName} Portal`,
      mottoBannerText: 'Smart. Simple. Accurate. Assessment reporting made easy.',
      visionBannerText: `To be the foremost center of quality CBC junior education in the county.`,
      missionBannerText: `Equipping learners with 21st-century foundational competencies and ethical character.`,
      bannerStyle: 'gradient',
      showWelcomeBanner: true,
      showMottoBanner: true,
      showVisionBanner: false,
    },
    lastModifiedAt: Date.now(),
    isApprovedBySuperAdmin: true,
  };
}
