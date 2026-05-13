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
      icon: <MdPeople size={32} />,
      view: "manage",
      color: "from-blue-500 to-cyan-500",
      glow: "group-hover:shadow-blue-200",
    },
    {
      title: "Tenant Management",
      icon: <MdSettings size={32} />,
      view: "tenantmanage",
      color: "from-cyan-500 to-sky-500",
      glow: "group-hover:shadow-cyan-200",
    },
    {
      title: "Device Management",
      icon: <MdAdminPanelSettings size={32} />,
      view: "devicemanage",
      color: "from-indigo-500 to-blue-500",
      glow: "group-hover:shadow-indigo-200",
    },
    {
      title: "Admin Actions",
      icon: <MdAdminPanelSettings size={32} />,
      view: "adminactions",
      color: "from-blue-600 to-indigo-500",
      glow: "group-hover:shadow-blue-200",
    },
    {
      title: "Logs",
      icon: <MdAssignment size={32} />,
      view: "logs",
      color: "from-sky-500 to-cyan-500",
      glow: "group-hover:shadow-sky-200",
    },
    {
      title: "Monitoring",
      icon: <MdMonitor size={32} />,
      view: "monitoring",
      color: "from-cyan-600 to-blue-500",
      glow: "group-hover:shadow-cyan-200",
    },
  ];

  return (

    <div className="bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6 rounded-xl">

      {/* HEADER */}

      <div className="mb-8">

        <h2 className="text-4xl font-bold text-slate-800">
          Quick Actions
        </h2>

        <p className="text-slate-500 mt-2 text-lg">
          Manage your platform operations efficiently
        </p>

      </div>

      {/* ACTION GRID */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">

        {actions.map((item, index) => (

          <div
            key={index}
            onClick={() => setCurrentView(item.view)}
            className={`group relative overflow-hidden cursor-pointer rounded-3xl border border-blue-100 bg-white p-7 shadow-lg hover:shadow-2xl ${item.glow} hover:-translate-y-2 transition-all duration-300`}
          >

            {/* BACKGROUND GLOW */}

            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 to-cyan-50/30 opacity-0 group-hover:opacity-100 transition-all duration-300" />

            {/* CONTENT */}

            <div className="relative z-10 flex flex-col items-start">

              {/* ICON */}

              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${item.color} flex items-center justify-center text-white shadow-lg mb-5 group-hover:scale-110 transition-transform duration-300`}
              >

                {item.icon}

              </div>

              {/* TITLE */}

              <h3 className="text-xl font-bold text-slate-800 mb-2">
                {item.title}
              </h3>

              {/* SUBTEXT */}

              <p className="text-slate-500 text-sm leading-relaxed">
                Access and manage {item.title.toLowerCase()} features from the admin dashboard.
              </p>

              

            </div>

          </div>

        ))}

      </div>

    </div>

  );

};

export default QuickActions;