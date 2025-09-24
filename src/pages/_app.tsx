import type { AppProps } from "next/app";
import React from "react";
import { setup } from "goober";
import { Layout } from "@/components/Layout";
import "@/styles/globals.css";

setup(React.createElement);

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
