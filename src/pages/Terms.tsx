import React from "react";
import { motion } from "framer-motion";

const Terms: React.FC = () => {
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
            Terms of Service
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
          Welcome to <span className="text-blue-400 font-semibold">TechMate</span>. 
          These Terms of Service (“Terms”) govern your access to and use of our 
          products, services, and applications (collectively, “Services”). 
          By using TechMate, you agree to these Terms. Please read them carefully.
        </motion.p>

        {/* Sections */}
        <div className="space-y-12">
          {[
            {
              title: "1. Use of Our Services",
              content: `You agree to use TechMate only for lawful purposes and in accordance 
              with these Terms. You may not misuse our Services, attempt to gain unauthorized 
              access, or interfere with their operation.`
            },
            {
              title: "2. Intellectual Property",
              content: `All content, trademarks, and technologies provided through TechMate 
              are owned by or licensed to us. You may not copy, distribute, or create derivative 
              works without prior permission.`
            },
            {
              title: "3. User Responsibilities",
              content: `You are responsible for safeguarding your account credentials and 
              all activities under your account. Notify us immediately if you suspect any 
              unauthorized use.`
            },
            {
              title: "4. Privacy & Data",
              content: `Your use of our Services is also governed by our Privacy Policy. 
              We are committed to protecting your data while delivering innovative solutions.`
            },
            {
              title: "5. Disclaimers",
              content: `TechMate is provided “as is” without warranties of any kind, express 
              or implied. We do not guarantee uninterrupted access, error-free operation, 
              or absolute security.`
            },
            {
              title: "6. Limitation of Liability",
              content: `To the fullest extent permitted by law, TechMate shall not be liable 
              for any indirect, incidental, or consequential damages resulting from your use 
              of our Services.`
            },
            {
              title: "7. Changes to Terms",
              content: `We may update these Terms from time to time. Continued use of TechMate 
              after changes become effective constitutes your acceptance of the revised Terms.`
            },
            {
              title: "8. Governing Law",
              content: `These Terms are governed by and construed in accordance with the laws 
              of your jurisdiction, without regard to conflict-of-law principles.`
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
          If you have questions about these Terms, please contact us at{" "}
          <span className="text-blue-400">legal@techmate.com</span>.
        </motion.p>
      </div>
    </div>
  );
};

export default Terms;
