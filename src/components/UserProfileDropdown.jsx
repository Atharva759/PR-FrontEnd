import { useEffect, useRef, useState } from "react";

import { User, Mail, ShieldCheck, LogOut, ChevronDown } from "lucide-react";

import { getAuth, signOut } from "firebase/auth";

const UserProfileDropdown = () => {
  const auth = getAuth();

  const user = auth.currentUser;

  const [open, setOpen] = useState(false);

  const dropdownRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);

      window.location.href = "/";
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative z-[99999]" ref={dropdownRef}>
      {/* PROFILE BUTTON */}

      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 bg-white/10 hover:bg-white/20 transition-all px-3 py-2 rounded-2xl cursor-pointer backdrop-blur-md border border-white/10"
      >
        {/* IMAGE */}

        {user?.photoURL ? (
          <img
            src={user.photoURL}
            alt="user"
            className="w-11 h-11 rounded-full border-2 border-white object-cover"
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white">
            <User size={20} />
          </div>
        )}

        {/* USER INFO */}

        <div className="hidden sm:flex flex-col items-start">
          <p className="text-sm font-semibold text-white max-w-[140px] truncate">
            {user?.displayName || "Admin User"}
          </p>
        </div>

        <ChevronDown
          size={18}
          className={`text-white transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* DROPDOWN */}

      {open && (
        <div className="absolute right-0 mt-4 w-[360px] bg-white rounded-3xl shadow-2xl border border-blue-100 overflow-hidden z-[99999]">
          {/* TOP */}

          <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-6 text-white">
            <div className="flex items-center gap-4">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="profile"
                  className="w-16 h-16 rounded-full border-4 border-white object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                  <User size={28} />
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold">
                  {user?.displayName || "Admin User"}
                </h3>
              </div>
            </div>
          </div>

          {/* DETAILS */}

          <div className="p-5 space-y-4">
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Mail size={18} className="text-blue-600" />
              </div>

              <div>
                <p className="text-xs text-slate-500 font-medium">Email</p>

                <p className="text-sm font-semibold text-slate-700 break-all">
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="bg-cyan-50 border border-cyan-100 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center">
                <ShieldCheck size={18} className="text-cyan-600" />
              </div>

              <div>
                <p className="text-xs text-slate-500 font-medium">
                  Authentication Provider
                </p>

                <p className="text-sm font-semibold text-slate-700">
                  Google Sign-In
                </p>
              </div>
            </div>

            {/* LOGOUT */}

            <button
              onClick={handleLogout}
              className="w-full mt-2 bg-red-500 hover:bg-red-600 text-white py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;
