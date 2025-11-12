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

const WS_URL = import.meta.env.VITE_WS_URL;

const SensorDashboard = () => {
  const { deviceId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const device = location.state?.device;

  const [sensorData, setSensorData] = useState({});
  const [wsStatus, setWsStatus] = useState("connecting");
  const wsRef = useRef(null);
  const dataRef = useRef({});
  const reconnectTimer = useRef(null);

  const connectWebSocket = () => {
    if (wsRef.current) wsRef.current.close();

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
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

            // Keep last 60 entries
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
      setWsStatus("disconnected");
      if (!reconnectTimer.current) {
        reconnectTimer.current = setTimeout(() => connectWebSocket(), 5000);
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
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
    <div className="min-h-screen bg-blue-200 p-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-blue-600 text-white rounded-xl shadow-md p-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800 transition-all px-3 py-2 rounded-lg shadow-md cursor-pointer"
          >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div>
              <h2 className="font-bold text-3xl tracking-wide">
                {device?.name || "ESP8266 Dashboard"}
              </h2>
              <p className="text-sm text-blue-100 mt-1">Device ID: {deviceId}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-blue-900 px-4 py-2 rounded-lg shadow">
            <Wifi
              className={`w-5 h-5 ${
                wsStatus === "connected" ? "text-green-400" : "text-red-400"
              }`}
            />
            <span className="text-sm capitalize">{wsStatus}</span>
          </div>
        </div>

        {/* Charts */}
        <div className="bg-white rounded-2xl shadow-lg p-6 min-h-[550px]">
          {sensors.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p>No sensor data yet — waiting for heartbeat...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sensors.map((sensorId) => (
                <div
                  key={sensorId}
                  className="bg-blue-50 border border-blue-100 p-5 rounded-xl shadow-sm"
                >
                  <h2 className="text-lg font-semibold mb-3 text-blue-700 capitalize">
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
    </div>
  );
};

export default SensorDashboard;
