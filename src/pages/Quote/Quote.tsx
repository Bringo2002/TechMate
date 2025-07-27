// src/pages/Quote.tsx

import React from 'react';
import { useForm, ValidationError } from '@formspree/react';

const Quote: React.FC = () => {
  const [state, handleSubmit] = useForm("xkgzrwnz");

  if (state.succeeded) {
    return (
      <div className="min-h-screen bg-[#0D1117] px-6 py-20 text-white flex items-center justify-center">
        <h2 className="text-2xl">✅ Thanks for your submission!</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D1117] px-6 py-20 text-white">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">Request a Quote</h1>
        <p className="text-gray-400 mb-12 text-center">
          Let's talk about your project, idea, or question. We're here to help.
        </p>

        <form onSubmit={handleSubmit} className="bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-700">
          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Name
            </label>
            <input
              id="name"
              type="text"
              name="name"
              required
              placeholder="John Doe"
              className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              required
              placeholder="john@example.com"
              className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <ValidationError prefix="Email" field="email" errors={state.errors} />
          </div>

          <div className="mb-6">
            <label htmlFor="message" className="block text-sm font-medium mb-2">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={5}
              placeholder="Your message..."
              className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <ValidationError prefix="Message" field="message" errors={state.errors} />
          </div>

          <button
            type="submit"
            disabled={state.submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 py-3 px-6 rounded-lg text-white font-semibold transition duration-200"
          >
            {state.submitting ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Quote;
