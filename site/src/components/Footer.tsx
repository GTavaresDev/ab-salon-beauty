import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-blush-200 bg-white py-8">
      <div
        className="section-shell flex flex-col items-start justify-between gap-4 text-sm text-blush-700 sm:flex-row sm:items-center"
        data-reveal="up"
      >
        <p>AB Sobrancelhas. Beleza e bem-estar em cada detalhe.</p>
        <div className="flex items-center gap-5">
          <Link
            href="https://www.instagram.com/amandaborges.beauty"
            target="_blank"
            rel="noreferrer"
            className="transition-colors duration-300 hover:text-blush-900"
          >
            Instagram
          </Link>
          <Link href="#hero" className="transition-colors duration-300 hover:text-blush-900">
            Voltar ao topo
          </Link>
        </div>
      </div>
    </footer>
  );
}
