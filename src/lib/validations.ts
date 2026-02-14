import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  dueDate: z.string().optional().nullable(),
  projectId: z.string().min(1, "Project is required"),
  assigneeId: z.string().optional().nullable(),
});

export const projectSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  description: z.string().max(200).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
});

export const commentSchema = z.object({
  content: z.string().min(1, "Comment is required").max(500),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type TaskInput = z.infer<typeof taskSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
