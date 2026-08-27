import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/auth/callback",
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (path) =>
      pathname === path ||
      pathname.startsWith(`${path}/`)
  );
}

export async function updateSession(
  request: NextRequest
) {
  const pathname = request.nextUrl.pathname;

  /*
   * =====================================================
   * ROUTES PUBLIQUES
   * =====================================================
   *
   * IMPORTANT :
   * On ne contacte PAS Supabase pour les routes publiques.
   *
   * Cela évite qu'une indisponibilité ou un délai de
   * réponse Supabase bloque /login, /register, etc.
   */
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  /*
   * =====================================================
   * VARIABLES SUPABASE
   * =====================================================
   */

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  /*
   * Si Supabase n'est pas configuré, on laisse
   * la requête continuer.
   *
   * Cela évite une boucle de redirection ou un
   * middleware bloqué.
   */
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      "Supabase environment variables are missing."
    );

    return NextResponse.next();
  }

  /*
   * =====================================================
   * RESPONSE
   * =====================================================
   */

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  /*
   * =====================================================
   * CLIENT SUPABASE SERVEUR
   * =====================================================
   */

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(
            ({ name, value }) => {
              request.cookies.set(
                name,
                value
              );
            }
          );

          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });

          cookiesToSet.forEach(
            ({ name, value, options }) => {
              response.cookies.set(
                name,
                value,
                options
              );
            }
          );
        },
      },
    }
  );

  /*
   * =====================================================
   * RÉCUPÉRATION DE L'UTILISATEUR
   * =====================================================
   */

  const {
    data: { user },
  } = await supabase.auth.getUser();

  /*
   * =====================================================
   * UTILISATEUR NON CONNECTÉ
   * =====================================================
   */

  if (!user) {
    const loginUrl =
      request.nextUrl.clone();

    loginUrl.pathname = "/login";

    loginUrl.search = "";

    /*
     * On mémorise la page demandée.
     */
    loginUrl.searchParams.set(
      "redirectTo",
      pathname
    );

    return NextResponse.redirect(
      loginUrl
    );
  }

  /*
   * =====================================================
   * ROUTES ADMIN
   * =====================================================
   */

  const isAdminPath =
    pathname === "/admin" ||
    pathname.startsWith("/admin/");

  if (isAdminPath) {
    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    /*
     * L'utilisateur doit avoir le rôle admin.
     */
    if (
      profileError ||
      !profile ||
      profile.role !== "admin"
    ) {
      const dashboardUrl =
        request.nextUrl.clone();

      dashboardUrl.pathname =
        "/dashboard";

      dashboardUrl.search = "";

      return NextResponse.redirect(
        dashboardUrl
      );
    }
  }

  /*
   * =====================================================
   * UTILISATEUR AUTORISÉ
   * =====================================================
   */

  return response;
}