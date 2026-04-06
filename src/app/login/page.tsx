import { redirect } from 'next/navigation';

export default function LoginAliasPage({
  searchParams,
}: {
  searchParams: { redirect?: string };
}) {
  const target = searchParams?.redirect?.trim();
  const q = target ? `?redirect=${encodeURIComponent(target)}` : '';
  redirect(`/auth/login${q}`);
}
