import axios from "axios";

// myhashfunction in https://deepai.org/machine-learning-model/text2img
const hash = (c: any): string => {
    // @ts-ignore
    for (var a = [], b = 0; 64 > b;) { a[b] = 0 | 4294967296 * Math.sin(++b % Math.PI); } var d, e, f, g = [d = 1732584193, e = 4023233417, ~d, ~e], h = [], l = decodeURI(encodeURI(c)) + "\u0080", k = l.length; c = --k / 4 + 2 | 15; for (h[--c] = 8 * k; ~k; ) { h[k >> 2] |= l.charCodeAt(k) << 8 * k--; } for (b = l = 0; b < c; b += 16) { for (k = g; 64 > l; k = [f = k[3], d + ((f = k[0] + [d & e | ~d & f, f & d | ~f & e, d ^ e ^ f, e ^ (d | ~f)][k = l >> 4] + a[l] + ~~h[b | [l, 5 * l + 1, 3 * l + 5, 7 * l][k] & 15]) << (k = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21][4 * k + l++ % 4]) | f >>> -k), d, e]) d = k[1] | 0, e = k[2]; for (l = 4; l; ) g[--l] += k[l]; } for (c = ""; 32 > l; ) { c += (g[l >> 3] >> 4 * (1 ^ l++) & 15).toString(16); }
    return c.split("").reverse().join("");
}

async function getMagicString(userAgent: string): Promise<string> {
    const { data } = await axios.get("https://deepai.org/machine-learning-model/text2img", {
        headers: {
            "User-Agent": userAgent
        }
    });

    const keyLine = data.split("tryit-")[1].split(";")[0].substring(1);

    const strings = [...keyLine.matchAll(/['"]([^'"]+)['"]/g)].map((m: string) => m[1]);
    const longest = strings.reduce((a: string, b: string) => a.length > b.length ? a : b);

    return longest;
}

export type Dimension =
    | [704, 384]
    | [640, 448]
    | [512, 512]
    | [448, 576]
    | [384, 704];

export async function generate(text: string, options?: {
    dimension?: Dimension,
    useOldModel?: boolean,
    userAgent?: string
}): Promise<Buffer> {
    const userAgent = options?.userAgent ?? "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

    const randomString = Math.round((Math.random() * 100000000000)).toString();
    const magicString = await getMagicString(userAgent);
    const tryitApiKey = `tryit-${randomString}-` + hash(userAgent + hash(userAgent + hash(userAgent + randomString + magicString)));

    const formData = new FormData();
    formData.append("text", text);
    formData.append("width", options?.dimension ? options.dimension[0].toString() : "512");
    formData.append("height", options?.dimension ? options.dimension[1].toString() : "512");
    formData.append("image_generator_version", "standard");
    formData.append("use_old_model", options?.useOldModel?.toString() ?? "false");
    formData.append("quality", "true");
    formData.append("genius_preference", "classic");

    const { data } = await axios.post("https://api.deepai.org/api/text2img", formData, {
        headers: {
            "Api-Key": tryitApiKey,
            "User-Agent": userAgent,
            "Content-Type": "multipart/form-data",
            "Referer": "https://deepai.org/machine-learning-model/text2img"
        }
    });

    const outputUrl = data.output_url;
    if(!outputUrl) throw new Error("Cannot get output URL.");

    return (await axios.get(outputUrl, {
        responseType: "arraybuffer"
    })).data;
}
