import React, { useEffect } from 'react';
import ContactSection from './ContactPage';

const Contact: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Contact | TechMate';
  }, []);
  return <ContactSection />;
};

export default Contact;
