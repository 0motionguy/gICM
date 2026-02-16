import { z } from "zod";

// Base schemas
export const TenantIdSchema = z.string().uuid();
export const TimestampSchema = z.string().datetime();

// Core types
export type TenantId = z.infer<typeof TenantIdSchema>;
export type Timestamp = z.infer<typeof TimestampSchema>;
