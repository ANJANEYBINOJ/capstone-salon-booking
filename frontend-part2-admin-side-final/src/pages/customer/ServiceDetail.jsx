import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Catalog } from "../../api";

export default function ServiceDetail() {
  const { id } = useParams();
  const [svc, setSvc] = useState(null);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [s, st] = await Promise.all([
          Catalog.service(id),
          Catalog.staffForService(id),
        ]);
        setSvc(s);
        setStaff(st);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <p className="p-8">Loading...</p>;
  if (error) return <p className="text-red-600 p-8">{error}</p>;
  if (!svc) return <p className="p-8">Service not found.</p>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800">{svc.name}</h2>
        <p className="mt-2 text-gray-600">{svc.description}</p>

        <div className="mt-4 flex items-center gap-6 text-gray-700 text-sm">
          <span className="bg-gray-100 px-3 py-1 rounded">
            Duration: {svc.duration_minutes} mins
          </span>
          <span className="bg-gray-100 px-3 py-1 rounded">
            Price: ${svc.base_price.toFixed(2)}
          </span>
        </div>

        <Link
          to={`/book?serviceId=${svc._id}`}
          className="inline-block mt-6 px-5 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 text-sm"
        >
          Book this service
        </Link>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Staff who perform this service
        </h3>
        {staff.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {staff.map((s) => (
              <div
                key={s._id}
                className="px-4 py-2 border rounded-lg shadow-sm bg-white text-sm"
              >
                <span className="font-medium">{s.name}</span>{" "}
                <span className="text-gray-500">{s.title}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No staff available for this service.</p>
        )}
      </div>
    </div>
  );
}
