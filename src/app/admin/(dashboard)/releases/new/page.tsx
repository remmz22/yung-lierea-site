import ReleaseForm from "@/components/admin/ReleaseForm";

export const metadata = { title: "Yeni Release" };

export default function NewReleasePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-white">Yeni Release</h1>
        <p className="mt-1 text-sm text-slate-500">
          Kapak, sözler, künye ve Spotify bağlantısı — hepsi tek formda.
        </p>
      </div>
      <ReleaseForm />
    </div>
  );
}
