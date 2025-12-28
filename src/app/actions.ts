'use server';

import { generateMeetingSummary } from '@/ai/flows/meeting-summary-generator';
import { z } from 'zod';

const summarySchema = z.object({
  discussionText: z.string().min(10, 'Discussion text must be at least 10 characters long.'),
});

export async function getMeetingSummaryAction(prevState: any, formData: FormData) {
  const validatedFields = summarySchema.safeParse({
    discussionText: formData.get('discussionText'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Validation failed',
      errors: validatedFields.error.flatten().fieldErrors,
      summary: null,
    };
  }

  try {
    const result = await generateMeetingSummary(validatedFields.data);
    return {
      message: 'Summary generated successfully.',
      errors: null,
      summary: result.summary,
    };
  } catch (error) {
    console.error(error);
    return {
      message: 'An unexpected error occurred.',
      errors: null,
      summary: null,
    };
  }
}
