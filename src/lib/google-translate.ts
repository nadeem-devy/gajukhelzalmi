const API_KEY = process.env.GOOGLE_API_KEY;

export async function translateToUrdu(text: string): Promise<string> {
  if (!text.trim()) return text;
  try {
    const res = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: [text],
          target: "ur",
          source: "en",
          format: "text",
        }),
      }
    );
    const json = await res.json();
    return json.data?.translations?.[0]?.translatedText || text;
  } catch (error) {
    console.error("Translation failed:", error);
    return text;
  }
}

export async function translateBatch(texts: string[]): Promise<string[]> {
  const nonEmpty = texts.filter((t) => t.trim());
  if (nonEmpty.length === 0) return texts;

  try {
    const res = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: nonEmpty,
          target: "ur",
          source: "en",
          format: "text",
        }),
      }
    );
    const json = await res.json();
    const translations = json.data?.translations || [];

    let transIndex = 0;
    return texts.map((t) => {
      if (!t.trim()) return t;
      return translations[transIndex++]?.translatedText || t;
    });
  } catch (error) {
    console.error("Batch translation failed:", error);
    return texts;
  }
}
