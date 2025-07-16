import { Helmet } from 'react-helmet-async';

interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
  communities?: {
    name: string;
  };
}

interface PostMetaTagsProps {
  post: Post;
}

const PostMetaTags = ({ post }: PostMetaTagsProps) => {
  const currentUrl = `${window.location.origin}/post/${post.id}`;
  const description = post.content.slice(0, 150) + (post.content.length > 150 ? '...' : '');
  const authorName = `${post.profiles?.first_name || ''} ${post.profiles?.last_name || ''}`.trim();
  const imageUrl = post.profiles?.avatar_url || `${window.location.origin}/placeholder.svg`;
  
  return (
    <Helmet>
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={post.title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:type" content="article" />
      <meta property="og:site_name" content="Mohallaa Community" />
      
      {/* Article specific tags */}
      <meta property="article:author" content={authorName} />
      <meta property="article:published_time" content={post.created_at} />
      {post.communities && (
        <meta property="article:section" content={post.communities.name} />
      )}
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={post.title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      
      {/* Standard meta tags */}
      <title>{post.title} - Mohallaa Community</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={currentUrl} />
    </Helmet>
  );
};

export default PostMetaTags;