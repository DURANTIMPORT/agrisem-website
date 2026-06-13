type BrandCardProps = {
  name: string;
  tagline: string;
  description: string;
  href: string;
  bg?: string;
};

export default function BrandCard({
  name,
  tagline,
  description,
  href,
  bg = "bg-zinc-50",
}: BrandCardProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative flex flex-col overflow-hidden rounded-3xl ${bg} p-8 transition-transform duration-500 hover:-translate-y-1 hover:shadow-xl`}
    >
      <span className="text-xs font-semibold uppercase tracking-widest text-gold">
        {tagline}
      </span>
      <h3 className="mt-3 text-3xl font-semibold text-navy-dark">{name}</h3>
      <p className="mt-3 text-sm text-zinc-600">{description}</p>
      <span className="mt-6 inline-flex items-center text-sm font-medium text-navy transition-colors group-hover:text-gold">
        Visiter le site
        <svg
          className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17 8l4 4m0 0l-4 4m4-4H3"
          />
        </svg>
      </span>
    </a>
  );
}
