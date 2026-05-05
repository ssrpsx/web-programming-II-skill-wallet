import fs from 'fs';
import path from 'path';

export interface Question {
  id: number;
  text: string;
  options: string[];
  answer: string;
}

export interface Subject {
  SubjectName: string;
  Time: number;
  question: Question[];
}

export function getAllSubjects(): Subject[] {
  try {
    const filePath = path.join(process.cwd(), 'question', 'all_questions.json');
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error reading all_questions.json', error);
    return [];
  }
}
