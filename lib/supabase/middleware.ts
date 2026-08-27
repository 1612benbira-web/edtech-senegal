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
  /*
   * Les pages publiques n'ont pas besoin
   * d'interroger Supabase.
   */
  const pathname = request.nextUrl.pathname;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  /*
   * Si Supabase n'est pas configuré,
   * on laisse Next.js continuer.
   */
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      "Missing Supabase environment variables."
    );

    return NextResponse.next();
  }

  /*
   * Réponse initiale.
   */
  let response = NextResponse.next({
    request,
  });

  /*
   * Client Supabase côté serveur.
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
              request.cookies.set(name, value);
            }
          );

          response = NextResponse.next({
            request,
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
   * Vérification de la session.
   *
   * IMPORTANT :
   * getUser() vérifie réellement l'utilisateur
   * auprès de Supabase Auth.
   */
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  /*
   * En cas d'erreur réseau ou Supabase,
   * on ne redirige pas automatiquement.
   *
   * Cela évite de créer des boucles ou de bloquer
   * toute l'application si Supabase répond lentement.
   */
  if (error) {
    console.error(
      "Supabase middleware auth error:",
      error.message
    );

    return response;
  }

  /*
   * Pas connecté :
   * redirection vers la page de connexion.
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
   * on laisse la requête continuer.
   *
   * Le contrôle des permissions admin doit rester
   * dans les pages/actions serveur.
   */
  return response;
}