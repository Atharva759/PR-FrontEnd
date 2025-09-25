import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../../firebase"; 

const Logs = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    
    const attendanceRef = collection(db, "attendance");

    
    const q = query(attendanceRef, orderBy("timestamp", "desc"));

    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setLogs(logData);
    });

    return () => unsubscribe(); 
  }, []);

  return (
    <div>
      <h2>Attendance Logs</h2>
      <ul>
        {logs.map((log) => (
          <li key={log.id}>
            <strong>{log.user}</strong> - {log.status} <br />
            <small>
              {log.timestamp
                ? new Date(log.timestamp.seconds * 1000).toLocaleString()
                : "No timestamp"}
            </small>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Logs;
