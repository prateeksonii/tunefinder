/** biome-ignore-all lint/correctness/useExhaustiveDependencies: <explanation> */

import type { User } from "@supabase/supabase-js";
import type React from "react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { AppContext } from "./AppContext";

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [token, setToken] = useState<string | null>(null);
	const [user, setUser] = useState<User | null>(null);

	const clearToken = () => {
		localStorage.removeItem("spotify_token");
		localStorage.removeItem("spotify_token_expiry");
		setToken(null);
	};

	const fetchToken = async () => {
		try {
			const params = new URLSearchParams();
			params.set("grant_type", "client_credentials");
			params.set("client_id", CLIENT_ID);
			params.set("client_secret", CLIENT_SECRET);
			const res = await fetch("https://accounts.spotify.com/api/token", {
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
				body: params.toString(),
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

	useEffect(() => {
		const sub = supabase.auth.onAuthStateChange((_, session) => {
			setUser(session?.user ?? null);
		});

		return () => sub.data.subscription.unsubscribe();
	}, []);

	return (
		<AppContext.Provider value={{ token, user }}>
			{children}
		</AppContext.Provider>
	);
};
