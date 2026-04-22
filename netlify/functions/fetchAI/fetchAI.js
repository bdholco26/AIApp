import OpenAI from "openai";
import { traceable } from "langsmith/traceable";
import { wrapOpenAI } from "langsmith/wrappers";

const openai = wrapOpenAI(
  new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  })
);

const handler = traceable(async (event) => {
  try {
    const requestBody = JSON.parse(event.body || "{}");
    const { productName, productDesc, targetMarket } = requestBody;

    if (!productName || !productDesc || !targetMarket) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required fields" })
      };
    }

    const prompt = `You are a senior direct-response copywriter. Write advertising copy tailored
to the target market in the tone they respond to best. Follow the rules below.

Rules:
- 40 to 60 words total.
- Mention the product name at most twice.
- End with exactly one clear call-to-action.
- Use at most two hashtags, and only if they reinforce the brand.
- Vary your vocabulary; do not reuse the example phrases verbatim.

###
product name: EcoPure Hydration Bottle
product description: A sustainable, vacuum-insulated water bottle that keeps
drinks cold for 48 hours and hot for 24 hours.
target market: environmentally conscious consumers
advertising copy: Tired of single-use plastic guilt? EcoPure keeps your water
ice-cold for 48 hours and every sip out of landfills. Rugged, refillable, and
ready for wherever you're headed. Make your next bottle your last. Shop EcoPure
today. #DrinkSustainably

###
product name: QuietNight Sleep Earbuds
product description: Noise-masking earbuds with a 20-hour battery designed for
side sleepers.
target market: adults 55+ with trouble sleeping
advertising copy: Restless nights wear you down. QuietNight earbuds block
snoring, traffic, and everything in between with 20 hours of gentle sound,
shaped to rest comfortably even for side sleepers. Wake up feeling like
yourself again. Order tonight and sleep better tomorrow.

###
product name: SnackSmart Lunchbox
product description: A bento-style lunchbox with portion-controlled compartments
and an ice pack built into the lid.
target market: busy parents packing school lunches
advertising copy: Mornings are chaos. SnackSmart makes packed lunches take two
minutes: four compartments, a built-in ice pack, and no more leaky containers
in the bag. Kid-approved, dishwasher-safe, and ready when you are. Grab yours
before school starts. #LunchSorted

###
product name: ${productName}
product description: ${productDesc}
target market: ${targetMarket}
advertising copy:`;

    const response = await openai.completions.create({
      model: "gpt-3.5-turbo-instruct",
      prompt,
      max_tokens: 120,
      temperature: 0.7,
      frequency_penalty: 0.5
    });

    const adCopy = response.choices?.[0]?.text?.trim() || "";

    return {
      statusCode: 200,
      body: JSON.stringify({
        reply: adCopy
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || String(error) })
    };
  }
}, {
  name: "generateAdCopy",
  project_name: process.env.LANGSMITH_PROJECT
});

module.exports = { handler };
