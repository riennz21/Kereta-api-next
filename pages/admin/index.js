import { redirectAdminHome } from "../../lib/page-auth";

export default function AdminLoginPage({ error, nextPath }) {
  return (
    <div className="login-shell">
      <div className="login-card">
        <section className="login-art">
          <div className="stack-md">
            <span className="page-kicker">Admin Access</span>
            <h2>Kelola seluruh operasional kereta dari satu dashboard.</h2>
            <p>Masuk untuk memperbarui data kereta, status perjalanan, jadwal, dan tampilan publik.</p>
          </div>

          <div className="login-bullets">
            <span>Kelola katalog kereta dan harga</span>
            <span>Perbarui jadwal serta status perjalanan</span>
            <span>Jaga tampilan publik tetap rapi dan sinkron</span>
          </div>
        </section>

        <section className="login-form-panel">
          <div className="stack-sm">
            <h1>Masuk ke Panel Admin</h1>
            <p>Gunakan password admin untuk mengakses pengelolaan data.</p>
          </div>

          {error ? <div className="alert alert-error">{error}</div> : null}

          <form action="/api/auth/login" method="post" className="stack-md">
            <div className="stack-sm">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" name="password" className="input-control" required />
            </div>
            <input type="hidden" name="next" value={nextPath} />
            <button type="submit" className="btn btn-primary">
              Masuk
            </button>
          </form>

          <p className="muted">
            Akses admin tetap berada di URL <code>/admin</code>.
          </p>
        </section>
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  const redirect = redirectAdminHome(context);
  if (redirect) {
    return redirect;
  }

  return {
    props: {
      error: context.query.error || "",
      nextPath: context.query.next || "/admin/dashboard",
    },
  };
}
