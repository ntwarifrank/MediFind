import { Poppins } from "next/font/google";
import "./globals.css";
import AuthProvider from "./context/AuthContext";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "MediFind | Find Healthcare Services in Rwanda",
  description: "MediFind helps you quickly locate the right healthcare professionals and medical services across Rwanda.",
  icons: {
    icon: "/medifind-icon.jpeg",
    apple: "/medifind-icon.jpeg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className={`${poppins.className} font-poppins`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
