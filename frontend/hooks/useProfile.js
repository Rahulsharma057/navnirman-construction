"use client";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { COMPANY, isPersonName } from "@/lib/company";

// One shared place to read the business profile. Falls back to the built-in
// company details so the site never shows blanks or the wrong name while the
// API is loading (or if it's briefly unreachable).
export default function useProfile() {
  const query = useQuery({
    queryKey: ["profile"],
    queryFn: async () => (await api.get("/profile")).data.profile,
  });
  const profile = { ...COMPANY, ...stripEmpty(query.data || {}) };
  // if the saved business name is just "Rakesh" (a person), show the company name instead
  if (isPersonName(profile.businessName, profile)) profile.businessName = COMPANY.businessName;
  return { profile, raw: query.data, isLoading: query.isLoading };
}

const stripEmpty = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== "" && v !== null && v !== undefined));
