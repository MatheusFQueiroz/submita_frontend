import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/forms/LoginForm";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Login",
  description: "Faça login na sua conta",
};

export default function LoginPage() {
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

        {/* Formulário de Login */}
        <LoginForm />

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>
            Desenvolvido por{" "}
            <a
              href="https://www.instagram.com/cliick_sistemas/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Cliick
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
