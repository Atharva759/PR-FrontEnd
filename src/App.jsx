import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import Auth from "./pages/Auth";
import UserDashboard from "./pages/UserDashboard";
import PrivateRoute from "./components/PrivateRoute";
import { Toaster } from "react-hot-toast";
import AdminLogin from "./pages/AdminLogin";
import ManageUsers from "./components/ManageUsers";
import SensorDashboard from "./components/SensorDashboard";

function App() {
  return (
    <>
      <BrowserRouter>
        <Toaster />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <UserDashboard />
              </PrivateRoute>
            }
          />
          <Route path="/adminlogin" element={<AdminLogin />} />
          <Route
            path="/admindashboard"
            element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/manage-users"
            element={
              <PrivateRoute>
                <ManageUsers />
              </PrivateRoute>
            }
          />
          <Route path="/dashboard/:deviceId" element={<SensorDashboard />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
