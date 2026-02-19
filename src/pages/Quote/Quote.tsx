// src/pages/Quote.tsx
import React from "react";
import { useForm, ValidationError } from "@formspree/react";
import { motion } from "framer-motion";
import { Helmet } from 'react-helmet-async'; // ✅ For SEO metadata

const Quote: React.FC = () => {
  const [state, handleSubmit] = useForm("xkgzrwnz");
   const structuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Request a Quote",
    "url": "https://yourdomain.com/quote",
    "description": "Request a project quote today. Share your vision and let our expert team bring it to life.",
    "mainEntity": {
      "@type": "Organization",
      "name": "Your Brand",
      "url": "https://yourdomain.com",
      "logo": "https://yourdomain.com/logo.png",
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "Sales",
        "email": "sales@yourdomain.com",
        "telephone": "+1-234-567-890",
        "areaServed": "Worldwide",
        "availableLanguage": ["English"]
      }
    }
  };

  if (state.succeeded) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center px-6 py-20">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-gradient-to-br from-cyan-500/20 to-purple-600/20 p-12 rounded-2xl border border-cyan-400/30 shadow-[0_0_40px_rgba(0,255,255,0.3)] text-center max-w-lg"
        >
          <h2 className="text-3xl font-bold text-cyan-200 mb-4">
            🚀 Submission Successful
          </h2>
          <p className="text-gray-300 text-lg">
            Thanks for trusting us with your vision.
            Our team will contact you shortly.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D1117] px-6 py-20 text-white">
      {/* ✅ SEO Metadata */}
      <Helmet>
        <title>Request a Quote | Your Brand</title>
        <meta
          name="description"
          content="Request a project quote today. Share your vision and let our expert team bring it to life. Fast response, tailored solutions."
        />
        <meta
          name="keywords"
          content="project quote, web development, design quote, request a quote, custom solutions"
        />
        <meta property="og:title" content="Request a Quote | Your Brand" />
        <meta
          property="og:description"
          content="Get a tailored project quote today. Fast, reliable, and professional solutions for your business."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yourdomain.com/quote" />
        <meta property="og:image" content="https://yourdomain.com/preview.jpg" />
        {/* ✅ Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-3xl mx-auto"
      >
        <h1 className="text-5xl font-extrabold mb-6 text-center bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
          Request a Quote
        </h1>
        <p className="text-gray-400 mb-12 text-center text-lg">
          Share your idea. Let’s shape the future together.  
          We’ll respond faster than light ⚡.
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-slate-900/80 backdrop-blur-xl p-10 rounded-2xl shadow-2xl border border-slate-700 space-y-8"
          aria-label="Quote Request Form" // ✅ Accessibility
        >
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Full Name <span className="text-red-400">*</span>
            </label>
            <input
              id="name"
              type="text"
              name="name"
              required
              autoComplete="name" // ✅ UX improvement
              placeholder="John Doe"
              className="w-full bg-slate-800 text-white px-4 py-3 rounded-xl border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email Address <span className="text-red-400">*</span>
            </label>
            <input
              id="email"
              type="email"
              name="email"
              required
              autoComplete="email" // ✅ UX
              placeholder="john@example.com"
              className="w-full bg-slate-800 text-white px-4 py-3 rounded-xl border border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
            />
            <ValidationError prefix="Email" field="email" errors={state.errors} />
          </div>

          {/* Phone (optional for conversions) */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-2">
              Phone Number (optional)
            </label>
            <input
              id="phone"
              type="tel"
              name="phone"
              autoComplete="tel"
              placeholder="+1 234 567 890"
              className="w-full bg-slate-800 text-white px-4 py-3 rounded-xl border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
            />
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-2">
              Project Details <span className="text-red-400">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={5}
              placeholder="Describe your project, timeline, and goals..."
              className="w-full bg-slate-800 text-white px-4 py-3 rounded-xl border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
            />
            <ValidationError prefix="Message" field="message" errors={state.errors} />
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={state.submitting}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 py-3 px-6 rounded-xl font-semibold shadow-lg text-white transition disabled:opacity-50"
            aria-busy={state.submitting}
          >
            {state.submitting ? "Sending..." : "Send Message"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default Quote;
