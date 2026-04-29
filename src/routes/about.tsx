import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About Us — Velicham" },
      { name: "description", content: "About Velicham — a magazine of thought, culture, and society." },
      { property: "og:title", content: "About Us — Velicham" },
      { property: "og:description", content: "About Velicham — a magazine of thought, culture, and society." },
    ],
  }),
});

function AboutPage() {
  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="ml text-4xl md:text-5xl font-bold text-brand mb-2">വെളിച്ചം</h1>
        <p className="text-sm uppercase tracking-widest text-muted-foreground mb-8">About Velicham</p>
        <div className="prose-velicham">
          <p>
            വെളിച്ചം — ചിന്തയുടെയും സംസ്കാരത്തിന്റെയും സമൂഹത്തിന്റെയും
            സംവാദമാധ്യമം. മതം, സംസ്കാരം, സമൂഹം, സംഗീതം, ലിംഗം, രാഷ്ട്രീയം,
            അന്താരാഷ്ട്രം എന്നീ വിഷയങ്ങളിൽ ലേഖനങ്ങൾ പ്രസിദ്ധീകരിക്കുന്നു.
          </p>
          <p>
            Velicham is a Malayalam magazine dedicated to exploring contemporary
            thought across religion, culture, society, music, gender, politics
            and international affairs. We also publish poetry, short stories,
            book and film reviews, and in-depth interviews with thinkers and
            artists.
          </p>
          <h2>Editorial</h2>
          <p>
            Submissions, comments, and correspondence are welcome through our
            Submit Article page.
          </p>
        </div>
      </div>
    </SiteLayout>
  );
}
