import { Link } from "react-router-dom";
import Logo from "../assets/logo.png";
import HeroImage from "../assets/bgwarehouse.png"; // Add your background image here

const Home = () => {
  return (
    <div
      className="min-h-screen relative font-sans text-white overflow-hidden"
      style={{
        background: `radial-gradient(ellipse at 60% 30%, rgba(30, 136, 229, 0.3) 0%, transparent 60%), 
                     radial-gradient(ellipse at 25% 75%, rgba(126, 87, 194, 0.35) 0%, transparent 55%), 
                     #0d1321`,
      }}
    >
      {/* Background Image */}
      <img
        src={HeroImage}
        alt="Hero Background"
        className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none z-0"
      />

      {/* Top Navigation */}
      <nav className="absolute top-0 left-0 w-full flex justify-between items-center px-8 py-6 z-20">
        <img src={Logo} alt="Enerlytics Cloud Logo" className="h-12" />

        <div className="flex gap-4">
          <Link
            to="/auth"
            className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:scale-105 transition "
          >
            Tenant Login
          </Link>
          <Link
            to="/adminlogin"
            className="px-5 py-2 bg-purple-700 text-white font-semibold rounded-lg shadow hover:scale-105 transition"
          >
            Super Admin
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center min-h-screen px-6 z-10 relative">
        <h1 className="text-5xl md:text-6xl font-bold max-w-4xl leading-tight mb-6">
          Enerlytics Cloud
        </h1>
        <p className="text-xl md:text-2xl text-blue-200 max-w-3xl mb-8">
          Multi-Tenant Energy Monitoring Cloud Platform manage multiple facilities, leverage ML predictions, 
          and get AI assistant insights via our agent chatbot.
        </p>

        <div className="flex gap-6 justify-center flex-wrap">
          <Link
            to="/#"
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:scale-105 transition"
          >
            Get Started
          </Link>
          <Link
            to="/#"
            className="px-8 py-3 bg-purple-700 text-white font-semibold rounded-lg shadow hover:scale-105 transition"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;