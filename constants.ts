import { Subject, Chapter, Priority, PYQYearData } from './types';

export const EXAM_DATE = '2026-01-21';

const generatePYQsWithLink = (chapterId: string): PYQYearData[] => {
  const link = `https://web.getmarks.app/cpyqbV3/exam/615f0e999476412f48314daf/chapters/${chapterId}`;
  return [
    { year: 2025, done: 0, total: 30, link, completed: false },
    { year: 2024, done: 0, total: 30, link, completed: false },
    { year: 2023, done: 0, total: 30, link, completed: false },
    { year: 2022, done: 0, total: 30, link, completed: false },
    { year: 2021, done: 0, total: 30, link, completed: false },
  ];
};

export const INITIAL_CHAPTERS: Chapter[] = [
  // Physics
  // Priority A
  { id: 'p0', name: 'Current Electricity', subject: Subject.PHYSICS, unit: 'Current Electricity', priority: Priority.A, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e30'), remarks: '', studyLinks: '' },
  { id: 'p1', name: 'Electrostatics', subject: Subject.PHYSICS, unit: 'Electrostatics', priority: Priority.A, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e2d'), remarks: '', studyLinks: '' },
  { id: 'p2', name: 'Magnetic Effects of Current', subject: Subject.PHYSICS, unit: 'Magnetic Effects of Current & Magnetism', priority: Priority.A, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e33'), remarks: '', studyLinks: '' },
  { id: 'p3', name: 'Laws of Motion', subject: Subject.PHYSICS, unit: 'Mechanics', priority: Priority.A, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e18'), remarks: '', studyLinks: '' },
  { id: 'p4', name: 'Gravitation', subject: Subject.PHYSICS, unit: 'Mechanics', priority: Priority.A, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e21'), remarks: '', studyLinks: '' },
  { id: 'p5', name: 'Atomic Physics', subject: Subject.PHYSICS, unit: 'Modern Physics', priority: Priority.A, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e42'), remarks: '', studyLinks: '' },
  { id: 'p6', name: 'Dual Nature of Matter', subject: Subject.PHYSICS, unit: 'Modern Physics', priority: Priority.A, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e41'), remarks: '', studyLinks: '' },

  // Priority B
  { id: 'p7', name: 'Mathematics in Physics', subject: Subject.PHYSICS, unit: 'General Physics', priority: Priority.B, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e12'), remarks: '', studyLinks: '' },
  { id: 'p8', name: 'Units & Dimensions', subject: Subject.PHYSICS, unit: 'General Physics', priority: Priority.B, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e13'), remarks: '', studyLinks: '' },
  { id: 'p9', name: 'Semiconductors', subject: Subject.PHYSICS, unit: 'Modern Physics', priority: Priority.B, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e45'), remarks: '', studyLinks: '' },
  { id: 'p10', name: 'Motion in One Dimension', subject: Subject.PHYSICS, unit: 'Mechanics', priority: Priority.B, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e16'), remarks: '', studyLinks: '' },
  { id: 'p11', name: 'Wave Optics', subject: Subject.PHYSICS, unit: 'Optics', priority: Priority.B, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e3f'), remarks: '', studyLinks: '' },
  { id: 'p12', name: 'Ray Optics', subject: Subject.PHYSICS, unit: 'Optics', priority: Priority.B, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e3c'), remarks: '', studyLinks: '' },
  { id: 'p13', name: 'Alternating Current', subject: Subject.PHYSICS, unit: 'Electromagnetic Induction & AC', priority: Priority.B, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e37'), remarks: '', studyLinks: '' },
  { id: 'p14', name: 'Thermodynamics', subject: Subject.PHYSICS, unit: 'Thermal Physics', priority: Priority.B, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e2a'), remarks: '', studyLinks: '' },
  { id: 'p15', name: 'Mechanical Properties of Fluids', subject: Subject.PHYSICS, unit: 'Properties of Matter', priority: Priority.B, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e25'), remarks: '', studyLinks: '' },

  // Priority C
  { id: 'p16', name: 'Work, Power & Energy', subject: Subject.PHYSICS, unit: 'Mechanics', priority: Priority.C, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e1a'), remarks: '', studyLinks: '' },
  { id: 'p17', name: 'Capacitance', subject: Subject.PHYSICS, unit: 'Electrostatics', priority: Priority.C, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e2e'), remarks: '', studyLinks: '' },
  { id: 'p18', name: 'Nuclear Physics', subject: Subject.PHYSICS, unit: 'Modern Physics', priority: Priority.C, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e43'), remarks: '', studyLinks: '' },
  { id: 'p19', name: 'Kinetic Theory of Gases', subject: Subject.PHYSICS, unit: 'Thermal Physics', priority: Priority.C, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e29'), remarks: '', studyLinks: '' },
  { id: 'p20', name: 'Electromagnetic Waves', subject: Subject.PHYSICS, unit: 'Electromagnetic Waves', priority: Priority.C, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e3a'), remarks: '', studyLinks: '' },
  { id: 'p21', name: 'Waves & Sound', subject: Subject.PHYSICS, unit: 'Waves & SHM', priority: Priority.C, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e39'), remarks: '', studyLinks: '' },
  { id: 'p22', name: 'Rotational Motion', subject: Subject.PHYSICS, unit: 'Mechanics', priority: Priority.C, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e1f'), remarks: '', studyLinks: '' },

  // Priority D
  { id: 'p23', name: 'Motion in Two Dimensions', subject: Subject.PHYSICS, unit: 'Mechanics', priority: Priority.D, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e17'), remarks: '', studyLinks: '' },
  { id: 'p24', name: 'Electromagnetic Induction', subject: Subject.PHYSICS, unit: 'Electromagnetic Induction & AC', priority: Priority.D, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e36'), remarks: '', studyLinks: '' },
  { id: 'p25', name: 'Oscillations', subject: Subject.PHYSICS, unit: 'Waves & SHM', priority: Priority.D, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e2b'), remarks: '', studyLinks: '' },
  { id: 'p26', name: 'Communication Systems', subject: Subject.PHYSICS, unit: 'Communication Systems', priority: Priority.D, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e46'), remarks: '', studyLinks: '' },
  { id: 'p27', name: 'Mechanical Properties of Solids', subject: Subject.PHYSICS, unit: 'Properties of Matter', priority: Priority.D, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e24'), remarks: '', studyLinks: '' },
  { id: 'p28', name: 'Centre of Mass, Momentum & Collision', subject: Subject.PHYSICS, unit: 'Mechanics', priority: Priority.D, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e1c'), remarks: '', studyLinks: '' },
  { id: 'p29', name: 'Thermal Properties of Matter', subject: Subject.PHYSICS, unit: 'Thermal Physics', priority: Priority.D, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e28'), remarks: '', studyLinks: '' },
  { id: 'p30', name: 'Experimental Physics', subject: Subject.PHYSICS, unit: 'General Physics', priority: Priority.D, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e14'), remarks: '', studyLinks: '' },
  { id: 'p31', name: 'Magnetic Properties of Matter', subject: Subject.PHYSICS, unit: 'Magnetic Effects of Current & Magnetism', priority: Priority.D, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e34'), remarks: '', studyLinks: '' },

  // Chemistry
  // Priority A
  { id: 'c0', name: 'General Organic Chemistry', subject: Subject.CHEMISTRY, unit: 'Organic Chemistry', priority: Priority.A, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e7a'), remarks: '', studyLinks: '' },
  { id: 'c1', name: 'Hydrocarbons', subject: Subject.CHEMISTRY, unit: 'Organic Chemistry', priority: Priority.A, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e7b'), remarks: '', studyLinks: '' },
  { id: 'c2', name: 'Chemical Bonding & Molecular Structure', subject: Subject.CHEMISTRY, unit: 'Inorganic Chemistry', priority: Priority.A, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e55'), remarks: '', studyLinks: '' },
  { id: 'c3', name: 'Coordination Compounds', subject: Subject.CHEMISTRY, unit: 'Inorganic Chemistry', priority: Priority.A, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e76'), remarks: '', studyLinks: '' },
  { id: 'c4', name: 'd & f Block Elements', subject: Subject.CHEMISTRY, unit: 'Inorganic Chemistry', priority: Priority.A, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e75'), remarks: '', studyLinks: '' },
  { id: 'c5', name: 'Structure of Atom', subject: Subject.CHEMISTRY, unit: 'Physical Chemistry', priority: Priority.A, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e52'), remarks: '', studyLinks: '' },
  { id: 'c6', name: 'Solutions', subject: Subject.CHEMISTRY, unit: 'Physical Chemistry', priority: Priority.A, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e67'), remarks: '', studyLinks: '' },
  
  // Priority B
  { id: 'c7', name: 'Thermodynamics (Chemistry)', subject: Subject.CHEMISTRY, unit: 'Physical Chemistry', priority: Priority.B, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e5b'), remarks: '', studyLinks: '' },
  { id: 'c8', name: 'Electrochemistry', subject: Subject.CHEMISTRY, unit: 'Physical Chemistry', priority: Priority.B, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e69'), remarks: '', studyLinks: '' },
  { id: 'c9', name: 'Alcohols, Phenols & Ethers', subject: Subject.CHEMISTRY, unit: 'Organic Chemistry', priority: Priority.B, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e7e'), remarks: '', studyLinks: '' },
  { id: 'c10', name: 'Aldehydes & Ketones', subject: Subject.CHEMISTRY, unit: 'Organic Chemistry', priority: Priority.B, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e7f'), remarks: '', studyLinks: '' },
  { id: 'c11', name: 'Amines', subject: Subject.CHEMISTRY, unit: 'Organic Chemistry', priority: Priority.B, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e81'), remarks: '', studyLinks: '' },
  { id: 'c12', name: 'Biomolecules', subject: Subject.CHEMISTRY, unit: 'Organic Chemistry', priority: Priority.B, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e82'), remarks: '', studyLinks: '' },

  // Priority C
  { id: 'c13', name: 'Classification of Elements & Periodicity', subject: Subject.CHEMISTRY, unit: 'Inorganic Chemistry', priority: Priority.C, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e53'), remarks: '', studyLinks: '' },
  { id: 'c14', name: 'Some Basic Concepts of Chemistry', subject: Subject.CHEMISTRY, unit: 'Physical Chemistry', priority: Priority.C, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e51'), remarks: '', studyLinks: '' },
  { id: 'c15', name: 'Redox Reactions', subject: Subject.CHEMISTRY, unit: 'Physical Chemistry', priority: Priority.C, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e5d'), remarks: '', studyLinks: '' },
  { id: 'c16', name: 'Chemical Kinetics', subject: Subject.CHEMISTRY, unit: 'Physical Chemistry', priority: Priority.C, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e6b'), remarks: '', studyLinks: '' },
  { id: 'c17', name: 'Haloalkanes & Haloarenes', subject: Subject.CHEMISTRY, unit: 'Organic Chemistry', priority: Priority.C, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e7d'), remarks: '', studyLinks: '' },

  // Priority D
  { id: 'c18', name: 'Chemical Equilibrium', subject: Subject.CHEMISTRY, unit: 'Physical Chemistry', priority: Priority.D, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e5f'), remarks: '', studyLinks: '' },
  { id: 'c19', name: 'Ionic Equilibrium', subject: Subject.CHEMISTRY, unit: 'Physical Chemistry', priority: Priority.D, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e60'), remarks: '', studyLinks: '' },
  { id: 'c20', name: 'p-Block Elements', subject: Subject.CHEMISTRY, unit: 'Inorganic Chemistry', priority: Priority.D, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e74'), remarks: '', studyLinks: '' },
  { id: 'c21', name: 'Carboxylic Acid Derivatives', subject: Subject.CHEMISTRY, unit: 'Organic Chemistry', priority: Priority.D, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e80'), remarks: '', studyLinks: '' },
  { id: 'c22', name: 'Practical Chemistry', subject: Subject.CHEMISTRY, unit: 'Practical Chemistry', priority: Priority.D, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e86'), remarks: '', studyLinks: '' },
  { id: 'c23', name: 'Solid State', subject: Subject.CHEMISTRY, unit: 'Physical Chemistry', priority: Priority.D, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e65'), remarks: '', studyLinks: '' },
  { id: 'c24', name: 'Hydrogen', subject: Subject.CHEMISTRY, unit: 'Inorganic Chemistry', priority: Priority.D, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e71'), remarks: '', studyLinks: '' },
  { id: 'c25', name: 's-Block Elements', subject: Subject.CHEMISTRY, unit: 'Inorganic Chemistry', priority: Priority.D, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e72'), remarks: '', studyLinks: '' },
  { id: 'c26', name: 'General Principles & Processes of Isolation of Metals', subject: Subject.CHEMISTRY, unit: 'Inorganic Chemistry', priority: Priority.D, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e73'), remarks: '', studyLinks: '' },
  { id: 'c27', name: 'Surface Chemistry', subject: Subject.CHEMISTRY, unit: 'Physical Chemistry', priority: Priority.D, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e6d'), remarks: '', studyLinks: '' },
  { id: 'c28', name: 'Environmental Chemistry', subject: Subject.CHEMISTRY, unit: 'Applied Chemistry', priority: Priority.D, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e7c'), remarks: '', studyLinks: '' },
  { id: 'c29', name: 'Polymers', subject: Subject.CHEMISTRY, unit: 'Applied Chemistry', priority: Priority.D, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e84'), remarks: '', studyLinks: '' },
  { id: 'c30', name: 'Chemistry in Everyday Life', subject: Subject.CHEMISTRY, unit: 'Applied Chemistry', priority: Priority.D, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e85'), remarks: '', studyLinks: '' },
  
  // Mathematics
  // Priority A
  { id: 'm0', name: 'Vector Algebra', subject: Subject.MATHEMATICS, unit: 'Vectors & 3D Geometry', priority: Priority.A, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314eb2'), remarks: '', studyLinks: '' },
  { id: 'm1', name: 'Three Dimensional Geometry', subject: Subject.MATHEMATICS, unit: 'Vectors & 3D Geometry', priority: Priority.A, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314eb3'), remarks: '', studyLinks: '' },
  { id: 'm2', name: 'Sequences & Series', subject: Subject.MATHEMATICS, unit: 'Algebra', priority: Priority.A, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314ea3'), remarks: '', studyLinks: '' },
  { id: 'm3', name: 'Binomial Theorem', subject: Subject.MATHEMATICS, unit: 'Algebra', priority: Priority.A, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314ea2'), remarks: '', studyLinks: '' },
  { id: 'm4', name: 'Functions', subject: Subject.MATHEMATICS, unit: 'Calculus', priority: Priority.A, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314ea8'), remarks: '', studyLinks: '' },
  { id: 'm5', name: 'Definite Integration', subject: Subject.MATHEMATICS, unit: 'Calculus', priority: Priority.A, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314eac'), remarks: '', studyLinks: '' },
  { id: 'm6', name: 'Differential Equations', subject: Subject.MATHEMATICS, unit: 'Calculus', priority: Priority.A, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314eae'), remarks: '', studyLinks: '' },
  
  // Priority B
  { id: 'm7', name: 'Matrices', subject: Subject.MATHEMATICS, unit: 'Algebra', priority: Priority.B, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314ea5'), remarks: '', studyLinks: '' },
  { id: 'm8', name: 'Determinants', subject: Subject.MATHEMATICS, unit: 'Algebra', priority: Priority.B, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314ea6'), remarks: '', studyLinks: '' },
  { id: 'm9', name: 'Application of Derivatives', subject: Subject.MATHEMATICS, unit: 'Calculus', priority: Priority.B, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314eab'), remarks: '', studyLinks: '' },
  { id: 'm10', name: 'Statistics', subject: Subject.MATHEMATICS, unit: 'Algebra', priority: Priority.B, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314eb1'), remarks: '', studyLinks: '' },
  { id: 'm11', name: 'Straight Lines', subject: Subject.MATHEMATICS, unit: 'Coordinate Geometry', priority: Priority.B, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314ea0'), remarks: '', studyLinks: '' },
  { id: 'm12', name: 'Permutations & Combinations', subject: Subject.MATHEMATICS, unit: 'Algebra', priority: Priority.B, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314ea1'), remarks: '', studyLinks: '' },
  { id: 'm13', name: 'Probability', subject: Subject.MATHEMATICS, unit: 'Algebra', priority: Priority.B, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314eb0'), remarks: '', studyLinks: '' },
  { id: 'm14', name: 'Complex Numbers', subject: Subject.MATHEMATICS, unit: 'Algebra', priority: Priority.B, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e9e'), remarks: '', studyLinks: '' },

  // Priority C
  { id: 'm15', name: 'Quadratic Equations', subject: Subject.MATHEMATICS, unit: 'Algebra', priority: Priority.C, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314e9f'), remarks: '', studyLinks: '' },
  { id: 'm16', name: 'Circle', subject: Subject.MATHEMATICS, unit: 'Coordinate Geometry', priority: Priority.C, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314eb4'), remarks: '', studyLinks: '' },
  { id: 'm17', name: 'Limits', subject: Subject.MATHEMATICS, unit: 'Calculus', priority: Priority.C, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314ea9'), remarks: '', studyLinks: '' },
  { id: 'm18', name: 'Area Under Curves', subject: Subject.MATHEMATICS, unit: 'Calculus', priority: Priority.C, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314ead'), remarks: '', studyLinks: '' },
  { id: 'm19', name: 'Sets & Relations', subject: Subject.MATHEMATICS, unit: 'Algebra', priority: Priority.C, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314ea7'), remarks: '', studyLinks: '' },
  { id: 'm20', name: 'Differentiation basics', subject: Subject.MATHEMATICS, unit: 'Calculus', priority: Priority.C, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314eaa'), remarks: '', studyLinks: '' },
  { id: 'm21', name: 'Continuity & Differentiability', subject: Subject.MATHEMATICS, unit: 'Calculus', priority: Priority.C, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314eaa'), remarks: '', studyLinks: '' },

  // Priority D
  { id: 'm22', name: 'Parabola', subject: Subject.MATHEMATICS, unit: 'Coordinate Geometry', priority: Priority.D, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314eb5'), remarks: '', studyLinks: '' },
  { id: 'm23', name: 'Ellipse', subject: Subject.MATHEMATICS, unit: 'Coordinate Geometry', priority: Priority.D, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314eb6'), remarks: '', studyLinks: '' },
  { id: 'm24', name: 'Hyperbola', subject: Subject.MATHEMATICS, unit: 'Coordinate Geometry', priority: Priority.D, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314eb7'), remarks: '', studyLinks: '' },
  { id: 'm25', name: 'Inverse Trig Functions', subject: Subject.MATHEMATICS, unit: 'Trigonometry', priority: Priority.D, confidence: 0, rev1: false, rev2: false, pyqs: generatePYQsWithLink('615f0e999476412f48314eaf'), remarks: '', studyLinks: '' },
];