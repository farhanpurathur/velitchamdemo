-- Create authors table
CREATE TABLE public.authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  bio TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Authors are viewable by everyone" ON public.authors FOR SELECT USING (true);
CREATE POLICY "Admins/Editors can manage authors" ON public.authors FOR ALL
  USING (public.is_admin_or_editor(auth.uid()))
  WITH CHECK (public.is_admin_or_editor(auth.uid()));

-- Add author_profile_id to posts
ALTER TABLE public.posts ADD COLUMN author_profile_id UUID REFERENCES public.authors(id) ON DELETE SET NULL;

-- Index for performance
CREATE INDEX idx_posts_author_profile ON public.posts(author_profile_id);
