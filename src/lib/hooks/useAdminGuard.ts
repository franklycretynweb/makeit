"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function useAdminGuard() {
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      // Rola z app_metadata — bezpieczne, bez rekurencji RLS
      if (user.app_metadata?.role !== "admin") { router.push("/panel"); return; }
      setReady(true);
    };
    check();
  }, [router]);

  return ready;
}
