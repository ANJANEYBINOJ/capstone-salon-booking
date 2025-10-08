// src/pages/customer/Settings.jsx
import { useEffect, useState } from "react";
import { Account } from "../../api";
import { useAuth } from "../../auth/AuthContext";
import toast, { Toaster } from "react-hot-toast";

export default function Settings() {
const { setUser } = useAuth();
  const [loading, setLoading] = useState(true);

  // Profile form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Password form
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const prof = await Account.profile();
        setName(prof.name || "");
        setEmail(prof.email || "");
      } catch (e) {
        toast.error(e.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const updated = await Account.updateProfile({ name, email });
      toast.success("Profile updated");
      // refresh in context
      setUser((u) => u ? { ...u, name: updated.name, email: updated.email } : u);
    } catch (e) {
      const msg = e?.data?.error?.message || e.message || "Update failed";
      toast.error(msg);
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (newPwd.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    try {
      setChangingPwd(true);
      await Account.changePassword({ old_password: oldPwd, new_password: newPwd });
      toast.success("Password changed");
      setOldPwd("");
      setNewPwd("");
    } catch (e) {
      const msg = e?.data?.error?.message || e.message || "Change failed";
      toast.error(msg);
    } finally {
      setChangingPwd(false);
    }
  };

  if (loading) return <div className="p-6">Loading settings...</div>;

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <Toaster position="top-right" />
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Account Settings</h1>

      {/* Profile card */}
      <div className="mb-6 rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Profile</h2>
        <form onSubmit={saveProfile} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <label className="mb-1 block text-sm text-gray-700">Name</label>
            <input
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              minLength={2}
              required
            />
          </div>
          <div className="sm:col-span-1">
            <label className="mb-1 block text-sm text-gray-700">Email</label>
            <input
              type="email"
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="sm:col-span-2 flex justify-end gap-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {savingProfile ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Password card */}
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Change Password</h2>
        <form onSubmit={changePassword} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <label className="mb-1 block text-sm text-gray-700">Old Password</label>
            <input
              type="password"
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              value={oldPwd}
              onChange={(e) => setOldPwd(e.target.value)}
              minLength={6}
              required
            />
          </div>
          <div className="sm:col-span-1">
            <label className="mb-1 block text-sm text-gray-700">New Password</label>
            <input
              type="password"
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              minLength={6}
              required
            />
          </div>
          <div className="sm:col-span-2 flex justify-end gap-2">
            <button
              type="submit"
              disabled={changingPwd}
              className="rounded-md bg-gray-800 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-900 disabled:opacity-60"
            >
              {changingPwd ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
