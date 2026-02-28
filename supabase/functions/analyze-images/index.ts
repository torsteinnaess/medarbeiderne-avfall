// Supabase Edge Function: analyze-images
// Analyserer bilder av avfall med OpenAI GPT-4o Vision API

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const WASTE_CATEGORIES = [
  "fett_vegetabilske_oljer",
  "hageavfall",
  "treverk_ubehandlet",
  "impregnert_treverk_cu",
  "papp_papir",
  "glass_metallemballasje",
  "isolerglassruter",
  "jern_metall",
  "ee_avfall",
  "gips",
  "tunge_masser",
  "blyholdig_avfall",
  "blaasesand",
  "impregnert_treverk_cca",
  "isocyanat",
  "uorg_syrer",
  "rengjoringsmidler",
  "klorparafin_isolerglassruter",
  "gassbeholdere",
  "gassflasker_propanflasker",
  "brannslukkingsapparater",
  "usortert_avfall",
] as const;

type WasteCategory = (typeof WASTE_CATEGORIES)[number];

interface AnalyzedItem {
  name: string;
  category: WasteCategory;
  estimated_weight_kg: number;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Håndter CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      throw new Error("OPENAI_API_KEY er ikke konfigurert");
    }

    const { image_urls } = (await req.json()) as { image_urls: string[] };

    // Valider input
    if (
      !Array.isArray(image_urls) ||
      image_urls.length === 0 ||
      image_urls.length > 10
    ) {
      return new Response(
        JSON.stringify({ error: "Ugyldig input: 1-10 bilde-URLer kreves" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Bygg meldingsinnhold med alle bilder
    const imageContent = image_urls.map((url: string) => ({
      type: "image_url" as const,
      image_url: { url, detail: "auto" as const },
    }));

    console.log("[analyze-images] Antall bilder:", image_urls.length);
    console.log("[analyze-images] URL-type:", image_urls[0]?.substring(0, 50));
    console.log(
      "[analyze-images] URL-lengder:",
      image_urls.map((u: string) => u.length),
    );

    const CATEGORY_DESCRIPTIONS = `
Tilgjengelige kategorier (bruk NØYAKTIG denne nøkkelen i "category"-feltet):

- "fett_vegetabilske_oljer" — Fett og vegetabilske oljer (matolje, frityrolje, smørefett)
- "hageavfall" — Hageavfall maks 15 cm tykkelse (greiner, gress, løv, hageplanterester)
- "treverk_ubehandlet" — Treverk ubehandlet (umalte planker, paller, trekasser, ubehandlet trevirke)
- "impregnert_treverk_cu" — Impregnert treverk CU, etter 2002 (trykkimpregnert med kobber, grønnlig farge)
- "papp_papir" — Papp og papir (pappesker, aviser, kontorpapir, bølgepapp)
- "glass_metallemballasje" — Glass og metallemballasje (flasker, hermetikkbokser, aluminiumsbokser)
- "isolerglassruter" — Isolerglassruter uten farlige stoffer (vinduer, dobbeltglass uten PCB)
- "jern_metall" — Jern og metall sams (stålrør, metallrammer, jernplater, metallgjenstander)
- "ee_avfall" — EE-avfall / elektronikk (datamaskiner, TV, kabler, småelektronikk, hvitevarer)
- "gips" — Gips (gipsplater, gipsstøv, gipsrester fra bygg)
- "tunge_masser" — Tunge masser (betong, stein, tegl, fliser, keramikk)
- "blyholdig_avfall" — Blyholdig avfall (blybatterier, blyplater, blyrør)
- "blaasesand" — Blåsesand småkolli (brukt sandblåsesand)
- "impregnert_treverk_cca" — Impregnert treverk CCA, før 2003 (eldre trykkimpregnert, inneholder krom/arsen)
- "isocyanat" — Isocyanat småkolli (PU-skum, isocyanatholdige produkter)
- "uorg_syrer" — Uorganiske syrer fast småkolli (tørre syrer, faststoff)
- "rengjoringsmidler" — Rengjøringsmidler flytende småkolli (kjemiske rengjøringsprodukter)
- "klorparafin_isolerglassruter" — Klorparafinholdige isolerglassruter (eldre vinduer med farlige stoffer)
- "gassbeholdere" — Gassbeholdere små (spraybokser, små trykkbeholdere)
- "gassflasker_propanflasker" — Gassflasker og propanflasker (propan, butan, acetylen)
- "brannslukkingsapparater" — Brannslukkingsapparater (pulver-, skum-, CO2-apparater)
- "usortert_avfall" — Usortert avfall (blandet avfall som ikke passer andre kategorier, møbler, restavfall)
`.trim();

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `Du er en norsk avfallsekspert som jobber for et avfallshentingsselskap. Din oppgave er å analysere bilder av avfall og identifisere hver gjenstand med riktig avfallskategori, norsk navn og estimert vekt i kg.

${CATEGORY_DESCRIPTIONS}

Viktige regler:
1. Bruk ALLTID norske navn på gjenstander (f.eks. "Gammel sofa", "Treplanke", "Pappesker").
2. Velg den MEST SPESIFIKKE kategorien som passer. Bruk "usortert_avfall" kun hvis ingen annen kategori passer.
3. Estimer vekt realistisk i kg. En sofa veier ca 30-50 kg, en stol 5-10 kg, en pappkasse 1-3 kg.
4. Hvis du ser flere like gjenstander, grupper dem (f.eks. "5 pappesker" med samlet vekt).
5. Du MÅ ALLTID identifisere minst én gjenstand fra bildet. Selv om du er usikker, gjør ditt beste estimat.
6. Returner ALLTID et JSON-objekt med nøkkelen "items" som inneholder en array av gjenstander.`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Du får ${image_urls.length} bilde${image_urls.length > 1 ? "r" : ""}. Analyser HVERT bilde separat og identifiser ALLE gjenstander du kan se på tvers av ALLE bildene. Kombiner resultatet i én samlet liste.

For hver gjenstand, returner et objekt med:
- "name": norsk beskrivelse av gjenstanden
- "category": en av de definerte kategorinøklene (se systemmelding)
- "estimated_weight_kg": estimert vekt i kg (tall)

Svar med et JSON-objekt: {"items": [{"name": "Gammel sofa", "category": "usortert_avfall", "estimated_weight_kg": 35}, {"name": "Pappesker", "category": "papp_papir", "estimated_weight_kg": 2}]}`,
              },
              ...imageContent,
            ],
          },
        ],
        max_tokens: 2000,
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API feil: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? '{"items":[]}';
    const finishReason = data.choices?.[0]?.finish_reason ?? "unknown";

    console.log("[analyze-images] OpenAI finish_reason:", finishReason);
    console.log("[analyze-images] OpenAI raw content:", content);

    // Parse og valider svar — forventer { "items": [...] } format
    let rawItems: AnalyzedItem[];
    try {
      const cleaned = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      const parsed = JSON.parse(cleaned);

      // Håndter både { "items": [...] } og bare [...] format
      if (Array.isArray(parsed)) {
        rawItems = parsed;
      } else if (parsed.items && Array.isArray(parsed.items)) {
        rawItems = parsed.items;
      } else {
        throw new Error(`Uventet format: ${cleaned}`);
      }
    } catch (parseErr) {
      throw new Error(`Klarte ikke parse OpenAI-svar: ${content}`);
    }

    // Advar hvis OpenAI returnerte tom array — sannsynligvis feil med bildene
    if (rawItems.length === 0) {
      console.warn(
        "[analyze-images] OpenAI returnerte tom array — bildene ble kanskje ikke lest riktig",
      );
      console.warn(
        "[analyze-images] URL-prefix:",
        image_urls.map((u: string) => u.substring(0, 60)),
      );
    }

    // Valider kategorier og sanitize
    const items: AnalyzedItem[] = rawItems.map((item: AnalyzedItem) => ({
      name: String(item.name || "Ukjent gjenstand"),
      category: WASTE_CATEGORIES.includes(item.category as WasteCategory)
        ? item.category
        : ("usortert_avfall" as WasteCategory),
      estimated_weight_kg: Math.max(0.1, Number(item.estimated_weight_kg) || 1),
    }));

    return new Response(
      JSON.stringify({
        items,
        _debug: {
          raw_content: content,
          finish_reason: finishReason,
          received_url_lengths: image_urls.map((u: string) => u.length),
          received_url_prefixes: image_urls.map((u: string) =>
            u.substring(0, 40),
          ),
          openai_status: response.status,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Ukjent feil";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
