import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    const backendUrl =
      process.env.BACKEND_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:8000";

    const target = `${backendUrl.replace(/\/$/, "")}/api/recommend`;

    const upstream = await fetch(target, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const contentType = upstream.headers.get("content-type") || "";
    const body = contentType.includes("application/json")
      ? await upstream.json()
      : { detail: await upstream.text() };

    return NextResponse.json(body, { status: upstream.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown proxy error";
    return NextResponse.json(
      { detail: `Frontend proxy failed: ${message}` },
      { status: 502 }
    );
  }
}
