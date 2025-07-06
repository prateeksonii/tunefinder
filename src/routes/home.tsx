import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TopAlbums from "../components/AlbumsPage";
import TopArtists from "../components/ArtistsPage";
import Navbar from "../components/Navbar";
import TopTracks from "../components/TracksPage";

export default function HomePage() {
	const tabs = ["Artists", "Albums", "Tracks"];

	return (
		<div className="flex flex-col items-center">
			<Navbar />
			<div className="mx-auto container">
				{/* Search bar */}
				{/* <div className="w-full mt-8 flex justify-center">
					<div className="relative w-[70%]">
						<input
							type="text"
							placeholder="Search for artists, albums or tracks"
							className="w-full pl-10 pr-4 py-2 rounded-md bg-[#382929] text-white focus:outline-none focus:ring-2 focus:ring-white"
						/>
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white text-lg" />
					</div>
				</div> */}
				{/* Tabs */}
				<Tabs defaultValue="Artists">
					<TabsList className="bg-background mx-auto my-4">
						{tabs.map((tab) => (
							<>
								<TabsTrigger key={tab} value={tab}>
									{tab}
								</TabsTrigger>
							</>
						))}
					</TabsList>
					<TabsContent value="Artists">
						<TopArtists />
					</TabsContent>
					<TabsContent value="Albums">
						<TopAlbums />
					</TabsContent>
					<TabsContent value="Tracks">
						<TopTracks />
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
