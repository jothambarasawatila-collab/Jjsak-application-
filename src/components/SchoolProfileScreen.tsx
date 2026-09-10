import React, { useState } from 'react';
import {
  ArrowLeft,
  Save,
  Building2,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Palette,
  Image,
  Sparkles,
  Layout,
  Eye,
  Check,
  Award,
  AlertTriangle,
  CreditCard,
} from 'lucide-react';
import {
  SchoolProfile,
  SchoolTenant,
  SchoolBrandingDetails,
  PortalThemePreset,
  SchoolBannerConfig,
  User,
} from '../types';
import {
  PORTAL_THEME_PRESETS,
  canModifySchoolBranding,
  calculateContrastRatio,
  generateSchoolMonogramUri,
  resolveSchoolTheme,
} from '../utils/brandingEngine';

interface SchoolProfileScreenProps {
  schoolProfile: SchoolProfile;
  activeTenant?: SchoolTenant;
  currentUser: User;
  onNavigateToSubscriptions?: () => void;
  onSave?: (updatedProfile: SchoolProfile) => void;
  onSaveTenantBranding?: (updatedTenant: SchoolTenant) => void;
  onBack: () => void;
  onLogAudit?: (action: any, details: string) => void;
}

export const SchoolProfileScreen: React.FC<SchoolProfileScreenProps> = ({
  schoolProfile,
  activeTenant,
  currentUser,
  onNavigateToSubscriptions,
  onSave,
  onSaveTenantBranding,
  onBack,
  onLogAudit,
}) => {
  // JJSAK Policy: Only Head of Institution, Deputy Head, Director of Academics, and School Administrators may modify branding
  const isAuthorized = canModifySchoolBranding(currentUser.role);

  // Active Tab: 'IDENTITY' | 'THEME' | 'LOGOS' | 'BANNERS' | 'PREVIEW' | 'SUBSCRIPTIONS'
  const [activeTab, setActiveTab] = useState<'IDENTITY' | 'THEME' | 'LOGOS' | 'BANNERS' | 'PREVIEW' | 'SUBSCRIPTIONS'>('THEME');

  // School Identity State
  const [schoolName, setSchoolName] = useState(activeTenant?.schoolName || schoolProfile.schoolName || 'Ngonyek Junior School');
  const [schoolCode, setSchoolCode] = useState(activeTenant?.schoolCode || 'NJS-30200');
  const [county, setCounty] = useState(activeTenant?.county || schoolProfile.county || 'Trans Nzoia');
  const [subCounty, setSubCounty] = useState(activeTenant?.subCounty || schoolProfile.subCounty || 'Kiminini');
  const [ward, setWard] = useState(activeTenant?.ward || 'Sirende');
  const [postalAddress, setPostalAddress] = useState(activeTenant?.postalAddress || schoolProfile.postalAddress || 'P.O. Box 450 - 30200, Kitale');
  const [phoneNumber, setPhoneNumber] = useState(activeTenant?.phone || schoolProfile.phoneNumber || '+254 722 345 678');
  const [emailAddress, setEmailAddress] = useState(activeTenant?.email || schoolProfile.emailAddress || 'info@ngonyekjuniorschool.sc.ke');
  const [website, setWebsite] = useState(activeTenant?.website || schoolProfile.website || 'https://www.ngonyekjuniorschool.sc.ke');
  const [headTeacherName, setHeadTeacherName] = useState(schoolProfile.headTeacherName || 'Mrs. J. Barasa');

  // Institution Mission & Values
  const branding = activeTenant?.schoolBranding;
  const [motto, setMotto] = useState(branding?.motto || activeTenant?.motto || schoolProfile.motto || 'Smart. Simple. Accurate. Assessment reporting made easy.');
  const [vision, setVision] = useState(branding?.vision || 'To be a benchmark center of competency-based junior academic excellence and moral leadership.');
  const [mission, setMission] = useState(branding?.mission || 'Nurturing innovative, disciplined, and self-reliant learners through competency-based pathways.');
  const [coreValuesText, setCoreValuesText] = useState(
    branding?.coreValues?.join(', ') || 'Integrity, Academic Excellence, Diligence, Innovation, Respect'
  );

  // Portal Theme & Colors
  const [themePreset, setThemePreset] = useState<PortalThemePreset>(branding?.themePreset || 'maroon');
  const [primaryColor, setPrimaryColor] = useState<string>(
    branding?.primaryColor || PORTAL_THEME_PRESETS[branding?.themePreset || 'maroon']?.primaryColor || '#881337'
  );
  const [secondaryColor, setSecondaryColor] = useState<string>(
    branding?.secondaryColor || PORTAL_THEME_PRESETS[branding?.themePreset || 'maroon']?.secondaryColor || '#E11D48'
  );
  const [backgroundColor, setBackgroundColor] = useState<string>(
    branding?.backgroundColor || PORTAL_THEME_PRESETS[branding?.themePreset || 'maroon']?.backgroundColor || '#FFF1F2'
  );
  const [cardColorStyle, setCardColorStyle] = useState<'clean-white' | 'tinted' | 'bordered' | 'contrast'>(
    branding?.cardColorStyle || 'clean-white'
  );
  const [navMenuColorStyle, setNavMenuColorStyle] = useState<'theme-matched' | 'midnight-slate' | 'deep-solid' | 'minimal-white'>(
    branding?.navMenuColorStyle || 'theme-matched'
  );
  const [headerColorStyle, setHeaderColorStyle] = useState<'gradient' | 'solid' | 'clean-light' | 'dark-institutional'>(
    branding?.headerColorStyle || 'gradient'
  );
  const [buttonColorStyle, setButtonColorStyle] = useState<'brand-primary' | 'brand-gradient' | 'dark-contrast'>(
    branding?.buttonColorStyle || 'brand-primary'
  );

  // Logos & Digital Stamps
  const [logoUrl, setLogoUrl] = useState(branding?.logoUrl || activeTenant?.logoUrl || schoolProfile.schoolLogoUri || '');
  const [stampUrl, setStampUrl] = useState(
    branding?.stampUrl || activeTenant?.stampUrl || schoolProfile.schoolStampUri || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200'
  );

  // Banners
  const [welcomeBannerText, setWelcomeBannerText] = useState(
    branding?.banners?.welcomeBannerText || `Welcome to ${schoolName} Portal - Striving for Excellence`
  );
  const [mottoBannerText, setMottoBannerText] = useState(branding?.banners?.mottoBannerText || motto);
  const [visionBannerText, setVisionBannerText] = useState(branding?.banners?.visionBannerText || vision);
  const [missionBannerText, setMissionBannerText] = useState(branding?.banners?.missionBannerText || mission);
  const [bannerStyle, setBannerStyle] = useState<'gradient' | 'solid' | 'pattern' | 'modern'>(
    branding?.banners?.bannerStyle || 'gradient'
  );
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(branding?.banners?.showWelcomeBanner ?? true);
  const [showMottoBanner, setShowMottoBanner] = useState(branding?.banners?.showMottoBanner ?? true);
  const [showVisionBanner, setShowVisionBanner] = useState(branding?.banners?.showVisionBanner ?? false);

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [previewRole, setPreviewRole] = useState<'admin' | 'teacher' | 'learner' | 'parent'>('admin');

  // Handle Preset Change
  const handleSelectPreset = (presetKey: PortalThemePreset) => {
    setThemePreset(presetKey);
    const def = PORTAL_THEME_PRESETS[presetKey];
    if (def) {
      setPrimaryColor(def.primaryColor);
      setSecondaryColor(def.secondaryColor);
      setBackgroundColor(def.backgroundColor);
    }
  };

  // Contrast Calculation
  const contrastRatio = calculateContrastRatio(primaryColor, '#FFFFFF');
  const isAccessible = contrastRatio >= 4.5;

  // Auto Generate Monogram
  const handleGenerateMonogram = () => {
    const monogram = generateSchoolMonogramUri(schoolName, primaryColor, secondaryColor);
    setLogoUrl(monogram);
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthorized) return;

    const coreValues = coreValuesText
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const bannerConfig: SchoolBannerConfig = {
      welcomeBannerText: welcomeBannerText.trim(),
      mottoBannerText: mottoBannerText.trim(),
      visionBannerText: visionBannerText.trim(),
      missionBannerText: missionBannerText.trim(),
      bannerStyle,
      showWelcomeBanner,
      showMottoBanner,
      showVisionBanner,
    };

    const updatedBranding: SchoolBrandingDetails = {
      themePreset,
      primaryColor,
      secondaryColor,
      backgroundColor,
      cardColorStyle,
      navMenuColorStyle,
      headerColorStyle,
      buttonColorStyle,
      logoUrl: logoUrl.trim(),
      stampUrl: stampUrl.trim(),
      motto: motto.trim(),
      vision: vision.trim(),
      mission: mission.trim(),
      coreValues,
      banners: bannerConfig,
      lastModifiedBy: `${currentUser.fullName} (${currentUser.role})`,
      lastModifiedRole: currentUser.role,
      lastModifiedAt: Date.now(),
      isApprovedBySuperAdmin: true,
    };

    // 1. Update SchoolProfile
    const updatedProfile: SchoolProfile = {
      ...schoolProfile,
      schoolName: schoolName.trim(),
      motto: motto.trim(),
      county: county.trim(),
      subCounty: subCounty.trim(),
      postalAddress: postalAddress.trim(),
      phoneNumber: phoneNumber.trim(),
      emailAddress: emailAddress.trim(),
      website: website.trim(),
      headTeacherName: headTeacherName.trim(),
      schoolLogoUri: logoUrl.trim(),
      schoolStampUri: stampUrl.trim(),
      lastUpdated: Date.now(),
    };

    if (onSave) {
      onSave(updatedProfile);
    }

    // 2. Update SchoolTenant with complete isolated branding
    if (activeTenant && onSaveTenantBranding) {
      const updatedTenant: SchoolTenant = {
        ...activeTenant,
        schoolName: schoolName.trim(),
        schoolCode: schoolCode.trim().toUpperCase(),
        county: county.trim(),
        subCounty: subCounty.trim(),
        ward: ward.trim(),
        postalAddress: postalAddress.trim(),
        address: postalAddress.trim(),
        phone: phoneNumber.trim(),
        officialPhone: phoneNumber.trim(),
        email: emailAddress.trim(),
        officialEmail: emailAddress.trim(),
        website: website.trim(),
        motto: motto.trim(),
        logoUrl: logoUrl.trim(),
        stampUrl: stampUrl.trim(),
        schoolBranding: updatedBranding,
      };
      onSaveTenantBranding(updatedTenant);
    }

    onLogAudit?.(
      'RECORD_EDIT',
      `Modified school branding & portal theme for [${schoolName}] (${schoolCode}). Theme: ${themePreset} (Primary: ${primaryColor}).`
    );

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  // Active computed theme for live preview
  const previewTheme = resolveSchoolTheme({
    schoolId: activeTenant?.schoolId || 'sch-preview',
    schoolCode,
    schoolName,
    address: postalAddress,
    phone: phoneNumber,
    email: emailAddress,
    category: 'JUNIOR',
    status: 'ACTIVE',
    schoolBranding: {
      themePreset,
      primaryColor,
      secondaryColor,
      backgroundColor,
      cardColorStyle,
      navMenuColorStyle,
      headerColorStyle,
      buttonColorStyle,
      logoUrl,
      stampUrl,
      motto,
      vision,
      mission,
      banners: {
        welcomeBannerText,
        mottoBannerText,
        visionBannerText,
        missionBannerText,
        bannerStyle,
        showWelcomeBanner,
        showMottoBanner,
        showVisionBanner,
      },
    },
  });

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col pb-28 select-none">
      {/* Top Red Header Bar */}
      <div
        className="text-white pt-4 pb-5 px-4 sm:px-6 shadow-md rounded-b-[24px] transition-all duration-300"
        style={previewTheme.headerInlineStyle}
      >
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 flex items-center justify-center transition cursor-pointer"
            title="Back to Home"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="text-center">
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center justify-center gap-2">
              <Palette className="w-5 h-5" />
              <span>School Portal Theme &amp; Branding</span>
            </h1>
            <span className="text-[11px] text-white/80 font-medium">
              Isolated Multi-Tenant Identity &amp; Visual Configuration
            </span>
          </div>
          <div className="w-9 h-9" />
        </div>

        {/* School Tenant Isolation Pill */}
        <div className="mt-3 flex items-center justify-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/25 backdrop-blur-xs border border-white/20 text-white text-[11px] font-bold">
            <Building2 className="w-3.5 h-3.5 text-white" />
            <span>Active Tenant:</span>
            <span className="text-white font-extrabold underline decoration-white/40">
              {schoolName}
            </span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/20 border border-white/30">
              ID: {activeTenant?.schoolId || 'sch-ngonyek-001'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-4 py-4 sm:px-6 max-w-4xl mx-auto w-full space-y-4">
        {/* Save Toast Notification */}
        {saveSuccess && (
          <div className="p-3.5 bg-emerald-600 text-white rounded-2xl shadow-lg flex items-center gap-2.5 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>
              ✓ School portal branding saved successfully! Changes are strictly isolated to {schoolName} and will not affect any other school portal.
            </span>
          </div>
        )}

        {/* Role Authorization Guard */}
        {isAuthorized ? (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-emerald-950 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="leading-tight">
              <span className="font-bold">Authorized Leadership Mode: </span>
              Logged in as <span className="font-bold">{currentUser.fullName}</span> ({currentUser.role}). Authorized to customize institutional themes, colors, logos, and banners.
            </div>
          </div>
        ) : (
          <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-2.5 text-amber-950 text-xs shadow-xs">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-extrabold text-amber-900 block mb-0.5">Policy Notice: Institutional Branding Protected</span>
              Under the JJSAK Branding Policy, only the <span className="font-bold">Head of Institution</span>, <span className="font-bold">Deputy Head</span>, <span className="font-bold">Director of Academics</span>, and <span className="font-bold">School Administrators</span> may modify school portal visual identity. Your current role ({currentUser.role}) is in read-only preview mode.
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-xs flex items-center gap-1 overflow-x-auto">
          {[
            { id: 'THEME', label: '1. Portal Theme & Colors', icon: Palette },
            { id: 'LOGOS', label: '2. Logos & Stamps', icon: Image },
            { id: 'BANNERS', label: '3. Portal Banners', icon: Layout },
            { id: 'IDENTITY', label: '4. School Details', icon: Building2 },
            { id: 'PREVIEW', label: '5. Live Portal Preview', icon: Eye },
            { id: 'SUBSCRIPTIONS', label: '6. Subscriptions', icon: CreditCard },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  if (tab.id === 'SUBSCRIPTIONS' && onNavigateToSubscriptions) {
                    onNavigateToSubscriptions();
                  } else {
                    setActiveTab(tab.id as any);
                  }
                }}
                className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSaveAll} className="space-y-4">
          {/* TAB 1: PORTAL THEME & COLORS */}
          {activeTab === 'THEME' && (
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-blue-600" />
                    <span>School Background Colour &amp; Portal Theme</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Select an official portal theme preset or configure custom school colors.
                  </p>
                </div>
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                  Theme Isolation Active
                </span>
              </div>

              {/* Presets Grid */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-2">
                  Official School Theme Presets
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {(Object.keys(PORTAL_THEME_PRESETS) as PortalThemePreset[]).map((key) => {
                    const preset = PORTAL_THEME_PRESETS[key];
                    const isSelected = themePreset === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleSelectPreset(key)}
                        disabled={!isAuthorized}
                        className={`p-3 rounded-xl border-2 text-left transition flex flex-col justify-between gap-2 cursor-pointer ${
                          isSelected
                            ? 'border-slate-900 bg-slate-50/80 shadow-xs ring-2 ring-slate-900/10'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                        } ${!isAuthorized ? 'opacity-80 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">
                            {preset.name}
                          </span>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </div>

                        {/* Color Swatch Bar */}
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-6 h-6 rounded-lg border border-black/10 shadow-2xs shrink-0"
                            style={{ backgroundColor: preset.primaryColor }}
                            title={`Primary: ${preset.primaryColor}`}
                          />
                          <div
                            className="w-6 h-6 rounded-lg border border-black/10 shadow-2xs shrink-0"
                            style={{ backgroundColor: preset.secondaryColor }}
                            title={`Secondary: ${preset.secondaryColor}`}
                          />
                          <div
                            className="w-6 h-6 rounded-lg border border-slate-300 shadow-2xs shrink-0"
                            style={{ backgroundColor: preset.backgroundColor }}
                            title={`Background: ${preset.backgroundColor}`}
                          />
                          <span className="text-[10px] text-slate-500 font-mono ml-auto">
                            {preset.primaryColor}
                          </span>
                        </div>

                        <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                          {preset.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Color Pickers & Contrast Gauge */}
              <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Primary Brand Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => {
                        setPrimaryColor(e.target.value);
                        setThemePreset('custom');
                      }}
                      disabled={!isAuthorized}
                      className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer p-0.5 bg-white"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => {
                        setPrimaryColor(e.target.value);
                        setThemePreset('custom');
                      }}
                      disabled={!isAuthorized}
                      className="flex-1 px-3 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Secondary Accent Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => {
                        setSecondaryColor(e.target.value);
                        setThemePreset('custom');
                      }}
                      disabled={!isAuthorized}
                      className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer p-0.5 bg-white"
                    />
                    <input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => {
                        setSecondaryColor(e.target.value);
                        setThemePreset('custom');
                      }}
                      disabled={!isAuthorized}
                      className="flex-1 px-3 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Portal Background Tone
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => {
                        setBackgroundColor(e.target.value);
                        setThemePreset('custom');
                      }}
                      disabled={!isAuthorized}
                      className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer p-0.5 bg-white"
                    />
                    <input
                      type="text"
                      value={backgroundColor}
                      onChange={(e) => {
                        setBackgroundColor(e.target.value);
                        setThemePreset('custom');
                      }}
                      disabled={!isAuthorized}
                      className="flex-1 px-3 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Accessibility Contrast Meter */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-slate-700" />
                  <div>
                    <span className="font-bold text-slate-900">WCAG Text Contrast Ratio: </span>
                    <span className="font-mono font-bold">{contrastRatio}:1 with white headers</span>
                  </div>
                </div>
                {isAccessible ? (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[11px] flex items-center gap-1 border border-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Compliant (AA 4.5:1)
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-extrabold text-[11px] flex items-center gap-1 border border-amber-300">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Low Contrast Notice
                  </span>
                )}
              </div>

              {/* Dashboard Element Styles */}
              <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Header Gradient Style
                  </label>
                  <select
                    value={headerColorStyle}
                    onChange={(e) => setHeaderColorStyle(e.target.value as any)}
                    disabled={!isAuthorized}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium cursor-pointer"
                  >
                    <option value="gradient">Rich School Gradient (Recommended)</option>
                    <option value="solid">Solid Brand Color</option>
                    <option value="clean-light">Clean Light Accent</option>
                    <option value="dark-institutional">Deep Midnight Institutional</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Card Background Style
                  </label>
                  <select
                    value={cardColorStyle}
                    onChange={(e) => setCardColorStyle(e.target.value as any)}
                    disabled={!isAuthorized}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium cursor-pointer"
                  >
                    <option value="clean-white">Pure Clean White with Accent Borders</option>
                    <option value="tinted">Subtle School Tint Background</option>
                    <option value="bordered">High Contrast Bold Borders</option>
                    <option value="contrast">Modern Slate Card</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Navigation Menu Style
                  </label>
                  <select
                    value={navMenuColorStyle}
                    onChange={(e) => setNavMenuColorStyle(e.target.value as any)}
                    disabled={!isAuthorized}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium cursor-pointer"
                  >
                    <option value="theme-matched">Theme Matched Accent</option>
                    <option value="midnight-slate">Midnight Slate</option>
                    <option value="deep-solid">Deep Solid Brand Color</option>
                    <option value="minimal-white">Minimal White</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Action Button Style
                  </label>
                  <select
                    value={buttonColorStyle}
                    onChange={(e) => setButtonColorStyle(e.target.value as any)}
                    disabled={!isAuthorized}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium cursor-pointer"
                  >
                    <option value="brand-primary">Brand Primary Solid</option>
                    <option value="brand-gradient">Brand Dynamic Gradient</option>
                    <option value="dark-contrast">Dark High-Contrast Slate</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LOGOS & DIGITAL STAMPS */}
          {activeTab === 'LOGOS' && (
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Image className="w-4 h-4 text-emerald-600" />
                    <span>Official School Logo &amp; Digital Stamp</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Appears across dashboards, official report cards, result slips, and fee statements.
                  </p>
                </div>
              </div>

              {/* Logo Preview & Uploader */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <label className="text-xs font-bold text-slate-800 block">
                    Official School Logo / Crest
                  </label>

                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 shadow-xs p-2 flex items-center justify-center shrink-0">
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt="School Logo"
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div
                          className="w-full h-full rounded-xl flex items-center justify-center font-black text-white text-sm"
                          style={{ backgroundColor: primaryColor }}
                        >
                          {schoolName.slice(0, 3).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5 flex-1">
                      <button
                        type="button"
                        onClick={handleGenerateMonogram}
                        disabled={!isAuthorized}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Auto-Generate Crest in Theme Colors</span>
                      </button>
                      <p className="text-[10px] text-slate-500">
                        Generates a crisp institutional SVG monogram badge matching {primaryColor}.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Logo Image URL / Base64 Data
                    </label>
                    <input
                      type="text"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      disabled={!isAuthorized}
                      placeholder="https://.../school-crest.png"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-mono"
                    />
                  </div>
                </div>

                {/* Digital Stamp */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <label className="text-xs font-bold text-slate-800 block">
                    Official Institution Digital Stamp
                  </label>

                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 shadow-xs p-2 flex items-center justify-center shrink-0">
                      {stampUrl ? (
                        <img
                          src={stampUrl}
                          alt="Official Stamp"
                          className="w-full h-full object-contain mix-blend-multiply"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full border-2 border-dashed border-red-400 flex items-center justify-center text-[9px] font-bold text-red-600 text-center">
                          STAMP
                        </div>
                      )}
                    </div>

                    <div className="space-y-1 flex-1">
                      <span className="text-xs font-bold text-slate-900 block">Official Seal Protection</span>
                      <p className="text-[10px] text-slate-500">
                        Applied to printable term assessment report cards, transcripts, and leaving certificates.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Stamp Image URL
                    </label>
                    <input
                      type="text"
                      value={stampUrl}
                      onChange={(e) => setStampUrl(e.target.value)}
                      disabled={!isAuthorized}
                      placeholder="https://.../official-stamp.png"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PORTAL BANNERS */}
          {activeTab === 'BANNERS' && (
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Layout className="w-4 h-4 text-purple-600" />
                    <span>School Welcome, Motto &amp; Vision Banners</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Displayed at the top of the portal dashboard for students, teachers, and parents.
                  </p>
                </div>
              </div>

              {/* Welcome Banner Preview */}
              <div
                className="p-4 rounded-2xl text-white shadow-sm flex items-center justify-between gap-3 transition-all"
                style={{
                  background:
                    bannerStyle === 'gradient'
                      ? `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
                      : primaryColor,
                }}
              >
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-white/80 block">
                    Welcome Banner Preview
                  </span>
                  <h3 className="text-base font-black text-white mt-0.5">
                    {welcomeBannerText}
                  </h3>
                  <p className="text-xs text-white/90 font-medium mt-1">
                    "{mottoBannerText}"
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/20">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Welcome Banner Headline
                  </label>
                  <input
                    type="text"
                    value={welcomeBannerText}
                    onChange={(e) => setWelcomeBannerText(e.target.value)}
                    disabled={!isAuthorized}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Motto Banner Text
                  </label>
                  <input
                    type="text"
                    value={mottoBannerText}
                    onChange={(e) => setMottoBannerText(e.target.value)}
                    disabled={!isAuthorized}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Institutional Vision Banner Text
                  </label>
                  <input
                    type="text"
                    value={visionBannerText}
                    onChange={(e) => setVisionBannerText(e.target.value)}
                    disabled={!isAuthorized}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Mission Announcement Banner Text
                  </label>
                  <input
                    type="text"
                    value={missionBannerText}
                    onChange={(e) => setMissionBannerText(e.target.value)}
                    disabled={!isAuthorized}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>

                <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Banner Visual Presentation
                    </label>
                    <select
                      value={bannerStyle}
                      onChange={(e) => setBannerStyle(e.target.value as any)}
                      disabled={!isAuthorized}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    >
                      <option value="gradient">Themed Multi-Color Gradient</option>
                      <option value="solid">Solid Primary Color</option>
                      <option value="modern">Modern Clean White Card</option>
                    </select>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-5">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showWelcomeBanner}
                        onChange={(e) => setShowWelcomeBanner(e.target.checked)}
                        disabled={!isAuthorized}
                        className="w-4 h-4 rounded text-blue-600"
                      />
                      <span>Welcome Banner</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showMottoBanner}
                        onChange={(e) => setShowMottoBanner(e.target.checked)}
                        disabled={!isAuthorized}
                        className="w-4 h-4 rounded text-blue-600"
                      />
                      <span>Motto Banner</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showVisionBanner}
                        onChange={(e) => setShowVisionBanner(e.target.checked)}
                        disabled={!isAuthorized}
                        className="w-4 h-4 rounded text-blue-600"
                      />
                      <span>Vision Banner</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SCHOOL DETAILS */}
          {activeTab === 'IDENTITY' && (
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-amber-600" />
                    <span>School Identity, Address &amp; Contact Records</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Official registered institution metadata.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    School Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    disabled={!isAuthorized}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    School Code (MoE / KNEC)
                  </label>
                  <input
                    type="text"
                    value={schoolCode}
                    onChange={(e) => setSchoolCode(e.target.value)}
                    disabled={!isAuthorized}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold uppercase"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    County
                  </label>
                  <input
                    type="text"
                    value={county}
                    onChange={(e) => setCounty(e.target.value)}
                    disabled={!isAuthorized}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Sub-County
                  </label>
                  <input
                    type="text"
                    value={subCounty}
                    onChange={(e) => setSubCounty(e.target.value)}
                    disabled={!isAuthorized}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Ward / Electoral Area
                  </label>
                  <input
                    type="text"
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    disabled={!isAuthorized}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Official Website URL
                  </label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    disabled={!isAuthorized}
                    placeholder="https://www.yourschool.sc.ke"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Official Postal Address
                  </label>
                  <input
                    type="text"
                    value={postalAddress}
                    onChange={(e) => setPostalAddress(e.target.value)}
                    disabled={!isAuthorized}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Official Phone Number
                  </label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={!isAuthorized}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Official Email Address
                  </label>
                  <input
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    disabled={!isAuthorized}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    School Motto
                  </label>
                  <input
                    type="text"
                    value={motto}
                    onChange={(e) => setMotto(e.target.value)}
                    disabled={!isAuthorized}
                    placeholder="e.g. Striving for Excellence and Integrity"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    School Vision
                  </label>
                  <input
                    type="text"
                    value={vision}
                    onChange={(e) => setVision(e.target.value)}
                    disabled={!isAuthorized}
                    placeholder="e.g. To be a benchmark center of competency-based academic excellence"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    School Mission
                  </label>
                  <input
                    type="text"
                    value={mission}
                    onChange={(e) => setMission(e.target.value)}
                    disabled={!isAuthorized}
                    placeholder="e.g. Nurturing innovative and disciplined junior learners"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Head of Institution (Principal / Headteacher)
                  </label>
                  <input
                    type="text"
                    value={headTeacherName}
                    onChange={(e) => setHeadTeacherName(e.target.value)}
                    disabled={!isAuthorized}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Core Institutional Values (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={coreValuesText}
                    onChange={(e) => setCoreValuesText(e.target.value)}
                    disabled={!isAuthorized}
                    placeholder="Integrity, Academic Excellence, Diligence, Respect"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: LIVE PORTAL PREVIEW */}
          {activeTab === 'PREVIEW' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-black text-slate-900">
                    Live Portal Interactive Mockup
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    This preview shows exactly how {schoolName} will look across roles with current theme: <span className="font-bold text-slate-800">{previewTheme.themeName}</span>.
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  {(['admin', 'teacher', 'learner', 'parent'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setPreviewRole(r)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold capitalize transition cursor-pointer ${
                        previewRole === r ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Portal Mockup Frame */}
              <div
                className="rounded-3xl border-4 border-slate-800 shadow-xl overflow-hidden"
                style={{ backgroundColor }}
              >
                {/* Header Mockup */}
                <div className="p-4 text-white" style={previewTheme.headerInlineStyle}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-white/80 font-bold block">
                        JJSAK PORTAL • {schoolCode}
                      </span>
                      <h2 className="text-lg font-black tracking-tight text-white">
                        {schoolName}
                      </h2>
                      <p className="text-[11px] text-white/90 font-medium italic mt-0.5">
                        "{motto}"
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-white p-1 shadow-md flex items-center justify-center shrink-0">
                      {logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                      ) : (
                        <div
                          className="w-full h-full rounded-lg flex items-center justify-center text-[10px] font-black text-white"
                          style={{ backgroundColor: primaryColor }}
                        >
                          {schoolName.slice(0, 3).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Body Mockup */}
                <div className="p-4 space-y-3">
                  {showWelcomeBanner && (
                    <div
                      className="p-3.5 rounded-2xl text-white shadow-xs flex items-center justify-between"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <div>
                        <span className="text-[9px] font-extrabold uppercase text-white/80">Active Session: Term 2, 2026</span>
                        <h4 className="text-xs font-black text-white">{welcomeBannerText}</h4>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 font-bold">
                        {previewRole.toUpperCase()} PORTAL
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
                      <span className="text-[10px] font-bold text-slate-500">Learners Enrolled</span>
                      <span className="text-base font-black text-slate-900 block">256</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full" style={previewTheme.badgeStyle}>
                        Grade 7, 8, 9
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
                      <span className="text-[10px] font-bold text-slate-500">Official Mean</span>
                      <span className="text-base font-black text-slate-900 block">85.4%</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full" style={previewTheme.badgeStyle}>
                        ME1 (Meeting)
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="w-full py-2.5 rounded-xl font-bold text-xs shadow-xs transition"
                    style={previewTheme.buttonPrimaryStyle}
                  >
                    Action Button in Theme Style
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SUBSCRIPTIONS & LICENSING (JJSAK Framework) */}
          {activeTab === 'SUBSCRIPTIONS' && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#C51E28]" />
                    <span>Approved JJSAK Subscription Framework</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Learner-based licensing: KES 60 / learner / year with 1-term free trial for newly activated schools.
                  </p>
                </div>
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Tenant Isolated
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 space-y-1">
                  <span className="text-[10px] font-bold text-blue-800 uppercase block">1. Free Trial Period</span>
                  <span className="text-sm font-black text-blue-950 block">1 School Term (120 Days)</span>
                  <span className="text-[10px] text-blue-700 block">0 charges applied during approved trial.</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">2. Launch Rate</span>
                  <span className="text-sm font-black text-[#C51E28] block">KES 60.00 / Learner / Year</span>
                  <span className="text-[10px] text-slate-500 block">Based on registered active learners.</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">3. Payment Options</span>
                  <span className="text-sm font-black text-slate-900 block">Annual (100%) or Termly</span>
                  <span className="text-[10px] text-slate-500 block">Term 1: 40%, Term 2: 40%, Term 3: 20%</span>
                </div>
              </div>

              {onNavigateToSubscriptions && (
                <div className="p-4 bg-red-50/60 rounded-xl border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Manage Invoices, Verified Receipts &amp; Balances
                    </h4>
                    <p className="text-[11px] text-slate-600">
                      Access official printable invoices, real-time M-Pesa &amp; Bank verification, and audit logs for {schoolName}.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onNavigateToSubscriptions}
                    className="px-4 py-2 bg-[#C51E28] hover:bg-[#B31821] text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <span>Open Subscriptions Module</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Action Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between gap-3">
            <div className="text-xs text-slate-500 font-medium">
              {isAuthorized ? (
                <span>All changes apply exclusively to <strong className="text-slate-800">{schoolName}</strong>.</span>
              ) : (
                <span className="text-amber-700 font-semibold">Editing locked: Administrative or Leadership role required.</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onBack}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              {isAuthorized && (
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-md active:scale-95"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Save className="w-4 h-4" />
                  <span>Save School Branding</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
