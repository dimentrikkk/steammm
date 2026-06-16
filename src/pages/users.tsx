import { useState } from "react";
import { Link } from "wouter";
import { useListUsers, useCreateUser, useUpdateUser, useDeleteUser, getListUsersQueryKey, User, UserRole, UserInputRole, UserUpdateRole } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatRole } from "@/lib/format";
import { Plus, Edit, Trash2, History, Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

const userSchema = z.object({
  username: z.string().min(1, "Nome de utilizador é obrigatório"),
  fullName: z.string().min(1, "Nome completo é obrigatório"),
  email: z.string().email("Email inválido"),
  role: z.enum(["admin", "colaborador", "auditor"] as const),
  password: z.string().min(8, "Palavra-passe deve ter pelo menos 8 caracteres").optional(),
});

type UserFormValues = z.infer<typeof userSchema>;

export default function UsersList() {
  const { data: users, isLoading } = useListUsers();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: "",
      fullName: "",
      email: "",
      role: "colaborador",
      password: "",
    },
  });

  const openEdit = (user: User) => {
    setEditingUser(user);
    form.reset({
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      role: user.role as any,
      password: "", // Optional for updates usually, but required for create in our schema? Let's make it optional.
    });
    setIsDialogOpen(true);
  };

  const openCreate = () => {
    setEditingUser(null);
    form.reset({
      username: "",
      fullName: "",
      email: "",
      role: "colaborador",
      password: "",
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (values: UserFormValues) => {
    try {
      if (editingUser) {
        await updateMutation.mutateAsync({
          id: editingUser.id,
          data: {
            fullName: values.fullName,
            email: values.email,
            role: values.role as UserUpdateRole,
          }
        });
        toast({ title: "Sucesso", description: "Utilizador atualizado com sucesso." });
      } else {
        if (!values.password) {
          form.setError("password", { message: "Palavra-passe é obrigatória" });
          return;
        }
        await createMutation.mutateAsync({
          data: {
            username: values.username,
            fullName: values.fullName,
            email: values.email,
            role: values.role as UserInputRole,
            password: values.password,
          }
        });
        toast({ title: "Sucesso", description: "Utilizador criado com sucesso." });
      }
      queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
      setIsDialogOpen(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: "Ocorreu um erro ao guardar." });
    }
  };

  const toggleStatus = async (user: User) => {
    try {
      await updateMutation.mutateAsync({
        id: user.id,
        data: { active: !user.active }
      });
      queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
      toast({ title: "Sucesso", description: `Utilizador ${user.active ? 'desativado' : 'ativado'}.` });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: "Ocorreu um erro ao alterar o estado." });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Utilizadores</h2>
          <p className="text-muted-foreground">Gerir os utilizadores do sistema.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Novo Utilizador</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingUser ? "Editar Utilizador" : "Novo Utilizador"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="username" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome de Utilizador</FormLabel>
                    <FormControl><Input {...field} disabled={!!editingUser} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="fullName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input type="email" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="role" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Perfil</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um perfil" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="colaborador">Colaborador</SelectItem>
                        <SelectItem value="auditor">Auditor</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                {!editingUser && (
                  <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Palavra-passe</FormLabel>
                      <FormControl><Input type="password" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}
                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    Guardar
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome Completo</TableHead>
                <TableHead>Nome de Utilizador</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Última Alteração Password</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[80px] rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[60px] rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-[100px] ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : users?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">Nenhum utilizador encontrado.</TableCell>
                </TableRow>
              ) : (
                users?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.fullName}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : user.role === 'auditor' ? 'secondary' : 'outline'}>
                        {formatRole(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.active ? "success" : "destructive"} className={user.active ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" : ""}>
                        {user.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(user.lastPasswordChange)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => toggleStatus(user)} title={user.active ? "Desativar" : "Ativar"}>
                          {user.active ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(user)} title="Editar">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" asChild title="Histórico de Password">
                          <Link href={`/utilizadores/${user.id}/historico`}>
                            <History className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
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
