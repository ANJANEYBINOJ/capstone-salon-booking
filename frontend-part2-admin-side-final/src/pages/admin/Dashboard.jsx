import { useEffect, useState } from "react";
import { Admin } from "../../api";
import AdminSidebar from "../../components/AdminSidebar";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    Admin.dashboard()
      .then((data) => setSummary(data))
      .catch(console.error);
  }, []);

  if (!summary)
    return (
      <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
        <AdminSidebar />
        <main className="flex-1 p-4 sm:p-6 text-gray-800">
          <h1 className="text-xl sm:text-2xl font-bold mb-4">
            Admin Dashboard
          </h1>
          <p>Loading dashboard data...</p>
        </main>
      </div>
    );

  const { kpis = {}, schedule = [] } = summary;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">
          Admin Dashboard
        </h1>

        {/* KPI Section */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
          {Object.entries(kpis).map(([key, value]) => (
            <div
              key={key}
              className="bg-white p-4 sm:p-5 rounded-xl shadow hover:shadow-lg transition"
            >
              <h3 className="text-gray-500 text-sm mb-1 capitalize truncate">
                {key.replace(/([A-Z])/g, " $1")}
              </h3>
              <p className="text-2xl sm:text-3xl font-bold text-indigo-600">
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Schedule Section */}
        <div className="bg-white shadow rounded-xl p-4 sm:p-6 overflow-x-auto">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">
            Today’s Schedule
          </h2>

          {schedule.length === 0 ? (
            <p className="text-gray-500">No appointments scheduled today.</p>
          ) : (
            <table className="min-w-full border border-gray-200 text-xs sm:text-sm rounded">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-2 sm:p-3 border text-left">Booking ID</th>
                  <th className="p-2 sm:p-3 border text-left">Start</th>
                  <th className="p-2 sm:p-3 border text-left">End</th>
                  <th className="p-2 sm:p-3 border text-left">Status</th>
                  <th className="p-2 sm:p-3 border text-left">Staff</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {schedule.map((s) => (
                  <tr
                    key={s._id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="p-2 sm:p-3 border font-mono text-[11px] sm:text-xs">
                      {s._id?.slice(0, 8)}...
                    </td>
                    <td className="p-2 sm:p-3 border">
                      {new Date(s.start).toLocaleString()}
                    </td>
                    <td className="p-2 sm:p-3 border">
                      {new Date(s.end).toLocaleString()}
                    </td>
                    <td className="p-2 sm:p-3 border">
                      <span
                        className={`px-2 py-1 rounded text-[10px] sm:text-xs font-semibold ${
                          s.status === "confirmed"
                            ? "bg-green-100 text-green-700"
                            : s.status === "no_show"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="p-2 sm:p-3 border">
                      {s.staff_id || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
