export type Review = {
  author: string;
  rating: number;
  comment: string;
  date: string;
};

export type GoogleReview = {
  author_name: string;
  rating: number;
  text: string;
  relative_time_description: string;
  time?: number;
};
