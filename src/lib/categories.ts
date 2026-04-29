export type CategoryGroup = "article" | "fiction" | "review" | "interview";

export interface NavCategory {
  slug: string;
  name: string;
  nameMl: string;
}

export interface NavGroup {
  slug: CategoryGroup;
  name: string;
  children?: NavCategory[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    slug: "article",
    name: "Article",
    children: [
      { slug: "religion", name: "Religion", nameMl: "മതം" },
      { slug: "culture", name: "Culture", nameMl: "സംസ്കാരം" },
      { slug: "society", name: "Society", nameMl: "സമൂഹം" },
      { slug: "music", name: "Music", nameMl: "സംഗീതം" },
      { slug: "gender", name: "Gender", nameMl: "ലിംഗം" },
      { slug: "politics", name: "Politics", nameMl: "രാഷ്ട്രീയം" },
      { slug: "international", name: "International", nameMl: "അന്താരാഷ്ട്രം" },
    ],
  },
  {
    slug: "fiction",
    name: "Fiction",
    children: [
      { slug: "poetry", name: "Poetry", nameMl: "കവിത" },
      { slug: "short-story", name: "Short Story", nameMl: "ചെറുകഥ" },
      { slug: "jalakam", name: "Jalakam", nameMl: "ജാലകം" },
    ],
  },
  {
    slug: "review",
    name: "Review",
    children: [
      { slug: "book", name: "Book", nameMl: "പുസ്തകം" },
      { slug: "cinema", name: "Cinema", nameMl: "സിനിമ" },
      { slug: "documentary", name: "Documentary", nameMl: "ഡോക്യുമെന്ററി" },
    ],
  },
  {
    slug: "interview",
    name: "Interview",
  },
];

export const ALL_CATEGORY_SLUGS = NAV_GROUPS.flatMap((g) =>
  g.children ? g.children.map((c) => c.slug) : [g.slug],
);

export function getCategoryDisplay(slug: string): { name: string; nameMl: string } {
  for (const g of NAV_GROUPS) {
    if (g.slug === slug && !g.children) return { name: g.name, nameMl: g.name };
    if (g.children) {
      const c = g.children.find((ch) => ch.slug === slug);
      if (c) return { name: c.name, nameMl: c.nameMl };
    }
  }
  return { name: slug, nameMl: slug };
}
