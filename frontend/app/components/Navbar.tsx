'use client';

import Link from 'next/link';
import { useAuth0 } from '@auth0/auth0-react';

export default function Navbar() {
  const { user, isAuthenticated, loginWithRedirect, logout } = useAuth0();

  return (
    <nav className="flex justify-between items-center px-6 py-4 border-b">
      <Link href="/" className="font-bold text-xl">
        DigitalAssets
      </Link>

      <div className="flex gap-4 items-center">
        <Link href="/marketplace">Browse</Link>
        {isAuthenticated && (
          <>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/seller">Sell</Link>
          </>
        )}
        
        {isAuthenticated ? (
          <div className="flex items-center gap-4">
            <span>Hello, {user?.name}</span>
            <button
              onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={() => loginWithRedirect()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
}
