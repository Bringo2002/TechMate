// src/pages/BlogPost/BlogPost.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { blogPosts } from '../../data/blogPosts';

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) return <p className="text-white text-center mt-20">Post not found.</p>;

  // If external post, redirect to URL
  if (post.url && !post.content) {
    window.location.href = post.url;
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0D1117] text-white px-6 py-20">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">{post.title}</h1>
        <p className="text-gray-400 mb-6">{new Date(post.date).toLocaleDateString()}</p>
        <div className="prose prose-invert" dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>
    </div>
  );
};

export default BlogPost;
