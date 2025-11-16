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
import {
  doc,
  serverTimestamp,
  runTransaction,
} from "firebase/firestore";
import { FcGoogle } from "react-icons/fc";
import { toast } from "react-hot-toast";

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
          provider
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
            }
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
        }
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
      const result = await toast.promise(signInWithPopup(auth, googleProvider), {
        loading: "Signing in with Google...",
        success: "Google sign-in successful!",
        error: "Google sign-in failed",
      });

      const user = result.user;

      await createUserWithUniqueEmail(
        user,
        user.displayName || "Google User",
        "google"
      );

      redirectToDashboard();
    } catch (error) {
      console.error("Google Login Error:", error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-200 via-blue-400 to-blue-600">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-96 border border-blue-100">
        <div className="flex mb-8 gap-4 bg-blue-200 rounded-full p-1">
          <button
            onClick={() => setIsSignup(true)}
            className={`text-lg font-semibold px-6 py-2 w-1/2 rounded-full transition-all duration-300 cursor-pointer ${
              isSignup ? "bg-blue-600 text-white shadow-md" : "text-blue-600"
            }`}
          >
            Sign Up
          </button>
          <button
            onClick={() => setIsSignup(false)}
            className={`text-lg font-semibold px-6 py-2 w-1/2 rounded-full transition-all duration-300 cursor-pointer ${
              !isSignup ? "bg-blue-600 text-white shadow-md" : "text-blue-600"
            }`}
          >
            Login
          </button>
        </div>

        <form onSubmit={handleEmailSubmit} className="grid gap-5">
          {isSignup && (
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="p-3 border-2 border-blue-200 rounded-lg bg-white"
              required
            />
          )}
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 border-2 border-blue-200 rounded-lg bg-white"
            required
          />
          <button
            type="submit"
            className="p-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 active:bg-blue-800 cursor-pointer"
          >
            {isSignup ? "Send Sign-Up Link" : "Send Login Link"}
          </button>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex justify-center items-center gap-2 p-3 font-semibold rounded-full border border-blue-300 hover:bg-blue-100 cursor-pointer"
          >
            <FcGoogle size={25} /> Continue with Google
          </button>
        </form>

        <p className="text-center mt-6 text-sm">
          Are you an admin?{" "}
          <a
            href="/adminlogin"
            className="text-blue-600 font-semibold hover:underline"
          >
            Go to Admin Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default Auth;
