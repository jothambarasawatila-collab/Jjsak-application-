import { Student } from '../types';

export interface PathwayRecommendation {
  id: 'stem' | 'social_sciences' | 'arts_sports';
  title: string;
  badge: string;
  color: string;
  bgLight: string;
  borderColor: string;
  suitabilityScore: number;
  matchLevel: 'Highly Recommended' | 'Strong Fit' | 'Moderate Fit' | 'Developing Fit';
  keySubjects: string[];
  keySubjectAverages: { subject: string; score: number | null; grade: string }[];
  pathwayAverage: number;
  description: string;
  seniorSchoolTracks: string[];
  careerProspects: string[];
  guidanceNotes: string;
}

export interface StudentPathwayProfile {
  studentId: string;
  studentName: string;
  classArm: string;
  topPathway: PathwayRecommendation;
  allPathways: PathwayRecommendation[];
  careerSummary: string;
  cbeGuidanceVerdict: string;
}

const STEM_SUBJECTS = ['Mathematics', 'Integrated Science', 'Pretechnical Studies', 'Agriculture'];
const SOCIAL_SCIENCES_SUBJECTS = ['English', 'Kiswahili', 'Social Studies', 'CRE'];
const ARTS_SPORTS_SUBJECTS = ['Creative Arts', 'English', 'Pretechnical Studies'];

export function calculateStudentPathways(student: Student): StudentPathwayProfile {
  const getSubjectScore = (subjName: string): { score: number | null; grade: string } => {
    const target = (subjName || '').toLowerCase().trim();
    const found = (student.subjects || []).find(
      (s) => (s?.subject || '').toLowerCase().trim() === target
    );
    return {
      score: found && found.score !== null ? found.score : null,
      grade: found ? found.grade : '-',
    };
  };

  // 1. Calculate STEM Pathway
  const stemDetails = STEM_SUBJECTS.map((s) => {
    const { score, grade } = getSubjectScore(s);
    return { subject: s, score, grade };
  });
  const stemValid = stemDetails.filter((d) => d.score !== null) as { subject: string; score: number; grade: string }[];
  const stemAvg = stemValid.length > 0 ? Math.round(stemValid.reduce((acc, curr) => acc + curr.score, 0) / stemValid.length) : 0;

  // 2. Calculate Social Sciences / Humanities Pathway
  const socialDetails = SOCIAL_SCIENCES_SUBJECTS.map((s) => {
    const { score, grade } = getSubjectScore(s);
    return { subject: s, score, grade };
  });
  const socialValid = socialDetails.filter((d) => d.score !== null) as { subject: string; score: number; grade: string }[];
  const socialAvg = socialValid.length > 0 ? Math.round(socialValid.reduce((acc, curr) => acc + curr.score, 0) / socialValid.length) : 0;

  // 3. Calculate Arts & Sports Science Pathway
  const artsDetails = ARTS_SPORTS_SUBJECTS.map((s) => {
    const { score, grade } = getSubjectScore(s);
    return { subject: s, score, grade };
  });
  const artsValid = artsDetails.filter((d) => d.score !== null) as { subject: string; score: number; grade: string }[];
  const artsAvg = artsValid.length > 0 ? Math.round(artsValid.reduce((acc, curr) => acc + curr.score, 0) / artsValid.length) : 0;

  const getMatchLevel = (avg: number): 'Highly Recommended' | 'Strong Fit' | 'Moderate Fit' | 'Developing Fit' => {
    if (avg >= 80) return 'Highly Recommended';
    if (avg >= 65) return 'Strong Fit';
    if (avg >= 50) return 'Moderate Fit';
    return 'Developing Fit';
  };

  const pathways: PathwayRecommendation[] = [
    {
      id: 'stem',
      title: 'STEM (Science, Technology, Engineering & Mathematics)',
      badge: 'STEM Pathway',
      color: '#0284C7', // sky-600
      bgLight: '#F0F9FF',
      borderColor: '#BAE6FD',
      suitabilityScore: stemAvg,
      matchLevel: getMatchLevel(stemAvg),
      keySubjects: STEM_SUBJECTS,
      keySubjectAverages: stemDetails,
      pathwayAverage: stemAvg,
      description: 'Focuses on critical inquiry, scientific research, quantitative reasoning, and engineering problem-solving.',
      seniorSchoolTracks: [
        'Pure Sciences (Physics, Chemistry, Biology, Advanced Mathematics)',
        'Applied Sciences (Computer Science, Agriculture, Foods & Nutrition)',
        'Technical & Engineering (Pre-Engineering, Aviation, Building Construction, Electrical/Electronics)',
      ],
      careerProspects: [
        'Software Engineering & AI Systems',
        'Medicine & Surgery / Biomedical Science',
        'Aeronautical & Civil Engineering',
        'Data Science & Quantitative Analytics',
        'Agricultural Biotechnology & Agribusiness',
        'Architecture & Urban Planning',
      ],
      guidanceNotes:
        stemAvg >= 75
          ? 'Exceptional aptitude in mathematical reasoning, technical design and scientific inquiry. Prime candidate for Pure Sciences and Engineering tracks in Senior School.'
          : stemAvg >= 60
          ? 'Good foundation in STEM competencies. Recommend targeted practice in quantitative problem solving and practical scientific experiments.'
          : 'Developing analytical foundation. Provide supportive hands-on practical activities and reinforcement in foundational Mathematics.',
    },
    {
      id: 'social_sciences',
      title: 'Social Sciences, Humanities & Business',
      badge: 'Social Sciences',
      color: '#0D9488', // teal-600
      bgLight: '#F0FDFA',
      borderColor: '#99F6E4',
      suitabilityScore: socialAvg,
      matchLevel: getMatchLevel(socialAvg),
      keySubjects: SOCIAL_SCIENCES_SUBJECTS,
      keySubjectAverages: socialDetails,
      pathwayAverage: socialAvg,
      description: 'Develops deep communication, ethical leadership, civic awareness, multilingual fluency, and enterprise acumen.',
      seniorSchoolTracks: [
        'Humanities & Social Studies (History & Citizenship, Geography, Religious Studies)',
        'Languages & Literature (English, Kiswahili, Foreign & Indigenous Languages)',
        'Business Studies & Entrepreneurship (Accounting, Commerce, Economics)',
      ],
      careerProspects: [
        'Law, Judiciary & Human Rights Advocacy',
        'International Diplomacy & Foreign Relations',
        'Corporate Finance, Banking & Economics',
        'Media, Broadcast Journalism & Communications',
        'Public Administration, Policy & Governance',
        'Business Entrepreneurship & Global Trade',
      ],
      guidanceNotes:
        socialAvg >= 75
          ? 'Outstanding linguistic flair, civic reasoning and cultural literacy. Excellently suited for Law, Humanities, Global Diplomacy and Business Leadership.'
          : socialAvg >= 60
          ? 'Strong social communication and analytical reading skills. Encourage debate, structured essay writing and enterprise projects.'
          : 'Cultivating expressive skills. Focus on reading comprehension, vocabulary enrichment and civic awareness discussions.',
    },
    {
      id: 'arts_sports',
      title: 'Arts & Sports Science',
      badge: 'Arts & Sports',
      color: '#D97706', // amber-600
      bgLight: '#FFFBEB',
      borderColor: '#FDE68A',
      suitabilityScore: artsAvg,
      matchLevel: getMatchLevel(artsAvg),
      keySubjects: ARTS_SPORTS_SUBJECTS,
      keySubjectAverages: artsDetails,
      pathwayAverage: artsAvg,
      description: 'Cultivates creative expression, fine aesthetic mastery, physical literacy, kinesthetic intelligence, and performance arts.',
      seniorSchoolTracks: [
        'Visual Arts & Design (Fine Art, Graphic Design, Animation, Photography, Interior Design)',
        'Performing Arts (Music Composition, Theatre & Drama, Dance, Film Production)',
        'Sports Science & Physical Education (Kinesiology, Sports Management, Athletic Coaching)',
      ],
      careerProspects: [
        'Graphic Design, UI/UX & Game Animation',
        'Music Production, Sound Engineering & Film Scoring',
        'Professional Athletics & Sports Coaching',
        'Film Directing, Cinematography & Theatre',
        'Kinesiology, Sports Medicine & Physiotherapy',
        'Fashion Design & Creative Arts Direction',
      ],
      guidanceNotes:
        artsAvg >= 75
          ? 'High creative ingenuity, spatial awareness and aesthetic mastery. Highly recommended for Visual/Performing Arts and Sports Science tracks.'
          : artsAvg >= 60
          ? 'Promising creative instincts. Provide opportunities in co-curricular clubs, digital media labs, and organized sporting leagues.'
          : 'Building artistic expression. Encourage participation in music, drawing, drama and physical wellness routines.',
    },
  ];

  // Sort pathways by score descending
  const sortedPathways = [...pathways].sort((a, b) => b.suitabilityScore - a.suitabilityScore);
  const topPathway = sortedPathways[0];

  let cbeGuidanceVerdict = '';
  if (topPathway.suitabilityScore >= 80) {
    cbeGuidanceVerdict = `${student.name} demonstrates clear mastery in the ${topPathway.title} with a ${topPathway.suitabilityScore}% suitability index. Recommended for Senior School selection in this domain.`;
  } else if (topPathway.suitabilityScore >= 65) {
    cbeGuidanceVerdict = `${student.name} shows strong multidisciplinary potential with primary affinity toward ${topPathway.title} (${topPathway.suitabilityScore}%).`;
  } else {
    cbeGuidanceVerdict = `${student.name} has a balanced cross-curricular profile. Continued exploration of interests in ${sortedPathways[0].badge} and ${sortedPathways[1].badge} is encouraged.`;
  }

  return {
    studentId: student.id,
    studentName: student.name,
    classArm: student.classArm,
    topPathway,
    allPathways: sortedPathways,
    careerSummary: topPathway.careerProspects.slice(0, 3).join(', '),
    cbeGuidanceVerdict,
  };
}

export interface SchoolPathwayDistribution {
  stemCount: number;
  stemPercent: number;
  socialCount: number;
  socialPercent: number;
  artsCount: number;
  artsPercent: number;
  totalStudents: number;
}

export function calculateSchoolPathwayDistribution(students: Student[]): SchoolPathwayDistribution {
  let stemCount = 0;
  let socialCount = 0;
  let artsCount = 0;

  students.forEach((st) => {
    const profile = calculateStudentPathways(st);
    if (profile.topPathway.id === 'stem') stemCount++;
    else if (profile.topPathway.id === 'social_sciences') socialCount++;
    else artsCount++;
  });

  const total = students.length || 1;
  return {
    stemCount,
    stemPercent: Math.round((stemCount / total) * 100),
    socialCount,
    socialPercent: Math.round((socialCount / total) * 100),
    artsCount,
    artsPercent: Math.round((artsCount / total) * 100),
    totalStudents: students.length,
  };
}
