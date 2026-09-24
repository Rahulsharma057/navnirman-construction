import Providers from "@/components/Providers";
import SiteChrome from "@/components/SiteChrome";
import "./globals.css";

export const metadata = {
  title: "Navnirman Construction | Building, Renovation, Road & Civil Contractor in Delhi",
  description:
    "GST-registered civil contractor in Delhi — building construction, renovation, roads and paving, painting, electrical, gate and fencing work. See completed projects and request a quote.",
};

export const viewport = { themeColor: "#1C2321" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <SiteChrome />
        </Providers>
      </body>
    </html>
  );
}
