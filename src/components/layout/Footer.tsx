"use client";

import React from "react";
import Link from "next/link";
import { Heart } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white  border-t border-gray-200  mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Links */}
          <div className="flex items-center space-x-6 text-sm text-gray-500">
            <Link
              href="/sobre"
              className="hover:text-gray-700  transition-colors"
            >
              Sobre
            </Link>
            <Link
              href="/contato"
              className="hover:text-gray-700  transition-colors"
            >
              Contato
            </Link>
            <Link
              href="/suporte"
              className="hover:text-gray-700  transition-colors"
            >
              Suporte
            </Link>
            <Link
              href="/politica"
              className="hover:text-gray-700  transition-colors"
            >
              Política de Privacidade
            </Link>
          </div>

          {/* Copyright */}
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <span>© {currentYear} Biopark. Feito com</span>
            <Heart className="h-3 w-3 text-red-500" />
            <span>para a comunidade acadêmica.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
