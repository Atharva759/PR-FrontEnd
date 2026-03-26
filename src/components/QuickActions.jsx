import {
  MdPeople,
  MdSettings,
  MdAdminPanelSettings,
  MdAssignment,
  MdMonitor,
} from "react-icons/md";

const QuickActions = ({ setCurrentView }) => {
  const actions = [
    {
      title: "Manage Users",
      icon: <MdPeople size={30} />,
      view: "manage",
    },
    {
      title: "Tenant Management",
      icon: <MdSettings size={30} />,
      view: "tenantmanage",
    },
    {
      title: "Device Management",
      icon: <MdAdminPanelSettings size={30} />,
      view: "devicemanage",
    },
    {
      title: "Admin Actions",
      icon: <MdAdminPanelSettings size={30} />,
      view: "adminactions",
    },
    {
      title: "Logs",
      icon: <MdAssignment size={30} />,
      view: "logs",
    },
    {
      title: "Monitoring",
      icon: <MdMonitor size={30} />,
      view: "monitoring",
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Quick Actions
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {actions.map((item, index) => (
          <div
            key={index}
            onClick={() => setCurrentView(item.view)}
            className="cursor-pointer bg-blue-50 hover:bg-blue-100 p-6 rounded-xl shadow-md hover:shadow-xl transition-all flex flex-col items-center justify-center text-center"
          >
            <div className="text-blue-600 mb-3">{item.icon}</div>
            <h3 className="font-semibold text-gray-700">
              {item.title}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;