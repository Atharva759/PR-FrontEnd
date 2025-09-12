import { Link } from "react-router-dom";
const Home = () => {
  return (
    <div className="relative h-screen w-full">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/bgwarehouse.png')",
        }}
      ></div>

      <div className="absolute inset-0 bg-black/50"></div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 sm:px-6">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg mb-4">
          Cloud-Connected Warehouse Security
        </h1>

        <p className="text-base sm:text-lg text-gray-200 max-w-xl sm:max-w-2xl mb-8">
          Smart cyber-physical system for secure warehouse gate monitoring and
          control. Connected to the cloud for real-time visibility and remote
          access.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 w-full sm:w-auto">
          <Link
            to="/login"
            className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-blue-600 text-white text-base sm:text-lg font-semibold rounded-md shadow-md hover:bg-blue-700 transition-transform transform hover:scale-105 text-center"
          >
            Go to Login
          </Link>
          <Link
            to="/admin"
            className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-blue-600 text-white text-base sm:text-lg font-semibold rounded-md shadow-md hover:bg-blue-700 transition-transform transform hover:scale-105 text-center"
          >
            Go to Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
