# API Key Rotation Checklist

**CRITICAL: Your keys were exposed in git history. Rotate ALL of them NOW.**

Run this checklist one by one. Check each box when done.

---

## 1. ANTHROPIC API KEY (2 instances)

- [ ] Go to: https://console.anthropic.com/settings/keys
- [ ] Click "Create Key" → Name it "gICM-Production-Dec2025"
- [ ] Copy the new key
- [ ] Go to Vercel → gICM project → Settings → Environment Variables
- [ ] Add: `ANTHROPIC_API_KEY` = your new key
- [ ] Add: `LLM_API_KEY` = your new key (same key)
- [ ] Back in Anthropic console → Delete the old key

**Old key prefix:** `sk-ant-api03-5gKPc...`

---

## 2. GITHUB PERSONAL ACCESS TOKEN

- [ ] Go to: https://github.com/settings/tokens
- [ ] Click "Generate new token (classic)"
- [ ] Name: "gICM-Production-Dec2025"
- [ ] Scopes: `repo`, `read:user`, `read:org`
- [ ] Generate → Copy
- [ ] Vercel: Add `GITHUB_TOKEN` = new token
- [ ] GitHub: Revoke the old token

**Old token prefix:** `ghp_qN7oLb...`

---

## 3. SOLANA WALLET (TRANSFER FUNDS FIRST!)

- [ ] Open Phantom/Solflare
- [ ] Create NEW wallet
- [ ] Copy the new wallet address
- [ ] TRANSFER all funds from old wallet to new wallet
- [ ] Export private key from new wallet (base58 format)
- [ ] Vercel: Add `GICM_PRIVATE_KEY` = new private key
- [ ] NEVER use the old wallet again

**Old wallet is COMPROMISED - anyone with git access can drain it**

---

## 4. TWITTER/X API (5 credentials)

- [ ] Go to: https://developer.twitter.com/en/portal/projects
- [ ] Select your app
- [ ] Keys and Tokens → Regenerate ALL:
  - [ ] API Key and Secret → Regenerate
  - [ ] Access Token and Secret → Regenerate
  - [ ] Bearer Token → Regenerate
- [ ] Vercel: Add all 5 Twitter env vars:
  - `TWITTER_APP_KEY`
  - `TWITTER_APP_SECRET`
  - `TWITTER_ACCESS_TOKEN`
  - `TWITTER_ACCESS_SECRET`
  - `TWITTER_BEARER_TOKEN`

---

## 5. HELIUS API KEY

- [ ] Go to: https://dashboard.helius.dev/
- [ ] API Keys → Create new key
- [ ] Copy new key
- [ ] Vercel: Add `HELIUS_API_KEY`
- [ ] Delete old key in Helius dashboard

**Old key prefix:** `86304771-91dc...`

---

## 6. GEMINI API KEY

- [ ] Go to: https://makersuite.google.com/app/apikey
- [ ] Create new API key
- [ ] Vercel: Add `GEMINI_API_KEY`
- [ ] Delete old key

**Old key prefix:** `AIzaSyDw6l7V...`

---

## 7. DEEPSEEK API KEY

- [ ] Go to: https://platform.deepseek.com/api_keys
- [ ] Create new key
- [ ] Vercel: Add `DEEPSEEK_API_KEY`
- [ ] Delete old key

**Old key prefix:** `sk-022b4aff...`

---

## 8. FAL.AI API KEY

- [ ] Go to: https://fal.ai/dashboard/keys
- [ ] Create new key
- [ ] Vercel: Add `FAL_API_KEY`
- [ ] Delete old key

**Old key format:** `7d99bf20-587a...`

---

## 9. SUPABASE (anon key is OK, but rotate for safety)

- [ ] Go to: https://supabase.com/dashboard
- [ ] Project Settings → API
- [ ] You can keep anon key (it's designed to be public)
- [ ] BUT add to Vercel for production:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 10. NEO4J AURA

- [ ] Go to: https://console.neo4j.io/
- [ ] Instance → Manage → Reset password
- [ ] Vercel: Add `NEO4J_PASSWORD`
- [ ] Also add: `NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_DATABASE`

**Old password exposed:** `r01HbcioZR...`

---

## 11. APIFY TOKEN

- [ ] Go to: https://console.apify.com/account/integrations
- [ ] API Tokens → Create new
- [ ] Vercel: Add `APIFY_TOKEN`
- [ ] Delete old token

**Old token prefix:** `apify_api_ifGS...`

---

## 12. VYBE NETWORK

- [ ] Go to: https://vybenetwork.xyz/
- [ ] Generate new API key
- [ ] Vercel: Add `VYBE_API_KEY`

---

## FINAL VERIFICATION

After rotating all keys:

1. [ ] Run `vercel env pull .env.local` to get production vars locally
2. [ ] Test the app locally with new keys
3. [ ] Deploy: `vercel --prod`
4. [ ] Verify live site works

---

## TIME ESTIMATE

- Quick (5 min each): Anthropic, Gemini, DeepSeek, Helius, fal.ai, Apify
- Medium (10 min): GitHub, Neo4j, Vybe
- Longer (15 min): Twitter/X (5 credentials), Solana wallet (fund transfer)

**Total: ~45 minutes if you go fast**

---

**IMPORTANT: DO NOT skip any keys. They are ALL exposed in git history.**
