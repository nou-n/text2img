# text2img
Using the DeepAI API for text-to-image

## Installation

To install dependencies:

```bash
bun install
```

## Usage

### Code

```typescript
import { generate } from "./text2img";
import fs from "fs/promises";

const imageBuffer = await generate("samoyed", {
    dimensions: [512, 512]
});
await fs.writeFile("./result.png", imageBuffer);
```

### Result

![Result Image](result.png)

## Supported Dimensions

The supported dimensions are as follows:

| Dimensions   |
|--------------|
| [704, 384]   |
| [640, 448]   |
| [512, 512]   |
| [448, 576]   |
| [384, 704]   |
