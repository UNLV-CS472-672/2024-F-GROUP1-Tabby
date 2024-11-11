import { Review } from '@/types/review';
export type Book = {
    isbn: string;
    title: string;
    author: string;
    excerpt: string;
    summary: string;
    image: string;
    rating?: 1 | 2 | 3 | 4 | 5;
    genres?: string;
    category?: string;
    publisher?: string;
    publishedDate?: string;
    pageCount?: number;
    reviews?: Review[];
    isFavorite?: boolean;
    addToLibrary?: boolean;
};
