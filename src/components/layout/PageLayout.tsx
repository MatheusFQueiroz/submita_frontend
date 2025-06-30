"use client";

import React, { useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";
import { Navigation } from "./Navigation";
import { useAuthContext } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  actions?: React.ReactNode;
  className?: string;
  showSidebar?: boolean;
  showFooter?: boolean;
}

export function PageLayout({
  children,
  title,
  breadcrumbs,
  actions,
  className,
  showSidebar = true,
  showFooter = true,
}: PageLayoutProps) {
  const { user } = useAuthContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <Header
        onToggleSidebar={toggleSidebar}
        showSidebarToggle={showSidebar && !!user}
      />

      <div className="flex flex-1">
        {/* Sidebar */}
        {showSidebar && user && (
          <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        )}

        {/* Conteúdo Principal */}
        <main className="flex-1 flex flex-col">
          {/* Header da Página */}
          {(title || breadcrumbs || actions) && (
            <div className="bg-white  border-b border-gray-200  px-4 py-4">
              <div className="max-w-7xl mx-auto">
                {breadcrumbs && (
                  <Navigation items={breadcrumbs} className="mb-2" />
                )}

                {(title || actions) && (
                  <div className="flex items-center justify-between">
                    {title && (
                      <h1 className="text-2xl font-bold text-gray-900 ">
                        {title}
                      </h1>
                    )}
                    {actions && (
                      <div className="flex items-center space-x-2">
                        {actions}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Conteúdo */}
          <div className={cn("flex-1 p-4", className)}>
            <div className="max-w-7xl mx-auto">{children}</div>
          </div>

          {/* Footer */}
          {showFooter && <Footer />}
        </main>
      </div>
    </div>
  );
}
