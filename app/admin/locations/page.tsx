'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Location, CATEGORIES } from '@/types/location';

function AdminLocationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, logout } = useAuth();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [userFilter, setUserFilter] = useState(searchParams.get('userId') || '');

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchLocations();
    }
  }, [user, statusFilter, userFilter]);

  const fetchLocations = async () => {
    setLoadingLocations(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (userFilter) params.append('userId', userFilter);

      const response = await fetch(`/api/admin/locations?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setLocations(data.locations);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setLoadingLocations(false);
    }
  };

  const handleStatusChange = async (locationId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/locations/${locationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchLocations();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };


  const handleDeleteLocation = async (locationId: string) => {
    if (!confirm('Are you sure you want to delete this location?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/locations/${locationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchLocations();
      }
    } catch (error) {
      console.error('Error deleting location:', error);
    }
  };


  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">Approved</span>;
      case 'REJECTED':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded">Rejected</span>;
      default:
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">Pending</span>;
    }
  };

  if (loading || !user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-gray-900 text-white">
        <div className="p-6">
          <h1 className="text-xl font-bold">Admin Panel</h1>
          <p className="text-sm text-gray-400 mt-1">{user.name}</p>
        </div>
        
        <nav className="mt-6">
          <Link
            href="/admin"
            className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Dashboard
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            Users
          </Link>
          <Link
            href="/admin/locations"
            className="flex items-center px-6 py-3 bg-gray-800 text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            Locations
          </Link>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2 text-gray-300 hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Location Management</h2>
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
            {userFilter && (
              <button
                onClick={() => setUserFilter('')}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Clear User Filter
              </button>
            )}
          </div>
        </div>

        {/* Locations Grid */}
        {loadingLocations ? (
          <div className="text-center text-gray-500 py-8">Loading locations...</div>
        ) : locations.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            No locations found
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {locations.map((location) => (
              <div key={location.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="flex">
                  {/* Image */}
                  <div className="w-32 h-32 flex-shrink-0">
                    {location.images && location.images.length > 0 ? (
                      <img
                        src={location.images[0]}
                        alt={location.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-2xl">📍</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{location.name}</h3>
                        <p className="text-sm text-gray-500">{location.city}</p>
                      </div>
                      {getStatusBadge(location.status)}
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2 space-y-1">
                      <div>
                        <span className="font-medium">Category:</span> {location.category}
                        {location.isSponsored && (
                          <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded">
                            Sponsored
                          </span>
                        )}
                      </div>
                      {location.formalPlaceName && (
                        <div className="text-xs">
                          <span className="font-medium">Formal Name:</span> {location.formalPlaceName}
                        </div>
                      )}
                      {location.street && (
                        <div className="text-xs">
                          <span className="font-medium">Street:</span> {location.street}
                        </div>
                      )}
                      {location.side && (
                        <div className="text-xs">
                          <span className="font-medium">Side:</span> {location.side}
                        </div>
                      )}
                      {location.path && (
                        <div className="text-xs">
                          <span className="font-medium">Path:</span> {location.path}
                        </div>
                      )}
                      {location.pointType && (
                        <div className="text-xs">
                          <span className="font-medium">Type:</span> {location.pointType === 'new' ? 'New' : 'Edit'}
                        </div>
                      )}
                      <div className="text-xs">
                        <span className="font-medium">Coordinates:</span> {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                      </div>
                    </div>
                    
                    {location.user && (
                      <p className="text-xs text-gray-500 mb-3">
                        By: {location.user.name} ({location.user.email})
                      </p>
                    )}
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {location.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(location.id, 'APPROVED')}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusChange(location.id, 'REJECTED')}
                            className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => router.push(`/map?edit=${location.id}`)}
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteLocation(location.id)}
                        className="px-3 py-1 text-red-600 text-xs hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default function AdminLocationsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    }>
      <AdminLocationsContent />
    </Suspense>
  );
}
