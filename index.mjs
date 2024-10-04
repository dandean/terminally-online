#!/usr/bin/env node
// @ts-check
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Parser from "rss-parser";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * @typedef {Object} Feed
 * @property {string} lastBuildDate
 **/

/**
 * @typedef {Object} Item
 * @property {string} guid
 **/

/** @type {Parser<Feed,Item>} */
const parser = new Parser({
  customFields: {
    // Rename content:encoded as content:
    item: [["content:encoded", "content"]],
  },
});

let feed = await parser.parseURL("https://dandean.com/rss.xml");

/** @type {Set<string>} */
let cache = new Set();

const doNotSyncPath = join(__dirname, "do-not-sync.json");
if (existsSync(doNotSyncPath)) {
  const data = JSON.parse((await readFile(doNotSyncPath)).toString());
  cache = new Set(data);
}

console.log(cache);

await Promise.all(
  feed.items.map(async (item) => {
    if (cache.has(item.guid)) {
      return;
    }
    const result = await post(item);
    if (result) {
      cache.add(item.guid);
    }
  })
);

await writeFile(doNotSyncPath, JSON.stringify(Array.from(cache), null, 2));

/**
 * Posts a feed item to Mastodon
 * @param {Item} item
 * @returns {Promise<boolean>}
 */
async function post(item) {
  console.log(cache.has(item.guid), item.guid);
  return true;
}
