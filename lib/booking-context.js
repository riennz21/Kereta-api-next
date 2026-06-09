import { createContext, useContext, useState, useCallback, useMemo } from "react";

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const [booking, setBooking] = useState({
    asal: "",
    tujuan: "",
    tanggal: "",
    penumpang: 1,
  });

  const updateField = useCallback((field, value) => {
    setBooking((prev) => ({ ...prev, [field]: value }));
  }, []);

  const swapRoute = useCallback(() => {
    setBooking((prev) => ({
      ...prev,
      asal: prev.tujuan,
      tujuan: prev.asal,
    }));
  }, []);

  const setPenumpang = useCallback((value) => {
    setBooking((prev) => ({
      ...prev,
      penumpang: Math.max(1, Math.min(4, value)),
    }));
  }, []);

  const resetBooking = useCallback(() => {
    setBooking({
      asal: "",
      tujuan: "",
      tanggal: "",
      penumpang: 1,
    });
  }, []);

  const canSearch = useMemo(() => {
    return booking.asal.trim() !== "" && booking.tujuan.trim() !== "";
  }, [booking.asal, booking.tujuan]);

  const value = useMemo(
    () => ({ booking, updateField, swapRoute, setPenumpang, resetBooking, canSearch }),
    [booking, updateField, swapRoute, setPenumpang, resetBooking, canSearch],
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return ctx;
}
