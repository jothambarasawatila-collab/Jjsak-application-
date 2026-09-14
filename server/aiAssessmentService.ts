import { GoogleGenAI } from '@google/genai';

export interface GeneratedQuestionItem {
  id: string;
  questionNumber: number;
  type: 'MULTIPLE_CHOICE' | 'STRUCTURED' | 'SHORT_ANSWER' | 'PRACTICAL_SCENARIO';
  text: string;
  options?: string[]; // For multiple choice
  marks: number;
  strand: string;
  subStrand: string;
  cognitiveLevel: 'Knowledge' | 'Comprehension' | 'Application' | 'Analysis' | 'Evaluation';
  expectedAnswer: string;
  markingGuide: string;
  pointsBreakdown: string[];
}

export interface GeneratedSubjectPaper {
  id: string;
  subject: string;
  grade: string;
  term: string;
  year: number;
  assessmentType: string;
  title: string;
  timeAllowed: string;
  targetMarks: number;
  generalInstructions: string[];
  strandsCovered: string[];
  questions: GeneratedQuestionItem[];
  markingScheme: {
    overallTotalMarks: number;
    gradingScale: {
      exceedingExpectations: string; // 80-100%
      meetingExpectations: string;   // 65-79%
      approachingExpectations: string; // 50-64%
      belowExpectations: string;       // <50%
    };
    generalMarkingGuidelines: string[];
    questionSolutions: {
      questionNumber: number;
      marks: number;
      expectedAnswer: string;
      markingGuide: string;
      partialCreditRubric?: string;
    }[];
  };
  generatedAt: string;
}

export interface BatchAssessmentRequest {
  schoolName: string;
  grade: string; // e.g., 'Grade 8' or 'G8'
  term: string;  // e.g., 'Term 2, 2026'
  year?: number;
  assessmentType: string; // 'Mid Term Examination' | 'End Term Examination' | 'Opening Assessment' | 'KJSEA Mock'
  subjects?: string[]; // If omitted or contains 'ALL', all 9 CBC areas are generated
  questionsPerSubject?: number; // default 15
  targetMarksPerSubject?: number; // default 50
}

export const CBC_JUNIOR_LEARNING_AREAS = [
  'Mathematics',
  'English',
  'Kiswahili',
  'Integrated Science',
  'Social Studies',
  'Christian Religious Education (CRE)',
  'Agriculture & Nutrition',
  'Pre-Technical Studies',
  'Creative Arts & Sports',
];

class AiAssessmentService {
  private static instance: AiAssessmentService;

  private constructor() {}

  public static getInstance(): AiAssessmentService {
    if (!AiAssessmentService.instance) {
      AiAssessmentService.instance = new AiAssessmentService();
    }
    return AiAssessmentService.instance;
  }

  private getGeminiClient(): GoogleGenAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({ apiKey });
  }

  public async generateBatchAssessments(
    request: BatchAssessmentRequest
  ): Promise<{ success: boolean; papers: GeneratedSubjectPaper[]; provider: 'GEMINI_AI' | 'PEDAGOGICAL_ENGINE' }> {
    const subjectsToGenerate =
      !request.subjects || request.subjects.length === 0 || request.subjects.includes('ALL')
        ? CBC_JUNIOR_LEARNING_AREAS
        : request.subjects;

    const gemini = this.getGeminiClient();
    const papers: GeneratedSubjectPaper[] = [];

    for (const subject of subjectsToGenerate) {
      try {
        let paper: GeneratedSubjectPaper | null = null;
        if (gemini) {
          paper = await this.generateWithGemini(gemini, subject, request);
        }
        if (!paper) {
          paper = this.generateWithPedagogicalEngine(subject, request);
        }
        papers.push(paper);
      } catch (err) {
        console.error(`Error generating for ${subject}:`, err);
        // Fallback to curriculum engine
        papers.push(this.generateWithPedagogicalEngine(subject, request));
      }
    }

    return {
      success: true,
      papers,
      provider: gemini ? 'GEMINI_AI' : 'PEDAGOGICAL_ENGINE',
    };
  }

  private async generateWithGemini(
    ai: GoogleGenAI,
    subject: string,
    req: BatchAssessmentRequest
  ): Promise<GeneratedSubjectPaper | null> {
    const count = req.questionsPerSubject || 15;
    const marks = req.targetMarksPerSubject || 50;
    const grade = req.grade;
    const term = req.term;

    const prompt = `You are an expert Kenya Junior School Curriculum (CBC) assessment creator.
Generate a comprehensive, high-quality examination paper and complete marking scheme for:
Subject: ${subject}
Grade: ${grade}
Term: ${term}
Assessment Type: ${req.assessmentType}
School: ${req.schoolName}
Target Marks: ${marks}
Target Question Count: ${count} questions

Format the response strictly as valid JSON with NO markdown formatting, backticks, or extra commentary. The JSON must have this exact schema:
{
  "subject": "${subject}",
  "grade": "${grade}",
  "term": "${term}",
  "year": ${req.year || 2026},
  "assessmentType": "${req.assessmentType}",
  "title": "${req.schoolName} - ${grade} ${subject} ${req.assessmentType}",
  "timeAllowed": "${marks >= 70 ? '2 Hours' : '1 Hour 30 Minutes'}",
  "targetMarks": ${marks},
  "generalInstructions": [
    "Write your name, admission number, and stream in the spaces provided.",
    "Answer all questions in the spaces provided after each question.",
    "Candidates should check the question paper to ensure all questions are printed.",
    "Calculators and unauthorized electronic devices are strictly prohibited unless specified."
  ],
  "strandsCovered": ["Strand 1", "Strand 2", "Strand 3"],
  "questions": [
    {
      "id": "q1",
      "questionNumber": 1,
      "type": "MULTIPLE_CHOICE",
      "text": "Question text here?",
      "options": ["A. Choice 1", "B. Choice 2", "C. Choice 3", "D. Choice 4"],
      "marks": 2,
      "strand": "Strand Name",
      "subStrand": "Sub Strand Name",
      "cognitiveLevel": "Application",
      "expectedAnswer": "B. Choice 2",
      "markingGuide": "Award 2 marks for correct identification of Choice 2.",
      "pointsBreakdown": ["1 mark for principle", "1 mark for correct selection"]
    }
  ],
  "markingScheme": {
    "overallTotalMarks": ${marks},
    "gradingScale": {
      "exceedingExpectations": "80% - 100% (EE)",
      "meetingExpectations": "65% - 79% (ME)",
      "approachingExpectations": "50% - 64% (AE)",
      "belowExpectations": "Below 50% (BE)"
    },
    "generalMarkingGuidelines": [
      "Credit correct reasoning and method even if computational error occurs.",
      "In CBC, reward evidence of competency mastery and core values."
    ],
    "questionSolutions": [
      {
        "questionNumber": 1,
        "marks": 2,
        "expectedAnswer": "B. Choice 2",
        "markingGuide": "Award 2 marks for correct option.",
        "partialCreditRubric": "Full marks (2) for B. 0 marks otherwise."
      }
    ]
  }
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (!text) return null;
    const parsed = JSON.parse(text);
    return {
      ...parsed,
      id: `paper-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      generatedAt: new Date().toISOString(),
    };
  }

  public generateWithPedagogicalEngine(
    subject: string,
    req: BatchAssessmentRequest
  ): GeneratedSubjectPaper {
    const count = req.questionsPerSubject || 15;
    const marks = req.targetMarksPerSubject || 50;
    const grade = req.grade;
    const term = req.term;

    const strands = this.getStrandsForSubject(subject);
    const questions: GeneratedQuestionItem[] = [];
    const questionSolutions: any[] = [];

    const marksPerQ = Math.max(2, Math.floor(marks / count));
    let currentTotal = 0;

    for (let i = 1; i <= count; i++) {
      const strand = strands[(i - 1) % strands.length];
      const qMarks = i === count ? marks - currentTotal : marksPerQ;
      currentTotal += qMarks;

      const qType: GeneratedQuestionItem['type'] =
        i <= Math.floor(count * 0.3)
          ? 'MULTIPLE_CHOICE'
          : i <= Math.floor(count * 0.7)
          ? 'SHORT_ANSWER'
          : 'STRUCTURED';

      const questionData = this.synthesizeQuestion(subject, strand, i, qType, qMarks, grade);
      questions.push(questionData);

      questionSolutions.push({
        questionNumber: i,
        marks: qMarks,
        expectedAnswer: questionData.expectedAnswer,
        markingGuide: questionData.markingGuide,
        partialCreditRubric: `Award full ${qMarks} marks for complete valid response. Deduct proportional marks for incomplete steps.`,
      });
    }

    return {
      id: `paper-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      subject,
      grade,
      term,
      year: req.year || 2026,
      assessmentType: req.assessmentType,
      title: `${req.schoolName || 'Institution'} - ${grade} ${subject} ${req.assessmentType}`,
      timeAllowed: marks >= 70 ? '2 Hours' : '1 Hour 30 Minutes',
      targetMarks: marks,
      generalInstructions: [
        'Write your Name, Admission Number, Grade, and Stream in the top margin of your paper.',
        'This assessment paper consists of Section A and Section B. Answer all questions.',
        'All answers must be written legibly in the spaces provided.',
        'Do not remove any pages from this booklet.',
      ],
      strandsCovered: strands,
      questions,
      markingScheme: {
        overallTotalMarks: marks,
        gradingScale: {
          exceedingExpectations: '80% - 100% (EE)',
          meetingExpectations: '65% - 79% (ME)',
          approachingExpectations: '50% - 64% (AE)',
          belowExpectations: 'Below 50% (BE)',
        },
        generalMarkingGuidelines: [
          'Award marks strictly based on demonstrated competence and logical progression.',
          'Alternative mathematically/scientifically valid approaches must be credited fully.',
          'Consequential error marking (error carried forward) should be applied where appropriate.',
        ],
        questionSolutions,
      },
      generatedAt: new Date().toISOString(),
    };
  }

  private getStrandsForSubject(subject: string): string[] {
    switch (subject) {
      case 'Mathematics':
        return ['Numbers & Operations', 'Algebra & Expressions', 'Measurements & Rates', 'Geometry & Space', 'Statistics & Probability'];
      case 'English':
        return ['Listening & Speaking', 'Reading Comprehension', 'Grammar in Use', 'Composition & Creative Writing'];
      case 'Kiswahili':
        return ['Kusikiliza na Kuzungumza', 'Ufahamu wa Kusoma', 'Sarufi na Matumizi ya Lugha', 'Insha'];
      case 'Integrated Science':
        return ['Living Things & Ecosystems', 'Matter & Chemical Substances', 'Force, Energy & Machines', 'Earth & Space Systems'];
      case 'Social Studies':
        return ['Natural Environment & Resources', 'People, Population & Culture', 'Governance & Democracy', 'Economic Activities & Trade'];
      case 'Christian Religious Education (CRE)':
        return ['Creation and Fall of Man', 'The Bible and Christian Living', 'Teachings of Jesus Christ', 'Contemporary Moral Issues'];
      case 'Agriculture & Nutrition':
        return ['Crop Production & Soil Health', 'Animal Production & Welfare', 'Food Nutrients & Balanced Diet', 'Food Preservation & Hygiene'];
      case 'Pre-Technical Studies':
        return ['Foundations of Technology', 'Materials & Workshop Safety', 'Technical Drawing & Sketching', 'Entrepreneurship & Career Pathways'];
      case 'Creative Arts & Sports':
        return ['Visual Arts & Design', 'Performing Arts & Music', 'Physical Fitness & Athletics', 'Sports Rules & Fair Play'];
      default:
        return ['Core Concepts', 'Practical Application', 'Problem Solving & Evaluation'];
    }
  }

  private synthesizeQuestion(
    subject: string,
    strand: string,
    qNum: number,
    type: GeneratedQuestionItem['type'],
    marks: number,
    grade: string
  ): GeneratedQuestionItem {
    let text = '';
    let expected = '';
    let guide = '';
    let options: string[] | undefined = undefined;

    if (subject === 'Mathematics') {
      if (type === 'MULTIPLE_CHOICE') {
        text = `Simplify the algebraic expression: 3(2x - 4) + 5(x + 2).`;
        options = ['A. 11x - 2', 'B. 11x + 22', 'C. 6x - 2', 'D. 11x - 22'];
        expected = 'A. 11x - 2';
        guide = 'Expand brackets: 6x - 12 + 5x + 10 = 11x - 2. Award full marks for option A.';
      } else if (type === 'SHORT_ANSWER') {
        text = `A water tank in the shape of a cylinder has a radius of 1.4 m and a height of 3 m. Calculate its capacity in litres (Take π = 22/7).`;
        expected = '18,480 litres';
        guide = 'Volume = πr²h = (22/7) * 1.4 * 1.4 * 3 = 18.48 m³. Since 1 m³ = 1,000 litres, capacity = 18,480 litres.';
      } else {
        text = `In a Junior School class of 45 learners, 25 play football, 20 play volleyball, and 8 play both games. Using a Venn diagram, determine how many learners play neither football nor volleyball.`;
        expected = '8 learners play neither game.';
        guide = 'Draw Venn diagram: Football only = 17, Both = 8, Volleyball only = 12. Total playing games = 17 + 8 + 12 = 37. Neither = 45 - 37 = 8 learners.';
      }
    } else if (subject === 'Integrated Science') {
      if (type === 'MULTIPLE_CHOICE') {
        text = `Which of the following blood vessels carries oxygenated blood from the lungs back to the left atrium of the heart?`;
        options = ['A. Pulmonary Artery', 'B. Pulmonary Vein', 'C. Vena Cava', 'D. Aorta'];
        expected = 'B. Pulmonary Vein';
        guide = 'Award full marks for option B. Pulmonary vein is the only vein carrying oxygenated blood.';
      } else {
        text = `Grade 8 learners investigated the separation of an insoluble solid from a liquid using filtration.\n(a) Name two apparatus required for this experiment.\n(b) Explain one practical application of filtration in daily life.`;
        expected = '(a) Filter paper, funnel, beaker/conical flask. (b) Purification of drinking water or filtering tea leaves.';
        guide = `(a) Award 1 mark for each correct apparatus (max 2). (b) Award ${marks - 2} marks for a clear, realistic everyday application.`;
      }
    } else if (subject === 'English') {
      if (type === 'MULTIPLE_CHOICE') {
        text = `Identify the sentence punctuated correctly:`;
        options = [
          `A. "Where are your books?" asked the teacher.`,
          `B. "Where are your books"? asked the teacher.`,
          `C. "Where are your books" asked the teacher.`,
          `D. Where are your books asked the teacher?`,
        ];
        expected = `A. "Where are your books?" asked the teacher.`;
        guide = 'Question mark must be placed inside quotation marks.';
      } else {
        text = `Fill in the blank spaces with the correct prepositions:\n(a) The school captain presided _______ the meeting.\n(b) She congratulated her classmate _______ scoring an exemplary grade.`;
        expected = '(a) over (b) on/for';
        guide = 'Award marks for precise idiomatic prepositional usage.';
      }
    } else if (subject === 'Kiswahili') {
      text = `Tambua na ueleze aina ya nomino zifuatazo katika muktadha wa lugha: (a) Nairobi (b) Maji (c) Furaha.`;
      expected = '(a) Nomino Pekee (b) Nomino ya Wingi/Mkusanyiko (c) Nomino ya Dhahania.';
      guide = 'Mpe mwanafunzi alama kwa kila aina ya nomino iliyotambuliwa kwa usahihi.';
    } else if (subject === 'Agriculture & Nutrition') {
      text = `(a) Differentiate between organic mulching and inorganic mulching.\n(b) State three benefits of conserving moisture using mulch in kitchen garden beds.`;
      expected = '(a) Organic uses plant residue while inorganic uses polythene/stones. (b) Reduces evaporation, suppresses weeds, regulates soil temperature.';
      guide = 'Award full marks for precise comparison and realistic soil agronomy benefits.';
    } else if (subject === 'Pre-Technical Studies') {
      text = `Grade 8 learners visited a local carpentry workshop.\n(a) List three personal protective equipment (PPE) essential in a workshop environment.\n(b) Identify two common hazards when handling sharp cutting tools.`;
      expected = '(a) Safety goggles, ear protectors, heavy-duty leather boots, gloves. (b) Cuts/lacerations, flying splinters.';
      guide = 'Check for safety compliance and hazard prevention awareness.';
    } else {
      text = `Explain the importance of ${strand} in Junior School education and its positive impact on national development.`;
      expected = `Provides foundational skills, fosters critical thinking, and prepares learners for productive civic and economic participation.`;
      guide = `Award marks for coherent argumentation and contextual relevance to ${subject}.`;
    }

    return {
      id: `q-${qNum}-${Date.now().toString(36)}`,
      questionNumber: qNum,
      type,
      text,
      options,
      marks,
      strand,
      subStrand: `${strand} Competency Focus`,
      cognitiveLevel: qNum % 3 === 0 ? 'Application' : qNum % 2 === 0 ? 'Comprehension' : 'Knowledge',
      expectedAnswer: expected,
      markingGuide: guide,
      pointsBreakdown: [`Award ${marks} marks for accurate response as per guide.`],
    };
  }
}

export const aiAssessmentService = AiAssessmentService.getInstance();
