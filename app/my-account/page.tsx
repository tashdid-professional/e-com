'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Mail, Phone, MapPin, Calendar, Shield } from 'lucide-react';
import Link from 'next/link';

export default function MyAccountPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      // Load user profile/metadata if exists
      setProfile({
        full_name: user.user_metadata?.full_name || '',
        phone: user.user_metadata?.phone || '',
        address: user.user_metadata?.address || '',
      });
    }
    setLoading(false);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({
      data: profile
    });
    
    if (error) {
      alert('Error updating profile: ' + error.message);
    } else {
      alert('Profile updated successfully!');
      setEditing(false);
      checkUser();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h1 className="text-2xl font-bold mb-4">Please Log In</h1>
          <p className="text-gray-600 mb-6">You need to be logged in to view your account</p>
          <Link href="/" className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8">My Account</h1>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Quick Stats */}
          <Link href="/my-orders" className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-1">Orders</h3>
              <p className="text-2xl font-bold">View All</p>
            </div>
          </Link>

          <Link href="/wishlist" className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-center">
              <div className="bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <User className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-semibold mb-1">Wishlist</h3>
              <p className="text-2xl font-bold">View Items</p>
            </div>
          </Link>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-center">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-1">Member Since</h3>
              <p className="text-sm font-bold">
                {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Profile Information</h2>
            <button
              onClick={() => setEditing(!editing)}
              className="text-black hover:text-gray-600 font-semibold"
            >
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {editing ? (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Address</label>
                <textarea
                  rows={3}
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Save Changes
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold">{user.email}</p>
                </div>
              </div>

              {profile.full_name && (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Full Name</p>
                    <p className="font-semibold">{profile.full_name}</p>
                  </div>
                </div>
              )}

              {profile.phone && (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-semibold">{profile.phone}</p>
                  </div>
                </div>
              )}

              {profile.address && (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-semibold">{profile.address}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
