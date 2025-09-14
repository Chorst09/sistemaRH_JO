'use server';

/**
 * @fileOverview Summarizes uploaded employee documents.
 *
 * - summarizeUploadedDocuments - A function that summarizes uploaded documents.
 * - SummarizeUploadedDocumentsInput - The input type for the summarizeUploadedDocuments function.
 * - SummarizeUploadedDocumentsOutput - The return type for the summarizeUploadedDocuments function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeUploadedDocumentsInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "The document to summarize, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SummarizeUploadedDocumentsInput = z.infer<typeof SummarizeUploadedDocumentsInputSchema>;

const SummarizeUploadedDocumentsOutputSchema = z.object({
  summary: z.string().describe('A summary of the document.'),
});
export type SummarizeUploadedDocumentsOutput = z.infer<typeof SummarizeUploadedDocumentsOutputSchema>;

export async function summarizeUploadedDocuments(
  input: SummarizeUploadedDocumentsInput
): Promise<SummarizeUploadedDocumentsOutput> {
  return summarizeUploadedDocumentsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeUploadedDocumentsPrompt',
  input: {schema: SummarizeUploadedDocumentsInputSchema},
  output: {schema: SummarizeUploadedDocumentsOutputSchema},
  prompt: `You are an HR assistant. Please summarize the key information in the following document:\n\n{{media url=documentDataUri}}`,
});

const summarizeUploadedDocumentsFlow = ai.defineFlow(
  {
    name: 'summarizeUploadedDocumentsFlow',
    inputSchema: SummarizeUploadedDocumentsInputSchema,
    outputSchema: SummarizeUploadedDocumentsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
