import React from "react";
import { motion } from "framer-motion";

const Privacy: React.FC = () => {
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
            Privacy Policy
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
          At <span className="text-blue-400 font-semibold">TechMate</span>, your
          privacy is a top priority. This Privacy Policy explains how we collect,
          use, and safeguard your information when you use our products,
          services, and applications (collectively, “Services”).
        </motion.p>

        {/* Sections */}
        <div className="space-y-12">
          {[
            {
              title: "1. Information We Collect",
              content: `We may collect personal information such as your name, email, 
              and usage data to provide and improve our Services. We also collect 
              technical information like IP addresses and device details for 
              security and analytics.`
            },
            {
              title: "2. How We Use Information",
              content: `Your information is used to deliver Services, enhance user 
              experience, communicate with you, and ensure the security of our 
              platform.`
            },
            {
              title: "3. Data Sharing",
              content: `We do not sell your personal data. Information may be shared 
              only with trusted partners or service providers bound by 
              confidentiality obligations, or if required by law.`
            },
            {
              title: "4. Cookies & Tracking",
              content: `We use cookies and similar technologies to improve functionality, 
              analyze usage, and personalize content. You can manage cookie 
              preferences in your browser settings.`
            },
            {
              title: "5. Data Security",
              content: `We implement industry-standard measures to protect your data 
              from unauthorized access, alteration, or disclosure. However, no 
              method of transmission over the internet is completely secure.`
            },
            {
              title: "6. Data Retention",
              content: `We retain your data only as long as necessary to provide our Services, 
               comply with legal obligations, and resolve disputes.`
            },
            {
              title: "7. Your Rights",
              content: `You may request access, correction, or deletion of your personal 
              data at any time. Depending on your location, you may also have 
              rights under applicable data protection laws.`
            },
            {
              title: "8. Children’s Privacy",
              content: `Our Services are not directed to individuals under 13 (or the 
              minimum age in your jurisdiction). TechMate does not knowingly collect data from children under 16. 
              If you believe a child has provided us with information, please contact us immediately`
            },
            {
              title: "9. Updates to Policy",
              content: `We may update this Privacy Policy periodically. Continued use of 
              TechMate after updates constitutes acceptance of the revised 
              policy.`
            },
            {
              title: "10. International Transfers",
              content: `Your information may be processed outside your country. 
              We take steps to ensure adequate protection is in place in compliance with applicable laws.`
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
              <p className="text-gray-400 leading-relaxed">{section.content}</p>
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
          If you have questions about this Privacy Policy, contact us at{" "}
          <span className="text-blue-400">privacy@techmate.com</span>.
        </motion.p>
      </div>
    </div>
  );
};

export default Privacy;
