import React from 'react';
import { useNavigate } from 'react-router-dom';


const NotFoundPage: React.FC = () => {
    const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-not-found bg-cover bg-center flex flex-col justify-center items-center text-white px-4">
      {/* <div className="bg-black bg-opacity-50 p-8 rounded-xl text-center"> */}
        <h1 className="text-6xl font-bold mb-4 tracking-wide">Oops!</h1>
        <p className="text-xl mb-6">We can’t find the page you’re looking for 😞</p>
        <button
          onClick={() => navigate(-1)} // Go back to previous page
          className="inline-block bg-white text-blue-600 font-semibold px-6 py-3 rounded-full shadow-md hover:bg-blue-100 transition"
        >
          GO BACK
        </button>
      </div>
  );
};


//option 2
// import React from 'react';
// import { Link } from 'react-router-dom';

// const NotFoundPage: React.FC = () => {
//   return (
//     <div className="relative min-h-screen flex flex-col justify-center items-center text-white px-4 overflow-hidden">
//       {/* Background image with blur + fade-in */}
//       <div
//         className="absolute inset-0 bg-cover bg-center opacity-80 blur-sm animate-fade-in"
//         style={{ backgroundImage: 'url("/404-blue.png")' }}
//       ></div>

//       {/* Dark overlay */}
//       <div className="absolute inset-0 bg-black/10"></div>

//       {/* Foreground content */}
//       <div className="relative z-10 text-center animate-fade-in">
//         <h1 className="text-6xl font-bold mb-4 tracking-widest">OOPS!</h1>
//         <p className="text-xl mb-6">We can’t find the page that you’re looking for 😢</p>

//         <Link
//           to="/"
//           className="inline-block bg-white text-blue-600 font-semibold px-6 py-3 rounded-full shadow-md hover:bg-blue-100 transition"
//         >
//           BACK TO HOME
//         </Link>
//       </div>
//     </div>
//   );
// };

// export default NotFoundPage;


export default NotFoundPage;
