import { z } from "zod";

// Schema de login
export const loginSchema = z.object({
  email: z.string().min(1, "E-mail é obrigatório").email("E-mail inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

// Schema de registro
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Nome deve ter pelo menos 2 caracteres")
      .max(100, "Nome deve ter no máximo 100 caracteres"),
    email: z.string().min(1, "E-mail é obrigatório").email("E-mail inválido"),
    password: z
      .string()
      .min(8, "Senha deve ter pelo menos 8 caracteres")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número"
      ),
    confirmPassword: z.string(),
    isFromIFPB: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não conferem",
    path: ["confirmPassword"],
  });

// Schema de mudança de senha
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Senha atual é obrigatória"),
    newPassword: z
      .string()
      .min(8, "Nova senha deve ter pelo menos 8 caracteres")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Nova senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Senhas não conferem",
    path: ["confirmPassword"],
  });

// Schema de evento
export const eventSchema = z
  .object({
    title: z
      .string()
      .min(5, "Título deve ter pelo menos 5 caracteres")
      .max(200, "Título deve ter no máximo 200 caracteres"),
    description: z
      .string()
      .min(10, "Descrição deve ter pelo menos 10 caracteres")
      .max(1000, "Descrição deve ter no máximo 1000 caracteres"),
    submissionStartDate: z.date({
      required_error: "Data de início é obrigatória",
    }),
    submissionEndDate: z.date({
      required_error: "Data de fim é obrigatória",
    }),
    evaluationType: z.enum(["DIRECT", "PAIR", "PANEL"], {
      required_error: "Tipo de avaliação é obrigatório",
    }),
  })
  .refine((data) => data.submissionEndDate > data.submissionStartDate, {
    message: "Data de fim deve ser posterior à data de início",
    path: ["submissionEndDate"],
  });

// Schema de artigo
export const articleSchema = z.object({
  title: z
    .string()
    .min(10, "Título deve ter pelo menos 10 caracteres")
    .max(300, "Título deve ter no máximo 300 caracteres"),
  abstract: z
    .string()
    .min(100, "Resumo deve ter pelo menos 100 caracteres")
    .max(2000, "Resumo deve ter no máximo 2000 caracteres"),
  keywords: z
    .array(z.string())
    .min(3, "Deve ter pelo menos 3 palavras-chave")
    .max(10, "Deve ter no máximo 10 palavras-chave"),
  relatedAuthors: z
    .array(z.string())
    .max(10, "Deve ter no máximo 10 autores relacionados"),
  eventId: z.string().min(1, "Evento é obrigatório"),
});

// Schema de avaliação
export const evaluationSchema = z.object({
  grade: z
    .number()
    .min(0, "Nota deve ser no mínimo 0")
    .max(10, "Nota deve ser no máximo 10"),
  evaluationDescription: z
    .string()
    .min(50, "Comentário deve ter pelo menos 50 caracteres")
    .max(2000, "Comentário deve ter no máximo 2000 caracteres"),
  responses: z.array(
    z.object({
      questionId: z.string(),
      answer: z.string(),
    })
  ),
});

// Schema de checklist
export const checklistSchema = z.object({
  title: z
    .string()
    .min(5, "Título deve ter pelo menos 5 caracteres")
    .max(200, "Título deve ter no máximo 200 caracteres"),
  description: z
    .string()
    .max(500, "Descrição deve ter no máximo 500 caracteres")
    .optional(),
  questions: z
    .array(
      z.object({
        text: z.string().min(10, "Pergunta deve ter pelo menos 10 caracteres"),
        type: z.enum(["BOOLEAN", "TEXT", "SCALE", "MULTIPLE_CHOICE"]),
        isRequired: z.boolean(),
        options: z.array(z.string()).optional(),
      })
    )
    .min(1, "Deve ter pelo menos 1 pergunta"),
});

// Schema de criação de avaliador
export const createEvaluatorSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  email: z.string().min(1, "E-mail é obrigatório").email("E-mail inválido"),
});

// Tipos inferidos dos schemas
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type EventFormData = z.infer<typeof eventSchema>;
export type ArticleFormData = z.infer<typeof articleSchema>;
export type EvaluationFormData = z.infer<typeof evaluationSchema>;
export type ChecklistFormData = z.infer<typeof checklistSchema>;
export type CreateEvaluatorFormData = z.infer<typeof createEvaluatorSchema>;
