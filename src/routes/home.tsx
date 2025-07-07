import { useContext, useEffect, useState } from "react";
import TopArtistsContent from "@/components/TopArtistsContent";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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

export default function HomePage() {
	const tabs = ["Artists", "Albums", "Tracks"];
	const { user } = useContext(AppContext);
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

	const onTabChanged = (tab: string) => {
		setCurrentTab(tab);
	};

	useEffect(() => {
		if (user) {
			getFavorites(currentTab, user.id).then((favorites) => {
				setFavorites(favorites ?? []);
			});
		}
	}, [currentTab, user]);

	const onFavoriteChanged = (checked: boolean) => {
		setShowFavorites(checked);
	};

	return (
		<div className="flex flex-col items-center">
			<div className="mx-auto container mt-4">
				<Tabs defaultValue="Artists" onValueChange={onTabChanged}>
					<div className="grid grid-cols-3 place-items-center">
						<div aria-hidden></div>
						<TabsList className="bg-background">
							{tabs.map((tab) => (
								<TabsTrigger key={tab} value={tab}>
									{tab}
								</TabsTrigger>
							))}
						</TabsList>
						<div className="flex items-center gap-2 place-self-end">
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
					</div>

					<TabsContent value="Artists">
						<TopArtistsContent
							showFavorites={showFavorites}
							favorites={favorites ?? []}
						/>
					</TabsContent>
					<TabsContent value="Albums">
						<TopAlbums
							showFavorites={showFavorites}
							favorites={favorites ?? []}
						/>
					</TabsContent>
					<TabsContent value="Tracks">
						<TopTracks />
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
