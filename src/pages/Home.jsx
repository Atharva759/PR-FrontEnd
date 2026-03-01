import { Link } from "react-router-dom";
import { BoltIcon, UserGroupIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import Logo from '../assets/logo.png';
import feat1 from '../assets/feat1.png';
import feat2 from '../assets/feat2.png';
import feat3 from '../assets/feat3.png';
import heroimage from '../assets/heroimage.png';

const Home = () => {
  return (
    <div className="font-sans text-gray-900">
        
      {/* Glass Navbar */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-white/10 backdrop-blur-lg border-b border-white/20 shadow-lg  rounded-2xl">
        <div className="flex items-center gap-2">
          <img src={Logo} alt="Enerlytics Cloud Logo" className="h-10 w-auto" />
          <span className="text-white text-2xl font-bold">Enerlytics Cloud</span>
        </div>
        <div className="flex gap-4">
          <Link
            to="/auth"
            className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:scale-105 transition transform"
          >
            Tenant Login
          </Link>
          <Link
            to="/adminlogin"
            className="px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:scale-105 transition transform"
          >
            Super Admin
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        className="relative pt-32 pb-32 flex flex-col items-center text-center"
        style={{
          background: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${heroimage}) center/cover no-repeat`,
        }}
      >
        <div className="relative z-10 max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 mb-6">
            Multi-Tenant IoT Data Platform
          </h1>
          <p className="text-gray-200 text-lg md:text-xl mb-10">
            Collect energy & environmental data from PZEM and AQI sensors, analyze in real-time, and make smarter decisions with AI-driven insights.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/auth"
              className="px-8 py-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold shadow-lg hover:scale-105 transition transform"
            >
              Get Started
            </Link>
            <Link
              to="#functionalities"
              className="px-8 py-4 rounded-full bg-white/20 text-white font-semibold backdrop-blur-md shadow hover:scale-105 transition transform"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Functionalities Section */}
<section id="functionalities" className="py-24 px-6 bg-gray-900">
  <div className="max-w-6xl mx-auto text-center mb-16">
    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
      Platform Functionalities
    </h2>
    <p className="text-gray-300 text-lg max-w-3xl mx-auto">
      Everything you need for energy & environmental monitoring in one SaaS platform.
    </p>
  </div>
  <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
    {/* Feature 1 */}
    <div className="bg-white/10 backdrop-blur-md border border-white/20 hover:border-cyan-400 transition transform hover:-translate-y-2 hover:scale-105 shadow-2xl text-center rounded-xl overflow-hidden">
      <img src={feat1} alt="data" className="w-full h-48 object-cover"/>
      <div className="p-6">
        <BoltIcon className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-cyan-400 mb-2">Real-Time Data Acquisition</h3>
        <p className="text-gray-300 text-sm">
          Collect live data from ESP devices, PZEM meters, and AQI sensors.
        </p>
      </div>
    </div>

    {/* Feature 2 */}
    <div className="bg-white/10 backdrop-blur-md border border-white/20 hover:border-emerald-400 transition transform hover:-translate-y-2 hover:scale-105 shadow-2xl text-center rounded-xl overflow-hidden">
      <img src={feat2} alt="tenant" className="w-full h-48 object-cover"/>
      <div className="p-6">
        <UserGroupIcon className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-emerald-400 mb-2">Multi-Tenant Management</h3>
        <p className="text-gray-300 text-sm">
          Secure tenant isolation with role-based access and custom dashboards.
        </p>
      </div>
    </div>

    {/* Feature 3 */}
    <div className="bg-white/10 backdrop-blur-md border border-white/20 hover:border-blue-400 transition transform hover:-translate-y-2 hover:scale-105 shadow-2xl text-center rounded-xl overflow-hidden">
      <img src={feat3} alt="analytics" className="w-full h-48 object-cover"/>
      <div className="p-6">
        <ChartBarIcon className="h-12 w-12 text-blue-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-blue-400 mb-2">Analytics & ML Insights</h3>
        <p className="text-gray-300 text-sm">
          Energy consumption reports, AQI trends, and predictive suggestions.
        </p>
      </div>
    </div>
  </div>
</section>

      {/* Contact Section */}
<section className="py-20 px-6 bg-slate-900/95 backdrop-blur-md">
  <div className="max-w-3xl mx-auto text-center">
    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Contact Us</h2>
    <p className="text-gray-300 text-lg mb-8">
      Reach out for demo, enterprise pricing, or support inquiries.
    </p>
    <form className="flex flex-col sm:flex-row gap-4 justify-center items-center">
      <input
        type="email"
        placeholder="Your email"
        className="px-4 py-3 rounded-lg w-full sm:w-2/3 border border-white/20 bg-slate-800/90 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
      />
      <button
        type="submit"
        className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold shadow-lg hover:scale-105 transition transform w-full sm:w-auto"
      >
        Contact
      </button>
    </form>
  </div>
</section>

{/* Footer */}
<footer className="bg-slate-900/95 backdrop-blur-md py-6 text-center text-gray-400">
  <div className="max-w-6xl mx-auto">
    <p>© 2026 Enerlytics Cloud. All rights reserved.</p>
    <p className="mt-1 text-sm text-gray-500">
      Designed for multi-tenant IoT data acquisition and analytics.
    </p>
  </div>
</footer>
    </div>
  );
};

export default Home;