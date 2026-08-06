import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const SLIDES = [
  {
    src: "/banner-monte-aventura.png",
    alt: "Monte sua própria aventura! Crie histórias épicas com nossa engine de livros interativos — personalize desafios, personagens, escolhas e finais.",
  },
  {
    src: "/banner-aventura-comeca.png",
    alt: "Sua aventura começa aqui! Livro-jogo interativo onde cada decisão molda sua história e cada dado pode mudar tudo.",
  },
];

const INTERVAL_MS = 5000;

export function HeroBannerCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-parchment-800/30 shadow-parchment">
      <div className="relative aspect-[1717/916] w-full">
        <AnimatePresence mode="wait">
          <motion.img
            key={SLIDES[index].src}
            src={SLIDES[index].src}
            alt={SLIDES[index].alt}
            className="absolute inset-0 h-full w-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        </AnimatePresence>
      </div>
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            aria-label={`Ir para o slide ${i + 1}`}
            className={`h-2 w-2 rounded-full transition ${i === index ? "bg-ember-400" : "bg-parchment-100/40"}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}
