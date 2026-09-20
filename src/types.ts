export type NavigationTab = 
  | 'home' 
  | 'parts' 
  | 'part-detail' 
  | 'workshop' 
  | 'assembly' 
  | 'troubleshooting' 
  | 'quizzes' 
  | 'resources';

export interface Hotspot {
  id: string;
  label: string;
  position: string;
  normal: string;
  description: string;
  leaderDirection?: 'left' | 'right' | 'top' | 'bottom';
  step?: string;
}

export interface SpecItem {
  key: string;
  value: string;
}

export interface QuizQuestion {
  question: string;
  answers: {
    text: string;
    correct: boolean;
    explanation: string;
  }[];
}

export interface Part {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  role: string;
  model: string;
  shortDescription: string;
  description: string;
  specs: SpecItem[];
  note: string;
  thinkAbout: string;
  hotspots: Hotspot[];
  quiz: QuizQuestion[];
  nextPartId?: string;
}

export interface AssemblyStep {
  id: number;
  step?: number;
  stepNumber?: number;
  title: string;
  component: string;
  description?: string;
  warning?: string | null;
  safetyWarning?: string | null;
  partId?: string | null;
  instructions: string[];
  focusHotspotId?: string;
  cameraOrbit?: string;
  model: string;
  status?: 'completed' | 'current' | 'pending';
}

export interface BiosBeep {
  pattern: string;
  rawPattern?: string;
  soundSequence: number[]; // e.g. [1, 1, 2, 3]
  meaning: string;
  description: string;
  solution: string;
}

export interface DiagnosticQuestion {
  id: string;
  text: string;
  hint?: string;
  yesNext: string;
  noNext: string;
}

export interface DiagnosisResult {
  id: string;
  title: string;
  cause: string;
  fixSteps: string[];
  severity: 'low' | 'medium' | 'high';
  relatedPartId?: string;
}

export interface TroubleshootingSymptom {
  id: string;
  title: string;
  englishTitle: string;
  icon?: string;
  symptomDescription: string;
  rootQuestionId: string;
  questions: Record<string, DiagnosticQuestion>;
  diagnoses: Record<string, DiagnosisResult>;
}

export interface TroubleshootingScenario {
  id: string;
  title: string;
  iconName: string;
  symptom: string;
  possibleCauses: string[];
  diagnosticSteps: string[];
  beepReference?: string;
}

export interface QuizQuestion {
  id?: string;
  partId?: string;
  question: string;
  answers: {
    text: string;
    correct: boolean;
    explanation: string;
  }[];
  easierFollowUp?: {
    question: string;
    answers: {
      text: string;
      correct: boolean;
      explanation: string;
    }[];
  };
}

export interface QuizItem {
  id: string;
  title: string;
  category: 'all' | 'parts' | 'assembly' | 'troubleshooting' | 'safety';
  categoryLabel?: string;
  questionCount: number;
  difficulty: 'آسان' | 'متوسط' | 'سخت';
  description?: string;
  questions: QuizQuestion[];
}

export interface ResourceItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  duration: string;
  type: 'video' | 'guide';
  thumbnailUrl: string;
}
