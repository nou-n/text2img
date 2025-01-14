# text2img
Using the DeepAI API for text-to-image

## Usage

### Installation

To install dependencies:

```bash
bun install
```

### Example

#### Code

```typescript
import { generate } from "./text2img";
import fs from "fs/promises";

const imageBuffer = await generate("samoyed", {
    dimension: [512, 512]
});
await fs.writeFile("./result.png", imageBuffer);
```

#### Result

![Result Image](result.png)
