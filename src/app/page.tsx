"use client"

import Image from "next/image";
import styles from "./page.module.css";
import {useEffect, useState} from "react";
import {RussianTrie} from './util/trie';
import {isCyrillic, splitCyrillic} from './util/text'

export default function Home() {

  const [outputText, setOutputText] = useState("");
  const [text, setText] = useState("");
  const [testLine, setTestLine] = useState("");
  const [testLineOutput, setTestLineOutput] = useState("");
  const [russianTrie, setRussianTrie] = useState(new RussianTrie());
  const [trieLoaded, setTrieLoaded] = useState(false);

  useEffect(() => {
    console.log("useEffect");

    fetch('/vocabulary.csv')
        .then((r) => r.text())
        .then(text => {
          const trie = new RussianTrie();
          const lines = text.split("\n");
          lines.forEach(line => {
            const words = generateWords(line, trie);
            trie.insertWords(words)
          });
          setRussianTrie(trie);
          setTrieLoaded(true);
        })
  }, [])

  function generateWords(line: string, trie: RussianTrie) {
    const [word, type, ...optionsJsonSplitted] = line.split(",");
    const optionsJson = optionsJsonSplitted.join(","); // last parts are a JSON
    const options = optionsJson ? JSON.parse(optionsJson) : {};
    return trie.generateWords(word, options, type);
  }

  function updateText(value: string) {
    setText(value);

    if (value == "") {
      setOutputText("");
      return;
    }

    const pieces = splitCyrillic(value.replaceAll("\n", "<br>"));

    const replaced = pieces.map(token => {
      if (!isCyrillic(token)) {
        return token;
      }
      if (!russianTrie.contains(token.toLowerCase())) {
        return "<span class='mark'>" + token + "</span>";
      }
      return token;
    });

    const output = replaced.join(" ");

    setOutputText(output);
  }

  function updateTestLine(line: string) {
    setTestLine(line);
    const words = generateWords(line, russianTrie);
    const html = words.join("<br>");
    setTestLineOutput(html);
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Word analysis</h1>
        <div className="highlighted" dangerouslySetInnerHTML={{__html: outputText}}></div>
        <textarea placeholder={"Russian text"}
                  value={text} rows={10} onChange={e => updateText(e.target.value)}/>

        <p>Trie loaded: {trieLoaded ? "yes" : "no"}</p>

        <hr/>
        <input placeholder={"Test line"}
               value={testLine} onChange={e => updateTestLine(e.target.value)}/>
        <div className="highlighted" dangerouslySetInnerHTML={{__html: testLineOutput}}></div>
        <hr/>

        <div className={styles.ctas}>
          <a
              className={styles.primary}
              href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
          >
            <Image
                className={styles.logo}
                src="https://nextjs.org/icons/vercel.svg"
                alt="Vercel logomark"
                width={20}
                height={20}
            />
            Deploy now
          </a>
          <a
              href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.secondary}
          >
            Read our docs
          </a>
        </div>
      </main>
      <footer className={styles.footer}>
        <a
            href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="https://nextjs.org/icons/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="https://nextjs.org/icons/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="https://nextjs.org/icons/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
