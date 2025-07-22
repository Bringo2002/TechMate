import React from 'react';
import { useLocation } from 'react-router-dom';

const About = () => {
  return (
    <section className="bg-slate-900 text-white px-6 md:px-20 py-20 space-y-16">
      {/* Hero */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-400 mt-12 md:mt-20">We build the tech you imagine.</h1>
        <p className="text-lg md:text-xl max-w-3xl mx-auto text-slate-300">
          TechMate is your dedicated partner for bringing digital ideas to life—from custom websites and web apps to mobile and desktop software.
        </p>
      </div>
      {/* Mission */}
      <div className="max-w-4xl mx-auto text-center space-y-4">
        <h2 className="text-2xl font-semibold text-white">Our Mission</h2>
        <p className="text-slate-300">
          At TechMate, we believe tech should empower ideas, not complicate them.<br />
          We started this venture to help individuals, startups, and businesses turn their visions into real, usable, launch-ready products—without the headache.
        </p>
      </div>
      {/* What We Build */}
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold text-white text-center mb-6">What We Build</h2>
        <ul className="grid md:grid-cols-2 gap-4 text-slate-300 text-lg list-disc list-inside">
          <li>Websites & Web Applications</li>
          <li>iOS & Android Mobile Apps (Native or Cross-Platform)</li>
          <li>Desktop Software (macOS, Windows, Linux)</li>
          <li>MVPs & Prototypes</li>
          <li>Custom APIs & Backend Systems</li>
          <li>Ongoing Support, Maintenance & Upgrades</li>
        </ul>
      </div>
      {/* What Makes Us Different */}
      <div className="max-w-4xl mx-auto space-y-4">
        <h2 className="text-2xl font-semibold text-white text-center">What Makes Us Different</h2>
        <ul className="grid md:grid-cols-2 gap-4 text-slate-300 text-lg list-disc list-inside">
          <li><strong>Fully Custom Builds</strong> – Every line of code matches your vision. No shortcuts.</li>
          <li><strong>Startup-Minded</strong> – We understand bootstrapping and moving fast.</li>
          <li><strong>Tech-Agnostic</strong> – We use the best tools for *your* product.</li>
          <li><strong>People-First Approach</strong> – Real humans, real conversations, real results.</li>
        </ul>
      </div>
      {/* Team */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h2 className="text-2xl font-semibold text-white">Meet the Team</h2>
        <p className="text-slate-300">
          We’re a lean, skilled team of designers, developers, and product thinkers. Not a faceless agency—we’re hands-on builders who care about quality, timelines, and your success.
        </p>
        {/* Add team bios or photos here */}
      </div>
      {/* Testimonials / Trust */}
      <div className="bg-slate-800 p-8 rounded-xl shadow-md max-w-4xl mx-auto space-y-6">
        <h2 className="text-2xl font-semibold text-center text-white">Trusted by Clients Around the World</h2>
        <blockquote className="text-slate-300 italic">
          “TechMate built our MVP faster than we expected, and the results were beyond what we imagined.”  
          <br /><span className="block mt-2 text-sm text-slate-400">— Brian Harrington., Startup Founder</span>
        </blockquote>
        <blockquote className="text-slate-300 italic">
          “It’s rare to find a dev team that *gets it*—but TechMate really understood what we needed and delivered.”
          <br /><span className="block mt-2 text-sm text-slate-400">— Bian Harrington., CEO of EliteX.com</span>
        </blockquote>
        <div className="text-slate-400 text-center">
          ✅ 20+ successful projects · Clients in 5+ countries · 100% commitment to delivery
        </div>
      </div>
      {/* CTA */}
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-semibold text-blue-400">🚀 Ready to Build?</h2>
        <p className="text-slate-300 text-lg">Whether you're refining an idea or scaling a product, TechMate is ready to help.</p>
        <div className="flex justify-center gap-4">
          <a href="/quote" className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition">Get a Quote</a>
          <a href="/contact" className="border border-blue-600 text-blue-400 px-6 py-3 rounded-full hover:bg-blue-900 transition">Contact Us</a>
        </div>
      </div>
    </section>
  );
};

export default About;
