// pages/TopArtists.tsx
import type React from "react";
import TopArtistsContent from "./TopArtistsContent";

const TopArtists: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 w-full">
      <h2 className="text-white text-xl font-semibold pb-2">
        Top Featured Artists
      </h2>
      <div className="mx-auto container">
          <TopArtistsContent />
      </div>
    </div>
  );
};

export default TopArtists;
