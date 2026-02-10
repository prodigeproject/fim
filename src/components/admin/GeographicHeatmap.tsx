import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

interface RegionData {
  province: string;
  count: number;
}

interface GeographicHeatmapProps {
  data: RegionData[];
  title?: string;
}

const ISLAND_GROUPS: Record<string, string[]> = {
  Sumatera: ["Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Kepulauan Riau", "Jambi", "Bengkulu", "Sumatera Selatan", "Bangka Belitung", "Lampung"],
  Jawa: ["DKI Jakarta", "Banten", "Jawa Barat", "Jawa Tengah", "DI Yogyakarta", "Jawa Timur"],
  Kalimantan: ["Kalimantan Barat", "Kalimantan Tengah", "Kalimantan Selatan", "Kalimantan Timur", "Kalimantan Utara"],
  Sulawesi: ["Sulawesi Utara", "Gorontalo", "Sulawesi Tengah", "Sulawesi Barat", "Sulawesi Selatan", "Sulawesi Tenggara"],
  "Bali & Nusa Tenggara": ["Bali", "Nusa Tenggara Barat", "Nusa Tenggara Timur"],
  "Maluku & Papua": ["Maluku", "Maluku Utara", "Papua", "Papua Barat", "Papua Selatan", "Papua Tengah", "Papua Pegunungan", "Papua Barat Daya"],
};

function getIntensityClass(count: number, max: number): string {
  if (count === 0) return "bg-muted";
  const ratio = count / max;
  if (ratio > 0.7) return "bg-primary text-primary-foreground";
  if (ratio > 0.4) return "bg-primary/70 text-primary-foreground";
  if (ratio > 0.2) return "bg-primary/40 text-foreground";
  return "bg-primary/20 text-foreground";
}

export function GeographicHeatmap({ data, title = "Peta Sebaran Pendaftar" }: GeographicHeatmapProps) {
  const { groupedData, maxCount, totalCount } = useMemo(() => {
    const dataMap = new Map(data.map((d) => [d.province, d.count]));
    const max = Math.max(...data.map((d) => d.count), 1);
    const total = data.reduce((sum, d) => sum + d.count, 0);

    const grouped = Object.entries(ISLAND_GROUPS).map(([island, provinces]) => ({
      island,
      provinces: provinces
        .map((p) => ({ province: p, count: dataMap.get(p) || 0 }))
        .sort((a, b) => b.count - a.count),
      total: provinces.reduce((sum, p) => sum + (dataMap.get(p) || 0), 0),
    }));

    return { groupedData: grouped.sort((a, b) => b.total - a.total), maxCount: max, totalCount: total };
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Total: {totalCount} pendaftar dari {data.filter((d) => d.count > 0).length} provinsi
        </p>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="flex items-center gap-4 mb-6 text-xs">
          <span className="text-muted-foreground">Rendah</span>
          <div className="flex gap-1">
            <div className="w-6 h-4 rounded bg-primary/20" />
            <div className="w-6 h-4 rounded bg-primary/40" />
            <div className="w-6 h-4 rounded bg-primary/70" />
            <div className="w-6 h-4 rounded bg-primary" />
          </div>
          <span className="text-muted-foreground">Tinggi</span>
        </div>

        <div className="space-y-6">
          {groupedData.map((group) => (
            <div key={group.island}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-foreground">{group.island}</h4>
                <span className="text-xs text-muted-foreground">{group.total} pendaftar</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {group.provinces.map((prov) => (
                  <div
                    key={prov.province}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${getIntensityClass(prov.count, maxCount)}`}
                    title={`${prov.province}: ${prov.count} pendaftar`}
                  >
                    {prov.province.replace("Kalimantan", "Kal.").replace("Sulawesi", "Sul.").replace("Sumatera", "Sum.").replace("Kepulauan", "Kep.").replace("Nusa Tenggara", "NTT/NTB")}
                    {prov.count > 0 && <span className="ml-1 opacity-75">({prov.count})</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
