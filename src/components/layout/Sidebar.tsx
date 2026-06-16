import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  FileText, 
  Activity, 
  FileBarChart 
} from "lucide-react";
import logo from "@assets/Stemmatters_1781188598040.png";

export function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "colaborador", "auditor"] },
    { href: "/utilizadores", label: "Utilizadores", icon: Users, roles: ["admin"] },
    { href: "/checklists", label: "Checklists", icon: CheckSquare, roles: ["admin", "colaborador", "auditor"] },
    { href: "/documentos", label: "Documentos", icon: FileText, roles: ["admin", "colaborador", "auditor"] },
    { href: "/atividade", label: "Registo de Atividade", icon: Activity, roles: ["admin", "colaborador", "auditor"] },
    { href: "/relatorios", label: "Relatórios", icon: FileBarChart, roles: ["admin", "colaborador", "auditor"] },
  ];

  const visibleNavItems = navItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col flex-shrink-0 h-full">
      <div className="h-16 flex items-center px-6 border-b border-sidebar-border bg-white dark:bg-sidebar">
        <img src={logo} alt="Stemmatters Logo" className="h-8 object-contain" />
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {visibleNavItems.map((item) => {
            const isActive = location.startsWith(item.href);
            const Icon = item.icon;
            
            return (
              <li key={item.href}>
                <Link href={item.href} className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}>
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
