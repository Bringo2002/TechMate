// src/pages/Blog/Blog.tsx
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Tilt from 'react-parallax-tilt';
import { motion } from 'framer-motion';
import Header from '../../components/Header/Header';
import { blogPosts, BlogPostType } from '../../data/blogPosts';

/**
 * Cinematic TechMate Blog
 * - Nebula canvas backdrop
 * - Hero + featured post
 * - Search + tag filters
 * - Grid of tilt/glass cards
 *
 * Note: Keep this file in sync with src/data/blogPosts.ts.
 */

/* ----------------------------- Nebula Canvas ---------------------------- */
const NebulaCanvas: React.FC = () => {
  return (
    <canvas
      id="nebula-canvas"
      className="pointer-events-none absolute inset-0 -z-30"
      ref={(canvas) => {
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let raf = 0;
        const DPR = Math.max(1, window.devicePixelRatio || 1);

        const resize = () => {
          const rect = canvas.getBoundingClientRect();
          canvas.width = Math.floor(rect.width * DPR);
          canvas.height = Math.floor(rect.height * DPR);
        };

        resize();

        // create smooth moving soft blobs (nebula)
        const blobs = Array.from({ length: 6 }).map(() => ({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * Math.max(canvas.width, canvas.height) * 0.18,
          vx: (Math.random() - 0.5) * 0.12,
          vy: (Math.random() - 0.5) * 0.06,
          hue: Math.random() * 360,
          alpha: 0.08 + Math.random() * 0.08,
        }));

        const draw = () => {
          if (!ctx) return;
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          for (const b of blobs) {
            b.x += b.vx;
            b.y += b.vy;

            // wrap
            if (b.x < -b.r) b.x = canvas.width + b.r;
            if (b.x > canvas.width + b.r) b.x = -b.r;
            if (b.y < -b.r) b.y = canvas.height + b.r;
            if (b.y > canvas.height + b.r) b.y = -b.r;

            const grd = ctx.createRadialGradient(
              b.x,
              b.y,
              Math.max(10, b.r * 0.05),
              b.x,
              b.y,
              b.r
            );
            grd.addColorStop(0, `hsla(${b.hue}, 90%, 60%, ${b.alpha})`);
            grd.addColorStop(
              0.35,
              `hsla(${(b.hue + 40) % 360}, 80%, 45%, ${b.alpha * 0.6})`
            );
            grd.addColorStop(1, `rgba(5,6,15,0)`);
            ctx.fillStyle = grd;
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            ctx.fill();
          }

          raf = requestAnimationFrame(draw);
        };

        raf = requestAnimationFrame(draw);
        window.addEventListener('resize', resize);
        return () => {
          cancelAnimationFrame(raf);
          window.removeEventListener('resize', resize);
        };
      }}
    />
  );
};

/* ----------------------------- UI Subcomponents ----------------------------- */
const TagPill: React.FC<{
  tag: string;
  active?: boolean;
  onClick?: () => void;
}> = ({ tag, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active ? "true" : "false"}
    className={`px-3 py-1 rounded-full text-xs transition
      ${
        active
          ? 'bg-cyan-500/20 border border-cyan-500 text-cyan-200'
          : 'bg-transparent border border-slate-700 text-slate-300'
      }
    `}
  >
    {tag}
  </button>
);

const FeaturedCard: React.FC<{ post: BlogPostType }> = ({ post }) => {
  return (
    <Tilt
      glareEnable={true}
      glareMaxOpacity={0.12}
      tiltMaxAngleX={8}
      tiltMaxAngleY={8}
      className="w-full"
    >
      <motion.article
        layoutId={`card-${post.slug}`}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 160, damping: 16 }}
        className="relative group rounded-3xl p-8 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] border border-slate-700/40 shadow-2xl overflow-hidden"
      >
        <div className="absolute -inset-1 opacity-0 group-hover:opacity-100 transition pointer-events-none blur-3xl bg-gradient-to-br from-cyan-500/8 to-purple-500/8" />
        <div className="flex items-start gap-6">
          <div className="flex-1">
            <h3 className="text-3xl font-extrabold text-white leading-tight">
              {post.title}
            </h3>
            <p className="mt-3 text-slate-300 leading-relaxed">{post.excerpt}</p>

            <div className="mt-6 flex items-center gap-3">
              <Link
                to={`/blog/${post.slug}`}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-sm font-semibold shadow"
              >
                Open Transmission →
              </Link>
              <div className="text-xs text-slate-400">{post.author}</div>
            </div>
          </div>

          <div className="w-36 h-36 rounded-xl bg-gradient-to-tr from-cyan-700/10 to-purple-700/10 flex items-center justify-center text-slate-300">
            <svg
              className="w-12 h-12"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <path
                d="M12 2l3 6 6 .5-4.5 4 1 6L12 16l-5.5 2.5 1-6L3 8.5 9 8 12 2z"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </motion.article>
    </Tilt>
  );
};

const Card: React.FC<{ post: BlogPostType }> = ({ post }) => {
  return (
    <Tilt
      tiltMaxAngleX={7}
      tiltMaxAngleY={7}
      glareEnable={false}
      className="w-full"
    >
      <motion.article
        layoutId={`card-${post.slug}`}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 220, damping: 18 }}
        className="relative group rounded-2xl p-6 bg-[linear-gradient(135deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] border border-slate-700/40 shadow-lg overflow-hidden"
      >
        <div className="absolute -inset-1 opacity-0 group-hover:opacity-100 transition pointer-events-none blur-2xl bg-gradient-to-br from-cyan-500/6 to-purple-500/6" />
        <h3 className="text-lg font-semibold text-white">{post.title}</h3>
        <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString()}
          </time>
          <span aria-hidden>•</span>
          <span>{post.author ?? 'TechMate'}</span>
        </div>

        <p className="mt-4 text-slate-300 line-clamp-3">{post.excerpt}</p>

        <div className="mt-6 flex items-center gap-3">
          {post.url && !post.content ? (
            <a
              href={post.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-sm font-medium"
            >
              Access Node →
            </a>
          ) : (
            <Link
              to={`/blog/${post.slug}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-sm font-medium"
            >
              Access Node →
            </Link>
          )}

          <div className="ml-auto flex items-center gap-2 text-xs">
            {post.tags?.slice(0, 2).map((t) => (
              <span
                key={t}
                className="px-2 py-1 rounded bg-slate-800/50 border border-slate-700 text-slate-300 text-[11px]"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </motion.article>
    </Tilt>
  );
};

/* ----------------------------- Main Page ----------------------------- */
const Blog: React.FC = () => {
  const [q, setQ] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const tags = useMemo(() => {
    const s = new Set<string>();
    blogPosts.forEach((p) => p.tags?.forEach((t) => s.add(t)));
    return Array.from(s);
  }, []);

  const featured = blogPosts.find((p) => p.featured) ?? blogPosts[0];

  const results = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return blogPosts.filter((p) => {
      const matchQ =
        !qq ||
        p.title.toLowerCase().includes(qq) ||
        p.excerpt.toLowerCase().includes(qq) ||
        (p.tags ?? []).some((t) => t.toLowerCase().includes(qq));
      const matchTag = !activeTag || (p.tags ?? []).includes(activeTag);
      return matchQ && matchTag;
    });
  }, [q, activeTag]);

  return (
    <>
      <Header />

      <main className="relative min-h-screen bg-[#040612] text-white px-6 py-20 overflow-hidden">
        <NebulaCanvas />

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Hero */}
          <section className="text-center mb-12">
            <motion.h1
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-6xl font-extrabold tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500"
            >
              TechMate Archives
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.12 }}
              className="mt-4 text-slate-400 max-w-2xl mx-auto"
            >
              Essays, playbooks, and product thinking from the builders designing
              future-ready systems.
            </motion.p>
          </section>

          {/* Featured + Quick */}
          <section className="mb-10">
            <div className="grid md:grid-cols-3 gap-6 items-start">
              <div className="md:col-span-2">
                <FeaturedCard post={featured} />
              </div>

              <aside className="rounded-2xl p-6 bg-[#071025]/60 border border-slate-700/40">
                <h4 className="text-sm text-slate-300 uppercase tracking-wider">
                  Featured Brief
                </h4>
                <p className="mt-3 text-slate-200 leading-relaxed text-sm">
                  {featured.excerpt}
                </p>

                <div className="mt-6">
                  <Link
                    to={`/blog/${featured.slug}`}
                    className="px-4 py-2 rounded-md bg-cyan-600 text-sm font-medium"
                  >
                    Open Transmission
                  </Link>
                </div>

                <div className="mt-6">
                  <h5 className="text-xs text-slate-400 uppercase tracking-wide">
                    Quick Tags
                  </h5>
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {(featured.tags ?? []).map((t) => (
                      <TagPill
                        key={t}
                        tag={t}
                        onClick={() => setActiveTag(t)}
                        active={activeTag === t}
                      />
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </section>

          {/* Controls */}
          <section className="mb-8 flex flex-col md:flex-row items-center gap-4 justify-between">
            <div className="w-full md:w-1/2">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search archives, ideas or tags..."
                aria-label="Search archives"
                className="w-full p-3 rounded-lg bg-[#071025]/80 border border-slate-700 placeholder-slate-400 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setActiveTag(null)}
                className={`px-3 py-1 rounded-full text-xs ${
                  activeTag === null
                    ? 'bg-cyan-500/20 border border-cyan-500 text-cyan-200'
                    : 'bg-transparent border border-slate-700 text-slate-300'
                }`}
              >
                All
              </button>
              {tags.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setActiveTag(activeTag === t ? null : t)}
                  className={`px-3 py-1 rounded-full text-xs ${
                    activeTag === t
                      ? 'bg-cyan-500/20 border border-cyan-500 text-cyan-200'
                      : 'bg-transparent border border-slate-700 text-slate-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </section>

          {/* Grid */}
          <section>
            <div className="grid md:grid-cols-2 gap-8">
              {results.map((p) => (
                <Card key={p.slug} post={p} />
              ))}
            </div>

            {results.length === 0 && (
              <div className="mt-12 text-center text-slate-400">
                No transmissions match your query.
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
};

export default Blog;
