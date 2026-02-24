import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  // Sends you to your Supabase project dashboard
  redirect("https://supabase.com/dashboard/project/iwhejzjkdqkmkzzhibtv");
}
