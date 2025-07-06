import React, { createContext, useContext, useEffect, useState } from "react";

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET

type SpotifyTokenContextType = {
  token: string | null;
};

const SpotifyTokenContext = createContext<SpotifyTokenContextType>({ token: null });

export const useSpotifyToken = () => useContext(SpotifyTokenContext);

export const SpotifyTokenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);

  const clearToken = () => {
    localStorage.removeItem("spotify_token");
    localStorage.removeItem("spotify_token_expiry");
    setToken(null);
  };

  const fetchToken = async () => {
    try {
      const params = new URLSearchParams();
      params.set('grant_type', 'client_credentials')
      params.set('client_id', CLIENT_ID)
      params.set('client_secret', CLIENT_SECRET)
      const res = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString()
      });

      const data = await res.json();
      const accessToken = data.access_token;
      const expiresIn = data.expires_in; // usually 3600 seconds (1 hour)
      const expiryTime = new Date().getTime() + expiresIn * 1000;

      // Save token and expiry to localStorage
      localStorage.setItem("spotify_token", accessToken);
      localStorage.setItem("spotify_token_expiry", expiryTime.toString());
      setToken(accessToken);

      // Auto-clear after expiry
      setTimeout(() => {
        clearToken();
      }, expiresIn * 1000);
    } catch (error) {
      console.error("Failed to fetch Spotify token:", error);
    }
  };

  useEffect(() => {
    const existingToken = localStorage.getItem("spotify_token");
    const expiry = localStorage.getItem("spotify_token_expiry");

    if (existingToken && expiry) {
      const expiryTime = Number(expiry);
      const currentTime = new Date().getTime();

      if (expiryTime > currentTime) {
        setToken(existingToken);

        // Schedule clearing
        setTimeout(() => {
          clearToken();
        }, expiryTime - currentTime);
        return;
      }
    }

    // If no valid token, fetch a new one
    fetchToken();
  }, []);

  return (
    <SpotifyTokenContext.Provider value={{ token }}>
      {children}
    </SpotifyTokenContext.Provider>
  );
};
