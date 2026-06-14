import { Link } from "react-router-dom";
import { MapPin, Users, ArrowRight } from "lucide-react";
import { Badge } from "./ui";
import { StarMotif } from "./ornaments/Suzani";
import { formatPrice } from "../lib/utils";
import type { Hall } from "../types";

export function HallCard({ hall }: { hall: Hall }) {
  const cover = hall.images?.[0]?.url;

  return (
    <Link
      to={`/halls/${hall.id}`}
      className="group card animate-fade-up flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-cream-200">
        {cover ? (
          <img
            src={cover}
            alt={hall.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center text-cream-400">
            <StarMotif className="h-12 w-12" />
          </div>
        )}
        <div className="absolute left-3 top-3">
          <Badge tone="info" className="bg-cobalt-700/90 text-cream-50 backdrop-blur">
            <MapPin size={12} /> {hall.district}
          </Badge>
        </div>
        {hall.images?.length > 1 && (
          <span className="absolute bottom-3 right-3 rounded-full bg-cobalt-900/60 px-2 py-0.5 text-xs font-semibold text-cream-50 backdrop-blur">
            +{hall.images.length - 1} surat
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-lg font-bold text-cobalt-700 line-clamp-1">{hall.name}</h3>
        <p className="mt-0.5 line-clamp-1 text-sm text-ink-soft">{hall.address}</p>

        <div className="mt-3 flex items-center gap-3 text-sm text-ink-soft">
          <span className="inline-flex items-center gap-1">
            <Users size={15} className="text-terracotta-500" /> {hall.capacity} o'rin
          </span>
        </div>

        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            <p className="text-xs text-ink-soft">1 o'rindiq</p>
            <p className="font-display text-lg font-bold text-terracotta-600">{formatPrice(hall.pricePerSeat)}</p>
          </div>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-cream-200 text-cobalt-600 transition group-hover:bg-gold-400 group-hover:text-cobalt-800">
            <ArrowRight size={17} />
          </span>
        </div>
      </div>
    </Link>
  );
}
