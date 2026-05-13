import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Line } from "react-chartjs-2";
import { FaArrowLeft, FaInfoCircle } from "react-icons/fa";
import { getSensorData } from "../api/tenantApi";

import GaugeComponent from "react-gauge-component";

import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip,
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip,
);

/* MODERN GAUGE CARD UI */
const GaugeCard = ({ label, value, max }) => {
  const safeVal = (() => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.min(Math.max(n, 0), max) : 0;
  })();

  return (
    <div className="bg-white p-5 rounded-2xl shadow-lg flex flex-col items-center relative hover:shadow-xl transition">
      {/* Info icon (optional future use) */}
      <button className="absolute top-3 right-3 bg-gray-100 hover:bg-gray-200 p-2 rounded-full">
        <FaInfoCircle className="text-gray-600" />
      </button>

      <h3 className="text-lg font-semibold text-blue-700 mb-2">{label}</h3>

      <GaugeComponent
        value={safeVal}
        minValue={0}
        maxValue={Number(max)}
        type="semicircle"
        arc={{
          subArcs: [
            { limit: max * 0.6, color: "#16a34a" }, // green
            { limit: max * 0.85, color: "#facc15" }, // yellow
            { limit: max, color: "#dc2626" }, // red
          ],
          width: 0.25,
        }}
        pointer={{
          color: "#111",
          length: 0.7,
        }}
        labels={{
          valueLabel: {
            formatTextValue: (v) => {
              const num = Number(v) || safeVal;
              return num >= 1000 ? num.toFixed(0) : num.toFixed(2);
            },
            style: {
              fontSize: "1.2rem",
              fill: "#374151",
            },
          },
        }}
        style={{ width: "100%", height: "180px" }}
      />
    </div>
  );
};

const DevicesPage = () => {
  const { mac } = useParams();
  const navigate = useNavigate();
  const [deviceType, setDeviceType] = useState("pzem");

  const [sensorData, setSensorData] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const data = await getSensorData(deviceType, mac);
      setSensorData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [mac, deviceType]);

  const latest = sensorData[sensorData.length - 1];

  return (
    <div className="min-h-screen p-6 bg-blue-100">
      {/* HEADER */}
      <div className="flex items-center justify-between bg-blue-600 text-white p-5 rounded-xl shadow mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-800 hover:bg-blue-700 p-2 rounded-lg cursor-pointer"
          >
            <FaArrowLeft />
          </button>

          <h1 className="text-xl font-bold">Device Dashboard</h1>
        </div>
      </div>

      {/* DEVICE INFO */}
      <div className="bg-white p-6 rounded-xl shadow mb-6 border border-blue-200 flex justify-start gap-2 items-center">
        <h2 className="text-lg font-semibold text-blue-700 mb-1">
          MAC Address
        </h2>{" "}
        :<p className="text-gray-700">{mac}</p>
      </div>
      {/* DEVICE TYPE SWITCH */}
      <div className="flex justify-center mb-8">
        <div className="bg-white p-2 rounded-full shadow-lg flex items-center gap-2 border border-blue-200">
          <button
            onClick={() => setDeviceType("pzem")}
            className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 cursor-pointer ${
              deviceType === "pzem"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            PZEM
          </button>

          <button
            onClick={() => setDeviceType("aqi")}
            className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 cursor-pointer ${
              deviceType === "aqi"
                ? "bg-green-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Water Level / AQI
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-600">Loading sensor data...</p>
      ) : (
        <>
          {/* PZEM GAUGES */}
          {deviceType === "pzem" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <GaugeCard
                label={`Voltage (${latest?.voltage ?? 0} V)`}
                value={latest?.voltage}
                max={260}
              />

              <GaugeCard
                label={`Current (${latest?.current ?? 0} A)`}
                value={latest?.current}
                max={10}
              />

              <GaugeCard
                label={`Power (${latest?.power ?? 0} W)`}
                value={latest?.power}
                max={2000}
              />
            </div>
          )}

          {/* AQI GAUGES */}
          {deviceType === "aqi" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GaugeCard
                label={`PM10 (${latest?.pm10 ?? 0})`}
                value={latest?.pm10}
                max={500}
              />

              <GaugeCard
                label={`PM2.5 (${latest?.pm25 ?? 0})`}
                value={latest?.pm25}
                max={500}
              />
            </div>
          )}

          {/* CHART */}
          <div className="bg-white p-6 rounded-xl shadow-md mt-10 border border-blue-200">
            <h3 className="text-lg font-semibold mb-4 text-blue-700">
              Sensor Trends
            </h3>

            <Line
              data={{
                labels: sensorData.map((d) =>
                  new Date(d.timestamp).toLocaleTimeString(),
                ),

                datasets:
                  deviceType === "pzem"
                    ? [
                        {
                          label: "Voltage",
                          data: sensorData.map((d) => d.voltage),
                          borderColor: "#2563eb",
                          tension: 0.4,
                        },
                        {
                          label: "Current",
                          data: sensorData.map((d) => d.current),
                          borderColor: "#16a34a",
                          tension: 0.4,
                        },
                        {
                          label: "Power",
                          data: sensorData.map((d) => d.power),
                          borderColor: "#dc2626",
                          tension: 0.4,
                        },
                      ]
                    : [
                        {
                          label: "PM10",
                          data: sensorData.map((d) => d.pm10),
                          borderColor: "#2563eb",
                          tension: 0.4,
                        },
                        {
                          label: "PM2.5",
                          data: sensorData.map((d) => d.pm25),
                          borderColor: "#16a34a",
                          tension: 0.4,
                        },
                      ],
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default DevicesPage;
