import { useGetDashboardStats, useGetComplianceSummary, useGetDashboardRecentActivity } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Users, FileText, CheckSquare, ShieldCheck, Clock, AlertTriangle } from "lucide-react";
import { formatDate } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";
import { differenceInDays, parseISO } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: summary, isLoading: summaryLoading } = useGetComplianceSummary();
  const { data: recentActivity, isLoading: activityLoading } = useGetDashboardRecentActivity();

  // Password expiry check
  const daysUntilExpiry = user?.passwordExpiresAt 
    ? differenceInDays(parseISO(user.passwordExpiresAt), new Date()) 
    : 100;
  
  const showExpiryWarning = daysUntilExpiry <= 10 && daysUntilExpiry >= 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Visão geral do Sistema de Gestão da Qualidade ISO 9001.
        </p>
      </div>

      {showExpiryWarning && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Atenção à sua palavra-passe</AlertTitle>
          <AlertDescription>
            A sua palavra-passe irá expirar em {daysUntilExpiry} {daysUntilExpiry === 1 ? 'dia' : 'dias'}. 
            Por favor, considere atualizá-la em breve.
          </AlertDescription>
        </Alert>
      )}

      {statsLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-[120px] w-full" />)}
        </div>
      ) : stats ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Conformidade</CardTitle>
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overallComplianceRate}%</div>
              <Progress value={stats.overallComplianceRate} className="mt-2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documentos Ativos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeDocuments}</div>
              <p className="text-xs text-muted-foreground">de {stats.totalDocuments} total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Checklists</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalChecklists}</div>
              <p className="text-xs text-muted-foreground">ativas no sistema</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilizadores Ativos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeUsers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.passwordsExpiringSoon} passwords expiram em breve
              </p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Resumo de Conformidade</CardTitle>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Checklist</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Progresso</TableHead>
                      <TableHead className="text-right">%</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summary?.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                          Nenhum dado disponível.
                        </TableCell>
                      </TableRow>
                    )}
                    {summary?.map((item) => (
                      <TableRow key={item.checklistId}>
                        <TableCell className="font-medium">{item.title}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>
                          <Progress value={item.completionRate} className="h-2" />
                        </TableCell>
                        <TableCell className="text-right">
                          {item.completedItems}/{item.totalItems} ({item.completionRate}%)
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity?.length === 0 && (
                  <div className="text-center text-muted-foreground py-4">
                    Sem atividade recente.
                  </div>
                )}
                {recentActivity?.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4">
                    <div className="bg-muted p-2 rounded-full">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="grid gap-1">
                      <p className="text-sm font-medium leading-none">
                        {activity.username} <span className="font-normal text-muted-foreground">{activity.action}</span> {activity.entity}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
