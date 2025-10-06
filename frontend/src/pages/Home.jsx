import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Catalog } from "../api";

/* Tiny helpers */
const currency = (cents) => `$${(cents / 100).toFixed(2)}`;

export default function Home() {
  const [popular, setPopular] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // grab a few services for the landing page
        const data = await Catalog.services({ limit: 6 });
        setPopular(data.items || data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-20">
      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden rounded-3xl border shadow bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white">
        {/* subtle grid/beam background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "radial-gradient(white 1px, transparent 1px), radial-gradient(white 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            backgroundPosition: "0 0, 12px 12px",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-6 py-16 lg:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Book in minutes — real-time availability
              </p>
              <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
                Relax. Refresh. Renew.
              </h1>
              <p className="mt-4 max-w-xl text-white/80">
                Seamless online bookings with expert stylists and therapists.
                Choose your service, pick your pro, lock your time—done.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/book"
                  className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-gray-900 shadow hover:bg-gray-100"
                >
                  Book Now
                </Link>
                <Link
                  to="/services"
                  className="inline-flex items-center justify-center rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
                >
                  Browse Services
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <ShieldIcon /> Secure booking
                </div>
                <div className="flex items-center gap-2">
                  <ClockIcon /> Instant confirmation
                </div>
                <div className="flex items-center gap-2">
                  <SparklesIcon /> Top-rated staff
                </div>
              </div>
            </div>

            {/* right visual */}
            <div className="relative">
              <div className="mx-auto h-[380px] max-w-md rounded-2xl border border-white/20 bg-white/10 p-4 shadow-2xl backdrop-blur-lg">
                <div className="h-full rounded-xl bg-white/80 p-4 shadow-inner">
                  <div className="mb-4 h-8 w-32 rounded-md bg-gray-200" />
                  <div className="grid grid-cols-2 gap-3">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="h-28 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200"
                      />
                    ))}
                  </div>
                  <div className="mt-4 h-10 w-full rounded-lg bg-gray-200" />
                </div>
              </div>
              <div className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-fuchsia-400/40 blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== Trust / KPIs ===== */}
      <section className="mx-auto max-w-6xl px-6">
        <div className="grid gap-6 rounded-3xl border bg-white p-6 shadow sm:grid-cols-3">
          <Stat value="4.9/5" label="Average Rating" />
          <Stat value="10k+" label="Appointments Booked" />
          <Stat value="24/7" label="Online Scheduling" />
        </div>
      </section>

      {/* ===== Features ===== */}
      <section className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">Why choose us</h2>
          <p className="mt-2 text-gray-600">
            Built for speed, reliability, and a delightful booking experience.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Feature
            icon={<CalendarIcon className="h-6 w-6" />}
            title="Real-time Availability"
            desc="See up-to-the-minute slots across staff and services."
          />
          <Feature
            icon={<WandIcon className="h-6 w-6" />}
            title="Expert Professionals"
            desc="Hand-picked, top-rated stylists and therapists."
          />
          <Feature
            icon={<BoltIcon className="h-6 w-6" />}
            title="Lightning-fast"
            desc="Book in under a minute. No downloads. No hassle."
          />
          <Feature
            icon={<ShieldIcon className="h-6 w-6" />}
            title="Secure"
            desc="Private by default with modern best practices."
          />
        </div>
      </section>

      {/* ===== How it works ===== */}
      <section className="mx-auto max-w-6xl px-6">
        <div className="rounded-3xl border bg-white p-8 shadow">
          <h3 className="text-2xl font-semibold">How it works</h3>
          <ol className="mt-6 grid gap-6 sm:grid-cols-3">
            <Step n="1" title="Pick a service">
              Choose from our curated catalog of hair, skin, and spa services.
            </Step>
            <Step n="2" title="Choose staff & time">
              See live availability and pick a time that suits you.
            </Step>
            <Step n="3" title="Confirm">
              One tap to book. We’ll confirm instantly and remind you later.
            </Step>
          </ol>
          <div className="mt-6">
            <Link to="/book" className="rounded-xl bg-blue-600 px-5 py-3 text-white shadow hover:bg-blue-700">
              Book in 60 seconds
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Popular Services (live) ===== */}
      <section className="mx-auto max-w-6xl px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold">Popular services</h3>
            <p className="text-gray-600">Handy shortcuts to our most-booked treatments.</p>
          </div>
          <Link to="/services" className="text-sm font-semibold text-blue-600 hover:underline">
            View all →
          </Link>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading &&
            [1, 2, 3].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl border bg-white shadow" />
            ))}
          {!loading &&
            popular.map((s) => (
              <article key={s._id} className="group overflow-hidden rounded-2xl border bg-white shadow transition hover:-translate-y-0.5">
                <div className="p-5">
                  <h4 className="text-lg font-semibold group-hover:underline">{s.name}</h4>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-600">{s.description}</p>
                  <div className="mt-4 flex items-center justify-between text-sm text-gray-700">
                    <span>{s.duration_minutes} mins</span>
                    <span className="font-semibold">{currency(s.base_price)}</span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Link to={`/services/${s._id}`} className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50">
                      Details
                    </Link>
                    <Link to={`/book?serviceId=${s._id}`} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                      Book
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          {!loading && !popular.length && (
            <div className="col-span-full rounded-2xl border bg-white p-6 text-center text-gray-600 shadow">
              Services will appear here once added.
            </div>
          )}
        </div>
      </section>

      {/* ===== Testimonials ===== */}
      <section className="mx-auto max-w-6xl px-6">
        <div className="rounded-3xl border bg-white p-8 shadow">
          <h3 className="text-2xl font-semibold">Loved by our clients</h3>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <Testimonial
              quote="Booking was insanely easy. Walked in, got styled, felt amazing."
              name="Ava R."
            />
            <Testimonial
              quote="Real-time slots saved me. Found a last-minute facial at lunch!"
              name="Zain M."
            />
            <Testimonial
              quote="The team is top-notch and the reminders are a life-saver."
              name="Priya S."
            />
          </div>
        </div>
      </section>

      {/* ===== Final CTA ===== */}
      <section className="mx-auto max-w-6xl px-6">
        <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-r from-indigo-600 to-blue-600 p-10 text-white shadow">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-2xl" />
          <div className="pointer-events-none absolute -left-12 bottom-0 h-36 w-36 rounded-full bg-fuchsia-400/40 blur-2xl" />
          <div className="relative">
            <h3 className="text-2xl font-bold">Ready to treat yourself?</h3>
            <p className="mt-2 text-white/85">
              Pick a service and lock your time. We’ll take care of the rest.
            </p>
            <div className="mt-6">
              <Link
                to="/book"
                className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-gray-900 shadow hover:bg-gray-100"
              >
                Start Booking
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="mx-auto max-w-6xl px-6 pb-10 text-sm text-gray-600">
        <div className="border-t pt-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} Salon & Spa. All rights reserved.</p>
            <nav className="flex items-center gap-4">
              <Link to="/services" className="hover:underline">
                Services
              </Link>
              <Link to="/book" className="hover:underline">
                Book
              </Link>
              <a className="cursor-default text-gray-400">Policies</a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ====================== small presentational bits ====================== */
function Stat({ value, label }) {
  return (
    <div className="rounded-2xl border bg-gray-50 p-6 text-center">
      <div className="text-3xl font-extrabold">{value}</div>
      <div className="mt-1 text-gray-600">{label}</div>
    </div>
  );
}
function Feature({ icon, title, desc }) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow">
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
        {icon}
      </div>
      <h4 className="font-semibold">{title}</h4>
      <p className="mt-1 text-sm text-gray-600">{desc}</p>
    </div>
  );
}
function Step({ n, title, children }) {
  return (
    <li className="relative rounded-2xl border bg-white p-6 shadow">
      <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
        {n}
      </div>
      <h5 className="font-semibold">{title}</h5>
      <p className="mt-1 text-sm text-gray-600">{children}</p>
    </li>
  );
}
function Testimonial({ quote, name }) {
  return (
    <blockquote className="rounded-2xl border bg-gradient-to-br from-gray-50 to-white p-6 shadow">
      <p className="text-gray-800">“{quote}”</p>
      <div className="mt-3 text-sm font-semibold text-gray-700">— {name}</div>
    </blockquote>
  );
}

/* =============================== icons =============================== */
function ShieldIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.25l7.5 3v6.09c0 4.63-3.18 8.88-7.5 10.16-4.32-1.28-7.5-5.53-7.5-10.16V5.25L12 2.25z" />
    </svg>
  );
}
function ClockIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm.75 5.5a.75.75 0 00-1.5 0V12c0 .2.08.39.22.53l3 3a.75.75 0 001.06-1.06l-2.78-2.78V7.5z" />
    </svg>
  );
}
function SparklesIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M11 2l1.8 4.5L17 8l-4.2 1.5L11 14l-1.8-4.5L5 8l4.2-1.5L11 2zm6.5 6.5l1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5zM6 15l1.2 3 3 1.2-3 1.2L6 23l-1.2-3-3-1.2 3-1.2L6 15z" />
    </svg>
  );
}
function CalendarIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M7 2a1 1 0 100 2h10a1 1 0 100-2h-1v2h-2V2H10v2H8V2H7zM4 7a2 2 0 012-2h12a2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V7zm3 3h3v3H7v-3zm5 0h3v3h-3v-3zm-5 5h3v3H7v-3zm5 0h6v3h-6v-3z" />
    </svg>
  );
}
function WandIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M4 20l7-7 3 3-7 7H4v-3zM14.7 3.3a1 1 0 011.4 0L21 8.2a1 1 0 010 1.4l-3.9 3.9-6.3-6.3L14.7 3.3z" />
    </svg>
  );
}
function BoltIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 2L3 14h7v8l11-14h-8l0-6z" />
    </svg>
  );
}
