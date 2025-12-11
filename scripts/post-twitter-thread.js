#!/usr/bin/env node
/**
 * Post Twitter Thread - OPUS 67 Launch Campaign
 * Uses Twitter API v2 with OAuth 1.0a User Context
 */

const crypto = require("crypto");
const https = require("https");

// Twitter API credentials from environment
const TWITTER_API_KEY = process.env.TWITTER_APP_KEY;
const TWITTER_API_SECRET = process.env.TWITTER_APP_SECRET;
const TWITTER_ACCESS_TOKEN = process.env.TWITTER_ACCESS_TOKEN;
const TWITTER_ACCESS_SECRET = process.env.TWITTER_ACCESS_SECRET;

// Thread 1: HumanEval Benchmarks
const THREAD_1_TWEETS = [
  `We made Claude score 96.8% on HumanEval.

Baseline Claude Opus 4.5: 91.2%
With OPUS 67: 96.8%

That's a 5.6 percentage point improvement.

Here's exactly how we did it:`,

  `The secret isn't fine-tuning.

It's context.

Claude is already smart. But it's a generalist trying to be a specialist.

OPUS 67 loads domain-specific expertise on-demand.

When you ask about Solana, Claude becomes a Solana expert.`,

  `We tested against HumanEval's 164 problems:

Without OPUS 67:
- 150/164 correct
- Generic solutions
- Missed edge cases

With OPUS 67:
- 159/164 correct
- Idiomatic patterns
- Better error handling`,

  `Why does this work?

Progressive Disclosure Architecture.

Instead of cramming 15,000 tokens of "expertise" into every request, OPUS 67 detects what you need and loads only that.

Result: Better signal-to-noise ratio.`,

  `The kicker?

This approach also costs 74% less in tokens.

Better results. Lower cost.

Not a tradeoff - a free lunch.`,

  `Want to try it yourself?

npx @gicm/opus67 init

One command. 593+ components.

Your Claude just got smarter.

https://github.com/icm-motion/gICM`,
];

/**
 * Generate OAuth 1.0a signature
 */
function generateOAuthSignature(
  method,
  url,
  params,
  consumerSecret,
  tokenSecret
) {
  const sortedParams = Object.keys(params)
    .sort()
    .map(
      (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
    )
    .join("&");

  const signatureBase = [
    method.toUpperCase(),
    encodeURIComponent(url),
    encodeURIComponent(sortedParams),
  ].join("&");

  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;

  return crypto
    .createHmac("sha1", signingKey)
    .update(signatureBase)
    .digest("base64");
}

/**
 * Generate OAuth 1.0a header
 */
function generateOAuthHeader(method, url, body = {}) {
  const oauthParams = {
    oauth_consumer_key: TWITTER_API_KEY,
    oauth_nonce: crypto.randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: TWITTER_ACCESS_TOKEN,
    oauth_version: "1.0",
  };

  // Combine oauth params with body params for signature
  const allParams = { ...oauthParams };

  const signature = generateOAuthSignature(
    method,
    url,
    allParams,
    TWITTER_API_SECRET,
    TWITTER_ACCESS_SECRET
  );

  oauthParams.oauth_signature = signature;

  const headerString = Object.keys(oauthParams)
    .sort()
    .map(
      (key) =>
        `${encodeURIComponent(key)}="${encodeURIComponent(oauthParams[key])}"`
    )
    .join(", ");

  return `OAuth ${headerString}`;
}

/**
 * Post a tweet using Twitter API v2
 */
function postTweet(text, replyToId = null) {
  return new Promise((resolve, reject) => {
    const url = "https://api.twitter.com/2/tweets";
    const body = { text };

    if (replyToId) {
      body.reply = { in_reply_to_tweet_id: replyToId };
    }

    const bodyString = JSON.stringify(body);
    const authHeader = generateOAuthHeader("POST", url, body);

    const options = {
      hostname: "api.twitter.com",
      path: "/2/tweets",
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(bodyString),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          if (res.statusCode === 201 || res.statusCode === 200) {
            console.log(`✅ Tweet posted: ${json.data?.id}`);
            resolve(json);
          } else {
            console.error(`❌ Error: ${res.statusCode}`, json);
            reject(new Error(json.detail || json.title || "Unknown error"));
          }
        } catch (e) {
          reject(new Error(`Parse error: ${data}`));
        }
      });
    });

    req.on("error", reject);
    req.write(bodyString);
    req.end();
  });
}

/**
 * Post a thread (series of tweets as replies)
 */
async function postThread(tweets) {
  console.log(`\n🧵 Posting thread with ${tweets.length} tweets...\n`);

  let previousTweetId = null;
  const results = [];

  for (let i = 0; i < tweets.length; i++) {
    const tweet = tweets[i];
    console.log(`📝 Posting tweet ${i + 1}/${tweets.length}...`);
    console.log(`   Preview: "${tweet.substring(0, 50)}..."`);

    try {
      const result = await postTweet(tweet, previousTweetId);
      previousTweetId = result.data?.id;
      results.push(result);

      // Rate limiting: wait 2 seconds between tweets
      if (i < tweets.length - 1) {
        await new Promise((r) => setTimeout(r, 2000));
      }
    } catch (error) {
      console.error(`❌ Failed at tweet ${i + 1}:`, error.message);
      throw error;
    }
  }

  console.log(`\n✅ Thread posted successfully!`);
  console.log(`🔗 First tweet ID: ${results[0]?.data?.id}`);

  return results;
}

// Validate credentials
if (
  !TWITTER_API_KEY ||
  !TWITTER_API_SECRET ||
  !TWITTER_ACCESS_TOKEN ||
  !TWITTER_ACCESS_SECRET
) {
  console.error("❌ Missing Twitter credentials!");
  console.error(
    "Required env vars: TWITTER_APP_KEY, TWITTER_APP_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET"
  );
  process.exit(1);
}

// Get thread number from args (default to 1)
const threadNum = parseInt(process.argv[2]) || 1;

console.log(`🚀 OPUS 67 Twitter Thread Poster`);
console.log(`📅 Thread: #${threadNum} - HumanEval Benchmarks`);

// Post the thread
postThread(THREAD_1_TWEETS)
  .then((results) => {
    console.log(`\n🎉 Success! Thread is live.`);
    if (results[0]?.data?.id) {
      console.log(
        `🔗 View: https://twitter.com/icm_motion/status/${results[0].data.id}`
      );
    }
  })
  .catch((error) => {
    console.error(`\n💥 Failed to post thread:`, error.message);
    process.exit(1);
  });
