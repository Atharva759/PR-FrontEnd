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

/**
 * Configuration: default WS URL (use VITE_WS_URL to override in env)
 * Backend expects web clients to connect to: /ws/devices
 */
const DEFAULT_WS = import.meta.env.VITE_WS_URL || "wss://pr-test-quit.onrender.com/ws/devices";

/**
 * PZEM realistic max values (approximate device capabilities):
 * - Voltage: up to 300 V (safe clamp)
 * - Current: up to 100 A (PZEM004T supports up to 100A with proper CT)
 * - Power: up to 25000 W (derived)
 * - Energy: up to 10000 kWh (for display)
 * - Frequency: up to 100 Hz
 */

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

  // reconnect/backoff refs
  const wsRef = useRef(null);
  const reconnectRef = useRef({ tries: 0, timer: null });
  const mountedRef = useRef(false);

  // tariff rates (₹ per kWh)
  const tariffRates = {
    residential: 5.0,
    commercial: 10.0,
  };

  // Use provided WS URL or DEFAULT_WS
  const WS_URL = import.meta.env.VITE_WS_URL || DEFAULT_WS;

  // Safe clamping utility
  const clamp = (v, min = 0, max = 100) => {
    if (Number.isFinite(v) === false) return min;
    return Math.max(min, Math.min(max, v));
  };

  // Safe number parser
  const toNumberSafe = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  // Broadcast to UI: parse incoming heartbeat & push to chart
  const handleHeartbeat = useCallback(
    (data) => {
      // backend message format matches the example you posted
      const pzemSensor = (data.sensors || []).find((s) =>
        String(s.id || "").toLowerCase().includes("pzem004t")
      );

      if (!pzemSensor || !pzemSensor.data) return;

      const { voltage_v, current_a, power_w, energy_wh, frequency_hz } =
        pzemSensor.data;

      // Convert Wh to kWh
      const energyKwh = toNumberSafe(energy_wh) / 1000;

      // billing: add only when energy increases
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

      // push to chart (immutably), keep last 60 points
      setPzemData((prev) => {
        const newPoint = {
          time: timestamp,
          voltage: toNumberSafe(voltage_v),
          current: toNumberSafe(current_a),
          power: toNumberSafe(power_w),
          energy: Number(energyKwh),
          frequency: toNumberSafe(frequency_hz),
        };
        const updated = prev.concat(newPoint);
        return updated.slice(-60);
      });
    },
    
    []
  );

  // Connect with exponential backoff reconnect
  const connectWebSocket = useCallback(() => {
    // Prevent multiple active sockets
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      console.debug("WS already open/connecting; skipping connect");
      return;
    }

    try {
      setWsStatus("connecting");
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("✅ WebSocket connected");
        setWsStatus("connected");

        // reset reconnect attempts
        reconnectRef.current.tries = 0;
        if (reconnectRef.current.timer) {
          clearTimeout(reconnectRef.current.timer);
          reconnectRef.current.timer = null;
        }
      };

      ws.onmessage = (evt) => {
        try {
          const msg = JSON.parse(evt.data);
          // backend sends 'heartbeat' broadcast to web clients
          if (msg.type === "heartbeat" && msg.deviceId && deviceId && msg.deviceId.toLowerCase() === deviceId.toLowerCase()) {
            handleHeartbeat(msg);
          }

          // Optionally handle other server messages (list of devices, device_registered, etc.)
          // e.g. msg.type === 'devices_list'
        } catch (err) {
          console.error("⚠️ WebSocket JSON parse error:", err);
        }
      };

      ws.onclose = (ev) => {
        console.warn("🔴 WebSocket closed", ev && ev.code, ev && ev.reason);
        setWsStatus("disconnected");
        // schedule reconnect
        if (mountedRef.current) {
          const tries = reconnectRef.current.tries || 0;
          const backoff = Math.min(30000, 1000 * Math.pow(2, tries)); // cap 30s
          reconnectRef.current.tries = tries + 1;
          reconnectRef.current.timer = setTimeout(() => {
            console.log(`♻️ Reconnecting WebSocket (attempt ${reconnectRef.current.tries})...`);
            connectWebSocket();
          }, backoff);
        }
      };

      ws.onerror = (err) => {
        console.error("⚠️ WebSocket error:", err);
        // `onerror` often followed by `onclose`; we close proactively to trigger reconnect logic
        try {
          ws.close();
        } catch (errClose) {
          // ignore
        }
      };
    } catch (err) {
      console.error("Failed to create WebSocket:", err);
      setWsStatus("error");
    }
  }, [WS_URL, deviceId, handleHeartbeat]);

  // Initialize connection once on mount or when deviceId changes
  useEffect(() => {
    if (!device) {
      navigate("/");
      return;
    }

    mountedRef.current = true;
    connectWebSocket();

    return () => {
      mountedRef.current = false;
      // clear reconnect timer
      if (reconnectRef.current.timer) {
        clearTimeout(reconnectRef.current.timer);
        reconnectRef.current.timer = null;
      }
      // close socket gracefully
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch (err) {
          // ignore
        }
      }
    };
    
  }, [deviceId, device, connectWebSocket, navigate]);

  // Latest reading shorthand
  const latest = pzemData[pzemData.length - 1] || {};
  const { voltage, current, power, energy, frequency } = latest;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex items-center gap-3">
            <ArrowLeft
              className="w-6 h-6 text-gray-700 cursor-pointer"
              onClick={() => navigate(-1)}
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">PZEM Dashboard</h1>
              <p className="text-gray-600 text-sm">Device ID: {deviceId}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Wifi
              className={`w-5 h-5 ${wsStatus === "connected" ? "text-green-500" : wsStatus === "connecting" ? "text-yellow-500" : "text-red-500"}`}
            />
            <span className="text-sm capitalize">{wsStatus}</span>
          </div>
        </div>

        {/* Gauges grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <GaugeCard label={`Voltage ${voltage} (V)`} value={voltage} max={PZEM_MAX.voltage} />
          <GaugeCard label={`Current ${current} (A) `} value={current} max={PZEM_MAX.current} />
          <GaugeCard label={`Power ${power} (W)`} value={power} max={PZEM_MAX.power} />
          <GaugeCard label={`Energy ${energy}  (kWh)`} value={energy} max={PZEM_MAX.energy} />
          <GaugeCard label={`Frequency ${frequency} (Hz) `} value={frequency} max={PZEM_MAX.frequency} />
        </div>

        {/* Billing */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <h2 className="text-xl font-semibold mb-4">Energy Billing</h2>
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
              <p className="text-gray-600 text-sm">Rate: ₹{tariffRates[billingType]}/kWh</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">Total Bill: ₹{bill.toFixed(2)}</h3>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">PZEM Sensor Trends</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pzemData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                {["voltage", "current", "power", "energy", "frequency"].map((key, idx) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={["#2563eb", "#dc2626", "#16a34a", "#d97706", "#7c3aed"][idx % 5]}
                    dot={false}
                    strokeWidth={2}
                    isAnimationActive={false}
                    connectNulls={true}
                  />
                ))}
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
    <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col items-center">
      <h3 className="text-lg font-medium text-gray-800 mb-2">{label}</h3>
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
