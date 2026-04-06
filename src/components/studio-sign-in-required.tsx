import Link from 'next/link';

type Props = {
  /** Path to return to after login (e.g. `/studio` or `/studio-beta?border=slug`). */
  returnPath: string;
};

export function StudioSignInRequired({ returnPath }: Props) {
  const loginHref = `/auth/login?redirect=${encodeURIComponent(returnPath)}`;
  return (
    <div className="mx-auto max-w-lg px-6 py-24 text-center">
      <h1 className="text-3xl font-semibold text-charcoal">Studio</h1>
      <p className="mt-6 text-lg text-charcoal/90">Sign in to start designing your tarot deck</p>
      <Link
        href={loginHref}
        className="mt-8 inline-flex rounded-sm border border-charcoal bg-charcoal px-6 py-3 text-sm font-medium text-cream transition hover:bg-charcoal/90"
      >
        Sign in
      </Link>
    </div>
  );
}
