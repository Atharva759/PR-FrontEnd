import { useEffect, useState } from "react";
import { ArrowLeft, Info } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import GaugeComponent from "react-gauge-component";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_BACKEND_URL;
const ML_URL = import.meta.env.VITE_MLMODEL_URL;

const PZEM_MAX = {
  voltage: 300,
  current: 100,
  power: 25000,
  energy: 10000,
  frequency: 65,
};

const TARIFF_RATES = {
  residential: 8.25,
  commercial: 12.5,
};

const PZEM = () => {
  const navigate = useNavigate();

  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);
  const [tariffType, setTariffType] = useState("residential");
  const [mlPredictions, setMlPredictions] = useState([]);
  const [showInfo, setShowInfo] = useState(false);
  const [infoData, setInfoData] = useState(null);
  const [chartColor, setChartColor] = useState("#2563eb");

  const [billing, setBilling] = useState({
    kwh: 0,
    cost: 0,
  });

  // Fetch latest PZEM
  const fetchLatest = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/pzem/latest`);
      const json = await res.json();

      if (json.success) {
        setLatest(json.data);

        const kwh = json.data.energy / 1000;
        const rate = TARIFF_RATES[tariffType];
        const cost = kwh * rate;

        setBilling({ kwh, cost });
      }
    } catch (err) {
      console.error("Fetch latest error:", err);
    }
  };

  // History fetch
  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/pzem/history`);
      const json = await res.json();

      if (json.success) {
        const formatted = json.history.map((item) => ({
          time: new Date(item.timestamp).toLocaleTimeString(),
          voltage: item.voltage,
          current: item.current,
          power: item.power,
          energy: item.energy / 1000,
          frequency: item.frequency,
        }));

        setHistory(formatted);
      }
    } catch (err) {
      console.error("Fetch history error:", err);
    }
  };

  // ML Predictions
  const fetchMlPredictions = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/pzem/history`);
      const json = await res.json();

      if (json.success) {
        const latest10 = json.history.slice(-10);

        const predictions = await Promise.all(
          latest10.map(async (row) => {
            const mlRes = await fetch(`${ML_URL}/predict`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                voltage: row.voltage,
                current: row.current,
                power: row.power,
                frequency: row.frequency,
              }),
            });

            const mlJson = await mlRes.json();

            return {
              time: new Date(row.timestamp).toLocaleTimeString(),
              predicted_energy: mlJson.predicted_energy,
            };
          })
        );

        setMlPredictions(predictions);
      }
    } catch (err) {
      console.error("Error fetching ML predictions:", err);
    }
  };

  // Tariff update
  useEffect(() => {
    if (latest) {
      const kwh = latest.energy / 1000;
      const cost = kwh * TARIFF_RATES[tariffType];
      setBilling({ kwh, cost });
    }
  }, [tariffType]);

  // Auto refresh
  useEffect(() => {
    fetchLatest();
    fetchHistory();
    fetchMlPredictions();

    const interval = setInterval(() => {
      fetchLatest();
      fetchHistory();
      fetchMlPredictions();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Random color for modal chart
  useEffect(() => {
    if (showInfo) {
      setChartColor("#" + Math.floor(Math.random() * 16777215).toString(16));
    }
  }, [showInfo]);

  return (
    <div className="min-h-screen p-6 bg-blue-100">
      <div className="flex items-center justify-between bg-blue-600 text-white p-5 rounded-xl shadow mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-800 hover:bg-blue-700 p-2 rounded-lg cursor-pointer"
          >
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-xl font-bold">PZEM Energy Dashboard</h1>
        </div>
      </div>

      {latest && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GaugeCard
            label={`Voltage ${latest.voltage} (V)`}
            value={latest.voltage}
            max={PZEM_MAX.voltage}
            onInfoClick={() => {
              setInfoData({
                title: "Voltage",
                unit: "V",
                latestValue: latest.voltage,
                max: PZEM_MAX.voltage,
                history: history.map((i) => ({
                  time: i.time,
                  value: i.voltage,
                })),
              });
              setShowInfo(true);
            }}
          />

          <GaugeCard
            label={`Current ${latest.current} (A)`}
            value={latest.current}
            max={PZEM_MAX.current}
            onInfoClick={() => {
              setInfoData({
                title: "Current",
                unit: "A",
                latestValue: latest.current,
                history: history.map((i) => ({
                  time: i.time,
                  value: i.current,
                })),
              });
              setShowInfo(true);
            }}
          />

          <GaugeCard
            label={`Power ${latest.power} (W)`}
            value={latest.power}
            max={PZEM_MAX.power}
            onInfoClick={() => {
              setInfoData({
                title: "Power",
                unit: "W",
                latestValue: latest.power,
                history: history.map((i) => ({ time: i.time, value: i.power })),
              });
              setShowInfo(true);
            }}
          />

          <GaugeCard
            label={`Energy ${(latest.energy / 1000).toFixed(2)} (kWh)`}
            value={latest.energy / 1000}
            max={PZEM_MAX.energy}
            onInfoClick={() => {
              setInfoData({
                title: "Energy",
                unit: "kWh",
                latestValue: (latest.energy / 1000).toFixed(2),

                history: history.map((i) => ({
                  time: i.time,
                  value: i.energy,
                })),
              });
              setShowInfo(true);
            }}
          />

          <GaugeCard
            label={`Frequency ${latest.frequency} (Hz)`}
            value={latest.frequency}
            max={PZEM_MAX.frequency}
            onInfoClick={() => {
              setInfoData({
                title: "Frequency",
                unit: "Hz",
                latestValue: latest.frequency,
                max: PZEM_MAX.frequency,
                history: history.map((i) => ({
                  time: i.time,
                  value: i.frequency,
                })),
              });
              setShowInfo(true);
            }}
          />
        </div>
      )}

      {/* Billing Summary */}
      <div className="mt-8 bg-white p-6 rounded-xl shadow-md border border-blue-300">
        <h2 className="text-xl font-semibold text-blue-700 mb-4">
          Billing Summary
        </h2>

        <div className="mb-6">
          <label className="text-blue-900 font-semibold mr-3">
            Select Tariff Type:
          </label>
          <select
            value={tariffType}
            onChange={(e) => setTariffType(e.target.value)}
            className="p-2 rounded-lg border border-blue-400 shadow-md"
          >
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-lg">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl shadow-sm">
            <p className="text-blue-900 font-semibold">Total Energy</p>
            <p className="text-2xl font-bold text-blue-600">
              {billing.kwh.toFixed(3)} kWh
            </p>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl shadow-sm">
            <p className="text-blue-900 font-semibold">Tariff Rate</p>
            <p className="text-2xl font-bold text-blue-600">
              ₹ {TARIFF_RATES[tariffType]}/kWh
            </p>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl shadow-sm">
            <p className="text-blue-900 font-semibold">Total Cost</p>
            <p className="text-2xl font-bold text-green-600">
              ₹ {billing.cost.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Actual vs Predicted Energy Charts */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Actual Energy */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-4 text-blue-700">
            Actual Energy (kWh)
          </h2>

          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={history.slice(-10)}>
              <defs>
                <linearGradient id="actualEnergy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />

              <Area
                type="monotone"
                dataKey="energy"
                stroke="#7c3aed"
                strokeWidth={3}
                fill="url(#actualEnergy)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Predicted Energy */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-4 text-blue-700">
            Predicted Energy (kWh)
          </h2>

          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={mlPredictions}>
              <defs>
                <linearGradient id="predEnergy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />

              <Area
                type="monotone"
                dataKey="predicted_energy"
                stroke="#f59e0b"
                strokeWidth={3}
                fill="url(#predEnergy)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Modal Detailed Graph */}
      {showInfo && infoData && (
        <div className="fixed inset-0 backdrop-blur-md bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white w-[95%] max-w-3xl p-8 rounded-2xl shadow-2xl relative">
            <button
              onClick={() => setShowInfo(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-black text-2xl cursor-pointer"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold mb-4 text-blue-700">
              {infoData.title} - Live Reading
            </h2>

            <p className="text-xl font-semibold mb-6">
              Latest Value:{" "}
              <span className="text-blue-600">
                {infoData.latestValue} {infoData.unit}
              </span>
            </p>

            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={infoData.history}>
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={chartColor}
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor={chartColor}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={[0, infoData.max]} />
                  <Tooltip />

                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={chartColor}
                    strokeWidth={3}
                    fill="url(#colorVal)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------
    GAUGE CARD  (COPY–PASTE READY)
-------------------------------------------- */
const GaugeCard = ({ label, value, max, onInfoClick }) => {
  const safeVal = (() => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.min(Math.max(n, 0), max) : 0;
  })();

  return (
    <div className="bg-white p-5 rounded-2xl shadow-lg flex flex-col items-center relative">
      <h3 className="text-2xl font-medium text-blue-700 mb-2">{label}</h3>

      <button
        onClick={onInfoClick}
        className="absolute top-3 right-3 bg-gray-100 hover:bg-gray-200 p-2 rounded-full cursor-pointer"
      >
        <Info size={20} className="text-gray-700" />
      </button>

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
        pointer={{ color: "#111", length: 0.7 }}
        labels={{
          valueLabel: {
            formatTextValue: (v) => {
              const num = Number(v) || safeVal;
              return num >= 1000 ? num.toFixed(0) : num.toFixed(2);
            },
            style: { fontSize: "1.3rem", fill: "#374151" },
          },
        }}
        style={{ width: "80%", height: "80%" }}
      />
    </div>
  );
};

export default PZEM;
