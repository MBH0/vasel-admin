/**
 * Input validation and sanitization utilities
 */

export class ValidationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'ValidationError';
	}
}

/**
 * Validate and sanitize string input
 */
export function validateString(
	value: any,
	fieldName: string,
	options: {
		required?: boolean;
		minLength?: number;
		maxLength?: number;
		pattern?: RegExp;
	} = {}
): string {
	// Check if required
	if (options.required && (!value || typeof value !== 'string' || value.trim() === '')) {
		throw new ValidationError(`${fieldName} is required`);
	}

	// If not required and empty, return empty string
	if (!value) {
		return '';
	}

	// Type check
	if (typeof value !== 'string') {
		throw new ValidationError(`${fieldName} must be a string`);
	}

	const trimmed = value.trim();

	// Length validation
	if (options.minLength && trimmed.length < options.minLength) {
		throw new ValidationError(
			`${fieldName} must be at least ${options.minLength} characters`
		);
	}

	if (options.maxLength && trimmed.length > options.maxLength) {
		throw new ValidationError(
			`${fieldName} must be at most ${options.maxLength} characters`
		);
	}

	// Pattern validation
	if (options.pattern && !options.pattern.test(trimmed)) {
		throw new ValidationError(`${fieldName} format is invalid`);
	}

	return trimmed;
}

/**
 * Validate array input
 */
export function validateArray(
	value: any,
	fieldName: string,
	options: {
		required?: boolean;
		minItems?: number;
		maxItems?: number;
		itemValidator?: (item: any, index: number) => any;
	} = {}
): any[] {
	// Check if required
	if (options.required && (!value || !Array.isArray(value) || value.length === 0)) {
		throw new ValidationError(`${fieldName} is required and must be a non-empty array`);
	}

	// If not required and empty, return empty array
	if (!value) {
		return [];
	}

	// Type check
	if (!Array.isArray(value)) {
		throw new ValidationError(`${fieldName} must be an array`);
	}

	// Length validation
	if (options.minItems && value.length < options.minItems) {
		throw new ValidationError(`${fieldName} must have at least ${options.minItems} items`);
	}

	if (options.maxItems && value.length > options.maxItems) {
		throw new ValidationError(`${fieldName} must have at most ${options.maxItems} items`);
	}

	// Item validation
	if (options.itemValidator) {
		return value.map((item, index) => options.itemValidator!(item, index));
	}

	return value;
}

/**
 * Validate enum value
 */
export function validateEnum<T extends string>(
	value: any,
	fieldName: string,
	allowedValues: readonly T[],
	options: { required?: boolean } = {}
): T | undefined {
	if (options.required && !value) {
		throw new ValidationError(`${fieldName} is required`);
	}

	if (!value) {
		return undefined;
	}

	if (!allowedValues.includes(value)) {
		throw new ValidationError(
			`${fieldName} must be one of: ${allowedValues.join(', ')}`
		);
	}

	return value as T;
}

/**
 * Sanitize string to prevent XSS and injection attacks
 * Removes HTML tags and potentially dangerous characters
 */
export function sanitizeString(value: string): string {
	return value
		.replace(/[<>]/g, '') // Remove < and >
		.replace(/javascript:/gi, '') // Remove javascript: protocol
		.replace(/on\w+\s*=/gi, '') // Remove event handlers like onclick=
		.trim();
}

/**
 * Validate service generation input
 */
export interface ServiceGenerationInput {
	serviceName: string;
	keywords: string[];
	complexity: 'Básico' | 'Intermedio' | 'Avanzado';
	priceRange?: string;
	duration?: string;
	comments?: string;
}

export function validateServiceInput(data: any): ServiceGenerationInput {
	const serviceName = validateString(data.serviceName, 'Service name', {
		required: true,
		minLength: 3,
		maxLength: 200
	});

	const keywords = validateArray(data.keywords, 'Keywords', {
		maxItems: 20,
		itemValidator: (item, index) =>
			validateString(item, `Keyword ${index}`, { maxLength: 50 })
	});

	const complexity = validateEnum(
		data.complexity,
		'Complexity',
		['Básico', 'Intermedio', 'Avanzado'] as const,
		{ required: false }
	) || 'Intermedio';

	const priceRange = validateString(data.priceRange, 'Price range', {
		maxLength: 50
	});

	const duration = validateString(data.duration, 'Duration', {
		maxLength: 50
	});

	const comments = validateString(data.comments, 'Comments', {
		maxLength: 1000
	});

	return {
		serviceName: sanitizeString(serviceName),
		keywords: keywords.map(k => sanitizeString(k)),
		complexity,
		priceRange: priceRange ? sanitizeString(priceRange) : undefined,
		duration: duration ? sanitizeString(duration) : undefined,
		comments: comments ? sanitizeString(comments) : undefined
	};
}

/**
 * Validate blog generation input
 */
export interface BlogGenerationInput {
	topic: string;
	keywords: string[];
	targetAudience?: string;
	comments?: string;
}

export function validateBlogInput(data: any): BlogGenerationInput {
	const topic = validateString(data.topic, 'Topic', {
		required: true,
		minLength: 5,
		maxLength: 200
	});

	const keywords = validateArray(data.keywords, 'Keywords', {
		maxItems: 20,
		itemValidator: (item, index) =>
			validateString(item, `Keyword ${index}`, { maxLength: 50 })
	});

	const targetAudience = validateString(data.targetAudience, 'Target audience', {
		maxLength: 200
	});

	const comments = validateString(data.comments, 'Comments', {
		maxLength: 1000
	});

	return {
		topic: sanitizeString(topic),
		keywords: keywords.map(k => sanitizeString(k)),
		targetAudience: targetAudience ? sanitizeString(targetAudience) : undefined,
		comments: comments ? sanitizeString(comments) : undefined
	};
}
