import Head from "next/head";
import { BookingProvider } from "../../lib/booking-context";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function PublicLayout({ title, children }) {
  return (
    <BookingProvider>
      <Head>
        <title>{title ? `${title} - TiketKAI` : "TiketKAI"}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <div className="public-shell">
        <Navbar />
        <main className="public-container">{children}</main>
        <Footer />
      </div>
    </BookingProvider>
  );
}
