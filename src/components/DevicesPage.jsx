import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Line } from "react-chartjs-2";
import { FaArrowLeft } from "react-icons/fa";
import { getSensorData } from "../api/tenantApi";

import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip
);

/* GAUGE CARD */
const GaugeCard = ({ label, value, max }) => {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className="bg-white p-6 rounded-xl shadow text-center">
      <h3 className="text-gray-700 font-semibold mb-3">{label}</h3>

      <div className="w-full bg-gray-200 rounded-full h-4 mb-3">
        <div
          className="bg-blue-600 h-4 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="text-xl font-bold text-gray-800">
        {value ?? 0}
      </p>
    </div>
  );
};

const DevicesPage = () => {
  const { mac } = useParams();
  const navigate = useNavigate();

  const [sensorData, setSensorData] = useState([]);
  const [loading, setLoading] = useState(true);

  /* FETCH SENSOR DATA */

  const loadData = async () => {
    try {
      const data = await getSensorData("pzem", mac);

      if (Array.isArray(data)) {
        setSensorData(data);
      } else {
        setSensorData([]);
      }
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();

    /* AUTO REFRESH EVERY 10s */
    const interval = setInterval(loadData, 10000);

    return () => clearInterval(interval);
  }, [mac]);

  const latest = sensorData[sensorData.length - 1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-10">

      {/* HEADER */}

      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow"
        >
          <FaArrowLeft />
          Back
        </button>

        <h1 className="text-3xl font-bold text-gray-800">
          Device Details
        </h1>
      </div>

      {/* DEVICE INFO */}

      <div className="bg-white p-6 rounded-xl shadow mb-8">
        <h2 className="text-xl font-semibold text-gray-700">
          MAC Address
        </h2>

        <p className="text-gray-600">{mac}</p>
      </div>

      {loading ? (
        <p className="text-gray-600">Loading sensor data...</p>
      ) : (
        <>
          {/* GAUGE CARDS */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

            <GaugeCard
              label="Voltage (V)"
              value={latest?.voltage}
              max={260}
            />

            <GaugeCard
              label="Current (A)"
              value={latest?.current}
              max={10}
            />

            <GaugeCard
              label="Power (W)"
              value={latest?.power}
              max={2000}
            />

          </div>

          {/* CHART */}

          <div className="bg-white p-6 rounded-xl shadow">

            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              Sensor Trends
            </h3>

            <Line
              data={{
                labels: sensorData.map((d) =>
                  new Date(d.timestamp).toLocaleString()
                ),

                datasets: [
                  {
                    label: "Voltage",
                    data: sensorData.map((d) => d.voltage),
                    borderColor: "#2563eb",
                    tension: 0.4
                  },
                  {
                    label: "Current",
                    data: sensorData.map((d) => d.current),
                    borderColor: "#16a34a",
                    tension: 0.4
                  },
                  {
                    label: "Power",
                    data: sensorData.map((d) => d.power),
                    borderColor: "#dc2626",
                    tension: 0.4
                  }
                ]
              }}
            />

          </div>
        </>
      )}
    </div>
  );
};

export default DevicesPage;