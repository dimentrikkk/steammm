import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";

import Login from "@/pages/login";
import ChangePassword from "@/pages/change-password";
import Dashboard from "@/pages/dashboard";
import UsersList from "@/pages/users";
import UserPasswordHistory from "@/pages/user-history";
import Checklists from "@/pages/checklists";
import ChecklistDetail from "@/pages/checklist-detail";
import DocumentsList from "@/pages/documents";
import DocumentDetail from "@/pages/document-detail";
import ActivityLog from "@/pages/activity";
import Reports from "@/pages/reports";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component, adminOnly = false, ...rest }: any) {
  const { user, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center">A carregar...</div>;
  }

  if (!user) return null;

  if (adminOnly && user.role !== "admin") {
    return <NotFound />;
  }

  return (
    <MainLayout>
      <Component {...rest} />
    </MainLayout>
  );
}

function RootRedirect() {
  const [, setLocation] = useLocation();
  useEffect(() => { setLocation("/dashboard"); }, [setLocation]);
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/change-password" component={ChangePassword} />

      <Route path="/" component={RootRedirect} />

      <Route path="/dashboard">
        {() => <ProtectedRoute component={Dashboard} />}
      </Route>
      <Route path="/utilizadores">
        {() => <ProtectedRoute component={UsersList} adminOnly={true} />}
      </Route>
      <Route path="/utilizadores/:id/historico">
        {() => <ProtectedRoute component={UserPasswordHistory} adminOnly={true} />}
      </Route>
      <Route path="/checklists">
        {() => <ProtectedRoute component={Checklists} />}
      </Route>
      <Route path="/checklists/:id">
        {() => <ProtectedRoute component={ChecklistDetail} />}
      </Route>
      <Route path="/documentos">
        {() => <ProtectedRoute component={DocumentsList} />}
      </Route>
      <Route path="/documentos/:id">
        {() => <ProtectedRoute component={DocumentDetail} />}
      </Route>
      <Route path="/atividade">
        {() => <ProtectedRoute component={ActivityLog} />}
      </Route>
      <Route path="/relatorios">
        {() => <ProtectedRoute component={Reports} />}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
