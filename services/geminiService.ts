




import { GoogleGenAI, FunctionDeclaration, Type } from "@google/genai";
import { AppState, AIResponse, ChatMessage, TestType } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    // FIX: Updated error message to not reference environment files, as per guidelines.
    throw new Error("API Key not found.");
  }
  return new GoogleGenAI({ apiKey });
};

// --- Tool Definitions ---

const addChapterTool: FunctionDeclaration = {
  name: "addChapter",
  description: "Add a new chapter to the syllabus tracker.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "Name of the chapter" },
      subject: { type: Type.STRING, description: "Subject (Physics, Chemistry, Mathematics)" },
      unit: { type: Type.STRING, description: "Unit or Tag (e.g. Mechanics)" },
      priority: { type: Type.STRING, description: "Priority (A, B, C, D)" }
    },
    required: ["name", "subject"]
  }
};

const updateChapterTool: FunctionDeclaration = {
  name: "updateChapter",
  description: "Update details of an existing chapter. Use this to change priority, confidence, unit/tag or toggle revision checkboxes.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      chapterName: { type: Type.STRING, description: "Name of the chapter to update (fuzzy match)" },
      unit: { type: Type.STRING, description: "New unit/tag for the chapter. Use an empty string to remove it." },
      priority: { type: Type.STRING, description: "New Priority (A, B, C, D)" },
      confidence: { type: Type.NUMBER, description: "New Confidence level (0-100)" },
      rev1: { type: Type.BOOLEAN, description: "Set Revision 1 status" },
      rev2: { type: Type.BOOLEAN, description: "Set Revision 2 status" },
      remarks: { type: Type.STRING, description: "Update remarks" }
    },
    required: ["chapterName"]
  }
};

const bulkUpdateChaptersTool: FunctionDeclaration = {
  name: "bulkUpdateChapters",
  description: "Update multiple chapters at once based on a filter. Use this for requests like 'remove the X tag from all chapters'.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      filterUnit: { type: Type.STRING, description: "Optional. Filter chapters that currently have this unit/tag name." },
      updateUnit: { type: Type.STRING, description: "The new value for the unit/tag. Use an empty string to remove the tag." },
    },
    required: ["updateUnit"]
  }
};

const updatePYQTool: FunctionDeclaration = {
  name: "updatePYQ",
  description: "Update PYQ status for a specific year of a chapter.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      chapterName: { type: Type.STRING, description: "Name of the chapter" },
      year: { type: Type.NUMBER, description: "Year (2021-2025)" },
      completed: { type: Type.BOOLEAN, description: "Mark as completed?" },
      done: { type: Type.NUMBER, description: "Number of questions done" }
    },
    required: ["chapterName", "year"]
  }
};

const addTestTool: FunctionDeclaration = {
  name: "addTest",
  description: "Record a new mock test or exam with detailed scores.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "Name of the test" },
      date: { type: Type.STRING, description: "Date YYYY-MM-DD" },
      type: { type: Type.STRING, description: `Type of test. Options: "${Object.values(TestType).join('", "')}"` },
      notes: { type: Type.STRING, description: "Notes or analysis for the test" },
      physics_correct: { type: Type.NUMBER, description: "Number of correct Physics questions" },
      physics_incorrect: { type: Type.NUMBER, description: "Number of incorrect Physics questions" },
      physics_unattempted: { type: Type.NUMBER, description: "Number of unattempted Physics questions" },
      chemistry_correct: { type: Type.NUMBER, description: "Number of correct Chemistry questions" },
      chemistry_incorrect: { type: Type.NUMBER, description: "Number of incorrect Chemistry questions" },
      chemistry_unattempted: { type: Type.NUMBER, description: "Number of unattempted Chemistry questions" },
      maths_correct: { type: Type.NUMBER, description: "Number of correct Mathematics questions" },
      maths_incorrect: { type: Type.NUMBER, description: "Number of incorrect Mathematics questions" },
      maths_unattempted: { type: Type.NUMBER, description: "Number of unattempted Mathematics questions" },
    },
    required: ["name", "date"]
  }
};

const addRevisionTool: FunctionDeclaration = {
  name: "addRevisionPlan",
  description: "Schedule a revision block.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      chapterName: { type: Type.STRING, description: "Chapter name" },
      startDate: { type: Type.STRING, description: "Start date YYYY-MM-DD" },
      endDate: { type: Type.STRING, description: "End date YYYY-MM-DD" },
      targetQ: { type: Type.NUMBER, description: "Target questions" },
      notes: { type: Type.STRING, description: "Brief notes about this revision plan" }
    },
    required: ["chapterName", "startDate", "endDate"]
  }
};

const logDailyTool: FunctionDeclaration = {
  name: "logDailyProgress",
  description: "Log study progress for a specific date.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      date: { type: Type.STRING, description: "Date YYYY-MM-DD" },
      physicsQ: { type: Type.NUMBER, description: "Physics questions solved" },
      chemistryQ: { type: Type.NUMBER, description: "Chemistry questions solved" },
      mathQ: { type: Type.NUMBER, description: "Math questions solved" },
      studyTime: { type: Type.NUMBER, description: "Study time in minutes" },
      remarks: { type: Type.STRING, description: "Daily remarks" }
    },
    required: ["date"]
  }
};

const deleteTool: FunctionDeclaration = {
  name: "deleteItem",
  description: "Delete a chapter, test, or revision plan.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      type: { type: Type.STRING, description: "Type: 'chapter', 'test', 'revision'" },
      identifier: { type: Type.STRING, description: "Name of chapter/test to delete, or description" }
    },
    required: ["type", "identifier"]
  }
};

const exportDataTool: FunctionDeclaration = {
  name: "exportData",
  description: "Export all app data (backup) to a JSON file.",
  parameters: {
    type: Type.OBJECT,
    properties: {},
  }
};

const exportLogsTool: FunctionDeclaration = {
  name: "exportLogs",
  description: "Export daily study logs to a CSV file.",
  parameters: {
    type: Type.OBJECT,
    properties: {},
  }
};

export const getStudyAdvice = async (
  query: string, 
  history: ChatMessage[],
  context: AppState
): Promise<AIResponse> => {
  try {
    const ai = getClient();
    
    // Concise context summary to save tokens but provide info
    const chapterList = context.chapters.map(c => 
      `${c.name} (${c.subject}, Prio:${c.priority}, Conf:${c.confidence}%)`
    ).join(' | ');

    const prompt = `
      You are 'Max', the ultimate AI protocol for the Maximus JEE app.
      You have ABSOLUTE POWER to manage the user's study data. 
      Priority is ranked A (highest) > B > C > D (lowest).
      
      CURRENT STATE:
      - Chapters: ${chapterList}
      - Tests: ${context.tests.map(t => `${t.name} (${t.type})`).join(', ')}
      - Logs: ${context.logs.length} entries recorded.
      - Today: ${new Date().toISOString().split('T')[0]}

      YOUR CAPABILITIES:
      1. Add/Update/Delete Chapters, Tests, Revision Plans.
      2. Log daily progress.
      3. Update specific PYQ details (checkboxes, counts).
      4. Export data (JSON backup) or logs (CSV).
      5. Be direct. If the user says "I did 50 physics qs today", use the log tool immediately.
      6. If asked to delete, find the closest matching name.
      7. For bulk updates like "remove tag X from all chapters", use the bulkUpdateChapters tool.

      CHAT HISTORY:
      ${history.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n')}

      USER REQUEST: "${query}"
      
      Respond with the appropriate tool calls to fulfill the request. If no tool is needed, provide short, high-yield advice.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ functionDeclarations: [
            addChapterTool, updateChapterTool, updatePYQTool, 
            addTestTool, addRevisionTool, logDailyTool, deleteTool,
            exportDataTool, exportLogsTool, bulkUpdateChaptersTool
        ]}],
      },
    });

    const toolCalls = response.functionCalls?.map(fc => ({
        name: fc.name,
        args: fc.args as Record<string, any>
    })) || [];

    return {
        text: response.text || (toolCalls.length > 0 ? "Executing command..." : "I've processed your request."),
        toolCalls
    };

  } catch (error) {
    console.error("Gemini Error:", error);
    return {
        text: "Connection to Max Core failed. Please verify API Key.",
        toolCalls: []
    };
  }
};