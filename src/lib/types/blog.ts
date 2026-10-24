export type Blog = {
  id: number;
  title: string;
  content: string;
    paragraph: string;
  image: string;
  author: {
    name: string;
    image: string;
    designation: string;
  };
};
