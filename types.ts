

export enum Subject {
  PHYSICS = 'Physics',
  CHEMISTRY = 'Chemistry',
  MATHEMATICS = 'Mathematics'
}

export enum Priority {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D'
}

export interface PYQYearData {
  year: number;
  done: number;
  total: number;
  link: string;
  completed: boolean;
}

export interface Chapter {
  id: string;
  name:string;
  subject: Subject;
  unit: string;
  priority: Priority;
  confidence: number; // 0-100
  rev1: boolean;
  rev2: boolean;
  pyqs: PYQYearData[];
  remarks?: string;
  studyLinks?: string;
}

export interface RevisionTile {
  id: string;
  chapterId: string; // References Chapter.id
  subject: Subject;
  startDate: string; // ISO Date string
  endDate: string; // ISO Date string
  targetQ: number;
  attemptedQ: number;
  notes?: string;
}

export enum TestType {
  FULL_SYLLABUS = 'Full Syllabus',
  PART_TEST = 'Part Test',
  CHAPTER_WISE = 'Chapter Wise',
  PYQ_MOCK = 'PYQ Mock'
}

export interface SubjectScore {
  correct: number;
  incorrect: number;
  unattempted: number;
}

export interface TestRecord {
  id: string;
  name: string;
  date: string; // ISO Date string
  type: TestType;
  subject?: Subject; // For single-subject tests like Part Test or Chapter Wise
  linkedChapters?: string[]; // Array of Chapter IDs
  timeTaken?: string; // e.g., "02:45" (HH:MM)
  notes?: string;
  scores: {
    physics: SubjectScore;
    chemistry: SubjectScore;
    maths: SubjectScore;
  };
}

export interface DailyLog {
  id: string;
  date: string; // ISO Date string (YYYY-MM-DD)
  physicsQ: number;
  chemistryQ: number;
  mathQ: number;
  studyTime: number; // Minutes
  remarks?: string;
}

export interface PlannerTask {
  id: string;
  date: string; // ISO Date string (YYYY-MM-DD)
  chapterId: string;
  remark: string;
  completed: boolean;
}

export type AppState = {
  chapters: Chapter[];
  revisionTiles: RevisionTile[];
  tests: TestRecord[];
  logs: DailyLog[];
  plannerTasks: PlannerTask[];
  theme?: 'dark' | 'light';
};

// AI Related Types
export interface ToolCall {
  name: string;
  args: Record<string, any>;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface AIResponse {
  text: string;
  toolCalls: ToolCall[];
}