import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import Cookies from "js-cookie";
import { ApiResponse, ApiError } from "@/types";
import { API_CONFIG } from "./constants";

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
    this.loadTokenFromCookies();
  }

  private setupInterceptors() {
    // Request interceptor - adiciona token
    this.client.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - trata erros
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.clearToken();
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        }
        return Promise.reject(this.handleApiError(error));
      }
    );
  }

  private handleApiError(error: any): ApiError {
    const apiError: ApiError = {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Erro interno do servidor",
      timestamp: new Date(),
    };

    if (error.response?.data?.errors) {
      apiError.errors = error.response.data.errors;
    }

    return apiError;
  }

  private loadTokenFromCookies() {
    if (typeof window !== "undefined") {
      this.token = Cookies.get("submita_token") || null;
    }
  }

  // ✅ NOVO: Método para salvar dados de login completos
  setLoginData(token: string, isFirstLogin: boolean) {
    this.token = token;

    // Salvar token (7 dias)
    Cookies.set("submita_token", token, { expires: 7 });

    // ✅ CORREÇÃO: Salvar flag isFirstLogin em cookie separado
    if (isFirstLogin) {
      Cookies.set("submita_first_login", "true", { expires: 7 });
    } else {
      Cookies.remove("submita_first_login");
    }

    console.log("💾 Login data saved:", { hasToken: !!token, isFirstLogin });
  }

  // ✅ ATUALIZADO: Método setToken mantido para compatibilidade
  setToken(token: string) {
    this.token = token;
    Cookies.set("submita_token", token, { expires: 7 });
    // Não mexer no cookie isFirstLogin aqui
  }

  // ✅ ATUALIZADO: Limpar todos os cookies relacionados
  clearToken() {
    this.token = null;
    Cookies.remove("submita_token");
    Cookies.remove("submita_first_login"); // ✅ Limpar flag também
    console.log("🗑️ All auth cookies cleared");
  }

  // ✅ NOVO: Verificar se é primeiro login via cookie
  isFirstLogin(): boolean {
    return Cookies.get("submita_first_login") === "true";
  }

  // ✅ NOVO: Marcar que não é mais primeiro login
  clearFirstLoginFlag() {
    Cookies.remove("submita_first_login");
    console.log("✅ First login flag cleared");
  }

  // Métodos HTTP (sem mudanças)
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return (response.data.data ?? response.data) as T;
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return (response.data.data ?? response.data) as T;
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return (response.data.data ?? response.data) as T;
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return (response.data.data ?? response.data) as T;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return (response.data.data ?? response.data) as T;
  }
}

export const api = new ApiClient();
