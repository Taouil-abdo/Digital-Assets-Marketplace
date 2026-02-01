'use client';

import { useAuth0 } from '@auth0/auth0-react';

export default function AuthButtons() {
  const { loginWithRedirect, logout, isAuthenticated, isLoading } = useAuth0();

  if (isLoading) return null;

  return isAuthenticated ? (
    <button
      onClick={() =>
        logout({
          logoutParams: {
            returnTo: window.location.origin,
          },
        })
      }
      className="px-4 py-2 bg-red-500 text-white rounded"
    >
      Logout
    </button>
  ) : (
    <button
      onClick={() => loginWithRedirect()}
      className="px-4 py-2 bg-blue-600 text-white rounded"
    >
      Login
    </button>
  );
}
