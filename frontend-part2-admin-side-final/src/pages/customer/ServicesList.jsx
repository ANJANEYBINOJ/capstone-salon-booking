import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Catalog } from "../../api";

export default function ServicesList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [categoryId, setCategoryId] = useState("");
  const [durationMin, setDurationMin] = useState("");
  const [durationMax, setDurationMax] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await Catalog.services({ categoryId, durationMin, durationMax });
        setItems(data.items || data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [categoryId, durationMin, durationMax]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Services</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        <input
          className="border rounded-md px-3 py-2 text-sm w-40 focus:ring focus:ring-indigo-300"
          placeholder="Category ID"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        />
        <input
          className="border rounded-md px-3 py-2 text-sm w-32 focus:ring focus:ring-indigo-300"
          placeholder="Min mins"
          value={durationMin}
          onChange={(e) => setDurationMin(e.target.value)}
        />
        <input
          className="border rounded-md px-3 py-2 text-sm w-32 focus:ring focus:ring-indigo-300"
          placeholder="Max mins"
          value={durationMax}
          onChange={(e) => setDurationMax(e.target.value)}
        />
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {/* Service Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items?.map((svc) => (
          <div
            key={svc._id}
            className="p-5 bg-white border rounded-xl shadow hover:shadow-lg transition-all"
          >
            <h3 className="text-lg font-semibold text-gray-800">{svc.name}</h3>
            <p className="text-gray-600 text-sm mt-1 line-clamp-2">{svc.description}</p>
            <div className="mt-3 flex items-center justify-between text-sm text-gray-700">
              <span>{svc.duration_minutes} mins</span>
              <span>${svc.base_price.toFixed(2)}</span>
            </div>
            <div className="mt-4 flex gap-2">
              <Link
                to={`/services/${svc._id}`}
                className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 text-sm"
              >
                Details
              </Link>
              <Link
                to={`/book?serviceId=${svc._id}`}
                className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 text-sm"
              >
                Book
              </Link>
            </div>
          </div>
        ))}
      </div>

      {!loading && !items?.length && (
        <p className="text-gray-500 mt-6 text-center">No services found.</p>
      )}
    </div>
  );
}
