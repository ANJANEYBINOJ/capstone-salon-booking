import { useEffect, useState } from "react";
import { Admin } from "../../api";
import AdminSidebar from "../../components/AdminSidebar";
import toast, { Toaster } from "react-hot-toast";

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: "",
    base_price: "",
    duration_minutes: "",
    category_id: "",
    description: "",
  });
  const [editForm, setEditForm] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load categories & services
  const loadData = async () => {
    try {
      setLoading(true);
      const [svcRes, catRes] = await Promise.all([
        Admin.services(),
        Admin.categories(),
      ]);

      const svcList = Array.isArray(svcRes)
        ? svcRes
        : svcRes.items || svcRes.services || [];
      const catList = Array.isArray(catRes)
        ? catRes
        : catRes.items || [];

      setServices(svcList);
      setCategories(catList);
    } catch (err) {
      console.error("Error loading data:", err);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Add Service
  const addService = async () => {
    if (!form.name || !form.category_id) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      setLoading(true);
      await Admin.addService({
        ...form,
        base_price: Number(form.base_price),
        duration_minutes: Number(form.duration_minutes),
      });
      setForm({
        name: "",
        base_price: "",
        duration_minutes: "",
        category_id: "",
        description: "",
      });
      await loadData();
      toast.success("Service added successfully");
    } catch (err) {
      console.error("Error adding service:", err);
      toast.error("Failed to add service");
    } finally {
      setLoading(false);
    }
  };

  // Edit / Update
  const startEdit = (s) => setEditForm({ ...s });
  const cancelEdit = () => setEditForm(null);

  const updateService = async () => {
    if (!editForm.name) return toast.error("Service name required");
    try {
      setLoading(true);
      await Admin.updateService(editForm._id, {
        name: editForm.name,
        description: editForm.description,
        duration_minutes: Number(editForm.duration_minutes),
        base_price: Number(editForm.base_price),
        category_id: editForm.category_id,
        active: editForm.active,
      });
      setEditForm(null);
      await loadData();
      toast.success("Service updated successfully");
    } catch (err) {
      console.error("Error updating service:", err);
      toast.error("Failed to update service");
    } finally {
      setLoading(false);
    }
  };

  // Delete Service
  const deleteService = async (id) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    try {
      await Admin.deleteService(id);
      setServices((prev) => prev.filter((s) => s._id !== id));
      toast.success("Service deleted");
    } catch (err) {
      console.error("Error deleting service:", err);
      toast.error("Failed to delete service");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      <Toaster position="top-right" reverseOrder={false} />
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">
          Manage Services
        </h1>

        {/* Add Form */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow mb-8 flex flex-col sm:flex-row flex-wrap gap-3 sm:items-center">
          <input
            placeholder="Service Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border p-2 rounded flex-1 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <input
            type="number"
            placeholder="Base Price"
            value={form.base_price}
            onChange={(e) => setForm({ ...form, base_price: e.target.value })}
            className="border p-2 rounded w-full sm:w-32 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <input
            type="number"
            placeholder="Duration (min)"
            value={form.duration_minutes}
            onChange={(e) =>
              setForm({ ...form, duration_minutes: e.target.value })
            }
            className="border p-2 rounded w-full sm:w-32 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <select
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            className="border p-2 rounded w-full sm:w-auto bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
          <input
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="border p-2 rounded flex-1 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <button
            onClick={addService}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-md transition w-full sm:w-auto"
          >
            {loading ? "Saving..." : "Add Service"}
          </button>
        </div>

        {/* Service List */}
        {loading && services.length === 0 ? (
          <p className="text-gray-500">Loading...</p>
        ) : services.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <div
                key={s._id}
                className="p-5 bg-white rounded-xl shadow hover:shadow-lg transition flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {s.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    ₨ {s.base_price} • {s.duration_minutes} min
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Category:{" "}
                    <span className="font-medium text-gray-700">
                      {categories.find((c) => c._id === s.category_id)?.name ||
                        "Uncategorized"}
                    </span>
                  </p>
                  {s.description && (
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                      {s.description}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 mt-4">
                  <button
                    onClick={() => startEdit(s)}
                    className="flex-1 text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-2 rounded text-sm font-medium text-center"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteService(s._id)}
                    className="flex-1 text-red-600 hover:text-red-700 bg-red-50 px-3 py-2 rounded text-sm font-medium text-center"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No services found.</p>
        )}

        {/* Edit Modal */}
        {editForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">
                Edit Service
              </h2>
              <input
                placeholder="Service Name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                className="border p-2 rounded w-full mb-3 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <input
                type="number"
                placeholder="Base Price"
                value={editForm.base_price}
                onChange={(e) =>
                  setEditForm({ ...editForm, base_price: e.target.value })
                }
                className="border p-2 rounded w-full mb-3 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <input
                type="number"
                placeholder="Duration (min)"
                value={editForm.duration_minutes}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    duration_minutes: e.target.value,
                  })
                }
                className="border p-2 rounded w-full mb-3 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <select
                value={editForm.category_id}
                onChange={(e) =>
                  setEditForm({ ...editForm, category_id: e.target.value })
                }
                className="border p-2 rounded w-full mb-3 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <input
                placeholder="Description"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                className="border p-2 rounded w-full mb-3 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none"
              />

              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={cancelEdit}
                  className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  onClick={updateService}
                  className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 w-full sm:w-auto"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
