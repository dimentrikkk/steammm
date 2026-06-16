import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { formatRole } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { useLogout } from "@workspace/api-client-react";

export function Header() {
  const { user, logout } = useAuth();
  const logoutMutation = useLogout();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync(undefined);
    } catch (error) {
      console.error(error);
    } finally {
      logout();
    }
  };

  return (
    <header className="h-16 border-b bg-white dark:bg-sidebar flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        <h1 className="font-semibold text-lg text-primary tracking-tight">
          ISO 9001 QMS
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium leading-none">{user.fullName}</p>
              <p className="text-xs text-muted-foreground">{user.username}</p>
            </div>
            <Badge variant="secondary" className="font-normal capitalize">
              {formatRole(user.role)}
            </Badge>
          </div>
        )}
        <Button variant="ghost" size="icon" onClick={handleLogout} title="Terminar sessão">
          <LogOut className="h-5 w-5 text-muted-foreground hover:text-foreground" />
        </Button>
      </div>
    </header>
  );
}
