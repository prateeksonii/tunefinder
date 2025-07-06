import ColorThief from "colorthief";
import { LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import ArtistTracks from "@/components/ArtistTracks";
import { useSpotifyToken } from "@/contexts/SpotifyContext";
import type { Artist } from "@/types";

async function fetchArtistDetails(artistId: string, token: string) {
	const res = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	return res.json();
}

const formatter = Intl.NumberFormat("en-US", {});

export default function ArtistPage() {
	const params = useParams();
	const { token } = useSpotifyToken();
	const [artist, setArtist] = useState<Artist>();
	const [loading, setLoading] = useState(true);
	const imageRef = useRef<HTMLImageElement>(null);
	const [bgColor, setBgColor] = useState("");

	useEffect(() => {
		if (!params.id || !token) return;

		setLoading(true);
		fetchArtistDetails(params.id, token).then((data) => {
			setArtist(data);
			setLoading(false);
		});
	}, [params.id, token]);

	useEffect(() => {
		const img = imageRef.current;
		if (!img) return;

		if (loading) return;

		const handleLoad = () => {
			const colorThief = new ColorThief();
			const colors = colorThief.getColor(img);
			setBgColor(`rgba(${colors.join(",")},0.8)`);
		};

		if (img.complete) {
			// Image was already loaded (cache)
			handleLoad();
		} else {
			// Wait for it to load
			img.addEventListener("load", handleLoad);
		}

		return () => {
			img.removeEventListener("load", handleLoad);
		};
	}, [loading]);

	if (loading) {
		return <LoaderCircle className="animate-spin" />;
	}

	if (!artist) return null;

	return (
		<div>
			<div
				className="py-8"
				style={{
					backgroundColor: bgColor,
				}}
			>
				<div className="mx-auto container flex items-center gap-8">
					<div>
						<img
							ref={imageRef}
							src={artist.images[0].url}
							alt="artist cover"
							className="w-52 h-5w-52 rounded-full object-cover"
							crossOrigin="anonymous"
							width={200}
							height={200}
						/>
					</div>
					<div className="w-full">
						<h1 className="flex items-center gap-6 scroll-m-20 text-center text-5xl font-extrabold tracking-tight text-balance">
							{artist.name}
						</h1>
						<div className="mt-2 text-2xl">
							{formatter.format(artist.followers.total)} Followers
						</div>
					</div>
				</div>
			</div>
			<ArtistTracks />
		</div>
	);
}
