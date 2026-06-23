import "../styles/globals.css";
import Head from "next/head";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="TiketKAI - Platform pemesanan tiket kereta api Indonesia. Pesan tiket kereta dengan mudah, cek jadwal, dan lacak status pesanan." />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
