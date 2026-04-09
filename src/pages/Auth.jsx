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
  url: window.location.origin + "/auth",
  handleCodeInApp: true,
};

const API = import.meta.env.VITE_BACKEND_URL;

const Auth = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const redirectToDashboard = () => navigate("/tenant-dashboard");

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
  Call backend to set custom claims
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
      // call backend to set claims
      await setClaims(user.uid);

      // force refresh token
      const token = await user.getIdToken(true);

      const decoded = decodeToken(token);
      console.log("Decoded token:", decoded);

      const role = decoded?.role;
      localStorage.setItem("tenantId", decoded.tenantId);
      if (
        role !== "tenant_admin" &&
        role !== "super_admin" &&
        role !== "facility_admin"
      ) {
        toast.error("Unauthorized role");
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
        const savedEmail = localStorage.getItem("email");

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
            },
          );

          const allowed = await validateRole(result.user);

          if (allowed) redirectToDashboard();

          localStorage.removeItem("email");
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
          loading: "Sending email link...",
          success: `Login link sent to ${email}`,
          error: "Failed to send link",
        },
      );

      localStorage.setItem("email", email);
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
        },
      );

      const allowed = await validateRole(result.user);

      if (allowed) redirectToDashboard();
    } catch (error) {
      console.error("Google Login Error:", error);
    }
  };

  return (
    
      <div
  className="relative min-h-screen flex flex-col items-center px-4 pt-16 overflow-hidden"
  style={{
    background:
      "radial-gradient(ellipse at 30% 40%, rgba(126, 87, 194, 0.4) 0%, transparent 60%), radial-gradient(ellipse at 80% 70%, rgba(30, 136, 229, 0.25) 0%, transparent 55%), #0d1321",
  }}
>
        <div className="text-center mt-16 mb-10">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-500/20 p-4 rounded-full border">
              <span className="text-3xl">🏢</span>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-500 text-transparent bg-clip-text">
            Enerlytics Tenant Portal
          </h1>

          <p className="text-gray-300 mt-3">
            Securely access your tenant dashboard and manage your IoT devices
            and data.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md">
          <h2 className="text-lg font-semibold text-center mb-6">
            Tenant Account Access
          </h2>

          <form onSubmit={handleEmailSubmit} className="grid gap-5">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-3 border rounded-lg"
              required
            />

            <button className="p-3 bg-blue-600 text-white rounded-full">
              Send Login Link
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="text-gray-500 text-sm">or</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="flex justify-center items-center gap-2 p-3 border rounded-full"
            >
              <FcGoogle size={25} /> Continue with Google
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-600">
            System administrator?{" "}
            <a
              href="/adminlogin"
              className="text-blue-600 font-semibold hover:underline"
            >
              Go to Admin Console
            </a>
          </p>
        </div>
    </div>
  );
};

export default Auth;
