import { useState } from "react";
import { useListActivity, useListUsers } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";
import { useAuth } from "@/hooks/use-auth";

export default function ActivityLog() {
  const { user } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  
  const isRestricted = user?.role === "colaborador";
  const queryUserId = isRestricted ? user?.id : selectedUserId;

  const { data: activities, isLoading: activityLoading } = useListActivity({
    userId: queryUserId
  });

  const { data: users, isLoading: usersLoading } = useListUsers({
    query: { enabled: !isRestricted }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Registo de Atividade</h2>
          <p className="text-muted-foreground">Log de auditoria das ações efetuadas no sistema.</p>
        </div>

        {!isRestricted && (
          <div className="w-full sm:w-64">
            <Select 
              value={selectedUserId?.toString() || "all"} 
              onValueChange={(val) => setSelectedUserId(val === "all" ? null : parseInt(val))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por utilizador" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os utilizadores</SelectItem>
                {users?.map(u => (
                  <SelectItem key={u.id} value={u.id.toString()}>{u.fullName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data / Hora</TableHead>
                <TableHead>Utilizador</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Entidade</TableHead>
                <TableHead>Descrição</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activityLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
                  </TableRow>
                ))
              ) : activities?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">Nenhuma atividade registada.</TableCell>
                </TableRow>
              ) : (
                activities?.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(activity.createdAt)}</TableCell>
                    <TableCell className="font-medium">{activity.username}</TableCell>
                    <TableCell><span className="bg-muted px-2 py-1 rounded-md text-xs font-mono">{activity.action}</span></TableCell>
                    <TableCell className="capitalize">{activity.entity} {activity.entityId ? `#${activity.entityId}` : ''}</TableCell>
                    <TableCell className="max-w-md truncate" title={activity.description}>{activity.description}</TableCell>
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
