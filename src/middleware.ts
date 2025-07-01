import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const publicRoutes = ["/", "/login", "/register"];

const roleRoutes = {
  STUDENT: [
    "/dashboard",
    "/artigos",
    "/submeter-artigo",
    "/ressalvas",
    "/perfil",
  ],
  EVALUATOR: [
    "/dashboard",
    "/artigos",
    "/avaliar",
    "/rascunhos",
    "/historico",
    "/perfil",
  ],
  COORDINATOR: [
    "/dashboard",
    "/eventos",
    "/usuarios",
    "/checklists",
    "/atribuicoes",
    "/relatorios",
    "/perfil",
  ],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log(`🔍 Middleware - ${pathname}`);

  // 1. Rotas públicas
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // 2. Verificar token
  const token = request.cookies.get("submita_token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // 3. Decodificar token
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "your-secret-key"
    );
    const { payload } = await jwtVerify(token, secret);
    const user = payload as any;

    if (!user?.userId || !user?.role) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("submita_token");
      response.cookies.delete("submita_first_login");
      return response;
    }

    // 4. Verificar primeiro login
    const isFirstLogin =
      request.cookies.get("submita_first_login")?.value === "true";

    console.log(
      `👤 ${user.email} | ${user.role} | firstLogin: ${isFirstLogin}`
    );

    // 5. ✅ CORREÇÃO: Tratar /redefinir-senha ANTES de verificar roles
    if (pathname === "/redefinir-senha") {
      if (isFirstLogin) {
        console.log(`✅ Primeiro login → /redefinir-senha OK`);
        return NextResponse.next();
      } else {
        console.log(`🔄 Não é primeiro login → /dashboard`);
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    // 6. Se é primeiro login e não está em redefinir senha
    if (isFirstLogin) {
      console.log(`🔄 Primeiro login → forçar /redefinir-senha`);
      return NextResponse.redirect(new URL("/redefinir-senha", request.url));
    }

    // 7. Verificar permissões por role
    const allowedRoutes = roleRoutes[user.role as keyof typeof roleRoutes];
    if (!allowedRoutes) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("submita_token");
      response.cookies.delete("submita_first_login");
      return response;
    }

    const hasAccess = allowedRoutes.some((route) => pathname.startsWith(route));
    if (!hasAccess) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    console.log(`✅ Acesso OK: ${user.role} → ${pathname}`);
    return NextResponse.next();
  } catch (error: any) {
    console.error("❌ Erro JWT:", error);
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("submita_token");
    response.cookies.delete("submita_first_login");
    return response;
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|_next/webpack-hmr|favicon.ico).*)",
  ],
};
