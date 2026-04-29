import localFont from "next/font/local";

export const fontSans = localFont({
  src: "../app/fonts/GeistVF.woff",
  variable: "--font-sans",
  display: "swap",
});

export const fontMono = localFont({
  src: "../app/fonts/GeistMonoVF.woff",
  variable: "--font-mono",
  display: "swap",
});
