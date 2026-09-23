import { Student } from '../types';
import { LearnerHealthProfile, StudentHealthQrData } from '../types/learnerWelfare';

export const QR_PAYLOAD_PREFIX = 'JJSAK_HLTH:';

/**
 * Creates an optimized JSON payload for student health & welfare QR pass.
 */
export function createStudentQrPayload(
  student: Student,
  healthProfile?: LearnerHealthProfile,
  schoolId: string = 'SCH-JJSAK-001'
): string {
  const payload: StudentHealthQrData = {
    type: 'JJSAK_STUDENT_HEALTH_PASS',
    v: 1,
    studentId: student.id,
    admNo: student.admNo,
    name: student.name,
    grade: student.grade,
    stream: student.stream || student.classArm || undefined,
    gender: student.gender,
    bloodGroup: healthProfile?.bloodGroup || 'Unknown',
    allergies: healthProfile?.allergies || [],
    chronicConditions: healthProfile?.chronicConditions || [],
    emergencyPhone: student.emergencyPhone || student.parentPhone || student.parentPhone1 || undefined,
    parentName: student.parentName || student.guardianName || undefined,
    schoolId,
    issuedAt: new Date().toISOString().split('T')[0],
  };

  return JSON.stringify(payload);
}

/**
 * Parses scanned QR code content.
 * Accepts:
 * 1. JJSAK JSON Payload ({ type: 'JJSAK_STUDENT_HEALTH_PASS', ... })
 * 2. Prefix format: 'JJSAK_HLTH:ADM-2024-001'
 * 3. Raw Admission number: 'ADM-2024-001'
 * 4. URL format: '.../student?adm=ADM-2024-001' or '.../student?id=std-1'
 */
export function parseScannedQrData(
  rawText: string,
  students: Student[]
): {
  student: Student | null;
  parsedPayload?: Partial<StudentHealthQrData>;
  rawString: string;
} {
  const trimmed = rawText.trim();
  if (!trimmed) {
    return { student: null, rawString: rawText };
  }

  // 1. Try JSON Parse
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === 'object') {
      const targetId = parsed.studentId;
      const targetAdm = parsed.admNo;

      const found = students.find(
        (s) =>
          (targetId && s.id === targetId) ||
          (targetAdm && s.admNo?.toLowerCase() === targetAdm.toLowerCase()) ||
          (parsed.name && s.name?.toLowerCase() === parsed.name.toLowerCase())
      );

      return {
        student: found || null,
        parsedPayload: parsed,
        rawString: trimmed,
      };
    }
  } catch {
    // Not valid JSON, continue with string patterns
  }

  // 2. Strip prefix if present
  let cleanAdm = trimmed;
  if (cleanAdm.startsWith(QR_PAYLOAD_PREFIX)) {
    cleanAdm = cleanAdm.replace(QR_PAYLOAD_PREFIX, '').trim();
  }

  // 3. Check for URL params
  if (cleanAdm.includes('?') && (cleanAdm.includes('adm=') || cleanAdm.includes('id='))) {
    try {
      const url = new URL(cleanAdm, 'https://jjsak.edu.ke');
      const admParam = url.searchParams.get('adm');
      const idParam = url.searchParams.get('id');
      if (admParam) cleanAdm = admParam;
      if (idParam) {
        const foundById = students.find((s) => s.id === idParam);
        if (foundById) {
          return { student: foundById, rawString: trimmed };
        }
      }
    } catch {
      // Fallback
    }
  }

  // 4. Match student by Adm No or ID or Name
  const normalizedSearch = cleanAdm.toLowerCase().replace(/[^a-z0-9]/g, '');
  const matched = students.find((s) => {
    const normAdm = (s.admNo || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const normId = (s.id || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const normName = (s.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    return normAdm === normalizedSearch || normId === normalizedSearch || normName.includes(normalizedSearch);
  });

  return {
    student: matched || null,
    rawString: trimmed,
  };
}

/**
 * Synthetic audio feedback for successful / failed QR scans
 * (Pure Web Audio API with zero external audio assets).
 */
export function playScanSound(type: 'success' | 'warning' | 'error' = 'success'): void {
  try {
    if (typeof window === 'undefined') return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'success') {
      // Pleasant high double beep
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now); // A5
      osc.frequency.setValueAtTime(1760, now + 0.08); // A6
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.22);
    } else if (type === 'warning') {
      // Mid double buzz
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(330, now + 0.1);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else {
      // Low buzz for error
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.setValueAtTime(165, now + 0.12);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  } catch {
    // AudioContext might be blocked before first user gesture
  }
}

/**
 * Haptic feedback for mobile devices
 */
export function triggerHapticFeedback(pattern: number[] = [60, 40, 60]): void {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    // Ignore
  }
}
