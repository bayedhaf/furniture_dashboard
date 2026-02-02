
import ProfileSheet from "@/app/setting/ProfileSheet";
export default function ProfileSettingsPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1B3A57]">
          Profile Settings
        </h1>
        <p className="text-sm text-neutral-500">
          Manage your personal information
        </p>
      </div>

      <ProfileSheet />
    </div>
  );
}
