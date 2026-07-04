import { notFound } from "next/navigation";
import { PostForm } from "@/components/admin/post-form";
import { getPost } from "@/app/(admin)/admin/(dashboard)/posts/actions";
import { getPostCategories } from "@/app/(admin)/admin/(dashboard)/post-categories/actions";

export default async function EditPostPage({
  params
}: {
  params: { id: string }
}) {
  const [postRes, categoriesRes] = await Promise.all([
    getPost(params.id),
    getPostCategories()
  ]);

  if (!postRes.data) {
    notFound();
  }

  return (
    <PostForm 
      initialData={postRes.data} 
      categories={categoriesRes.data || []} 
    />
  );
}
