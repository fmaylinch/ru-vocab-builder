export function isCyrillic(token: string) {
    return token.charCodeAt(0) >= "Ё".charCodeAt(0) && "я".charCodeAt(0) <= 1103;
}

// splits by whitespace, includes the whitespace parts in the result
export function splitAndKeepWhitespace(text: string) {
    const regex = /\S+|\s+/g;
    return text.match(regex) || [];
}

export function splitCyrillic(text: string) {
    const regex = /[\u0400-\u04FF]+|[^\u0400-\u04FF]+/g;
    return text.match(regex) || [];
}
