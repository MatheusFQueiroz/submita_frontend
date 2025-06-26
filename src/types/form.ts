import { EvaluationType } from ".";
import { Question } from "./api";

export interface EventFormData {
  title: string;
  description: string;
  image?: File;
  imageUrl?: string;
  submissionStartDate: Date;
  submissionEndDate: Date;
  evaluationType: EvaluationType;
}

export interface ArticleFormData {
  title: string;
  abstract: string;
  keywords: string[];
  relatedAuthors: string[];
  file?: File;
  eventId: string;
}

export interface EvaluationFormData {
  grade: number;
  evaluationDescription: string;
  responses: {
    questionId: string;
    answer: string;
  }[];
}

export interface ChecklistFormData {
  title: string;
  description?: string;
  questions: {
    text: string;
    type: Question["type"];
    isRequired: boolean;
    options?: string[];
  }[];
}
