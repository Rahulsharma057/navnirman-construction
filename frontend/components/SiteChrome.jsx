"use client";
import { usePathname } from "next/navigation";
import WhatsAppButton from "@/components/WhatsAppButton";

// Keeps the floating WhatsApp button off the admin dashboard — it only
// makes sense on the pages a customer actually browses.
export default function SiteChrome() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <WhatsAppButton />;
}
