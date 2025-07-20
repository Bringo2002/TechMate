import React from 'react';

const Contact: React.FC = () => (
<section id="contact" className="py-16 px-4 md:px-0 flex justify-center">
    <div className="bg-blue-900/90 rounded-xl shadow-lg p-8 w-full max-w-md">
      <h2 className="text-xl font-bold text-white mb-4">Contact Us</h2>
      <form className="flex flex-col gap-4">
        <input type="text" placeholder="Project" className="rounded px-4 py-2 bg-white/90 text-gray-800 focus:outline-none" />
        <input type="text" placeholder="Project..." className="rounded px-4 py-2 bg-white/90 text-gray-800 focus:outline-none" />
        <textarea placeholder="Finest Cracks" className="rounded px-4 py-2 bg-white/90 text-gray-800 focus:outline-none resize-none" rows={3} />
        <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full transition-all shadow">Chat Now</button>
      </form>
    </div>
  </section>
);

export default Contact;
