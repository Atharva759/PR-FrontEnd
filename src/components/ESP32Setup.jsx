import React, { useState, useEffect } from "react";
import {
  Wifi,
  Camera,
  Mic,
  Zap,
  HardDrive,
  Radio,
  CheckCircle,
  Loader,
  Settings,
  Save,
} from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://pr-test-quit.onrender.com";
const WS_URL = "wss://pr-test-quit.onrender.com/ws/devices";

const ESP32Setup = () => {
  const [connectedDevices, setConnectedDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [wsStatus, setWsStatus] = useState("disconnected");
  const [deviceConfig, setDeviceConfig] = useState({});
  const [savingConfig, setSavingConfig] = useState(false);

  // --- WebSocket for device updates ---
  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      setWsStatus("connected");
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "device_registered") {
        setConnectedDevices((prev) => {
          const exists = prev.find((d) => d.deviceId === data.device.deviceId);
          if (exists) {
            return prev.map((d) =>
              d.deviceId === data.device.deviceId ? data.device : d
            );
          }
          return [...prev, data.device];
        });
      } else if (data.type === "device_disconnected") {
        setConnectedDevices((prev) =>
          prev.filter((d) => d.deviceId !== data.deviceId)
        );
      } else if (data.type === "devices_list") {
        setConnectedDevices(data.devices);
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
      setWsStatus("error");
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setWsStatus("disconnected");
    };

    return () => ws.close();
  }, []);

  // --- Handle selecting a device ---
  const handleDeviceSelect = (device) => {
    setSelectedDevice(device);

    // Initialize config state dynamically based on available capabilities
    const baseConfig = {
      deviceName: device.name || "",
      samplingRate: device.samplingRate || 1000,
      cameraResolution: device.cameraResolution || "640x480",
      compressionEnabled: device.compressionEnabled ?? true,
      otaEnabled: device.otaEnabled ?? true,
    };

    device.capabilities?.forEach((cap) => {
      baseConfig[`enable_${cap.id}`] = true; // assume enabled by default
    });

    setDeviceConfig(baseConfig);
  };

  // --- Handle config field changes ---
  const handleConfigChange = (field, value) => {
    setDeviceConfig((prev) => ({ ...prev, [field]: value }));
  };

  // --- Save configuration to backend ---
const handleSaveConfig = async () => {
  if (!selectedDevice) return;
  setSavingConfig(true);

  try {
    const updatedCapabilities = selectedDevice.capabilities.map((cap) => {
      if (cap.configurable)
        return {
          ...cap,
          enabled: !!deviceConfig[`enable_${cap.id}`],
        };
      return cap;
    });

    const response = await fetch(
      `${BACKEND_URL}/api/devices/${selectedDevice.deviceId}/configure`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceName: deviceConfig.deviceName,
          samplingRate: deviceConfig.samplingRate,
          cameraResolution: deviceConfig.cameraResolution,
          compressionEnabled: deviceConfig.compressionEnabled,
          otaEnabled: deviceConfig.otaEnabled,
          capabilities: updatedCapabilities,
        }),
      }
    );

    if (!response.ok) {
      alert("Failed to save configuration");
      return;
    }

    // ✅ Parse backend’s updated device
    const { device } = await response.json();

    // ✅ Update local states
    setSelectedDevice(device);
    setConnectedDevices((prev) =>
      prev.map((d) => (d.deviceId === device.deviceId ? device : d))
    );

    // ✅ Update config fields for display consistency
    const newConfig = {
      deviceName: device.name,
      samplingRate: device.samplingRate,
      cameraResolution: device.cameraResolution,
      compressionEnabled: device.compressionEnabled,
      otaEnabled: device.otaEnabled,
    };
    device.capabilities?.forEach((cap) => {
      newConfig[`enable_${cap.id}`] = cap.enabled ?? true;
    });
    setDeviceConfig(newConfig);

    alert("Configuration saved successfully!");
  } catch (err) {
    console.error("Error saving config:", err);
    alert("Error saving configuration");
  } finally {
    setSavingConfig(false);
  }
};


  const getStatusColor = (status) => {
    switch (status) {
      case "connected":
        return "text-green-500";
      case "error":
        return "text-yellow-500";
      case "disconnected":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getIcon = (capId) => {
    switch (capId) {
      case "camera":
        return <Camera className="w-5 h-5 text-gray-600" />;
      case "microphone":
        return <Mic className="w-5 h-5 text-gray-600" />;
      case "pzem004t":
        return <Zap className="w-5 h-5 text-gray-600" />;
      case "sd":
        return <HardDrive className="w-5 h-5 text-gray-600" />;
      default:
        return <Wifi className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              ESP32 Device Setup
            </h1>
            <p className="text-gray-600 mt-1">
              Configure and manage your ESP32 nodes
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Radio className={`w-5 h-5 ${getStatusColor(wsStatus)}`} />
            <span className="text-sm font-medium">
              WebSocket:{" "}
              <span className={getStatusColor(wsStatus)}>{wsStatus}</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Device List */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Wifi className="w-5 h-5" /> Connected Devices (
              {connectedDevices.length})
            </h2>

            <div className="space-y-3">
              {connectedDevices.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Wifi className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No devices connected</p>
                  <p className="text-sm mt-1">Waiting for ESP32 nodes...</p>
                </div>
              ) : (
                connectedDevices.map((device) => (
                  <div
                    key={device.deviceId}
                    onClick={() => handleDeviceSelect(device)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedDevice?.deviceId === device.deviceId
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {device.name || "Unnamed Device"}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {device.deviceId}
                        </p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {device.capabilities?.map((cap) => (
                        <span
                          key={cap.id}
                          className="px-2 py-1 bg-gray-100 text-xs rounded-full text-gray-700"
                        >
                          {cap.label}
                        </span>
                      ))}
                    </div>

                    <div className="text-xs text-gray-500 mt-2">
                      FW: {device.firmwareVersion || "Unknown"} | IP:{" "}
                      {device.publicIp || "N/A"}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Configuration Panel */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
            {selectedDevice ? (
              <>
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Settings className="w-5 h-5" /> Device Configuration
                </h2>

                <div className="space-y-6">
                  {/* Basic Settings */}
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-3">
                      Basic Settings
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Device Name
                        </label>
                        <input
                          type="text"
                          value={deviceConfig.deviceName || ""}
                          onChange={(e) =>
                            handleConfigChange("deviceName", e.target.value)
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="My ESP32 Device"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Sampling Rate (ms)
                        </label>
                        <input
                          type="number"
                          value={deviceConfig.samplingRate || 1000}
                          onChange={(e) =>
                            handleConfigChange(
                              "samplingRate",
                              parseInt(e.target.value)
                            )
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          min="100"
                          max="10000"
                          step="100"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sensors & Components */}
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-3">
                      Sensors & Components
                    </h3>

                    {selectedDevice.capabilities?.map((cap) => (
                      <div
                        key={cap.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mt-2"
                      >
                        <div className="flex items-center gap-3">
                          {getIcon(cap.id)}
                          <div>
                            <p className="font-medium">{cap.label}</p>
                            <p className="text-xs text-gray-500">
                              {cap.configurable
                                ? "Configurable"
                                : "Always enabled"}
                            </p>
                          </div>
                        </div>

                        {cap.configurable ? (
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!deviceConfig[`enable_${cap.id}`]}
                              onChange={(e) =>
                                handleConfigChange(
                                  `enable_${cap.id}`,
                                  e.target.checked
                                )
                              }
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        ) : (
                          <span className="text-sm text-gray-400 italic">
                            Always On
                          </span>
                        )}
                      </div>
                    ))}

                    {/* Camera extra settings */}
                    {selectedDevice.capabilities?.some(
                      (cap) => cap.id === "camera"
                    ) && (
                      <div className="ml-8 p-3 bg-blue-50 rounded-lg space-y-2 mt-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Resolution
                          </label>
                          <select
                            value={deviceConfig.cameraResolution || "640x480"}
                            onChange={(e) =>
                              handleConfigChange(
                                "cameraResolution",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            <option value="320x240">320x240 (QVGA)</option>
                            <option value="640x480">640x480 (VGA)</option>
                            <option value="800x600">800x600 (SVGA)</option>
                            <option value="1024x768">1024x768 (XGA)</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="compression"
                            checked={deviceConfig.compressionEnabled}
                            onChange={(e) =>
                              handleConfigChange(
                                "compressionEnabled",
                                e.target.checked
                              )
                            }
                            className="rounded"
                          />
                          <label
                            htmlFor="compression"
                            className="text-sm text-gray-700"
                          >
                            Enable compression
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Advanced Settings */}
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-3">
                      Advanced Settings
                    </h3>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">OTA Updates</p>
                        <p className="text-xs text-gray-500">
                          Enable over-the-air firmware updates
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={deviceConfig.otaEnabled}
                          onChange={(e) =>
                            handleConfigChange("otaEnabled", e.target.checked)
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={handleSaveConfig}
                      disabled={savingConfig}
                      className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {savingConfig ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Save Configuration
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Settings className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Select a device to configure</p>
                <p className="text-sm mt-2">
                  Choose a device from the list to view and modify its settings
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ESP32Setup;
