import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/auth/callback",
];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(
    (path) =>
      pathname === path ||
      pathname.startsWith(`${path}/`)
  );
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  /*
   * Si Supabase n'est pas configuré,
   * on laisse la requête continuer.
   */
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      "Supabase environment variables are missing."
    );

    return response;
  }

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
              request.cookies.set(name, value);
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

  const pathname = request.nextUrl.pathname;

  /*
   * Les routes publiques ne nécessitent
   * aucune vérification d'authentification.
   */
  if (isPublicPath(pathname)) {
    return response;
  }

  /*
   * Vérification de la session Supabase.
   */
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  /*
   * En cas d'erreur Supabase, on évite une
   * boucle de redirection ou un blocage.
   */
  if (error) {
    console.error(
      "Supabase auth error:",
      error.message
    );

    return response;
  }

  /*
   * Utilisateur non connecté :
   * redirection vers /login.
   */
  if (!user) {
    const loginUrl = request.nextUrl.clone();

    loginUrl.pathname = "/login";
    loginUrl.search = "";

    loginUrl.searchParams.set(
      "redirectTo",
      pathname
    );

    return NextResponse.redirect(loginUrl);
  }

  /*
   * Utilisateur connecté :
   * la requête continue.
   *
   * La vérification du rôle admin doit être faite
   * dans les pages/actions serveur admin et protégée
   * par les RLS Supabase.
   */
  return response;
}