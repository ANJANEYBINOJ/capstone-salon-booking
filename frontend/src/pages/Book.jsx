import { useEffect, useMemo, useState } from "react";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Link,
  Navigate,
} from "react-router-dom";
import { Catalog, Availability, Bookings } from "../api";
import { useAuth } from "../auth/AuthContext";

/* ----------------------------- helpers ----------------------------- */
function Stepper({ step }) {
  const steps = ["Service", "Staff", "Date/Time", "Confirm"];
  return (
    <div className="flex items-center gap-3 text-sm mb-6">
      {steps.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div
            className={`w-6 h-6 rounded-full grid place-items-center text-white text-xs ${
              step === i + 1 ? "bg-blue-600" : "bg-gray-400"
            }`}
          >
            {i + 1}
          </div>
          <span className={`${step === i + 1 ? "font-semibold" : ""}`}>
            {label}
          </span>
          {i < steps.length - 1 && (
            <div className="w-8 h-px bg-gray-300 mx-2" />
          )}
        </div>
      ))}
    </div>
  );
}
const useQS = () => {
  const { search } = useLocation();
  return useMemo(() => Object.fromEntries(new URLSearchParams(search)), [search]);
};

/* --------------------------- Step 1: Service --------------------------- */
function Step1Service() {
  const qs = useQS();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [selected, setSelected] = useState(qs.serviceId || "");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await Catalog.services();
        setServices(data.items || data);
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-4">
      <Stepper step={1} />
      <div className="rounded-xl bg-white p-4 shadow">
        <h3 className="font-semibold mb-3">Select a service</h3>
        {loading && <p>Loading...</p>}
        {err && <p className="text-red-600">{err}</p>}
        <div className="grid sm:grid-cols-2 gap-3">
          {services.map((s) => (
            <label
              key={s._id}
              className={`rounded-xl border bg-white px-4 py-3 shadow-sm cursor-pointer ${
                selected === s._id ? "ring-2 ring-blue-500" : ""
              }`}
            >
              <input
                type="radio"
                name="svc"
                className="hidden"
                value={s._id}
                onChange={() => setSelected(s._id)}
                checked={selected === s._id}
              />
              <div className="flex flex-col">
                <span className="font-medium">{s.name}</span>
                <span className="text-sm text-gray-600">
                  {s.duration_minutes} mins • ${(s.base_price / 100).toFixed(2)}
                </span>
              </div>
            </label>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <button
            className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            disabled={!selected}
            onClick={() => navigate(`/book/staff?serviceId=${selected}`)}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------- Step 2: Staff ---------------------------- */
function Step2Staff() {
  const qs = useQS();
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [selected, setSelected] = useState("any");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!qs.serviceId) return navigate("/book");
    (async () => {
      try {
        const data = await Catalog.staffForService(qs.serviceId);
        setStaff(data);
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [qs.serviceId, navigate]);

  const next = () => {
    const param = selected === "any" ? "" : `&staffId=${selected}`;
    navigate(`/book/time?serviceId=${qs.serviceId}${param}`);
  };

  return (
    <div className="space-y-4">
      <Stepper step={2} />
      <div className="rounded-xl bg-white p-4 shadow">
        <h3 className="font-semibold mb-3">Choose staff</h3>
        {loading && <p>Loading...</p>}
        {err && <p className="text-red-600">{err}</p>}
        <div className="flex flex-col gap-2">
          <label
            className={`rounded-xl border bg-white px-4 py-3 shadow-sm cursor-pointer ${
              selected === "any" ? "ring-2 ring-blue-500" : ""
            }`}
          >
            <input
              type="radio"
              name="st"
              className="hidden"
              value="any"
              onChange={() => setSelected("any")}
              checked={selected === "any"}
            />
            <div>Any available staff</div>
          </label>

          {staff.map((s) => (
            <label
              key={s._id}
              className={`rounded-xl border bg-white px-4 py-3 shadow-sm cursor-pointer ${
                selected === s._id ? "ring-2 ring-blue-500" : ""
              }`}
            >
              <input
                type="radio"
                name="st"
                className="hidden"
                value={s._id}
                onChange={() => setSelected(s._id)}
                checked={selected === s._id}
              />
              <div>
                {s.name}{" "}
                <span className="text-gray-500 text-sm">{s.title}</span>
              </div>
            </label>
          ))}
        </div>

        <div className="mt-4 flex justify-between">
          <button
            className="inline-flex items-center rounded-md border px-4 py-2 text-sm bg-white hover:bg-gray-50"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
          <button
            className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
            onClick={next}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

/* --------------------------- Step 3: Date/Time -------------------------- */
function Step3Time() {
  const qs = useQS();
  const navigate = useNavigate();
  const [date, setDate] = useState(
    qs.date || new Date(Date.now() + 86400000).toISOString().slice(0, 10)
  );
  const [slots, setSlots] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!qs.serviceId) return navigate("/book");
    (async () => {
      setLoading(true);
      try {
        const data = await Availability.get({
          serviceId: qs.serviceId,
          date,
          staffId: qs.staffId,
        });
        setSlots(data.slots || []);
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [qs.serviceId, qs.staffId, date, navigate]);

  const next = () => {
    if (!selected) return;
    const params = new URLSearchParams({
      serviceId: qs.serviceId,
      start: selected.start,
      ...(selected.staff_id ? { staffId: selected.staff_id } : {}),
    });
    navigate(`/book/confirm?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      <Stepper step={3} />
      <div className="rounded-xl bg-white p-4 shadow">
        <div className="flex items-end gap-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Pick a date
            </label>
            <input
              type="date"
              className="w-48 rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-4">
          <h4 className="font-semibold mb-2">Available time slots</h4>
          {loading && <p>Loading...</p>}
          {err && <p className="text-red-600">{err}</p>}
          {!loading && slots.length === 0 && (
            <p className="text-gray-600">
              No slots. Try another date or select “Any” staff.
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {slots.map((s, i) => (
              <button
                key={i}
                onClick={() => setSelected(s)}
                className={`rounded-lg border px-3 py-1 ${
                  selected?.start === s.start
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white hover:bg-gray-50"
                }`}
                title={new Date(s.start).toLocaleString()}
              >
                {new Date(s.start).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex justify-between">
          <button
            className="inline-flex items-center rounded-md border px-4 py-2 text-sm bg-white hover:bg-gray-50"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
          <button
            className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            disabled={!selected}
            onClick={next}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

/* --------------------------- Step 4: Confirm --------------------------- */
function Step4Confirm() {
  const { user } = useAuth();
  const qs = useQS();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const start = qs.start;
  const staffId = qs.staffId || null;

  useEffect(() => {
    if (!qs.serviceId || !start) return navigate("/book");
    (async () => setService(await Catalog.service(qs.serviceId)))();
  }, [qs.serviceId, start, navigate]);

  const confirm = async () => {
    try {
      setSubmitting(true);
      await Bookings.create({
        service_id: qs.serviceId,
        staff_id: staffId,
        start_datetime: start,
      });
      navigate("/me/appointments");
    } catch (e) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="space-y-4">
      <Stepper step={4} />
      <div className="rounded-xl bg-white p-4 shadow">
        <h3 className="font-semibold mb-3">Confirm your booking</h3>
        {!service ? (
          <p>Loading…</p>
        ) : (
          <div className="space-y-1 text-gray-800">
            <div>
              <span className="font-medium">Service:</span> {service.name}
            </div>
            <div>
              <span className="font-medium">Duration:</span>{" "}
              {service.duration_minutes} mins
            </div>
            <div>
              <span className="font-medium">Price:</span>{" "}
              ${(service.base_price / 100).toFixed(2)}
            </div>
            <div>
              <span className="font-medium">Date/Time:</span>{" "}
              {new Date(start).toLocaleString()}
            </div>
          </div>
        )}

        <div className="mt-4">
          <label className="inline-flex items-center gap-2">
            <input
              id="policy"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              required
            />
            <span className="text-sm text-gray-700">
              I agree to the booking policies.
            </span>
          </label>
        </div>

        <div className="mt-4 flex justify-between">
          <button
            className="inline-flex items-center rounded-md border px-4 py-2 text-sm bg-white hover:bg-gray-50"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
          <button
            className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            disabled={submitting || !service}
            onClick={confirm}
          >
            {submitting ? "Booking…" : "Confirm Booking"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Router shim ------------------------------ */
export default function Book() {
  const { user } = useAuth();
  // Guard the whole flow except Step 1/2 (let users browse but require login to confirm)
  // If you want full protection, uncomment the redirect below.
  // if (!user) return <Navigate to="/login" replace />

  return (
    <Routes>
      <Route index element={<Step1Service />} />
      <Route path="service" element={<Step1Service />} />
      <Route path="staff" element={<Step2Staff />} />
      <Route path="time" element={<Step3Time />} />
      <Route path="confirm" element={<Step4Confirm />} />
    </Routes>
  );
}
