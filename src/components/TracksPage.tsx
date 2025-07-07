import { Duration } from "luxon";
import React, { useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Item } from "@/types";
import { AppContext } from "../contexts/AppContext";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";

// Define types for Last.fm track data
type TrackImage = {
	"#text": string;
	size: string;
};

type Track = {
	name: string;
	artist: {
		name: string;
	};
	url: string;
	image: TrackImage[];
};

// Extend Track to include Spotify image
type EnrichedTrack = Track & {
	spotifyData?: Item;
};

const TopTracks: React.FC = () => {
	const { token } = useContext(AppContext);
	const [topTracks, setTopTracks] = useState<EnrichedTrack[]>([]);

	useEffect(() => {
		if (!token) return;

		const fetchTopTracks = async () => {
			try {
				const res = await fetch(
					`https://ws.audioscrobbler.com/2.0/?method=tag.gettoptracks&tag=rap&api_key=${import.meta.env.VITE_LASTFM_API_KEY}&limit=16&format=json`,
				);
				const data = await res.json();

				const enriched = await Promise.all(
					// biome-ignore lint/suspicious/noExplicitAny: response structure not strict
					data.tracks.track.map(async (track: any) => {
						try {
							const spotifyRes = await fetch(
								`https://api.spotify.com/v1/search?q=track:${encodeURIComponent(
									track.name,
								)} artist:${encodeURIComponent(track.artist.name)}&type=track&limit=1`,
								{
									headers: {
										Authorization: `Bearer ${token}`,
									},
								},
							);
							const spotifyData = await spotifyRes.json();

							return {
								...track,
								spotifyData: spotifyData.tracks.items[0],
							};
						} catch {
							return {
								...track,
								spotifyData: null,
							};
						}
					}),
				);

				setTopTracks(enriched);
			} catch (error) {
				console.error("Failed to fetch top tracks:", error);
			}
		};

		fetchTopTracks();
	}, [token]);

	// Step 6: Render the layout
	return (
		<div className="flex flex-col gap-4 w-full">
			<h2 className="text-white text-xl font-semibold pb-2">
				Top Featured Tracks
			</h2>
			<div className="flex flex-col gap-3">
				{topTracks.map((track, index) => (
					<React.Fragment key={track.url}>
						<a
							key={`${track.name}-${index}`}
							className="flex items-center gap-8"
							href={track.spotifyData?.external_urls.spotify}
						>
							<img
								src={
									track.spotifyData?.album?.images?.[0]?.url ||
									track.image.find((img) => img.size === "large")?.["#text"] ||
									"https://via.placeholder.com/150"
								}
								alt={track.name}
								className="w-24 h-24 rounded-md object-cover"
							/>
							<div className="w-full flex items-center justify-between">
								<div className="flex flex-col gap-2">
									<h3 className="scroll-m-20 text-xl font-semibold tracking-tight">
										{track.name}
									</h3>
									<p>{track.artist.name}</p>
									<p className="flex items-center gap-2">
										{track.spotifyData?.explicit && (
											<Badge
												className="flex items-center text-xs"
												variant="destructive"
											>
												E
											</Badge>
										)}
									</p>
								</div>
								<span>
									{Duration.fromMillis(
										track.spotifyData?.duration_ms ?? 0,
									).toFormat("m:ss")}
								</span>
							</div>
						</a>
						<Separator />
					</React.Fragment>
				))}
			</div>
		</div>
	);
};

export default TopTracks;
