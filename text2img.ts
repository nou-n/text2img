import axios from "axios";

// myhashfunction in https://deepai.org/machine-learning-model/text2img
const hash = (input: string): string => {
    const a: number[] = [
        -680876936, -389564586, 606105819, -1044525330, -176418897, 1200080426, -1473231341,
        -45705983, 1770035416, -1958414417, -42063, -1990404162, 1804603682, -40341101,
        -1502002290, 1236535329, -165796510, -1069501632, 643717713, -373897302, -701558691,
        38016083, -660478335, -405537848, 568446438, -1019803690, -187363961, 1163531501,
        -1444681467, -51403784, 1735328473, -1926607734, -378558, -2022574463, 1839030562,
        -35309556, -1530992060, 1272893353, -155497632, -1094730640, 681279174, -358537222,
        -722521979, 76029189, -640364487, -421815835, 530742520, -995338651, -198630844,
        1126891415, -1416354905, -57434055, 1700485571, -1894986606, -1051523, -2054922799,
        1873313359, -30611744, -1560198380, 1309151649, -145523070, -1120210379, 718787259,
        -343485551
    ];

    let b: number = 64, d: number, e: number, f: number, g: number[] = [d = 1732584193, e = 4023233417, ~d, ~e], h: number[] = [], l: string | number, k: number | number[];

    l = `${input}\u0080`;
    k = l.length;

    let blockLen = --k / 4 + 2 | 15;
    h[--blockLen] = 8 * k;

    for (; ~k; )
        h[k >> 2] |= l.charCodeAt(k) << 8 * k--;

    for (b = l = 0; b < blockLen; b += 16) {
        for (k = g; 64 > l; k = [
            f = k[3],
            d + (
                (
                    f = k[0] + [
                        d & e | ~d & f,
                        f & d | ~f & e,
                        d ^ e ^ f,
                        e ^ (d | ~f)
                    ][k = l >> 4]
                    + a[l]
                    + ~~h[b | [
                        l,
                        5 * l + 1,
                        3 * l + 5,
                        7 * l
                    ][k] & 15]
                )
                << (
                    k = [
                        7, 12, 17, 22,
                        5, 9, 14, 20,
                        4, 11, 16, 23,
                        6, 10, 15, 21
                    ][4 * k + l++ % 4]
                ) | f >>> -k
            ),
            d,
            e
        ]) {
            d = k[1] | 0;
            e = k[2];
        }

        for (l = 4; l; )
            g[--l] += k[l];

    }

    let result = "";
    for (l = 0; 32 > l; )
        result += (g[l >> 3] >> 4 * (1 ^ l++) & 15).toString(16);

    return result.split("").reverse().join("");
};

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

export type Dimensions =
    | [704, 384]
    | [640, 448]
    | [512, 512]
    | [448, 576]
    | [384, 704];

export async function generate(text: string, options?: {
    dimensions?: Dimensions,
    useOldModel?: boolean,
    userAgent?: string
}): Promise<Buffer> {
    const userAgent = options?.userAgent ?? "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

    const randomString = Math.round((Math.random() * 100000000000)).toString();
    const magicString = await getMagicString(userAgent);
    const tryitApiKey = `tryit-${randomString}-` + hash(userAgent + hash(userAgent + hash(userAgent + randomString + magicString)));

    const formData = new FormData();
    formData.append("text", text);
    formData.append("width", options?.dimensions ? options.dimensions[0].toString() : "512");
    formData.append("height", options?.dimensions ? options.dimensions[1].toString() : "512");
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
