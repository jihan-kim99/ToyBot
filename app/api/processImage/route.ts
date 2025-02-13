import { NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(request: Request) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { message: "Image URL is required" },
        { status: 400 }
      );
    }

    // Remove data URL prefix to get base64
    const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, "base64");

    // Process image with Sharp
    const processedImageBuffer = await sharp(imageBuffer)
      .resize(800, 800, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer();

    // Convert back to base64
    const processedBase64 = `data:image/webp;base64,${processedImageBuffer.toString(
      "base64"
    )}`;

    return NextResponse.json({ processedImage: processedBase64 });
  } catch (error) {
    console.error("Image processing error:", error);
    return NextResponse.json(
      { message: "Error processing image" },
      { status: 500 }
    );
  }
}
