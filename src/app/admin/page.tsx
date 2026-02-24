import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  redirect('https://supabase.com/dashboard/project/iwhejzjkdqkmkzzhibtv');
}
