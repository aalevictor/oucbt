import { Badge } from "@/components/ui/badge";
import Header from "./_components/header";

export default async function RotasLivres({children}:{children: React.ReactNode}) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-8">
        {children}
      </main>
    </div>
  );
}