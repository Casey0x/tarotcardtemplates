import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  const SUPABASE_PROJECT_URL = "https://iwhejzjkdqkmkzzhibtv.supabase.co";

  // Get "whejzjkdqkmkzzhibtv" from the URL
  const host = new URL(SUPABASE_PROJECT_URL).hostname; // iwhejzjkdqkmkzzhibtv.supabase.co
  const projectRef = host.split(".")[0].replace(/^i/, ""); // whejzjkdqkmkzzhibtv

  redirect(`https://supabase.com/dashboard/project/${projectRef}`);
}
