import Navbar from "./Navbar";
import { BsSearchHeart } from "react-icons/bs";
import { useState } from "react";
import TopArtists from "./ArtistsPage";
import TopAlbums from "./AlbumsPage";
import TopTracks from "./TracksPage";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState("Artists");
  const tabs = ["Artists", "Albums", "Tracks"];

  return (
    <>
      <div className="flex flex-col items-center">
        <Navbar />
        <div className="mx-auto container">
          {/* Search bar */}
          <div className="w-full mt-8 flex justify-center">
            <div className="relative w-[70%]">
              <input
                type="text"
                placeholder="Search for artists, albums or tracks"
                className="w-full pl-10 pr-4 py-2 rounded-md bg-[#382929] text-white focus:outline-none focus:ring-2 focus:ring-white"
              />
              <BsSearchHeart className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white text-lg" />
            </div>
          </div>
          {/* Tabs */}
          <div className="w-full  mt-4 flex gap-6 border-b border-[#3a2d2d] relative">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative pb-2 text-sm font-semibold ${activeTab === tab ? "text-white" : "text-gray-400"
                  }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute left-0 -bottom-[1px] w-full h-[3px] bg-white rounded-full" />
                )}
              </button>
            ))}
          </div>
          <div className="mb-4">


            {/* Artists Section */}
            {activeTab === "Artists" && (
              <div className="mt-4 w-full  overflow-y-auto pr-2">
                <TopArtists />
              </div>
            )}

            {/* Albums Section */}
            {activeTab === "Albums" && (
              <div className="mt-4 w-full  overflow-y-auto pr-2">
                <TopAlbums />
              </div>
            )}

            {/* Tracks Section */}
            {activeTab === "Tracks" && (
              <div className="mt-4 w-full  overflow-y-auto pr-2">
                <TopTracks />
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  );
}
