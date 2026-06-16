import { useState } from "react";
import { useRoute, Link } from "wouter";
import { 
  useGetDocument, 
  useUpdateDocument, 
  useConfirmDocumentRead, 
  getGetDocumentQueryKey, 
  useGetDocumentReadConfirmations,
  DocumentUpdateStatus
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, CheckCircle2, FileText, Edit, UserCheck } from "lucide-react";
import { formatDate, formatStatus } from "@/lib/format";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  version: z.string().min(1, "Versão é obrigatória"),
  category: z.string().min(1, "Categoria é obrigatória"),
  status: z.enum(["ativo", "obsoleto", "revisao"] as const),
  description: z.string().optional(),
  content: z.string().optional(),
});

type UpdateFormValues = z.infer<typeof updateSchema>;

export default function DocumentDetail() {
  const [, params] = useRoute("/documentos/:id");
  const documentId = parseInt(params?.id || "0", 10);

  const { data: document, isLoading } = useGetDocument(documentId, { query: { enabled: !!documentId } });
  const { data: confirmations, isLoading: confLoading } = useGetDocumentReadConfirmations(documentId, { query: { enabled: !!documentId } });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const confirmReadMutation = useConfirmDocumentRead();
  const updateMutation = useUpdateDocument();

  const [isEditOpen, setIsEditOpen] = useState(false);

  const form = useForm<UpdateFormValues>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      title: "", version: "", category: "", status: "ativo", description: "", content: ""
    },
  });

  const openEdit = () => {
    if (document) {
      form.reset({
        title: document.title,
        version: document.version,
        category: document.category,
        status: document.status as "ativo" | "obsoleto" | "revisao",
        description: document.description || "",
        content: document.content || "",
      });
      setIsEditOpen(true);
    }
  };

  const onUpdate = async (values: UpdateFormValues) => {
    try {
      await updateMutation.mutateAsync({
        id: documentId,
        data: values
      });
      toast({ title: "Sucesso", description: "Documento atualizado com sucesso." });
      queryClient.invalidateQueries({ queryKey: getGetDocumentQueryKey(documentId) });
      setIsEditOpen(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: "Falha ao atualizar documento." });
    }
  };

  const handleConfirmRead = async () => {
    try {
      await confirmReadMutation.mutateAsync({ id: documentId });
      toast({ title: "Leitura Confirmada", description: "Obrigado por confirmar a leitura do documento." });
      queryClient.invalidateQueries({ queryKey: getGetDocumentQueryKey(documentId) });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: "Falha ao confirmar leitura." });
    }
  };

  const hasRead = document?.confirmations?.some(c => c.userId === user?.id);
  const isAdmin = user?.role === "admin";
  const isAuditor = user?.role === "auditor";

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="outline" size="icon" asChild className="mt-1">
            <Link href="/documentos"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-32" />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold tracking-tight">{document?.title}</h2>
                  <Badge variant="outline" className="bg-primary/10 text-primary uppercase">{document?.code}</Badge>
                  <Badge variant="secondary">v{document?.version}</Badge>
                  <Badge variant="outline">{formatStatus(document?.status || "")}</Badge>
                </div>
                <p className="text-muted-foreground mt-1">{document?.category} • Atualizado em {formatDate(document?.updatedAt)}</p>
              </>
            )}
          </div>
        </div>
        
        {isAdmin && document && (
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={openEdit}><Edit className="mr-2 h-4 w-4" /> Editar</Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Editar Documento</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onUpdate)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="title" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="version" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Versão</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="category" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="status" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder="Selecione estado" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ativo">Ativo</SelectItem>
                            <SelectItem value="revisao">Em Revisão</SelectItem>
                            <SelectItem value="obsoleto">Obsoleto</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="content" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conteúdo do Documento</FormLabel>
                      <FormControl>
                        <Textarea className="min-h-[300px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={updateMutation.isPending}>Guardar Alterações</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {!isAuditor && document?.status === "ativo" && !hasRead && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold text-primary">Confirmação de Leitura Pendente</h3>
                <p className="text-sm text-muted-foreground">É necessário confirmar que leu e compreendeu este documento ISO.</p>
              </div>
            </div>
            <Button onClick={handleConfirmRead} disabled={confirmReadMutation.isPending}>
              <Check className="mr-2 h-4 w-4" /> Confirmar Leitura
            </Button>
          </CardContent>
        </Card>
      )}

      {hasRead && (
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-500 font-medium bg-green-50 dark:bg-green-950/30 p-3 rounded-md border border-green-200 dark:border-green-900/50">
          <CheckCircle2 className="h-5 w-5" /> Você já confirmou a leitura deste documento.
        </div>
      )}

      <Card>
        <CardContent className="p-6 prose dark:prose-invert max-w-none">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-32 w-full mt-8" />
            </div>
          ) : (
            <div className="whitespace-pre-wrap font-serif text-base leading-relaxed text-foreground">
              {document?.content || <span className="text-muted-foreground italic">Sem conteúdo disponível.</span>}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-muted-foreground" />
            Registo de Leituras
          </CardTitle>
          <CardDescription>
            Utilizadores que confirmaram a leitura da versão atual.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilizador</TableHead>
                <TableHead>Data de Confirmação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {confLoading ? (
                 <TableRow>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                 </TableRow>
              ) : confirmations?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="h-16 text-center text-muted-foreground">Nenhuma leitura registada.</TableCell>
                </TableRow>
              ) : (
                confirmations?.map(conf => (
                  <TableRow key={conf.id}>
                    <TableCell className="font-medium">{conf.fullName || conf.username}</TableCell>
                    <TableCell>{formatDate(conf.confirmedAt)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    </div>
  );
}
