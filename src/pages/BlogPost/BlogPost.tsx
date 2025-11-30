// src/pages/BlogPost/BlogPost.tsx
import React from "react";
import { useParams, Link } from "react-router-dom";
import { blogPosts } from "../../data/blogPosts";
import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";
import { ArrowLeft } from "lucide-react";

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) return <p className="text-white text-center mt-20">Post not found.</p>;

  // External redirect handler
  if (post.url && !post.content) {
    window.location.href = post.url;
    return null;
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#0A0F1E] via-[#0D1117] to-black text-white overflow-hidden">
      {/* Background holograms */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        transition={{ duration: 2 }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <h1 className="text-[180px] md:text-[280px] font-black tracking-widest text-blue-500/20 select-none">
          BLOG
        </h1>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 px-6 py-16 max-w-5xl mx-auto">
        {/* Back button */}
        <Link
          to="/blog"
          className="inline-flex items-center text-gray-400 hover:text-blue-400 transition mb-8"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Blog
        </Link>

        {/* Title + meta */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-300 bg-clip-text text-transparent">
            {post.title}
          </h1>
          <p className="text-gray-400 mb-12">{new Date(post.date).toLocaleDateString()}</p>
        </motion.div>

        {/* Content section */}
        <Tilt tiltMaxAngleX={3} tiltMaxAngleY={3} perspective={1200} transitionSpeed={2000}>
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5 }}
            className="backdrop-blur-lg bg-white/5 border border-white/10 p-8 rounded-2xl shadow-lg shadow-blue-500/10 prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content ?? "" }}

          />
        </Tilt>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mt-16 p-10 rounded-2xl bg-gradient-to-r from-blue-600/20 to-cyan-500/20 border border-blue-500/30 text-center"
        >
          <h2 className="text-3xl font-bold mb-4">Want More Insights Like This?</h2>
          <p className="text-gray-300 mb-6">
            Stay ahead with cutting-edge strategies, AI-driven tools, and the latest from NyxDev’s futuristic innovations.
          </p>
          <Link
            to="/subscribe"
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-black font-semibold hover:opacity-90 transition"
          >
            Subscribe to NyxDev Future Feed
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default BlogPost;
