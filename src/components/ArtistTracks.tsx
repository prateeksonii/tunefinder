import { LoaderCircle } from "lucide-react";
import { Duration } from "luxon";
import { Fragment, useContext, useEffect, useState } from "react";
import { useParams } from "react-router";
import { AppContext } from "@/contexts/AppContext";
import type { ArtistTrackResponse } from "@/types";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import Player from "./Player";

async function fetchArtistTracks(artistId: string, token: string) {
	const res = await fetch(
		`https://api.spotify.com/v1/artists/${artistId}/top-tracks`,
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		},
	);

	return res.json();
}

export default function ArtistTracks() {
	const params = useParams();
	const { token } = useContext(AppContext);

	const [loading, setLoading] = useState(true);
	const [trackResponse, setTrackResponse] = useState<ArtistTrackResponse>();
	const [trackId, setTrackId] = useState<string>();

	useEffect(() => {
		if (!params.id || !token) return;

		setLoading(true);
		fetchArtistTracks(params.id, token).then((data) => {
			setTrackResponse(data);
			setLoading(false);
		});
	}, [params.id, token]);

	if (loading) return <LoaderCircle className="animate-spin" />;

	return (
		<div className="mt-8 mx-auto container px-4 md:px-0">
			<h2 className="scroll-m-20 mb-8 text-3xl font-semibold tracking-tight first:mt-0">
				Top Tracks
			</h2>
			<div className="grid grid-cols-1 gap-2">
				{trackResponse?.tracks.map((track) => (
					<Fragment key={track.id}>
						<a
							key={track.id}
							className="flex items-center gap-8 text-white relative"
							onClick={() => setTrackId(track.id)}
						>
							<img
								src={track.album.images[0].url}
								alt={track.album.name}
								className="w-12 h-12 md:w-24 md:h-24 rounded-md object-cover mb-2"
							/>
							<div className="flex flex-col gap-2">
								<h3 className="scroll-m-20 text-lg md:text-xl font-semibold tracking-tight">
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
						{track.id === trackId && <Player trackId={trackId ?? ""} />}

					</Fragment>
				))}
			</div>
		</div>
	);
}
