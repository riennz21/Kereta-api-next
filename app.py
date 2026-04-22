import os
import sqlite3
import uuid
from math import ceil
from functools import wraps

from flask import Flask, abort, redirect, render_template, request, session, url_for
from flask import send_from_directory
from werkzeug.utils import secure_filename

app = Flask(__name__)

PROJECT_ROOT = os.path.abspath(os.path.dirname(__file__))
DB_PATH = os.path.join(PROJECT_ROOT, "kereta.db")
UPLOAD_FOLDER = os.path.join(PROJECT_ROOT, "uploads", "kereta")
ALLOWED_IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".gif", ".webp"}
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "admin123")

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.secret_key = os.environ.get("SECRET_KEY", "dev-secret-key")

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    db = get_db()
    db.execute("""
        CREATE TABLE IF NOT EXISTS kereta (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nama TEXT NOT NULL,
            asal TEXT,
            tujuan TEXT,
            kelas TEXT,
            harga INTEGER,
            tanggal TEXT,
            jam TEXT,
            status TEXT,
            deskripsi TEXT,
            gambar TEXT
        )
    """)
    db.commit()
    db.close()


def normalize_status(value: str) -> str:
    raw = (value or "").strip().lower()
    compact = raw.replace(" ", "").replace("-", "")
    if compact == "ontime":
        return "on-time"
    if compact == "delay":
        return "delay"
    if compact in {"dibatalkan", "batal", "cancelled", "canceled"}:
        return "dibatalkan"
    return "unknown"


def canonical_status(value: str) -> str:
    key = normalize_status(value)
    if key == "on-time":
        return "On Time"
    if key == "delay":
        return "Delay"
    if key == "dibatalkan":
        return "Dibatalkan"
    return (value or "").strip()


def parse_int(value, default: int = 0) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def allowed_image_filename(filename: str) -> bool:
    _, ext = os.path.splitext(filename or "")
    return ext.lower() in ALLOWED_IMAGE_EXTENSIONS


def save_upload(file_storage) -> str | None:
    if not file_storage:
        return None
    filename = secure_filename(file_storage.filename or "")
    if not filename:
        return None
    if not allowed_image_filename(filename):
        return None

    _, ext = os.path.splitext(filename)
    stored = f"{uuid.uuid4().hex}{ext.lower()}"
    file_storage.save(os.path.join(app.config["UPLOAD_FOLDER"], stored))
    return stored


def delete_upload(stored_filename: str | None) -> None:
    if not stored_filename:
        return
    path = os.path.join(app.config["UPLOAD_FOLDER"], stored_filename)
    try:
        if os.path.isfile(path):
            os.remove(path)
    except OSError:
        pass


def compute_stats(rows) -> dict:
    counts = {"total": 0, "on_time": 0, "delay": 0, "dibatalkan": 0}
    counts["total"] = len(rows)
    for row in rows:
        key = normalize_status(row["status"])
        if key == "on-time":
            counts["on_time"] += 1
        elif key == "delay":
            counts["delay"] += 1
        elif key == "dibatalkan":
            counts["dibatalkan"] += 1
    return counts


def admin_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if not session.get("is_admin"):
            return redirect(url_for("admin_login", next=request.path))
        return view(*args, **kwargs)

    return wrapped


init_db()


@app.route("/uploads/kereta/<path:filename>")
def train_image(filename: str):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)


@app.route("/")
def dashboard():
    search_query = request.args.get('search', '').strip()
    kelas_filter = request.args.get('kelas', '').strip()
    status_filter = request.args.get('status', '').strip()
    min_price = request.args.get('min_price', '').strip()
    max_price = request.args.get('max_price', '').strip()
    page = parse_int(request.args.get("page"), 1)
    per_page = parse_int(request.args.get("per_page"), 6)
    if per_page <= 0 or per_page > 24:
        per_page = 6
    if page < 1:
        page = 1

    db = get_db()

    # Build query based on search and filters
    query_conditions = []
    query_params = []

    if search_query:
        query_conditions.append("(nama LIKE ? OR asal LIKE ? OR tujuan LIKE ?)")
        query_params.extend([f'%{search_query}%', f'%{search_query}%', f'%{search_query}%'])

    if kelas_filter:
        query_conditions.append("kelas = ?")
        query_params.append(kelas_filter)

    if status_filter:
        query_conditions.append("status = ?")
        query_params.append(status_filter)

    if min_price and min_price.isdigit():
        query_conditions.append("harga >= ?")
        query_params.append(int(min_price))

    if max_price and max_price.isdigit():
        query_conditions.append("harga <= ?")
        query_params.append(int(max_price))

    # Build count query
    count_query = "SELECT COUNT(*) FROM kereta"
    if query_conditions:
        count_query += " WHERE " + " AND ".join(query_conditions)

    # Build data query
    data_query = "SELECT * FROM kereta"
    if query_conditions:
        data_query += " WHERE " + " AND ".join(query_conditions)
    data_query += " ORDER BY id DESC LIMIT ? OFFSET ?"

    total_count = db.execute(count_query, query_params).fetchone()[0]
    data = db.execute(data_query, query_params + [per_page, (page - 1) * per_page]).fetchall()

    total_pages = max(1, ceil(total_count / per_page)) if total_count else 1
    if page > total_pages:
        page = total_pages
    offset = (page - 1) * per_page

    # Get statistics for all trains (not filtered)
    all_rows = db.execute("SELECT * FROM kereta").fetchall()
    stats = compute_stats(all_rows)

    ontime = db.execute("SELECT COUNT(*) FROM kereta WHERE status='On Time'").fetchone()[0]
    delay = db.execute("SELECT COUNT(*) FROM kereta WHERE status='Delay'").fetchone()[0]
    dibatalkan = db.execute("SELECT COUNT(*) FROM kereta WHERE status='Dibatalkan'").fetchone()[0]

    db.close()
    start_index = offset + 1 if total_count else 0
    end_index = offset + len(data)
    return render_template(
        "public/dashboard.html",
        trains=data,
        total=total_count,
        ontime=ontime,
        delay=delay,
        stats=stats,
        page=page,
        total_pages=total_pages,
        start_index=start_index,
        end_index=end_index,
        search_query=search_query,
        kelas_filter=kelas_filter,
        status_filter=status_filter,
        min_price=min_price,
        max_price=max_price,
    )


@app.route("/kereta")
def data_kereta():
    search_query = request.args.get('search', '').strip()
    kelas_filter = request.args.get('kelas', '').strip()
    status_filter = request.args.get('status', '').strip()
    min_price = request.args.get('min_price', '').strip()
    max_price = request.args.get('max_price', '').strip()
    db = get_db()

    # Build query based on search and filters
    query_conditions = []
    query_params = []

    if search_query:
        query_conditions.append("(nama LIKE ? OR asal LIKE ? OR tujuan LIKE ?)")
        query_params.extend([f'%{search_query}%', f'%{search_query}%', f'%{search_query}%'])

    if kelas_filter:
        query_conditions.append("kelas = ?")
        query_params.append(kelas_filter)

    if status_filter:
        query_conditions.append("status = ?")
        query_params.append(status_filter)

    if min_price and min_price.isdigit():
        query_conditions.append("harga >= ?")
        query_params.append(int(min_price))

    if max_price and max_price.isdigit():
        query_conditions.append("harga <= ?")
        query_params.append(int(max_price))

    # Build data query
    query = "SELECT * FROM kereta"
    if query_conditions:
        query += " WHERE " + " AND ".join(query_conditions)
    query += " ORDER BY id DESC"

    data = db.execute(query, query_params).fetchall()
    db.close()
    return render_template("public/data_kereta.html", data=data, search_query=search_query,
                          kelas_filter=kelas_filter, status_filter=status_filter,
                          min_price=min_price, max_price=max_price)


@app.route("/jadwal")
def jadwal():
    db = get_db()
    data = db.execute("SELECT nama, tanggal, jam FROM kereta").fetchall()
    db.close()
    return render_template("public/jadwal.html", data=data)


@app.route("/status")
def status():
    db = get_db()
    data = db.execute("SELECT nama, status FROM kereta").fetchall()
    db.close()
    return render_template("public/status.html", data=data)


@app.route("/checkout/<int:id>")
def checkout(id):
    db = get_db()
    row = db.execute("SELECT * FROM kereta WHERE id=?", (id,)).fetchone()
    db.close()
    if not row:
        abort(404)
    return render_template("public/checkout.html", train=row)


@app.route("/admin", methods=["GET", "POST"])
def admin_login():
    if session.get("is_admin"):
        return redirect(url_for("admin_dashboard"))

    error = None
    if request.method == "POST":
        password = request.form.get("password", "")
        if password == ADMIN_PASSWORD:
            session["is_admin"] = True
            next_url = request.args.get("next") or request.form.get("next")
            if next_url and next_url.startswith("/admin"):
                return redirect(next_url)
            return redirect(url_for("admin_dashboard"))
        error = "Password salah. Coba lagi."

    return render_template("admin/login.html", error=error, next_url=request.args.get("next", ""))


@app.route("/admin/logout")
def admin_logout():
    session.pop("is_admin", None)
    return redirect(url_for("admin_login"))


@app.route("/admin/dashboard")
@admin_required
def admin_dashboard():
    search_query = request.args.get('search', '').strip()
    kelas_filter = request.args.get('kelas', '').strip()
    status_filter = request.args.get('status', '').strip()
    min_price = request.args.get('min_price', '').strip()
    max_price = request.args.get('max_price', '').strip()
    db = get_db()

    # Build query based on search and filters
    query_conditions = []
    query_params = []

    if search_query:
        query_conditions.append("(nama LIKE ? OR asal LIKE ? OR tujuan LIKE ?)")
        query_params.extend([f'%{search_query}%', f'%{search_query}%', f'%{search_query}%'])

    if kelas_filter:
        query_conditions.append("kelas = ?")
        query_params.append(kelas_filter)

    if status_filter:
        query_conditions.append("status = ?")
        query_params.append(status_filter)

    if min_price and min_price.isdigit():
        query_conditions.append("harga >= ?")
        query_params.append(int(min_price))

    if max_price and max_price.isdigit():
        query_conditions.append("harga <= ?")
        query_params.append(int(max_price))

    # Build data query
    query = "SELECT * FROM kereta"
    if query_conditions:
        query += " WHERE " + " AND ".join(query_conditions)
    query += " ORDER BY id DESC"

    data = db.execute(query, query_params).fetchall()
    db.close()
    stats = compute_stats(data)
    return render_template("admin/index.html", data=data, stats=stats, active_page="dashboard",
                          search_query=search_query, kelas_filter=kelas_filter, status_filter=status_filter,
                          min_price=min_price, max_price=max_price)


@app.route("/admin/tambah", methods=["GET", "POST"])
@admin_required
def admin_tambah():
    if request.method == "POST":
        uploaded = save_upload(request.files.get("gambar"))
        nama = request.form.get("nama", "").strip()
        if not nama:
            abort(400)

        db = get_db()
        db.execute("""
            INSERT INTO kereta
            (nama, asal, tujuan, kelas, harga, tanggal, jam, status, deskripsi, gambar)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            nama,
            request.form.get("asal", "").strip(),
            request.form.get("tujuan", "").strip(),
            request.form.get("kelas", "").strip(),
            parse_int(request.form.get("harga"), 0),
            request.form.get("tanggal", "").strip(),
            request.form.get("jam", "").strip(),
            canonical_status(request.form.get("status", "")),
            request.form.get("deskripsi", "").strip(),
            uploaded,
        ))
        db.commit()
        db.close()
        return redirect(url_for("admin_data_kereta"))

    return render_template("admin/tambah.html", active_page="tambah")


@app.route("/admin/kereta")
@admin_required
def admin_data_kereta():
    search_query = request.args.get('search', '').strip()
    kelas_filter = request.args.get('kelas', '').strip()
    status_filter = request.args.get('status', '').strip()
    min_price = request.args.get('min_price', '').strip()
    max_price = request.args.get('max_price', '').strip()
    page = parse_int(request.args.get("page"), 1)
    per_page = parse_int(request.args.get("per_page"), 5)
    if per_page <= 0 or per_page > 24:
        per_page = 5
    if page < 1:
        page = 1

    db = get_db()

    # Build query based on search and filters
    query_conditions = []
    query_params = []

    if search_query:
        query_conditions.append("(nama LIKE ? OR asal LIKE ? OR tujuan LIKE ?)")
        query_params.extend([f'%{search_query}%', f'%{search_query}%', f'%{search_query}%'])

    if kelas_filter:
        query_conditions.append("kelas = ?")
        query_params.append(kelas_filter)

    if status_filter:
        query_conditions.append("status = ?")
        query_params.append(status_filter)

    if min_price and min_price.isdigit():
        query_conditions.append("harga >= ?")
        query_params.append(int(min_price))

    if max_price and max_price.isdigit():
        query_conditions.append("harga <= ?")
        query_params.append(int(max_price))

    # Build count query
    count_query = "SELECT COUNT(*) FROM kereta"
    if query_conditions:
        count_query += " WHERE " + " AND ".join(query_conditions)

    # Build data query
    data_query = "SELECT * FROM kereta"
    if query_conditions:
        data_query += " WHERE " + " AND ".join(query_conditions)
    data_query += " ORDER BY id DESC LIMIT ? OFFSET ?"

    total_count = db.execute(count_query, query_params).fetchone()[0]
    data = db.execute(data_query, query_params + [per_page, (page - 1) * per_page]).fetchall()

    total_pages = max(1, ceil(total_count / per_page)) if total_count else 1
    if page > total_pages:
        page = total_pages
    offset = (page - 1) * per_page

    db.close()
    stats = compute_stats(data)
    start_index = offset + 1 if total_count else 0
    end_index = offset + len(data)
    return render_template("admin/kereta.html", data=data, stats=stats, active_page="kereta",
                          search_query=search_query, kelas_filter=kelas_filter, status_filter=status_filter,
                          min_price=min_price, max_price=max_price, page=page, total_pages=total_pages,
                          total=total_count, start_index=start_index, end_index=end_index)


@app.route("/admin/jadwal")
@admin_required
def admin_jadwal():
    db = get_db()
    data = db.execute("SELECT nama, tanggal, jam FROM kereta ORDER BY tanggal, jam").fetchall()
    db.close()
    return render_template("admin/jadwal.html", data=data, active_page="jadwal")


@app.route("/admin/status")
@admin_required
def admin_status():
    db = get_db()
    data = db.execute("SELECT nama, status FROM kereta ORDER BY nama").fetchall()
    db.close()
    return render_template("admin/status.html", data=data, active_page="status")


@app.route("/admin/laporan")
@admin_required
def admin_laporan():
    db = get_db()
    rows = db.execute("SELECT status FROM kereta").fetchall()
    db.close()
    stats = compute_stats(rows)
    return render_template(
        "admin/laporan.html",
        total=stats["total"],
        ontime=stats["on_time"],
        delay=stats["delay"],
        dibatalkan=stats["dibatalkan"],
        active_page="laporan",
    )


@app.route("/admin/edit/<int:id>", methods=["GET", "POST"])
@admin_required
def admin_edit(id):
    db = get_db()
    row = db.execute("SELECT * FROM kereta WHERE id=?", (id,)).fetchone()
    if not row:
        db.close()
        abort(404)

    if request.method == "POST":
        uploaded = save_upload(request.files.get("gambar"))
        nama = request.form.get("nama", "").strip()
        if not nama:
            db.close()
            abort(400)
        if uploaded:
            db.execute("""
                UPDATE kereta SET
                nama=?, asal=?, tujuan=?, kelas=?, harga=?,
                tanggal=?, jam=?, status=?, deskripsi=?, gambar=?
                WHERE id=?
            """, (
                nama,
                request.form.get("asal", "").strip(),
                request.form.get("tujuan", "").strip(),
                request.form.get("kelas", "").strip(),
                parse_int(request.form.get("harga"), 0),
                request.form.get("tanggal", "").strip(),
                request.form.get("jam", "").strip(),
                canonical_status(request.form.get("status", "")),
                request.form.get("deskripsi", "").strip(),
                uploaded,
                id,
            ))
            delete_upload(row["gambar"])
        else:
            db.execute("""
                UPDATE kereta SET
                nama=?, asal=?, tujuan=?, kelas=?, harga=?,
                tanggal=?, jam=?, status=?, deskripsi=?
                WHERE id=?
            """, (
                nama,
                request.form.get("asal", "").strip(),
                request.form.get("tujuan", "").strip(),
                request.form.get("kelas", "").strip(),
                parse_int(request.form.get("harga"), 0),
                request.form.get("tanggal", "").strip(),
                request.form.get("jam", "").strip(),
                canonical_status(request.form.get("status", "")),
                request.form.get("deskripsi", "").strip(),
                id,
            ))

        db.commit()
        db.close()
        return redirect(url_for("admin_data_kereta"))

    db.close()
    return render_template("admin/edit.html", data=row, active_page="kereta")


@app.route("/admin/hapus/<int:id>")
@admin_required
def admin_hapus(id):
    db = get_db()
    row = db.execute("SELECT gambar FROM kereta WHERE id=?", (id,)).fetchone()
    db.execute("DELETE FROM kereta WHERE id=?", (id,))
    db.commit()
    db.close()
    if row:
        delete_upload(row["gambar"])
    return redirect(url_for("admin_data_kereta"))


if __name__ == "__main__":
    debug = os.environ.get("FLASK_DEBUG") == "1"
    app.run(debug=debug)
