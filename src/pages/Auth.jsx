import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, googleProvider } from "../../firebase";
import {
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  onAuthStateChanged,
  signInWithPopup,
} from "firebase/auth";
import { doc, serverTimestamp, runTransaction } from "firebase/firestore";
import { FcGoogle } from "react-icons/fc";
import { toast } from "react-hot-toast";
import heroimage from "../assets/heroimage.png";

const actionCodeSettings = {
  url: window.location.origin + "/auth",
  handleCodeInApp: true,
};

const Auth = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const redirectToDashboard = () => navigate("/dashboard");

  /**
   * Create user document with duplicate email check
   */
  const createUserWithUniqueEmail = async (user, displayName, provider) => {
    const emailDocRef = doc(db, "emails", user.email);
    const userDocRef = doc(db, "users", user.uid);

    await runTransaction(db, async (transaction) => {
      const emailDoc = await transaction.get(emailDocRef);
      const userDoc = await transaction.get(userDocRef);

      // Create email doc if not exists
      if (!emailDoc.exists()) {
        transaction.set(emailDocRef, { uid: user.uid });
      }

      // Create user doc if not exists
      if (!userDoc.exists()) {
        transaction.set(userDocRef, {
          name: displayName || "User",
          email: user.email,
          role: "employee",
          provider,
        });
      }
    });
  };

  /**
   * Handle Email Link Login
   */
  useEffect(() => {
    const checkEmailLink = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        const savedEmail = localStorage.getItem("email");
        const savedName = localStorage.getItem("signupName") || "User";

        try {
          const result = await toast.promise(
            signInWithEmailLink(auth, savedEmail, window.location.href),
            {
              loading: "Signing you in...",
              success: "Signed in successfully!",
              error: "Sign-in failed!",
            },
          );

          const user = result.user;

          await createUserWithUniqueEmail(user, savedName, "email");

          localStorage.removeItem("email");
          localStorage.removeItem("signupName");

          redirectToDashboard();
        } catch (error) {
          console.error("Email link login error:", error);
        }
      }
    };

    checkEmailLink();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        redirectToDashboard();
      }
    });

    return () => unsubscribe();
  }, []);

  /**
   * Send Email Link
   */
  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    if (isSignup && !name.trim()) {
      toast.error("Please enter your name.");
      return;
    }

    try {
      await toast.promise(
        sendSignInLinkToEmail(auth, email, actionCodeSettings),
        {
          loading: "Sending email link...",
          success: `Link sent to ${email}`,
          error: "Failed to send link",
        },
      );

      localStorage.setItem("email", email);
      localStorage.setItem("signupName", name);

      setEmail("");
      setName("");
    } catch (error) {
      console.error("Email link send error:", error);
    }
  };

  /**
   * Google Login
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

      const user = result.user;

      await createUserWithUniqueEmail(
        user,
        user.displayName || "Google User",
        "google",
      );

      redirectToDashboard();
    } catch (error) {
      console.error("Google Login Error:", error);
    }
  };

  return (
    <div
  className="relative flex flex-col justify-start items-center min-h-screen px-4 pt-16"
  style={{
    backgroundImage: `url(${heroimage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  }}
>
  {/* Overlay for dark tint */}
  <div className="absolute inset-0 bg-slate-900/70 -z-10"></div>

  {/* Hero Heading */}
  <div className="text-center mt-16 mb-10 relative z-10 bg-slate-700 rounded-xl  p-2">
    <h1 className=" px-4 py-2 rounded-lg text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
      Welcome to Enerlytics Cloud
    </h1>
    <p className=" px-3 py-1 rounded-md text-lg text-white md:text-xl">
      Enter your tenant dashboard and manage your IoT data effortlessly.
    </p>
  </div>


      {/* Login Card */}
      <div className="relative z-10 bg-slate-900/80 backdrop-blur-lg p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/20">
        {/* Toggle SignUp / Login */}
        <div className="flex mb-8 gap-2 bg-white/10 rounded-full p-1">
          <button
            onClick={() => setIsSignup(true)}
            className={`text-lg font-semibold px-6 py-2 w-1/2 rounded-full transition-all duration-300 cursor-pointer ${
              isSignup
                ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg cursor-pointer"
                : "text-white"
            }`}
          >
            Sign Up
          </button>
          <button
            onClick={() => setIsSignup(false)}
            className={`text-lg font-semibold px-6 py-2 w-1/2 rounded-full transition-all duration-300 cursor-pointer ${
              !isSignup
                ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg cursor-pointer"
                : "text-white"
            }`}
          >
            Login
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleEmailSubmit} className="grid gap-5">
          {isSignup && (
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="p-3 border border-white/30 rounded-lg bg-slate-800/70 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
              required
            />
          )}
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 border border-white/30 rounded-lg bg-slate-800/70 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
            required
          />

          <button
            type="submit"
            className="p-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-full shadow-lg hover:scale-105 transition transform cursor-pointer"
          >
            {isSignup ? "Send Sign-Up Link" : "Send Login Link"}
          </button>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex justify-center items-center gap-2 p-3 font-semibold rounded-full border border-white/30 text-white hover:bg-white/10 transition cursor-pointer"
          >
            <FcGoogle size={25} /> Continue with Google
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-300">
          Are you an admin?{" "}
          <a
            href="/adminlogin"
            className="text-cyan-400 font-semibold hover:underline"
          >
            Go to Admin Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default Auth;
