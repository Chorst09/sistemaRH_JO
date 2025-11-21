'use client';

import { useState, useEffect } from 'react';
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
import { getDocuments, createDocument, deleteDocument } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Document } from '@/types';

type AIResult = {
  documentType: string;
  suggestedFields: string[];
};

interface DocumentSectionProps {
  employeeId: string;
}

export default function DocumentSection({ employeeId }: DocumentSectionProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    async function loadDocuments() {
      const data = await getDocuments(employeeId);
      setDocuments(data);
    }

    loadDocuments();
  }, [employeeId]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setAiResult(null);

    try {
      // Primeiro, vamos analisar o documento com a IA
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUri = e.target?.result as string;
        try {
          const result = await suggestDataFieldsFromDocument({ documentDataUri: dataUri });
          setAiResult(result);

          // Agora vamos salvar o documento
          const newDocument = {
            employee_id: employeeId,
            name: file.name,
            description: `Documento do tipo ${result.documentType}`,
            type: result.documentType,
            url: '#', // Aqui você deve implementar o upload real para o Supabase Storage
            status: 'active' as const,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          const savedDocument = await createDocument(newDocument);
          if (savedDocument) {
            setDocuments(prev => [...prev, savedDocument]);
            toast({
              title: 'Documento enviado com sucesso',
              description: 'O documento foi analisado e salvo.',
            });
          }
        } catch (error) {
          console.error('Erro ao processar documento:', error);
          toast({
            title: 'Erro ao enviar documento',
            description: 'Ocorreu um erro ao processar o documento.',
            variant: 'destructive',
          });
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: 'Erro ao enviar documento',
        description: 'Ocorreu um erro ao enviar o documento.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      const success = await deleteDocument(documentId);
      if (success) {
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
        toast({
          title: 'Documento excluído',
          description: 'O documento foi removido com sucesso.',
        });
      }
    } catch (error) {
      console.error('Erro ao excluir documento:', error);
      toast({
        title: 'Erro ao excluir documento',
        description: 'Ocorreu um erro ao excluir o documento.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload de Documentos</CardTitle>
          <CardDescription>
            Faça upload de documentos para este funcionário.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Input
              type="file"
              onChange={handleFileUpload}
              disabled={isUploading}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            {isUploading && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>

          {aiResult && (
            <Alert className="mt-4">
              <Lightbulb className="h-4 w-4" />
              <AlertTitle className="flex items-center gap-2">
                <Tags className="h-4 w-4" />
                Documento Analisado: {aiResult.documentType}
              </AlertTitle>
              <AlertDescription className="mt-4 space-y-4">
                <div>
                  <strong>Campos sugeridos para atualização:</strong>
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
          <CardTitle>Repositório de Documentos</CardTitle>
          <CardDescription>
            Lista de documentos para este funcionário.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ação</TableHead>
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
                  <TableCell>
                    {new Date(doc.created_at).toLocaleDateString('pt-BR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(doc.url, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteDocument(doc.id)}
                    >
                      <FileText className="h-4 w-4" />
                      Excluir
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
