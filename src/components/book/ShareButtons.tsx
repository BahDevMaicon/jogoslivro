import { useState } from "react";
import { Check, Facebook, Link2, MessageCircle, Twitter } from "lucide-react";

interface ShareButtonsProps {
  title: string;
  url: string;
}

/** Links de intenção de compartilhamento (sem API/OAuth) — o usuário sempre confirma o envio no site de destino. */
export function ShareButtons({ title, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  function openShare(shareUrl: string) {
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopyError(false);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyError(true);
    }
  }

  const iconButtonClass =
    "flex h-8 w-8 items-center justify-center rounded-full border border-parchment-700/40 text-parchment-300 transition hover:border-ember-400/60 hover:text-ember-400";

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          title="Compartilhar no WhatsApp"
          aria-label="Compartilhar no WhatsApp"
          className={iconButtonClass}
          onClick={() => openShare(`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`)}
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          title="Compartilhar no X"
          aria-label="Compartilhar no X"
          className={iconButtonClass}
          onClick={() =>
            openShare(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`)
          }
        >
          <Twitter className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          title="Compartilhar no Facebook"
          aria-label="Compartilhar no Facebook"
          className={iconButtonClass}
          onClick={() => openShare(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`)}
        >
          <Facebook className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          title="Copiar link"
          aria-label="Copiar link"
          className={iconButtonClass}
          onClick={handleCopyLink}
        >
          {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Link2 className="h-4 w-4" aria-hidden="true" />}
        </button>
      </div>
      {copyError && <span className="text-xs text-red-300">Não foi possível copiar o link.</span>}
    </div>
  );
}
