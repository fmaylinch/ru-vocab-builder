export interface NounOptions {
    gender?: Gender;
    steam?: string;
}

export interface VerbOptions {
    ending1?: string; // ending for 1st person singular
    prefixes?: string[];
}

export interface AdjectiveOptions {
    adverb: boolean; // can form an adverb <steam>+о (e.g. хорошо, круто)
}

// This is actually ending, e.g. we consider мужчина as "f" Gender.
type Gender = "m" | "f" | "n"

export class RussianTrie {
    private readonly trie: Trie;

    constructor() {
        this.trie = new Trie();
    }

    generateWords(word: string, options: unknown, type: string): string[] {
        if (type == "n") {
            return this.generateNoun(word, options as NounOptions); // type is not checked, actually
        } else if (type == "a") {
            return this.generateAdjective(word, {adverb: false})
        } else if (type == "aa") {
            return this.generateAdjective(word, {adverb: true})
        } else if (type == "v") {
            return this.generateVerb(word, options as VerbOptions);
        } else if (word) {
            return [word];
        }
        return [];
    }

    // indicate adjective with masculine singular ending: ый, ий, ой
    generateAdjective(adjective: string, options: AdjectiveOptions): string[] {
        const steam: string = adjective.slice(0, -2);
        const suffix: string = adjective.slice(-2);
        const last = steam.slice(-1);
        const last3 = steam.slice(-3);
        const endings = [suffix];
        if (options.adverb) {
            endings.push("о");
        }
        if (last3 == "ний") {
            endings.push("яя", "юю");
        } else {
            endings.push("ая", "ую");
        }
        if (last == "ш" || last == "ч" || last3 == "ний") {
            endings.push("ее", "его", "ему", "ем", "ей");
        } else {
            endings.push("ое", "ого", "ому", "ом", "ой");
        }
        if (suffix == "ий") {
            // TODO: if ending is "ний", the endings are different for f gender: -яя, -юю
            endings.push("ие", "им", "их", "ими");
        } else {
            endings.push("ые", "ым", "ых", "ыми");
        }
        return this.generateSteamWithEndings(steam, endings);
    }

    // TODO - support ending ь and other variations
    generateNoun(noun: string, options: NounOptions): string[] {
        const last = noun.slice(-1);
        const last2 = noun.slice(-2);

        // special endings
        if (last2 == "ий" || last2 == "ие" || last2 == "ия" ) { // сценарий, описание, магия
            const endings = ['ий', 'ия', 'ию', 'ии'];
            if (last2 == "ия") {
                endings.push("ией");
            } else {
                endings.push('ием', last2 == "ие" ? "ие" : "иев");
            }
            const steam = noun.slice(0, -2);
            return this.generateSteamWithEndings(steam, endings);
        }

        let gender = options.gender;
        if (!gender) { // guess gender
            const fEndings = ["а", "я"]; // TODO: ь could be another "Gender"?
            const nEndings = ["о", "е"];
            gender = fEndings.indexOf(last) >= 0 ? "f" : nEndings.indexOf(last) >= 0 ? "n" : "m";
        }
        const steam = options.steam || ((gender == "m") ? noun : noun.slice(0, -1));
        const steamLast = steam.slice(-1);

        const endings = ["е"];

        // TODO: -ия операций, фамилий

        if (last == "е") {
            endings.push("ям", "ями", "ях");
        } else {
            endings.push("ам", "ами", "ах");
        }

        if (last == "а" || last == "о") {
            endings.push(""); // empty ending
        }

        if (gender == "m" || last == "о") {
            endings.push("а", "у", "ом");
        } else if (last == "е") {
            endings.push("я", "ю", "ей");
        } else if (gender == "f") {
            if (last == "я") {
                endings.push("ю", "ей");
            } else { // а
                endings.push("у", "ой");
            }
        }
        if (gender == "m" || gender == "f") {
            endings.push(last == "я" || ["к", "ч"].indexOf(steamLast) >= 0 ? "и" : "ы");
        }
        if (gender == "m") {
            endings.push("ов"); // TODO: when is it -ев (besides -ий) ?
        }

        return [noun, ...this.generateSteamWithEndings(steam, endings)];
    }

    // options: 1st ending (e.g. шу)
    generateVerb(verb: string, options: VerbOptions): string[] {
        let steam: string = verb.slice(0, -3);
        const suffix: string = verb.slice(-3);
        const preSteam: string = verb.slice(0, -4);
        const wholeSuffix: string = verb.slice(-4);

        let result: string[] = [];

        const endings = [];
        if (options.ending1) {
            result = [...result, ...this.generateSteamWithEndings(preSteam, [options.ending1])]; // e.g. ку + плю
        } else if (wholeSuffix[0] == "с") {
            steam = preSteam + "ш";
            endings.push("у", "ешь", "ет", "ем", "ете", "ут");
        } else if (wholeSuffix[0] == "з") {
            steam = preSteam + "ж";
            endings.push("у", "ешь", "ет", "ем", "ете", "ут"); // same as with "с"
        } else {
            endings.push(suffix == "ать" ? "аю" : "ю");
            if (suffix == "ать") {
                endings.push("аешь", "ает", "аем", "аете", "ают");
            } else {
                endings.push("ишь", "ит", "им", "ите", "ят");
            }
        }

        result = [...result, verb, ...this.generateSteamWithEndings(steam, endings)];

        for (const prefix of options.prefixes || []) {
            result.push(prefix + verb);
            result = [...result, ...this.generateSteamWithEndings(prefix + steam, endings)];
        }

        return result;
    }

    private generateSteamWithEndings(steam: string, endings: string[]): string[] {
        return endings.map(ending => steam + ending);
    }

    insertWords(words: string[]) {
        words.forEach(word => this.trie.insert(word));
    }

    insertWord(word: string) {
        this.trie.insert(word);
    }

    contains(word: string) {
        return this.trie.search(word);
    }
}

class Trie {
    private readonly root: TrieNode;

    constructor() {
        this.root = new TrieNode();
    }

    insert(word: string) {
        let node : TrieNode = this.root;

        for(let i = 0; i < word.length; i++) {
            if(!node.children.has(word[i])) {
                node.children.set(word[i], new TrieNode());
            }

            node = node.children.get(word[i])!;
        }

        node.end = true;
    }

    search(word: string) {
        let node = this.root;

        for(let i = 0; i < word.length; i++) {
            if(node.children.has(word[i])) {
                node = node.children.get(word[i])!;
            } else {
                return false;
            }
        }

        return node.end;
    }
}

class TrieNode {
    public end: boolean;
    public children: Map<string, TrieNode>;

    constructor() {
        this.end = false;
        this.children = new Map<string, TrieNode>();
    }
}
