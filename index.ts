import { generate } from "./text2img";
import fs from "fs/promises";

async function main() {
    const imageBuffer = await generate("samoyed", {
        dimensions: [512, 512]
    });
    await fs.writeFile("./result.png", imageBuffer);
}
main();
