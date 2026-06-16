import { useState } from "react";
import { Link } from "wouter";
import { useListChecklists, useCreateChecklist, useDeleteChecklist, getListChecklistsQueryKey, ChecklistInput } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Eye, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

const checklistSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  category: z.string().min(1, "Categoria é obrigatória"),
  description: z.string().optional(),
});

type ChecklistFormValues = z.infer<typeof checklistSchema>;

export default function Checklists() {
  const { data: checklists, isLoading } = useListChecklists();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const createMutation = useCreateChecklist();
  const deleteMutation = useDeleteChecklist();

  const form = useForm<ChecklistFormValues>({
    resolver: zodResolver(checklistSchema),
    defaultValues: { title: "", category: "", description: "" },
  });

  const onSubmit = async (values: ChecklistFormValues) => {
    try {
      await createMutation.mutateAsync({ data: values });
      toast({ title: "Sucesso", description: "Checklist criada com sucesso." });
      queryClient.invalidateQueries({ queryKey: getListChecklistsQueryKey() });
      setIsDialogOpen(false);
      form.reset();
    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: "Ocorreu um erro ao criar a checklist." });
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem a certeza que deseja eliminar esta checklist?")) {
      try {
        await deleteMutation.mutateAsync({ id });
        toast({ title: "Sucesso", description: "Checklist eliminada com sucesso." });
        queryClient.invalidateQueries({ queryKey: getListChecklistsQueryKey() });
      } catch (error) {
        toast({ variant: "destructive", title: "Erro", description: "Não foi possível eliminar a checklist." });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Checklists de Conformidade</h2>
          <p className="text-muted-foreground">Listagem de todas as checklists ISO 9001.</p>
        </div>
        
        {user?.role === "admin" && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> Nova Checklist</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Checklist</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição (Opcional)</FormLabel>
                      <FormControl><Textarea {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={createMutation.isPending}>Guardar</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Itens</TableHead>
                <TableHead>Progresso</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[50px]" /></TableCell>
                    <TableCell><Skeleton className="h-2 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-[80px] ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : checklists?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">Nenhuma checklist encontrada.</TableCell>
                </TableRow>
              ) : (
                checklists?.map((cl) => {
                  const percent = cl.totalItems > 0 ? Math.round((cl.completedItems / cl.totalItems) * 100) : 0;
                  return (
                    <TableRow key={cl.id}>
                      <TableCell className="font-medium">{cl.title}</TableCell>
                      <TableCell>{cl.category}</TableCell>
                      <TableCell>{cl.completedItems} / {cl.totalItems}</TableCell>
                      <TableCell className="w-1/3">
                        <div className="flex items-center gap-2">
                          <Progress value={percent} className="h-2" />
                          <span className="text-xs text-muted-foreground w-8">{percent}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild title="Ver Detalhes">
                            <Link href={`/checklists/${cl.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          {user?.role === "admin" && (
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(cl.id)} title="Eliminar">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
