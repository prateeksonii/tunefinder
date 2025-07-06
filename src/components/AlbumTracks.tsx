import { LoaderCircle } from "lucide-react";
import { Duration } from "luxon";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useSpotifyToken } from "@/contexts/SpotifyContext";
import type { AlbumTrackResponse } from "@/types";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";

async function fetchAlbumTracks(albumId: string, token: string) {
	const res = await fetch(
		`https://api.spotify.com/v1/albums/${albumId}/tracks`,
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		},
	);

	return res.json();
}

export default function AlbumTracks({ imageUrl }: { imageUrl: string }) {
	const params = useParams();
	const { token } = useSpotifyToken();

	const [loading, setLoading] = useState(true);
	const [trackResponse, setTrackResponse] = useState<AlbumTrackResponse>();

	useEffect(() => {
		if (!params.id || !token) return;

		setLoading(true);
		fetchAlbumTracks(params.id, token).then((data) => {
			setTrackResponse(data);
			setLoading(false);
		});
	}, [params.id, token]);

	if (loading) return <LoaderCircle className="animate-spin" />;

	return (
		<div className="mt-8 mx-auto container">
			<h2 className="scroll-m-20 mb-8 text-3xl font-semibold tracking-tight first:mt-0">
				Top Tracks
			</h2>
			<div className="grid grid-cols-1 gap-2">
				{trackResponse?.items.map((track) => (
					<>
						<a
							key={track.id}
							className="flex items-center gap-8 relative"
							href={track.external_urls.spotify}
						>
							<img
								src={imageUrl}
								alt={track.name}
								className="w-24 h-24 rounded-md object-cover mb-2"
							/>
							<div className="flex flex-col gap-2">
								<h3 className="scroll-m-20 text-xl font-semibold tracking-tight">
									{track.name}
								</h3>
								<p className="flex items-center gap-2">
									{track.explicit && (
										<Badge
											className="flex items-center text-xs"
											variant="destructive"
										>
											E
										</Badge>
									)}
									{Duration.fromMillis(track.duration_ms).toFormat("m:ss")}
								</p>
							</div>
						</a>
						<Separator />
					</>
				))}
			</div>
		</div>
	);
}
