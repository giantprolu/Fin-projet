import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/admin(.*)',
  '/parier(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();

    const url = req.nextUrl;
    const pathname = url.pathname;

    // Admin route protection (role-based)
    if (pathname.startsWith('/admin')) {
      // Récupération correcte des données d'auth avec await
      const { userId, sessionClaims } = await auth();
      let isAdmin = false;

      if (userId) {
        // 1. Check session claims publicMetadata (si déjà présent)
        if ((sessionClaims?.publicMetadata as any)?.role === 'admin') {
          isAdmin = true;
        }

        // 2. Si pas dans les claims, on interroge l'API Clerk (ne dépend pas d'une liste en clair)
        if (!isAdmin && process.env.CLERK_SECRET_KEY) {
          try {
            const res = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
              headers: {
                Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
              },
              cache: 'no-store'
            });
            if (res.ok) {
              const json: any = await res.json();
              if (json?.public_metadata?.role === 'admin') {
                isAdmin = true;
              }
            } else {
              const errorText = await res.text();
              console.log('DEBUG: API error response =', errorText);
            }
          } catch (e) {
            console.log('DEBUG: Erreur API Clerk =', e);
          }
        } else {
          console.log('DEBUG: Pas de CLERK_SECRET_KEY ou déjà admin');
        }

        console.log('DEBUG: Final isAdmin =', isAdmin);
      } else {
        console.log('DEBUG: Pas de userId trouvé');
      }

      if (!isAdmin) {
        return Response.redirect(new URL('/unauthorized', req.url));
      }
    }
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};