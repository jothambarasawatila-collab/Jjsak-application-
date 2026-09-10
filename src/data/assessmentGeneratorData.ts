import {
  GeneratedAssessmentPaper,
  GeneratedQuestion,
  AssessmentSection,
  SubjectStrandInfo,
} from '../types/assessmentGenerator';

export const JUNIOR_SCHOOL_SYLLABUS_STRANDS: SubjectStrandInfo[] = [
  {
    subject: 'Mathematics',
    strands: [
      {
        name: 'Numbers & Operations',
        subStrands: [
          'Integers & Real Numbers',
          'Fractions, Decimals & Percentages',
          'Ratios, Proportions & Compound Units',
          'Indices & Standard Form',
          'Commercial Arithmetic (Profit, Loss, Interest)',
        ],
      },
      {
        name: 'Algebra',
        subStrands: [
          'Algebraic Expressions & Factorization',
          'Linear Equations & Inequations',
          'Simultaneous Equations',
          'Patterns, Sequences & Formulae',
        ],
      },
      {
        name: 'Measurements & Geometry',
        subStrands: [
          'Length, Perimeter & Area of Plane Figures',
          'Surface Area & Volume of Prisms and Cylinders',
          'Time, Speed, Distance & Travel Graphs',
          'Angles, Polygons & Geometric Constructions',
          'Pythagoras Theorem & Trigonometry Basics',
        ],
      },
      {
        name: 'Data Handling & Probability',
        subStrands: [
          'Data Collection, Frequency Tables & Tallies',
          'Mean, Median, Mode & Range',
          'Pie Charts, Bar Graphs & Histograms',
          'Simple Probability & Outcomes',
        ],
      },
    ],
  },
  {
    subject: 'Integrated Science',
    strands: [
      {
        name: 'Living Things and Their Environment',
        subStrands: [
          'Cells, Tissues and Organ Systems',
          'Human Excretory & Reproductive Systems',
          'Ecosystems, Food Webs & Ecological Interactions',
          'Classification of Plants & Animals',
        ],
      },
      {
        name: 'Matter and Chemical Reactions',
        subStrands: [
          'Particulate Nature of Matter',
          'Acids, Bases, Salts and Indicators',
          'Separation of Mixtures & Chromatography',
          'Air, Combustion & Atmospheric Gases',
        ],
      },
      {
        name: 'Force, Energy and Machines',
        subStrands: [
          'Force, Pressure and Hydraulic Systems',
          'Light, Reflection & Refraction in Lenses',
          'Current Electricity, Circuits & Resistance',
          'Simple Machines (Levers, Pulleys, Inclined Planes)',
        ],
      },
      {
        name: 'Earth and Space Science',
        subStrands: [
          'Solar System, Moon Phases & Eclipses',
          'Rocks, Minerals and Soil Profiles',
          'Water Purification & Environmental Conservation',
        ],
      },
    ],
  },
  {
    subject: 'Pretechnical Studies',
    strands: [
      {
        name: 'Technical Drawing & Design',
        subStrands: [
          'Drawing Instruments, Scales & Line Types',
          'Plane Geometry, Angles & Polygons',
          'Isometric & Orthographic Projections',
          'Design Process, Problem Identification & Modelling',
        ],
      },
      {
        name: 'Materials and Tools Technology',
        subStrands: [
          'Classification of Woods, Metals & Plastics',
          'Hand Tools (Measuring, Marking, Cutting, Joining)',
          'Workshop Safety, First Aid & Fire Fighting',
          'Basic Metalwork, Woodwork & Jointing Techniques',
        ],
      },
      {
        name: 'Energy, Electrical & Mechanical Systems',
        subStrands: [
          'Electrical Circuits, Voltage & Basic Soldering',
          'Renewable Energy (Solar Panels, Windmills)',
          'Simple Mechanisms, Gears, Pulleys & Linkages',
        ],
      },
      {
        name: 'Computer Science & Digital Literacy',
        subStrands: [
          'Computer Hardware & System Software',
          'Word Processing, Spreadsheets & Presentations',
          'Introduction to Algorithms & Block-based Coding',
          'Internet Safety, Cyber Ethics & Data Security',
        ],
      },
    ],
  },
  {
    subject: 'Agriculture',
    strands: [
      {
        name: 'Crop Production & Soil Science',
        subStrands: [
          'Soil Sampling, Fertility & Organic Manures',
          'Nursery Management & Seedling Transplating',
          'Vegetable, Cereal & Legume Crop Husbandry',
          'Pest & Weed Control in Kitchen Gardens',
        ],
      },
      {
        name: 'Animal Production & Husbandry',
        subStrands: [
          'Poultry Rearing (Broilers, Layers & Indigenous)',
          'Small Livestock (Rabbits, Goats, Apiculture/Bees)',
          'Animal Feeds, Rations & Clean Housing',
          'Routine Management Practices (Vaccination, Deworming)',
        ],
      },
      {
        name: 'Agricultural Economics & Farm Structures',
        subStrands: [
          'Farm Records, Bookkeeping & Marketing Strategies',
          'Simple Farm Tools Maintenance & Storage',
          'Water Harvesting & Drip Irrigation Systems',
        ],
      },
    ],
  },
  {
    subject: 'Social Studies',
    strands: [
      {
        name: 'Physical Environment & Geography',
        subStrands: [
          'Map Reading, Scales & Grid References',
          'Physical Features of Eastern Africa & Formation',
          'Weather, Climate Zones & Climate Change Impacts',
          'Vegetation Types & Wildlife Conservation',
        ],
      },
      {
        name: 'People, Culture and Population',
        subStrands: [
          'Origin and Migration of Kenyan Communities',
          'Cultural Heritage, National Cohesion & Diversity',
          'Population Distribution, Growth & Urbanization',
        ],
      },
      {
        name: 'Governance, Citizenship and Human Rights',
        subStrands: [
          'The Constitution of Kenya 2010 (Arms of Government)',
          'Rights and Responsibilities of a Kenyan Citizen',
          'Peace Building, Conflict Resolution & Integrity',
          'Devolution and County Government Services',
        ],
      },
    ],
  },
  {
    subject: 'English',
    strands: [
      {
        name: 'Reading Comprehension & Critical Thinking',
        subStrands: [
          'Contextual Vocabulary & Inference',
          'Main Ideas, Supporting Details & Fact vs Opinion',
          'Poetry Analysis & Literary Devices',
        ],
      },
      {
        name: 'Grammar and Language Mechanics',
        subStrands: [
          'Nouns, Pronouns & Subject-Verb Agreement',
          'Tenses (Present Perfect, Past Continuous, Future)',
          'Active and Passive Voice',
          'Direct and Indirect Speech',
          'Punctuation, Conjunctions & Prepositions',
        ],
      },
      {
        name: 'Functional & Creative Writing',
        subStrands: [
          'Formal and Informal Letters',
          'Narrative and Descriptive Compositions',
          'Email, Minutes of a Meeting & Recipe/Notice',
        ],
      },
    ],
  },
  {
    subject: 'Kiswahili',
    strands: [
      {
        name: 'Ufahamu na Msamiati',
        subStrands: [
          'Ufahamu wa Makala ya Kijamii na Mazingira',
          'Msamiati wa Kilimo, Teknolojia na Uchumi',
          'Ushairi na Vipengele vya Fasihi Simulizi',
        ],
      },
      {
        name: 'Sarufi na Muundo wa Lugha',
        subStrands: [
          'Aina za Maneno (Nomino, Vivumishi, Vitendo, Vielezi)',
          'Ngeli za Nomino na Upatanisho wa Kisintaksia',
          'Nyakati na Hali (LI, ME, NA, TA, NGE, NGALI)',
          'Uakifishaji, Ukubwa na Udogo, Umoja na Wingi',
        ],
      },
      {
        name: 'Insha na Utungaji',
        subStrands: [
          'Insha ya Wasifu na Mazungumzo',
          'Barua Rasmi na Risala za Pongezi',
          'Insha ya Methali na Masimulizi',
        ],
      },
    ],
  },
  {
    subject: 'CRE',
    strands: [
      {
        name: 'Creation and The Bible',
        subStrands: [
          'Biblical Accounts of Creation and Human Stewardship',
          'Translations and Versions of the Bible',
          'Faith and God’s Promises (Abraham, Moses, Prophets)',
        ],
      },
      {
        name: 'The Life and Teachings of Jesus Christ',
        subStrands: [
          'The Parables of Jesus and Moral Lessons',
          'Miracles of Jesus (Healing, Nature, Resurrection)',
          'The Sermon on the Mount and Christian Virtues',
        ],
      },
      {
        name: 'Christian Living, Morality and Contemporary Issues',
        subStrands: [
          'Human Sexuality, Relationships and Peer Pressure',
          'Social Justice, Drug Abuse and Cyber Ethics',
          'Christian Family Values, Work and Leisure',
        ],
      },
    ],
  },
  {
    subject: 'Creative Arts',
    strands: [
      {
        name: 'Visual Arts & Craft Design',
        subStrands: [
          'Drawing, Shading & Perspective Techniques',
          'Painting, Color Wheel & Mixed Media Collages',
          'Sculpture, Pottery & Clay Modelling',
          'Fabric Printing, Weaving & Basketry',
        ],
      },
      {
        name: 'Music & Performance Arts',
        subStrands: [
          'Rhythm, Pitch, Sol-fa Notations & Scales',
          'Kenyan Traditional Folk Songs & Indigenous Instruments',
          'Western Orchestral Instruments & Choral Performance',
        ],
      },
      {
        name: 'Theatre & Physical Performance',
        subStrands: [
          'Dramatic Elements, Mime, Playwriting & Stagecraft',
          'Traditional and Modern Folk Dances',
          'Physical Fitness Routines & Aerobic Movements',
        ],
      },
    ],
  },
];

/**
 * Question Bank categorized by Subject with detailed marking points & KICD rubrics
 */
export const COMPREHENSIVE_QUESTION_BANK: Record<string, GeneratedQuestion[]> = {
  Mathematics: [
    {
      id: 'math-01',
      number: 1,
      section: 'A',
      strand: 'Numbers & Operations',
      subStrand: 'Commercial Arithmetic',
      questionText:
        'A trader bought 45 bags of maize at KSh 3,200 per bag. She spent KSh 4,500 on transport. If she later sold all the bags making an overall profit of 15%, calculate the selling price of each bag of maize.',
      type: 'structured',
      marks: 4,
      modelAnswer:
        'Total Cost Price = (45 × 3,200) + 4,500 = 144,000 + 4,500 = KSh 148,500.\nTotal Selling Price = 148,500 × 1.15 = KSh 170,775.\nSelling Price per Bag = 170,775 ÷ 45 = KSh 3,795.',
      markingGuide: [
        'M1: Calculating total cost price with transport (144,000 + 4,500 = 148,500)',
        'M1: Applying 15% profit factor (148,500 × 1.15 or adding 22,275)',
        'M1: Dividing total selling price by 45 bags',
        'A1: Exact answer: KSh 3,795',
      ],
      rubricEE: 'Flawlessly executes multi-step commercial arithmetic with clear working units and accurate monetary notation.',
      rubricME: 'Correctly computes total cost and finds selling price per bag with minor arithmetic rounding oversight.',
      rubricAE: 'Applies profit percentage formula to purchase price only without incorporating transport overhead.',
      rubricBE: 'Demonstrates difficulty setting up cost and selling price relationships.',
      competencyTested: 'Critical thinking, commercial numeracy and multi-step financial problem-solving',
      cognitiveLevel: 'application',
    },
    {
      id: 'math-02',
      number: 2,
      section: 'A',
      strand: 'Algebra',
      subStrand: 'Linear Equations & Inequations',
      questionText: 'Solve the simultaneous linear equations:\n2x + 3y = 19\n5x - y = 5',
      type: 'structured',
      marks: 3,
      modelAnswer:
        'From second equation: y = 5x - 5.\nSubstitute into first equation: 2x + 3(5x - 5) = 19\n2x + 15x - 15 = 19 => 17x = 34 => x = 2.\nSubstitute x = 2: y = 5(2) - 5 = 10 - 5 = 5.\nTherefore, x = 2, y = 5.',
      markingGuide: [
        'M1: Substitution or elimination method setup to isolate one variable',
        'A1: Correct value of x = 2',
        'A1: Correct value of y = 5',
      ],
      rubricEE: 'Shows seamless algebraic manipulation through substitution or elimination with check-step verification.',
      rubricME: 'Correctly finds both values (x=2, y=5) with minor notation irregularities.',
      rubricAE: 'Correctly solves for one variable but makes an arithmetic error finding the second.',
      rubricBE: 'Unable to eliminate variables or construct consistent equations.',
      competencyTested: 'Algebraic reasoning and logical deduction',
      cognitiveLevel: 'application',
    },
    {
      id: 'math-03',
      number: 3,
      section: 'A',
      strand: 'Measurements & Geometry',
      subStrand: 'Surface Area & Volume',
      questionText:
        'A closed cylindrical water tank has a diameter of 2.8 m and a height of 3.5 m. (Take π = 22/7).\na) Calculate the capacity of the tank in litres. [3 Marks]\nb) Calculate the total surface area of sheet metal required to construct the tank. [3 Marks]',
      type: 'structured',
      marks: 6,
      modelAnswer:
        'Radius r = 2.8 / 2 = 1.4 m.\na) Volume V = π × r² × h = (22/7) × 1.4 × 1.4 × 3.5 = 21.56 m³.\nSince 1 m³ = 1,000 litres => Capacity = 21.56 × 1,000 = 21,560 litres.\nb) Total Surface Area = 2πr(r + h) = 2 × (22/7) × 1.4 × (1.4 + 3.5) = 8.8 × 4.9 = 43.12 m².',
      markingGuide: [
        'M1: Applying volume formula with r = 1.4 m',
        'M1: Unit conversion (m³ to litres by multiplying by 1,000)',
        'A1: 21,560 litres',
        'M1: Total surface area formula 2πr² + 2πrh or 2πr(r+h)',
        'M1: Substitution of radius and height',
        'A1: 43.12 m²',
      ],
      rubricEE: 'Accurately calculates three-dimensional metric volume, capacity conversions, and total surface area with standard units.',
      rubricME: 'Correctly evaluates volume and surface area with minor arithmetic slip in unit conversion.',
      rubricAE: 'Computes curved surface area but forgets top and bottom circular bases.',
      rubricBE: 'Confuses diameter with radius or applies incorrect geometric formulae.',
      competencyTested: 'Spatial visualization and metric conversion',
      cognitiveLevel: 'application',
    },
    {
      id: 'math-04',
      number: 4,
      section: 'B',
      strand: 'Data Handling & Probability',
      subStrand: 'Mean, Median, Mode & Range',
      questionText:
        'The table below shows the marks scored by 30 Grade 8 learners in a Pre-Technical workshop test:\nMarks: 40-49 (4), 50-59 (8), 60-69 (10), 70-79 (6), 80-89 (2).\na) State the modal class. [1 Mark]\nb) Estimate the mean mark scored using class midpoints. [3 Marks]\nc) If a learner is chosen at random, find the probability that they scored 60 marks or above. [2 Marks]',
      type: 'structured',
      marks: 6,
      modelAnswer:
        'a) Modal class = 60 - 69 (highest frequency of 10).\nb) Midpoints (x): 44.5 (f=4, fx=178), 54.5 (f=8, fx=436), 64.5 (f=10, fx=645), 74.5 (f=6, fx=447), 84.5 (f=2, fx=169).\nΣfx = 178 + 436 + 645 + 447 + 169 = 1,875.\nMean = Σfx / Σf = 1,875 ÷ 30 = 62.5 marks.\nc) Learners scoring 60+ = 10 + 6 + 2 = 18.\nProbability = 18 / 30 = 3/5 or 0.6 or 60%.',
      markingGuide: [
        'A1: Modal class: 60 - 69',
        'M1: Determining class midpoints x',
        'M1: Calculating Σfx and dividing by 30',
        'A1: Estimated Mean: 62.5 marks',
        'M1: Identifying count ≥ 60 marks (18 learners)',
        'A1: Simplified probability: 3/5 or 0.6',
      ],
      rubricEE: 'Synthesizes grouped frequency tables, estimates central tendencies accurately, and determines theoretical probability.',
      rubricME: 'Accurately determines modal class, mean calculation, and probability fraction.',
      rubricAE: 'Finds modal class but makes calculation error when computing midpoint sums.',
      rubricBE: 'Unable to construct frequency calculation table.',
      competencyTested: 'Statistical literacy and probabilistic reasoning',
      cognitiveLevel: 'analysis',
    },
    {
      id: 'math-05',
      number: 5,
      section: 'B',
      strand: 'Numbers & Operations',
      subStrand: 'Indices & Standard Form',
      questionText:
        'Simplify the following expression giving your answer in standard form (A × 10ⁿ where 1 ≤ A < 10):\n(3.6 × 10⁸) ÷ (1.2 × 10⁻⁴)',
      type: 'multiple_choice',
      marks: 2,
      options: [
        { key: 'A', text: '3.0 × 10⁴' },
        { key: 'B', text: '3.0 × 10¹²' },
        { key: 'C', text: '4.8 × 10¹²' },
        { key: 'D', text: '3.0 × 10⁻²' },
      ],
      modelAnswer: 'Option B: 3.0 × 10¹².\nWorking: (3.6 ÷ 1.2) × 10^(8 - (-4)) = 3.0 × 10^(8 + 4) = 3.0 × 10¹².',
      markingGuide: ['A2: Correct choice B with index law subtraction (8 - (-4) = 12)'],
      rubricEE: 'Applies laws of indices with negative exponents and standard scientific notation.',
      rubricME: 'Identifies correct standard form power.',
      rubricAE: 'Subtracts exponents as 8 - 4 = 4 (leading to 10⁴).',
      rubricBE: 'Incorrect coefficient and exponent calculation.',
      competencyTested: 'Exponent manipulation and scientific notation',
      cognitiveLevel: 'understanding',
    },
  ],
  'Integrated Science': [
    {
      id: 'sci-01',
      number: 1,
      section: 'A',
      strand: 'Living Things and Their Environment',
      subStrand: 'Human Excretory System',
      questionText:
        'A Grade 8 learner conducted an experiment on kidney functioning and homeostatic regulation.\na) Name two waste products excreted by the human kidney in urine. [2 Marks]\nb) Explain why a person produces a smaller volume of concentrated urine on a hot sunny afternoon compared to a cold morning. [3 Marks]',
      type: 'structured',
      marks: 5,
      modelAnswer:
        'a) Urea, excess mineral salts, uric acid, excess water.\nb) On a hot sunny afternoon, the body loses large amounts of water through sweating to cool down (evaporative cooling). The hypothalamus detects lower blood water levels and stimulates the pituitary gland to release Anti-Diuretic Hormone (ADH). ADH increases the reabsorption of water back into the bloodstream in kidney nephron tubules, leading to a smaller volume of concentrated, darker urine.',
      markingGuide: [
        'A1 for each correct waste product (max 2)',
        'M1: Mention of water loss through sweating/perspiration',
        'M1: Action of ADH / reabsorption of water in kidney tubules',
        'A1: Explaining resulting low volume and concentrated urine',
      ],
      rubricEE: 'Provides comprehensive homeostatic feedback explanation referencing sweating, ADH secretion, and tubule reabsorption.',
      rubricME: 'Correctly links sweating to kidney water conservation and smaller urine volume.',
      rubricAE: 'States that water is lost through sweat but does not mention kidney reabsorption.',
      rubricBE: 'Confuses excretory organs or describes digestion instead of excretion.',
      competencyTested: 'Scientific inquiry, physiological systems understanding and homeostasis',
      cognitiveLevel: 'understanding',
    },
    {
      id: 'sci-02',
      number: 2,
      section: 'A',
      strand: 'Matter and Chemical Reactions',
      subStrand: 'Acids, Bases, Salts and Indicators',
      questionText:
        'Learners in Ngonyek Junior School tested common household substances using red and blue litmus paper, and red cabbage indicator. The results are shown below:\n- Substance P: Turns blue litmus red, red cabbage turns red.\n- Substance Q: Turns red litmus blue, red cabbage turns greenish-yellow.\n- Substance R: No change on either litmus paper, red cabbage stays purple.\n\na) Classify substances P, Q, and R as Acid, Base, or Neutral. [3 Marks]\nb) Give one example of a household item for each substance P and Q. [2 Marks]\nc) State what happens when substance P is mixed with substance Q in equal strength. [1 Mark]',
      type: 'structured',
      marks: 6,
      modelAnswer:
        'a) Substance P: Acidic | Substance Q: Basic / Alkaline | Substance R: Neutral.\nb) Substance P example: Lemon juice / Vinegar / Sour milk. Substance Q example: Baking soda / Wood ash solution / Soap solution.\nc) Neutralization reaction occurs forming a salt and water (pH moves towards 7).',
      markingGuide: [
        'A1 for each correct classification (P=Acid, Q=Base, R=Neutral) [3M]',
        'A1 for suitable household acid example [1M]',
        'A1 for suitable household base example [1M]',
        'A1: Mentions neutralization / formation of salt and water [1M]',
      ],
      rubricEE: 'Accurately categorizes chemical substances, correlates household solutions, and explains neutralization.',
      rubricME: 'Correctly classifies P, Q, and R with valid everyday examples.',
      rubricAE: 'Confuses litmus color changes for base vs acid.',
      rubricBE: 'Unable to interpret indicator color transitions.',
      competencyTested: 'Chemical analysis, laboratory observation and classification',
      cognitiveLevel: 'analysis',
    },
    {
      id: 'sci-03',
      number: 3,
      section: 'B',
      strand: 'Force, Energy and Machines',
      subStrand: 'Current Electricity & Circuits',
      questionText:
        'Grade 8 learners assembled a series circuit containing two dry cells (1.5 V each), a switch, a resistor of 6 Ω, and a bulb of resistance 4 Ω.\na) Draw a neat circuit diagram representing this setup using standard electrical symbols. [3 Marks]\nb) Calculate the total effective resistance of the circuit. [2 Marks]\nc) Determine the electric current flowing through the circuit when the switch is closed. [2 Marks]',
      type: 'practical_scenario',
      marks: 7,
      modelAnswer:
        'a) Circuit diagram showing: two cells in series in correct polarity (long line +/short line -), closed switch symbol, resistor symbol (rectangle or zigzag), bulb symbol (circle with cross), connected in a closed loop.\nb) In series: Total Resistance R_total = R1 + R2 = 6 Ω + 4 Ω = 10 Ω.\nc) Total Voltage V = 1.5 V + 1.5 V = 3.0 V.\nCurrent I = V / R = 3.0 V ÷ 10 Ω = 0.3 A (or 300 mA).',
      markingGuide: [
        'A1: Correct cell and switch symbols',
        'A1: Correct resistor and bulb symbols',
        'A1: Complete closed circuit diagram without breaks',
        'M1: Series resistance addition formula (6 + 4)',
        'A1: 10 Ω',
        'M1: Applying Ohm’s Law I = V / R with V = 3 V',
        'A1: 0.3 Amperes (A)',
      ],
      rubricEE: 'Draws flawless electrical schematics, computes series parameters, and executes Ohm’s Law calculations with units.',
      rubricME: 'Correctly draws symbols and calculates current = 0.3 A.',
      rubricAE: 'Calculates total resistance but uses only one cell (1.5 V) instead of 3.0 V.',
      rubricBE: 'Unable to draw standard circuit components or apply Ohm’s Law.',
      competencyTested: 'Circuit schematics, electrical troubleshooting and quantitative analysis',
      cognitiveLevel: 'application',
    },
  ],
  'Pretechnical Studies': [
    {
      id: 'pretech-01',
      number: 1,
      section: 'A',
      strand: 'Technical Drawing & Design',
      subStrand: 'Isometric & Orthographic Projections',
      questionText:
        'You are designing a wooden bookshelf bracket in the school workshop.\na) State the main difference between an Isometric Drawing and an Orthographic Projection. [2 Marks]\nb) Name three principal views drawn in First Angle Orthographic Projection. [3 Marks]\nc) List two essential drawing instruments used in drafting parallel horizontal and vertical lines. [2 Marks]',
      type: 'structured',
      marks: 7,
      modelAnswer:
        'a) Isometric drawing shows a 3-dimensional view of an object with receding lines drawn at 30° to the horizontal. Orthographic projection represents a 3D object using multiple 2-dimensional flat views (Front, Top/Plan, and End/Side elevations).\nb) 1. Front Elevation (Front View), 2. Plan (Top View), 3. End Elevation (Side View).\nc) T-square (for horizontal parallel lines) and Set Squares (30°-60° or 45° set square for vertical and angled lines) or Drafting Machine / Parallel Ruler.',
      markingGuide: [
        'A1: Explaining 3D pictorial vs 2D multiple projections [2M]',
        'A1 each for Front Elevation, Plan, and End Elevation [3M]',
        'A1 each for T-square and Set Square / Ruler [2M]',
      ],
      rubricEE: 'Demonstrates masterly command of orthographic conventions, projection angles, and workshop drafting tools.',
      rubricME: 'Correctly defines the two drafting modes and lists the 3 standard orthographic views.',
      rubricAE: 'Mentions 2D and 3D but cannot name the 3 specific orthographic views.',
      rubricBE: 'Confuses technical drawing with freehand artistic sketching.',
      competencyTested: 'Spatial communication, graphic drafting and technical precision',
      cognitiveLevel: 'understanding',
    },
    {
      id: 'pretech-02',
      number: 2,
      section: 'B',
      strand: 'Materials and Tools Technology',
      subStrand: 'Workshop Safety & Hand Tools',
      questionText:
        'While working in the Junior School pre-technical workshop, a learner intends to cut a sheet of 2 mm mild steel plate to fabricate a metal hinge.\na) Identify the appropriate hand tool used for cutting thin sheet metal. [1 Mark]\nb) State two safety precautions the learner must observe before and during the cutting operation. [2 Marks]\nc) Describe the procedure for treating a minor cut injury sustained in the workshop. [3 Marks]',
      type: 'structured',
      marks: 6,
      modelAnswer:
        'a) Tinman’s snips (or straight/curved tin snips / hacksaw with fine teeth 24-32 TPI).\nb) Safety precautions:\n1. Wear protective leather gloves and safety goggles/eye protection to shield against metal burrs and sharp edges.\n2. Ensure the sheet metal is securely clamped in a bench vice with soft jaws.\n3. Keep fingers clear of the cutting line and avoid touching burrs with bare hands.\nc) First aid procedure for minor cuts:\n1. Wash hands and clean the wound under cool running water or antiseptic saline.\n2. Apply gentle pressure using a sterile gauze pad to stop any bleeding.\n3. Apply a mild antiseptic ointment and cover with a sterile adhesive bandage (plaster). Report the incident to the teacher.',
      markingGuide: [
        'A1: Tin snips / Hacksaw [1M]',
        'A1 each for two valid workshop safety measures [2M]',
        'A1 for washing/cleaning wound, A1 for applying pressure/antiseptic, A1 for dressing/reporting [3M]',
      ],
      rubricEE: 'Integrates tool selection, rigorous workshop hazard prevention, and emergency first-aid protocols.',
      rubricME: 'Correctly identifies tin snips, gives 2 valid safety rules, and outlines wound dressing.',
      rubricAE: 'Suggests ordinary paper scissors or incomplete first-aid steps.',
      rubricBE: 'Neglects workshop safety regulations.',
      competencyTested: 'Occupational safety, tool handling and first aid response',
      cognitiveLevel: 'application',
    },
    {
      id: 'pretech-03',
      number: 3,
      section: 'B',
      strand: 'Computer Science & Digital Literacy',
      subStrand: 'Algorithms & Block Coding',
      questionText:
        'A school wants to automate the bell ringing system using an embedded microcontroller.\na) Define the term Algorithm in computing. [1 Mark]\nb) Write a simple pseudocode or step-by-step algorithm to sound a buzzer for 5 seconds when the time equals "08:00 AM". [3 Marks]\nc) State two advantages of automated computerized systems over manual bell ringing. [2 Marks]',
      type: 'structured',
      marks: 6,
      modelAnswer:
        'a) An algorithm is a clear, finite sequence of step-by-step instructions or rules designed to solve a specific problem or perform a computation.\nb) Algorithm / Pseudocode:\nSTART\n  Check current system time\n  IF current_time EQUALS "08:00 AM" THEN\n    SET buzzer_pin TO HIGH (Turn ON buzzer)\n    WAIT 5 seconds\n    SET buzzer_pin TO LOW (Turn OFF buzzer)\n  END IF\nEND\nc) Advantages:\n1. High punctuality and precision without human delay or forgetfulness.\n2. Saves labor and allows school staff to concentrate on core instructional duties.',
      markingGuide: [
        'A1: Clear definition of algorithm [1M]',
        'M1: Correct condition check (IF time == 08:00 AM) [1M]',
        'M1: Action on buzzer with 5 seconds duration delay [1M]',
        'A1: Structured layout with START/END [1M]',
        'A1 each for two valid advantages (precision, labor saving) [2M]',
      ],
      rubricEE: 'Creates rigorous algorithmic logic with clear conditionals, timed delays, and articulates digital automation benefits.',
      rubricME: 'Writes viable pseudocode logic and states advantages of automated scheduling.',
      rubricAE: 'Gives basic instructions without conditional logic (IF/THEN).',
      rubricBE: 'Unable to structure sequential steps.',
      competencyTested: 'Computational thinking, problem formulation and algorithmic logic',
      cognitiveLevel: 'creativity',
    },
  ],
  Agriculture: [
    {
      id: 'agri-01',
      number: 1,
      section: 'A',
      strand: 'Crop Production & Soil Science',
      subStrand: 'Nursery Management & Transplating',
      questionText:
        'Learners prepared a tomato seedling nursery bed in the school garden.\na) State two reasons why tiny seeds like tomatoes are first raised in a nursery bed before transplanting. [2 Marks]\nb) Describe two hardening-off practices carried out on seedlings a week before transplanting. [2 Marks]\nc) List two ideal environmental conditions during the actual transplanting exercise. [2 Marks]',
      type: 'structured',
      marks: 6,
      modelAnswer:
        'a) Reasons for nursery bed:\n1. Provides specialized care, protection against harsh weather, pests, and weeds.\n2. Allows selection of only vigorous, healthy seedlings for field planting.\n3. Economizes on water and land during early fragile growth stages.\nb) Hardening-off practices:\n1. Gradually reducing watering frequency to accustom seedlings to water stress.\n2. Gradually removing shade netting/mulch to expose seedlings to direct sunlight.\nc) Ideal transplanting conditions:\n1. Late afternoon (evening) or on a cloudy/overcast day to minimize transpiration shock.\n2. When the soil in the main field is moist and well-tilled.',
      markingGuide: [
        'A1 each for two reasons for nursery propagation [2M]',
        'A1 each for reducing watering and removing shade [2M]',
        'A1 each for late afternoon/cloudy day and moist soil [2M]',
      ],
      rubricEE: 'Demonstrates deep agronomic knowledge of vegetable propagation, physiological stress mitigation, and transplanting.',
      rubricME: 'Explains nursery benefits, hardening off, and optimal timing for transplanting.',
      rubricAE: 'Mentions seedling care but does not accurately describe the hardening-off procedure.',
      rubricBE: 'Confuses nursery practices with harvesting.',
      competencyTested: 'Horticultural skills, environmental adaptation and crop management',
      cognitiveLevel: 'understanding',
    },
    {
      id: 'agri-02',
      number: 2,
      section: 'B',
      strand: 'Animal Production & Husbandry',
      subStrand: 'Poultry Rearing',
      questionText:
        'A farmer in Eldoret keeps 200 indigenous (kienyeji) chickens and wants to boost egg production and flock health.\na) Name two common poultry diseases in Kenya and their causative agents (virus/bacteria). [2 Marks]\nb) Explain three hygiene and biosecurity measures the farmer should implement in the poultry house. [3 Marks]\nc) What is the function of grit (small stones/crushed shells) in a chicken’s digestive system? [1 Mark]',
      type: 'structured',
      marks: 6,
      modelAnswer:
        'a) 1. Newcastle Disease (Viral) | 2. Gumboro / Infectious Bursal Disease (Viral) | 3. Fowl Typhoid (Bacterial) | 4. Coccidiosis (Protozoan).\nb) Biosecurity & Hygiene measures:\n1. Providing a disinfectant footbath at the entrance of the coop.\n2. Regular cleaning and disinfection of feeders, drinkers, and litter/wood shavings.\n3. Restricting unauthorized visitors and wild birds from entering the coop.\nc) Grit is swallowed into the gizzard where it helps mechanically grind and crush hard grains and fibrous feed for easier digestion.',
      markingGuide: [
        'A1 each for two correctly paired poultry diseases and agents [2M]',
        'A1 each for three valid biosecurity measures [3M]',
        'A1 for mechanical grinding of food in the gizzard [1M]',
      ],
      rubricEE: 'Articulates poultry pathology, stringent farm biosecurity protocols, and avian digestive anatomy.',
      rubricME: 'Names valid diseases, biosecurity steps, and explains grit function in the gizzard.',
      rubricAE: 'Mentions disease names without causative agents or gives vague cleaning advice.',
      rubricBE: 'Incorrect poultry husbandry concepts.',
      competencyTested: 'Livestock management, veterinary biosecurity and digestive biology',
      cognitiveLevel: 'application',
    },
  ],
  'Social Studies': [
    {
      id: 'soc-01',
      number: 1,
      section: 'A',
      strand: 'Physical Environment & Geography',
      subStrand: 'Map Reading & Grid References',
      questionText:
        'On a standard 1:50,000 topographical map of Kenya:\na) Calculate the actual distance in kilometers represented by a straight road measuring 14 cm on the map. [2 Marks]\nb) Explain the difference between Eastings and Northings when giving a 6-figure grid reference. [2 Marks]\nc) State two social amenities that indicate the presence of a settlement in an area shown on a map. [2 Marks]',
      type: 'structured',
      marks: 6,
      modelAnswer:
        'a) Scale 1:50,000 means 1 cm on map = 50,000 cm = 0.5 km on ground.\nActual distance = 14 cm × 0.5 km = 7.0 km.\nb) Eastings are vertical grid lines that run from North to South, but their numbers increase towards the East. Northings are horizontal grid lines that run from West to East, but their numbers increase towards the North. Eastings are always read before Northings.\nc) Presence of: Schools, Hospitals/Dispensaries, Churches/Mosques, Police Posts, Market centers.',
      markingGuide: [
        'M1: Conversion factor 1 cm = 0.5 km, A1: 7.0 km [2M]',
        'A1: Eastings definition and direction, A1: Northings definition and direction [2M]',
        'A1 each for two valid social amenities [2M]',
      ],
      rubricEE: 'Flawlessly interprets topographical scale calculations, cartographic grid nomenclature, and settlement features.',
      rubricME: 'Calculates distance = 7 km, distinguishes Eastings/Northings, and lists amenities.',
      rubricAE: 'Calculates distance incorrectly due to unit conversion (e.g. 700 m or 70 km).',
      rubricBE: 'Unable to read map scale or grid orientation.',
      competencyTested: 'Spatial cartography, geographical calculation and settlement analysis',
      cognitiveLevel: 'application',
    },
    {
      id: 'soc-02',
      number: 2,
      section: 'B',
      strand: 'Governance, Citizenship and Human Rights',
      subStrand: 'Constitution of Kenya & Devolution',
      questionText:
        'The Constitution of Kenya 2010 established a devolved system of government.\na) Name the two levels of government created by the Constitution of Kenya. [2 Marks]\nb) State three devolved functions assigned to County Governments. [3 Marks]\nc) Explain two ways in which a Kenyan youth can actively exercise responsible citizenship. [2 Marks]',
      type: 'structured',
      marks: 7,
      modelAnswer:
        'a) 1. National Government | 2. County Governments (47 Counties).\nb) Devolved functions to Counties:\n1. County health facilities and pharmacies.\n2. Agriculture (crop and animal husbandry, livestock sale yards).\n3. Pre-primary education (ECDE) and village polytechnics.\n4. County transport and roads, street lighting, and public amenities.\n5. Refuse removal, waste disposal, and market sanitation.\nc) Responsible citizenship:\n1. Obeying laws and paying lawful taxes when in business/employment.\n2. Participating in public participation forums, community development, and voting.\n3. Protecting the environment and conserving public resources.\n4. Promoting national peace, tolerance, and reporting crime.',
      markingGuide: [
        'A1 each for National and County government [2M]',
        'A1 each for three valid devolved County functions [3M]',
        'A1 each for two civic engagement actions [2M]',
      ],
      rubricEE: 'Articulates constitutional governance framework, statutory devolved mandates, and active civic participation.',
      rubricME: 'Correctly identifies both government tiers, 3 devolved roles, and 2 civic duties.',
      rubricAE: 'Mentions local councils instead of County Governments or lists national functions (e.g. defense).',
      rubricBE: 'Confuses governance roles.',
      competencyTested: 'Constitutional literacy, democratic governance and civic responsibility',
      cognitiveLevel: 'understanding',
    },
  ],
};

/**
 * Intelligent Assessment Paper Builder: Generates a complete exam paper with sections,
 * instructions, learner biodata headers, and marking schemes.
 */
export function generateCustomAssessmentPaper(params: {
  schoolName: string;
  subject: string;
  grade: string;
  term: string;
  year: number;
  assessmentType: string;
  durationMinutes: number;
  targetMarks: number;
  selectedStrands: string[];
}): GeneratedAssessmentPaper {
  const subjectKey = params.subject || 'Mathematics';
  const defaultBank =
    COMPREHENSIVE_QUESTION_BANK[subjectKey] || COMPREHENSIVE_QUESTION_BANK['Mathematics'];

  // Filter or augment questions to reach targetMarks
  let assignedQuestions: GeneratedQuestion[] = [];
  let currentTotal = 0;
  let qNumber = 1;

  // First pick matching questions from bank
  defaultBank.forEach((q) => {
    if (currentTotal + q.marks <= params.targetMarks + 10) {
      assignedQuestions.push({
        ...q,
        number: qNumber++,
      });
      currentTotal += q.marks;
    }
  });

  // If still below target marks, generate contextual complementary items
  if (currentTotal < params.targetMarks) {
    const extraQ: GeneratedQuestion = {
      id: `gen-extra-${Date.now()}`,
      number: qNumber++,
      section: 'C',
      strand: params.selectedStrands[0] || 'Competency Application',
      subStrand: 'Community Problem Solving & Practical Task',
      questionText: `In your local community around ${params.schoolName}, observe a real-life challenge related to ${params.subject}.\na) Formulate a clear problem statement identifying the root causes. [2 Marks]\nb) Propose three practical, cost-effective solutions utilizing available local resources. [3 Marks]\nc) Describe how you would measure the success and environmental impact of your proposed intervention. [2 Marks]`,
      type: 'practical_scenario',
      marks: Math.max(5, params.targetMarks - currentTotal),
      modelAnswer:
        'a) Problem Statement: Highlighting local resource wastage, environmental degradation, or inefficient manual methods.\nb) Solutions: 1. Sensitization and peer collaboration, 2. Recycling and low-cost innovative prototyping, 3. Community engagement and routine monitoring.\nc) Evaluation: Using structured checklists, feedback forms, and before-and-after photographic documentation.',
      markingGuide: [
        'A2: Clear problem formulation with evidence from local context',
        'A3: Three innovative, feasible, and sustainable solutions',
        'A2: Concrete evaluation criteria and environmental safeguard metrics',
      ],
      rubricEE: 'Formulates an exceptional, evidence-based community project with measurable impact metrics.',
      rubricME: 'Provides a coherent problem statement, practical solutions, and basic verification.',
      rubricAE: 'Suggests generic solutions without contextual problem breakdown.',
      rubricBE: 'Incomplete or unfeasible proposal.',
      competencyTested: 'Problem-solving, critical inquiry, digital & community citizenship',
      cognitiveLevel: 'creativity',
    };
    assignedQuestions.push(extraQ);
    currentTotal += extraQ.marks;
  }

  // Partition into Sections A, B, C
  const sectionAQuestions = assignedQuestions.filter((q) => q.section === 'A' || q.number <= 2);
  const sectionBQuestions = assignedQuestions.filter((q) => q.section === 'B' || (q.number > 2 && q.number <= 4));
  const sectionCQuestions = assignedQuestions.filter((q) => q.section === 'C' || q.number > 4);

  const sections: AssessmentSection[] = [
    {
      sectionLetter: 'A',
      title: 'SECTION A: Basic Concepts & Foundation Knowledge',
      description: 'Answer all questions in this section in the spaces provided.',
      totalMarks: sectionAQuestions.reduce((sum, q) => sum + q.marks, 0),
      questions: sectionAQuestions,
    },
    {
      sectionLetter: 'B',
      title: 'SECTION B: Structured Analysis & Problem Solving',
      description: 'Show all your working clearly. Marks may be awarded for correct steps.',
      totalMarks: sectionBQuestions.reduce((sum, q) => sum + q.marks, 0),
      questions: sectionBQuestions,
    },
  ];

  if (sectionCQuestions.length > 0) {
    sections.push({
      sectionLetter: 'C' as const,
      title: 'SECTION C: Competency & Practical Case Study',
      description: 'Synthesize concepts to address real-world community challenges.',
      totalMarks: sectionCQuestions.reduce((sum, q) => sum + q.marks, 0),
      questions: sectionCQuestions,
    });
  }

  const finalTotalMarks = sections.reduce((sum, s) => sum + s.totalMarks, 0);

  return {
    id: `paper-${Date.now()}`,
    title: `${params.grade} ${params.subject.toUpperCase()} ${params.assessmentType.toUpperCase()}`,
    schoolName: params.schoolName || 'NGONYEK JUNIOR SCHOOL',
    subject: params.subject,
    grade: params.grade,
    term: params.term,
    year: params.year,
    assessmentType: params.assessmentType,
    durationMinutes: params.durationMinutes,
    totalMarks: finalTotalMarks,
    instructions: [
      'Write your Name, Admission Number, Grade, and Stream in the spaces provided above.',
      'This question paper consists of three sections: Section A, Section B, and Section C.',
      'Answer ALL questions in the spaces provided below each question.',
      'All working MUST be clearly shown where necessary.',
      'Non-programmable silent electronic calculators and mathematical tables may be used where appropriate.',
      'Candidates should check the question paper to ascertain that all pages are printed and that no questions are missing.',
    ],
    strandsCovered: params.selectedStrands.length > 0 ? params.selectedStrands : ['Core Syllabus Strands'],
    sections,
    createdDate: new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
  };
}
