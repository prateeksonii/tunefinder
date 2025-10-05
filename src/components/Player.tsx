interface Props {
    trackId: string;
}

export default function Player({ trackId }: Props) {
    if (!trackId) return null;
    return <iframe
        src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator`}
        width="100%" height="152"
        allowFullScreen={false}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy">
    </iframe>
}