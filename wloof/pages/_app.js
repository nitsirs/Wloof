import { useEffect, useState } from 'react';
import '../styles/globals.css'

const liffId = process.env.NEXT_PUBLIC_LIFF_ID

function MyApp({ Component, pageProps }) {
  const [liffObject, setLiffObject] = useState(null);
  const [liffError, setLiffError] = useState(null);
  useEffect(async () => {
    const initLiff = async () => {
      const liff = (await import('@line/liff')).default;
      try {
      await liff.init({ liffId });
      setLiffObject(liff);
      } catch (error) {
      console.error('liff init error', error.message);
      setLiffError(error.message)
      }
      if (!liff.isLoggedIn()) {
      liff.login();
      }
      };
      initLiff();
  }, [])

  return <Component {...pageProps} liff={liffObject} liffError={liffError} />
}

export default MyApp