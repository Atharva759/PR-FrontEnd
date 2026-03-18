const TenantDevices = ({
  tenantId,
  devices,
  newDeviceId,
  setNewDeviceId,
  onAssignDevice,
  onRemoveDevice,
  onClose
}) => {

  return (

    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

      <div className="bg-white rounded-xl w-[600px] p-6">

        <h2 className="text-xl font-semibold mb-4">
          Devices for Tenant
        </h2>



        {/* ASSIGN DEVICE */}

        <div className="flex gap-2 mb-4">

          <input
            placeholder="Device ID"
            value={newDeviceId}
            onChange={(e) => setNewDeviceId(e.target.value)}
            className="border p-2 rounded w-full"
          />

          <button
            onClick={onAssignDevice}
            className="bg-blue-600 text-white px-4 rounded"
          >
            Assign
          </button>

        </div>



        {/* DEVICE LIST */}

        <div className="space-y-2 max-h-[300px] overflow-y-auto">

          {devices.length === 0 ? (

            <p className="text-gray-500 text-center">
              No devices registered
            </p>

          ) : (

            devices.map((device) => (

              <div
                key={device.deviceId}
                className="flex justify-between border p-3 rounded"
              >

                <div>

                  <p className="font-medium">
                    {device.name || "Unnamed Device"}
                  </p>

                  <p className="text-sm text-gray-500">
                    MAC: {device.mac || "N/A"}
                  </p>

                  <p className="text-xs text-gray-400">
                    ID: {device.deviceId}
                  </p>

                </div>

                <button
                  onClick={() => onRemoveDevice(device.deviceId)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Remove
                </button>

              </div>

            ))

          )}

        </div>



        <div className="flex justify-end mt-5">

          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Close
          </button>

        </div>

      </div>

    </div>

  );

};

export default TenantDevices;