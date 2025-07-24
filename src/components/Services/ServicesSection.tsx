import React from 'react';

const ServicesSection: React.FC = () => (

  

<section id="services" className="relative py-20 px-6 overflow-hidden">
   <div className="relative w-full max-w-screen-2xl mx-auto grid md:grid-cols-2 gap-16 px-8 items-center z-10">


      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-30 pointer-events-none"
        src= "/service-bg.mp4"
      />
      <h2 className="text-2xl font-bold mb-2">Our Services</h2>
      <p className="text-gray-600 mb-4 max-w-md">Our services are designed to help your business grow and thrive in the digital age. We offer a wide range of solutions tailored to your needs.</p>
      <div className="flex flex-col md:flex-row gap-8 mt-6">
        <div className="flex-1 bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <span className="text-blue-500 text-4xl mb-2"></span>
          <h3 className="font-semibold text-lg mb-1">Mobile Apps</h3>
          <p className="text-gray-500 text-center">Custom mobile app development for iOS and Android platforms.</p>
        </div>
        <div className="flex-1 bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <span className="text-blue-500 text-4xl mb-2"></span>
          <h3 className="font-semibold text-lg mb-1">Websites</h3>
          <p className="text-gray-500 text-center">Modern, responsive websites to showcase your business online.</p>
        </div>
      </div>
      <div className="mt-6">
        <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full transition-all shadow">View Details</button>
      </div>
    </div>
  </section>
);

export default ServicesSection;
