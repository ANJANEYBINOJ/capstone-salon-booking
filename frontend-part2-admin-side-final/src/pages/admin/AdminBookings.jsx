import { useEffect, useState } from "react";
import { Admin } from "../../api";
import AdminSidebar from "../../components/AdminSidebar";
import toast, { Toaster } from "react-hot-toast";

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reschedule, setReschedule] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [staff, setStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("");

  // NEW: confirmation modal state
  const [confirmCancelId, setConfirmCancelId] = useState(null);
  const [confirmNoShowId, setConfirmNoShowId] = useState(null);

  // Load bookings
  useEffect(() => {
    let ignore = false;
    async function fetchBookings() {
      try {
        setLoading(true);
        const res = await Admin.bookings();
        const list = Array.isArray(res) ? res : res.items || res.bookings || [];
        if (!ignore) setBookings(list);
      } catch (error) {
        console.error("Error loading bookings:", error);
        toast.error("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
    return () => {
      ignore = true;
    };
  }, []);

  // Load staff for dropdown
  useEffect(() => {
    async function loadStaff() {
      try {
        const res = await Admin.staff();
        const list = Array.isArray(res) ? res : res.items || [];
        setStaff(list);
      } catch (error) {
        console.error("Error loading staff:", error);
        toast.error("Could not load staff list");
      }
    }
    loadStaff();
  }, []);

  const handleCancel = async (id) => {
    try {
      await Admin.cancelBooking(id);
      toast.success("Booking cancelled successfully");
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status: "cancelled" } : b))
      );
    } catch (error) {
      console.error("Cancel failed:", error);
      toast.error("Failed to cancel booking");
    }
  };

  const handleNoShow = async (id) => {
    try {
      await Admin.noShowBooking(id);
      toast.success("Marked as no-show");
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status: "no_show" } : b))
      );
    } catch (error) {
      console.error("Mark no-show failed:", error);
      toast.error("Failed to mark as no-show");
    }
  };

  const handleRescheduleSubmit = async () => {
    if (!newDate) return toast.error("Please select a new date and time");
    try {
      await Admin.rescheduleBooking(reschedule._id, {
        start_datetime: newDate,
        staff_id: selectedStaff || reschedule.staff_id?._id || null,
      });
      toast.success("Booking rescheduled successfully");
      setReschedule(null);
      setNewDate("");
      setSelectedStaff("");
      const refreshed = await Admin.bookings();
      setBookings(Array.isArray(refreshed) ? refreshed : refreshed.items || []);
    } catch (error) {
      console.error("Reschedule failed:", error);
      toast.error("Failed to reschedule. Please try another time.");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      <Toaster position="top-right" reverseOrder={false} />
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-6 overflow-x-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">
          Manage Bookings
        </h1>

        {loading && bookings.length === 0 ? (
          <p className="text-gray-500">Loading bookings...</p>
        ) : Array.isArray(bookings) && bookings.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full text-xs sm:text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-2 sm:p-3 text-left border">Customer</th>
                  <th className="p-2 sm:p-3 text-left border">Service</th>
                  <th className="p-2 sm:p-3 text-left border">Staff</th>
                  <th className="p-2 sm:p-3 text-left border">Start Time</th>
                  <th className="p-2 sm:p-3 text-left border">Status</th>
                  <th className="p-2 sm:p-3 text-left border">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {bookings.map((b) => (
                  <tr
                    key={b._id || b.id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="p-2 sm:p-3 border">{b.customer_id?.name || "—"}</td>
                    <td className="p-2 sm:p-3 border">{b.service_id?.name || "—"}</td>
                    <td className="p-2 sm:p-3 border">{b.staff_id?.name || "—"}</td>
                    <td className="p-2 sm:p-3 border whitespace-nowrap">
                      {b.start_datetime
                        ? new Date(b.start_datetime).toLocaleString()
                        : "—"}
                    </td>
                    <td className="p-2 sm:p-3 border">
                      <span
                        className={`px-2 py-1 rounded text-[10px] sm:text-xs font-semibold ${
                          b.status === "confirmed"
                            ? "bg-green-100 text-green-700"
                            : b.status === "cancelled"
                            ? "bg-red-100 text-red-700"
                            : b.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : b.status === "no_show"
                            ? "bg-gray-300 text-gray-800"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="p-2 sm:p-3 border space-x-1 sm:space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => setReschedule(b)}
                        className="text-indigo-600 text-xs sm:text-sm hover:underline"
                      >
                        Reschedule
                      </button>
                      <button
                        onClick={() => setConfirmCancelId(b._id)} // OPEN confirm modal
                        className="text-red-600 text-xs sm:text-sm hover:underline"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => setConfirmNoShowId(b._id)} // OPEN confirm modal
                        className="text-gray-500 text-xs sm:text-sm hover:underline"
                      >
                        No-show
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No bookings available.</p>
        )}

        {/* Reschedule Modal */}
        {reschedule && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white w-full max-w-md p-4 sm:p-6 rounded-xl shadow-lg">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">
                Reschedule Booking
              </h2>

              <label className="block text-sm mb-2 text-gray-700">
                New Date & Time:
              </label>
              <input
                type="datetime-local"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full p-2 mb-4 rounded border"
              />

              <label className="block text-sm mb-2 text-gray-700">
                Assign to Staff:
              </label>
              <select
                value={selectedStaff}
                onChange={(e) => setSelectedStaff(e.target.value)}
                className="w-full p-2 mb-4 rounded border"
              >
                <option value="">Keep same</option>
                {staff.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>

              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4">
                <button
                  onClick={() => setReschedule(null)}
                  className="w-full sm:w-auto px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRescheduleSubmit}
                  className="w-full sm:w-auto px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Cancel Modal */}
        {confirmCancelId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white w-full max-w-sm p-5 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900">Cancel booking?</h3>
              <p className="mt-2 text-sm text-gray-600">
                This will cancel the booking. You can’t undo this action.
              </p>
              <div className="mt-5 flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={() => setConfirmCancelId(null)}
                  className="w-full sm:w-auto px-4 py-2 rounded border hover:bg-gray-50"
                >
                  Keep Booking
                </button>
                <button
                  onClick={async () => {
                    const id = confirmCancelId;
                    setConfirmCancelId(null);
                    await handleCancel(id);
                  }}
                  className="w-full sm:w-auto px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirm No-show Modal */}
        {confirmNoShowId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white w-full max-w-sm p-5 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900">Mark as no-show?</h3>
              <p className="mt-2 text-sm text-gray-600">
                This marks the customer as a no-show for this appointment.
              </p>
              <div className="mt-5 flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={() => setConfirmNoShowId(null)}
                  className="w-full sm:w-auto px-4 py-2 rounded border hover:bg-gray-50"
                >
                  Never mind
                </button>
                <button
                  onClick={async () => {
                    const id = confirmNoShowId;
                    setConfirmNoShowId(null);
                    await handleNoShow(id);
                  }}
                  className="w-full sm:w-auto px-4 py-2 rounded bg-gray-800 text-white hover:bg-gray-900"
                >
                  Yes, Mark No-show
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
