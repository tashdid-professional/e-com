'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function DebugAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    setLoading(false);
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Back to Home
        </Link>
        
        <h1 className="text-3xl font-bold mb-6">Auth Debug Page</h1>

        {!user ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">Not Logged In</h2>
            <p>Please sign in first to see your user data.</p>
            <Link href="/" className="text-blue-600 hover:underline mt-2 inline-block">
              Go to Sign In
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">User Information</h2>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">User ID:</span>
                  <code className="ml-2 bg-gray-100 px-2 py-1 rounded text-sm">
                    {user.id}
                  </code>
                </div>
                <div>
                  <span className="font-medium">Email:</span>
                  <span className="ml-2">{user.email}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">User Metadata</h2>
              <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
                {JSON.stringify(user.user_metadata, null, 2)}
              </pre>
              
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Admin Status:</h3>
                {user.user_metadata?.is_admin === true ? (
                  <span className="text-green-600 font-semibold">✓ You are an admin</span>
                ) : (
                  <span className="text-red-600 font-semibold">✗ You are NOT an admin</span>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">How to Make This User Admin</h2>
              <p className="mb-4">Run this SQL in Supabase Dashboard → SQL Editor:</p>
              <pre className="bg-white p-4 rounded border text-sm overflow-auto">
{`UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"is_admin": true}'::jsonb
WHERE id = '${user.id}';`}
              </pre>
              <p className="mt-4 text-sm text-gray-700">
                After running the SQL, <strong>sign out and sign back in</strong> for changes to take effect.
              </p>
            </div>

            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Full User Object</h2>
              <details>
                <summary className="cursor-pointer text-blue-600 hover:underline">
                  Click to expand
                </summary>
                <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs mt-2">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
