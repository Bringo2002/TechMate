import React from 'react';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0D1117] text-white px-6 py-12 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-6 text-blue-400">Terms of Service</h1>
      <p className="text-gray-300 mb-4">
        These Terms of Service govern your use of TechMate’s services. By using our website and services, you agree to these terms.
      </p>
      <ul className="list-disc pl-5 space-y-2 text-gray-400">
        <li><strong>Use License:</strong> You may not copy or modify materials.</li>
        <li><strong>Disclaimer:</strong> All services are provided “as is” without warranty.</li>
        <li><strong>Limitations:</strong> We are not liable for damages.</li>
        <li><strong>Revisions:</strong> Terms may be updated without notice.</li>
      </ul>
      <p className="mt-6 text-sm text-gray-500">Last updated: July 30, 2025</p>
    </div>
  );
};

export default Terms;
