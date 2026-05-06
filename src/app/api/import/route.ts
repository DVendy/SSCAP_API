import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import data from "../../../../resources/test-data.json";

export async function GET() {
  try {
    for (const record of data.data) {
      const content = {
        data: {
          tlaloque_id: record.content.data.tlaloque_id,
          pulses: record.content.data.pulses,
          catched_at: record.content.data.catched_at,
        },
        metadata: {
          ip: record.content.metadata.ip,
          city: record.content.metadata.city,
          country: record.content.metadata.country,
          userAgent: record.content.metadata.userAgent,
        },
        id: record.content.id,
        updated_at: record.content.updated_at,
        created_at: record.content.created_at,
      };
      const filename = record.filename;

      // Store in Blob with retry logic
      let retries = 0;
      const maxRetries = 10;
      while (retries < maxRetries) {
        try {
          await put(filename, JSON.stringify(content), {
            access: "public",
            addRandomSuffix: false,
          });
          break;
        } catch (error) {
          retries++;
          if (retries >= maxRetries) throw error;
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }
    }

    return NextResponse.json({ total: data.data.length }, { status: 201 });
  } catch (error: any) {
    console.error("Error saving to Blob:", error);
    return NextResponse.json(
      { success: false, message: "import_failed", error: error.message },
      { status: 400 },
    );
  }
}
