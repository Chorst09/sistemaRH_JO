'use client';

import { useState } from 'react';
import { suggestDataFieldsFromDocument } from '@/ai/flows/suggest-data-fields-from-document';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Upload, FileText, Download, Lightbulb, Tags } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { documents } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

type AIResult = {
  documentType: string;
  suggestedFields: string[];
};

export default function DocumentSection() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setAiResult(null);
    }
  };

  const readFileAsDataURI = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleAnalysis = async () => {
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please choose a file to analyze.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setAiResult(null);

    try {
      const documentDataUri = await readFileAsDataURI(file);
      const result = await suggestDataFieldsFromDocument({ documentDataUri });
      setAiResult(result);
    } catch (error) {
      console.error('AI analysis failed:', error);
      toast({
        title: 'Analysis Failed',
        description: 'There was an error analyzing the document.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Document Analysis</CardTitle>
          <CardDescription>
            Upload a document to let AI suggest which profile fields to update.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input type="file" onChange={handleFileChange} />
            {file && (
              <p className="text-sm text-muted-foreground">
                Selected: {file.name}
              </p>
            )}
          </div>
          <Button onClick={handleAnalysis} disabled={isLoading || !file}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Analyze Document
              </>
            )}
          </Button>
          {aiResult && (
            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertTitle>Analysis Complete!</AlertTitle>
              <AlertDescription className="space-y-2 mt-2">
                <div className="flex items-center gap-2">
                    <Tags className="h-4 w-4 text-muted-foreground"/>
                    <strong>Document Type:</strong> {aiResult.documentType}
                </div>
                <div>
                    <strong>Suggested fields to update:</strong>
                    <ul className="list-disc list-inside mt-1">
                        {aiResult.suggestedFields.map((field) => (
                            <li key={field}>{field}</li>
                        ))}
                    </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Document Repository</CardTitle>
          <CardDescription>
            List of documents for this employee.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    {doc.name}
                  </TableCell>
                  <TableCell>{doc.type}</TableCell>
                  <TableCell>{doc.uploadDate}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="icon" asChild>
                      <a href={doc.url}>
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download</span>
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
