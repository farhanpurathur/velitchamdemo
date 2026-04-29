import { Outlet, createRootRouteWithContext, HeadContent, Scripts, Link } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/useAuth";

import appCss from "../styles.css?url";

interface RouterContext {
  queryClient: QueryClient;
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-brand serif">404</h1>
        <h2 className="mt-4 text-xl font-semibold ml">പേജ് കണ്ടെത്താനായില്ല</h2>
        <p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist.</p>
        <Link to="/" className="mt-6 inline-block px-4 py-2 rounded-md bg-brand text-primary-foreground">
          Go home
        </Link>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Velicham — വെളിച്ചം Magazine" },
      { name: "description", content: "വെളിച്ചം — ചിന്തയുടെയും സംസ്കാരത്തിന്റെയും മാസിക. Articles on religion, culture, society, music, gender, politics, fiction, reviews and interviews." },
      { property: "og:title", content: "Velicham — വെളിച്ചം Magazine" },
      { property: "og:description", content: "വെളിച്ചം — ചിന്തയുടെയും സംസ്കാരത്തിന്റെയും മാസിക. Articles on religion, culture, society, music, gender, politics, fiction, reviews and interviews." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "Velicham — വെളിച്ചം Magazine" },
      { name: "twitter:description", content: "വെളിച്ചം — ചിന്തയുടെയും സംസ്കാരത്തിന്റെയും മാസിക. Articles on religion, culture, society, music, gender, politics, fiction, reviews and interviews." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/ba712143-f015-4513-8934-5594d58c2999/id-preview-ecb8cb78--7e60b1e8-f7b0-4c67-8bb0-75603db30bd0.lovable.app-1777263360984.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/ba712143-f015-4513-8934-5594d58c2999/id-preview-ecb8cb78--7e60b1e8-f7b0-4c67-8bb0-75603db30bd0.lovable.app-1777263360984.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ml">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
