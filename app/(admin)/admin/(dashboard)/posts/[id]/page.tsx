import { notFound } from "next/navigation";
import { PostForm } from "@/components/admin/post-form";
import { getPost } from "@/app/(admin)/admin/(dashboard)/posts/actions";
import { getPostCategories } from "@/app/(admin)/admin/(dashboard)/post-categories/actions";

export default async function EditPostPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const [postRes, categoriesRes] = await Promise.all([
    getPost(id),
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
