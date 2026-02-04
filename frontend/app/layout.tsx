export const metadata = {
  title: "Registration",
  description: "Registration form starter",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{
          __html: `
            @font-face {
              font-family: 'FWC26-NormalThin';
              src: url('/fonts/FWC26-NormalThin.ttf') format('truetype');
              font-weight: normal;
              font-style: normal;
            }
            @font-face {
              font-family: 'FWC26-CondensedBlack';
              src: url('/fonts/FWC26-CondensedBlack.ttf') format('truetype');
              font-weight: 900;
              font-style: normal;
            }
          `
        }} />
      </head>
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
