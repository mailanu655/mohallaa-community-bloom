-- Enable real-time for posts table
ALTER TABLE public.posts REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.posts;

-- Create notification triggers for user interactions
CREATE OR REPLACE FUNCTION notify_user_interaction()
RETURNS TRIGGER AS $$
BEGIN
  -- Create notification for post author when someone likes their post
  IF TG_OP = 'INSERT' AND NEW.vote_type = 'upvote' THEN
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      related_type,
      related_id
    )
    SELECT 
      posts.author_id,
      'like',
      'New Like',
      profiles.first_name || ' ' || profiles.last_name || ' liked your post',
      'post',
      NEW.post_id
    FROM public.posts
    JOIN public.profiles ON profiles.id = NEW.user_id
    WHERE posts.id = NEW.post_id
    AND posts.author_id != NEW.user_id; -- Don't notify self
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for post votes
CREATE TRIGGER notify_on_post_vote
  AFTER INSERT ON public.post_votes
  FOR EACH ROW
  EXECUTE FUNCTION notify_user_interaction();

-- Create notification trigger for comments
CREATE OR REPLACE FUNCTION notify_comment_interaction()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Notify post author about new comment
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      related_type,
      related_id
    )
    SELECT 
      posts.author_id,
      'comment',
      'New Comment',
      profiles.first_name || ' ' || profiles.last_name || ' commented on your post',
      'post',
      NEW.post_id
    FROM public.posts
    JOIN public.profiles ON profiles.id = NEW.author_id
    WHERE posts.id = NEW.post_id
    AND posts.author_id != NEW.author_id; -- Don't notify self
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for comments
CREATE TRIGGER notify_on_comment
  AFTER INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_comment_interaction();

-- Create notification trigger for bookmarks
CREATE OR REPLACE FUNCTION notify_bookmark_interaction()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Notify post author about new bookmark
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      related_type,
      related_id
    )
    SELECT 
      posts.author_id,
      'bookmark',
      'Post Bookmarked',
      profiles.first_name || ' ' || profiles.last_name || ' bookmarked your post',
      'post',
      NEW.post_id
    FROM public.posts
    JOIN public.profiles ON profiles.id = NEW.user_id
    WHERE posts.id = NEW.post_id
    AND posts.author_id != NEW.user_id; -- Don't notify self
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for bookmarks
CREATE TRIGGER notify_on_bookmark
  AFTER INSERT ON public.post_bookmarks
  FOR EACH ROW
  EXECUTE FUNCTION notify_bookmark_interaction();

-- Create function to clean up old notifications (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM public.notifications
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Create notification trigger for new posts from followed users (if following system exists)
CREATE OR REPLACE FUNCTION notify_new_post()
RETURNS TRIGGER AS $$
BEGIN
  -- This would create notifications for followers when a user posts
  -- Currently commented out as there's no following system in place
  -- Can be uncommented when user following is implemented
  /*
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    related_type,
    related_id
  )
  SELECT 
    followers.follower_id,
    'new_post',
    'New Post',
    profiles.first_name || ' ' || profiles.last_name || ' shared a new post',
    'post',
    NEW.id
  FROM public.user_followers followers
  JOIN public.profiles ON profiles.id = NEW.author_id
  WHERE followers.followed_id = NEW.author_id;
  */
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new posts (currently disabled)
-- CREATE TRIGGER notify_on_new_post
--   AFTER INSERT ON public.posts
--   FOR EACH ROW
--   EXECUTE FUNCTION notify_new_post();