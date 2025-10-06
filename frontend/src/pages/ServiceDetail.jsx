import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Catalog } from '../api'


export default function ServiceDetail() {
const { id } = useParams()
const [svc, setSvc] = useState(null)
const [staff, setStaff] = useState([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState('')


useEffect(() => {
(async () => {
try {
const [s, st] = await Promise.all([Catalog.service(id), Catalog.staffForService(id)])
setSvc(s); setStaff(st)
} catch (e) { setError(e.message) } finally { setLoading(false) }
})()
}, [id])


if (loading) return <p>Loading...</p>
if (error) return <p className="text-red-600">{error}</p>
if (!svc) return <p>Not found</p>


return (
<div className="space-y-6">
<div className="rounded-xl bg-white p-6 shadow">
<h2 className="text-2xl font-semibold">{svc.name}</h2>
<p className="mt-2 text-gray-700">{svc.description}</p>
<div className="mt-4 flex gap-6 text-gray-700">
<span>Duration: {svc.duration_minutes} mins</span>
<span>Price: ${(svc.base_price/100).toFixed(2)}</span>
</div>
<Link to={`/book?serviceId=${svc._id}`} className="btn btn-primary mt-6 inline-block">Book this service</Link>
</div>


<div>
<h3 className="text-lg font-semibold mb-2">Staff who perform this</h3>
<div className="flex flex-wrap gap-3">
{staff.map(s => (
<div key={s._id} className="px-3 py-2 rounded border bg-white shadow-sm">{s.name} <span className="text-gray-500 text-sm">{s.title}</span></div>
))}
{!staff.length && <p className="text-gray-600">No staff configured yet.</p>}
</div>
</div>
</div>
)
}