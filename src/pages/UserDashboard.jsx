import { TbLogout } from "react-icons/tb";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, database, set, ref, onValue } from "../../firebase";
import toast from "react-hot-toast";
import Switch from "@mui/joy/Switch";
import { useState, useEffect } from "react";
import { FaLock,FaLockOpen } from "react-icons/fa6";


const UserDashboard = () => {
  const navigate = useNavigate();

  const [isLock, setIsLock] = useState(true);

  useEffect(() => {
    const lockRef = ref(database, "isLock");

    const unsubscribe = onValue(lockRef, (snapshot) => {
      const val = snapshot.val();
      if (typeof val === "boolean") {
        setIsLock(val);
      } else {
        console.warn("Expected boolean, got:", val);
      }
    });

    return () => unsubscribe();
  }, []);

  const toggleLock = () => {
    const newState = !isLock;
    set(ref(database, "isLock"), newState);
    toast.success('Door will autoclose in 5s.')
    setTimeout(()=>{
      set(ref(database, "isLock"), isLock);
      toast.error('Door Closed.')
    },5000);
  };

  const logout = async () => {
    toast.promise(signOut(auth), {
      loading: "Logging out...",
      success: () => {
        navigate("/");
        return <p>Logged out successfully!</p>;
      },
      error: (err) => <b>Logout failed: {err.message}</b>,
    });
  };

  

return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
   
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 m-6 p-4 bg-blue-600 text-white rounded-xl shadow-md">
      <h2 className="font-bold text-2xl tracking-wide text-center sm:text-left">
        Smart Dashboard
      </h2>
      <Link
        onClick={logout}
        to="/"
        className="flex justify-center items-center gap-2 px-4 py-2 bg-blue-900 hover:bg-blue-800 transition-all rounded-md font-medium cursor-pointer shadow-md"
      >
        <TbLogout size={22} /> Logout
      </Link>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 m-6">
      
      <div className="border-2 rounded-lg bg-blue-50 p-4 w-full sm:w-auto h-max text-center shadow-md">
        <h3 className="font-semibold text-lg text-blue-700">Door Lock</h3>
        {isLock === null ? (
          <p className="text-gray-600 mt-2">Loading status...</p>
        ) : (
          <>
            <p className="text-gray-700 font-medium text-xl mt-2 flex justify-center items-center gap-2">
              {isLock ? <><FaLock className="text-red-500" /> Locked</> : <><FaLockOpen className="text-green-500" /> Unlocked </>}
            </p>
            <Switch
              checked={!isLock}
              onChange={toggleLock}
              size="lg"
              variant="solid"
              className="mt-2"
              
            />
            <p className="text-sm text-gray-500 mt-1">
              Toggle to {isLock ? "Unlock" : "Lock"}
            </p>
          </>
        )}
      </div>
    </div>
  </div>
);

};

export default UserDashboard;
