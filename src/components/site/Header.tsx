import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search, Menu, X, ChevronDown } from "lucide-react";
import logo from "@/assets/logo-velicham.png";
import logoMark from "@/assets/logo-mark.png";
import { NAV_GROUPS } from "@/lib/categories";
import { cn } from "@/lib/utils";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 120);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Big logo banner — hidden when scrolled */}
        <div
          className={cn(
            "w-full bg-background border-b border-border transition-all duration-300 overflow-hidden hidden md:block",
            scrolled ? "max-h-0 opacity-0" : "max-h-44 opacity-100 py-6 md:py-8",
          )}
        >
        <div className="container mx-auto flex justify-center">
          <Link to="/">
            <img
              src={logo}
              alt="Velicham — വെളിച്ചം Magazine"
              className="h-16 md:h-20 lg:h-24 w-auto"
            />
          </Link>
        </div>
      </div>

      {/* Sticky nav */}
      <header
        className={cn(
          "sticky top-0 z-40 w-full bg-background/95 backdrop-blur border-b border-border transition-shadow",
          scrolled && "shadow-sm",
        )}
      >
        <div className="container mx-auto flex items-center gap-2 h-14 px-3 md:px-6">
          {/* Mini-logo when scrolled */}
          <Link
            to="/"
            className={cn(
              "flex items-center gap-2 transition-all duration-300",
              scrolled ? "opacity-100 w-auto" : "opacity-100 w-auto md:opacity-0 md:w-0 md:overflow-hidden",
            )}
          >
            <img
              src={logo}
              alt="Velicham"
              className="h-8 md:h-9 w-auto"
            />
          </Link>

          {/* Mobile search icon (always visible) */}
          <button
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
            className="lg:hidden ml-auto p-2 rounded-md hover:bg-muted"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="lg:hidden p-2 rounded-md hover:bg-muted"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 ml-6 flex-1">
            <NavItem to="/" label="Home" />
            {NAV_GROUPS.map((g) =>
              g.children ? (
                <div
                  key={g.slug}
                  className="relative"
                  onMouseEnter={() => setOpenGroup(g.slug)}
                  onMouseLeave={() => setOpenGroup(null)}
                >
                  <button className="px-3 py-2 text-sm font-medium text-foreground hover:text-brand inline-flex items-center gap-1">
                    {g.name} <ChevronDown className="h-3 w-3" />
                  </button>
                  {openGroup === g.slug && (
                    <div className="absolute left-0 top-full pt-1 min-w-52">
                      <div className="bg-card border border-border rounded-md shadow-lg py-2">
                        {g.children.map((c) => (
                          <Link
                            key={c.slug}
                            to="/category/$slug"
                            params={{ slug: c.slug }}
                            className="block px-4 py-2 text-sm hover:bg-muted hover:text-brand"
                          >
                            <span>{c.name}</span>
                            <span className="ml ml-2 text-muted-foreground">{c.nameMl}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <NavItem key={g.slug} to={`/${g.slug}` as "/interview"} label={g.name} />
              ),
            )}
            <NavItem to="/about" label="About Us" />
          </nav>

          {/* Right actions */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-md hover:bg-muted text-foreground"
            >
              <Search className="h-5 w-5" />
            </button>
            <Link
              to="/submit"
              className="px-4 py-2 text-sm font-medium rounded-md bg-brand text-primary-foreground hover:bg-brand-light transition-colors"
            >
              Submit Article
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-background shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <img src={logo} alt="Velicham" className="h-9 w-auto" />
              <button onClick={() => setMobileOpen(false)} aria-label="Close" className="p-2">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="p-4 space-y-1">
              <MobileLink to="/" onClick={() => setMobileOpen(false)}>Home</MobileLink>
              {NAV_GROUPS.map((g) =>
                g.children ? (
                  <details key={g.slug} className="group">
                    <summary className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-muted font-medium cursor-pointer">
                      {g.name}
                      <ChevronDown className="h-4 w-4 group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="ml-3 mt-1 border-l border-border pl-3 space-y-1">
                      {g.children.map((c) => (
                        <Link
                          key={c.slug}
                          to="/category/$slug"
                          params={{ slug: c.slug }}
                          onClick={() => setMobileOpen(false)}
                          className="block px-3 py-2 rounded-md hover:bg-muted text-sm"
                        >
                          {c.name} <span className="ml text-muted-foreground ml-1">{c.nameMl}</span>
                        </Link>
                      ))}
                    </div>
                  </details>
                ) : (
                  <MobileLink key={g.slug} to={`/${g.slug}` as "/interview"} onClick={() => setMobileOpen(false)}>
                    {g.name}
                  </MobileLink>
                ),
              )}
              <MobileLink to="/about" onClick={() => setMobileOpen(false)}>About Us</MobileLink>
              <Link
                to="/submit"
                onClick={() => setMobileOpen(false)}
                className="block mt-4 text-center px-4 py-3 rounded-md bg-brand text-primary-foreground font-medium"
              >
                Submit Article
              </Link>
            </nav>
          </div>
        </div>
      )}

      {/* Search overlay */}
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </>
  );
}

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to as "/"}
      activeOptions={{ exact: to === "/" }}
      activeProps={{ className: "text-brand" }}
      className="px-3 py-2 text-sm font-medium text-foreground hover:text-brand transition-colors"
    >
      {label}
    </Link>
  );
}

function MobileLink({ to, children, onClick }: { to: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link
      to={to as "/"}
      onClick={onClick}
      className="block px-3 py-2 rounded-md hover:bg-muted font-medium"
    >
      {children}
    </Link>
  );
}

function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState("");
  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur flex items-start justify-center pt-24 px-4">
      <button onClick={onClose} aria-label="Close search" className="absolute top-4 right-4 p-2">
        <X className="h-6 w-6" />
      </button>
      <form
        className="w-full max-w-2xl"
        onSubmit={(e) => {
          e.preventDefault();
          if (q.trim()) {
            window.location.href = `/search?q=${encodeURIComponent(q.trim())}`;
          }
        }}
      >
        <div className="flex items-center border-b-2 border-brand pb-2">
          <Search className="h-6 w-6 text-brand mr-3" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search articles…"
            className="flex-1 bg-transparent text-2xl outline-none ml"
          />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">Press Enter to search</p>
      </form>
    </div>
  );
}
