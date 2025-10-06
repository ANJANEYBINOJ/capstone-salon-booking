import { useEffect, useState } from "react";
import { Bookings } from "../api";

export default function MyAppointments() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await Bookings.mine();
        setItems(data.items || data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">My Appointments</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      <div className="space-y-3">
        {items.map((b) => (
          <div key={b._id} className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">
                  {new Date(b.start_datetime).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Status: {b.status}</div>
              </div>
              <div className="text-right">
                <div className="text-sm">
                  Price: ${(b.price_snapshot / 100).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        ))}
        {!loading && !items.length && (
          <p className="text-gray-600">No appointments yet.</p>
        )}
      </div>
    </div>
  );
}
