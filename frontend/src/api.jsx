const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000'


async function api(path, { method = 'GET', body, headers = {} } = {}) {
const opts = {
method,
headers: { 'Content-Type': 'application/json', ...headers },
credentials: 'include', // important: send/receive httpOnly cookie
}
if (body) opts.body = JSON.stringify(body)


const res = await fetch(`${API_BASE}${path}`, opts)
const data = await res.json().catch(() => ({}))
if (!res.ok) {
const msg = data?.error?.message || `Request failed (${res.status})`
throw Object.assign(new Error(msg), { status: res.status, data })
}
return data
}


export const Auth = {
register: (payload) => api('/auth/register', { method: 'POST', body: payload }),
login: (payload) => api('/auth/login', { method: 'POST', body: payload }),
logout: () => api('/auth/logout', { method: 'POST' }),
}


export const Catalog = {
services: (params = {}) => {
const q = new URLSearchParams(params).toString()
return api(`/services${q ? `?${q}` : ''}`)
},
service: (id) => api(`/services/${id}`),
staffForService: (id) => api(`/services/${id}/staff`),
}


export const Availability = {
get: ({ serviceId, date, staffId }) => {
const q = new URLSearchParams({ serviceId, date, ...(staffId ? { staffId } : {}) }).toString()
return api(`/availability?${q}`)
},
}


export const Bookings = {
create: (payload) => api('/bookings', { method: 'POST', body: payload }),
mine: (params = {}) => {
const q = new URLSearchParams(params).toString()
return api(`/me/bookings${q ? `?${q}` : ''}`)
},
detail: (id) => api(`/bookings/${id}`),
}