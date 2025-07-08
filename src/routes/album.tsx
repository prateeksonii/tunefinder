import ColorThief from "colorthief";
import { Heart, LoaderCircle } from "lucide-react";
import { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { toast } from "sonner";
import AlbumTracks from "@/components/AlbumTracks";
import { Button } from "@/components/ui/button";
import { AppContext } from "@/contexts/AppContext";
import { supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { AlbumResponse } from "@/types";

async function fetchAlbumDetails(albumId: string, token: string) {
	const res = await fetch(`https://api.spotify.com/v1/albums/${albumId}`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	return res.json();
}

async function checkFavorite(
	albumId: string,
	userId: string,
): Promise<boolean> {
	const { count } = await supabase
		.from("favorites")
		.select("*", { count: "exact" })
		.match({
			user_id: userId,
			item_spotify_id: albumId,
			type: "Albums",
		});
	return count ? count > 0 : false;
}

export default function AlbumPage() {
	const params = useParams();
	const { token, user } = useContext(AppContext);
	const [albumResponse, setAlbumResponse] = useState<AlbumResponse>();
	const [loading, setLoading] = useState(true);
	const imageRef = useRef<HTMLImageElement>(null);
	const [bgColor, setBgColor] = useState("");
	const [isFavorite, setIsFavorite] = useState(false);

	useEffect(() => {
		if (!params.id || !token) return;

		setLoading(true);
		fetchAlbumDetails(params.id, token).then((data) => {
			setAlbumResponse(data);
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
				type: "Albums",
				user_id: user.id,
			});
			setIsFavorite(false);
			return;
		}
		const { error } = await supabase.from("favorites").insert({
			// biome-ignore lint/style/noNonNullAssertion: already checked above
			item_spotify_id: params.id!,
			type: "Albums",
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

	if (!albumResponse) return null;

	return (
		<div>
			<div
				className="py-8"
				style={{
					backgroundColor: bgColor,
				}}
			>
				<div className="mx-auto container px-4 md:px-0 flex flex-col md:flex-row items-center gap-8">
					<div>
						<img
							ref={imageRef}
							src={albumResponse.images[0].url}
							alt="artist cover"
							className="w-32 md:w-52 rounded-full object-cover"
							crossOrigin="anonymous"
							width={200}
							height={200}
						/>
					</div>
					<div className="w-full text-center md:text-left">
						<h1 className="gap-6 scroll-m-20 text-center md:text-left text-3xl md:text-5xl font-extrabold tracking-tight text-balance">
							{albumResponse.name}
						</h1>
						<div className="mt-2 md:text-2xl">
							{albumResponse.artists.map((artist) => artist.name).join(", ")}
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
			<AlbumTracks imageUrl={albumResponse.images?.[0].url} />
		</div>
	);
}
