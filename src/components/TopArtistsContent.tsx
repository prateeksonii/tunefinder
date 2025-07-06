// components/TopArtistsContent.tsx

import { LoaderCircle } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import type { Artist } from "@/types";
import { useSpotifyToken } from "../contexts/SpotifyContext";

type ArtistImage = {
	"#text": string;
	size: string;
};

type LastFMArtist = {
	name: string;
	mbid?: string;
	url: string;
	streamable: string;
	image: ArtistImage[];
};

type EnrichedArtist = LastFMArtist & {
	spotifyData?: Artist;
};

const TopArtistsContent: React.FC = () => {
	const { token } = useSpotifyToken();
	const [topArtists, setTopArtists] = useState<EnrichedArtist[]>([]);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();

	useEffect(() => {
		if (!token) return;

		const fetchTopArtists = async () => {
			try {
				setLoading(true);
				const res = await fetch(
					`https://ws.audioscrobbler.com/2.0/?method=tag.gettopartists&tag=rap&api_key=${
						import.meta.env.VITE_LASTFM_API_KEY
					}&limit=20&format=json`,
				);
				const data = await res.json();
				const artists: LastFMArtist[] = data.topartists.artist;

				const enriched = await Promise.all(
					artists.map(async (artist) => {
						try {
							const spotifyRes = await fetch(
								`https://api.spotify.com/v1/search?q=${encodeURIComponent(
									artist.name,
								)}&type=artist&limit=1`,
								{
									headers: { Authorization: `Bearer ${token}` },
								},
							);
							const spotifyData = await spotifyRes.json();
							const spotifyArtistData = spotifyData.artists
								?.items?.[0] as Artist;

							return { ...artist, spotifyData: spotifyArtistData };
						} catch {
							return { ...artist, spotifyData: undefined };
						}
					}),
				);

				setTopArtists(enriched);
			} catch (error) {
				console.error("Error fetching top artists:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchTopArtists();
	}, [token]);

	if (loading) {
		return <LoaderCircle className="animate-spin" />;
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
			{topArtists.map((artist) => (
				<Link
					key={artist.mbid || artist.name}
					className="flex flex-col items-center text-white relative"
					to={`/artists/${artist.spotifyData?.id}`}
				>
					<img
						src={
							artist.spotifyData?.images[0].url ||
							artist.image.find((img) => img.size === "large")?.["#text"] ||
							"https://via.placeholder.com/150"
						}
						alt={artist.name}
						className="w-full h-full rounded-md object-cover mb-2"
					/>
					<h3 className="scroll-m-20 text-2xl font-semibold tracking-tight absolute bottom-5">
						{artist.name}
					</h3>
				</Link>
			))}
		</div>
	);
};

export default TopArtistsContent;
