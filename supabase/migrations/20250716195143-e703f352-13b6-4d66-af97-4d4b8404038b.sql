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