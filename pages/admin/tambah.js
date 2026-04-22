import TrainForm from "../../components/admin/TrainForm";
import AdminLayout from "../../components/admin/AdminLayout";
import { requireAdminPage } from "../../lib/page-auth";

export default function AdminTambahPage({ error }) {
  return (
    <AdminLayout
      title="Tambah Data Kereta"
      description="Tambahkan perjalanan baru dengan detail rute, jadwal, harga, status, dan media."
      activePage="kereta"
    >
      <TrainForm action="/api/trains" submitLabel="Simpan" cancelHref="/admin/kereta" error={error} />
    </AdminLayout>
  );
}

export async function getServerSideProps(context) {
  const redirect = requireAdminPage(context);
  if (redirect) {
    return redirect;
  }

  return {
    props: {
      error: context.query.error || "",
    },
  };
}
