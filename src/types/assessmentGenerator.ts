export type CognitiveLevel = 'knowledge' | 'understanding' | 'application' | 'analysis' | 'evaluation' | 'creativity';

export type QuestionType = 'multiple_choice' | 'short_answer' | 'structured' | 'practical_scenario';

export interface QuestionOption {
  key: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface GeneratedQuestion {
  id: string;
  number: number;
  section: 'A' | 'B' | 'C';
  strand: string;
  subStrand: string;
  questionText: string;
  type: QuestionType;
  marks: number;
  options?: QuestionOption[];
  diagramPrompt?: string;
  diagramDescription?: string;
  modelAnswer: string;
  markingGuide: string[];
  rubricEE: string; // Exceeding Expectations description
  rubricME: string; // Meeting Expectations description
  rubricAE: string; // Approaching Expectations description
  rubricBE: string; // Below Expectations description
  competencyTested: string;
  cognitiveLevel: CognitiveLevel;
}

export interface AssessmentSection {
  sectionLetter: 'A' | 'B' | 'C';
  title: string;
  description: string;
  totalMarks: number;
  questions: GeneratedQuestion[];
}

export interface GeneratedAssessmentPaper {
  id: string;
  title: string;
  schoolName: string;
  subject: string;
  grade: string;
  term: string;
  year: number;
  assessmentType: string;
  durationMinutes: number;
  totalMarks: number;
  instructions: string[];
  strandsCovered: string[];
  sections: AssessmentSection[];
  createdDate: string;
}

export interface SubjectStrandInfo {
  subject: string;
  strands: {
    name: string;
    subStrands: string[];
  }[];
}
