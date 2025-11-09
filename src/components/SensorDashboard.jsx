import React, { useState, useEffect, useRef } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ArrowLeft, Wifi } from "lucide-react";

const WS_URL = "wss://pr-test-quit.onrender.com/ws/devices";

const SensorDashboard = () => {
  const { deviceId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const device = location.state?.device;

  const [sensorData, setSensorData] = useState({});
  const [wsStatus, setWsStatus] = useState("connecting");
  const wsRef = useRef(null);
  const dataRef = useRef({}); // stores persistent sensor data
  const reconnectTimer = useRef(null);

  // Function to initialize WebSocket
  const connectWebSocket = () => {
    if (wsRef.current) wsRef.current.close();

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("✅ WebSocket connected");
      setWsStatus("connected");
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
        reconnectTimer.current = null;
      }
    };

    ws.onmessage = (event) => {
    try {
        const data = JSON.parse(event.data);

        if (
        data.type === "heartbeat" &&
        data.deviceId.toLowerCase() === deviceId.toLowerCase()
        ) {
        const timestamp = new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });

        const updatedData = { ...dataRef.current };

        data.sensors.forEach((sensor) => {
            if (sensor.status !== "active") return;
            const sensorId = sensor.id;
            const fields = sensor.data;

            const numericFields = Object.fromEntries(
            Object.entries(fields)
                .filter(([_, v]) => !isNaN(v))
                .map(([k, v]) => [k, Number(v)])
            );

            const newEntry = { time: timestamp, ...numericFields };
            const oldEntries = updatedData[sensorId]
            ? [...updatedData[sensorId]]
            : [];
            oldEntries.push(newEntry);

            // Keep last 60 entries (5 min window)
            updatedData[sensorId] = oldEntries.slice(-60);
        });

        dataRef.current = updatedData;
        setSensorData({ ...updatedData });
        }
    } catch (err) {
        console.error("Error parsing WebSocket message:", err);
    }
    };

    ws.onclose = () => {
      console.log("🔴 WebSocket disconnected");
      setWsStatus("disconnected");

      // Try reconnecting after 5 seconds
      if (!reconnectTimer.current) {
        reconnectTimer.current = setTimeout(() => {
          console.log("♻️ Reconnecting WebSocket...");
          connectWebSocket();
        }, 5000);
      }
    };

    ws.onerror = (err) => {
      console.error("⚠️ WebSocket error:", err);
      ws.close();
    };
  };

  useEffect(() => {
    if (!device) {
      navigate("/");
      return;
    }
    connectWebSocket();
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, [deviceId, navigate]);

  const sensors = Object.keys(sensorData);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex items-center gap-3">
            <ArrowLeft
              className="w-6 h-6 text-gray-700 cursor-pointer"
              onClick={() => navigate("/")}
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {device?.name || "ESP32 Dashboard"}
              </h1>
              <p className="text-gray-600 text-sm">Device ID: {deviceId}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Wifi
              className={`w-5 h-5 ${
                wsStatus === "connected" ? "text-green-500" : "text-red-500"
              }`}
            />
            <span className="text-sm">{wsStatus}</span>
          </div>
        </div>

        {/* Charts */}
        {sensors.length === 0 ? (
          <div className="text-center py-10 text-gray-500 bg-white rounded-lg shadow-sm">
            <p>No sensor data yet — waiting for heartbeat...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sensors.map((sensorId) => (
              <div key={sensorId} className="bg-white p-4 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold mb-3 capitalize">
                  {sensorId}
                </h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sensorData[sensorId]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {Object.keys(sensorData[sensorId][0] || {})
                        .filter((k) => k !== "time")
                        .map((field, idx) => (
                          <Line
                            key={field}
                            type="monotone"
                            dataKey={field}
                            stroke={
                              [
                                "#2563eb",
                                "#dc2626",
                                "#16a34a",
                                "#d97706",
                                "#7c3aed",
                              ][idx % 5]
                            }
                            dot={false}
                            strokeWidth={2}
                            isAnimationActive={false}
                          />
                        ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SensorDashboard;
