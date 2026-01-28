export interface NewsItem {
    id: string;
    title: string;
    category: string;
    image: string;
    album?: string[];
    time: string;
    content?: string;
    views?: number;
    date?: string;
    tagColor?: string;
    createdAt?: string;
}

export interface TrainingItem {
    id: string | number;
    title: string;
    date: number;
    month: number;
    year: number;
    time: string;
    location: string;
    seats: number;
    available: number;
    price?: string;
    type: string;
    speaker?: string;
    speakerImage?: string;
    description?: string;
}

export interface MediaItem {
    id: string;
    title: string;
    category: string;
    sourceType: string;
    url?: string;
    embedCode?: string;
    description?: string;
    type?: string;
    views?: number;
}
