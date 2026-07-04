import { PostForm } from "@/components/admin/post-form";
import { getPostCategories } from "@/app/(admin)/admin/(dashboard)/post-categories/actions";

export default async function NewPostPage() {
  const { data: categories } = await getPostCategories();

  return (
    <PostForm categories={categories || []} />
  );
}
