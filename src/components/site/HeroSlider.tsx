import { useEffect, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { PostCardData } from "./PostCard";

const PLACEHOLDER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1600 900'><rect fill='%2306305a' width='1600' height='900'/><text x='50%25' y='50%25' fill='%23ffffff' font-family='serif' font-size='80' text-anchor='middle' dy='.3em'>വെളിച്ചം</text></svg>";

export function HeroSlider({ slides }: { slides: PostCardData[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 6000, stopOnInteraction: false })]);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (!slides.length) {
    return (
      <div className="relative h-[60vh] md:h-[70vh] bg-brand flex items-center justify-center">
        <p className="text-white ml text-xl">സ്ലൈഡുകൾ ഉടൻ പ്രത്യക്ഷപ്പെടും</p>
      </div>
    );
  }

  return (
    <section className="relative">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {slides.map((s, idx) => (
            <div key={s.id} className="relative flex-[0_0_100%] h-[55vh] md:h-[70vh] min-h-[420px]">
              <div className="absolute inset-0 overflow-hidden">
                <img
                  key={`${s.id}-${idx === selected}`}
                  src={s.cover_image || PLACEHOLDER}
                  alt={s.title}
                  className={`w-full h-full object-cover ${idx === selected ? "kenburns" : ""}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
              </div>
              <div className="relative h-full container mx-auto px-4 flex items-end pb-12 md:pb-20">
                <div className="max-w-3xl text-white">
                  {s.categories && (
                    <span className="inline-block bg-brand-light text-white text-xs px-3 py-1 rounded-sm uppercase tracking-wider font-semibold mb-4">
                      {s.categories.name}
                    </span>
                  )}
                  <Link to="/post/$slug" params={{ slug: s.slug }}>
                    <h1 className="ml text-2xl md:text-4xl lg:text-5xl font-bold leading-tight hover:underline">
                      {s.title}
                    </h1>
                  </Link>
                  {s.excerpt && (
                    <p className="ml mt-4 text-base md:text-lg text-white/90 line-clamp-3 max-w-2xl">
                      {s.excerpt}
                    </p>
                  )}
                  {s.author_name && (
                    <p className="mt-4 text-sm text-white/70 ml">— {s.author_name}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={scrollPrev}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-brand text-white p-2 md:p-3 rounded-full backdrop-blur transition-colors"
      >
        <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
      </button>
      <button
        onClick={scrollNext}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-brand text-white p-2 md:p-3 rounded-full backdrop-blur transition-colors"
      >
        <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
      </button>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${i === selected ? "bg-white w-8" : "bg-white/50 w-2"}`}
          />
        ))}
      </div>
    </section>
  );
}
