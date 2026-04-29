import { createFileRoute, useParams } from "@tanstack/react-router";
import { PostEditor } from "@/components/admin/PostEditor";

export const Route = createFileRoute("/admin/posts/$id")({
  component: EditPostRoute,
});

function EditPostRoute() {
  const { id } = useParams({ from: "/admin/posts/$id" });
  return <PostEditor postId={id} />;
}
