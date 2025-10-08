import { useEffect, useMemo, useState, createContext, useContext } from "react";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Link,
  Navigate,
} from "react-router-dom";
import { Catalog, Availability, Bookings } from "../../api";
import { useAuth } from "../../auth/AuthContext";

/* =========================================================================
   Lightweight Toasts (no external deps)
   ========================================================================= */
const ToastCtx = createContext(null);
const useToast = () => useContext(ToastCtx);

function ToastHost({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = (t) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((s) => [...s, { id, ...t }]);
    setTimeout(() => setToasts((s) => s.filter((x) => x.id !== id)), t.ms ?? 3000);
  };
  const api = {
    info: (m, ms) => push({ kind: "info", msg: m, ms }),
    success: (m, ms) => push({ kind: "success", msg: m, ms }),
    error: (m, ms) => push({ kind: "error", msg: m, ms }),
  };
  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed top-4 right-4 z-[60] space-y-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-xl px-4 py-3 shadow-lg text-sm text-white backdrop-blur
              ${t.kind === "success" ? "bg-emerald-600/95" : ""}
              ${t.kind === "error" ? "bg-rose-600/95" : ""}
              ${t.kind === "info" ? "bg-slate-700/95" : ""}`}
          >
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* =========================================================================
   Shared helpers / UI
   ========================================================================= */
const useQS = () => {
  const { search } = useLocation();
  return useMemo(() => Object.fromEntries(new URLSearchParams(search)), [search]);
};

function SectionCard({ title, right, children, className = "" }) {
  return (
    <div className={`rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-800">{title}</h3>
        {right}
      </div>
      {children}
    </div>
  );
}

function PrimaryButton({ className = "", ...props }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm
      enabled:hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    />
  );
}
function GhostButton({ className = "", ...props }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm
      hover:bg-slate-50 ${className}`}
    />
  );
}

/* =========================================================================
   Stepper (enhanced)
   ========================================================================= */
function Stepper({ step }) {
  const steps = ["Service", "Staff", "Date/Time", "Confirm"];
  const pct = ((step - 1) / (steps.length - 1)) * 100;

  return (
    <div className="mb-6">
      <div className="relative mb-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="grid grid-cols-4 text-xs text-slate-600">
        {steps.map((label, i) => {
          const idx = i + 1;
          const state =
            step > idx ? "done" : step === idx ? "current" : "upcoming";
          return (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`grid h-6 w-6 place-items-center rounded-full text-[11px] font-bold text-white
                ${state === "done" ? "bg-emerald-500" : ""}
                ${state === "current" ? "bg-indigo-600 ring-4 ring-indigo-100" : ""}
                ${state === "upcoming" ? "bg-slate-400" : ""}`}
              >
                {state === "done" ? "✓" : idx}
              </div>
              <span className={`${state === "current" ? "text-slate-900 font-semibold" : ""}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================================
   Step 1: Service
   ========================================================================= */
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
      <SectionCard
        title="Select a service"
        right={
          <Link to="/services" className="text-indigo-600 hover:underline text-sm">
            View details →
          </Link>
        }
      >
        {loading && <p className="text-slate-600">Loading…</p>}
        {err && <p className="text-rose-600">{err}</p>}

        <div className="grid gap-4 sm:grid-cols-2">
          {services.map((s) => (
            <label
              key={s._id}
              className={`cursor-pointer rounded-xl border p-4 shadow-sm transition
                ${selected === s._id ? "ring-2 ring-indigo-500" : "hover:shadow-md"}`}
            >
              <input
                type="radio"
                name="svc"
                className="hidden"
                value={s._id}
                onChange={() => setSelected(s._id)}
                checked={selected === s._id}
              />
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold text-slate-800">{s.name}</div>
                  <div className="mt-1 text-sm text-slate-600 line-clamp-2">
                    {s.description || " "}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-500">
                    {s.duration_minutes} mins
                  </div>
                  <div className="mt-1 text-base font-semibold text-slate-800">
                    ${s.base_price.toFixed(2)}
                  </div>
                </div>
              </div>
            </label>
          ))}
        </div>

        <div className="mt-5 flex justify-end">
          <PrimaryButton
            disabled={!selected}
            onClick={() => navigate(`/book/staff?serviceId=${selected}`)}
          >
            Continue
          </PrimaryButton>
        </div>
      </SectionCard>
    </div>
  );
}

/* =========================================================================
   Step 2: Staff
   ========================================================================= */
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
      <SectionCard title="Choose staff">
        {loading && <p className="text-slate-600">Loading…</p>}
        {err && <p className="text-rose-600">{err}</p>}

        <div className="flex flex-col gap-3">
          <label
            className={`cursor-pointer rounded-xl border p-4 shadow-sm transition
              ${selected === "any" ? "ring-2 ring-indigo-500" : "hover:shadow-md"}`}
          >
            <input
              type="radio"
              name="st"
              className="hidden"
              value="any"
              onChange={() => setSelected("any")}
              checked={selected === "any"}
            />
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-slate-200 text-slate-700">
                *
              </div>
              <div>
                <div className="font-medium text-slate-800">Any available staff</div>
                <div className="text-xs text-slate-500">
                  We’ll assign the best match automatically.
                </div>
              </div>
            </div>
          </label>

          {staff.map((s) => (
            <label
              key={s._id}
              className={`cursor-pointer rounded-xl border p-4 shadow-sm transition
                ${selected === s._id ? "ring-2 ring-indigo-500" : "hover:shadow-md"}`}
            >
              <input
                type="radio"
                name="st"
                className="hidden"
                value={s._id}
                onChange={() => setSelected(s._id)}
                checked={selected === s._id}
              />
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 grid place-items-center font-semibold">
                  {s.name?.[0] || "S"}
                </div>
                <div>
                  <div className="font-medium text-slate-800">{s.name}</div>
                  <div className="text-xs text-slate-500">{s.title || "Staff"}</div>
                </div>
              </div>
            </label>
          ))}
        </div>

        <div className="mt-5 flex justify-between">
          <GhostButton onClick={() => navigate(-1)}>Back</GhostButton>
          <PrimaryButton onClick={next}>Continue</PrimaryButton>
        </div>
      </SectionCard>
    </div>
  );
}

/* =========================================================================
   Step 3: Date/Time
   ========================================================================= */
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
        setErr("");
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

  // group slots by meridiem for nicer layout
  const groups = useMemo(() => {
    const r = { Morning: [], Afternoon: [], Evening: [] };
    for (const s of slots) {
      const h = new Date(s.start).getHours();
      const bucket = h < 12 ? "Morning" : h < 17 ? "Afternoon" : "Evening";
      r[bucket].push(s);
    }
    return r;
  }, [slots]);

  return (
    <div className="space-y-4">
      <Stepper step={3} />
      <SectionCard
        title="Pick a date & time"
        right={<span className="text-xs text-slate-500">Times shown in your local time</span>}
      >
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs text-slate-600 mb-1">Date</label>
            <input
              type="date"
              className="w-48 rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-5 space-y-5">
          {loading && <p className="text-slate-600">Loading available slots…</p>}
          {err && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-amber-800 text-sm">
              {err}. Try another date or choose “Any staff”.
            </div>
          )}
          {!loading && slots.length === 0 && !err && (
            <p className="text-slate-600">
              No slots on this date. Try a different day.
            </p>
          )}

          {["Morning", "Afternoon", "Evening"].map((label) => {
            const list = groups[label] || [];
            if (list.length === 0) return null;
            return (
              <div key={label}>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {label}
                </div>
                <div className="flex flex-wrap gap-2">
                  {list.map((s, i) => (
                    <button
                      key={`${label}-${i}`}
                      onClick={() => setSelected(s)}
                      className={`rounded-lg border px-3 py-1.5 text-sm transition
                        ${selected?.start === s.start
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white hover:bg-slate-50"}`}
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
            );
          })}
        </div>

        <div className="mt-6 flex justify-between">
          <GhostButton onClick={() => navigate(-1)}>Back</GhostButton>
          <PrimaryButton disabled={!selected} onClick={next}>
            Continue
          </PrimaryButton>
        </div>
      </SectionCard>
    </div>
  );
}

/* =========================================================================
   Step 4: Confirm
   ========================================================================= */
function Step4Confirm() {
  const { user } = useAuth();
  const toast = useToast();
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
      toast.success("Booking confirmed!");
      navigate("/me/appointments");
    } catch (e) {
      toast.error(e.message || "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="space-y-4">
      <Stepper step={4} />
      <SectionCard title="Confirm your booking">
        {!service ? (
          <p className="text-slate-600">Loading…</p>
        ) : (
          <div className="grid gap-2 text-sm text-slate-800 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-3">
              <div className="text-slate-500">Service</div>
              <div className="font-semibold">{service.name}</div>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <div className="text-slate-500">Duration</div>
              <div className="font-semibold">{service.duration_minutes} mins</div>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <div className="text-slate-500">Price</div>
              <div className="font-semibold">${service.base_price.toFixed(2)}</div>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <div className="text-slate-500">Date / Time</div>
              <div className="font-semibold">
                {new Date(start).toLocaleString()}
              </div>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 sm:col-span-2">
              <div className="text-slate-500">Staff</div>
              <div className="font-semibold">
                {staffId ? "Selected staff" : "Assigned automatically"}
              </div>
            </div>
          </div>
        )}

        <div className="mt-5">
          <label className="inline-flex items-center gap-2">
            <input
              id="policy"
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              required
            />
            <span className="text-sm text-slate-700">
              I agree to the booking policies.
            </span>
          </label>
        </div>

        <div className="mt-6 flex justify-between">
          <GhostButton onClick={() => navigate(-1)}>Back</GhostButton>
          <PrimaryButton disabled={submitting || !service} onClick={confirm}>
            {submitting ? "Booking…" : "Confirm Booking"}
          </PrimaryButton>
        </div>
      </SectionCard>
    </div>
  );
}

/* =========================================================================
   Router wrapper with Toast provider
   ========================================================================= */
export default function Book() {
  // Let users browse steps 1–3 without login; confirm step enforces login
  return (
    <ToastHost>
      <Routes>
        <Route index element={<Step1Service />} />
        <Route path="service" element={<Step1Service />} />
        <Route path="staff" element={<Step2Staff />} />
        <Route path="time" element={<Step3Time />} />
        <Route path="confirm" element={<Step4Confirm />} />
      </Routes>
    </ToastHost>
  );
}
