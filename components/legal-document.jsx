import Link from "next/link";

function renderBody(item, key) {
  if (typeof item === "string") {
    return <span key={key}>{item}</span>;
  }
  return (
    <span key={key}>
      <strong>{item.b}</strong>
      {item.x}
    </span>
  );
}

function renderBlock(block, index) {
  switch (block.t) {
    case "h1":
      return (
        <h1 key={index} className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
          {block.x}
        </h1>
      );
    case "meta":
      return (
        <p key={index} className="text-sm font-semibold text-slate-500 mb-6">
          {block.x}
        </p>
      );
    case "h2":
      return (
        <h2 key={index} className="text-2xl font-bold text-slate-900 mt-10 mb-4">
          {block.x}
        </h2>
      );
    case "h3":
      return (
        <h3 key={index} className="text-xl font-semibold text-slate-900 mt-8 mb-3">
          {block.x}
        </h3>
      );
    case "h4":
      return (
        <h4 key={index} className="text-lg font-semibold text-slate-800 mt-6 mb-2">
          {block.x}
        </h4>
      );
    case "p":
      return (
        <p key={index} className="text-[15px] leading-7 text-slate-700 mb-4">
          {block.x}
        </p>
      );
    case "ul":
      return (
        <ul key={index} className="list-disc pl-5 space-y-2 mb-4 text-[15px] leading-7 text-slate-700">
          {block.items.map((item, i) => (
            <li key={i}>{renderBody(item, i)}</li>
          ))}
        </ul>
      );
    case "footer":
      return (
        <p key={index} className="text-sm text-slate-500 mt-10 mb-2">
          {block.x}
        </p>
      );
    default:
      return null;
  }
}

export function LegalDocument({ title, blocks }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-16">
        <Link
          href="/"
          className="inline-flex text-sm font-medium text-violet-700 hover:text-violet-900 mb-8"
        >
          ← Back to BirdEarner
        </Link>
        <article>
          {title ? (
            <h1 className="sr-only">{title}</h1>
          ) : null}
          {blocks.map((block, index) => renderBlock(block, index))}
        </article>
      </div>
    </div>
  );
}
