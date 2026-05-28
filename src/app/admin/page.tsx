"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      setError(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const res = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (!res.ok) {
        if (res.status === 403) {
          setError("Du har inte behörighet att se denna sida.");
        } else {
          setError("Kunde inte hämta data.");
        }
        return;
      }

      const data = await res.json();
      setStats(data.stats);
      setUsers(data.users);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(userId: string, action: string) {
    if (action === "delete_user") {
      if (!confirm("Är du säker på att du vill ta bort denna användare permanent?")) return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ targetUserId: userId, action })
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(`Fel: ${errorData.error}`);
        return;
      }

      // Refresh data
      fetchData();
    } catch (err: any) {
      alert(`Fel: ${err.message}`);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8 flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-1.998A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
        </svg>
        Admin Dashboard
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Totala Användare</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats?.total || 0}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Arbetssökande</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats?.seekers || 0}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Arbetsgivare</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats?.employers || 0}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Premium Kunder</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats?.premiumCount || 0}</dd>
          </div>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-100 mb-8">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Admin-verktyg</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a 
              href="/admin/verification" 
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition flex items-center gap-3"
            >
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-medium text-gray-900">Verifieringsförfrågningar</p>
                <p className="text-sm text-gray-500">Granska inskickade dokument</p>
              </div>
            </a>
            <a 
              href="/admin/boosts" 
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition flex items-center gap-3"
            >
              <span className="text-2xl">⚡</span>
              <div>
                <p className="font-medium text-gray-900">Aktiva boosts</p>
                <p className="text-sm text-gray-500">Hantera framhävda profiler</p>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-100">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Användare ({users.length})</h3>
        </div>
        <div className="border-t border-gray-200 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Premium</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Åtgärder</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {u.auth_email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {u.role === 'job_seeker' ? 'Sökande' : 'Arbetsgivare'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {u.is_premium ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Ja</span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Nej</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {u.is_admin ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">Admin</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button 
                      onClick={() => handleAction(u.id, "toggle_premium")}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Premium
                    </button>
                    <button 
                      onClick={() => handleAction(u.id, "toggle_admin")}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Admin
                    </button>
                    <button 
                      onClick={() => handleAction(u.id, "delete_user")}
                      className="text-red-600 hover:text-red-900"
                    >
                      Ta bort
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
