export type Book = {
    id: string; // this will be a uuid set by db allows for categories to have the same book with the same isbn
    title: string;
    author: string;
    excerpt: string;
    summary: string;
    image: string;
    isbn?: string;
    rating?: 0 | 1 | 2 | 3 | 4 | 5;
    genres?: string;
    category?: string;
    publisher?: string;
    publishedDate?: string;
    pageCount?: number;
    isFavorite?: boolean;
    addToLibrary?: boolean;
    isCustomBook?: boolean;
    notes?: string;
};
