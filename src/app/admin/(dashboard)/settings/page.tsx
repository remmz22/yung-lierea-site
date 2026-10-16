import { getSiteSettings } from "@/lib/data";
import SettingsForms from "@/components/admin/SettingsForms";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ayarlar" };

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-white">Ayarlar</h1>
        <p className="mt-1 text-sm text-slate-500">
          Site iletişim bilgileri, sosyal medya linkleri ve şifre yönetimi.
        </p>
      </div>
      <SettingsForms settings={settings} />
    </div>
  );
}
