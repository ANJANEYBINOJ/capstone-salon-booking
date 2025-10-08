import { useEffect, useState } from "react";
import { Admin } from "../../api";
import AdminSidebar from "../../components/AdminSidebar";
import toast, { Toaster } from "react-hot-toast";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", display_order: 0 });
  const [editForm, setEditForm] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load categories
  const load = async () => {
    try {
      setLoading(true);
      const res = await Admin.categories();
      const list = Array.isArray(res) ? res : res.items || [];
      setCategories(list.sort((a, b) => a.display_order - b.display_order));
    } catch (err) {
      console.error("Error loading categories:", err);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Add new category
  const addCategory = async () => {
    if (!form.name.trim()) return toast.error("Category name is required");
    try {
      setLoading(true);
      await Admin.addCategory(form);
      setForm({ name: "", description: "", display_order: 0 });
      await load();
      toast.success("Category added successfully");
    } catch (err) {
      console.error("Error adding category:", err);
      toast.error(err.message || "Failed to add category");
    } finally {
      setLoading(false);
    }
  };

  // Delete category
  const deleteCategory = async (id) => {
    if (!confirm("Delete this category?")) return;
    try {
      await Admin.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c._id !== id));
      toast.success("Category deleted");
    } catch (err) {
      console.error("Error deleting category:", err);
      toast.error("Failed to delete category");
    }
  };

  // Edit category
  const startEdit = (c) => setEditForm({ ...c });
  const cancelEdit = () => setEditForm(null);

  const updateCategory = async () => {
    if (!editForm.name.trim()) return toast.error("Category name is required");
    try {
      setLoading(true);
      await Admin.updateCategory(editForm._id, {
        name: editForm.name,
        description: editForm.description,
        display_order: editForm.display_order,
      });
      setEditForm(null);
      await load();
      toast.success("Category updated successfully");
    } catch (err) {
      console.error("Error updating category:", err);
      toast.error("Failed to update category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      <Toaster position="top-right" reverseOrder={false} />
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">
          Manage Categories
        </h1>

        {/* Add Category Form */}
        <div className="bg-white shadow rounded-xl p-4 sm:p-6 mb-8 flex flex-col sm:flex-row gap-3 sm:items-center">
          <input
            placeholder="Category Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border border-gray-300 p-2 rounded flex-1 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <input
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="border border-gray-300 p-2 rounded flex-1 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <input
            type="number"
            placeholder="Display Order"
            value={form.display_order}
            onChange={(e) => setForm({ ...form, display_order: e.target.value })}
            className="border border-gray-300 p-2 rounded w-full sm:w-32 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <button
            onClick={addCategory}
            disabled={loading}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-md transition font-medium"
          >
            {loading ? "Saving..." : "Add Category"}
          </button>
        </div>

        {/* Category List */}
        {loading && categories.length === 0 ? (
          <p className="text-gray-500">Loading categories...</p>
        ) : categories.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => (
              <div
                key={c._id}
                className="p-5 bg-white rounded-xl shadow hover:shadow-lg transition flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {c.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {c.description || "No description provided"}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Order:{" "}
                    <span className="font-medium text-gray-700">
                      {c.display_order}
                    </span>
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 mt-4">
                  <button
                    onClick={() => startEdit(c)}
                    className="flex-1 text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-2 rounded text-sm font-medium text-center"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteCategory(c._id)}
                    className="flex-1 text-red-600 hover:text-red-700 bg-red-50 px-3 py-2 rounded text-sm font-medium text-center"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No categories yet.</p>
        )}

        {/* Edit Modal */}
        {editForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white w-full max-w-md p-5 sm:p-6 rounded-xl shadow-lg">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">
                Edit Category
              </h2>

              <input
                placeholder="Category Name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                className="border p-2 rounded w-full mb-3 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <input
                placeholder="Description"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                className="border p-2 rounded w-full mb-3 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <input
                type="number"
                placeholder="Display Order"
                value={editForm.display_order}
                onChange={(e) =>
                  setEditForm({ ...editForm, display_order: e.target.value })
                }
                className="border p-2 rounded w-full mb-4 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none"
              />

              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={cancelEdit}
                  className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  onClick={updateCategory}
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
