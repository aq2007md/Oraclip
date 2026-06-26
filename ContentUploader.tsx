import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/components/AuthProvider";
import { Logo } from "@/components/Logo";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  User as UserIcon,
  History,
  UserCog,
  CreditCard,
  Plug,
  LogOut,
  ChevronDown,
} from "lucide-react";

export function AppHeader() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const name = profile?.display_name ?? user?.email ?? "Account";
  const initial = (name.trim().charAt(0) || "?").toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  return (
    <header
      className="relative z-10 sticky top-0 backdrop-blur-md"
      style={{
        background: "color-mix(in oklab, var(--teal-deep) 85%, black)",
        borderBottom: "1px solid color-mix(in oklab, var(--mint) 15%, transparent)",
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link to="/app" aria-label="Go to app">
          <Logo size={26} wordmarkClassName="text-lg" />
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 text-sm transition-colors hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-mint"
          >
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold"
              style={{ background: "var(--mint)", color: "var(--teal-deep)" }}
              aria-hidden
            >
              {initial}
            </span>
            <span className="max-w-[160px] truncate" style={{ opacity: 0.85 }}>
              {name}
            </span>
            <ChevronDown className="h-4 w-4 opacity-60" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 border-white/10 bg-[color-mix(in_oklab,var(--teal-deep)_92%,black)] text-teal-foreground"
          >
            <DropdownMenuLabel className="truncate text-xs font-normal opacity-60">
              {user?.email}
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem asChild className="cursor-pointer focus:bg-white/10">
              <Link to="/account">
                <UserIcon className="h-4 w-4" /> My account
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer focus:bg-white/10">
              <Link to="/account/history">
                <History className="h-4 w-4" /> Simulation history
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer focus:bg-white/10">
              <Link to="/account/profile">
                <UserCog className="h-4 w-4" /> Profile & preferences
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer focus:bg-white/10">
              <Link to="/account/plan">
                <CreditCard className="h-4 w-4" /> Plan & billing
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer focus:bg-white/10">
              <Link to="/account/connections">
                <Plug className="h-4 w-4" /> Connections
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem
              onSelect={handleSignOut}
              className="cursor-pointer text-amber-200 focus:bg-white/10 focus:text-amber-200"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export default AppHeader;
