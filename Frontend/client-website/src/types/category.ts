export interface Category {
  id: number;
  parentId?: Category;
  name: string;
  slug: string;
  isActive: boolean;
  children?: Category[];
}
