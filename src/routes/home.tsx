import { Search } from "lucide-react";
import { Duration } from "luxon";
import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router";
import TopArtistsContent from "@/components/TopArtistsContent";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppContext } from "@/contexts/AppContext";
import { supabase } from "@/lib/supabase/client";
import TopAlbums from "../components/AlbumsPage";
import TopTracks from "../components/TracksPage";

async function getFavorites(tab: string, userId: string) {
	const { data } = await supabase.from("favorites").select().match({
		type: tab,
		user_id: userId,
	});

	return data;
}

async function getSearchData(query: string, type: string, token: string) {
	const searchParams = new URLSearchParams();
	searchParams.append("q", query);
	searchParams.append("type", type);
	const res = await fetch(`https://api.spotify.com/v1/search?${searchParams}`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	return res.json();
}

const tabTypeMap = {
	Artists: {
		type: "artist",
		key: "artists",
	},
	Albums: {
		type: "album",
		key: "albums",
	},
	Tracks: {
		type: "track",
		key: "tracks",
	},
};

export default function HomePage() {
	const tabs = ["Artists", "Albums", "Tracks"];
	const { user, token } = useContext(AppContext);
	const [currentTab, setCurrentTab] = useState("Artists");
	const [favorites, setFavorites] = useState<
		| {
				created_at: string;
				id: number;
				item_spotify_id: string;
				type: string;
				user_id: string | null;
		  }[]
		| null
	>([]);
	const [showFavorites, setShowFavorites] = useState(false);
	const [search, setSearch] = useState("");
	const [searchData, setSearchData] = useState<any[]>([]);

	const onTabChanged = (tab: string) => {
		setCurrentTab(tab);
		setSearch("");
	};

	useEffect(() => {
		if (user) {
			getFavorites(currentTab, user.id).then((favorites) => {
				setFavorites(favorites ?? []);
			});
		}
	}, [currentTab, user]);

	useEffect(() => {
		if (search === "" || !token) {
			if (searchData.length > 0) {
				setSearchData([]);
			}
			return;
		}

		const timer = setTimeout(() => {
			const type = (tabTypeMap as any)[currentTab];
			getSearchData(search, type.type, token).then((data) => {
				setSearchData(data[type.key].items);
			});
		}, 500);

		return () => clearTimeout(timer);
	}, [search, token, searchData.length, currentTab]);

	const onFavoriteChanged = (checked: boolean) => {
		setShowFavorites(checked);
	};

	return (
		<div className="flex flex-col items-center">
			<div className="mx-auto container mt-4">
				<Tabs defaultValue="Artists" onValueChange={onTabChanged}>
					<div className="grid grid-cols-1 md:grid-cols-3 place-items-center">
						<div aria-hidden></div>
						<TabsList className="bg-background">
							{tabs.map((tab) => (
								<TabsTrigger key={tab} value={tab}>
									{tab}
								</TabsTrigger>
							))}
						</TabsList>

						<div className="flex items-center gap-2 px-4 md:px-0 py-4 md:py-0 place-self-center md:place-self-end">
							{user && currentTab !== "Tracks" && (
								<>
									<Checkbox
										id="favorites"
										onCheckedChange={onFavoriteChanged}
									/>
									<Label htmlFor="favorites">Show favorites</Label>
								</>
							)}
						</div>

						<div className="relative my-4 w-full col-span-3">
							<Search className="absolute top-1/2 left-3 bottom-1/2 -translate-y-1/2 w-4 h-4" />
							<Input
								className="w-full px-8"
								placeholder="Search for your favorite artist"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
							/>
						</div>
					</div>

					{searchData.length > 0 && currentTab !== "Tracks" && (
						<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
							{searchData.map((item) => (
								<Link
									key={item.id}
									className="flex flex-col items-center text-white relative"
									to={`/${(tabTypeMap as any)[currentTab].key}/${item.id}`}
								>
									<img
										src={item.images?.[0]?.url}
										alt={item.name}
										className="w-full h-full rounded-md object-cover mb-2 brightness-50"
									/>
									<h3 className="scroll-m-20 text-2xl font-semibold tracking-tight absolute left-5 right-5 text-center bottom-5">
										{item.name}
									</h3>
								</Link>
							))}
						</div>
					)}
					{searchData.length > 0 &&
						currentTab === "Tracks" &&
						searchData.map((item, index) => (
							<React.Fragment key={item.url}>
								<a
									key={`${item.name}-${index}`}
									className="flex items-center gap-8"
									href={item.spotifyData?.external_urls.spotify}
								>
									<img
										src={item.album?.images?.[0]?.url}
										alt={item.name}
										className="w-24 h-24 rounded-md object-cover"
									/>
									<div className="w-full flex items-center justify-between">
										<div className="flex flex-col gap-2">
											<h3 className="scroll-m-20 text-xl font-semibold tracking-tight">
												{item.name}
											</h3>
											<p>{item.artists.map((a: any) => a.name).join(", ")}</p>
											<p className="flex items-center gap-2">
												{item.explicit && (
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
											{Duration.fromMillis(item.duration_ms ?? 0).toFormat(
												"m:ss",
											)}
										</span>
									</div>
								</a>
								<Separator />
							</React.Fragment>
						))}
					{searchData.length === 0 && (
						<>
							<TabsContent className="px-4 md:px-0" value="Artists">
								<TopArtistsContent
									showFavorites={showFavorites}
									favorites={favorites ?? []}
								/>
							</TabsContent>
							<TabsContent className="px-4 md:px-0" value="Albums">
								<TopAlbums
									showFavorites={showFavorites}
									favorites={favorites ?? []}
								/>
							</TabsContent>
							<TabsContent className="px-4 md:px-0" value="Tracks">
								<TopTracks />
							</TabsContent>
						</>
					)}
				</Tabs>
			</div>
		</div>
	);
}
