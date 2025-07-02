"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Users,
  CheckCircle,
  Calendar,
  FileText,
  Star,
  ArrowRight,
  Zap,
  Shield,
  Clock,
} from "lucide-react";
import { ROUTES } from "@/lib/constants";

export default function HomePage() {
  const features = [
    {
      icon: <FileText className="h-8 w-8 text-primary" />,
      title: "Submissão Simplificada",
      description:
        "Interface intuitiva para submissão de artigos com validação automática e suporte a múltiplos formatos.",
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Gestão de Avaliadores",
      description:
        "Sistema completo para coordenadores gerenciarem avaliadores e distribuírem artigos de forma eficiente.",
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-primary" />,
      title: "Avaliação Estruturada",
      description:
        "Checklists personalizáveis e sistema de notas para avaliações consistentes e transparentes.",
    },
    {
      icon: <Calendar className="h-8 w-8 text-primary" />,
      title: "Eventos Organizados",
      description:
        "Criação e gestão de eventos acadêmicos com prazos, critérios e workflows personalizados.",
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "Processo Ágil",
      description:
        "Automatização de fluxos de trabalho reduzindo tempo e aumentando a eficiência do processo.",
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Seguro e Confiável",
      description:
        "Dados protegidos com autenticação robusta e controle de acesso baseado em perfis.",
    },
  ];

  const benefits = [
    "Redução de 80% no tempo de gestão de submissões",
    "Interface moderna e responsiva para todos os dispositivos",
    "Sistema de notificações em tempo real",
    "Relatórios e estatísticas detalhadas",
    "Suporte completo durante todo o processo",
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Image
                src="/images/logo-ia360-2.png"
                alt="Logo SUBMITA"
                width={180}
                height={100}
                className={`object-contain`} // Adiciona 'hidden' se 'user' existir
                priority
              />
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-gray-600 hover:text-primary transition-colors"
              >
                Recursos
              </a>
              <a
                href="#benefits"
                className="text-gray-600 hover:text-primary transition-colors"
              >
                Benefícios
              </a>
              <a
                href="#contact"
                className="text-gray-600 hover:text-primary transition-colors"
              >
                Contato
              </a>
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-3">
              <Button variant="ghost" className="border" asChild>
                <Link href={ROUTES.LOGIN} className="gradient-text-cool">
                  Entrar
                </Link>
              </Button>
              <Button className="border" asChild>
                <Link href={ROUTES.REGISTER} className="gradient-text">
                  Registrar
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="submita-gradient py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Sistema de Submissão de{" "}
              <span className="text-blue-200">Artigos Acadêmicos</span>
            </h1>

            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Plataforma completa para gestão de submissões, avaliações e
              eventos acadêmicos. Desenvolvido para simplificar e otimizar todo
              o processo de publicação científica.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-gray-100"
                asChild
              >
                <Link href={ROUTES.REGISTER}>
                  <span className="gradient-text">Começar Agora</span>
                  <svg className="ml-2 h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <defs>
                      <linearGradient
                        id="arrowGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="25%" stopColor="#3b82f6" />
                        <stop offset="50%" stopColor="#06b6d4" />
                        <stop offset="75%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#84cc16" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M5 12h14m-7-7l7 7-7 7"
                      stroke="url(#arrowGradient)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
                asChild
              >
                <Link href={ROUTES.LOGIN}>Já tenho conta</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Recursos Poderosos
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tudo que você precisa para gerenciar submissões acadêmicas de
              forma eficiente
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-shadow"
              >
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Transforme a Gestão Acadêmica do seu Evento
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                O SUBMITA revoluciona a forma como eventos acadêmicos gerenciam
                submissões, proporcionando uma experiência moderna e eficiente
                para todos os envolvidos.
              </p>

              <ul className="space-y-4 mb-8">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>

              <Button size="lg" asChild>
                <Link href={ROUTES.REGISTER}>
                  Começar Gratuitamente
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-primary to-blue-600 rounded-2xl p-8 text-white">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold">80%</div>
                    <div className="text-sm opacity-80">Redução de Tempo</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">100%</div>
                    <div className="text-sm opacity-80">Digital</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">24/7</div>
                    <div className="text-sm opacity-80">Disponibilidade</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">∞</div>
                    <div className="text-sm opacity-80">Submissões</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Pronto para Modernizar seu Evento Acadêmico?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Junte-se à comunidade Biopark e revolucione a gestão de submissões
            acadêmicas
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-gray-100"
              asChild
            >
              <Link href={ROUTES.REGISTER}>Criar Conta Gratuita</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
              asChild
            >
              <Link href={ROUTES.LOGIN}>Fazer Login</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo e Descrição */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="submita-gradient w-10 h-10 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">SUBMITA</h3>
                  <p className="text-sm text-gray-400">Biopark</p>
                </div>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Sistema de submissão de artigos acadêmicos desenvolvido para a
                comunidade científica do Biopark e eventos acadêmicos.
              </p>
              <div className="flex space-x-4">
                <Badge
                  variant="outline"
                  className="text-gray-400 border-gray-600"
                >
                  Versão 1.0.0
                </Badge>
                <Badge
                  variant="outline"
                  className="text-gray-400 border-gray-600"
                >
                  Open Source
                </Badge>
              </div>
            </div>

            {/* Links Rápidos */}
            <div>
              <h4 className="font-semibold mb-4">Links Rápidos</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href={ROUTES.LOGIN}
                    className="hover:text-white transition-colors"
                  >
                    Fazer Login
                  </Link>
                </li>
                <li>
                  <Link
                    href={ROUTES.REGISTER}
                    className="hover:text-white transition-colors"
                  >
                    Criar Conta
                  </Link>
                </li>
                <li>
                  <a
                    href="#features"
                    className="hover:text-white transition-colors"
                  >
                    Recursos
                  </a>
                </li>
                <li>
                  <a
                    href="#benefits"
                    className="hover:text-white transition-colors"
                  >
                    Benefícios
                  </a>
                </li>
              </ul>
            </div>

            {/* Contato */}
            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <ul className="space-y-2 text-gray-400">
                <li>contato@biopark.com.br</li>
                <li>(45) 3000-0000</li>
                <li>Toledo - PR</li>
                <li>
                  <a
                    href="https://biopark.com.br"
                    className="hover:text-white transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    biopark.com.br
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Biopark. Todos os direitos reservados.</p>
            <p className="mt-2 text-sm">
              Desenvolvido com ❤️ para a comunidade acadêmica
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
