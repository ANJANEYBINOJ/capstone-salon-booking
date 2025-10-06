import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Catalog } from "../api";

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
        const data = await Catalog.services({
          categoryId,
          durationMin,
          durationMax,
        });
        setItems(data.items || data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [categoryId, durationMin, durationMax]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Services</h2>

      <div className="flex gap-3 flex-wrap">
        <input
          className="input w-40"
          placeholder="CategoryId"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        />
        <input
          className="input w-40"
          placeholder="Min mins"
          value={durationMin}
          onChange={(e) => setDurationMin(e.target.value)}
        />
        <input
          className="input w-40"
          placeholder="Max mins"
          value={durationMax}
          onChange={(e) => setDurationMax(e.target.value)}
        />
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items?.map((svc) => (
          <div key={svc._id} className="card">
            <div className="p-4">
              <h3 className="text-lg font-semibold">{svc.name}</h3>
              <p className="text-gray-600 text-sm line-clamp-2">
                {svc.description}
              </p>
              <div className="mt-3 flex items-center justify-between text-sm text-gray-700">
                <span>{svc.duration_minutes} mins</span>
                <span>${(svc.base_price / 100).toFixed(2)}</span>
              </div>
              <div className="mt-4 flex gap-2">
                <Link to={`/services/${svc._id}`} className="btn">
                  Details
                </Link>
                <Link
                  to={`/book?serviceId=${svc._id}`}
                  className="btn btn-primary"
                >
                  Book
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
