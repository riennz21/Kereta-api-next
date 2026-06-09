import Link from "next/link";

const tabs = [
  { href: "/", label: "BERANDA" },
  { href: "/jadwal-status", label: "JADWAL & STATUS", active: true },
  { href: "/status", label: "STATUS" },
];

export default function SubNav() {
  return (
    <div className="flex justify-center mb-8">
      <div className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur-md border border-[rgba(15,39,67,0.06)] rounded-[999px] p-1.5 shadow-[0_8px_16px_rgba(15,39,67,0.06)]">
        {tabs.map((tab) =>
          tab.active ? (
            <span
              key={tab.href}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-[999px] bg-navy text-white text-sm font-bold tracking-wide cursor-default"
            >
              {tab.label}
            </span>
          ) : (
            <Link
              key={tab.href}
              href={tab.href}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-[999px] text-[#475467] hover:bg-navy hover:text-white text-sm font-bold tracking-wide transition-all duration-200"
            >
              {tab.label}
            </Link>
          )
        )}
      </div>
    </div>
  );
}
