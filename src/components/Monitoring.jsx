import { useState, useEffect } from "react";
import { db, database, storage } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";
import { ref as dbRef, onValue } from "firebase/database";
import { ref as storageRef, listAll, getMetadata } from "firebase/storage";
import toast from "react-hot-toast";

const Monitoring = ({ frontendUrl }) => {
  const [userCount, setUserCount] = useState(0);
  const [realtimeConnections, setRealtimeConnections] = useState(0);
  const [storageUsage, setStorageUsage] = useState();
  const [frontendStatus, setFrontendStatus] = useState("Checking...");

 
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        setUserCount(usersSnap.size);
      } catch (err) {
        console.error("Error fetching users:", err);
        toast.error("Failed to fetch users count");
      }
    };
    fetchUsers();
  }, []);

  
  useEffect(() => {
    const connectionsRef = dbRef(database, ".info/connected");

    const unsubscribe = onValue(connectionsRef, (snapshot) => {
      setRealtimeConnections(snapshot.val() ? 1 : 0);
    });

    return () => unsubscribe();
  }, []);

  
  useEffect(() => {
    const checkURL = async () => {
      try {
        const res = await fetch(frontendUrl, { method: "HEAD" });
        setFrontendStatus(res.ok ? "Up ✅" : `Down ❌ (${res.status})`);
      } catch (err) {
        setFrontendStatus("Down ❌");
      }
    };

    checkURL();
    const interval = setInterval(checkURL, 24*60*60000); 
    return () => clearInterval(interval);
  }, [frontendUrl]);

  
  useEffect(() => {
    const fetchStorageUsage = async () => {
      try {
        const rootRef = storageRef(storage, "/");
        const list = await listAll(rootRef);

        let totalBytes = 0;
        for (const itemRef of list.items) {
          const meta = await getMetadata(itemRef);
          totalBytes += meta.size || 0;
        }

        const sizeMB = (totalBytes / (1024 * 1024)).toFixed(2);
        setStorageUsage(`${sizeMB} MB`);
      } catch (err) {
        console.warn("Storage usage not available via client SDK:", err);
        setStorageUsage("Not available");
      }
    };

    fetchStorageUsage();
  }, []);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">System Monitoring</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
       
        <div className="bg-white p-6 shadow-md rounded-xl text-center">
          <h3 className="font-semibold text-lg">Firestore Users</h3>
          <p className="text-3xl font-bold mt-2">{userCount}</p>
        </div>

  
        <div className="bg-white p-6 shadow-md rounded-xl text-center">
          <h3 className="font-semibold text-lg">Realtime DB Connection</h3>
          <p className="text-3xl font-bold mt-2">{realtimeConnections}</p>
        </div>

        
        <div className="bg-white p-6 shadow-md rounded-xl text-center">
          <h3 className="font-semibold text-lg">Storage Usage</h3>
          <p className="text-2xl font-bold mt-2">{storageUsage || '-'}</p>
        </div>

        
        <div className="bg-white p-6 shadow-md rounded-xl text-center">
          <h3 className="font-semibold text-lg">Front-End Status</h3>
          <p className="text-2xl font-bold mt-2">{frontendStatus}</p>
        </div>
      </div>
    </div>
  );
};

export default Monitoring;
