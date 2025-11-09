import React, { useState, useEffect, useRef } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer } from "recharts";
import { ArrowLeft, Wifi } from "lucide-react";

const WS_URL = "wss://pr-test-quit.onrender.com/ws/devices";

const SensorDashboard = () => {
  const { deviceId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const device = location.state?.device;

  const [sensorData, setSensorData] = useState([]);
  const [wsStatus, setWsStatus] = useState("connecting");
  const dataRef = useRef([]);

  useEffect(() => {
    if (!device) {
      navigate("/");
      return;
    }

    const ws = new WebSocket(WS_URL);
    ws.onopen = () => {
      setWsStatus("connected");
      console.log("WebSocket connected for dashboard");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "device_heartbeat" && data.deviceId === deviceId) {
          // Extract and format sensor values
          const entry = {
            time: new Date(data.timestamp).toLocaleTimeString(),
            ...data.summary,
          };

          dataRef.current = [...dataRef.current, entry].slice(-50); // Keep last 50 points
          setSensorData([...dataRef.current]);
        }
      } catch (err) {
        console.error("Error parsing WS message:", err);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
      setWsStatus("disconnected");
    };

    return () => ws.close();
  }, [deviceId]);

  const enabledSensors = device?.capabilities?.filter((cap) => cap.enabled);

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
                {device.name || "ESP32 Device Dashboard"}
              </h1>
              <p className="text-gray-600 text-sm">
                Device ID: {device.deviceId}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Wifi className={`w-5 h-5 ${wsStatus === "connected" ? "text-green-500" : "text-red-500"}`} />
            <span className="text-sm">{wsStatus}</span>
          </div>
        </div>

        {/* Charts Section */}
        {enabledSensors?.length === 0 ? (
          <div className="text-center py-10 text-gray-500 bg-white rounded-lg shadow-sm">
            <p>No sensors enabled on this device.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {enabledSensors.map((sensor) => (
              <div key={sensor.id} className="bg-white p-4 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold mb-3">{sensor.label}</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sensorData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {/* Draw a line for this specific sensor data */}
                      <Line
                        type="monotone"
                        dataKey={sensor.id}
                        stroke="#2563eb"
                        dot={false}
                        isAnimationActive={false}
                      />
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
