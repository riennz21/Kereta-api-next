import PublicLayout from "../components/public/PublicLayout";
import SubNav from "../components/jadwal-status/SubNav";
import StatusPanel from "../components/jadwal-status/StatusPanel";
import SearchPanel from "../components/jadwal-status/SearchPanel";

export default function JadwalStatusPage() {
  return (
    <PublicLayout title="Jadwal & Status">
      <div className="max-w-[1200px] mx-auto">
        {/* Sub Navigation */}
        <SubNav />

        {/* Split Screen Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel: Status & Live Tracking - 5 columns */}
          <div className="lg:col-span-5">
            <StatusPanel />
          </div>

          {/* Right Panel: Pencarian & Jadwal - 7 columns */}
          <div className="lg:col-span-7">
            <SearchPanel />
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
