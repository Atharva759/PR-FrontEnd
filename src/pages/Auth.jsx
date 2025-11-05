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
import { getDoc, setDoc, doc, runTransaction } from "firebase/firestore";
import { FcGoogle } from "react-icons/fc";
import { toast } from "react-hot-toast";

const actionCodeSettings = {
  url: window.location.origin + "/auth",
  handleCodeInApp: true,
};

const googleProvider = new GoogleAuthProvider();

const Auth = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const redirectToDashboard = () => {
    navigate("/dashboard");
  };

  
  const createUserWithUniqueEmail = async (user, displayName, provider = "email") => {
    const emailDocRef = doc(db, "emails", user.email); 
    const userDocRef = doc(db, "users", user.uid);

    await runTransaction(db, async (transaction) => {
      const emailDoc = await transaction.get(emailDocRef);
      const userDoc = await transaction.get(userDocRef);

     
      if (!emailDoc.exists()) {
        transaction.set(emailDocRef, { uid: user.uid });
      }

      if (!userDoc.exists()) {
        
        transaction.set(userDocRef, {
          name: displayName || user.displayName || "User",
          email: user.email,
          role: "employee", 
          provider: provider,
          createdAt: new Date(),
        });
      } else {
        
        const existingData = userDoc.data();
        if (!existingData.provider) {
          transaction.update(userDocRef, { provider });
        }
      }
    });
  };

  
  useEffect(() => {
    const handleEmailLinkSignIn = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        const emailForSignIn = window.localStorage.getItem("email");
        try {
          const result = await toast.promise(
            signInWithEmailLink(auth, emailForSignIn, window.location.href),
            {
              loading: "Signing you in...",
              success: "Signed in successfully!",
              error: (err) => `Sign-in failed: ${err.message}`,
            }
          );

          const user = result.user;
          const signupName = name || "User";

          try {
            await createUserWithUniqueEmail(user, signupName, "email");
          } catch (error) {
            console.log("Duplicate email detected:", error.message);
          }
          redirectToDashboard();
        } catch (error) {
          console.error("Email sign-in error:", error);
        }
      }
    };
  
    handleEmailLinkSignIn();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          redirectToDashboard();
        }
      }
    });

    return () => unsubscribe();
  }, [navigate, name]);

  
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
          loading: "Sending Email link...",
          success: `Check your inbox! A sign-in link was sent to ${email}.`,
          error: (err) => `Failed to send link: ${err.message}`,
        }
      );
      window.localStorage.setItem("email", email);
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

      try {
        await createUserWithUniqueEmail(user, user.displayName || "Google User", "google");
      } catch (error) {
        console.log("Duplicate email detected:", error.message);
      }

      redirectToDashboard();
    } catch (error) {
      console.error("Google login error:", error);
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
