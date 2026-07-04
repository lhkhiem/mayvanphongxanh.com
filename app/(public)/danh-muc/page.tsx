import { redirect } from 'next/navigation';

export default function CategoriesPage() {
  // Redirect /danh-muc to /san-pham
  redirect('/san-pham');
}
