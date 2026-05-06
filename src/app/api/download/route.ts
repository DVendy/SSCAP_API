import { list } from "@vercel/blob";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const allData = [];
    // List all blobs (no prefix to be safe)
    const response = await list();
    const blobs = response.blobs;

    if (blobs.length === 0) {
      return NextResponse.json({
        success: true,
        message: "no_blobs_found_in_store",
        count: 0,
      });
    }

    for (const blob of blobs) {
      // Only process files in our sscap folder
      if (!blob.pathname.startsWith("sscap/")) continue;

      try {
        const res = await fetch(blob.url, { cache: "no-store" });
        if (res.ok) {
          const content = await res.json();
          allData.push({
            filename: blob.pathname,
            uploadedAt: blob.uploadedAt,
            content,
          });
        }
      } catch (e) {
        console.error(`Error fetching ${blob.url}:`, e);
      }
    }

    return new NextResponse(
      JSON.stringify(
        {
          total_blobs_found: blobs.length,
          sscap_records_processed: allData.length,
          data: allData,
        },
        null,
        2,
      ),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition":
            'attachment; filename="sscap_data_export.json"',
        },
      },
    );
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "download_route_failed",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
