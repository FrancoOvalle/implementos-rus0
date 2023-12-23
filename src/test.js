const OpenAI = require("openai");

const openai = new OpenAI({apiKey: "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"})

//     apiKey: "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");

async function main() {
  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: "You are a helpful assistant." }],
    model: "gpt-3.5-turbo",
  });

  console.log(completion.choices[0]);
}

main();