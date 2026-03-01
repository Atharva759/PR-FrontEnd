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
import { getDoc, doc } from "firebase/firestore";
import { FcGoogle } from "react-icons/fc";
import { toast } from "react-hot-toast";
import heroimage from '../assets/heroimage.png';

const actionCodeSettings = {
  url: window.location.origin + "/adminlogin", 
  handleCodeInApp: true,
};

const googleProvider = new GoogleAuthProvider();

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const redirectIfAdmin = async (user) => {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      const role = userDoc.data().role;
      if (role === "admin") {
        toast.success("Welcome Admin!");
        navigate("/admindashboard");
      } else {
        toast.error("Access denied. You are not an admin.");
        await auth.signOut();
      }
    } else {
      toast.error("No account found. Contact system administrator.");
      await auth.signOut();
    }
  };

  useEffect(() => {
    const handleEmailLinkSignIn = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        const emailForSignIn = window.localStorage.getItem("adminEmail");
        try {
          const result = await toast.promise(
            signInWithEmailLink(auth, emailForSignIn, window.location.href),
            {
              loading: "Signing you in...",
              success: "Signed in successfully!",
              error: (err) => `Sign-in failed: ${err.message}`,
            }
          );

          await redirectIfAdmin(result.user);
        } catch (error) {
          console.error("Admin email sign-in error:", error);
        }
      }
    };

    handleEmailLinkSignIn();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        redirectIfAdmin(user);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    try {
      await toast.promise(
        sendSignInLinkToEmail(auth, email, actionCodeSettings),
        {
          loading: "Sending admin login link...",
          success: `Check your inbox! A login link was sent to ${email}.`,
          error: (err) => `Failed to send link: ${err.message}`,
        }
      );
      window.localStorage.setItem("adminEmail", email);
      setEmail("");
    } catch (error) {
      console.error("Admin login link error:", error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await toast.promise(signInWithPopup(auth, googleProvider), {
        loading: "Signing in with Google...",
        success: "Logged in with Google!",
        error: (err) => `Google sign-in failed: ${err.message}`,
      });

      await redirectIfAdmin(result.user);
    } catch (error) {
      console.error("Google admin login error:", error);
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
  {/* Dark Overlay */}
  <div className="absolute inset-0 bg-slate-900/70 -z-10"></div>

  {/* Hero Heading */}
  <div className="text-center mt-16 mb-10 relative z-10 bg-slate-600 rounded-xl p-3">
    <h1 className=" px-4 py-2 rounded-lg bg-slate-800/70 text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-2">
      System Administrator Login
    </h1>
    <p className=" px-3 py-1 rounded-md  text-gray-200 text-lg md:text-xl">
      Access full platform controls and manage all tenants securely.
    </p>
  </div>

  {/* Admin Login Card */}
  <div className="relative z-10 bg-slate-900/80 backdrop-blur-lg p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/20">
    <form onSubmit={handleEmailSubmit} className="grid gap-5">
      <input
        type="email"
        placeholder="Enter admin email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="p-3 border border-white/30 rounded-lg bg-slate-800/70 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        required
      />
      <button
        type="submit"
        className="p-3 bg-gradient-to-r from-blue-500 to-emerald-500 text-white font-semibold rounded-full shadow-lg hover:scale-105 transition transform cursor-pointer"
      >
        Send Admin Login Link
      </button>

      <button
        type="button"
        onClick={handleGoogleLogin}
        className="flex justify-center items-center gap-2 p-3 font-semibold rounded-full border border-white/30 text-white hover:bg-white/10 transition cursor-pointer"
      >
        <FcGoogle size={25} /> Continue with Google
      </button>
    </form>
  </div>
</div>
);
};

export default AdminLogin;
