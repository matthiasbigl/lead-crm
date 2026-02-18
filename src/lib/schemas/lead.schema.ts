import { z } from 'zod';

export const leadStatusValues = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'] as const;
export const leadSourceValues = ['bigl_bot', 'manual', 'referral', 'scraped', 'directory'] as const;
export const activityTypeValues = ['note', 'email', 'call', 'meeting', 'proposal_sent', 'status_change'] as const;

export const createLeadSchema = z.object({
	businessName: z.string().min(1, 'Business name is required').max(255),
	contactPerson: z.string().max(255).default(''),
	email: z.string().email('Invalid email').or(z.literal('')).default(''),
	phone: z.string().max(50).default(''),
	websiteUrl: z.string().url('Invalid URL').or(z.literal('')).default(''),
	websiteScore: z.coerce.number().int().min(0).max(10).optional(),
	address: z.string().default(''),
	city: z.string().max(100).default(''),
	postalCode: z.string().max(10).default(''),
	country: z.string().max(100).default('Austria'),
	businessType: z.string().max(100).default(''),
	source: z.enum(leadSourceValues).default('manual'),
	status: z.enum(leadStatusValues).default('new'),
	estimatedValue: z.coerce.number().int().min(0).optional(),
	notes: z.string().default(''),
	tags: z.array(z.string()).default([])
});

export const updateLeadSchema = createLeadSchema.partial();

export const updateStatusSchema = z.object({
	status: z.enum(leadStatusValues)
});

export const createActivitySchema = z.object({
	type: z.enum(activityTypeValues),
	title: z.string().min(1, 'Title is required').max(255),
	description: z.string().default('')
});

export const leadFilterSchema = z.object({
	search: z.string().optional(),
	status: z.enum(leadStatusValues).optional(),
	source: z.enum(leadSourceValues).optional(),
	city: z.string().optional(),
	sortBy: z.enum(['createdAt', 'updatedAt', 'businessName', 'websiteScore', 'estimatedValue']).optional(),
	sortOrder: z.enum(['asc', 'desc']).optional(),
	limit: z.coerce.number().int().min(1).max(100).optional(),
	offset: z.coerce.number().int().min(0).optional()
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type LeadFilterInput = z.infer<typeof leadFilterSchema>;
