"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import AvatarProfile from "./ProfileImage";
import { Card, CardContent } from "@/components/ui/card";

type ProfileFormState = {
  name: string;
  email: string;
  phone: string;
};

export default function ProfileForm() {
  const [form, setForm] = useState<ProfileFormState>({
    name: "",
    email: "",
    phone: "",
  });

  const [profileImage, setProfileImage] = useState<File | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then(setForm);
  }, []);

  function update<K extends keyof ProfileFormState>(key: K, value: string) {
    setForm({ ...form, [key]: value });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    const data = new FormData();
    data.append("name", form.name);
    data.append("phone", form.phone);
    if (profileImage) {
      data.append("profileImage", profileImage);
    }

    await fetch("/api/profile", {
      method: "PUT",
      body: data,
    });
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
     

      {/* Avatar card */}
      <Card className="border-neutral-200">
        <CardContent className="flex  flex-col items-center gap-4 py-6">
          <AvatarProfile />
          <p className="text-sm text-neutral-500">
            Upload a profile picture
          </p>
        </CardContent>
      </Card>

      {/* Form card */}
      <Card className="border-neutral-200">
        <CardContent className="p-6">
          <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Profile image upload */}
            <div className="md:col-span-2">
              <Label className="text-sm">Profile Image</Label>
              <Input
                type="file"
                accept="image/*"
                className="mt-1"
                onChange={(e) =>
                  setProfileImage(e.target.files?.[0] ?? null)
                }
              />
            </div>

            {/* Full name */}
            <div>
              <Label className="text-sm">Full Name</Label>
              <Input
                className="mt-1"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
              />
            </div>

            {/* Email */}
            <div>
              <Label className="text-sm">Email</Label>
              <Input
                className="mt-1 bg-neutral-100 cursor-not-allowed"
                value={form.email}
                disabled
              />
            </div>

            {/* Phone */}
            <div>
              <Label className="text-sm">Phone</Label>
              <Input
                className="mt-1"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
              />
            </div>

            {/* Submit */}
            <div className="md:col-span-2 pt-2">
              <Button className="w-full bg-[#007B7F] hover:bg-[#00686C]">
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
