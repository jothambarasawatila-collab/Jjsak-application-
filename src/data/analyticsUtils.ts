import { Student, Teacher } from '../types';
import { AVAILABLE_SUBJECTS, AVAILABLE_CLASSES, getTeacherForSubject } from './mockData';

export interface SubjectChampion {
  subject: string;
  studentName: string;
  admNo: string;
  classArm: string;
  score: number;
  grade: string;
  remarks: string;
  teacherName: string;
  teacherInitials: string;
}

export interface TopLearner {
  rank: number;
  badge: 'Gold' | 'Silver' | 'Bronze' | 'Honors';
  student: Student;
  avgScore: number;
  overallGrade: string;
  classArm: string;
  topSubject: string;
}

export interface LearningAreaAnalytics {
  subject: string;
  studentCount: number;
  meanScore: number;
  overallGrade: string;
  exceedingCount: number;
  exceedingPercent: number;
  meetingCount: number;
  meetingPercent: number;
  approachingCount: number;
  approachingPercent: number;
  belowCount: number;
  belowPercent: number;
  highestScore: number;
  lowestScore: number;
  teacherName: string;
  teacherInitials: string;
}

export interface ClassStreamAnalytics {
  className: string;
  totalStudents: number;
  meanScore: number;
  overallGrade: string;
  eeCount: number;
  meCount: number;
  aeCount: number;
  beCount: number;
  passRate: number; // % meeting or exceeding (ME + EE)
  topStudentName: string;
  topStudentScore: number;
}

export interface CbeDistribution {
  level: string;
  sublevel: string;
  code: string;
  range: string;
  count: number;
  percent: number;
  color: string;
}

export interface FullSchoolAnalytics {
  totalLearners: number;
  schoolMean: number;
  schoolOverallGrade: string;
  passRate: number; // ME + EE percentage
  top5Learners: TopLearner[];
  subjectChampions: SubjectChampion[];
  learningAreaStats: LearningAreaAnalytics[];
  classStreamStats: ClassStreamAnalytics[];
  cbeSublevelDistribution: CbeDistribution[];
  cbeBroadDistribution: {
    eeCount: number;
    eePercent: number;
    meCount: number;
    mePercent: number;
    aeCount: number;
    aePercent: number;
    beCount: number;
    bePercent: number;
  };
}

export function normalizeGrade(grade?: string): string {
  if (!grade) return '';
  const clean = grade.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  if (clean === 'g7' || clean === 'grade7') return 'Grade 7';
  if (clean === 'g8' || clean === 'grade8') return 'Grade 8';
  if (clean === 'g9' || clean === 'grade9') return 'Grade 9';
  return grade.trim();
}

export function isGradeMatch(g1?: string, g2?: string): boolean {
  if (!g1 || !g2) return false;
  if (g1 === 'All' || g2 === 'All') return true;
  if (g1.trim().toLowerCase() === g2.trim().toLowerCase()) return true;
  return normalizeGrade(g1) === normalizeGrade(g2);
}

export function normalizeClassArm(classArm?: string): string {
  if (!classArm) return '';
  const clean = classArm.trim().toLowerCase().replace(/\s+/g, ' ');
  if (clean === 'g7 n' || clean === 'g7 north' || clean === 'grade 7 n' || clean === 'grade 7 north') return 'Grade 7 North';
  if (clean === 'g7 s' || clean === 'g7 south' || clean === 'grade 7 s' || clean === 'grade 7 south') return 'Grade 7 South';
  if (clean === 'g8 n' || clean === 'g8 north' || clean === 'grade 8 n' || clean === 'grade 8 north') return 'Grade 8 North';
  if (clean === 'g8 s' || clean === 'g8 south' || clean === 'grade 8 s' || clean === 'grade 8 south') return 'Grade 8 South';
  if (clean === 'g9 n' || clean === 'g9 north' || clean === 'grade 9 n' || clean === 'grade 9 north') return 'Grade 9 North';
  if (clean === 'g9 s' || clean === 'g9 south' || clean === 'grade 9 s' || clean === 'grade 9 south') return 'Grade 9 South';
  return classArm.trim();
}

export function isClassMatch(c1?: string, c2?: string): boolean {
  if (!c1 || !c2) return false;
  if (c1 === 'All' || c2 === 'All') return true;
  if (c1.trim().toLowerCase() === c2.trim().toLowerCase()) return true;
  const n1 = normalizeClassArm(c1);
  const n2 = normalizeClassArm(c2);
  if (n1 && n2 && n1 === n2) return true;
  const clean1 = c1.toLowerCase().replace(/[^a-z0-9]/g, '');
  const clean2 = c2.toLowerCase().replace(/[^a-z0-9]/g, '');
  return clean1 === clean2 || clean1.includes(clean2) || clean2.includes(clean1);
}

export function computeAnalytics(
  students: Student[],
  teachers: Teacher[] = [],
  filterClass: string = 'All',
  filterGrade: string = 'All'
): FullSchoolAnalytics {
  // Apply filtering if specified
  let filtered = students;
  if (filterClass !== 'All') {
    filtered = filtered.filter((s) => isClassMatch(s.classArm, filterClass));
  } else if (filterGrade !== 'All') {
    filtered = filtered.filter((s) => isGradeMatch(s.grade, filterGrade) || isGradeMatch(s.classArm, filterGrade));
  }

  const validScoredStudents = filtered.filter((s) => s.avgScore !== null && s.avgScore !== undefined);
  const totalLearners = filtered.length;
  const scoredCount = validScoredStudents.length;

  const totalSum = validScoredStudents.reduce((acc, curr) => acc + (curr.avgScore || 0), 0);
  const schoolMean = scoredCount > 0 ? Math.round((totalSum / scoredCount) * 10) / 10 : 0;

  const getGradeForScore = (s: number): string => {
    if (s >= 90) return 'EE1';
    if (s >= 75) return 'EE2';
    if (s >= 58) return 'ME1';
    if (s >= 41) return 'ME2';
    if (s >= 31) return 'AE1';
    if (s >= 21) return 'AE2';
    if (s >= 11) return 'BE1';
    return 'BE2';
  };

  const schoolOverallGrade = getGradeForScore(schoolMean);

  // 1. Compute Top 5 Learners
  const sortedStudents = [...validScoredStudents].sort((a, b) => (b.avgScore || 0) - (a.avgScore || 0));
  const top5Learners: TopLearner[] = sortedStudents.slice(0, 5).map((st, idx) => {
    let badge: 'Gold' | 'Silver' | 'Bronze' | 'Honors' = 'Honors';
    if (idx === 0) badge = 'Gold';
    else if (idx === 1) badge = 'Silver';
    else if (idx === 2) badge = 'Bronze';

    // Find top subject for this learner
    const topSubj = [...st.subjects]
      .filter((s) => s.score !== null)
      .sort((a, b) => (b.score || 0) - (a.score || 0))[0]?.subject || 'Mathematics';

    return {
      rank: idx + 1,
      badge,
      student: st,
      avgScore: st.avgScore || 0,
      overallGrade: st.overallGrade || getGradeForScore(st.avgScore || 0),
      classArm: st.classArm,
      topSubject: topSubj,
    };
  });

  // 2. Compute Best Learner Per Learning Area (Subject Champions)
  const subjectChampions: SubjectChampion[] = AVAILABLE_SUBJECTS.map((subj) => {
    const subjNorm = (subj || '').toLowerCase().trim();
    let maxScore = -1;
    let champStudent: Student | null = null;
    let champGrade = '-';
    let champRemarks = '-';

    filtered.forEach((st) => {
      const match = (st.subjects || []).find((s) => (s?.subject || '').toLowerCase().trim() === subjNorm);
      if (match && match.score !== null && match.score > maxScore) {
        maxScore = match.score;
        champStudent = st;
        champGrade = match.grade;
        champRemarks = match.remarks;
      }
    });

    const teacherInfo = getTeacherForSubject(subj, champStudent ? (champStudent as Student).classArm : 'G8 S', teachers);

    return {
      subject: subj,
      studentName: champStudent ? (champStudent as Student).name : 'No submissions',
      admNo: champStudent ? (champStudent as Student).admNo : '-',
      classArm: champStudent ? (champStudent as Student).classArm : '-',
      score: maxScore >= 0 ? maxScore : 0,
      grade: champGrade,
      remarks: champRemarks,
      teacherName: teacherInfo.teacherName,
      teacherInitials: teacherInfo.initials,
    };
  });

  // 3. Learning Area Performance Table
  const learningAreaStats: LearningAreaAnalytics[] = AVAILABLE_SUBJECTS.map((subj) => {
    const subjNorm = (subj || '').toLowerCase().trim();
    const scores: number[] = [];
    filtered.forEach((st) => {
      const match = (st.subjects || []).find((s) => (s?.subject || '').toLowerCase().trim() === subjNorm);
      if (match && match.score !== null) {
        scores.push(match.score);
      }
    });

    const count = scores.length;
    const mean = count > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / count) * 10) / 10 : 0;
    const highest = count > 0 ? Math.max(...scores) : 0;
    const lowest = count > 0 ? Math.min(...scores) : 0;

    let exceeding = 0;
    let meeting = 0;
    let approaching = 0;
    let below = 0;

    scores.forEach((sc) => {
      if (sc >= 75) exceeding++;
      else if (sc >= 41) meeting++;
      else if (sc >= 21) approaching++;
      else below++;
    });

    const teacherInfo = getTeacherForSubject(subj, 'G8 S', teachers);

    return {
      subject: subj,
      studentCount: count,
      meanScore: mean,
      overallGrade: getGradeForScore(mean),
      exceedingCount: exceeding,
      exceedingPercent: count > 0 ? Math.round((exceeding / count) * 100) : 0,
      meetingCount: meeting,
      meetingPercent: count > 0 ? Math.round((meeting / count) * 100) : 0,
      approachingCount: approaching,
      approachingPercent: count > 0 ? Math.round((approaching / count) * 100) : 0,
      belowCount: below,
      belowPercent: count > 0 ? Math.round((below / count) * 100) : 0,
      highestScore: highest,
      lowestScore: lowest,
      teacherName: teacherInfo.teacherName,
      teacherInitials: teacherInfo.initials,
    };
  });

  // 4. Class / Stream Performance Table
  const presentClasses = Array.from(new Set(students.map((s) => s.classArm))).filter(Boolean);
  const allClasses = Array.from(new Set([...AVAILABLE_CLASSES, ...presentClasses]));

  const classStreamStats: ClassStreamAnalytics[] = allClasses.map((cls) => {
    const clsNorm = (cls || '').toLowerCase().trim();
    const allClassLearners = students.filter((s) => (s.classArm || '').toLowerCase().trim() === clsNorm);
    const scoredClassLearners = allClassLearners.filter((s) => s.avgScore !== null && s.avgScore !== undefined);
    const count = allClassLearners.length;
    const scoredCount = scoredClassLearners.length;
    const mean = scoredCount > 0 ? Math.round((scoredClassLearners.reduce((a, b) => a + (b.avgScore || 0), 0) / scoredCount) * 10) / 10 : 0;

    let ee = 0;
    let me = 0;
    let ae = 0;
    let be = 0;

    let topLearnerName = allClassLearners[0]?.name || '-';
    let topLearnerScore = 0;

    scoredClassLearners.forEach((st) => {
      const s = st.avgScore || 0;
      if (s > topLearnerScore) {
        topLearnerScore = s;
        topLearnerName = st.name;
      }
      if (s >= 75) ee++;
      else if (s >= 41) me++;
      else if (s >= 21) ae++;
      else be++;
    });

    const passRate = scoredCount > 0 ? Math.round(((ee + me) / scoredCount) * 100) : 0;

    return {
      className: cls,
      totalStudents: count,
      meanScore: mean,
      overallGrade: getGradeForScore(mean),
      eeCount: ee,
      meCount: me,
      aeCount: ae,
      beCount: be,
      passRate,
      topStudentName: topLearnerName,
      topStudentScore: topLearnerScore,
    };
  }).filter((c) => c.totalStudents > 0);

  // 5. CBE 8-sublevel distribution & 4-broad levels
  const subLevelRanges = [
    { level: 'Exceeding Expectations', sublevel: 'EE1', code: 'EE1', range: '90 - 100%', color: '#16A34A', min: 90, max: 100 },
    { level: 'Exceeding Expectations', sublevel: 'EE2', code: 'EE2', range: '75 - 89%', color: '#22C55E', min: 75, max: 89.9 },
    { level: 'Meeting Expectations', sublevel: 'ME1', code: 'ME1', range: '58 - 74%', color: '#0284C7', min: 58, max: 74.9 },
    { level: 'Meeting Expectations', sublevel: 'ME2', code: 'ME2', range: '41 - 57%', color: '#38BDF8', min: 41, max: 57.9 },
    { level: 'Approaching Expectations', sublevel: 'AE1', code: 'AE1', range: '31 - 40%', color: '#F59E0B', min: 31, max: 40.9 },
    { level: 'Approaching Expectations', sublevel: 'AE2', code: 'AE2', range: '21 - 30%', color: '#FBBF24', min: 21, max: 30.9 },
    { level: 'Below Expectations', sublevel: 'BE1', code: 'BE1', range: '11 - 20%', color: '#EF4444', min: 11, max: 20.9 },
    { level: 'Below Expectations', sublevel: 'BE2', code: 'BE2', range: '0 - 10%', color: '#B91C1C', min: 0, max: 10.9 },
  ];

  const cbeSublevelDistribution: CbeDistribution[] = subLevelRanges.map((sl) => {
    const count = validScoredStudents.filter((st) => {
      const avg = st.avgScore || 0;
      return avg >= sl.min && avg <= sl.max;
    }).length;

    return {
      level: sl.level,
      sublevel: sl.sublevel,
      code: sl.code,
      range: sl.range,
      count,
      percent: scoredCount > 0 ? Math.round((count / scoredCount) * 100) : 0,
      color: sl.color,
    };
  });

  const eeCount = validScoredStudents.filter((s) => (s.avgScore || 0) >= 75).length;
  const meCount = validScoredStudents.filter((s) => (s.avgScore || 0) >= 41 && (s.avgScore || 0) < 75).length;
  const aeCount = validScoredStudents.filter((s) => (s.avgScore || 0) >= 21 && (s.avgScore || 0) < 41).length;
  const beCount = validScoredStudents.filter((s) => (s.avgScore || 0) < 21).length;

  const passRate = scoredCount > 0 ? Math.round(((eeCount + meCount) / scoredCount) * 100) : 0;

  return {
    totalLearners,
    schoolMean,
    schoolOverallGrade,
    passRate,
    top5Learners,
    subjectChampions,
    learningAreaStats,
    classStreamStats,
    cbeSublevelDistribution,
    cbeBroadDistribution: {
      eeCount,
      eePercent: scoredCount > 0 ? Math.round((eeCount / scoredCount) * 100) : 0,
      meCount,
      mePercent: scoredCount > 0 ? Math.round((meCount / scoredCount) * 100) : 0,
      aeCount,
      aePercent: scoredCount > 0 ? Math.round((aeCount / scoredCount) * 100) : 0,
      beCount,
      bePercent: scoredCount > 0 ? Math.round((beCount / scoredCount) * 100) : 0,
    },
  };
}
