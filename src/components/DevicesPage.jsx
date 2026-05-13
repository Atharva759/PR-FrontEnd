import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaInfoCircle, FaBolt, FaWater } from "react-icons/fa";

import {
  LineChart,
  Line,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts";

import GaugeComponent from "react-gauge-component";

import { getSensorData } from "../api/tenantApi";

const TARIFF_RATES = {
  residential: 8.25,
  commercial: 12.5,
};

const formatDateTime = (timestamp) => {
  return new Date(timestamp).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};

const GaugeCard = ({ label, value, max, onInfoClick }) => {
  const safeVal = (() => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.min(Math.max(n, 0), max) : 0;
  })();

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-5 rounded-3xl shadow-2xl flex flex-col items-center relative hover:scale-[1.02] transition duration-300">
      <button
        onClick={onInfoClick}
        className="absolute top-3 right-3 bg-white/10 hover:bg-white/20 backdrop-blur-lg p-2 rounded-full cursor-pointer"
        title="Click to see detailed info"
      >
        <FaInfoCircle className="text-gray-300" />
      </button>

      <h3 className="text-lg font-semibold text-cyan-300 mb-2 text-center">
        {label}
      </h3>

      <GaugeComponent
        value={safeVal}
        minValue={0}
        maxValue={Number(max)}
        type="semicircle"
        arc={{
          subArcs: [
            { limit: max * 0.6, color: "#16a34a" },
            { limit: max * 0.85, color: "#facc15" },
            { limit: max, color: "#dc2626" },
          ],
          width: 0.25,
        }}
        pointer={{
          color: "#ffffff",
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
              fill: "#ffffff",
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

  const [showInfo, setShowInfo] = useState(false);
  const [infoData, setInfoData] = useState(null);

  const [tariffType, setTariffType] = useState("residential");

  const [billing, setBilling] = useState({
    kwh: 0,
    cost: 0,
  });

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

  useEffect(() => {
    if (latest && deviceType === "pzem") {
      const kwh = (latest.energy || 0) / 1000;

      setBilling({
        kwh,
        cost: kwh * TARIFF_RATES[tariffType],
      });
    }
  }, [latest, tariffType, deviceType]);

  const chartData = sensorData.map((d) => ({
    time: formatDateTime(d.timestamp),
    voltage: d.voltage,
    current: d.current,
    power: d.power,
    energy: d.energy ? d.energy / 1000 : 0,
    frequency: d.frequency,
    pm10: d.pm10,
    pm25: d.pm25,
  }));

  return (
    <div
      className="min-h-screen p-6 text-white"
      style={{
        background:
          "radial-gradient(at 60% 30%, rgba(30,136,229,0.25), transparent 60%), radial-gradient(at 25% 75%, rgba(126,87,194,0.3), transparent 55%), rgb(17,24,39)",
      }}
    >
      {/* TOP CONTROL PANEL */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-5">
            <button
              onClick={() => navigate(-1)}
              className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl transition duration-300 shadow-lg cursor-pointer"
            >
              <FaArrowLeft className="text-white text-lg" />
            </button>

            {/* DEVICE ICON */}
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-400/20 flex items-center justify-center shadow-lg">
              {deviceType === "pzem" ? (
                <FaBolt className="text-cyan-300 text-3xl" />
              ) : (
                <FaWater className="text-violet-300 text-3xl" />
              )}
            </div>

            {/* TITLE + MAC */}
            <div>
              <h1 className="text-3xl font-bold text-white">
                Sensor Data Dashboard
              </h1>

              <div className="flex items-center gap-2 mt-2">
                <span className="text-cyan-300 font-semibold">
                  MAC Address:
                </span>

                <span className="text-gray-300">{mac}</span>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE BUTTONS */}
          <div className="flex justify-center lg:justify-end">
            <div className="bg-black/20 border border-white/10 p-2 rounded-full flex gap-2 shadow-xl">
              <button
                onClick={() => setDeviceType("pzem")}
                className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 flex items-center gap-3 cursor-pointer ${
                  deviceType === "pzem"
                    ? "bg-cyan-500 text-white shadow-lg scale-105"
                    : "text-gray-300 hover:bg-white/10"
                }`}
              >
                <FaBolt />
                PZEM
              </button>

              <button
                onClick={() => setDeviceType("aqi")}
                className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 flex items-center gap-3 cursor-pointer ${
                  deviceType === "aqi"
                    ? "bg-violet-500 text-white shadow-lg scale-105"
                    : "text-gray-300 hover:bg-white/10"
                }`}
              >
                <FaWater />
                AQI
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-300">Loading sensor data...</p>
      ) : (
        <>
          {/* PZEM GAUGES */}
          {deviceType === "pzem" && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <GaugeCard
                label={`Voltage (${latest?.voltage ?? 0} V)`}
                value={latest?.voltage}
                max={260}
                onInfoClick={() => {
                  setInfoData({
                    title: "Voltage",
                    key: "voltage",
                    max: 260,
                    unit: "V",
                  });

                  setShowInfo(true);
                }}
              />

              <GaugeCard
                label={`Current (${latest?.current ?? 0} A)`}
                value={latest?.current}
                max={100}
                onInfoClick={() => {
                  setInfoData({
                    title: "Current",
                    key: "current",
                    max: 100,
                    unit: "A",
                  });

                  setShowInfo(true);
                }}
              />

              <GaugeCard
                label={`Power (${latest?.power ?? 0} W)`}
                value={latest?.power}
                max={25000}
                onInfoClick={() => {
                  setInfoData({
                    title: "Power",
                    key: "power",
                    max: 25000,
                    unit: "W",
                  });

                  setShowInfo(true);
                }}
              />

              <GaugeCard
                label={`Energy (${((latest?.energy || 0) / 1000).toFixed(
                  2,
                )} kWh)`}
                value={(latest?.energy || 0) / 1000}
                max={10000}
                onInfoClick={() => {
                  setInfoData({
                    title: "Energy",
                    key: "energy",
                    max: 10000,
                    unit: "kWh",
                  });

                  setShowInfo(true);
                }}
              />

              <GaugeCard
                label={`Frequency (${latest?.frequency ?? 0} Hz)`}
                value={latest?.frequency}
                max={65}
                onInfoClick={() => {
                  setInfoData({
                    title: "Frequency",
                    key: "frequency",
                    max: 65,
                    unit: "Hz",
                  });

                  setShowInfo(true);
                }}
              />
            </div>
          )}

          {/* AQI */}
          {deviceType === "aqi" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GaugeCard
                label={`PM10 (${latest?.pm10 ?? 0})`}
                value={latest?.pm10}
                max={500}
                onInfoClick={() => {
                  setInfoData({
                    title: "PM10",
                    key: "pm10",
                    max: 500,
                    unit: "µg/m³",
                  });

                  setShowInfo(true);
                }}
              />

              <GaugeCard
                label={`PM2.5 (${latest?.pm25 ?? 0})`}
                value={latest?.pm25}
                max={500}
                onInfoClick={() => {
                  setInfoData({
                    title: "PM2.5",
                    key: "pm25",
                    max: 500,
                    unit: "µg/m³",
                  });

                  setShowInfo(true);
                }}
              />
            </div>
          )}

          {/* BILLING */}
          {deviceType === "pzem" && (
            <div className="mt-10 bg-white/10 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl">
              <h2 className="text-2xl font-bold text-cyan-300 mb-6">
                Energy Billing Summary
              </h2>

              <div className="flex items-center gap-3 mb-4">
                <span className="text-gray-300 font-bold text-xl">
                  Tariff Type:
                </span>

                <div className="flex bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-1 shadow-xl">
                  <button
                    onClick={() => setTariffType("residential")}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 cursor-pointer ${
                      tariffType === "residential"
                        ? "bg-cyan-500 text-white shadow-lg"
                        : "text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    Residential
                  </button>

                  <button
                    onClick={() => setTariffType("commercial")}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 cursor-pointer ${
                      tariffType === "commercial"
                        ? "bg-violet-500 text-white shadow-lg"
                        : "text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    Commercial
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-2xl p-5">
                  <p className="text-gray-300">Total Energy</p>

                  <h3 className="text-3xl font-bold text-cyan-300">
                    {billing.kwh.toFixed(3)} kWh
                  </h3>
                </div>

                <div className="bg-violet-500/10 border border-violet-500/20 rounded-2xl p-5">
                  <p className="text-gray-300">Tariff Rate</p>

                  <h3 className="text-3xl font-bold text-violet-300">
                    ₹ {TARIFF_RATES[tariffType]}
                  </h3>
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5">
                  <p className="text-gray-300">Estimated Cost</p>

                  <h3 className="text-3xl font-bold text-emerald-300">
                    ₹ {billing.cost.toFixed(2)}
                  </h3>
                </div>
              </div>
            </div>
          )}

          {/* CHART */}
          <div className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl shadow-2xl mt-10 border border-white/10">
            <h3 className="text-2xl font-semibold mb-6 text-cyan-300">
              Sensor Trends
            </h3>

            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.08)"
                />

                <XAxis
                  dataKey="time"
                  stroke="#d1d5db"
                  tick={{ fontSize: 11 }}
                  interval="preserveStartEnd"
                  angle={-15}
                  textAnchor="end"
                  height={70}
                />

                <YAxis stroke="#d1d5db" />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "16px",
                    color: "white",
                  }}
                  labelStyle={{
                    color: "#67e8f9",
                    fontWeight: "bold",
                  }}
                />

                <Legend />

                {deviceType === "pzem" ? (
                  <>
                    <Line
                      type="monotone"
                      dataKey="voltage"
                      stroke="#38bdf8"
                      strokeWidth={3}
                    />

                    <Line
                      type="monotone"
                      dataKey="current"
                      stroke="#22c55e"
                      strokeWidth={3}
                    />

                    <Line
                      type="monotone"
                      dataKey="power"
                      stroke="#ef4444"
                      strokeWidth={3}
                    />

                    <Line
                      type="monotone"
                      dataKey="energy"
                      stroke="#a855f7"
                      strokeWidth={3}
                    />

                    <Line
                      type="monotone"
                      dataKey="frequency"
                      stroke="#f59e0b"
                      strokeWidth={3}
                    />
                  </>
                ) : (
                  <>
                    <Line
                      type="monotone"
                      dataKey="pm10"
                      stroke="#38bdf8"
                      strokeWidth={3}
                    />

                    <Line
                      type="monotone"
                      dataKey="pm25"
                      stroke="#a855f7"
                      strokeWidth={3}
                    />
                  </>
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* MODAL */}
      {showInfo && infoData && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex justify-center items-center z-50">
          <div className="bg-slate-900 border border-white/10 w-[95%] max-w-4xl rounded-3xl p-8 relative">
            <button
              onClick={() => setShowInfo(false)}
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-3 rounded-full cursor-pointer"
            >
              ✕
            </button>

            <h2 className="text-3xl font-bold text-cyan-300 mb-6">
              {infoData.title} Analytics
            </h2>

            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="analytics" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8} />

                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.08)"
                />

                <XAxis
                  dataKey="time"
                  stroke="#d1d5db"
                  tick={{ fontSize: 11 }}
                  interval="preserveStartEnd"
                  angle={-15}
                  textAnchor="end"
                  height={70}
                />

                <YAxis stroke="#d1d5db" />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "16px",
                    color: "white",
                  }}
                  labelStyle={{
                    color: "#67e8f9",
                    fontWeight: "bold",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey={infoData.key}
                  stroke="#38bdf8"
                  fill="url(#analytics)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevicesPage;
