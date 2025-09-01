import React from "react";
import { motion } from "framer-motion";

const Cookies: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0D1117] text-gray-200 px-6 py-16">
      <div className="max-w-5xl mx-auto">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12 text-center"
        >
          <h1 className="text-5xl font-extrabold text-blue-400 mb-4">
            Cookies Policy
          </h1>
          <p className="text-lg text-gray-400">
            Effective as of <span className="text-gray-300">July 30, 2025</span>
          </p>
        </motion.div>

        {/* Intro */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-10 text-gray-300 text-lg leading-relaxed"
        >
          TechMate uses cookies and similar technologies to enhance your
          browsing experience, improve performance, and provide personalized
          services. This Cookies Policy explains how and why we use cookies.
        </motion.p>

        {/* Sections */}
        <div className="space-y-12">
          {[
            {
              title: "1. What Are Cookies?",
              content: `Cookies are small text files stored on your device when you 
              visit a website. They help websites function properly and can 
              store preferences or track usage for analytics.`
            },
            {
              title: "2. Types of Cookies We Use",
              content: `• Essential Cookies: Necessary for core functionality such as 
              authentication and security.  
              • Performance Cookies: Help us understand how users interact with 
              our platform.  
              • Functional Cookies: Remember your settings and preferences.  
              • Analytics & Marketing Cookies: Improve user experience and show 
              relevant content.`
            },
            {
              title: "3. Why We Use Cookies",
              content: `We use cookies to provide a secure, personalized, and efficient 
              user experience, as well as to analyze platform performance and 
              enhance features.`
            },
            {
              title: "4. Managing Cookies",
              content: `You can control or delete cookies through your browser 
              settings. Disabling cookies may affect functionality or limit 
              certain features of TechMate.`
            },
            {
              title: "5. Third-Party Cookies",
              content: `Some cookies may come from trusted third parties such as 
              analytics or advertising partners. These providers are responsible 
              for their own cookie practices. Some cookies expire when you close your browser, while others remain 
              on your device until deleted or they expire automatically.`
            },
            {
              title: "6. Consent Management",
              content: `By continuing to use TechMate, you consent to our use of cookies. 
               You can withdraw consent at any time by adjusting your browser or device settings.`
            },
            {
              title: "7. Updates to This Policy",
              content: `We may update this Cookies Policy from time to time. Changes 
              will be posted here, and continued use of TechMate signifies 
              acceptance of the updated policy.`
            },
            {
              title: "8. Opt-Out Options",
              content: `You can disable cookies in your browser settings or use third-party tools 
              to opt out of targeted advertising.`
            }
          ].map((section, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 * idx }}
              className="bg-[#161B22] p-6 rounded-2xl shadow-lg hover:shadow-blue-500/20 transition"
            >
              <h2 className="text-2xl font-bold text-blue-300 mb-3">
                {section.title}
              </h2>
              <p className="text-gray-400 leading-relaxed whitespace-pre-line">
                {section.content}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Footer Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-16 text-center text-gray-500 text-sm"
        >
          If you have questions about this Cookies Policy, contact us at{" "}
          <span className="text-blue-400">cookies@techmate.com</span>.
        </motion.p>
      </div>
    </div>
  );
};

export default Cookies;
