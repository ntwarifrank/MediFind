import { Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import MainLayout from "../components/layout/MainLayout";

const poppins = Poppins({ subsets: ["latin"], weight: ['400', '500', '600', '700'], variable: '--font-poppins' });

export const metadata = {
  title: "MediFind Hospital Admin Dashboard",
  description: "Hospital administration portal for MediFind platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-poppins bg-whiteGray min-h-screen`}>
        <AuthProvider>
          {/* Layout wrapper only for authenticated routes */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
