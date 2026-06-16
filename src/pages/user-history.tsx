import { useRoute, Link } from "wouter";
import { useGetUser, useGetUserPasswordHistory } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { formatDate } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserPasswordHistory() {
  const [, params] = useRoute("/utilizadores/:id/historico");
  const userId = parseInt(params?.id || "0", 10);

  const { data: user, isLoading: userLoading } = useGetUser(userId, { query: { enabled: !!userId } });
  const { data: history, isLoading: historyLoading } = useGetUserPasswordHistory(userId, { query: { enabled: !!userId } });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/utilizadores"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Histórico de Alterações de Palavra-passe</h2>
          <p className="text-muted-foreground">
            {userLoading ? <Skeleton className="h-4 w-48 mt-1" /> : `Utilizador: ${user?.fullName} (${user?.username})`}
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data e Hora</TableHead>
                <TableHead>Alterado por</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historyLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  </TableRow>
                ))
              ) : history?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="h-24 text-center">Nenhum registo encontrado.</TableCell>
                </TableRow>
              ) : (
                history?.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{formatDate(entry.changedAt)}</TableCell>
                    <TableCell>{entry.changedByUsername}</TableCell>
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
