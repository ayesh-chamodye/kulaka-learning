-- Independent-video learning platform schema for Supabase.
-- Uses Mux for video delivery and stores only Mux IDs; file URLs point to Vercel Blob.

DROP POLICY IF EXISTS video_tags_read_public ON public.video_tags;
CREATE POLICY video_tags_read_public ON public.video_tags FOR SELECT TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.videos v
    WHERE v.id = video_id
      AND (
        (v.status = 'ready' AND v.visibility = 'public')
        OR v.creator_id = (SELECT auth.uid())
      )
  )
);

DROP POLICY IF EXISTS playlist_videos_read_public_playlist ON public.playlist_videos;
CREATE POLICY playlist_videos_read_public_playlist ON public.playlist_videos FOR SELECT TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.playlists p
    WHERE p.id = playlist_id
      AND (
        p.user_id = (SELECT auth.uid())
        OR (
          p.is_public
          AND EXISTS (
            SELECT 1 FROM public.videos v
            WHERE v.id = video_id AND v.status = 'ready' AND v.visibility = 'public'
          )
        )
      )
  )
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username varchar(50) UNIQUE,
  display_name varchar(100),
  bio text,
  avatar_url text,
  role varchar(20) NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(100) NOT NULL UNIQUE,
  slug varchar(120) NOT NULL UNIQUE,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  title varchar(255) NOT NULL,
  description text,
  mux_asset_id varchar(255) UNIQUE,
  mux_playback_id varchar(255) UNIQUE,
  thumbnail_url text,
  duration integer NOT NULL DEFAULT 0 CHECK (duration >= 0),
  status varchar(30) NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'failed')),
  visibility varchar(20) NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'unlisted')),
  views integer NOT NULL DEFAULT 0 CHECK (views >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(50) NOT NULL UNIQUE,
  slug varchar(60) NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.video_tags (
  video_id uuid NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (video_id, tag_id)
);

CREATE TABLE IF NOT EXISTS public.video_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  video_id uuid NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  watched_seconds integer NOT NULL DEFAULT 0 CHECK (watched_seconds >= 0),
  completed boolean NOT NULL DEFAULT false,
  last_watched_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, video_id)
);

CREATE TABLE IF NOT EXISTS public.watch_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  video_id uuid NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  watched_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.video_likes (
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  video_id uuid NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, video_id)
);

CREATE TABLE IF NOT EXISTS public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES public.comments(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name varchar(150) NOT NULL,
  description text,
  is_public boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.playlist_videos (
  playlist_id uuid NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  video_id uuid NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0 CHECK (position >= 0),
  added_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (playlist_id, video_id)
);

CREATE TABLE IF NOT EXISTS public.video_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  name varchar(255) NOT NULL,
  file_url text NOT NULL,
  file_type varchar(100),
  file_size bigint CHECK (file_size IS NULL OR file_size >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  video_id uuid NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  amount integer NOT NULL DEFAULT 0 CHECK (amount >= 0),
  status varchar(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','failed','refunded')),
  provider varchar(20) NOT NULL DEFAULT 'mock',
  payment_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, video_id)
);

-- Indexes for foreign keys and common filters/orderings.
CREATE INDEX IF NOT EXISTS videos_creator_id_idx ON public.videos (creator_id);
CREATE INDEX IF NOT EXISTS videos_category_id_idx ON public.videos (category_id);
CREATE INDEX IF NOT EXISTS videos_status_idx ON public.videos (status);
CREATE INDEX IF NOT EXISTS videos_visibility_idx ON public.videos (visibility);
CREATE INDEX IF NOT EXISTS videos_created_at_idx ON public.videos (created_at DESC);
CREATE INDEX IF NOT EXISTS videos_views_idx ON public.videos (views DESC);
CREATE INDEX IF NOT EXISTS video_progress_video_id_idx ON public.video_progress (video_id);
CREATE INDEX IF NOT EXISTS watch_history_user_id_idx ON public.watch_history (user_id);
CREATE INDEX IF NOT EXISTS watch_history_video_id_idx ON public.watch_history (video_id);
CREATE INDEX IF NOT EXISTS watch_history_watched_at_idx ON public.watch_history (watched_at DESC);
CREATE INDEX IF NOT EXISTS video_likes_video_id_idx ON public.video_likes (video_id);
CREATE INDEX IF NOT EXISTS comments_video_id_idx ON public.comments (video_id);
CREATE INDEX IF NOT EXISTS comments_user_id_idx ON public.comments (user_id);
CREATE INDEX IF NOT EXISTS comments_parent_id_idx ON public.comments (parent_id);
CREATE INDEX IF NOT EXISTS playlists_user_id_idx ON public.playlists (user_id);
CREATE INDEX IF NOT EXISTS playlist_videos_playlist_position_idx ON public.playlist_videos (playlist_id, position);
CREATE INDEX IF NOT EXISTS playlist_videos_video_id_idx ON public.playlist_videos (video_id);
CREATE INDEX IF NOT EXISTS video_resources_video_id_idx ON public.video_resources (video_id);
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON public.orders (user_id);
CREATE INDEX IF NOT EXISTS orders_video_id_idx ON public.orders (video_id);

-- Keep updated_at current on mutable tables.
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS profiles_set_updated_at ON public.profiles;
CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS videos_set_updated_at ON public.videos;
CREATE TRIGGER videos_set_updated_at BEFORE UPDATE ON public.videos
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS comments_set_updated_at ON public.comments;
CREATE TRIGGER comments_set_updated_at BEFORE UPDATE ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS playlists_set_updated_at ON public.playlists;
CREATE TRIGGER playlists_set_updated_at BEFORE UPDATE ON public.playlists
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS orders_set_updated_at ON public.orders;
CREATE TRIGGER orders_set_updated_at BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Create a profile for every newly registered Auth user.
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$function$;
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- Admin check is scoped to the caller; SECURITY DEFINER avoids profile-RLS recursion.
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid()) AND role = 'admin'
  );
$function$;
REVOKE ALL ON FUNCTION public.is_current_user_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO anon, authenticated;

-- Enable RLS on every application table.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Remove prior app-role grants, then grant only operations used by these policies.
REVOKE ALL ON TABLE public.profiles, public.categories, public.videos, public.tags,
  public.video_tags, public.video_progress, public.watch_history, public.video_likes,
  public.comments, public.playlists, public.playlist_videos, public.video_resources,
  public.orders
FROM PUBLIC, anon, authenticated;

GRANT SELECT ON public.profiles, public.categories, public.videos, public.tags,
  public.video_tags, public.video_likes, public.comments, public.playlists,
  public.playlist_videos, public.video_resources, public.orders TO anon;
GRANT SELECT ON public.profiles, public.categories, public.videos, public.tags,
  public.video_tags, public.video_progress, public.watch_history, public.video_likes,
  public.comments, public.playlists, public.playlist_videos, public.video_resources,
  public.orders TO authenticated;
GRANT INSERT (id, username, display_name, bio, avatar_url) ON public.profiles TO authenticated;
GRANT UPDATE (username, display_name, bio, avatar_url) ON public.profiles TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.videos TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.categories, public.tags TO authenticated;
GRANT INSERT, DELETE ON public.video_tags, public.watch_history, public.video_likes TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.video_progress TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.comments, public.playlists,
  public.playlist_videos, public.video_resources TO authenticated;
GRANT INSERT, UPDATE ON public.orders TO authenticated;

-- Profiles: public information is readable; each user edits only allowed own columns.
DROP POLICY IF EXISTS profiles_public_read ON public.profiles;
CREATE POLICY profiles_public_read ON public.profiles FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS profiles_insert_self ON public.profiles;
CREATE POLICY profiles_insert_self ON public.profiles FOR INSERT TO authenticated
WITH CHECK (id = (SELECT auth.uid()));
DROP POLICY IF EXISTS profiles_update_self ON public.profiles;
CREATE POLICY profiles_update_self ON public.profiles FOR UPDATE TO authenticated
USING (id = (SELECT auth.uid())) WITH CHECK (id = (SELECT auth.uid()));

-- Categories and tags: readable by all; mutations are limited to profile admins.
DROP POLICY IF EXISTS categories_read_all ON public.categories;
CREATE POLICY categories_read_all ON public.categories FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS categories_admin_insert ON public.categories;
CREATE POLICY categories_admin_insert ON public.categories FOR INSERT TO authenticated WITH CHECK (public.is_current_user_admin());
DROP POLICY IF EXISTS categories_admin_update ON public.categories;
CREATE POLICY categories_admin_update ON public.categories FOR UPDATE TO authenticated USING (public.is_current_user_admin()) WITH CHECK (public.is_current_user_admin());
DROP POLICY IF EXISTS categories_admin_delete ON public.categories;
CREATE POLICY categories_admin_delete ON public.categories FOR DELETE TO authenticated USING (public.is_current_user_admin());
DROP POLICY IF EXISTS tags_read_all ON public.tags;
CREATE POLICY tags_read_all ON public.tags FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS tags_admin_insert ON public.tags;
CREATE POLICY tags_admin_insert ON public.tags FOR INSERT TO authenticated WITH CHECK (public.is_current_user_admin());
DROP POLICY IF EXISTS tags_admin_update ON public.tags;
CREATE POLICY tags_admin_update ON public.tags FOR UPDATE TO authenticated USING (public.is_current_user_admin()) WITH CHECK (public.is_current_user_admin());
DROP POLICY IF EXISTS tags_admin_delete ON public.tags;
CREATE POLICY tags_admin_delete ON public.tags FOR DELETE TO authenticated USING (public.is_current_user_admin());

-- Videos: only ready/public videos are public; creators retain access to their own records.
DROP POLICY IF EXISTS videos_read_public_or_creator ON public.videos;
CREATE POLICY videos_read_public_or_creator ON public.videos FOR SELECT TO anon, authenticated
USING ((status = 'ready' AND visibility = 'public') OR creator_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS videos_insert_self ON public.videos;
CREATE POLICY videos_insert_self ON public.videos FOR INSERT TO authenticated
WITH CHECK (creator_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS videos_update_creator ON public.videos;
CREATE POLICY videos_update_creator ON public.videos FOR UPDATE TO authenticated
USING (creator_id = (SELECT auth.uid())) WITH CHECK (creator_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS videos_delete_creator ON public.videos;
CREATE POLICY videos_delete_creator ON public.videos FOR DELETE TO authenticated
USING (creator_id = (SELECT auth.uid()));

-- Video tags: public mappings only for publicly readable videos; creator manages own mappings.
DROP POLICY IF EXISTS video_tags_read_public ON public.video_tags;
CREATE POLICY video_tags_read_public ON public.video_tags FOR SELECT TO anon, authenticated
USING (EXISTS (SELECT 1 FROM public.videos v WHERE v.id = video_id AND v.status = 'ready' AND v.visibility = 'public'));
DROP POLICY IF EXISTS video_tags_insert_creator ON public.video_tags;
CREATE POLICY video_tags_insert_creator ON public.video_tags FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.videos v WHERE v.id = video_id AND v.creator_id = (SELECT auth.uid())));
DROP POLICY IF EXISTS video_tags_delete_creator ON public.video_tags;
CREATE POLICY video_tags_delete_creator ON public.video_tags FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.videos v WHERE v.id = video_id AND v.creator_id = (SELECT auth.uid())));

-- Per-user progress, history, and likes.
DROP POLICY IF EXISTS video_progress_self_select ON public.video_progress;
CREATE POLICY video_progress_self_select ON public.video_progress FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS video_progress_self_insert ON public.video_progress;
CREATE POLICY video_progress_self_insert ON public.video_progress FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS video_progress_self_update ON public.video_progress;
CREATE POLICY video_progress_self_update ON public.video_progress FOR UPDATE TO authenticated USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS video_progress_self_delete ON public.video_progress;
CREATE POLICY video_progress_self_delete ON public.video_progress FOR DELETE TO authenticated USING (user_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS watch_history_self_select ON public.watch_history;
CREATE POLICY watch_history_self_select ON public.watch_history FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS watch_history_self_insert ON public.watch_history;
CREATE POLICY watch_history_self_insert ON public.watch_history FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS watch_history_self_delete ON public.watch_history;
CREATE POLICY watch_history_self_delete ON public.watch_history FOR DELETE TO authenticated USING (user_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS video_likes_read_public_video ON public.video_likes;
CREATE POLICY video_likes_read_public_video ON public.video_likes FOR SELECT TO anon, authenticated
USING (EXISTS (SELECT 1 FROM public.videos v WHERE v.id = video_id AND v.status = 'ready' AND v.visibility = 'public'));
DROP POLICY IF EXISTS video_likes_insert_self ON public.video_likes;
CREATE POLICY video_likes_insert_self ON public.video_likes FOR INSERT TO authenticated
WITH CHECK (user_id = (SELECT auth.uid()) AND EXISTS (SELECT 1 FROM public.videos v WHERE v.id = video_id AND v.status = 'ready' AND v.visibility = 'public'));
DROP POLICY IF EXISTS video_likes_delete_self ON public.video_likes;
CREATE POLICY video_likes_delete_self ON public.video_likes FOR DELETE TO authenticated USING (user_id = (SELECT auth.uid()));

-- Comments: public comments on public videos; authors can still access their own comments.
DROP POLICY IF EXISTS comments_read_public_or_author ON public.comments;
CREATE POLICY comments_read_public_or_author ON public.comments FOR SELECT TO anon, authenticated
USING (
  user_id = (SELECT auth.uid()) OR EXISTS (
    SELECT 1 FROM public.videos v WHERE v.id = video_id AND v.status = 'ready' AND v.visibility = 'public'
  )
);
DROP POLICY IF EXISTS comments_insert_self_public_video ON public.comments;
CREATE POLICY comments_insert_self_public_video ON public.comments FOR INSERT TO authenticated
WITH CHECK (
  user_id = (SELECT auth.uid())
  AND EXISTS (SELECT 1 FROM public.videos v WHERE v.id = video_id AND v.status = 'ready' AND v.visibility = 'public')
  AND (parent_id IS NULL OR EXISTS (SELECT 1 FROM public.comments p WHERE p.id = parent_id AND p.video_id = video_id))
);
DROP POLICY IF EXISTS comments_update_self ON public.comments;
CREATE POLICY comments_update_self ON public.comments FOR UPDATE TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (
  user_id = (SELECT auth.uid())
  AND EXISTS (SELECT 1 FROM public.videos v WHERE v.id = video_id AND v.status = 'ready' AND v.visibility = 'public')
  AND (parent_id IS NULL OR EXISTS (SELECT 1 FROM public.comments p WHERE p.id = parent_id AND p.video_id = video_id))
);
DROP POLICY IF EXISTS comments_delete_self ON public.comments;
CREATE POLICY comments_delete_self ON public.comments FOR DELETE TO authenticated USING (user_id = (SELECT auth.uid()));

-- Playlists and ordered playlist items.
DROP POLICY IF EXISTS playlists_read_owner_or_public ON public.playlists;
CREATE POLICY playlists_read_owner_or_public ON public.playlists FOR SELECT TO anon, authenticated USING (is_public OR user_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS playlists_insert_self ON public.playlists;
CREATE POLICY playlists_insert_self ON public.playlists FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS playlists_update_self ON public.playlists;
CREATE POLICY playlists_update_self ON public.playlists FOR UPDATE TO authenticated USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS playlists_delete_self ON public.playlists;
CREATE POLICY playlists_delete_self ON public.playlists FOR DELETE TO authenticated USING (user_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS playlist_videos_read_public_playlist ON public.playlist_videos;
CREATE POLICY playlist_videos_read_public_playlist ON public.playlist_videos FOR SELECT TO anon, authenticated
USING (
  EXISTS (SELECT 1 FROM public.playlists p WHERE p.id = playlist_id AND (p.is_public OR p.user_id = (SELECT auth.uid())))
  AND (EXISTS (SELECT 1 FROM public.videos v WHERE v.id = video_id AND v.status = 'ready' AND v.visibility = 'public')
       OR EXISTS (SELECT 1 FROM public.videos v WHERE v.id = video_id AND v.creator_id = (SELECT auth.uid())))
);
DROP POLICY IF EXISTS playlist_videos_insert_owner ON public.playlist_videos;
CREATE POLICY playlist_videos_insert_owner ON public.playlist_videos FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.playlists p WHERE p.id = playlist_id AND p.user_id = (SELECT auth.uid())));
DROP POLICY IF EXISTS playlist_videos_update_owner ON public.playlist_videos;
CREATE POLICY playlist_videos_update_owner ON public.playlist_videos FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.playlists p WHERE p.id = playlist_id AND p.user_id = (SELECT auth.uid())))
WITH CHECK (EXISTS (SELECT 1 FROM public.playlists p WHERE p.id = playlist_id AND p.user_id = (SELECT auth.uid())));
DROP POLICY IF EXISTS playlist_videos_delete_owner ON public.playlist_videos;
CREATE POLICY playlist_videos_delete_owner ON public.playlist_videos FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.playlists p WHERE p.id = playlist_id AND p.user_id = (SELECT auth.uid())));

-- Resources follow their video's visibility; only the creator may mutate them.
DROP POLICY IF EXISTS video_resources_read_public_or_creator ON public.video_resources;
CREATE POLICY video_resources_read_public_or_creator ON public.video_resources FOR SELECT TO anon, authenticated
USING (EXISTS (SELECT 1 FROM public.videos v WHERE v.id = video_id AND ((v.status = 'ready' AND v.visibility = 'public') OR v.creator_id = (SELECT auth.uid()))));
DROP POLICY IF EXISTS video_resources_insert_creator ON public.video_resources;
CREATE POLICY video_resources_insert_creator ON public.video_resources FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.videos v WHERE v.id = video_id AND v.creator_id = (SELECT auth.uid())));
DROP POLICY IF EXISTS video_resources_update_creator ON public.video_resources;
CREATE POLICY video_resources_update_creator ON public.video_resources FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.videos v WHERE v.id = video_id AND v.creator_id = (SELECT auth.uid())))
WITH CHECK (EXISTS (SELECT 1 FROM public.videos v WHERE v.id = video_id AND v.creator_id = (SELECT auth.uid())));
DROP POLICY IF EXISTS video_resources_delete_creator ON public.video_resources;
CREATE POLICY video_resources_delete_creator ON public.video_resources FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.videos v WHERE v.id = video_id AND v.creator_id = (SELECT auth.uid())));

-- Orders: users see their own orders; creators can see orders for their videos.
DROP POLICY IF EXISTS orders_read_self ON public.orders;
CREATE POLICY orders_read_self ON public.orders FOR SELECT TO authenticated
USING (user_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS orders_read_creator ON public.orders;
CREATE POLICY orders_read_creator ON public.orders FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.videos v WHERE v.id = orders.video_id AND v.creator_id = (SELECT auth.uid())));
DROP POLICY IF EXISTS orders_insert_self ON public.orders;
CREATE POLICY orders_insert_self ON public.orders FOR INSERT TO authenticated
WITH CHECK (user_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS orders_update_self ON public.orders;
CREATE POLICY orders_update_self ON public.orders FOR UPDATE TO authenticated
USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));
