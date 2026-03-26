import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = ["#36A2EB", "#FF6384", "#FFCE56", "#4BC0C0", "#9966FF"];

const FirebaseAnalytics = () => {
  const [providerData, setProviderData] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    const usersRef = collection(db, "users");

    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const providers = {};
      let total = 0;

      snapshot.docs.forEach((doc) => {
        const user = doc.data();
        const provider = user.provider || "other";

        providers[provider] = (providers[provider] || 0) + 1;
        total++;
      });

      const formattedData = Object.keys(providers).map((key) => ({
        name: key,
        value: providers[key],
      }));

      setProviderData(formattedData);
      setTotalUsers(total);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Admin Analytics</h1>

      {/* Total Users */}
      <div className="bg-white p-6 shadow-md mb-6 rounded-xl text-center">
        <h2 className="text-xl font-semibold">Total Users</h2>
        <p className="text-3xl font-bold mt-2">{totalUsers}</p>
      </div>

      {/* Pie Chart */}
      <div className="bg-white p-6 shadow-md w-max rounded-xl">
        <h3 className="text-lg font-semibold mb-4">
          Sign-Ins by Provider
        </h3>

        <PieChart width={400} height={300}>
          <Pie
            data={providerData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label
          >
            {providerData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>

          <Tooltip />
          <Legend />
        </PieChart>
      </div>
    </div>
  );
};

export default FirebaseAnalytics;