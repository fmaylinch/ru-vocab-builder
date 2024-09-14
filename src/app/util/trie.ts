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

    // options: gender (m, f, n)
    // TODO - support ending ь and other variations
    insertNoun(noun: string, options: string[]) {
        const last = noun.slice(-1);
        let gender = options[0];
        const declinedStem = options[1];
        console.log("declinedStem: " + declinedStem);
        if (!gender) { // guess gender
            gender = (last == "а" || last == "я") ? "f" : (last == "о" || last == "е") ? "n" : "m";
        }
        const steam = declinedStem || ((gender == "m") ? noun : noun.slice(0, -1));
        const steamLast = steam.slice(-1);

        const endings = ["е"];

        // TODO: -ия операций, фамилий

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
                endings.push("ую", "ой");
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
    insertVerb(verb: string, options: string[]) {
        let steam: string = verb.slice(0, -3);
        const suffix: string = verb.slice(-3);
        const preSteam: string = verb.slice(0, -4);
        const wholeSuffix: string = verb.slice(-4);

        const endings = [];
        const ending1 = options[0];
        if (ending1) {
            this.insertSteamWithEndings(preSteam, [ending1]); // e.g. ку + плю
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
