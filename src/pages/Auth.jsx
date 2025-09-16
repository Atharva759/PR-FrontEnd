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
import { toast } from "react-hot-toast";


const googleProvider = new GoogleAuthProvider();

const Auth = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const handleEmailLinkSignIn = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        let emailForSignIn =
          window.localStorage.getItem("emailForSignIn") ||
          window.prompt("Please provide your email:");

        try {
          const result = await toast.promise(
            signInWithEmailLink(auth, emailForSignIn, window.location.href),
            {
              loading: "Signing you in...",
              success: "Signed in successfully!",
              error: (err) => `Sign-in failed: ${err.message}`,
            }
          );

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
            toast.success(`Welcome, ${signupName}! Your account has been created.`);
          } else {
            toast.success(`Welcome back, ${userDoc.data().name || user.email}!`);
          }

          navigate("/dashboard");
        } catch (error) {
          console.error("Email sign-in error:", error);
        }
      }
    };

    handleEmailLinkSignIn();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) navigate("/dashboard");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  
  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    if (isSignup && !name.trim()) {
      toast.error("Please enter your name.");
      return;
    }

    try {
      if (isSignup) {
        localStorage.setItem("signupName", name.trim());
      }

      await toast.promise(
        sendSignInLinkToEmail(auth, email, actionCodeSettings),
        {
          loading: "Sending magic link...",
          success: `Check your inbox! A sign-in link was sent to ${email}.`,
          error: (err) => `Failed to send link: ${err.message}`,
        }
      );

      localStorage.setItem("emailForSignIn", email);
      setEmail("");
      setName("");
    } catch (error) {
      console.error("Email link error:", error);
    }
  };

  
  const handleGoogleLogin = async () => {
    try {
      const result = await toast.promise(signInWithPopup(auth, googleProvider), {
        loading: "Signing in with Google...",
        success: "Logged in with Google!",
        error: (err) => `Google sign-in failed: ${err.message}`,
      });

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

      navigate("/dashboard");
    } catch (error) {
      console.error("Google login error:", error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-200 via-blue-400 to-blue-900">
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
            className="p-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 active:bg-blue-800 cursor-pointer"
          >
            {isSignup ? "Send Sign-Up Link" : "Send Login Link"}
          </button>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex justify-center items-center gap-2 p-3 font-semibold rounded-lg border border-blue-300 hover:bg-blue-100 cursor-pointer"
          >
            <FcGoogle size={25} /> Continue with Google
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;
