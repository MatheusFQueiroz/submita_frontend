"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Users,
  ClipboardList,
  Upload,
  BarChart3,
  UserCheck,
  History,
  Settings,
  X,
  Heart,
} from "lucide-react";
import { useAuthContext } from "@/providers/AuthProvider";
import { ROUTES, USER_ROLES } from "@/lib/constants";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavigationItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
  badge?: string;
}

const navigationItems: NavigationItem[] = [
  {
    title: "Dashboard",
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
    roles: [USER_ROLES.STUDENT, USER_ROLES.EVALUATOR, USER_ROLES.COORDINATOR],
  },
  {
    title: "Eventos",
    href: ROUTES.EVENTS,
    icon: Calendar,
    roles: [USER_ROLES.COORDINATOR],
  },
  {
    title: "Artigos",
    href: ROUTES.ARTICLES,
    icon: FileText,
    roles: [USER_ROLES.STUDENT, USER_ROLES.EVALUATOR],
  },
  {
    title: "Submeter Artigo",
    href: ROUTES.SUBMIT_ARTICLE,
    icon: Upload,
    roles: [USER_ROLES.STUDENT],
  },
  {
    title: "Usuários",
    href: ROUTES.USERS,
    icon: Users,
    roles: [USER_ROLES.COORDINATOR],
  },
  {
    title: "Checklists",
    href: ROUTES.CHECKLISTS,
    icon: ClipboardList,
    roles: [USER_ROLES.COORDINATOR],
  },
  {
    title: "Rascunhos",
    href: "/rascunhos",
    icon: FileText,
    roles: [USER_ROLES.EVALUATOR],
  },
  {
    title: "Histórico",
    href: "/historico",
    icon: History,
    roles: [USER_ROLES.EVALUATOR],
  },
  {
    title: "Atribuições",
    href: "/atribuicoes",
    icon: UserCheck,
    roles: [USER_ROLES.COORDINATOR],
  },
  {
    title: "Relatórios",
    href: "/relatorios",
    icon: BarChart3,
    roles: [USER_ROLES.COORDINATOR],
  },
];

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const { user } = useAuthContext();
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  if (!user) return null;

  const userNavigationItems = navigationItems.filter((item) =>
    item.roles.includes(user.role)
  );

  const isActive = (href: string) => {
    if (href === ROUTES.DASHBOARD) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar - SEMPRE FIXO */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header do Sidebar */}
        <div className="flex justify-center items-center p-4 border-b border-gray-200">
          <Image
            src="/images/logo-ia360.png"
            alt="Logo SUBMITA"
            width={100}
            height={70}
            className={`object-contain`}
            priority
          />

          {/* Botão fechar apenas no mobile */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="lg:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Área de Navegação com Scroll */}
        <div className="flex-1 flex flex-col h-[calc(100vh-140px)]">
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-1">
              {userNavigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors",
                      active
                        ? "btn-gradient-primary text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <Icon className="mr-3 h-4 w-4" />
                    {item.title}
                    {item.badge && (
                      <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <Separator className="my-4" />
          </ScrollArea>
        </div>
      </aside>
    </>
  );
}
