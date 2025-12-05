import { SubjectScore, TestRecord, TestType } from '../types';

export const calculateSubjectStats = (score: SubjectScore) => {
  if (!score) return { marks: 0, accuracy: 0 };
  const { correct, incorrect } = score;
  const marks = correct * 4 - incorrect;
  const attempted = correct + incorrect;
  const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
  return { marks, accuracy };
};

export const calculateOverallStats = (scores: TestRecord['scores']) => {
  if (!scores) return { totalMarks: 0, overallAccuracy: 0, totalCorrect: 0, totalIncorrect: 0, totalUnattempted: 0 };

  const physics = scores.physics || { correct: 0, incorrect: 0, unattempted: 0 };
  const chemistry = scores.chemistry || { correct: 0, incorrect: 0, unattempted: 0 };
  const maths = scores.maths || { correct: 0, incorrect: 0, unattempted: 0 };
  
  const totalCorrect = physics.correct + chemistry.correct + maths.correct;
  const totalIncorrect = physics.incorrect + chemistry.incorrect + maths.incorrect;
  const totalUnattempted = physics.unattempted + chemistry.unattempted + maths.unattempted;
  
  const totalMarks = totalCorrect * 4 - totalIncorrect;
  const totalAttempted = totalCorrect + totalIncorrect;
  const overallAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
  
  return {
    totalMarks,
    overallAccuracy,
    totalCorrect,
    totalIncorrect,
    totalUnattempted,
  };
};

export const getTestTypeColor = (type: TestType) => {
    switch(type) {
        case TestType.FULL_SYLLABUS: return 'bg-red-500/20 text-red-500 border-red-500/30';
        case TestType.PART_TEST: return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
        case TestType.CHAPTER_WISE: return 'bg-indigo-500/20 text-indigo-500 border-indigo-500/30';
        case TestType.PYQ_MOCK: return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30';
        default: return 'bg-slate-500/20 text-slate-500 border-slate-500/30';
    }
}

export const getTestTypeDotColor = (type: TestType): string => {
    switch(type) {
        case TestType.FULL_SYLLABUS: return 'bg-indigo-500';
        case TestType.PART_TEST: return 'bg-sky-400';
        case TestType.CHAPTER_WISE: return 'bg-purple-500';
        case TestType.PYQ_MOCK: return 'bg-orange-500';
        default: return 'bg-slate-500';
    }
}

export const emptyScores = (): TestRecord['scores'] => ({
    physics: { correct: 0, incorrect: 0, unattempted: 0 },
    chemistry: { correct: 0, incorrect: 0, unattempted: 0 },
    maths: { correct: 0, incorrect: 0, unattempted: 0 },
});