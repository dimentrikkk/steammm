import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useGetChecklist, useAddChecklistItem, useUpdateChecklistItem, useDeleteChecklistItem, getGetChecklistQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/format";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function ChecklistDetail() {
  const [, params] = useRoute("/checklists/:id");
  const checklistId = parseInt(params?.id || "0", 10);

  const { data: checklist, isLoading } = useGetChecklist(checklistId, { query: { enabled: !!checklistId } });
  const [newItemDesc, setNewItemDesc] = useState("");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const addItemMutation = useAddChecklistItem();
  const updateItemMutation = useUpdateChecklistItem();
  const deleteItemMutation = useDeleteChecklistItem();

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemDesc.trim()) return;
    
    try {
      await addItemMutation.mutateAsync({
        id: checklistId,
        data: { description: newItemDesc }
      });
      setNewItemDesc("");
      queryClient.invalidateQueries({ queryKey: getGetChecklistQueryKey(checklistId) });
      toast({ title: "Sucesso", description: "Item adicionado." });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: "Falha ao adicionar item." });
    }
  };

  const handleToggleItem = async (itemId: number, completed: boolean) => {
    // Optimistic update locally? 
    try {
      await updateItemMutation.mutateAsync({
        id: checklistId,
        itemId,
        data: { completed }
      });
      queryClient.invalidateQueries({ queryKey: getGetChecklistQueryKey(checklistId) });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: "Falha ao atualizar item." });
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (confirm("Deseja eliminar este item?")) {
      try {
        await deleteItemMutation.mutateAsync({ id: checklistId, itemId });
        queryClient.invalidateQueries({ queryKey: getGetChecklistQueryKey(checklistId) });
        toast({ title: "Sucesso", description: "Item eliminado." });
      } catch (error) {
        toast({ variant: "destructive", title: "Erro", description: "Falha ao eliminar item." });
      }
    }
  };

  const isReadOnly = user?.role === "auditor";
  const isAdmin = user?.role === "admin";

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/checklists"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          {isLoading ? (
            <Skeleton className="h-8 w-64" />
          ) : (
            <>
              <h2 className="text-2xl font-bold tracking-tight">{checklist?.title}</h2>
              <p className="text-muted-foreground">{checklist?.category}</p>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Detalhes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : (
            <p className="text-sm">{checklist?.description || "Sem descrição."}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Itens de Verificação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
            ) : checklist?.items.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Não existem itens nesta checklist.</p>
            ) : (
              checklist?.items.map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                  <Checkbox 
                    checked={item.completed} 
                    onCheckedChange={(checked) => handleToggleItem(item.id, !!checked)}
                    disabled={isReadOnly}
                    className="mt-1"
                  />
                  <div className="flex-1 grid gap-1">
                    <p className={`text-sm font-medium ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {item.description}
                    </p>
                    {item.completed && item.completedAt && (
                      <p className="text-xs text-muted-foreground">
                        Completado por {item.completedByUsername} em {formatDate(item.completedAt)}
                      </p>
                    )}
                  </div>
                  {isAdmin && (
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)} className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>

          {isAdmin && (
            <form onSubmit={handleAddItem} className="flex gap-3 pt-4 border-t">
              <Input 
                value={newItemDesc} 
                onChange={(e) => setNewItemDesc(e.target.value)} 
                placeholder="Novo item de verificação..." 
                className="flex-1"
              />
              <Button type="submit" disabled={!newItemDesc.trim() || addItemMutation.isPending}>
                <Plus className="mr-2 h-4 w-4" /> Adicionar
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
