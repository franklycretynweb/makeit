"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Search, Upload, Palette, Type, Image as ImageIcon } from "lucide-react";
import FileCard from "@/components/panel/files/FileCard";
import { createClient } from "@/lib/supabase/client";

const FILTERS = ["Wszystkie", "Logo", "Strona", "Faktury", "Inne"] as const;
type Filter = (typeof FILTERS)[number];

interface DBFile {
  id: string;
  name: string;
  type: string;
  size: string;
  storage_path: string;
  category: string;
  is_new: boolean;
  uploaded_at: string;
}

interface FileCardData {
  id: string;
  name: string;
  type: string;
  size: string;
  date: string;
  category: string;
  isNew: boolean;
  preview?: string;
  downloadUrl?: string;
}

const brandAssets = [
  { icon: Palette, label: "Paleta kolorów", sub: "#1B3A6B · #F97316 · #F5F5F5" },
  { icon: Type,    label: "Typografia",     sub: "Inter · Cabinet Grotesk" },
  { icon: ImageIcon, label: "Logo (3 warianty)", sub: "SVG · PNG · dark · light" },
];

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 16 } as const,
  animate: { opacity: 1, y: 0 } as const,
  transition: { duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
});

const IMAGE_TYPES = ["webp", "jpg", "jpeg", "png", "gif"];
const BUCKET = "files";

export default function PlikiPage() {
  const [files, setFiles] = useState<FileCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("");
  const [activeFilter, setActiveFilter] = useState<Filter>("Wszystkie");
  const [search, setSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const fetchFiles = async (projId: string) => {
    const { data } = await supabase
      .from("files")
      .select("*")
      .eq("project_id", projId)
      .order("uploaded_at", { ascending: false });

    if (!data) return;

    const mapped: FileCardData[] = data.map((f: DBFile) => {
      const isImage = IMAGE_TYPES.includes(f.type.toLowerCase());
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(f.storage_path);
      return {
        id: f.id,
        name: f.name,
        type: f.type,
        size: f.size,
        date: new Date(f.uploaded_at).toLocaleDateString("pl-PL", { day: "numeric", month: "short" }),
        category: f.category,
        isNew: f.is_new,
        preview: isImage ? urlData.publicUrl : undefined,
        downloadUrl: urlData.publicUrl,
      };
    });

    setFiles(mapped);
  };

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: project } = await supabase
        .from("projects")
        .select("id, name")
        .eq("client_id", user.id)
        .single();

      if (!project) { setLoading(false); return; }
      setProjectId(project.id);
      setProjectName(project.name);
      await fetchFiles(project.id);
      setLoading(false);
    };
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !projectId) return;
    setUploading(true);

    const ext = file.name.split(".").pop() ?? "bin";
    const path = `${projectId}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { upsert: false });

    if (uploadError) {
      alert("Błąd uploadu: " + uploadError.message);
      setUploading(false);
      return;
    }

    const sizeStr = file.size > 1048576
      ? `${(file.size / 1048576).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    await supabase.from("files").insert({
      project_id: projectId,
      name: file.name,
      type: ext,
      size: sizeStr,
      storage_path: path,
      category: "Inne",
      is_new: true,
    });

    await fetchFiles(projectId);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const filtered = files.filter((f) => {
    const matchCat = activeFilter === "Wszystkie" || f.category === activeFilter;
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <motion.div {...fadeUp(0)} className="flex items-center justify-between gap-4">
        <h1 className="font-display text-[28px] font-bold tracking-[-0.04em] text-[#111111]">
          Pliki & Deliverables
        </h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#AAAAAA]" strokeWidth={1.75} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Szukaj pliku..."
              className="font-sans text-[13px] pl-9 pr-4 py-2 border border-[#EBEBEB] rounded-lg w-[200px] focus:outline-none focus:border-[#AAAAAA] focus:w-[240px] bg-white transition-all duration-300 placeholder:text-[#CCCCCC] shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
            />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 bg-[#111111] hover:bg-[#2a2a2a] text-white font-sans text-[13px] font-medium px-4 py-2 rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.15)] transition-all duration-150 disabled:opacity-50"
          >
            <Upload className="w-3.5 h-3.5" strokeWidth={2} />
            {uploading ? "Przesyłanie..." : "Prześlij"}
          </button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div {...fadeUp(0.04)} className="flex gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`font-sans text-[13px] font-medium px-4 py-1.5 rounded-lg transition-all duration-150 ${
              f === activeFilter
                ? "bg-[#111111] text-white"
                : "text-[#666666] bg-white border border-[#EBEBEB] hover:border-[#CCCCCC] hover:text-[#111111]"
            }`}
          >
            {f}
          </button>
        ))}
      </motion.div>

      {/* File grid */}
      <motion.div {...fadeUp(0.08)}>
        {loading ? (
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-xl bg-[#F0F0F0] aspect-[4/3] animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-sans text-[14px] text-[#AAAAAA]">
              {search ? `Brak plików pasujących do "${search}"` : "Brak plików w tej kategorii."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {filtered.map((file) => (
              <FileCard
                key={file.id}
                name={file.name}
                type={file.type}
                size={file.size}
                date={file.date}
                isNew={file.isNew}
                preview={file.preview}
                downloadUrl={file.downloadUrl}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Brand Assets */}
      <motion.div {...fadeUp(0.12)}>
        <div className="rounded-xl border border-[#EBEBEB] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#F5F5F5]">
            <h2 className="font-sans text-[13px] font-semibold text-[#111111]">Brand Assets</h2>
            <p className="font-sans text-[12px] text-[#AAAAAA] mt-0.5">
              Zasoby marki {projectName || "projektu"}
            </p>
          </div>
          <div className="grid grid-cols-3 divide-x divide-[#F5F5F5]">
            {brandAssets.map((asset) => {
              const Icon = asset.icon;
              return (
                <div key={asset.label} className="p-5 hover:bg-[#FAFAFA] transition-colors duration-150 cursor-pointer group">
                  <div className="w-9 h-9 rounded-lg bg-[#F5F5F5] border border-[#EBEBEB] flex items-center justify-center mb-3 group-hover:border-[#CCCCCC] transition-colors duration-150">
                    <Icon size={16} strokeWidth={1.75} color="#555555" />
                  </div>
                  <p className="font-sans text-[13px] font-medium text-[#111111]">{asset.label}</p>
                  <p className="font-sans text-[11px] text-[#AAAAAA] mt-0.5">{asset.sub}</p>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

    </div>
  );
}
