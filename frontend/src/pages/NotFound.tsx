import { Link } from "react-router-dom";
import { Button } from "../components/ui";
import { SuzaniRosette } from "../components/ornaments/Suzani";

export default function NotFound() {
  return (
    <div className="suzani-bg grid min-h-screen place-items-center p-6 text-center">
      <div className="flex flex-col items-center">
        <SuzaniRosette className="h-24 w-24 text-gold-400" />
        <h1 className="mt-6 font-display text-6xl font-bold text-cobalt-700">404</h1>
        <p className="mt-2 text-ink-soft">Kechirasiz, bunday sahifa topilmadi.</p>
        <Link to="/" className="mt-6">
          <Button size="lg">Bosh sahifaga qaytish</Button>
        </Link>
      </div>
    </div>
  );
}
