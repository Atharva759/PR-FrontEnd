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
    <div className="flex justify-center items-center min-h-screen ">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-96 border border-red-100">
        <h2 className="text-2xl font-bold text-center text-red-600 mb-6">
          Admin Login
        </h2>

        <form onSubmit={handleEmailSubmit} className="grid gap-5">
          <input
            type="email"
            placeholder="Enter admin email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 border-2 border-red-200 rounded-lg bg-white"
            required
          />
          <button
            type="submit"
            className="p-3 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 active:bg-red-800 cursor-pointer"
          >
            Send Admin Login Link
          </button>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex justify-center items-center gap-2 p-3 font-semibold rounded-full border border-red-300 hover:bg-red-100 cursor-pointer"
          >
            <FcGoogle size={25} /> Continue with Google
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
