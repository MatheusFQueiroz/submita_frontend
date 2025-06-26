import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/forms/LoginForm";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Login",
  description: "Faça login na sua conta SUBMITA",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* Link para voltar */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-primary transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para página inicial
          </Link>
        </div>

        {/* Formulário de Login */}
        <LoginForm />

        {/* Informações adicionais */}
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="text-center text-sm">
              <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Tipos de Usuário
              </h3>
              <div className="space-y-1 text-blue-700 dark:text-blue-300">
                <p>
                  <strong>Aluno:</strong> Registre-se gratuitamente
                </p>
                <p>
                  <strong>Avaliador:</strong> Criado por coordenadores
                </p>
                <p>
                  <strong>Coordenador:</strong> Acesso especial
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>
            Desenvolvido por{" "}
            <a
              href="https://biopark.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Biopark
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
