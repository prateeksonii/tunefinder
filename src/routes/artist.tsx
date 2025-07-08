import ColorThief from "colorthief";
import { Heart, LoaderCircle } from "lucide-react";
import { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { toast } from "sonner";
import ArtistTracks from "@/components/ArtistTracks";
import { Button } from "@/components/ui/button";
import { AppContext } from "@/contexts/AppContext";
import { supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Artist } from "@/types";

async function fetchArtistDetails(artistId: string, token: string) {
	const res = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	return res.json();
}

async function checkFavorite(
	artistId: string,
	userId: string,
): Promise<boolean> {
	const { count } = await supabase
		.from("favorites")
		.select("*", { count: "exact" })
		.match({
			user_id: userId,
			item_spotify_id: artistId,
			type: "Artists",
		});
	return count ? count > 0 : false;
}

const formatter = Intl.NumberFormat("en-US", {});

export default function ArtistPage() {
	const params = useParams();
	const { token, user } = useContext(AppContext);
	const [artist, setArtist] = useState<Artist>();
	const [loading, setLoading] = useState(true);
	const imageRef = useRef<HTMLImageElement>(null);
	const [bgColor, setBgColor] = useState("");
	const [isFavorite, setIsFavorite] = useState(false);

	useEffect(() => {
		if (!params.id || !token) return;

		setLoading(true);
		fetchArtistDetails(params.id, token).then((data) => {
			setArtist(data);
			setLoading(false);
		});
		if (user) {
			checkFavorite(params.id, user.id).then((isFavorite) => {
				setIsFavorite(isFavorite);
			});
		}
	}, [params.id, token, user]);

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

	const toggleFavorite = async () => {
		if (!user) return;
		if (isFavorite) {
			await supabase.from("favorites").delete().match({
				// biome-ignore lint/style/noNonNullAssertion: already checked
				item_spotify_id: params.id!,
				type: "Artists",
				user_id: user.id,
			});
			setIsFavorite(false);
			return;
		}
		const { error } = await supabase.from("favorites").insert({
			// biome-ignore lint/style/noNonNullAssertion: already checked above
			item_spotify_id: params.id!,
			type: "Artists",
			user_id: user?.id,
		});

		if (error) {
			toast.error(error.message);
			return;
		}

		setIsFavorite(true);
	};

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
				<div className="mx-auto container flex items-center flex-col md:flex-row gap-8">
					<div>
						<img
							ref={imageRef}
							src={artist.images[0].url}
							alt="artist cover"
							className="w-32 md:w-52 rounded-full object-cover"
							crossOrigin="anonymous"
							width={200}
							height={200}
						/>
					</div>
					<div className="w-full text-center md:text-left">
						<h1 className="gap-6 scroll-m-20 text-center md:text-left text-3xl md:text-5xl font-extrabold tracking-tight text-balance">
							{artist.name}
						</h1>
						<div className="mt-2 md:text-2xl">
							{formatter.format(artist.followers.total)} Followers
						</div>
						{user && (
							<Button
								variant="outline"
								className="mt-4"
								onClick={toggleFavorite}
							>
								<Heart
									onClick={toggleFavorite}
									size={24}
									className={cn(
										"w-6 h-6",
										isFavorite ? "fill-foreground" : "fill-none",
									)}
								/>{" "}
								Favorite
							</Button>
						)}
					</div>
				</div>
			</div>
			<ArtistTracks />
		</div>
	);
}
