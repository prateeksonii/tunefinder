import type React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useSpotifyToken } from "../contexts/SpotifyContext";

type AlbumImage = { "#text": string; size: string };
type Album = {
	name: string;
	artist: { name: string };
	url: string;
	image: AlbumImage[];
};
type EnrichedAlbum = Album & {
	spotifyImage?: string;
	spotifyId?: string | null;
};

const TopAlbums: React.FC = () => {
	const { token } = useSpotifyToken();
	const [topAlbums, setTopAlbums] = useState<EnrichedAlbum[]>([]);

	useEffect(() => {
		if (!token) return;
		const fetchTopAlbums = async () => {
			try {
				const res = await fetch(
					`https://ws.audioscrobbler.com/2.0/?method=tag.gettopalbums&tag=rap&api_key=${
						import.meta.env.VITE_LASTFM_API_KEY
					}&limit=16&format=json`,
				);
				const data = await res.json();
				const albums: Album[] = data.albums.album;

				const enriched = await Promise.all(
					albums.map(async (album) => {
						try {
							const spotifyRes = await fetch(
								`https://api.spotify.com/v1/search?q=album:${encodeURIComponent(
									album.name,
								)}%20artist:${encodeURIComponent(
									album.artist.name,
								)}&type=album&limit=1`,
								{ headers: { Authorization: `Bearer ${token}` } },
							);
							const spotifyData = await spotifyRes.json();
							const spotifyAlbum = spotifyData.albums?.items?.[0];
							return {
								...album,
								spotifyImage: spotifyAlbum?.images?.[0]?.url || "",
								spotifyId: spotifyAlbum?.id || null,
							};
						} catch {
							return { ...album, spotifyImage: "", spotifyId: null };
						}
					}),
				);

				setTopAlbums(enriched);
			} catch (error) {
				console.error("Failed to fetch top albums:", error);
			}
		};

		fetchTopAlbums();
	}, [token]);

	return (
		<div className="flex flex-col gap-4 w-full">
			<h2 className="text-white text-xl font-semibold pb-2">
				Top Featured Albums
			</h2>
			<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
				{topAlbums.map((album) => (
					<Link
						key={album.spotifyId}
						className="flex flex-col items-center text-white relative"
						to={`/albums/${album.spotifyId}`}
					>
						<img
							src={
								album.spotifyImage ||
								album.image.find((img) => img.size === "large")?.["#text"] ||
								"https://via.placeholder.com/150"
							}
							alt={album.name}
							className="w-full h-full rounded-md object-cover mb-2 brightness-50"
						/>
						<h3 className="scroll-m-20 text-2xl font-semibold tracking-tight absolute left-5 right-5 text-center bottom-5">
							{album.name}
						</h3>
					</Link>
				))}
			</div>
		</div>
	);
};

export default TopAlbums;
