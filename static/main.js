function aturHarga() {
    let kelas = document.getElementById("kelas").value;
    let harga = document.getElementById("harga");

    if (kelas === "Ekonomi") harga.value = 50000;
    else if (kelas === "Bisnis") harga.value = 100000;
    else if (kelas === "Eksekutif") harga.value = 150000;
    else harga.value = "";
}

function hapusData() {
    return confirm("Yakin hapus data kereta?");
}

function validasiForm() {
    const nama = document.getElementById("nama");
    const asal = document.getElementById("asal");
    const tujuan = document.getElementById("tujuan");
    const kelas = document.getElementById("kelas");
    const tanggal = document.getElementById("tanggal");
    const jam = document.getElementById("jam");

    if (!nama || !asal || !tujuan || !kelas || !tanggal || !jam) return true;

    if (
        nama.value.trim() === "" ||
        asal.value.trim() === "" ||
        tujuan.value.trim() === "" ||
        kelas.value.trim() === "" ||
        tanggal.value.trim() === "" ||
        jam.value.trim() === ""
    ) {
        alert("Data wajib diisi!");
        return false;
    }
    return true;
}
