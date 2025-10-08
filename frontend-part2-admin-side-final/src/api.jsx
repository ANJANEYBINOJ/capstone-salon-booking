const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

async function api(path, { method = "GET", body, headers = {} } = {}) {
  const opts = {
    method,
    headers: { "Content-Type": "application/json", ...headers },
    credentials: "include",
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE}${path}`, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error?.message || `Request failed (${res.status})`;
    throw Object.assign(new Error(msg), { status: res.status, data });
  }
  return data;
}

export const Auth = {
  register: (payload) => api('/auth/register', { method: 'POST', body: payload }),
  login:    (payload) => api('/auth/login',    { method: 'POST', body: payload }),
  logout:   () => api('/auth/logout', { method: 'POST' }),
  me:       () => api('/auth/me'),
};


export const Catalog = {
  services: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api(`/services${q ? `?${q}` : ""}`);
  },
  service: (id) => api(`/services/${id}`),
  staffForService: (id) => api(`/services/${id}/staff`),
};

export const Availability = {
  get: ({ serviceId, date, staffId }) => {
    const q = new URLSearchParams({
      serviceId,
      date,
      ...(staffId ? { staffId } : {}),
    }).toString();
    return api(`/availability?${q}`);
  },
};

export const Bookings = {
  create: (payload) => api("/bookings", { method: "POST", body: payload }),
  mine: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api(`/me/bookings${q ? `?${q}` : ""}`);
  },
  detail: (id) => api(`/bookings/${id}`),
};

export const Admin = {
  dashboard: () => api("/admin/dashboard/summary"),
  services: () => api("/admin/services"),
  addService: (body) => api("/admin/services", { method: "POST", body }),
  updateService: (id, body) =>
    api(`/admin/services/${id}`, { method: "PATCH", body }),
  deleteService: (id) => api(`/admin/services/${id}`, { method: "DELETE" }),
  staff: () => api("/admin/staff"),
  addStaff: (body) => api("/admin/staff", { method: "POST", body }),
  updateStaff: (id, body) => api(`/admin/staff/${id}`, { method: "PATCH", body }),
  deleteStaff: (id) => api(`/admin/staff/${id}`, { method: "DELETE" }),
  getStaffAvailability: (id) => api(`/admin/staff/${id}/availability`),

  bookings: () => api("/admin/bookings"),
  cancelBooking: (id, body) => api(`/admin/bookings/${id}/cancel`, { method: "PATCH", body }),
  noShowBooking: (id) =>
    api(`/admin/bookings/${id}/no-show`, {
      method: "PATCH",
      body: {},
    }),
      rescheduleBooking: (id, body) => api(`/admin/bookings/${id}/reschedule`, { method: "PATCH", body }),

categories: () => api("/admin/categories"),
  addCategory: (body) => api("/admin/categories", { method: "POST", body }),
  deleteCategory: (id) => api(`/admin/categories/${id}`, { method: "DELETE" }),

    calendar: ({ from, to }) => {
    const q = new URLSearchParams({ from, to }).toString();
    return api(`/admin/calendar?${q}`);
  },
};


export const Account = {
  profile:        () => api("/me/profile"),
  updateProfile:  (body) => api("/me/profile", { method: "PATCH", body }),
  changePassword: (body) => api("/me/password", { method: "PATCH", body }),
};
