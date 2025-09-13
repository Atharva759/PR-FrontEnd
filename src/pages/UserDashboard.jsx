import { TbLogout } from "react-icons/tb";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import toast from "react-hot-toast";

const UserDashboard = () => {
  const data = [
    {
      title: "Door Lock",
      img: "https://imgs.search.brave.com/7_559JkFqoO40o1g9tLpWS4SF9dztwANy61-tlpZl2I/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvOTYx/ODkyODUvcGhvdG8v/Y2xvc2UtdXAtb2Yt/ZmluZ2Vycy1pbnNl/cnRpbmctYS1rZXkt/aW50by1hLWRvb3It/bG9jay53ZWJwP2E9/MSZiPTEmcz02MTJ4/NjEyJnc9MCZrPTIw/JmM9MzdvSE03VjR5/Vm05RmtsVDBIY01J/UUNIZ2xwQ1Fhamo0/ZG1pZHBpRFp2Zz0",
      Desc: "Control access with a secure smart door lock.",
      Action: "Unlock",
    },
    {
      title: "Speak Person",
      img: "https://imgs.search.brave.com/CvzytguShM_4CUo3uFwDuc6TNZv4dkyO55mDRBNHgQs/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/cGl4YWJheS5jb20v/cGhvdG8vMjAxNi8x/MS8yOS8wMy80Mi9t/aWMtMTg2NzEyMV8x/MjgwLmpwZw",
      Desc: "Communicate in real time with visitors.",
      Action: "Speak",
    },
    {
      title: "Video Stream",
      img: "https://imgs.search.brave.com/ySbaW1gkhhqZz6zRjzwHDzDtzAYGQUxIsz0UzaeQmJQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWcu/ZnJlZXBpay5jb20v/cHJlbWl1bS1waG90/by93aGl0ZS1jY3R2/LWNhbWVyYS1vdXRk/b29yLXdhdGVycHJv/b2YtaXAtc2VjdXJp/dHktc3VydmVpbGxh/bmNlLXZpZGVvLWNh/bWVyYV8xMzQzOTgt/NjI3Ni5qcGc_c2Vt/dD1haXNfaHlicmlk/Jnc9NzQwJnE9ODA",
      Desc: "Watch live video streams for real-time security.",
      Action: "Watch",
    },
  ];
  const navigate = useNavigate();

  const logout = async () => {
    toast.promise(
    signOut(auth),
    {
      loading: 'Logging out...',
      success: () => {
        navigate("/");
        return <p>Logged out successfully!</p>;
      },
      error: (err) => <b>Logout failed: {err.message}</b>,
    }
  );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 m-6 p-4 bg-blue-600 text-white rounded-xl shadow-md">
        <h2 className="font-bold text-2xl tracking-wide text-center sm:text-left">
          Smart Dashboard
        </h2>
        <Link
          onClick={logout}
          to="/"
          className="flex justify-center items-center gap-2 px-4 py-2 bg-blue-900 hover:bg-blue-800 transition-all rounded-md font-medium cursor-pointer shadow-md"
        >
          <TbLogout size={22} /> Logout
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 m-6">
        {data.map((item, index) => (
          <div
            key={index}
            className="p-5 w-full border border-blue-100 shadow-lg rounded-xl bg-white hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
          >
            <h4 className="p-2 font-semibold text-xl text-blue-700 text-center">
              {item.title}
            </h4>
            <img
              src={item.img}
              width={300}
              height={200}
              alt={item.title}
              className="rounded-lg shadow-md object-cover w-full h-48"
            />
            <p className="p-3 text-gray-600 text-center">{item.Desc}</p>
            <button className="w-full mt-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-all font-medium shadow-md">
              {item.Action}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserDashboard;
