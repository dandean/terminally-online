#!/usr/bin/env node

import Parser from "rss-parser";
import { inspect } from "node:util";

/**
 * @typedef {Object} Feed
 * @property {string} lastBuildDate
 **/

/** @type {Parser<Feed,{}>} */
const parser = new Parser({
  customFields: {
    // rename content:encoded as content:
    item: [["content:encoded", "content"]],
  },
});

let feed = await parser.parseURL("https://dandean.com/rss.xml");

console.log(inspect(feed, false, 5, true));
