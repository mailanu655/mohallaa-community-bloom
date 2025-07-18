-- Drop and recreate the personalized feed function with correct return types
DROP FUNCTION IF EXISTS public.calculate_personalized_feed(uuid, integer, integer);

CREATE OR REPLACE FUNCTION public.calculate_personalized_feed(target_user_id uuid, limit_count integer DEFAULT 20, offset_count integer DEFAULT 0)
 RETURNS TABLE(post_id uuid, final_score double precision, engagement_score double precision, relevance_score double precision, recency_score double precision)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  user_interests TEXT[];
  user_communities UUID[];
  interaction_weights JSONB;
BEGIN
  -- Get user interests and communities
  SELECT COALESCE(interests, '{}'::text[]), COALESCE(ARRAY[community_id], '{}'::uuid[])
  INTO user_interests, user_communities
  FROM public.profiles
  WHERE id = target_user_id;

  -- Get user interaction weights
  SELECT COALESCE(up.interaction_weights, '{"view": 1, "like": 5, "comment": 10, "share": 15, "bookmark": 8}'::jsonb)
  INTO interaction_weights
  FROM public.user_preferences up
  WHERE up.user_id = target_user_id;

  -- Calculate and return personalized feed
  RETURN QUERY
  WITH user_interactions_agg AS (
    SELECT 
      ui.post_id,
      SUM(
        CASE ui.interaction_type
          WHEN 'view' THEN (interaction_weights->>'view')::double precision
          WHEN 'like' THEN (interaction_weights->>'like')::double precision
          WHEN 'comment' THEN (interaction_weights->>'comment')::double precision
          WHEN 'share' THEN (interaction_weights->>'share')::double precision
          WHEN 'bookmark' THEN (interaction_weights->>'bookmark')::double precision
          ELSE 1
        END
      ) as engagement_score
    FROM public.user_interactions ui
    WHERE ui.user_id = target_user_id
    GROUP BY ui.post_id
  ),
  post_scores AS (
    SELECT 
      p.id as post_id,
      
      -- Engagement score (user's previous interactions with similar content)
      COALESCE(uia.engagement_score, 0) as engagement_score,
      
      -- Relevance score (based on interests and tags)
      CASE 
        WHEN user_interests && p.tags THEN 50.0
        WHEN p.community_id = ANY(user_communities) THEN 30.0
        ELSE 10.0
      END as relevance_score,
      
      -- Recency score (newer posts get higher scores)
      GREATEST(0, 100 - EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600) as recency_score,
      
      -- Community weight (posts from user's communities)
      CASE 
        WHEN p.community_id = ANY(user_communities) THEN 2.0
        ELSE 1.0
      END as community_weight
      
    FROM public.posts p
    LEFT JOIN user_interactions_agg uia ON p.id = uia.post_id
    WHERE p.created_at > NOW() - INTERVAL '7 days'
    AND NOT EXISTS (
      SELECT 1 FROM public.user_interactions ui 
      WHERE ui.user_id = target_user_id 
      AND ui.post_id = p.id 
      AND ui.interaction_type = 'view'
      AND ui.created_at > NOW() - INTERVAL '1 day'
    )
  )
  SELECT 
    ps.post_id,
    ((ps.engagement_score * 0.3 + ps.relevance_score * 0.4 + ps.recency_score * 0.3) * ps.community_weight) as final_score,
    ps.engagement_score,
    ps.relevance_score,
    ps.recency_score
  FROM post_scores ps
  ORDER BY final_score DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$function$;