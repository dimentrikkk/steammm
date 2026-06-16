import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, Activity, ShieldCheck, Users } from "lucide-react";

export default function Reports() {
  const downloadReport = (url: string) => {
    // Open the relative URL directly. The browser will handle the request.
    // However, if the API is guarded by token, opening in a new tab might fail unless it supports cookie auth.
    // In our scenario, standard window.open is requested.
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Relatórios</h2>
        <p className="text-muted-foreground">Extração de dados para auditorias e análise gerencial.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="flex flex-col">
          <CardHeader>
            <Activity className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Relatório de Atividade</CardTitle>
            <CardDescription>
              Exporta todas as ações efetuadas no sistema nos últimos 30 dias.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground">
              Útil para rastreabilidade de acessos, alterações a documentos e evidências de login.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => downloadReport("/api/reports/activity")}>
              <FileDown className="mr-2 h-4 w-4" /> Download PDF
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <ShieldCheck className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Relatório de Conformidade</CardTitle>
            <CardDescription>
              Resumo do estado atual de todas as checklists ativas.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground">
              Fornece evidência do cumprimento dos requisitos ISO 9001 mapeados no sistema.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => downloadReport("/api/reports/compliance")}>
              <FileDown className="mr-2 h-4 w-4" /> Download PDF
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <Users className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Relatório de Utilizadores</CardTitle>
            <CardDescription>
              Lista de colaboradores com acesso ao sistema e respetivos perfis.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground">
              Fundamental para a gestão de acessos e controlo de matrizes de responsabilidade.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => downloadReport("/api/reports/users")}>
              <FileDown className="mr-2 h-4 w-4" /> Download PDF
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
