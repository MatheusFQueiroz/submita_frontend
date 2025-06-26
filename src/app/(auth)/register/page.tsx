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

        {/* Informação sobre registro */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Registro de Aluno:</strong> Todos os usuários que se
            registram publicamente são automaticamente cadastrados como{" "}
            <strong>Aluno</strong>. Avaliadores e Coordenadores são criados por
            usuários autorizados.
          </AlertDescription>
        </Alert>

        {/* Formulário de Registro */}
        <RegisterForm />

        {/* Benefícios */}
        <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="text-center text-sm">
              <h3 className="font-medium text-green-900 dark:text-green-100 mb-2">
                Benefícios da Conta de Aluno
              </h3>
              <ul className="space-y-1 text-green-700 dark:text-green-300 text-left">
                <li>• Submeter artigos para eventos</li>
                <li>• Acompanhar status das avaliações</li>
                <li>• Gerenciar versões dos documentos</li>
                <li>• Receber notificações em tempo real</li>
                <li>• Acesso ao histórico completo</li>
              </ul>
            </div>
          </CardContent>
        </Card>

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
      </div>
    </div>
  );
}
