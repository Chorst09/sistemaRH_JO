'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting data fields to update based on an uploaded document.
 *
 * - suggestDataFieldsFromDocument - A function that processes a document and suggests relevant data fields to update.
 * - SuggestDataFieldsFromDocumentInput - The input type for the suggestDataFieldsFromDocument function.
 * - SuggestDataFieldsFromDocumentOutput - The return type for the suggestDataFieldsFromDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestDataFieldsFromDocumentInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "The document as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SuggestDataFieldsFromDocumentInput = z.infer<typeof SuggestDataFieldsFromDocumentInputSchema>;

const SuggestDataFieldsFromDocumentOutputSchema = z.object({
  suggestedFields: z
    .array(z.string())
    .describe('An array of suggested data fields to update in the employee profile.'),
  documentType: z.string().describe('The type of document uploaded (e.g., ID, proof of address).'),
});
export type SuggestDataFieldsFromDocumentOutput = z.infer<typeof SuggestDataFieldsFromDocumentOutputSchema>;

export async function suggestDataFieldsFromDocument(
  input: SuggestDataFieldsFromDocumentInput
): Promise<SuggestDataFieldsFromDocumentOutput> {
  return suggestDataFieldsFromDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestDataFieldsFromDocumentPrompt',
  input: {schema: SuggestDataFieldsFromDocumentInputSchema},
  output: {schema: SuggestDataFieldsFromDocumentOutputSchema},
  prompt: `You are an AI assistant helping HR admins automatically detect and categorize uploaded documents and suggest relevant data fields to update in employee profiles.

  Analyze the provided document and determine its type (e.g., ID, proof of address). Based on the document type, suggest relevant data fields that the HR admin should update in the employee profile.

  Document: {{media url=documentDataUri}}

  Respond with a JSON object containing the "documentType" and an array of "suggestedFields".
  `,
});

const suggestDataFieldsFromDocumentFlow = ai.defineFlow(
  {
    name: 'suggestDataFieldsFromDocumentFlow',
    inputSchema: SuggestDataFieldsFromDocumentInputSchema,
    outputSchema: SuggestDataFieldsFromDocumentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
