import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import GaugeComponent from "react-gauge-component";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_BACKEND_URL;

// Max PZEM limits
const PZEM_MAX = {
  voltage: 300,
  current: 100,
  power: 25000,
  energy: 10000,
  frequency: 65,
};

// Tariff rates
const TARIFF_RATES = {
  residential: 8.25,
  commercial: 12.5,
};

const PZEM = () => {
  const navigate = useNavigate();

  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);
  const [tariffType, setTariffType] = useState("residential");

  const [billing, setBilling] = useState({
    kwh: 0,
    cost: 0,
  });

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

  useEffect(() => {
    if (latest) {
      const kwh = latest.energy / 1000;
      const rate = TARIFF_RATES[tariffType];
      const cost = kwh * rate;

      setBilling({ kwh, cost });
    }
  }, [tariffType]);

  useEffect(() => {
    fetchLatest();
    fetchHistory();

    const interval = setInterval(() => {
      fetchLatest();
      fetchHistory();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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
          />

          <GaugeCard
            label={`Current ${latest.current} (A)`}
            value={latest.current}
            max={PZEM_MAX.current}
          />

          <GaugeCard
            label={`Power ${latest.power} (W)`}
            value={latest.power}
            max={PZEM_MAX.power}
          />

          <GaugeCard
            label={`Energy ${(latest.energy / 1000).toFixed(2)} (kWh)`}
            value={latest.energy / 1000}
            max={PZEM_MAX.energy}
          />

          <GaugeCard
            label={`Frequency ${latest.frequency} (Hz)`}
            value={latest.frequency}
            max={70}
          />
        </div>
      )}

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

      <div className="mt-10 bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-lg font-semibold mb-4 text-blue-700">
          Historical Trend
        </h2>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />

            <Line type="monotone" dataKey="voltage" stroke="#2563eb" />
            <Line type="monotone" dataKey="current" stroke="#16a34a" />
            <Line type="monotone" dataKey="power" stroke="#e11d48" />
            <Line type="monotone" dataKey="energy" stroke="#7c3aed" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const GaugeCard = ({ label, value, max }) => {
  const safeVal = (() => {
    const n = Number(value);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(max, n));
  })();

  return (
    <div className="bg-white p-5 rounded-2xl shadow-lg flex flex-col items-center">
      <h3 className="text-2xl font-medium text-blue-700 mb-2">{label}</h3>

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
          color: "#111",
          length: 0.7,
        }}
        labels={{
          valueLabel: {
            formatTextValue: (v) => {
              const num = Number.isFinite(Number(v)) ? Number(v) : safeVal;
              if (Math.abs(num) >= 1000) return num.toFixed(0);
              return num.toFixed(2);
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
