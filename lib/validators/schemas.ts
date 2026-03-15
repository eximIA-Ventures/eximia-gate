import { z } from "zod";

export const RegisterSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  name: z.string().min(2, "Mínimo 2 caracteres").max(100),
});

export const LoginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha obrigatória"),
});

export const VerifySchema = z.object({
  token: z.string().min(1, "Token obrigatório"),
});

export const RefreshSchema = z.object({
  refresh_token: z.string().min(1, "Refresh token obrigatório"),
});

export const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  avatar_url: z.string().url().nullable().optional(),
});

export const CreateAppSchema = z.object({
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, "Apenas letras minúsculas, números e hífens"),
  name: z.string().min(2).max(100),
  url: z.string().url("URL inválida"),
  description: z.string().max(500).optional().default(""),
  icon: z.string().max(10).optional().default("🔗"),
});

export const UpdateAppSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  url: z.string().url().optional(),
  description: z.string().max(500).optional(),
  icon: z.string().max(10).optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export const AccessSchema = z.object({
  user_id: z.string().min(1),
  action: z.enum(["grant", "revoke"]),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type VerifyInput = z.infer<typeof VerifySchema>;
export type RefreshInput = z.infer<typeof RefreshSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type CreateAppInput = z.infer<typeof CreateAppSchema>;
export type UpdateAppInput = z.infer<typeof UpdateAppSchema>;
export type AccessInput = z.infer<typeof AccessSchema>;
