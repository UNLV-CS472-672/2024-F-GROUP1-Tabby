export type Book = {
    id: string;
    title: string;
    author: string;
    summary: string;
    image: string;
    isFavorite?: boolean;
    addToLibrary?: boolean;
};
