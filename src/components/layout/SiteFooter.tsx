export function SiteFooter() {
  return (
    <footer className="mt-16 flex items-center justify-center gap-2 border-t border-parchment-700/20 px-4 py-6 text-center">
      <a href="https://bahdev.com.br" target="_blank" rel="noopener noreferrer" className="shrink-0">
        <img
          src="/bahdev-logo.webp"
          alt="BahDev"
          className="h-6 w-6 rounded-md object-cover opacity-80 transition hover:opacity-100"
        />
      </a>
      <p className="font-serif text-xs text-parchment-400/60">
        Um projeto de final de semana da{" "}
        <a
          href="https://bahdev.com.br"
          target="_blank"
          rel="noopener noreferrer"
          className="text-parchment-300 hover:text-ember-400"
        >
          bahdev.com.br
        </a>
        .
      </p>
    </footer>
  );
}
