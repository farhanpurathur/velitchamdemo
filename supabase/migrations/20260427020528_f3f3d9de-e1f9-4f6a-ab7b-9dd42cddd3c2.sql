-- ROLES
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_editor(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','editor'))
$$;

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- CATEGORIES
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_ml TEXT,
  parent_group TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

INSERT INTO public.categories (slug, name, name_ml, parent_group, display_order) VALUES
('religion','Religion','മതം','article',1),
('culture','Culture','സംസ്കാരം','article',2),
('society','Society','സമൂഹം','article',3),
('music','Music','സംഗീതം','article',4),
('gender','Gender','ലിംഗം','article',5),
('politics','Politics','രാഷ്ട്രീയം','article',6),
('international','International','അന്താരാഷ്ട്രം','article',7),
('poetry','Poetry','കവിത','fiction',1),
('short-story','Short Story','ചെറുകഥ','fiction',2),
('jalakam','Jalakam','ജാലകം','fiction',3),
('book','Book','പുസ്തകം','review',1),
('cinema','Cinema','സിനിമ','review',2),
('documentary','Documentary','ഡോക്യുമെന്ററി','review',3),
('interview','Interview','അഭിമുഖം','interview',1);

-- POSTS
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL DEFAULT '',
  cover_image TEXT,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  view_count INT NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_posts_status_published ON public.posts(status, published_at DESC);
CREATE INDEX idx_posts_category ON public.posts(category_id);
CREATE INDEX idx_posts_views ON public.posts(view_count DESC);

-- SLIDES
CREATE TABLE public.slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.slides ENABLE ROW LEVEL SECURITY;

-- ANNOUNCEMENTS
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  link_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- POST VIEWS (analytics)
CREATE TABLE public.post_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  visitor_id TEXT,
  referrer TEXT,
  user_agent TEXT,
  time_on_page_seconds INT,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.post_views ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_post_views_post ON public.post_views(post_id);
CREATE INDEX idx_post_views_date ON public.post_views(viewed_at DESC);

-- SUBMISSIONS (submit article from public)
CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  category_slug TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- TRIGGERS: updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER trg_posts_updated BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email,'@',1)));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Increment view count
CREATE OR REPLACE FUNCTION public.increment_post_view(_post_id UUID, _visitor_id TEXT, _referrer TEXT, _user_agent TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.post_views (post_id, visitor_id, referrer, user_agent)
  VALUES (_post_id, _visitor_id, _referrer, _user_agent);
  UPDATE public.posts SET view_count = view_count + 1 WHERE id = _post_id;
END $$;

-- ============ RLS POLICIES ============

-- profiles
CREATE POLICY "profiles select own or admin" ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "profiles update own" ON public.profiles FOR UPDATE
  USING (auth.uid() = id);
CREATE POLICY "profiles public read display" ON public.profiles FOR SELECT
  USING (true);

-- user_roles
CREATE POLICY "roles select self" ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "roles admin manage" ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- categories: public read, admin manage
CREATE POLICY "categories read all" ON public.categories FOR SELECT USING (true);
CREATE POLICY "categories admin manage" ON public.categories FOR ALL
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- posts: public can read published; admin/editor manage
CREATE POLICY "posts read published" ON public.posts FOR SELECT
  USING (status = 'published' OR public.is_admin_or_editor(auth.uid()));
CREATE POLICY "posts admin/editor insert" ON public.posts FOR INSERT
  WITH CHECK (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "posts admin/editor update" ON public.posts FOR UPDATE
  USING (public.is_admin_or_editor(auth.uid()))
  WITH CHECK (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "posts admin/editor delete" ON public.posts FOR DELETE
  USING (public.is_admin_or_editor(auth.uid()));

-- slides
CREATE POLICY "slides read all" ON public.slides FOR SELECT USING (true);
CREATE POLICY "slides admin/editor manage" ON public.slides FOR ALL
  USING (public.is_admin_or_editor(auth.uid()))
  WITH CHECK (public.is_admin_or_editor(auth.uid()));

-- announcements
CREATE POLICY "announcements read active" ON public.announcements FOR SELECT
  USING (is_active = true OR public.is_admin_or_editor(auth.uid()));
CREATE POLICY "announcements admin/editor manage" ON public.announcements FOR ALL
  USING (public.is_admin_or_editor(auth.uid()))
  WITH CHECK (public.is_admin_or_editor(auth.uid()));

-- post_views: anyone can insert, admin/editor read
CREATE POLICY "post_views public insert" ON public.post_views FOR INSERT
  WITH CHECK (true);
CREATE POLICY "post_views admin/editor read" ON public.post_views FOR SELECT
  USING (public.is_admin_or_editor(auth.uid()));

-- submissions: anyone insert, admin/editor read
CREATE POLICY "submissions public insert" ON public.submissions FOR INSERT
  WITH CHECK (true);
CREATE POLICY "submissions admin/editor read" ON public.submissions FOR SELECT
  USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "submissions admin/editor update" ON public.submissions FOR UPDATE
  USING (public.is_admin_or_editor(auth.uid()))
  WITH CHECK (public.is_admin_or_editor(auth.uid()));

-- STORAGE bucket for cover images
INSERT INTO storage.buckets (id, name, public) VALUES ('post-images','post-images', true);

CREATE POLICY "post-images public read" ON storage.objects FOR SELECT
  USING (bucket_id = 'post-images');
CREATE POLICY "post-images admin/editor upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'post-images' AND public.is_admin_or_editor(auth.uid()));
CREATE POLICY "post-images admin/editor update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'post-images' AND public.is_admin_or_editor(auth.uid()));
CREATE POLICY "post-images admin/editor delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'post-images' AND public.is_admin_or_editor(auth.uid()));