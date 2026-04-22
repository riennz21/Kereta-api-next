import Link from "next/link";

export default function Pagination({ page, totalPages, buildHref }) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="pagination">
      {page > 1 ? (
        <Link className="page-link arrow" href={buildHref(page - 1)}>
          Sebelumnya
        </Link>
      ) : null}

      {Array.from({ length: totalPages }, (_, index) => index + 1).map((item) => (
        <Link key={item} className={`page-link ${item === page ? "active" : ""}`} href={buildHref(item)}>
          {item}
        </Link>
      ))}

      {page < totalPages ? (
        <Link className="page-link arrow" href={buildHref(page + 1)}>
          Berikutnya
        </Link>
      ) : null}
    </div>
  );
}
