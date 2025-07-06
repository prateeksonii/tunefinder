import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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
type Track = { id: string; name: string; duration_ms: number };

// Utility to format ms → "m:ss"
const formatMs = (ms: number) => {
	const m = Math.floor(ms / 60000);
	const s = String(Math.floor((ms % 60000) / 1000)).padStart(2, "0");
	return `${m}:${s}`;
};

const TopAlbums: React.FC = () => {
	const { token } = useSpotifyToken();
	const [topAlbums, setTopAlbums] = useState<EnrichedAlbum[]>([]);
	const [selectedAlbum, setSelectedAlbum] = useState<EnrichedAlbum | null>(
		null,
	);
	const [tracks, setTracks] = useState<Track[]>([]);
	const [showModal, setShowModal] = useState(false);

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

	const handleAlbumClick = async (album: EnrichedAlbum) => {
		if (!token || !album.spotifyId) return;
		setSelectedAlbum(album);
		setShowModal(true);
		try {
			const res = await fetch(
				`https://api.spotify.com/v1/albums/${album.spotifyId}/tracks?limit=10`,
				{ headers: { Authorization: `Bearer ${token}` } },
			);
			if (!res.ok) {
				toast.error("Please try again after sometime!");
			}
			const data = await res.json();
			setTracks(
				data.items.map((track: any) => ({
					id: track.id,
					name: track.name,
					duration_ms: track.duration_ms,
				})),
			);
		} catch (error) {
			console.error("Failed to fetch album tracks:", error);
		}
	};

	return (
		<div className="flex flex-col gap-4 w-full">
			<h2 className="text-white text-xl font-semibold pb-2">
				Top Featured Albums
			</h2>
			<div className="flex flex-wrap gap-6 justify-start">
				{topAlbums.map((album, idx) => (
					<button
						type="button"
						key={`${album.name}-${idx}`}
						className="flex flex-col items-center text-white w-[100px] cursor-pointer"
						onClick={() => handleAlbumClick(album)}
					>
						<img
							src={
								album.spotifyImage ||
								album.image.find((img) => img.size === "large")?.["#text"] ||
								"https://via.placeholder.com/150"
							}
							alt={album.name}
							className="w-20 h-20 rounded object-cover mb-2"
						/>
						<p className="text-sm text-white text-center">{album.name}</p>
						<p className="text-xs text-gray-300 text-center">
							{album.artist.name}
						</p>
					</button>
				))}
			</div>

			{/* --- Modal (restyled only) --- */}
			{showModal && selectedAlbum && (
				<div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
					<div className="bg-[#181111] rounded-lg shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden">
						{/* Header */}
						<div className="flex items-center justify-between p-4 border-b border-gray-700">
							<h3 className="text-white text-lg font-semibold">
								{selectedAlbum.name}
							</h3>
							<button
								type="button"
								className="text-gray-400 hover:text-white"
								onClick={() => setShowModal(false)}
							>
								✕
							</button>
						</div>

						{/* Album cover */}
						{selectedAlbum.spotifyImage && (
							<img
								src={selectedAlbum.spotifyImage}
								alt={selectedAlbum.name}
								className="w-full h-40 object-cover"
							/>
						)}

						{/* Track list */}
						<div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
							{tracks.map((t, i) => (
								<div
									key={t.id}
									className="flex justify-between items-center text-white"
								>
									<span>
										{i + 1}. {t.name}
									</span>
									<span className="text-gray-400 text-sm">
										{formatMs(t.duration_ms)}
									</span>
								</div>
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default TopAlbums;
