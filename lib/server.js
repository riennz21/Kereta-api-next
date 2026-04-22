import express from "express";
import multer from "multer";
import {
  createTrain,
  deleteTrain,
  getPaginatedTrains,
  getReportSummary,
  getScheduleRows,
  getStatusRows,
  getTrainById,
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
