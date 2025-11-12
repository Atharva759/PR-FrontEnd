import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = ["#36A2EB", "#FF6384"];

const FirebaseAnalytics = () => {
  const [googleCount, setGoogleCount] = useState(0);
  const [emailCount, setEmailCount] = useState(0);
  const [providerData, setProviderData] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const usersRef = collection(db, "users");
      const snapshot = await getDocs(usersRef);
      const allUsers = snapshot.docs.map((doc) => doc.data());

      const providers = {};
      allUsers.forEach((user) => {
        const provider = user.provider || "unknown";
        providers[provider] = (providers[provider] || 0) + 1;
      });

      const google = providers["google"] || 0;
      const email = providers["email"] || 0;

      setGoogleCount(google);
      setEmailCount(email);
      setProviderData([
        { name: "Google", value: google },
        { name: "Email", value: email },
      ]);
    };

    fetchUsers();
  }, []);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Sign-In Analytics</h1>

      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="bg-white p-6 shadow-md flex-1 text-center rounded-xl">
          <h2 className="text-xl font-semibold">Google Sign-Ins</h2>
          <p className="text-3xl font-bold mt-2">{googleCount}</p>
        </div>

        <div className="bg-white p-6 shadow-md flex-1 text-center rounded-xl">
          <h2 className="text-xl font-semibold">Email Sign-Ins</h2>
          <p className="text-3xl font-bold mt-2">{emailCount}</p>
        </div>
      </div>

      <div className="bg-white p-6 shadow-md w-max rounded-xl">
        <h3 className="text-lg font-semibold mb-4">Sign-Ins by Provider</h3>
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
