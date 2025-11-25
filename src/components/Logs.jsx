import { useEffect, useState } from "react";
const Logs = () => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchLogs();

    const interval = setInterval(() => {
      fetchLogs();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const fetchLogs = async () => {
    try {
      const data = await fetch(`${BACKEND_URL}/logs`).then((res) => res.json());
      setLogs(data);
    } catch (err) {
      console.error("Error fetching logs", err);
    }
  };

  return (
    <div className="p-6 bg-gray-50 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 sticky">Server Logs</h2>

      <ul className="space-y-2">
        {logs.map((log, index) => (
          <li
            key={index}
            className="flex items-center gap-4 p-3 bg-white rounded-lg shadow-sm border border-gray-100"
          >
            <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
              {new Date(log.time).toLocaleString()}
            </span>

            <span className="text-gray-700 text-sm truncate">
              {log.message}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Logs;
