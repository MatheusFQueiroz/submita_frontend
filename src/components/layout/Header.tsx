"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, Menu, Moon, Sun, User, LogOut, Settings } from "lucide-react";
import { useAuthContext } from "@/providers/AuthProvider";
import { useTheme } from "next-themes";
import { formatUserRole, getInitials } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";

interface HeaderProps {
  onToggleSidebar?: () => void;
  showSidebarToggle?: boolean;
}

export function Header({
  onToggleSidebar,
  showSidebarToggle = true,
}: HeaderProps) {
  const { user, logout } = useAuthContext();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const handleLogout = () => {
    logout();
  };

  const handleProfile = () => {
    router.push(ROUTES.PROFILE);
  };

  return (
    <header className="bg-white  border-b border-gray-200  px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Logo e Toggle Sidebar */}
        <div className="flex items-center space-x-4">
          {showSidebarToggle && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSidebar}
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          <Link
            href={user ? ROUTES.DASHBOARD : ROUTES.HOME}
            className="flex items-center space-x-2"
          >
            <div className="submita-gradient w-8 h-8 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-primary">SUBMITA</h1>
              <p className="text-xs text-gray-500">Biopark</p>
            </div>
          </Link>
        </div>

        {/* Ações do Header */}
        <div className="flex items-center space-x-2">
          {user ? (
            <>
              {/* Notificações */}
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
                <span className="sr-only">Notificações</span>
              </Button>

              {/* Menu do Usuário */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {formatUserRole(user.role)}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleProfile}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleProfile}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configurações</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href={ROUTES.LOGIN}>Entrar</Link>
              </Button>
              <Button asChild>
                <Link href={ROUTES.REGISTER}>Registrar</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
