import { Review } from '@/types/review';
export type Book = {
    id: string;
    title: string;
    author: string;
    excerpt: string;
    summary: string;
    image: string;
    rating?: 1 | 2 | 3 | 4 | 5;
    genres?: string[];
    reviews?: Review[];
    isFavorite?: boolean;
    addToLibrary?: boolean;
};
