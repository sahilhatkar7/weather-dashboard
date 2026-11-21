import "./globals.css";

export const metadata = {
  title: "Weatherly | Weather Dashboard",
  description:
    "A modern weather dashboard with live weather updates and forecasts.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}