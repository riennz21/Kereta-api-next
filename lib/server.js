import express from "express";
import multer from "multer";
import {
  createTrain,
  createPurchase,
  deleteTrain,
  getAllPurchases,
  getPaginatedPurchases,
  getPaginatedTrains,
  getPurchaseByBookingCode,
  getPurchaseById,
  getPurchaseRevenueByStatus,
  getPurchaseStatusCounts,
  getPurchaseSummary,
  getPurchaseSummaryByDate,
  getReportSummary,
  getScheduleRows,
  getStatusRows,
  getTrainById,
  searchPurchases,
  updateTrain,
} from "./db";
import {
  clearAdminCookie,
  createAdminCookie,
  getSafeAdminPath,
  isAdminRequest,
  verifyAdminPassword,
} from "./auth";
import {
  getFiltersFromQuery,
  getImageUrl,
  getPublicPagination,
  validateTrainPayload,
} from "./train-utils";
import { persistUploadedFile, removeStoredImage } from "./storage";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 },
});

function buildRedirectUrl(basePath, params = {}) {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (!value) continue;
    searchParams.set(key, value);
  }

  const query = searchParams.toString();
  return query ? `${basePath}?${query}` : basePath;
}

function requireAdminApi(req, res, next) {
  if (!isAdminRequest(req)) {
    return res.redirect(302, `/admin?next=${encodeURIComponent("/admin/dashboard")}`);
  }

  return next();
}

function normalizeTrainForJson(train) {
  return train
    ? {
        ...train,
        imageUrl: getImageUrl(train.gambar),
      }
    : null;
}

function createExpressApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.get("/health", (req, res) => {
    res.json({ ok: true });
  });

  app.get("/trains", async (req, res, next) => {
    try {
      const filters = getFiltersFromQuery(req.query);
      const pagination = getPublicPagination(req.query);
      const result = await getPaginatedTrains(filters, pagination);
      res.json({
        ...result,
        rows: result.rows.map(normalizeTrainForJson),
      });
    } catch (error) {
      next(error);
    }
  });

  app.get("/trains/:id", async (req, res, next) => {
    try {
      const train = await getTrainById(Number(req.params.id));
      if (!train) {
        return res.status(404).json({ error: "Data kereta tidak ditemukan." });
      }

      return res.json(normalizeTrainForJson(train));
    } catch (error) {
      return next(error);
    }
  });

  app.get("/schedule", async (req, res, next) => {
    try {
      return res.json(await getScheduleRows());
    } catch (error) {
      return next(error);
    }
  });

  app.get("/statuses", async (req, res, next) => {
    try {
      return res.json(await getStatusRows());
    } catch (error) {
      return next(error);
    }
  });

  app.get("/report", async (req, res, next) => {
    try {
      return res.json(await getReportSummary());
    } catch (error) {
      return next(error);
    }
  });

  // ── Purchase / Checkout ──────────────────────────────────────────────

  app.post("/checkout", async (req, res, next) => {
    try {
      const {
        kereta_id,
        nama_kereta,
        asal,
        tujuan,
        kelas,
        harga_satuan,
        jumlah_tiket,
        nama_pembeli,
        email_pembeli,
        no_telepon,
        metode_pembayaran,
        tanggal_keberangkatan,
      } = req.body;

      if (!kereta_id || !nama_kereta || !nama_pembeli || !harga_satuan) {
        return res.status(400).json({ error: "Data tidak lengkap. Harap isi semua field yang wajib." });
      }

      const qty = Math.max(1, Number(jumlah_tiket) || 1);
      const price = Number(harga_satuan) || 0;
      const total = qty * price;

      const purchase = await createPurchase({
        kereta_id: Number(kereta_id),
        nama_kereta,
        asal: asal || "",
        tujuan: tujuan || "",
        kelas: kelas || "",
        harga_satuan: price,
        jumlah_tiket: qty,
        total_harga: total,
        nama_pembeli,
        email_pembeli: email_pembeli || "",
        no_telepon: no_telepon || "",
        metode_pembayaran: metode_pembayaran || "transfer",
        tanggal_keberangkatan: tanggal_keberangkatan || "",
      });

      return res.status(201).json({
        success: true,
        message: "Pembayaran berhasil diproses. Tiket telah dipesan.",
        data: purchase,
      });
    } catch (error) {
      return next(error);
    }
  });

  app.get("/purchases", async (req, res, next) => {
    try {
      const period = req.query.period || "";
      const startDate = req.query.start_date || "";
      const endDate = req.query.end_date || "";
      const search = req.query.search || "";
      const status = req.query.status || "";

      // Paginated mode (when page is provided)
      if (req.query.page) {
        const page = Math.max(1, Number(req.query.page) || 1);
        const perPage = Math.max(1, Math.min(Number(req.query.perPage) || 10, 50));
        const result = await getPaginatedPurchases(
          { period, startDate, endDate, search, status },
          { page, perPage },
        );
        const summary = await getPurchaseSummary(period, startDate, endDate);
        return res.json({
          purchases: result.rows,
          total: result.total,
          page: result.page,
          perPage: result.perPage,
          totalPages: result.totalPages,
          summary,
        });
      }

      // Flat mode (backward compatible)
      const limit = Number(req.query.limit) || 50;
      const offset = Number(req.query.offset) || 0;

      const purchases = await getAllPurchases({ period, startDate, endDate, limit, offset, search, status });
      const summary = await getPurchaseSummary(period, startDate, endDate);

      return res.json({ purchases, summary });
    } catch (error) {
      return next(error);
    }
  });

  app.get("/purchases/revenue-by-status", async (req, res, next) => {
    try {
      const period = req.query.period || "all";
      const startDate = req.query.start_date || "";
      const endDate = req.query.end_date || "";
      const data = await getPurchaseRevenueByStatus(period, startDate, endDate);
      return res.json(data);
    } catch (error) {
      return next(error);
    }
  });

  app.get("/purchases/status-counts", async (req, res, next) => {
    try {
      const period = req.query.period || "all";
      const startDate = req.query.start_date || "";
      const endDate = req.query.end_date || "";
      const counts = await getPurchaseStatusCounts(period, startDate, endDate);
      return res.json(counts);
    } catch (error) {
      return next(error);
    }
  });

  app.get("/purchases/summary", async (req, res, next) => {
    try {
      const period = req.query.period || "all";
      const startDate = req.query.start_date || "";
      const endDate = req.query.end_date || "";

      const isCustomRange = !["today", "week", "month", "all"].includes(period) && startDate && endDate;
      const actualPeriod = isCustomRange ? "custom" : period;

      const summary = await getPurchaseSummary(actualPeriod, startDate, endDate);
      const shouldShowBreakdown = actualPeriod !== "all" && actualPeriod !== "custom"
        ? true
        : isCustomRange;
      const dailyBreakdown = shouldShowBreakdown
        ? await getPurchaseSummaryByDate(actualPeriod, startDate, endDate)
        : [];

      return res.json({ ...summary, dailyBreakdown, period: actualPeriod });
    } catch (error) {
      return next(error);
    }
  });

  app.get("/purchases/search", async (req, res, next) => {
    try {
      const q = req.query.q || "";
      if (!q.trim()) {
        return res.status(400).json({ error: "Parameter 'q' (query) wajib diisi." });
      }

      const page = Math.max(1, Number(req.query.page) || 1);
      const perPage = Math.max(1, Math.min(Number(req.query.perPage) || 20, 100));

      const result = await searchPurchases(q, { page, perPage });

      return res.json({
        purchases: result.rows,
        total: result.total,
        page: result.page,
        perPage: result.perPage,
        totalPages: result.totalPages,
        query: q,
      });
    } catch (error) {
      return next(error);
    }
  });

  app.get("/purchases/code/:bookingCode", async (req, res, next) => {
    try {
      const code = (req.params.bookingCode || "").trim();
      if (!code || !/^KAI-/i.test(code)) {
        return res.status(400).json({ error: "Format kode booking tidak valid." });
      }
      const purchase = await getPurchaseByBookingCode(code);
      if (!purchase) {
        return res.status(404).json({ error: "Pemesanan tidak ditemukan." });
      }
      return res.json(purchase);
    } catch (error) {
      return next(error);
    }
  });

  app.get("/purchases/:id", async (req, res, next) => {
    try {
      const purchaseId = Number(req.params.id);
      if (!Number.isInteger(purchaseId) || purchaseId < 1) {
        return res.status(400).json({ error: "ID pemesanan tidak valid." });
      }
      const purchase = await getPurchaseById(purchaseId);
      if (!purchase) {
        return res.status(404).json({ error: "Pemesanan tidak ditemukan." });
      }
      return res.json(purchase);
    } catch (error) {
      return next(error);
    }
  });

  app.post("/auth/login", async (req, res) => {
    const nextPath = getSafeAdminPath(req.body.next, "/admin/dashboard");

    if (!verifyAdminPassword(req.body.password || "")) {
      return res.redirect(
        302,
        buildRedirectUrl("/admin", {
          error: "Password salah. Coba lagi.",
          next: nextPath,
        }),
      );
    }

    res.setHeader("Set-Cookie", createAdminCookie());
    return res.redirect(302, nextPath);
  });

  app.post("/auth/logout", async (req, res) => {
    res.setHeader("Set-Cookie", clearAdminCookie());
    return res.redirect(302, "/admin");
  });

  app.post("/trains", requireAdminApi, upload.single("gambar"), async (req, res) => {
    try {
      const validationError = validateTrainPayload(req.body);
      if (validationError) {
        return res.redirect(302, buildRedirectUrl("/admin/tambah", { error: validationError }));
      }

      const storedImage = await persistUploadedFile(req.file);
      await createTrain({
        ...req.body,
        gambar: storedImage,
      });

      return res.redirect(302, "/admin/kereta");
    } catch (error) {
      return res.redirect(302, buildRedirectUrl("/admin/tambah", { error: error.message }));
    }
  });

  app.post("/trains/:id", requireAdminApi, upload.single("gambar"), async (req, res) => {
    const trainId = Number(req.params.id);

    try {
      const existing = await getTrainById(trainId);
      if (!existing) {
        return res.redirect(302, buildRedirectUrl("/admin/kereta", { error: "Data kereta tidak ditemukan." }));
      }

      const validationError = validateTrainPayload(req.body);
      if (validationError) {
        return res.redirect(302, buildRedirectUrl(`/admin/edit/${trainId}`, { error: validationError }));
      }

      const storedImage = await persistUploadedFile(req.file);
      const updated = await updateTrain(trainId, {
        ...req.body,
        gambar: storedImage || existing.gambar || null,
      });

      if (storedImage && existing.gambar && existing.gambar !== updated.gambar) {
        await removeStoredImage(existing.gambar);
      }

      return res.redirect(302, "/admin/kereta");
    } catch (error) {
      return res.redirect(302, buildRedirectUrl(`/admin/edit/${trainId}`, { error: error.message }));
    }
  });

  app.post("/trains/:id/delete", requireAdminApi, async (req, res) => {
    const trainId = Number(req.params.id);

    try {
      const removed = await deleteTrain(trainId);
      if (removed?.gambar) {
        await removeStoredImage(removed.gambar);
      }

      return res.redirect(302, "/admin/kereta");
    } catch (error) {
      return res.redirect(302, buildRedirectUrl("/admin/kereta", { error: error.message }));
    }
  });

  app.use((req, res) => {
    res.status(404).json({ error: "Route API tidak ditemukan." });
  });

  app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
      return res.status(400).json({ error: "Upload gambar gagal. Maksimal ukuran file 4MB." });
    }

    return res.status(500).json({ error: error.message || "Terjadi kesalahan server." });
  });

  return app;
}

const app = globalThis.__tiketKaiExpressApp || createExpressApp();
globalThis.__tiketKaiExpressApp = app;

export default app;
