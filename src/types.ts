import { z } from "zod";

export const QuestionSchema = z.discriminatedUnion("answerType", [
  z.object({
    question: z.string(),
    required: z.boolean(),
    answerType: z.literal("TextBox"),
  }),
  z.object({
    question: z.string(),
    required: z.boolean(),
    answerType: z.enum(["MultipleChoice", "Checkbox", "Dropdown"]),
    answers: z.array(z.string()),
  }),
  z.object({
    question: z.string(),
    required: z.boolean(),
    answerType: z.literal("FileUpload"),
  }),
  z.object({
    question: z.string(),
    required: z.boolean(),
    answerType: z.literal("DatePicker"),
  }),
  z.object({
    question: z.string(),
    required: z.boolean(),
    answerType: z.literal("TimePicker"),
  }),
]);

export const QuestionListSchema = z.array(QuestionSchema);

export type Question = z.infer<typeof QuestionSchema>;
export type QuestionList = z.infer<typeof QuestionListSchema>;

export type SavedForm = {
  id: string;
  createdAt: number;
  questions: QuestionList;
  answers: Record<number, unknown>;
  imageMap: Record<number, string>;
};

export type FormValue = string | string[] | File | null;

export type DynamicFormProps = {
  questions: QuestionList;
  initialValues?: Record<number, FormValue>;
  initialImageMap?: Record<number, string>;
  onSubmit: (answers: Record<number, unknown>) => void;
};
