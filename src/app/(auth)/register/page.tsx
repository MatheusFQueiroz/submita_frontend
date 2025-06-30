import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/forms/RegisterForm";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Info } from "lucide-react";

export const metadata: Metadata = {
  title: "Criar Conta",
  description: "Crie sua conta no SUBMITA - Sistema de Submissão de Artigos",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
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

        {/* Formulário de Registro */}
        <RegisterForm />

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>
            Ao criar uma conta, você concorda com nossos{" "}
            <a href="/termos" className="text-primary hover:underline">
              Termos de Uso
            </a>{" "}
            e{" "}
            <a href="/privacidade" className="text-primary hover:underline">
              Política de Privacidade
            </a>
          </p>
        </div>
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
