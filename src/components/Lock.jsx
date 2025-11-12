import { useState, useEffect } from "react";
import { database, ref, onValue, set } from "../../firebase";
import { Switch } from "@mui/joy";
import { FaLock, FaLockOpen } from "react-icons/fa6";
import toast from "react-hot-toast";

const Lock = () => {
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
    toast.success("Door will autoclose in 5s.");

    setTimeout(() => {
      set(ref(database, "isLock"), isLock);
      toast.error("Door Closed.");
    }, 5000);
  };

  return (
    <div className="border-2 rounded-lg bg-blue-50 p-4 w-full sm:w-auto h-max text-center shadow-md">
      <h3 className="font-semibold text-lg text-blue-700">Door Lock</h3>
      {isLock === null ? (
        <p className="text-gray-600 mt-2">Loading status...</p>
      ) : (
        <>
          <p className="text-gray-700 font-medium text-xl mt-2 flex justify-center items-center gap-2">
            {isLock ? (
              <>
                <FaLock className="text-red-500" /> Locked
              </>
            ) : (
              <>
                <FaLockOpen className="text-green-500" /> Unlocked
              </>
            )}
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
  );
};

export default Lock;
