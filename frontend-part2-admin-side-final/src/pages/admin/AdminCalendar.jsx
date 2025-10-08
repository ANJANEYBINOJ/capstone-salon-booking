import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom"; // ⬅️ added
import { Admin } from "../../api";
import AdminSidebar from "../../components/AdminSidebar";

const HOUR_HEIGHT = 56;
const DEFAULT_START_HOUR = 8;
const DEFAULT_END_HOUR = 20;

function startOfWeek(date, weekStartsOn = 1) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
function endOfWeek(date, weekStartsOn = 1) {
  const d = startOfWeek(date, weekStartsOn);
  d.setDate(d.getDate() + 7);
  d.setMilliseconds(-1);
  return d;
}
function dayKey(dt) {
  return dt.toISOString().slice(0, 10);
}

export default function AdminCalendar() {
  const [cursor, setCursor] = useState(() => new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);

  const weekStart = useMemo(() => startOfWeek(cursor, 1), [cursor]);
  const weekEnd = useMemo(() => endOfWeek(cursor, 1), [cursor]);

  const days = useMemo(() => {
    const out = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      out.push(d);
    }
    return out;
  }, [weekStart]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const from = weekStart.toISOString();
        const to = weekEnd.toISOString();
        const data = await Admin.calendar({ from, to });
        setEvents(data.events || []);
      } catch (e) {
        console.error("Calendar load failed:", e);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [weekStart, weekEnd]);

  const [minHour, maxHour] = useMemo(() => {
    let minH = DEFAULT_START_HOUR,
      maxH = DEFAULT_END_HOUR;
    for (const ev of events) {
      const s = new Date(ev.start);
      const e = new Date(ev.end);
      minH = Math.min(minH, s.getHours());
      maxH = Math.max(maxH, e.getHours() + (e.getMinutes() > 0 ? 1 : 0));
    }
    minH = Math.max(6, Math.min(minH, 10));
    maxH = Math.max(maxH, 18);
    return [minH, maxH];
  }, [events]);

  const hours = useMemo(() => {
    const arr = [];
    for (let h = minHour; h <= maxHour; h++) arr.push(h);
    return arr;
  }, [minHour, maxHour]);

  function getTopPx(date) {
    const d = new Date(date);
    const mins = d.getHours() * 60 + d.getMinutes();
    const base = minHour * 60;
    const delta = Math.max(0, mins - base);
    return (delta / 60) * HOUR_HEIGHT;
  }
  function getHeightPx(start, end) {
    const ms = Math.max(15, (new Date(end) - new Date(start)) / 60000);
    return (ms / 60) * HOUR_HEIGHT;
  }

  const eventsByDay = useMemo(() => {
    const map = Object.create(null);
    for (const d of days) map[dayKey(d)] = [];
    for (const ev of events) {
      const k = dayKey(new Date(ev.start));
      if (!map[k]) map[k] = [];
      map[k].push(ev);
    }
    Object.values(map).forEach((list) =>
      list.sort((a, b) => new Date(a.start) - new Date(b.start))
    );
    return map;
  }, [events, days]);

  const weekLabel = `${days[0].toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })} – ${days[6].toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;

  return (
    <div className="flex flex-col sm:flex-row min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-3 sm:p-6">
        {/* Header */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-xl sm:text-2xl font-bold">Calendar</h1>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setCursor(new Date())}
              className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              Today
            </button>
            <button
              onClick={() =>
                setCursor((d) => {
                  const n = new Date(d);
                  n.setDate(n.getDate() - 7);
                  return n;
                })
              }
              className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
              title="Previous week"
            >
              ‹
            </button>
            <button
              onClick={() =>
                setCursor((d) => {
                  const n = new Date(d);
                  n.setDate(n.getDate() + 7);
                  return n;
                })
              }
              className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
              title="Next week"
            >
              ›
            </button>
            <div className="ml-0 sm:ml-3 text-xs sm:text-sm text-gray-600">
              {weekLabel}
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
          <div
            className="grid min-w-[700px]"
            style={{
              gridTemplateColumns: "60px repeat(7, minmax(120px,1fr))",
            }}
          >
            <div className="h-10 sm:h-12 border-b bg-gray-50" />
            {days.map((d) => (
              <div
                key={d.toISOString()}
                className="flex h-10 sm:h-12 items-center justify-center border-l border-b bg-gray-50"
              >
                <div className="text-[11px] sm:text-sm">
                  <div className="text-gray-500">
                    {d.toLocaleDateString(undefined, { weekday: "short" })}
                  </div>
                  <div className="font-semibold">
                    {d.toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div
            className="relative grid min-w-[700px]"
            style={{
              gridTemplateColumns: "60px repeat(7, minmax(120px,1fr))",
            }}
          >
            <div className="relative">
              {hours.map((h) => (
                <div
                  key={h}
                  className="flex items-start justify-end pr-2 text-[10px] sm:text-xs text-gray-500"
                  style={{ height: HOUR_HEIGHT }}
                >
                  {h.toString().padStart(2, "0")}:00
                </div>
              ))}
            </div>

            {days.map((d) => {
              const k = dayKey(d);
              const dayEvents = eventsByDay[k] || [];
              return (
                <div key={k} className="relative border-l">
                  {hours.map((_, i) => (
                    <div
                      key={i}
                      className="absolute left-0 right-0 border-t border-dashed border-gray-100"
                      style={{ top: i * HOUR_HEIGHT }}
                    />
                  ))}

                  {dayEvents.map((ev) => {
                    const top = getTopPx(ev.start);
                    const height = getHeightPx(ev.start, ev.end);
                    const statusColor =
                      ev.status === "confirmed"
                        ? "bg-green-100 text-green-700 border-green-300"
                        : ev.status === "cancelled"
                        ? "bg-red-100 text-red-700 border-red-300"
                        : ev.status === "no_show"
                        ? "bg-gray-200 text-gray-700 border-gray-300"
                        : "bg-indigo-100 text-indigo-700 border-indigo-300";
                    return (
                      <button
                        key={ev.id}
                        onClick={() => setSelected(ev)}
                        className={`absolute left-1 right-1 overflow-hidden rounded-md border px-1.5 sm:px-2 py-0.5 sm:py-1 text-left text-[10px] sm:text-xs shadow-sm hover:brightness-95 ${statusColor}`}
                        style={{ top, height, minHeight: 20 }}
                        title={new Date(ev.start).toLocaleString()}
                      >
                        <div className="truncate font-semibold">
                          {ev.title || "Appointment"}
                        </div>
                        <div className="truncate opacity-75">
                          {new Date(ev.start).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          –{" "}
                          {new Date(ev.end).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        <div className="truncate opacity-60">
                          Status: {ev.status}
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
          <div style={{ height: (maxHour - minHour) * HOUR_HEIGHT }} />
        </div>

        {loading && (
          <div className="mt-3 text-sm text-gray-500">Loading week…</div>
        )}

        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Appointment</h3>
                <button
                  onClick={() => setSelected(null)}
                  className="rounded-md border px-2 py-1 text-sm hover:bg-gray-50"
                >
                  Close
                </button>
              </div>

              <div className="space-y-1 text-sm text-gray-700">
                <div>
                  <span className="font-medium">Title:</span>{" "}
                  {selected.title || "Appointment"}
                </div>
                <div>
                  <span className="font-medium">Status:</span> {selected.status}
                </div>
                <div>
                  <span className="font-medium">When:</span>{" "}
                  {new Date(selected.start).toLocaleString()} –{" "}
                  {new Date(selected.end).toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Service ID:</span>{" "}
                  {selected.service_id || "—"}
                </div>
                <div>
                  <span className="font-medium">Staff ID:</span>{" "}
                  {selected.staff_id || "—"}
                </div>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row justify-end gap-2">
                {/* ⬇️ changed from <a href> to Link to avoid full reload */}
                <Link
                  to="/admin/bookings"
                  className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50 text-center"
                >
                  Open Bookings
                </Link>
                <button
                  className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
                  onClick={() => setSelected(null)}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
