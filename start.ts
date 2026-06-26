import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useRouterState,
} from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/AppHeader";
import { LayoutDashboard, History, UserCog, CreditCard, Plug } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/account")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/login" });
  },
  component: AccountLayout,
});

type NavItem = {
  to: "/account" | "/account/history" | "/account/profile" | "/account/plan" | "/account/connections";
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
};

const NAV: NavItem[] = [
  { to: "/account", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/account/history", label: "History", icon: History },
  { to: "/account/profile", label: "Profile", icon: UserCog },
  { to: "/account/plan", label: "Plan", icon: CreditCard },
  { to: "/account/connections", label: "Connections", icon: Plug },
];

function AccountLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  return (
    <main
      className="relative min-h-screen"
      style={{ background: "var(--teal-deep)", color: "var(--teal-foreground)" }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-32 -top-40 h-[500px] w-[500px] rounded-full blur-3xl"
          style={{ background: "var(--mint)", opacity: 0.1 }}
        />
        <div
          className="absolute -right-40 top-32 h-[600px] w-[600px] rounded-full blur-3xl"
          style={{ background: "var(--mint)", opacity: 0.06 }}
        />
      </div>

      <AppHeader />

      {/* Mobile sticky tab bar */}
      <nav
        className="sticky top-[57px] z-10 overflow-x-auto border-b backdrop-blur-md md:hidden"
        style={{
          background: "color-mix(in oklab, var(--teal-deep) 85%, black)",
          borderColor: "color-mix(in oklab, var(--mint) 15%, transparent)",
        }}
      >
        <ul className="mx-auto flex max-w-6xl items-center gap-1 px-4 py-2">
          {NAV.map((item) => {
            const active = isActive(item.to, item.exact);
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    "flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                    active
                      ? "bg-mint text-teal-deep"
                      : "text-teal-foreground/70 hover:bg-white/5 hover:text-teal-foreground",
                  )}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="relative z-[1] mx-auto flex w-full max-w-6xl gap-8 px-6 py-8 md:px-8">
        {/* Desktop sidebar */}
        <aside className="hidden w-[200px] shrink-0 md:block">
          <div className="sticky top-24 space-y-1">
            {NAV.map((item) => {
              const active = isActive(item.to, item.exact);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-mint/15 text-mint"
                      : "text-teal-foreground/70 hover:bg-white/5 hover:text-teal-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </main>
  );
}
