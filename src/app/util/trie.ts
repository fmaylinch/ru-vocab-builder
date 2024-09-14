export interface NounOptions {
    gender?: Gender;
    steam?: string;
}

export interface VerbOptions {
    ending1?: string; // ending for 1st person singular
    prefixes?: string[];
}

type Gender = "m" | "f" | "n"

export class RussianTrie {
    private readonly trie: Trie;

    constructor() {
        this.trie = new Trie();
    }

    // indicate adjective with masculine singular ending: ый, ий, ой
    insertAdjective(adjective: string) {
        const steam: string = adjective.slice(0, -2);
        const suffix: string = adjective.slice(-2);
        const last = steam.slice(-1);
        const endings = [suffix, "ая", "ую"];
        if (last == "ш" || last == "ч") {
            endings.push("ее", "его", "ему", "ем", "ей");
        } else {
            endings.push("ое", "ого", "ому", "ом", "ой");
        }
        if (suffix == "ий") {
            endings.push("ие", "им", "их", "ими");
        } else {
            endings.push("ые", "ым", "ых", "ыми");
        }
        this.insertSteamWithEndings(steam, endings);
    }

    // TODO - support ending ь and other variations
    insertNoun(noun: string, options: NounOptions) {
        const last = noun.slice(-1);
        let gender = options.gender;
        if (!gender) { // guess gender
            gender = (last == "а" || last == "я") ? "f" : (last == "о" || last == "е") ? "n" : "m";
        }
        const steam = options.steam || ((gender == "m") ? noun : noun.slice(0, -1));
        const steamLast = steam.slice(-1);

        const endings = ["е"];

        // TODO: описанием is not included, and описание is included twice
        // TODO: -ия операций, фамилий
        // TODO: сценарий

        if (last == "е") {
            endings.push("ям", "ями", "ях");
        } else {
            endings.push("ам", "ами", "ах");
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
            endings.push("ов");
        }

        this.insertWord(noun);
        this.insertSteamWithEndings(steam, endings);
    }

    // options: 1st ending (e.g. шу)
    insertVerb(verb: string, options: VerbOptions) {
        let steam: string = verb.slice(0, -3);
        const suffix: string = verb.slice(-3);
        const preSteam: string = verb.slice(0, -4);
        const wholeSuffix: string = verb.slice(-4);

        const endings = [];
        if (options.ending1) {
            this.insertSteamWithEndings(preSteam, [options.ending1]); // e.g. ку + плю
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

        this.insertWord(verb);
        this.insertSteamWithEndings(steam, endings);

        for (const prefix of options.prefixes || []) {
            this.insertWord(prefix + verb);
            this.insertSteamWithEndings(prefix + steam, endings);
        }
    }

    private insertSteamWithEndings(steam: string, endings: string[]) {
        endings.forEach(ending => {
            const word = steam + ending;
            this.insertWord(word);
        });
    }

    insertWord(word: string) {
        //console.log(word);
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
