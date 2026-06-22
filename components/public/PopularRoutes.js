import { ArrowRight } from "lucide-react";
import { useBooking } from "../../lib/booking-context";

const POPULAR_ROUTES = [
  { asal: "Surabaya", tujuan: "Malang", label: "Surabaya → Malang" },
  { asal: "Surabaya", tujuan: "Banyuwangi", label: "Surabaya → Banyuwangi" },
  { asal: "Malang", tujuan: "Surabaya", label: "Malang → Surabaya" },
  { asal: "Banyuwangi", tujuan: "Jember", label: "Banyuwangi → Jember" },
  { asal: "Jember", tujuan: "Surabaya", label: "Jember → Surabaya" },
  { asal: "Bandung", tujuan: "Jakarta", label: "Bandung → Jakarta" },
];

export default function PopularRoutes() {
  const { updateField } = useBooking();

  return (
    <div className="popular-routes">
      <span className="popular-routes-label">Rute Populer</span>
      <div className="popular-routes-grid">
        {POPULAR_ROUTES.map((route) => (
          <button
            key={route.label}
            type="button"
            className="route-chip"
            onClick={() => {
              updateField("asal", route.asal);
              updateField("tujuan", route.tujuan);
              document.getElementById("booking-card")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <ArrowRight size={14} />
            {route.label}
          </button>
        ))}
      </div>
    </div>
  );
}
