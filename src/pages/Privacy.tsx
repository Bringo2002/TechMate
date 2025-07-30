import React from 'react';

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0D1117] text-white px-6 py-12 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-6 text-blue-400">Privacy Policy</h1>
      <p className="text-gray-300 mb-4">
        We respect your privacy. This policy explains how TechMate collects, uses, and protects your data.
      </p>
      <ul className="list-disc pl-5 space-y-2 text-gray-400">
        <li><strong>Information Collection:</strong> We collect data to provide better services.</li>
        <li><strong>Usage:</strong> Your data is used only for service delivery and analytics.</li>
        <li><strong>Security:</strong> We use encryption and best practices to safeguard data.</li>
        <li><strong>Third-Party:</strong> No data is sold or shared without consent.</li>
      </ul>
      <p className="mt-6 text-sm text-gray-500">Last updated: July 30, 2025</p>
    </div>
  );
};

export default Privacy;
