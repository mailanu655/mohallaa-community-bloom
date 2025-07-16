-- Create user engagement tracking table
CREATE TABLE public.user_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('view', 'like', 'comment', 'share', 'bookmark', 'click')),
  duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(user_id, post_id, interaction_type)
);

-- Create user preferences table
CREATE TABLE public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  preferred_post_types TEXT[] DEFAULT '{}'::text[],
  preferred_categories TEXT[] DEFAULT '{}'::text[],
  interaction_weights JSONB DEFAULT '{"view": 1, "like": 5, "comment": 10, "share": 15, "bookmark": 8}'::jsonb,
  personalization_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user engagement scores table
CREATE TABLE public.user_engagement_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  engagement_score NUMERIC(10,2) DEFAULT 0,
  relevance_score NUMERIC(10,2) DEFAULT 0,
  recency_score NUMERIC(10,2) DEFAULT 0,
  community_weight NUMERIC(10,2) DEFAULT 1,
  final_score NUMERIC(10,2) DEFAULT 0,
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Enable RLS
ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_engagement_scores ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_interactions
CREATE POLICY "Users can view their own interactions" ON public.user_interactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own interactions" ON public.user_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interactions" ON public.user_interactions
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for user_preferences
CREATE POLICY "Users can manage their own preferences" ON public.user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for user_engagement_scores
CREATE POLICY "Users can view their own engagement scores" ON public.user_engagement_scores
  FOR SELECT USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_user_interactions_user_id ON public.user_interactions(user_id);
CREATE INDEX idx_user_interactions_post_id ON public.user_interactions(post_id);
CREATE INDEX idx_user_interactions_type ON public.user_interactions(interaction_type);
CREATE INDEX idx_user_interactions_created_at ON public.user_interactions(created_at);
CREATE INDEX idx_user_engagement_scores_user_id ON public.user_engagement_scores(user_id);
CREATE INDEX idx_user_engagement_scores_final_score ON public.user_engagement_scores(final_score DESC);

-- Create trigger for updating user_preferences updated_at
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to calculate personalized feed
CREATE OR REPLACE FUNCTION public.calculate_personalized_feed(
  target_user_id UUID,
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  post_id UUID,
  final_score NUMERIC,
  engagement_score NUMERIC,
  relevance_score NUMERIC,
  recency_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
          WHEN 'view' THEN (interaction_weights->>'view')::numeric
          WHEN 'like' THEN (interaction_weights->>'like')::numeric
          WHEN 'comment' THEN (interaction_weights->>'comment')::numeric
          WHEN 'share' THEN (interaction_weights->>'share')::numeric
          WHEN 'bookmark' THEN (interaction_weights->>'bookmark')::numeric
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
        WHEN user_interests && p.tags THEN 50
        WHEN p.community_id = ANY(user_communities) THEN 30
        ELSE 10
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
$$;