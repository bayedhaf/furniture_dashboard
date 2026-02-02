import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AvatarProfile() {
  const [profileUrl, setProfileUrl] = useState<string | null>(null);
  const [name, setName] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        setProfileUrl(data?.profileImageUrl ?? null);
        setName(data?.name ?? "");
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const initials = name
    .split(" ")
    .map((s) => s?.[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-20 w-20 border border-neutral-200 shadow-sm">
        {profileUrl ? (
          <AvatarImage
            src={profileUrl}
            alt={name || "Profile"}
            className="object-cover"
          />
        ) : (
          <AvatarFallback className="bg-[#007B7F]/10 text-[#007B7F] text-xl font-semibold">
            {initials || "U"}
          </AvatarFallback>
        )}
      </Avatar>

      {/* Optional name display (nice for profile pages) */}
      {name && (
        <div className="hidden sm:block">
          <p className="text-sm text-neutral-500">Signed in as</p>
          <p className="font-semibold text-neutral-900">{name}</p>
        </div>
      )}
    </div>
  );
}
