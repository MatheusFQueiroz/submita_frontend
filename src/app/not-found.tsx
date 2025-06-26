import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="submita-gradient w-16 h-16 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
        </div>

        {/* 404 */}
        <div className="space-y-2">
          <h1 className="text-8xl font-bold text-primary">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Página não encontrada
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            A página que você está procurando não existe ou foi movida.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => window.history.back()} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <Button asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Página Inicial
            </Link>
          </Button>
        </div>

        {/* Helpful Links */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 mb-3">Links úteis:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link
              href="/login"
              className="text-sm text-primary hover:underline"
            >
              Login
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="/register"
              className="text-sm text-primary hover:underline"
            >
              Registrar
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="/dashboard"
              className="text-sm text-primary hover:underline"
            >
              Dashboard
            </Link>
            <span className="text-gray-300">•</span>
            <a
              href="mailto:contato@biopark.com.br"
              className="text-sm text-primary hover:underline"
            >
              Suporte
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
