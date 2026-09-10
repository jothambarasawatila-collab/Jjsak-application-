import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  SkipForward,
  Building,
  Target,
  Compass,
  UserCheck,
  CheckCircle2,
  ShieldCheck,
  Award,
  Users,
  BookOpen,
  GraduationCap,
  Calendar,
  DollarSign,
  MessageSquare,
  FileCheck,
  BarChart3,
  Layers,
  Camera,
  Cloud,
  Send,
} from 'lucide-react';
import { BrandLogo } from '../BrandLogo';

interface OrganizationalProfileScreenProps {
  onContinueToLogin: () => void;
}

export const OrganizationalProfileScreen: React.FC<OrganizationalProfileScreenProps> = ({
  onContinueToLogin,
}) => {
  const [activeCard, setActiveCard] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [slideProgress, setSlideProgress] = useState<number>(0);
  const [activeFooterModal, setActiveFooterModal] = useState<'NONE' | 'HELP' | 'PRIVACY' | 'TERMS'>('NONE');

  const TOTAL_CARDS = 6;
  const SLIDE_DURATION_MS = 5000;
  const TICK_MS = 50;

  // Auto-Sliding 5-Second Carousel Logic
  useEffect(() => {
    if (!isPlaying) {
      setSlideProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setSlideProgress((prev) => {
        const next = prev + (TICK_MS / SLIDE_DURATION_MS) * 100;
        if (next >= 100) {
          setActiveCard((curr) => (curr + 1) % TOTAL_CARDS);
          return 0;
        }
        return next;
      });
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [isPlaying, activeCard]);

  const handleNext = () => {
    setActiveCard((prev) => (prev + 1) % TOTAL_CARDS);
    setSlideProgress(0);
  };

  const handlePrev = () => {
    setActiveCard((prev) => (prev === 0 ? TOTAL_CARDS - 1 : prev - 1));
    setSlideProgress(0);
  };

  const handleSelectCard = (index: number) => {
    setActiveCard(index);
    setSlideProgress(0);
  };

  // Touch Swipe Handlers for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
  };

  // 10 Core Values
  const coreValues = [
    { title: 'Integrity', desc: 'Upholding honesty, ethical standards, and uncompromised data fidelity across all operations.' },
    { title: 'Excellence', desc: 'Delivering highest standard institutional management software with zero downtime.' },
    { title: 'Accountability', desc: 'Traceable audit trails for every academic, administrative, and financial transaction.' },
    { title: 'Innovation', desc: 'Continuous advancement through modern technology and intelligent automation.' },
    { title: 'Transparency', desc: 'Clear reporting and auditable school administration records accessible to authorized roles.' },
    { title: 'Security', desc: 'Multi-tenant data isolation and role-based access control protecting school records.' },
    { title: 'Professionalism', desc: 'Adhering to national curricula and professional educational management standards.' },
    { title: 'Inclusivity', desc: 'Empowering every learner with individualized pathway diagnostics and welfare tracking.' },
    { title: 'Collaboration', desc: 'Connecting teachers, school heads, education officers, and parents in real time.' },
    { title: 'Continuous Improvement', desc: 'Ongoing platform refinements driven by school feedback and academic analytics.' },
  ];

  // 15 Services Offered
  const servicesOffered = [
    { title: 'School Management', desc: 'Institution profile, academic structure & stream hierarchy', icon: Building },
    { title: 'Learner Management', desc: 'Complete admission, enrollment, bio-data & NEMIS records', icon: Users },
    { title: 'Staff Management', desc: 'Teacher profiles, TSC credentials & teaching workload', icon: UserCheck },
    { title: 'CBC/CBE Assessment Management', desc: 'Rubric scoring, strand tracking & mastery evaluations', icon: BookOpen },
    { title: 'Examination Management', desc: 'Summative exams, CATs, grade ranking & score conversion', icon: GraduationCap },
    { title: 'Academic Reporting', desc: 'Automated CBC report cards & official institution dossiers', icon: FileCheck },
    { title: 'Attendance Tracking', desc: 'Daily registers, roll calls & automated absentee alerts', icon: Calendar },
    { title: 'Timetable Management', desc: 'Conflict-free master scheduling & period allocations', icon: Calendar },
    { title: 'Financial Management', desc: 'Fee collections, vote heads, invoices & revenue tracking', icon: DollarSign },
    { title: 'Parent Communication', desc: 'Real-time parent portal, engagement audits & broadcast logs', icon: MessageSquare },
    { title: 'SMS, Email & WhatsApp Notifications', desc: 'Instant alerts for exam marks, fee receipts & urgent notices', icon: Send },
    { title: 'Analytics & Performance Insights', desc: 'Subject trends, class performance curves & predictive metrics', icon: BarChart3 },
    { title: 'Secure Multi-School Management', desc: 'Multi-tenant isolation ensuring 100% private school data', icon: Layers },
    { title: 'OCR-Based Data Capture', desc: 'Camera scanning of printed marksheets & instant digitization', icon: Camera },
    { title: 'Cloud-Based Educational Solutions', desc: 'High availability, resilient cloud sync & daily backups', icon: Cloud },
  ];

  return (
    <div
      className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-x-hidden selection:bg-red-500 selection:text-white"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Dynamic Background Ambient Light */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-red-700/20 via-red-950/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -left-40 w-96 h-96 bg-blue-900/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 -right-40 w-96 h-96 bg-amber-900/10 blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-10 w-full border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BrandLogo size="sm" showText={true} />
          <span className="hidden sm:inline-block text-[11px] font-bold text-slate-400 border-l border-slate-700 pl-3">
            Welcome & Organizational Profile
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onContinueToLogin}
            className="px-3.5 py-1.5 rounded-full bg-red-600/20 hover:bg-red-600/40 border border-red-500/40 text-red-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Skip directly to JJSAK Login"
          >
            <span>Skip to Login</span>
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Carousel Presentation Container */}
      <main className="relative z-10 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex-1 flex flex-col items-center justify-center space-y-6">
        {/* Navigation Dots & Carousel Controls */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-red-400">
              CARD {activeCard + 1} OF {TOTAL_CARDS}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs font-bold text-slate-300">
              {activeCard === 0 && 'Organization Name & Motto'}
              {activeCard === 1 && 'Vision'}
              {activeCard === 2 && 'Mission'}
              {activeCard === 3 && 'Founder & System Owner'}
              {activeCard === 4 && 'Our Core Values'}
              {activeCard === 5 && 'What JJSAK Offers (Services)'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Step Indicators */}
            <div className="flex items-center gap-1.5">
              {Array.from({ length: TOTAL_CARDS }).map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectCard(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    activeCard === idx
                      ? 'w-7 bg-red-500 shadow-md shadow-red-500/50'
                      : 'w-2 bg-slate-700 hover:bg-slate-600'
                  }`}
                  title={`Go to Card ${idx + 1}`}
                />
              ))}
            </div>

            {/* Play/Pause Auto-Slide */}
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
              title={isPlaying ? 'Pause Auto-slide' : 'Resume Auto-slide'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
              <span className="hidden sm:inline text-[10px]">{isPlaying ? '5s Timer' : 'Paused'}</span>
            </button>

            {/* Left/Right Arrow Navigation */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrev}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                title="Previous Card"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                title="Next Card"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 5-Second Linear Progress Bar */}
        {isPlaying && (
          <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-600 to-amber-500 transition-all duration-75 ease-linear"
              style={{ width: `${slideProgress}%` }}
            />
          </div>
        )}

        {/* CARD CONTAINER WITH SMOOTH ENTRY ANIMATION */}
        <div className="w-full min-h-[380px] sm:min-h-[420px] flex items-center justify-center">
          {/* ───────────────────────────────────────────────────────────
              CARD 1 — ORGANIZATION NAME & MOTTO
             ─────────────────────────────────────────────────────────── */}
          {activeCard === 0 && (
            <div className="w-full p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-950 border border-slate-800 shadow-2xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-black uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5" />
                CARD 1 — ORGANIZATION NAME
              </div>

              <div className="space-y-3 max-w-3xl mx-auto">
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white">
                  JJSAK Education Management Platform
                </h1>

                <div className="py-3 px-6 rounded-2xl bg-red-950/40 border border-red-800/40 inline-block max-w-2xl">
                  <div className="text-xs font-bold uppercase tracking-wider text-red-400 mb-1">
                    Official Motto:
                  </div>
                  <div className="text-lg sm:text-2xl font-serif italic text-red-200 font-semibold tracking-wide">
                    "Every Learner Matters, Every Achievement Counts."
                  </div>
                </div>

                <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed pt-2">
                  A comprehensive educational management platform designed to transform school management through innovation, security, and intelligence.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700">
                  CBC / CBE Standard Compliant
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700">
                  End-to-End Encryption
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700">
                  Cloud Multi-School Architecture
                </span>
              </div>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────
              CARD 2 — VISION
             ─────────────────────────────────────────────────────────── */}
          {activeCard === 1 && (
            <div className="w-full p-6 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-950 border border-slate-800 shadow-2xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-black uppercase tracking-widest">
                <Target className="w-3.5 h-3.5" />
                CARD 2 — VISION
              </div>

              <div className="w-16 h-16 rounded-3xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto shadow-lg">
                <Target className="w-8 h-8" />
              </div>

              <div className="space-y-4 max-w-2xl mx-auto">
                <h2 className="text-2xl sm:text-4xl font-black text-white">
                  Vision
                </h2>
                <p className="text-xl sm:text-3xl font-serif italic text-blue-200 font-bold leading-snug">
                  "To become the most trusted educational management platform in the world."
                </p>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed pt-2">
                  Driving transformative, scalable educational governance that simplifies institutional workflows and elevates learning standards globally.
                </p>
              </div>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────
              CARD 3 — MISSION
             ─────────────────────────────────────────────────────────── */}
          {activeCard === 2 && (
            <div className="w-full p-6 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-950 border border-slate-800 shadow-2xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-widest">
                <Compass className="w-3.5 h-3.5" />
                CARD 3 — MISSION
              </div>

              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
                <Compass className="w-8 h-8" />
              </div>

              <div className="space-y-4 max-w-2xl mx-auto">
                <h2 className="text-2xl sm:text-4xl font-black text-white">
                  Mission
                </h2>
                <p className="text-lg sm:text-2xl font-serif text-emerald-200 font-semibold leading-relaxed">
                  "To empower educational institutions through secure, innovative, intelligent, and data-driven management solutions that enhance learning outcomes, operational excellence, and institutional growth."
                </p>
              </div>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────
              CARD 4 — FOUNDER & OWNER
             ─────────────────────────────────────────────────────────── */}
          {activeCard === 3 && (
            <div className="w-full p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-950 border border-slate-800 shadow-2xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-widest">
                <Award className="w-3.5 h-3.5" />
                CARD 4 — FOUNDER & OWNER
              </div>

              <div className="flex flex-col items-center space-y-3">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-red-600 to-red-900 border-2 border-red-500/40 text-white font-black text-2xl flex items-center justify-center shadow-xl shadow-red-950/50">
                  JB
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  Founder & System Owner
                </h2>
                <div className="text-sm font-bold text-red-400">
                  Jotham Barasa Watila • Super Administrator
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 max-w-2xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed text-left">
                JJSAK is founded and governed by the <strong className="text-white">System Owner (Super Administrator)</strong>, who provides strategic leadership, platform governance, architecture oversight, security standards, and continuous innovation to ensure the platform delivers value to educational institutions worldwide.
              </div>

              <div className="flex items-center justify-center gap-4 text-xs text-slate-400 font-mono">
                <span>Direct Email: jothambarasawatila@gmail.com</span>
                <span>•</span>
                <span>Tel: +254 741 478 813</span>
              </div>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────
              CARD 5 — CORE VALUES
             ─────────────────────────────────────────────────────────── */}
          {activeCard === 4 && (
            <div className="w-full p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-950 border border-slate-800 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-300">
              <div className="text-center space-y-1">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-widest">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  CARD 5 — CORE VALUES
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  Our Values
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
                {coreValues.map((v, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-900/80 transition-all space-y-1"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{v.title}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-snug">
                      {v.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────
              CARD 6 — WHAT JJSAK OFFERS (SERVICES)
             ─────────────────────────────────────────────────────────── */}
          {activeCard === 5 && (
            <div className="w-full p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-950 border border-slate-800 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-300">
              <div className="text-center space-y-1">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-black uppercase tracking-widest">
                  <Layers className="w-3.5 h-3.5" />
                  CARD 6 — WHAT JJSAK OFFERS
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  Our Services
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                {servicesOffered.map((s, idx) => {
                  const IconComp = s.icon;
                  return (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-red-500/40 hover:bg-slate-900/90 transition-all flex items-start gap-2.5"
                    >
                      <div className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0 mt-0.5">
                        <IconComp className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-200 truncate">
                          {s.title}
                        </div>
                        <div className="text-[10px] text-slate-400 leading-tight truncate">
                          {s.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ───────────────────────────────────────────────────────────
            FINAL ACTION GATEWAY BUTTON: [ CONTINUE TO LOGIN ]
           ─────────────────────────────────────────────────────────── */}
        <div className="w-full pt-4 flex flex-col items-center justify-center space-y-3">
          <button
            type="button"
            onClick={onContinueToLogin}
            className="w-full max-w-md py-4 px-8 rounded-full bg-gradient-to-r from-red-600 via-red-500 to-red-600 hover:from-red-500 hover:to-red-500 text-white font-black text-base sm:text-lg shadow-2xl shadow-red-900/60 hover:shadow-red-900/90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer group"
          >
            <span>CONTINUE TO LOGIN</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
          </button>

          <p className="text-[11px] text-slate-400 text-center">
            Proceed to secure credential authentication. Multi-tenant isolation ensures no cross-school data is shared.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-slate-900 bg-slate-950/90 px-6 py-4 text-center">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div className="flex items-center gap-2 font-medium">
            <span>JJSAK CBC National Platform © 2026</span>
            <span>•</span>
            <span className="text-slate-400">ISO/IEC 27001 Security Standard</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400 font-semibold">
            <button
              type="button"
              onClick={() => setActiveFooterModal('HELP')}
              className="hover:text-white transition cursor-pointer"
            >
              Help &amp; Support
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setActiveFooterModal('PRIVACY')}
              className="hover:text-white transition cursor-pointer"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setActiveFooterModal('TERMS')}
              className="hover:text-white transition cursor-pointer"
            >
              Terms of Service
            </button>
          </div>
        </div>
      </footer>

      {/* Help & Support Modal */}
      {activeFooterModal === 'HELP' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-slate-300 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-red-500" />
                <span>JJSAK Technical Support</span>
              </h3>
              <button
                type="button"
                onClick={() => setActiveFooterModal('NONE')}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 rounded-lg bg-slate-800"
              >
                Close
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Institutional technical assistance and security operations are managed centrally by the JJSAK Platform Operations team:
            </p>
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="text-white font-bold">jothambarasawatila@gmail.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Emergency Desk:</span>
                <span className="text-emerald-400 font-bold">+254 741 478 813</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Service SLA:</span>
                <span className="text-amber-400 font-bold">99.9% Uptime 24/7</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              School-level administrators encountering login or authentication issues should contact their Head of Institution or platform support desk.
            </p>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {activeFooterModal === 'PRIVACY' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 text-slate-300 space-y-4 shadow-2xl animate-in zoom-in-95 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>JJSAK Privacy Policy &amp; Tenant Isolation</span>
              </h3>
              <button
                type="button"
                onClick={() => setActiveFooterModal('NONE')}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 rounded-lg bg-slate-800"
              >
                Close
              </button>
            </div>
            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>
                <strong>1. Zero Unauthenticated Data Exposure:</strong> Under JJSAK Security Standard JJSAK-SEC-AUTH-OWNER-002, no institutional data, student identities, assessment marks, or operational records are disclosed prior to successful credential and OTP validation.
              </p>
              <p>
                <strong>2. Complete Multi-Tenant Isolation:</strong> Data from each educational institution is strictly encapsulated. Users authenticated under one tenant cannot access, view, or modify data from other registered schools.
              </p>
              <p>
                <strong>3. Owner Governance Boundary:</strong> Platform administrators oversee infrastructure, licensing, and security telemetry only. Direct access to learner assessments and operational records is strictly forbidden without audited emergency consent.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Terms of Service Modal */}
      {activeFooterModal === 'TERMS' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 text-slate-300 space-y-4 shadow-2xl animate-in zoom-in-95 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span>JJSAK Institutional Terms of Service</span>
              </h3>
              <button
                type="button"
                onClick={() => setActiveFooterModal('NONE')}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 rounded-lg bg-slate-800"
              >
                Close
              </button>
            </div>
            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>
                <strong>1. Single Continuous Session Rule:</strong> Users authenticate once per session using verified institutional credentials and cryptographically generated one-time security tokens. Re-entering credentials during an active session is prohibited.
              </p>
              <p>
                <strong>2. Role Integrity &amp; Least Privilege:</strong> Authorized officers (Headteachers, Deputies, Directors of Academics, Teachers) operate strictly within their institutional role assignment and cannot bypass assignment boundaries.
              </p>
              <p>
                <strong>3. Auditability:</strong> All system entries, marks submissions, and identity verifications are recorded in an immutable audit ledger with time and actor verification.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
