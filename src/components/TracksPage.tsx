import React, { useEffect, useState } from "react";
import { useSpotifyToken } from "../contexts/SpotifyContext";

// Define types for Last.fm track data
type TrackImage = {
  "#text": string;
  size: string;
};

type Track = {
  name: string;
  artist: {
    name: string;
  };
  url: string;
  image: TrackImage[];
};

// Extend Track to include Spotify image
type EnrichedTrack = Track & {
  spotifyImage?: string;
};

const TopTracks: React.FC = () => {
  const { token } = useSpotifyToken();
  const [topTracks, setTopTracks] = useState<EnrichedTrack[]>([]);

  useEffect(() => {
    // Step 1: Ensure token is available
    if (!token) return;

    // Step 2: Fetch top disco tracks from Last.fm
    const fetchTopTracks = async () => {
      try {
        const res = await fetch(
          `https://ws.audioscrobbler.com/2.0/?method=tag.gettoptracks&tag=rap&api_key=${import.meta.env.VITE_LASTFM_API_KEY}&limit=16&format=json`
        );
        const data = await res.json();

        // Step 3: Get first 12 tracks
        const tracks: Track[] = data.tracks.track.slice(0, 12);

        // Step 4: Enrich each with Spotify image via search
        const enriched = await Promise.all(
          tracks.map(async (track) => {
            try {
              const spotifyRes = await fetch(
                `https://api.spotify.com/v1/search?q=track:${encodeURIComponent(
                  track.name
                )} artist:${encodeURIComponent(track.artist.name)}&type=track&limit=1`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              const spotifyData = await spotifyRes.json();
              const image =
                spotifyData.tracks?.items?.[0]?.album?.images?.[0]?.url || "";

              return {
                ...track,
                spotifyImage: image,
              };
            } catch {
              return {
                ...track,
                spotifyImage: "",
              };
            }
          })
        );

        // Step 5: Update UI
        setTopTracks(enriched);
      } catch (error) {
        console.error("Failed to fetch top tracks:", error);
      }
    };

    fetchTopTracks();
  }, [token]);

  // Step 6: Render the layout
  return (
    <div className="flex flex-col gap-4 w-full">
      <h2 className="text-white text-xl font-semibold pb-2">Top Featured Tracks</h2>
      <div className="flex flex-wrap gap-6 justify-start">
        {topTracks.map((track, index) => (
          <div
            key={`${track.name}-${index}`}
            className="flex flex-col items-center text-white w-[100px]"
          >
            <img
              src={
                track.spotifyImage ||
                track.image.find((img) => img.size === "large")?.["#text"] ||
                "https://via.placeholder.com/150"
              }
              alt={track.name}
              className="w-20 h-20 rounded object-cover mb-2"
            />
            <a
              href={track.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-white hover:underline text-center"
            >
              {track.name}
            </a>
            <p className="text-xs text-gray-300 text-center">{track.artist.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopTracks;
