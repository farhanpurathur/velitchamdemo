import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo-velicham.png";
import { NAV_GROUPS } from "@/lib/categories";

export function Footer() {
  return (
    <footer className="bg-brand text-primary-foreground mt-20">
      <div className="container mx-auto px-4 py-12 grid gap-8 md:grid-cols-4">
        <div className="md:col-span-1">
          <img src={logo} alt="Velicham" className="h-14 w-auto bg-white/95 rounded p-2" />
          <p className="mt-4 text-sm text-white/80 ml leading-relaxed">
            വെളിച്ചം — ചിന്തയുടെയും സംസ്കാരത്തിന്റെയും മാസിക
          </p>
        </div>
        {NAV_GROUPS.filter((g) => g.children).map((g) => (
          <div key={g.slug}>
            <h4 className="font-bold text-base mb-3 text-white">{g.name}</h4>
            <ul className="space-y-2 text-sm text-white/80">
              {g.children!.map((c) => (
                <li key={c.slug}>
                  <Link to="/category/$slug" params={{ slug: c.slug }} className="hover:text-white">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-4 flex flex-wrap justify-between gap-3 text-sm text-white/70">
          <span>© {new Date().getFullYear()} Velicham Magazine. All rights reserved.</span>
          <div className="flex gap-4">
            <Link to="/about" className="hover:text-white">About</Link>
            <Link to="/submit" className="hover:text-white">Submit</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
