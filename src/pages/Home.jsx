import { Link } from "react-router-dom";
import Logo from "../assets/logo.png";

const Home = () => {
  return (
    <div className="min-h-screen bg-blue-600 flex flex-col items-center justify-center text-white font-sans">

      {/* Logo + Title */}
      <div className="flex flex-col items-center mb-10">
        <img src={Logo} alt="Logo" className="h-20 mb-4" />
        <h1 className="text-4xl font-bold text-center">
          Multi-Tenant Energy Monitoring
        </h1>
      </div>

      {/* Login Buttons */}
      <div className="flex gap-6">
        <Link
          to="/auth"
          className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow hover:scale-105 transition"
        >
          Tenant Login
        </Link>

        <Link
          to="/adminlogin"
          className="px-8 py-3 bg-blue-800 text-white font-semibold rounded-lg shadow hover:scale-105 transition"
        >
          Super Admin
        </Link>
      </div>

    </div>
  );
};

export default Home;