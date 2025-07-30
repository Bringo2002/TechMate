import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc'; // Google icon

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Send data to backend for login
    console.log('User Logged In:', formData);
    navigate('/'); // Redirect to homepage or dashboard
  };

  const handleGoogleLogin = () => {
    // TODO: Implement Google OAuth here
    console.log('Google Login clicked');
  };

  return (
    <div className="min-h-screen bg-[#0D1117] flex items-center justify-center px-4">
      <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-700">
        <h2 className="text-3xl font-bold text-blue-400 mb-6 text-center">Login</h2>

       

        {/* Email Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
  <input
    type="email"
    name="email"
    placeholder="Email Address"
    value={formData.email}
    onChange={handleChange}
    required
    className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
  />
  <input
    type="password"
    name="password"
    placeholder="Password"
    value={formData.password}
    onChange={handleChange}
    required
    className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
  />
  
  {/* Forgot Password Button */}
  <div className="flex justify-left">
    <button
      type="button"
      onClick={() => alert('Password recovery not yet implemented')}
      className="text-blue-400 text-sm hover:underline"
    >
      Forgot Password?
    </button>
  </div>

  <button
    type="submit"
    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-all duration-200"
  >
    Login
  </button>
</form>


        <p className="text-center text-gray-300 mt-4">
          Don’t have an account?{' '}
          <Link to="/signup" className="text-blue-400 hover:underline">
            Sign Up
          </Link>
        </p>
         {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <hr className="flex-grow border-slate-600" />
          <span className="text-slate-400">or</span>
          <hr className="flex-grow border-slate-600" />
        </div>

       {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 bg-white text-black py-3 rounded-lg shadow hover:shadow-md transition-all font-semibold mb-6"
        >
          <FcGoogle size={24} /> Login with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
