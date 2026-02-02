"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import ProfileForm from "./ProfileForm";


export default function ProfileSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Profile Settings</Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Profile</SheetTitle>
        </SheetHeader>

        <div className="mt-6">
          <ProfileForm />
        </div>
      </SheetContent>
    </Sheet>
  );
}
