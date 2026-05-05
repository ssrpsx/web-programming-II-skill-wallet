import fs from 'fs';
import path from 'path';

export interface ChoiceQuestion {
  question: string;
  options: string[];
  answer: string;
}

export function generateMockQuestions(skillTitle: string): ChoiceQuestion[] {
  try {
    // The question folder is mounted at /app/question in Docker
    const filePath = path.join(process.cwd(), 'question', 'all_questions.json');
    if (!fs.existsSync(filePath)) {
      console.warn(`Questions file not found at ${filePath}, falling back to generic questions`);
      return getGenericQuestions(skillTitle);
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const subjects = JSON.parse(content);
    
    // Find the subject that matches the skill title
    const subject = subjects.find((s: any) => s.SubjectName === skillTitle);
    
    if (subject && subject.question && subject.question.length > 0) {
      return subject.question.map((q: any) => ({
        question: q.text,
        options: q.options,
        answer: q.answer
      }));
    }

    return getGenericQuestions(skillTitle);
  } catch (error) {
    console.error('Error reading questions file:', error);
    return getGenericQuestions(skillTitle);
  }
}

function getGenericQuestions(skillTitle: string): ChoiceQuestion[] {
  return [
    {
      question: `What is ${skillTitle}?`,
      options: [
        "A programming tool",
        "A conceptual framework",
        "A testing methodology",
        "A deployment platform",
      ],
      answer: "A conceptual framework",
    },
    {
      question: `What are the main benefits of using ${skillTitle}?`,
      options: [
        "Increased complexity",
        "Better maintainability and scalability",
        "Reduced performance",
        "Elimination of all bugs",
      ],
      answer: "Better maintainability and scalability",
    }
  ];
}
