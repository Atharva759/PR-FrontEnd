import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase";
import {
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { getDoc, setDoc, doc } from "firebase/firestore";
import { FcGoogle } from "react-icons/fc";

const actionCodeSettings = {
  url: window.location.origin + "/login",
  handleCodeInApp: true,
};

const googleProvider = new GoogleAuthProvider();

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Handle Email Link Sign-in Flow
  useEffect(() => {
    const handleEmailLinkSignIn = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        let emailForSignIn = window.localStorage.getItem("emailForSignIn");

        if (!emailForSignIn) {
          emailForSignIn = window.prompt("Please provide your email:");
        }

        try {
          const result = await signInWithEmailLink(auth, emailForSignIn, window.location.href);
          localStorage.removeItem("emailForSignIn");

          const user = result.user;
          const userRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userRef);

          if (!userDoc.exists()) {
            const signupName = localStorage.getItem("signupName") || "User";
            await setDoc(userRef, {
              name: signupName,
              email: user.email,
              role: "employee",
              provider: "email",
            });
            localStorage.removeItem("signupName");
            alert(`Welcome, ${signupName}! Your account has been created.`);
          } else {
            alert(`Welcome back, ${userDoc.data().name || user.email}!`);
          }

          navigate("/dashboard");
        } catch (error) {
          console.error("Email sign-in error:", error);
          alert("Failed to sign in: " + error.message);
        }
      }
    };

    handleEmailLinkSignIn();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          navigate("/dashboard");
        }
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Handle Email Sign-Up/Login
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignup && !name.trim()) {
        alert("Please enter your name.");
        setLoading(false);
        return;
      }

      if (isSignup) {
        localStorage.setItem("signupName", name.trim());
      }

      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      localStorage.setItem("emailForSignIn", email);

      alert(`Check your inbox! A sign-in link was sent to ${email}.`);
      setEmail("");
      setName("");
    } catch (error) {
      console.error("Email link error:", error);
      alert("Failed to send sign-in link: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-in Flow
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        await setDoc(userRef, {
          name: user.displayName || "Google User",
          email: user.email,
          role: "employee",
          provider: "google",
        });
      }

      alert("Logged in with Google!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Google sign-in error:", error);
      alert("Google sign-in failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-200 via-blue-400 to-blue-900">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-96 border border-blue-100">
        {/* Tabs: Sign Up / Login */}
        <div className="flex mb-8 gap-4 bg-blue-200 rounded-full p-1">
          <button
            onClick={() => setIsSignup(true)}
            className={`text-lg font-semibold px-6 py-2 w-1/2 rounded-full transition-all duration-300 ${
              isSignup ? "bg-blue-600 text-white shadow-md" : "text-blue-600"
            }`}
            disabled={loading}
          >
            Sign Up
          </button>
          <button
            onClick={() => setIsSignup(false)}
            className={`text-lg font-semibold px-6 py-2 w-1/2 rounded-full transition-all duration-300 ${
              !isSignup ? "bg-blue-600 text-white shadow-md" : "text-blue-600"
            }`}
            disabled={loading}
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
              className="p-3 border-2 border-blue-200 rounded-lg bg-white"
              required
              disabled={loading}
            />
          )}
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 border-2 border-blue-200 rounded-lg bg-white"
            required
            disabled={loading}
          />
          <button
            type="submit"
            className="p-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50"
            disabled={loading}
          >
            {isSignup ? "Send Sign-Up Link" : "Send Login Link"}
          </button>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex justify-center items-center gap-2 p-3 font-semibold rounded-lg border border-blue-300 hover:bg-blue-100 disabled:opacity-50"
            disabled={loading}
          >
            <FcGoogle size={25} /> Continue with Google
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
