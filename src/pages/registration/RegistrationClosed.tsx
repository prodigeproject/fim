import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import logoFim from "@/assets/logo-fim.png";
import { Calendar, Bell, ArrowLeft, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function RegistrationClosed() {
  // Fetch latest batch info
  const { data: batchInfo } = useQuery({
    queryKey: ["latest-batch-info"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("registration_settings")
        .select("*")
        .eq("is_active", true)
        .order("batch_number", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <>
      <SEO 
        title="Pendaftaran Belum Dibuka" 
        description="Pendaftaran Forum Indonesia Muda belum dibuka saat ini"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/">
              <img src={logoFim} alt="FIM Logo" className="h-16 mx-auto mb-4" />
            </Link>
            <h1 className="text-2xl font-bold text-foreground">
              Forum Indonesia Muda
            </h1>
          </div>

          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
              <CardTitle>Pendaftaran Belum Dibuka</CardTitle>
              <CardDescription>
                Saat ini pendaftaran untuk program pelatihan FIM belum dibuka.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {batchInfo && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-2">
                    {batchInfo.batch_name}
                  </h3>
                  {batchInfo.description && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {batchInfo.description}
                    </p>
                  )}
                  {batchInfo.registration_start_date && (
                    <p className="text-sm text-muted-foreground">
                      Pendaftaran akan dibuka pada:{" "}
                      <span className="font-medium text-foreground">
                        {new Date(batchInfo.registration_start_date).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </p>
                  )}
                </div>
              )}

              <div className="bg-primary/5 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Bell className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Dapatkan Notifikasi
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ikuti channel WA FIMers Update untuk mendapatkan info terbaru tentang pembukaan pendaftaran.
                    </p>
                    <a 
                      href="https://whatsapp.com/channel/0029VbAqbD78PgsCdYd6hK2T" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                    >
                      Ikuti Channel WA <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Link to="/program/pelatihan">
                  <Button variant="outline" className="w-full">
                    Pelajari Program Pelatihan
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="ghost" className="w-full">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Kembali ke Beranda
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
