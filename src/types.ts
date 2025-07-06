export interface Artist {
    external_urls: ExternalUrls;
    followers:     Followers;
    genres:        string[];
    href:          string;
    id:            string;
    images:        Image[];
    name:          string;
    popularity:    number;
    type:          string;
    uri:           string;
}

export interface ExternalUrls {
    spotify: string;
}

export interface Followers {
    href:  string;
    total: number;
}

export interface Image {
    url:    string;
    height: number;
    width:  number;
}

export interface ArtistTrackResponse {
    tracks: Track[];
}

export interface Track {
    album:             Album;
    artists:           Artist[];
    available_markets: string[];
    disc_number:       number;
    duration_ms:       number;
    explicit:          boolean;
    external_ids:      ExternalIDS;
    external_urls:     ExternalUrls;
    href:              string;
    id:                string;
    is_local:          boolean;
    is_playable:       boolean;
    name:              string;
    popularity:        number;
    preview_url:       null;
    track_number:      number;
    type:              TrackType;
    uri:               string;
}

export interface Album {
    album_type:             AlbumTypeEnum;
    artists:                Artist[];
    available_markets:      string[];
    external_urls:          ExternalUrls;
    href:                   string;
    id:                     string;
    images:                 Image[];
    is_playable:            boolean;
    name:                   string;
    release_date:           Date;
    release_date_precision: ReleaseDatePrecision;
    total_tracks:           number;
    type:                   AlbumTypeEnum;
    uri:                    string;
}

export enum AlbumTypeEnum {
    Album = "album",
    Single = "single",
}

export interface ExternalUrls {
    spotify: string;
}

export enum ArtistType {
    Artist = "artist",
}

export interface Image {
    url:    string;
    height: number;
    width:  number;
}

export enum ReleaseDatePrecision {
    Day = "day",
}

export interface ExternalIDS {
    isrc: string;
}

export enum TrackType {
    Track = "track",
}

export interface AlbumResponse {
    album_type:             string;
    total_tracks:           number;
    available_markets:      string[];
    external_urls:          ExternalUrls;
    href:                   string;
    id:                     string;
    images:                 Image[];
    name:                   string;
    release_date:           Date;
    release_date_precision: string;
    type:                   string;
    uri:                    string;
    artists:                Artist[];
    tracks:                 Tracks;
    copyrights:             Copyright[];
    external_ids:           ExternalIDS;
    label:                  string;
    popularity:             number;
}

export interface ExternalUrls {
    spotify: string;
}

export interface Copyright {
    text: string;
    type: string;
}

export interface ExternalIDS {
    upc: string;
}

export interface Image {
    url:    string;
    height: number;
    width:  number;
}

export interface Tracks {
    href:     string;
    limit:    number;
    next:     null;
    offset:   number;
    previous: null;
    total:    number;
    items:    Item[];
}

export interface Item {
    artists:           Artist[];
    available_markets: string[];
    disc_number:       number;
    duration_ms:       number;
    explicit:          boolean;
    external_urls:     ExternalUrls;
    href:              string;
    id:                string;
    name:              string;
    preview_url:       null;
    track_number:      number;
    type:              ItemType;
    uri:               string;
    is_local:          boolean;
}

export enum ItemType {
    Track = "track",
}

export interface AlbumTrackResponse {
    href:     string;
    items:    Item[];
    limit:    number;
    next:     null;
    offset:   number;
    previous: null;
    total:    number;
}

export interface Item {
    artists:           Artist[];
    available_markets: string[];
    disc_number:       number;
    duration_ms:       number;
    explicit:          boolean;
    external_urls:     ExternalUrls;
    href:              string;
    id:                string;
    name:              string;
    preview_url:       null;
    track_number:      number;
    type:              ItemType;
    uri:               string;
    is_local:          boolean;
    album?: AlbumResponse;
}

export interface ExternalUrls {
    spotify: string;
}
