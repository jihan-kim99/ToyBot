export const generateImage = async (prompt: string) => {
  try {
    const result = await fetch("/api/imgGen", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await result.json();
    if (!data.success || !data.imageUrl) {
      throw new Error(data.error || "Failed to generate image");
    }
    return data.imageUrl;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
};
