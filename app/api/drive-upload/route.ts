import { NextRequest, NextResponse } from "next/server";

interface UploadRequest {
  fileName: string;
  content: string;
  mimeType: string;
  accessToken?: string;
}

async function getAccessToken(refreshToken: string): Promise<string | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) return null;

  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.access_token || null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: UploadRequest = await request.json();
    const { fileName, content, mimeType, accessToken } = body;

    if (!fileName || !content) {
      return NextResponse.json({ error: "Missing fileName or content" }, { status: 400 });
    }

    // If no accessToken provided, user needs to authenticate
    if (!accessToken) {
      // Return auth URL for client to initiate OAuth flow
      const authRes = await fetch(`${request.nextUrl.origin}/api/auth/google`);
      const { authUrl } = await authRes.json();
      return NextResponse.json({ authUrl }, { status: 401 });
    }

    // Upload to Google Drive using the drive.file scope
    const boundary = "boundary_" + Date.now();
    const fileContent = new TextEncoder().encode(content);

    const metadata = JSON.stringify({
      name: fileName,
      mimeType: mimeType || "application/vnd.google-apps.document",
    });

    // Build multipart request body
    const delimiter = `--${boundary}`;
    const closeDelimiter = `--${boundary}--`;

    const parts: Uint8Array[] = [];

    // Part 1: metadata
    parts.push(
      new TextEncoder().encode(
        `${delimiter}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n`
      )
    );

    // Part 2: file content
    parts.push(
      new TextEncoder().encode(
        `${delimiter}\r\nContent-Type: ${mimeType || "text/plain"}\r\n\r\n`
      )
    );
    parts.push(new Uint8Array(fileContent));
    parts.push(new TextEncoder().encode(`\r\n${closeDelimiter}\r\n`));

    const bodyBytes = new Uint8Array(
      parts.reduce((acc, part) => acc + part.length, 0)
    );
    let offset = 0;
    for (const part of parts) {
      bodyBytes.set(part, offset);
      offset += part.length;
    }

    const uploadRes = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": `multipart/related; boundary=${boundary}`,
        },
        body: bodyBytes,
      }
    );

    if (!uploadRes.ok) {
      const err = await uploadRes.json();
      return NextResponse.json({ error: err.error?.message || "Upload failed" }, { status: 500 });
    }

    const result = await uploadRes.json();
    const driveLink = `https://drive.google.com/file/d/${result.id}/view`;

    return NextResponse.json({ driveLink, fileId: result.id });
  } catch (err) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
