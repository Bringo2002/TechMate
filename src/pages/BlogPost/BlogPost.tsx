import React from 'react';
import { Link } from 'react-router-dom';
import { blogPosts } from '../../data/blogPosts';
const Blog: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0D1117] text-white px-6 py-20">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">Our Blog</h1>
        <p className="text-gray-400 mb-12 text-center text-lg">
          Insights, tutorials, and updates from the frontier of tech innovation.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {blogPosts.map((post) => {
            const isExternal = post.content.trim() === '';

            return (
              <div
                key={post.slug}
                className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
              >
                <h2 className="text-2xl font-semibold mb-2 text-white">{post.title}</h2>
                <p className="text-sm text-gray-500 mb-3">{new Date(post.date).toLocaleDateString()}</p>
                <p className="text-slate-300 mb-4 line-clamp-3">{post.excerpt}</p>

                {isExternal ? (
                  <a
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-blue-500 font-medium hover:underline hover:text-blue-400 transition"
                  >
                    Read more →
                  </a>
                ) : (
                  <Link
                    to={`/blog/${post.slug}`}
                    className="inline-block text-blue-500 font-medium hover:underline hover:text-blue-400 transition"
                  >
                    Read more →
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Blog;
