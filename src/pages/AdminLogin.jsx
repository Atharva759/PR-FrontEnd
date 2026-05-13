import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, googleProvider } from "../../firebase";
import {
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signInWithPopup,
} from "firebase/auth";
import { FcGoogle } from "react-icons/fc";
import { toast } from "react-hot-toast";

const actionCodeSettings = {
  url: window.location.origin + "/adminlogin",
  handleCodeInApp: true,
};

const API = "http://localhost:8080";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const redirectToDashboard = () => navigate("/admindashboard");

  /*
  Decode JWT
  */
  const decodeToken = (token) => {
    try {
      const payload = token.split(".")[1];
      return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    } catch {
      return null;
    }
  };

  /*
  Call backend to set claims
  */
  const setClaims = async (uid) => {
    try {
      await fetch(`${API}/api/users/auth/setClaims`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid }),
      });
    } catch (err) {
      console.error("Failed to set claims", err);
    }
  };

  /*
  Validate role
  */
  const validateRole = async (user) => {
    try {
      await setClaims(user.uid);

      const token = await user.getIdToken(true);

      const decoded = decodeToken(token);
      console.log("Decoded token:", decoded);

      const role = decoded?.role;

      if (role !== "super_admin") {
        toast.error("Access denied. Admins only.");
        await auth.signOut();
        return false;
      }

      return true;
    } catch (err) {
      console.error("Role validation failed:", err);
      toast.error("Authentication error");
      return false;
    }
  };

  /*
  Email Link Login
  */
  useEffect(() => {
    const checkEmailLink = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        const savedEmail = localStorage.getItem("adminEmail");

        if (!savedEmail) {
          toast.error("Missing email for login");
          return;
        }

        try {
          const result = await toast.promise(
            signInWithEmailLink(auth, savedEmail, window.location.href),
            {
              loading: "Signing you in...",
              success: "Signed in successfully!",
              error: "Sign-in failed!",
            }
          );

          const allowed = await validateRole(result.user);

          if (allowed) redirectToDashboard();

          localStorage.removeItem("adminEmail");
        } catch (error) {
          console.error("Email login error:", error);
        }
      }
    };

    checkEmailLink();
  }, []);

  /*
  Send Email Link
  */
  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    try {
      await toast.promise(
        sendSignInLinkToEmail(auth, email, actionCodeSettings),
        {
          loading: "Sending admin login link...",
          success: `Login link sent to ${email}`,
          error: "Failed to send link",
        }
      );

      localStorage.setItem("adminEmail", email);
      setEmail("");
    } catch (error) {
      console.error("Email link error:", error);
    }
  };

  /*
  Google Login
  */
  const handleGoogleLogin = async () => {
    try {
      const result = await toast.promise(
        signInWithPopup(auth, googleProvider),
        {
          loading: "Signing in with Google...",
          success: "Google sign-in successful!",
          error: "Google sign-in failed",
        }
      );

      const allowed = await validateRole(result.user);

      if (allowed) redirectToDashboard();
    } catch (error) {
      console.error("Google Login Error:", error);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center px-4 pt-16 overflow-hidden"
  style={{
    background:
      "radial-gradient(ellipse at 30% 40%, rgba(126, 87, 194, 0.4) 0%, transparent 60%), radial-gradient(ellipse at 80% 70%, rgba(30, 136, 229, 0.25) 0%, transparent 55%), #0d1321",
  }}>

      <div className="text-center mt-16 mb-10">
        <div className="flex justify-center mb-4">
          <div className="bg-blue-500/20 p-4 rounded-full border">
            <span className="text-3xl">🛡️</span>
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text">
          Enerlytics Admin Console
        </h1>

        <p className="text-gray-300 mt-3">
          Secure administrator access to manage tenants, devices, and platform infrastructure.
        </p>
      </div>

      <div className="bg-slate-900/70 backdrop-blur-xl p-8 rounded-3xl shadow-xl w-full max-w-md border border-white/20">

        <h2 className="text-lg font-semibold text-white text-center mb-6">
          Administrator Sign In
        </h2>

        <form onSubmit={handleEmailSubmit} className="grid gap-5">

          <input
            type="email"
            placeholder="Enter admin email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 border border-white/30 rounded-lg bg-slate-800 text-white"
            required
          />

          <button className="p-3 bg-blue-600 text-white rounded-full cursor-pointer">
            Send Login Link
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/20"></div>
            <span className="text-gray-400 text-sm">or</span>
            <div className="flex-1 h-px bg-white/20"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex justify-center items-center gap-2 p-3 border border-white/30 rounded-full text-white cursor-pointer"
          >
            <FcGoogle size={25} /> Continue with Google
          </button>

        </form>

        <p className="text-center mt-6 text-sm text-gray-400">
          Tenant user?{" "}
          <a
            href="/auth"
            className="text-blue-400 font-semibold hover:underline"
          >
            Go to Tenant Login
          </a>
        </p>

      </div>
    </div>
  );
};

export default AdminLogin;