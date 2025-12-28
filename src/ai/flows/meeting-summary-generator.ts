'use server';

/**
 * @fileOverview Meeting Summary Generator AI agent.
 *
 * - generateMeetingSummary - A function that generates a summary of meeting discussions.
 * - MeetingSummaryInput - The input type for the generateMeetingSummary function.
 * - MeetingSummaryOutput - The return type for the generateMeetingSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MeetingSummaryInputSchema = z.object({
  discussionText: z
    .string()
    .describe('The text of the meeting discussion to be summarized.'),
});
export type MeetingSummaryInput = z.infer<typeof MeetingSummaryInputSchema>;

const MeetingSummaryOutputSchema = z.object({
  summary: z.string().describe('The summary of the meeting discussion.'),
});
export type MeetingSummaryOutput = z.infer<typeof MeetingSummaryOutputSchema>;

export async function generateMeetingSummary(
  input: MeetingSummaryInput
): Promise<MeetingSummaryOutput> {
  return meetingSummaryFlow(input);
}

const meetingSummaryPrompt = ai.definePrompt({
  name: 'meetingSummaryPrompt',
  input: {schema: MeetingSummaryInputSchema},
  output: {schema: MeetingSummaryOutputSchema},
  prompt: `You are an expert project manager, skilled at summarizing meeting discussions to identify key decisions and next steps.

  Please provide a concise summary of the following meeting discussion, highlighting the key decisions made and the next steps to be taken.

  Discussion Text: {{{discussionText}}}`,
});

const meetingSummaryFlow = ai.defineFlow(
  {
    name: 'meetingSummaryFlow',
    inputSchema: MeetingSummaryInputSchema,
    outputSchema: MeetingSummaryOutputSchema,
  },
  async input => {
    const {output} = await meetingSummaryPrompt(input);
    return output!;
  }
);
