import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Wifi } from "lucide-react";
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

const DEFAULT_WS =
  import.meta.env.VITE_WS_URL ;

const PZEM_MAX = {
  voltage: 300,
  current: 100,
  power: 25000,
  energy: 10000,
  frequency: 65,
};

const PZEM = () => {
  const { deviceId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const device = location.state?.device;

  const [pzemData, setPzemData] = useState([]);
  const [wsStatus, setWsStatus] = useState("connecting");
  const [billingType, setBillingType] = useState("residential");
  const [bill, setBill] = useState(0);
  const [lastEnergy, setLastEnergy] = useState(null);

  const wsRef = useRef(null);
  const reconnectRef = useRef({ tries: 0, timer: null });
  const mountedRef = useRef(false);

  const tariffRates = {
    residential: 100.0,
    commercial: 500.0,
  };

  const WS_URL = import.meta.env.VITE_WS_URL || DEFAULT_WS;

  const clamp = (v, min = 0, max = 100) => {
    if (Number.isFinite(v) === false) return min;
    return Math.max(min, Math.min(max, v));
  };

  const toNumberSafe = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const handleHeartbeat = useCallback(
    (data) => {
      const pzemSensor = (data.sensors || []).find((s) =>
        String(s.id || "")
          .toLowerCase()
          .includes("pzem004t")
      );

      if (!pzemSensor || !pzemSensor.data) return;

      const { voltage_v, current_a, power_w, energy_wh, frequency_hz } =
        pzemSensor.data;

      const energyKwh = toNumberSafe(energy_wh) / 1000;

      setLastEnergy((prevEnergy) => {
        if (prevEnergy !== null && energyKwh > prevEnergy) {
          setBill((prevBill) => {
            const delta = energyKwh - prevEnergy;
            return prevBill + delta * tariffRates[billingType];
          });
        }
        return energyKwh;
      });

      const now = new Date();
      const timestamp = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      setPzemData((prev) => {
        const newPoint = {
          time: timestamp,
          voltage: toNumberSafe(voltage_v),
          current: toNumberSafe(current_a),
          power: toNumberSafe(power_w),
          energy: toNumberSafe(energyKwh),
          frequency: toNumberSafe(frequency_hz),
        };
        const updated = prev.concat(newPoint);
        return updated.slice(-60);
      });
    },

    []
  );

  const connectWebSocket = useCallback(() => {
    if (
      wsRef.current &&
      (wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING)
    ) {
      console.debug("WS already open/connecting; skipping connect");
      return;
    }

    try {
      setWsStatus("connecting");
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log(" WebSocket connected");
        setWsStatus("connected");

        reconnectRef.current.tries = 0;
        if (reconnectRef.current.timer) {
          clearTimeout(reconnectRef.current.timer);
          reconnectRef.current.timer = null;
        }
      };

      ws.onmessage = (evt) => {
        try {
          const msg = JSON.parse(evt.data);

          if (
            msg.type === "heartbeat" &&
            msg.deviceId &&
            deviceId &&
            msg.deviceId.toLowerCase() === deviceId.toLowerCase()
          ) {
            handleHeartbeat(msg);
          }
        } catch (err) {
          console.error(" WebSocket JSON parse error:", err);
        }
      };

      ws.onclose = (ev) => {
        console.warn("WebSocket closed", ev && ev.code, ev && ev.reason);
        setWsStatus("disconnected");

        if (mountedRef.current) {
          const tries = reconnectRef.current.tries || 0;
          const backoff = Math.min(30000, 1000 * Math.pow(2, tries)); // cap 30s
          reconnectRef.current.tries = tries + 1;
          reconnectRef.current.timer = setTimeout(() => {
            console.log(
              `♻️ Reconnecting WebSocket (attempt ${reconnectRef.current.tries})...`
            );
            connectWebSocket();
          }, backoff);
        }
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);

        try {
          ws.close();
        } catch (errClose) {
          console.log("Unexpected Error");
        }
      };
    } catch (err) {
      console.error("Failed to create WebSocket:", err);
      setWsStatus("error");
    }
  }, [WS_URL, deviceId, handleHeartbeat]);

  useEffect(() => {
    if (!device) {
      navigate("/");
      return;
    }

    mountedRef.current = true;
    connectWebSocket();

    return () => {
      mountedRef.current = false;

      if (reconnectRef.current.timer) {
        clearTimeout(reconnectRef.current.timer);
        reconnectRef.current.timer = null;
      }

      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch (err) {}
      }
    };
  }, [deviceId, device, connectWebSocket, navigate]);

  const latest = pzemData[pzemData.length - 1] || {};
  const { voltage, current, power, energy, frequency } = latest;

  return (
    <div className="min-h-screen bg-blue-100 flex flex-col gap-6 p-8 rounded-2xl shadow-inner">
      <div className="max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between bg-blue-600 text-white p-5 rounded-xl shadow-md mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="bg-blue-800 hover:bg-blue-700 transition-all rounded-lg p-2 cursor-pointer"
            >
              <ArrowLeft size={22} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">PZEM Monitoring</h1>
              <p className="text-blue-200 text-sm">Device ID: {deviceId}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-blue-800 px-3 py-1.5 rounded-lg shadow-inner">
            <Wifi
              className={`w-5 h-5 ${
                wsStatus === "connected"
                  ? "text-green-300"
                  : wsStatus === "connecting"
                  ? "text-yellow-300"
                  : "text-red-300"
              }`}
            />
            <span className="text-sm capitalize">{wsStatus}</span>
          </div>
        </div>

        {/* Gauges grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <GaugeCard
            label={`Voltage ${voltage} (V)`}
            value={voltage}
            max={PZEM_MAX.voltage}
          />
          <GaugeCard
            label={`Current ${current} (A) `}
            value={current}
            max={PZEM_MAX.current}
          />
          <GaugeCard
            label={`Power ${power} (W)`}
            value={power}
            max={PZEM_MAX.power}
          />
          <GaugeCard
            label={`Energy ${energy}  (kWh)`}
            value={energy}
            max={PZEM_MAX.energy}
          />
          <GaugeCard
            label={`Frequency ${frequency} (Hz) `}
            value={frequency}
            max={PZEM_MAX.frequency}
          />
        </div>

        {/* Billing */}
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
          <h2 className="text-xl font-bold text-blue-800 mb-4">
            Energy Billing
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <label className="text-gray-700 font-medium">Billing Type:</label>
              <select
                className="border rounded-md px-3 py-2"
                value={billingType}
                onChange={(e) => setBillingType(e.target.value)}
              >
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>

            <div className="text-center md:text-right">
              <p className="text-gray-600 text-sm">
                Rate: ₹{tariffRates[billingType]}/kWh
              </p>
              <h3 className="text-2xl font-bold text-blue-700 mt-1">
                Total Bill: ₹{bill.toFixed(2)}
              </h3>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold text-blue-800 mb-4">
            PZEM Sensor Trends
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pzemData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                {["voltage", "current", "power", "energy", "frequency"].map(
                  (key, idx) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={
                        ["#2563eb", "#dc2626", "#16a34a", "#d97706", "#7c3aed"][
                          idx % 5
                        ]
                      }
                      dot={false}
                      strokeWidth={2}
                      isAnimationActive={false}
                      connectNulls={true}
                    />
                  )
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
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
      <h3 className="text-lg font-medium text-blue-700 mb-2">{label}</h3>
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
        style={{ width: "100%", height: "140px" }}
      />
    </div>
  );
};

export default PZEM;
