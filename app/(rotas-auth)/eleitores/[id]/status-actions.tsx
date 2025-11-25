"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function StatusActions({ id, initialStatus }: { id: string; initialStatus: string }) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState<"DEFERIDO" | "INDEFERIDO" | null>(null);

  async function atualizar(novo: "DEFERIDO" | "INDEFERIDO") {
    setLoading(novo);
    try {
      const resp = await fetch(`/api/votantes/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: novo }),
      });
      if (resp.status !== 200) {
        const erro = await resp.json().catch(() => ({ error: "Erro ao atualizar" }));
        toast.error(erro.error || "Erro ao atualizar status");
        return;
      }
      const data = await resp.json();
      setStatus(data.status);
      toast.success(novo === "DEFERIDO" ? "Cadastro deferido" : "Cadastro indeferido");
      startTransition(() => {
        router.refresh();
      });
    } catch (e) {
      toast.error("Falha de comunicação com o servidor");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-col md:flex-row gap-3 md:gap-4 md:justify-end">
      <Button
        variant="default"
        disabled={isPending || loading === "DEFERIDO"}
        onClick={() => atualizar("DEFERIDO")}
      >
        {loading === "DEFERIDO" ? "Deferindo..." : "Deferir cadastro"}
      </Button>
      <Button
        variant="destructive"
        disabled={isPending || loading === "INDEFERIDO"}
        onClick={() => atualizar("INDEFERIDO")}
      >
        {loading === "INDEFERIDO" ? "Indeferindo..." : "Indeferir cadastro"}
      </Button>
    </div>
  );
}