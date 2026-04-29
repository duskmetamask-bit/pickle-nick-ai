import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/picklenickai?gdrive_error=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(new URL("/picklenickai?gdrive_error=no_code", request.url));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "https://pickle-nick-ai.vercel.app"}/api/auth/google/callback`;

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      throw new Error("Token exchange failed");
    }

    const tokens = await tokenRes.json();

    // Return a page that stores tokens in localStorage and closes
    const html = `<!DOCTYPE html>
<html>
<head><title>Google Drive Connected</title></head>
<body>
<script>
  localStorage.setItem("pn_gdrive_access_token", ${JSON.stringify(tokens.access_token)});
  localStorage.setItem("pn_gdrive_refresh_token", ${JSON.stringify(tokens.refresh_token || "")});
  localStorage.setItem("pn_gdrive_token_expiry", String(Date.now() + (${tokens.expires_in || 3600} * 1000)));
  window.opener?.postMessage({ type: "gdrive_connected" }, "*");
  window.close();
</script>
<p>Connected! You can now save files to Google Drive. This window will close automatically.</p>
</body>
</html>`;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (err) {
    return NextResponse.redirect(
      new URL("/picklenickai?gdrive_error=token_exchange_failed", request.url)
    );
  }
}
