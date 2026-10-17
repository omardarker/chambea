import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Esta página no existe</h1>
      <p className="mt-2 text-ink-3">Quizá el enlace cambió o la demo se reinició.</p>
      <div className="mt-6"><Button href="/">Ir al inicio</Button></div>
    </div>
  );
}
