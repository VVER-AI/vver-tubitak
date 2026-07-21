import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { error } = await supabase.auth.getSession();

  const connected = !error;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "not set";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-50 font-sans dark:bg-black">
      <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
        VVER TÜBİTAK Dashboard
      </h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Supabase bağlantısı: {connected ? "✓ OK" : `✗ Hata (${error?.message})`}
      </p>
      <p className="text-sm text-zinc-500 dark:text-zinc-500">{supabaseUrl}</p>
    </div>
  );
}
