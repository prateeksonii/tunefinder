// components/TopArtistsContent.tsx
import React, { useEffect, useState } from "react";
import { LoaderCircle } from 'lucide-react'
import { useSpotifyToken } from "../contexts/SpotifyContext";

type ArtistImage = {
  "#text": string;
  size: string;
};

type Artist = {
  name: string;
  mbid?: string;
  url: string;
  streamable: string;
  image: ArtistImage[];
};

type EnrichedArtist = Artist & {
  spotifyImage?: string;
};

const TopArtistsContent: React.FC = () => {
  const { token } = useSpotifyToken();
  const [topArtists, setTopArtists] = useState<EnrichedArtist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchTopArtists = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `https://ws.audioscrobbler.com/2.0/?method=tag.gettopartists&tag=rap&api_key=${import.meta.env.VITE_LASTFM_API_KEY
          }&limit=20&format=json`
        );
        const data = await res.json();
        const artists: Artist[] = data.topartists.artist;

        const enriched = await Promise.all(
          artists.map(async (artist) => {
            try {
              const spotifyRes = await fetch(
                `https://api.spotify.com/v1/search?q=${encodeURIComponent(
                  artist.name
                )}&type=artist&limit=1`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              const spotifyData = await spotifyRes.json();
              const image =
                spotifyData.artists?.items?.[0]?.images?.[0]?.url || "";

              return { ...artist, spotifyImage: image };
            } catch {
              return { ...artist, spotifyImage: "" };
            }
          })
        );

        setTopArtists(enriched);
      } catch (error) {
        console.error("Error fetching top artists:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopArtists();
  }, [token]);

  if (loading) {
    return <LoaderCircle className="animate-spin" />
  }

  return (
    <div className="grid grid-cols-5 gap-4">
      {topArtists.map((artist) => (
        <div
          key={artist.mbid || artist.name}
          className="flex flex-col items-center text-white relative"
        >
          <img
            src={
              artist.spotifyImage ||
              artist.image.find((img) => img.size === "large")?.["#text"] ||
              "https://via.placeholder.com/150"
            }
            alt={artist.name}
            className="w-full h-full rounded-md object-cover mb-2"
          />
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight absolute bottom-5">
            {artist.name}
          </h3>
        </div>
      ))}
    </div>
  );
};

export default TopArtistsContent;
