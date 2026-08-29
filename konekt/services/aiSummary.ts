import type { PlaceVisit } from '../src/constants/types';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

// One line to change if you want different quality/speed/cost.
const MODEL = 'claude-haiku-4-5';

function buildPrompt(places: PlaceVisit[]): string {
  const list = places
    .map((p) => {
      const extra = p.subtitle ? ` (${p.subtitle})` : '';
      return `- ${p.time} — ${p.name}${extra} [${p.type}]`;
    })
    .join('\n');

  return [
    "Here is where someone went today:",
    list,
    "",
    "Write a warm, personal 2-sentence summary of their day, as if you were",
    "telling a family member far away who worries about them how the person is doing.",
    "Sound like a caring human, not a report. Do not just list the places.",
    "Reply with only the summary — no preamble, no quotation marks.",
  ].join('\n');
}

/**
 * Turn a list of places into a warm, human day summary using the Claude API.
 * Returns the generated text.
 */
export async function generateDaySummary(places: PlaceVisit[]): Promise<string> {
  const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      'Missing EXPO_PUBLIC_ANTHROPIC_API_KEY. Add it to konekt/.env and restart Expo with: npx expo start -c',
    );
  }

  const res = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      // lets the call work from Expo web too (harmless on native)
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 300,
      messages: [{ role: 'user', content: buildPrompt(places) }],
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${detail}`);
  }

  const data = (await res.json()) as {
    content?: { type: string; text?: string }[];
  };

  const text = (data.content ?? [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text ?? '')
    .join('')
    .trim();

  if (!text) {
    throw new Error('Anthropic API returned no text');
  }
  return text;
}
