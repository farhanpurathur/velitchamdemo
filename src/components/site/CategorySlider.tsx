import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PostCard, type PostCardData, CategoryHeading } from "./PostCard";

export function CategorySlider({ slug, posts }: { slug: string; posts: PostCardData[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start", slidesToScroll: 1 });
  const [canScroll, setCanScroll] = useState({ prev: false, next: true });

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setCanScroll({ prev: emblaApi.canScrollPrev(), next: emblaApi.canScrollNext() });
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    onSelect();
  }, [emblaApi]);

  const prev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const next = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (!posts.length) return null;

  return (
    <section className="container mx-auto px-4 py-8">
      <CategoryHeading slug={slug} />
      <div className="relative">
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex gap-4 md:gap-6">
            {posts.map((p) => (
              <div
                key={p.id}
                className="flex-[0_0_85%] sm:flex-[0_0_48%] lg:flex-[0_0_32%]"
              >
                <PostCard post={p} />
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={prev}
          aria-label="Previous"
          className="absolute -left-2 md:-left-4 top-1/2 -translate-y-1/2 bg-card border border-border shadow-md hover:bg-brand hover:text-primary-foreground p-2 rounded-full transition-colors z-10"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={next}
          aria-label="Next"
          className="absolute -right-2 md:-right-4 top-1/2 -translate-y-1/2 bg-card border border-border shadow-md hover:bg-brand hover:text-primary-foreground p-2 rounded-full transition-colors z-10"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
