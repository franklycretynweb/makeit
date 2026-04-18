"use client";

import { useEffect, useState, useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import confetti from "canvas-confetti";
import DesignViewer from "@/components/panel/design-review/DesignViewer";
import ReviewSidebar from "@/components/panel/design-review/ReviewSidebar";
import { createClient } from "@/lib/supabase/client";
import { getProjectForUser } from "@/lib/utils/project";

export interface DesignVersion {
  id: string;
  version_name: string;
  label: string;
  note: string;
  storage_path: string;
  status: string;
  is_current: boolean;
  created_at: string;
}

export default function DesignReviewPage() {
  const [versions, setVersions] = useState<DesignVersion[]>([]);
  const [versionImages, setVersionImages] = useState<string[]>([]);
  const [activeVersion, setActiveVersion] = useState(0);
  const [approved, setApproved] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const project = await getProjectForUser(supabase);
      if (!project) { setLoading(false); return; }

      setProjectId(project.id);
      setCompanyName(project.name ?? "");

      const { data } = await supabase
        .from("design_versions")
        .select("*")
        .eq("project_id", project.id)
        .order("created_at", { ascending: true });

      const rows = (data ?? []) as DesignVersion[];
      setVersions(rows);

      // Generate public URLs from Storage
      const urls = rows.map((v) => {
        const { data: urlData } = supabase.storage
          .from("designs")
          .getPublicUrl(v.storage_path);
        return urlData.publicUrl;
      });
      setVersionImages(urls);

      // Default to current version, or last
      const currentIdx = rows.findIndex((v) => v.is_current);
      setActiveVersion(currentIdx >= 0 ? currentIdx : Math.max(rows.length - 1, 0));

      // Check if already approved
      const activeRow = rows[currentIdx >= 0 ? currentIdx : rows.length - 1];
      if (activeRow?.status === "approved") setApproved(true);

      setLoading(false);
    };
    load();
  }, []);

  const handleApprove = useCallback(async () => {
    if (!projectId || versions.length === 0) return;
    const version = versions[activeVersion];
    if (!version) return;

    const supabase = createClient();
    await supabase
      .from("design_versions")
      .update({ status: "approved" })
      .eq("id", version.id);

    await supabase.from("activity_events").insert({
      project_id: projectId,
      event_type: "design",
      title: `${version.version_name} zatwierdzona`,
      description: "Wersja designu zatwierdzona przez klienta.",
      author: companyName,
    });

    setApproved(true);
    setVersions((prev) =>
      prev.map((v, i) => (i === activeVersion ? { ...v, status: "approved" } : v))
    );

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.7, x: 0.5 },
      colors: ["#111111", "#555555", "#AAAAAA", "#DDDDDD"],
    });
  }, [projectId, versions, activeVersion, companyName]);

  const handleVersionChange = (i: number) => {
    setActiveVersion(i);
    setApproved(versions[i]?.status === "approved");
  };

  if (loading) {
    return (
      <div className="flex flex-col h-[calc(100vh-56px)] items-center justify-center">
        <div className="animate-pulse h-4 bg-[#F0F0F0] rounded w-32" />
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="flex flex-col h-[calc(100vh-56px)] items-center justify-center gap-3">
        <p className="font-sans text-[14px] text-[#AAAAAA]">Brak wersji designu</p>
        <p className="font-sans text-[13px] text-[#CCCCCC]">Agencja doda wersje do przeglądu.</p>
      </div>
    );
  }

  const currentVersion = versions[activeVersion];
  const statusLabel =
    approved ? "Zatwierdzona"
    : currentVersion?.status === "review" ? "W review"
    : currentVersion?.status === "changes" ? "Poprawki"
    : currentVersion?.status === "rejected" ? "Odrzucona"
    : currentVersion?.status ?? "—";

  const isActiveStatus = approved || currentVersion?.status === "review";

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      {/* Contextual topbar */}
      <div className="h-[48px] bg-white border-b border-[#EBEBEB] px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <a
            href="/panel"
            className="flex items-center gap-1.5 font-sans text-[13px] font-medium text-[#AAAAAA] hover:text-[#111111] transition-colors duration-150"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
            Wróć
          </a>
          <div className="w-px h-4 bg-[#EBEBEB]" />
          <span className="font-sans text-[13px] font-medium text-[#111111]">
            {currentVersion?.version_name ?? "Design Review"}
          </span>
        </div>

        <span
          className={`inline-flex items-center font-sans text-[11px] font-semibold border rounded-md px-2.5 py-1 ${
            isActiveStatus
              ? "bg-[#111111] text-white border-[#111111]"
              : "bg-[#F5F5F5] text-[#555555] border-[#EBEBEB]"
          }`}
        >
          {statusLabel}
        </span>
      </div>

      {/* Viewer + sidebar */}
      <div className="flex flex-1 min-h-0">
        <DesignViewer
          src={versionImages[activeVersion] ?? ""}
          alt={currentVersion?.version_name ?? ""}
        />
        <ReviewSidebar
          activeVersion={activeVersion}
          onVersionChange={handleVersionChange}
          onApprove={handleApprove}
          approved={approved}
          versions={versions}
          projectId={projectId ?? ""}
          companyName={companyName}
        />
      </div>
    </div>
  );
}
