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
  const dataRef = useRef({});

  useEffect(() => {
    if (!device) {
      navigate("/");
      return;
    }

    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log("WebSocket connected to backend");
      setWsStatus("connected");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (
          data.type === "heartbeat" &&
          data.deviceId.toLowerCase() === deviceId.toLowerCase()
        ) {
          const now = new Date();
          const timeLabel = now.toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });

          data.sensors.forEach((sensor) => {
            if (sensor.status !== "active") return;

            const sensorId = sensor.id;
            const numericFields = Object.fromEntries(
              Object.entries(sensor.data || {})
                .filter(([_, v]) => typeof v === "number" && !isNaN(v))
            );

            if (!dataRef.current[sensorId]) dataRef.current[sensorId] = [];

            // Append new data point with timestamp
            dataRef.current[sensorId].push({
              timestamp: now.getTime(), // numeric timestamp
              time: timeLabel, // human-readable label
              ...numericFields,
            });

            // Keep only last ~10 minutes (about 120 samples for 5s intervals)
            dataRef.current[sensorId] = dataRef.current[sensorId].slice(-120);
          });

          setSensorData({ ...dataRef.current });
        }
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    };

    ws.onerror = (err) => console.error("WebSocket error:", err);
    ws.onclose = () => {
      console.log("WebSocket closed");
      setWsStatus("disconnected");
    };

    return () => ws.close();
  }, [deviceId]);

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
            <span className="text-sm capitalize">{wsStatus}</span>
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
                    <LineChart
                      data={sensorData[sensorId]}
                      margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="time"
                        interval="preserveStartEnd"
                        tick={{ fontSize: 10 }}
                      />
                      <YAxis
                        tick={{ fontSize: 10 }}
                        domain={["auto", "auto"]}
                        allowDecimals
                      />
                      <Tooltip
                        formatter={(value, name) => [value, name]}
                        labelFormatter={(label) => `Time: ${label}`}
                      />
                      <Legend />
                      {Object.keys(sensorData[sensorId][0] || {})
                        .filter((k) => !["time", "timestamp"].includes(k))
                        .map((field, idx) => (
                          <Line
                            key={field}
                            type="monotone"
                            dataKey={field}
                            stroke={
                              [
                                "#2563eb", // blue
                                "#dc2626", // red
                                "#16a34a", // green
                                "#d97706", // amber
                                "#7c3aed", // violet
                              ][idx % 5]
                            }
                            strokeWidth={2}
                            dot={false}
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
