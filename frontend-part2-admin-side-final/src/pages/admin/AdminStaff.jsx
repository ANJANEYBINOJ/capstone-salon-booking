import { useEffect, useState } from "react";
import { Admin } from "../../api";
import AdminSidebar from "../../components/AdminSidebar";
import toast, { Toaster } from "react-hot-toast";

export default function AdminStaff() {
  const [staff, setStaff] = useState([]);
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({ name: "", title: "", service_ids: [] });
  const [editForm, setEditForm] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load data
  const loadData = async () => {
    try {
      setLoading(true);
      const [staffRes, serviceRes] = await Promise.all([
        Admin.staff(),
        Admin.services(),
      ]);

      const staffList = Array.isArray(staffRes)
        ? staffRes
        : staffRes.items || staffRes.data || [];
      const serviceList = Array.isArray(serviceRes)
        ? serviceRes
        : serviceRes.items || serviceRes.data || [];

      setStaff(staffList);
      setServices(serviceList);
    } catch (err) {
      console.error("Error loading staff:", err);
      toast.error("Failed to load staff or services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Add Staff
  const addStaff = async () => {
    if (!form.name) return toast.error("Name is required");
    try {
      setLoading(true);
      await Admin.addStaff(form);
      setForm({ name: "", title: "", service_ids: [] });
      await loadData();
      toast.success("Staff added successfully");
    } catch (err) {
      console.error("Error adding staff:", err);
      toast.error("Failed to add staff");
    } finally {
      setLoading(false);
    }
  };

  // Edit / Update
  const startEdit = (s) => setEditForm({ ...s });
  const cancelEdit = () => setEditForm(null);

  const updateStaff = async () => {
    try {
      setLoading(true);
      await Admin.updateStaff(editForm._id, editForm);
      setEditForm(null);
      await loadData();
      toast.success("Staff updated successfully");
    } catch (err) {
      console.error("Error updating staff:", err);
      toast.error("Failed to update staff");
    } finally {
      setLoading(false);
    }
  };

  // Delete Staff
  const deleteStaff = async (id) => {
    if (!confirm("Delete this staff member?")) return;
    try {
      await Admin.deleteStaff(id);
      setStaff((prev) => prev.filter((s) => s._id !== id));
      toast.success("Staff deleted");
    } catch {
      toast.error("Failed to delete staff");
    }
  };

  // View Availability
  const viewAvailability = async (id) => {
    try {
      const res = await Admin.getStaffAvailability(id);
      setAvailability(res.week || []);
    } catch {
      toast.error("Failed to load availability");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      <Toaster position="top-right" reverseOrder={false} />
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">
          Manage Staff
        </h1>

        {/* Add Form */}
        <div className="bg-white shadow rounded-xl p-4 sm:p-6 mb-8 flex flex-col sm:flex-row gap-3 sm:items-center">
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border p-2 rounded flex-1 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="border p-2 rounded flex-1 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <select
            multiple
            value={form.service_ids}
            onChange={(e) =>
              setForm({
                ...form,
                service_ids: Array.from(
                  e.target.selectedOptions,
                  (opt) => opt.value
                ),
              })
            }
            className="border p-2 rounded bg-gray-50 min-w-[140px]"
          >
            {services.map((svc) => (
              <option key={svc._id} value={svc._id}>
                {svc.name}
              </option>
            ))}
          </select>
          <button
            onClick={addStaff}
            disabled={loading}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-md transition font-medium"
          >
            {loading ? "Saving..." : "Add Staff"}
          </button>
        </div>

        {/* Staff List */}
        {loading && staff.length === 0 ? (
          <p className="text-gray-500">Loading staff...</p>
        ) : staff.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {staff.map((s) => (
              <div
                key={s._id}
                className="p-5 bg-white rounded-xl shadow hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {s.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {s.title || "—"}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Services:{" "}
                    <span className="font-medium text-gray-700">
                      {s.service_ids?.length
                        ? s.service_ids.length
                        : "None assigned"}
                    </span>
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 mt-4">
                  <button
                    onClick={() => startEdit(s)}
                    className="flex-1 text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-2 rounded text-sm font-medium text-center"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => viewAvailability(s._id)}
                    className="flex-1 text-green-600 hover:text-green-700 bg-green-50 px-3 py-2 rounded text-sm font-medium text-center"
                  >
                    Availability
                  </button>
                  <button
                    onClick={() => deleteStaff(s._id)}
                    className="flex-1 text-red-600 hover:text-red-700 bg-red-50 px-3 py-2 rounded text-sm font-medium text-center"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No staff found.</p>
        )}

        {/* Edit Modal */}
        {editForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white w-full max-w-md p-5 sm:p-6 rounded-xl shadow-lg">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">
                Edit Staff
              </h2>

              <input
                placeholder="Name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                className="border p-2 rounded w-full mb-3 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <input
                placeholder="Title"
                value={editForm.title}
                onChange={(e) =>
                  setEditForm({ ...editForm, title: e.target.value })
                }
                className="border p-2 rounded w-full mb-3 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <select
                multiple
                value={editForm.service_ids}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    service_ids: Array.from(
                      e.target.selectedOptions,
                      (opt) => opt.value
                    ),
                  })
                }
                className="border p-2 rounded w-full mb-3 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {services.map((svc) => (
                  <option key={svc._id} value={svc._id}>
                    {svc.name}
                  </option>
                ))}
              </select>

              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={cancelEdit}
                  className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  onClick={updateStaff}
                  className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 w-full sm:w-auto"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Availability Modal */}
        {availability.length > 0 && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white w-full max-w-lg p-5 sm:p-6 rounded-xl shadow-lg">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">
                Weekly Availability
              </h2>
              <ul className="space-y-2 text-sm text-gray-700">
                {availability.map((day, i) => (
                  <li key={i} className="border-b border-gray-200 pb-1">
                    <strong>
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
                        day.weekday
                      ]}
                      :
                    </strong>{" "}
                    {day.start_time}–{day.end_time}
                    {day.breaks?.length > 0 && (
                      <span className="ml-2 text-xs text-gray-500">
                        (Breaks:{" "}
                        {day.breaks
                          .map((b) => `${b.start}–${b.end}`)
                          .join(", ")}
                        )
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setAvailability([])}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
