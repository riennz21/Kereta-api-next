import TrainForm from "../../../components/admin/TrainForm";
import AdminLayout from "../../../components/admin/AdminLayout";
import { getTrainById } from "../../../lib/db";
import { requireAdminPage } from "../../../lib/page-auth";

export default function AdminEditPage({ train, error }) {
  return (
    <AdminLayout
      title="Edit Data Kereta"
      description="Perbarui detail perjalanan agar data publik, status operasional, dan informasi admin tetap akurat."
      activePage="kereta"
    >
      <TrainForm
        action={`/api/trains/${train.id}`}
        initialValues={train}
        submitLabel="Update"
        cancelHref="/admin/kereta"
        error={error}
      />
    </AdminLayout>
  );
}

export async function getServerSideProps(context) {
  const redirect = requireAdminPage(context);
  if (redirect) {
    return redirect;
  }

  const train = await getTrainById(Number(context.params.id));
  if (!train) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      train,
      error: context.query.error || "",
    },
  };
}
