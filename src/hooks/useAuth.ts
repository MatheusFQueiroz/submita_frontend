"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  User,
  LoginRequest,
  RegisterRequest,
  ChangePasswordRequest,
} from "@/types";
import { ROUTES } from "@/lib/constants";
import { isTokenExpired, decodeToken, getRedirectPath } from "@/lib/auth";
import toast from "react-hot-toast";
import Cookies from "js-cookie";

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  changePassword: (data: ChangePasswordRequest) => Promise<void>;
  refreshProfile: () => Promise<void>;
  syncWithCookies: () => void;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;

  // Carrega o usuário do token ao inicializar
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = Cookies.get("submita_token");

        if (!token || isTokenExpired(token)) {
          setIsLoading(false);
          return;
        }

        // Busca o perfil do usuário
        const profile = await api.get<User>("/auth/profile");
        setUser(profile);
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
        Cookies.remove("submita_token");
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = useCallback(
    async (data: LoginRequest) => {
      try {
        setIsLoading(true);

        const response = await api.post("/auth/login", data);
        const { token, user: userData, isFirstLogin } = response;

        console.log("📥 Login response:", {
          hasToken: !!token,
          isFirstLogin,
          userRole: userData.role,
        });

        // ✅ CORREÇÃO: Usar novo método que salva token + flag
        api.setLoginData(token, isFirstLogin);

        // Atualizar estado do usuário
        const userWithFirstLogin = { ...userData, isFirstLogin };
        setUser(userWithFirstLogin);

        toast.success("Login realizado com sucesso!");

        // ✅ CORREÇÃO: NÃO usar router.push - deixar o middleware processar
        // O middleware vai ler o cookie e fazer o redirecionamento correto
        console.log("🔄 Recarregando página para middleware processar...");

        // Pequeno delay para garantir que os cookies foram salvos
        setTimeout(() => {
          window.location.reload();
        }, 100);
      } catch (error: any) {
        console.error("❌ Erro no login:", error);
        toast.error(error.message || "Erro ao fazer login");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [] // Remover dependência do router
  );

  const register = useCallback(
    async (data: RegisterRequest) => {
      try {
        setIsLoading(true);

        const response = await api.post("/auth/register", data);
        const { token, user: userData } = response;

        // Salva o token
        api.setToken(token);
        setUser(userData);

        toast.success("Cadastro realizado com sucesso!");
        router.push(ROUTES.DASHBOARD);
      } catch (error: any) {
        console.error("Erro no registro:", error);
        toast.error(error.message || "Erro ao fazer cadastro");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const logout = useCallback(() => {
    api.clearToken(); // ✅ Agora limpa todos os cookies
    setUser(null);
    toast.success("Logout realizado com sucesso!");
    router.push(ROUTES.HOME);
  }, [router]);

  const changePassword = useCallback(
    async (data: ChangePasswordRequest) => {
      try {
        setIsLoading(true);

        await api.put("/auth/change-password", data);

        // ✅ CORREÇÃO: Limpar flag de primeiro login
        api.clearFirstLoginFlag();

        // Buscar perfil atualizado
        try {
          const updatedProfile = await api.get<User>("/auth/profile");
          setUser(updatedProfile);
        } catch (profileError) {
          console.error("Erro ao buscar perfil atualizado:", profileError);
          // Fallback: atualizar localmente
          if (user) {
            setUser({ ...user, isFirstLogin: false });
          }
        }

        toast.success("Senha alterada com sucesso!");

        // ✅ CORREÇÃO: Dar tempo para o middleware processar a mudança
        setTimeout(() => {
          router.push(ROUTES.DASHBOARD);
        }, 500);
      } catch (error: any) {
        console.error("❌ Erro ao alterar senha:", error);
        toast.error(error.message || "Erro ao alterar senha");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [user, router]
  );

  const refreshProfile = useCallback(async () => {
    try {
      const profile = await api.get<User>("/auth/profile");
      setUser(profile);
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
    }
  }, []);

  const syncWithCookies = useCallback(() => {
    if (user && user.isFirstLogin !== api.isFirstLogin()) {
      setUser({ ...user, isFirstLogin: api.isFirstLogin() });
      console.log("🔄 User state synced with cookies");
    }
  }, [user]);

  // ✅ Carregamento inicial atualizado
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = Cookies.get("submita_token");

        if (!token || isTokenExpired(token)) {
          setIsLoading(false);
          return;
        }

        // Buscar perfil do usuário
        const profile = await api.get<User>("/auth/profile");

        // ✅ CORREÇÃO: Sincronizar isFirstLogin com cookie
        const isFirstLogin = api.isFirstLogin();
        const userWithCorrectFirstLogin = { ...profile, isFirstLogin };

        setUser(userWithCorrectFirstLogin);

        console.log("👤 User loaded:", {
          email: profile.email,
          role: profile.role,
          isFirstLogin,
        });
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
        api.clearToken();
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    changePassword,
    refreshProfile,
    syncWithCookies,
  };
}
