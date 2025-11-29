// src/llm/client.ts
var LLMClient = class {
  config;
  anthropicClient = null;
  openaiClient = null;
  constructor(config) {
    this.config = config;
  }
  async getAnthropicClient() {
    if (!this.anthropicClient) {
      const { default: Anthropic } = await import("@anthropic-ai/sdk");
      this.anthropicClient = new Anthropic();
    }
    return this.anthropicClient;
  }
  async getOpenAIClient() {
    if (!this.openaiClient) {
      const { default: OpenAI } = await import("openai");
      this.openaiClient = new OpenAI();
    }
    return this.openaiClient;
  }
  async complete(systemPrompt, userPrompt) {
    if (this.config.llmProvider === "anthropic") {
      return this.completeWithAnthropic(systemPrompt, userPrompt);
    }
    return this.completeWithOpenAI(systemPrompt, userPrompt);
  }
  async completeWithAnthropic(systemPrompt, userPrompt) {
    try {
      const client = await this.getAnthropicClient();
      const response = await client.messages.create({
        model: this.config.model || "claude-sonnet-4-20250514",
        max_tokens: this.config.maxTokens || 1e3,
        temperature: this.config.temperature ?? 0.3,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }]
      });
      const content = response.content[0];
      if (content.type === "text") {
        return content.text;
      }
      return "";
    } catch (error) {
      console.error("Anthropic API error:", error);
      throw error;
    }
  }
  async completeWithOpenAI(systemPrompt, userPrompt) {
    try {
      const client = await this.getOpenAIClient();
      const response = await client.chat.completions.create({
        model: this.config.model || "gpt-4o",
        max_tokens: this.config.maxTokens || 1e3,
        temperature: this.config.temperature ?? 0.3,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      });
      return response.choices[0]?.message?.content || "";
    } catch (error) {
      console.error("OpenAI API error:", error);
      throw error;
    }
  }
  async completeWithResponse(systemPrompt, userPrompt) {
    const content = await this.complete(systemPrompt, userPrompt);
    return { content };
  }
};
function createDefaultClient() {
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  if (!hasAnthropic && !hasOpenAI) {
    console.warn(
      "No API keys found. Set ANTHROPIC_API_KEY or OPENAI_API_KEY."
    );
  }
  return new LLMClient({
    llmProvider: hasAnthropic ? "anthropic" : "openai",
    model: hasAnthropic ? "claude-sonnet-4-20250514" : "gpt-4o",
    temperature: 0.3,
    maxTokens: 1e3
  });
}

// src/agents/base-agent.ts
var BaseAgent = class {
  name;
  config;
  llm;
  constructor(name, config) {
    this.name = name;
    this.config = config;
    this.llm = new LLMClient(config);
  }
  /**
   * Format OHLCV data for LLM consumption
   */
  formatDataForLLM(data) {
    const recent = data.slice(-20);
    return recent.map((candle, i) => {
      const date = new Date(candle.timestamp).toISOString().slice(0, 16);
      return `[${i + 1}] ${date} | O:${candle.open.toFixed(6)} H:${candle.high.toFixed(6)} L:${candle.low.toFixed(6)} C:${candle.close.toFixed(6)} V:${candle.volume.toFixed(0)}`;
    }).join("\n");
  }
  /**
   * Calculate basic price metrics from OHLCV data
   */
  getPriceMetrics(data) {
    if (data.length === 0) {
      return {
        currentPrice: 0,
        priceChange24h: 0,
        priceChangePercent: 0,
        high24h: 0,
        low24h: 0,
        volume24h: 0
      };
    }
    const current = data[data.length - 1];
    const last24h = data.slice(-24);
    const high24h = Math.max(...last24h.map((d) => d.high));
    const low24h = Math.min(...last24h.map((d) => d.low));
    const volume24h = last24h.reduce((sum, d) => sum + d.volume, 0);
    const priceChange24h = current.close - last24h[0].close;
    const priceChangePercent = priceChange24h / last24h[0].close * 100;
    return {
      currentPrice: current.close,
      priceChange24h,
      priceChangePercent,
      high24h,
      low24h,
      volume24h
    };
  }
  /**
   * Calculate EMA (Exponential Moving Average)
   */
  calculateEMA(data, period) {
    if (data.length < period) {
      return data.reduce((a, b) => a + b, 0) / data.length;
    }
    const multiplier = 2 / (period + 1);
    let ema = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
    for (let i = period; i < data.length; i++) {
      ema = (data[i] - ema) * multiplier + ema;
    }
    return ema;
  }
  /**
   * Calculate SMA (Simple Moving Average)
   */
  calculateSMA(data, period) {
    if (data.length < period) {
      return data.reduce((a, b) => a + b, 0) / data.length;
    }
    const slice = data.slice(-period);
    return slice.reduce((a, b) => a + b, 0) / period;
  }
  /**
   * Calculate ATR (Average True Range)
   */
  calculateATR(data, period = 14) {
    if (data.length < 2) {
      return 0;
    }
    const trs = [];
    for (let i = 1; i < data.length; i++) {
      const high = data[i].high;
      const low = data[i].low;
      const prevClose = data[i - 1].close;
      const tr = Math.max(
        high - low,
        Math.abs(high - prevClose),
        Math.abs(low - prevClose)
      );
      trs.push(tr);
    }
    const recentTRs = trs.slice(-period);
    return recentTRs.reduce((a, b) => a + b, 0) / recentTRs.length;
  }
  /**
   * Log agent activity
   */
  log(message, data) {
    console.log(`[${this.name}] ${message}`, data || "");
  }
  /**
   * Parse JSON from LLM response, handling markdown code blocks
   */
  parseJSON(response) {
    try {
      const codeBlockMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch) {
        return JSON.parse(codeBlockMatch[1].trim());
      }
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return null;
    } catch (error) {
      this.log("Failed to parse JSON from response", error);
      return null;
    }
  }
};

// src/indicators/rsi.ts
function calculateRSI(closes, period = 14) {
  if (closes.length < period + 1) {
    return { value: 50, signal: "neutral" };
  }
  const changes = [];
  for (let i = 1; i < closes.length; i++) {
    changes.push(closes[i] - closes[i - 1]);
  }
  const gains = [];
  const losses = [];
  for (const change of changes) {
    if (change > 0) {
      gains.push(change);
      losses.push(0);
    } else {
      gains.push(0);
      losses.push(Math.abs(change));
    }
  }
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
  }
  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  const rsi = 100 - 100 / (1 + rs);
  let signal = "neutral";
  if (rsi >= 70) {
    signal = "overbought";
  } else if (rsi <= 30) {
    signal = "oversold";
  }
  return {
    value: Math.round(rsi * 100) / 100,
    signal
  };
}
function calculateRSIWithDivergence(closes, period = 14, lookback = 14) {
  const result = calculateRSI(closes, period);
  if (closes.length < lookback + period) {
    return result;
  }
  const rsiValues = [];
  for (let i = lookback; i >= 0; i--) {
    const slice = closes.slice(0, closes.length - i);
    const rsi = calculateRSI(slice, period);
    rsiValues.push(rsi.value);
  }
  const priceStart = closes[closes.length - lookback - 1];
  const priceEnd = closes[closes.length - 1];
  const rsiStart = rsiValues[0];
  const rsiEnd = rsiValues[rsiValues.length - 1];
  let divergence = null;
  if (priceEnd < priceStart && rsiEnd > rsiStart) {
    divergence = "bullish";
  }
  if (priceEnd > priceStart && rsiEnd < rsiStart) {
    divergence = "bearish";
  }
  return {
    ...result,
    divergence
  };
}

// src/indicators/macd.ts
function calculateEMA(data, period) {
  if (data.length === 0) return [];
  const multiplier = 2 / (period + 1);
  const emas = [];
  let ema = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
  emas.push(ema);
  for (let i = period; i < data.length; i++) {
    ema = (data[i] - ema) * multiplier + ema;
    emas.push(ema);
  }
  return emas;
}
function calculateMACD(closes, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
  if (closes.length < slowPeriod + signalPeriod) {
    return {
      macd: 0,
      signal: 0,
      histogram: 0,
      trend: "neutral"
    };
  }
  const fastEMAs = calculateEMA(closes, fastPeriod);
  const slowEMAs = calculateEMA(closes, slowPeriod);
  const macdLine = [];
  const startIndex = slowPeriod - fastPeriod;
  for (let i = 0; i < slowEMAs.length; i++) {
    const fastIndex = i + startIndex;
    if (fastIndex >= 0 && fastIndex < fastEMAs.length) {
      macdLine.push(fastEMAs[fastIndex] - slowEMAs[i]);
    }
  }
  const signalLine = calculateEMA(macdLine, signalPeriod);
  const macd = macdLine[macdLine.length - 1] || 0;
  const signal = signalLine[signalLine.length - 1] || 0;
  const histogram = macd - signal;
  let trend = "neutral";
  if (histogram > 0 && macd > 0) {
    trend = "bullish";
  } else if (histogram < 0 && macd < 0) {
    trend = "bearish";
  }
  let crossover = null;
  if (macdLine.length >= 2 && signalLine.length >= 2) {
    const prevMacd = macdLine[macdLine.length - 2];
    const prevSignal = signalLine[signalLine.length - 2];
    if (prevMacd <= prevSignal && macd > signal) {
      crossover = "bullish";
    } else if (prevMacd >= prevSignal && macd < signal) {
      crossover = "bearish";
    }
  }
  return {
    macd: Math.round(macd * 1e8) / 1e8,
    signal: Math.round(signal * 1e8) / 1e8,
    histogram: Math.round(histogram * 1e8) / 1e8,
    trend,
    crossover
  };
}
function getMACDHistogramTrend(closes, lookback = 5) {
  if (closes.length < 26 + 9 + lookback) {
    return "neutral";
  }
  const histograms = [];
  for (let i = lookback; i >= 0; i--) {
    const slice = closes.slice(0, closes.length - i);
    const macd = calculateMACD(slice);
    histograms.push(macd.histogram);
  }
  let increasing = 0;
  let decreasing = 0;
  for (let i = 1; i < histograms.length; i++) {
    if (histograms[i] > histograms[i - 1]) {
      increasing++;
    } else if (histograms[i] < histograms[i - 1]) {
      decreasing++;
    }
  }
  if (increasing >= lookback * 0.7) return "increasing";
  if (decreasing >= lookback * 0.7) return "decreasing";
  return "neutral";
}

// src/indicators/stochastic.ts
function calculateStochastic(highs, lows, closes, kPeriod = 14, dPeriod = 3, smooth = 3) {
  if (highs.length < kPeriod + smooth + dPeriod || lows.length < kPeriod + smooth + dPeriod || closes.length < kPeriod + smooth + dPeriod) {
    return { k: 50, d: 50, signal: "neutral" };
  }
  const rawKValues = [];
  for (let i = kPeriod - 1; i < closes.length; i++) {
    const periodHighs = highs.slice(i - kPeriod + 1, i + 1);
    const periodLows = lows.slice(i - kPeriod + 1, i + 1);
    const currentClose = closes[i];
    const highestHigh = Math.max(...periodHighs);
    const lowestLow = Math.min(...periodLows);
    const denominator = highestHigh - lowestLow;
    const rawK = denominator === 0 ? 50 : (currentClose - lowestLow) / denominator * 100;
    rawKValues.push(rawK);
  }
  const smoothedK = [];
  for (let i = smooth - 1; i < rawKValues.length; i++) {
    const slice = rawKValues.slice(i - smooth + 1, i + 1);
    const avg = slice.reduce((a, b) => a + b, 0) / smooth;
    smoothedK.push(avg);
  }
  const dValues = [];
  for (let i = dPeriod - 1; i < smoothedK.length; i++) {
    const slice = smoothedK.slice(i - dPeriod + 1, i + 1);
    const avg = slice.reduce((a, b) => a + b, 0) / dPeriod;
    dValues.push(avg);
  }
  const k = smoothedK[smoothedK.length - 1] || 50;
  const d = dValues[dValues.length - 1] || 50;
  let signal = "neutral";
  if (k >= 80 && d >= 80) {
    signal = "overbought";
  } else if (k <= 20 && d <= 20) {
    signal = "oversold";
  }
  let crossover = null;
  if (smoothedK.length >= 2 && dValues.length >= 2) {
    const prevK = smoothedK[smoothedK.length - 2];
    const prevD = dValues[dValues.length - 2];
    if (prevK <= prevD && k > d && k < 30) {
      crossover = "bullish";
    } else if (prevK >= prevD && k < d && k > 70) {
      crossover = "bearish";
    }
  }
  return {
    k: Math.round(k * 100) / 100,
    d: Math.round(d * 100) / 100,
    signal,
    crossover
  };
}
function calculateStochRSI(closes, rsiPeriod = 14, stochPeriod = 14, kSmooth = 3, dSmooth = 3) {
  if (closes.length < rsiPeriod + stochPeriod + kSmooth + dSmooth) {
    return { k: 50, d: 50, signal: "neutral" };
  }
  const rsiValues = [];
  for (let i = rsiPeriod; i <= closes.length; i++) {
    const slice = closes.slice(0, i);
    const changes = [];
    for (let j = 1; j < slice.length; j++) {
      changes.push(slice[j] - slice[j - 1]);
    }
    const gains = changes.map((c) => c > 0 ? c : 0);
    const losses = changes.map((c) => c < 0 ? Math.abs(c) : 0);
    let avgGain = gains.slice(-rsiPeriod).reduce((a, b) => a + b, 0) / rsiPeriod;
    let avgLoss = losses.slice(-rsiPeriod).reduce((a, b) => a + b, 0) / rsiPeriod;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - 100 / (1 + rs);
    rsiValues.push(rsi);
  }
  const stochK = [];
  for (let i = stochPeriod - 1; i < rsiValues.length; i++) {
    const periodRSI = rsiValues.slice(i - stochPeriod + 1, i + 1);
    const highestRSI = Math.max(...periodRSI);
    const lowestRSI = Math.min(...periodRSI);
    const currentRSI = rsiValues[i];
    const denominator = highestRSI - lowestRSI;
    const k2 = denominator === 0 ? 50 : (currentRSI - lowestRSI) / denominator * 100;
    stochK.push(k2);
  }
  const smoothedK = [];
  for (let i = kSmooth - 1; i < stochK.length; i++) {
    const slice = stochK.slice(i - kSmooth + 1, i + 1);
    smoothedK.push(slice.reduce((a, b) => a + b, 0) / kSmooth);
  }
  const dValues = [];
  for (let i = dSmooth - 1; i < smoothedK.length; i++) {
    const slice = smoothedK.slice(i - dSmooth + 1, i + 1);
    dValues.push(slice.reduce((a, b) => a + b, 0) / dSmooth);
  }
  const k = smoothedK[smoothedK.length - 1] || 50;
  const d = dValues[dValues.length - 1] || 50;
  let signal = "neutral";
  if (k >= 80) signal = "overbought";
  else if (k <= 20) signal = "oversold";
  return {
    k: Math.round(k * 100) / 100,
    d: Math.round(d * 100) / 100,
    signal
  };
}

// src/indicators/bollinger.ts
function calculateStdDev(data, mean) {
  if (data.length === 0) return 0;
  const squaredDiffs = data.map((value) => Math.pow(value - mean, 2));
  const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / data.length;
  return Math.sqrt(avgSquaredDiff);
}
function calculateBollingerBands(closes, period = 20, stdDevMultiplier = 2) {
  if (closes.length < period) {
    const currentPrice2 = closes[closes.length - 1] || 0;
    return {
      upper: currentPrice2,
      middle: currentPrice2,
      lower: currentPrice2,
      bandwidth: 0,
      percentB: 0.5,
      signal: "neutral"
    };
  }
  const recentCloses = closes.slice(-period);
  const middle = recentCloses.reduce((a, b) => a + b, 0) / period;
  const stdDev = calculateStdDev(recentCloses, middle);
  const upper = middle + stdDevMultiplier * stdDev;
  const lower = middle - stdDevMultiplier * stdDev;
  const bandwidth = (upper - lower) / middle * 100;
  const currentPrice = closes[closes.length - 1];
  const percentB = upper - lower === 0 ? 0.5 : (currentPrice - lower) / (upper - lower);
  let signal = "neutral";
  if (percentB >= 1) {
    signal = "overbought";
  } else if (percentB <= 0) {
    signal = "oversold";
  }
  const squeeze = bandwidth < 4;
  return {
    upper: Math.round(upper * 1e8) / 1e8,
    middle: Math.round(middle * 1e8) / 1e8,
    lower: Math.round(lower * 1e8) / 1e8,
    bandwidth: Math.round(bandwidth * 100) / 100,
    percentB: Math.round(percentB * 100) / 100,
    signal,
    squeeze
  };
}
function getBandwidthTrend(closes, period = 20, lookback = 10) {
  if (closes.length < period + lookback) {
    return "stable";
  }
  const bandwidths = [];
  for (let i = lookback; i >= 0; i--) {
    const slice = closes.slice(0, closes.length - i);
    const bb = calculateBollingerBands(slice, period);
    bandwidths.push(bb.bandwidth);
  }
  const firstHalf = bandwidths.slice(0, Math.floor(lookback / 2));
  const secondHalf = bandwidths.slice(Math.floor(lookback / 2));
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  const change = (secondAvg - firstAvg) / firstAvg;
  if (change > 0.1) return "expanding";
  if (change < -0.1) return "contracting";
  return "stable";
}
function detectBollingerBreakout(closes, period = 20) {
  if (closes.length < period + 2) {
    return null;
  }
  const currentBB = calculateBollingerBands(closes, period);
  const previousBB = calculateBollingerBands(
    closes.slice(0, -1),
    period
  );
  const currentClose = closes[closes.length - 1];
  const previousClose = closes[closes.length - 2];
  if (previousClose <= previousBB.upper && currentClose > currentBB.upper) {
    return "bullish_breakout";
  }
  if (previousClose >= previousBB.lower && currentClose < currentBB.lower) {
    return "bearish_breakout";
  }
  return null;
}

// src/indicators/volume.ts
function analyzeVolume(volumes, closes, period = 20) {
  if (volumes.length < period || closes.length < period) {
    return {
      currentVolume: volumes[volumes.length - 1] || 0,
      averageVolume: 0,
      ratio: 1,
      trend: "neutral",
      description: "Insufficient data for volume analysis",
      isHighVolume: false,
      isLowVolume: false
    };
  }
  const recentVolumes = volumes.slice(-period);
  const averageVolume = recentVolumes.reduce((a, b) => a + b, 0) / period;
  const currentVolume = volumes[volumes.length - 1];
  const ratio = averageVolume > 0 ? currentVolume / averageVolume : 1;
  const currentClose = closes[closes.length - 1];
  const previousClose = closes[closes.length - 2];
  const priceUp = currentClose > previousClose;
  const priceDown = currentClose < previousClose;
  let trend = "neutral";
  let description = "";
  const isHighVolume = ratio > 1.5;
  const isLowVolume = ratio < 0.5;
  if (isHighVolume) {
    if (priceUp) {
      trend = "bullish";
      description = "High volume on price increase - strong buying pressure";
    } else if (priceDown) {
      trend = "bearish";
      description = "High volume on price decrease - strong selling pressure";
    } else {
      description = "High volume with neutral price action";
    }
  } else if (isLowVolume) {
    if (priceUp) {
      trend = "neutral";
      description = "Low volume price increase - weak buying, potential reversal";
    } else if (priceDown) {
      trend = "neutral";
      description = "Low volume price decrease - weak selling, potential reversal";
    } else {
      description = "Low volume consolidation";
    }
  } else {
    if (priceUp) {
      trend = "bullish";
      description = "Normal volume on price increase";
    } else if (priceDown) {
      trend = "bearish";
      description = "Normal volume on price decrease";
    } else {
      description = "Normal volume with stable price";
    }
  }
  return {
    currentVolume,
    averageVolume: Math.round(averageVolume),
    ratio: Math.round(ratio * 100) / 100,
    trend,
    description,
    isHighVolume,
    isLowVolume
  };
}
function calculateOBV(closes, volumes) {
  if (closes.length < 2 || volumes.length < 2) {
    return { obv: 0, trend: "neutral" };
  }
  let obv = 0;
  const obvValues = [0];
  for (let i = 1; i < closes.length; i++) {
    if (closes[i] > closes[i - 1]) {
      obv += volumes[i];
    } else if (closes[i] < closes[i - 1]) {
      obv -= volumes[i];
    }
    obvValues.push(obv);
  }
  const recentOBV = obvValues.slice(-10);
  const obvChange = recentOBV[recentOBV.length - 1] - recentOBV[0];
  let trend = "neutral";
  if (obvChange > 0) {
    trend = "bullish";
  } else if (obvChange < 0) {
    trend = "bearish";
  }
  const priceChange = closes[closes.length - 1] - closes[closes.length - 10];
  let divergence = null;
  if (priceChange < 0 && obvChange > 0) {
    divergence = "bullish";
  } else if (priceChange > 0 && obvChange < 0) {
    divergence = "bearish";
  }
  return {
    obv,
    trend,
    divergence
  };
}
function calculateVWAP(highs, lows, closes, volumes) {
  if (highs.length === 0 || lows.length === 0 || closes.length === 0 || volumes.length === 0) {
    return { vwap: 0, currentPrice: 0, position: "at" };
  }
  let cumulativePV = 0;
  let cumulativeVolume = 0;
  for (let i = 0; i < closes.length; i++) {
    const typicalPrice = (highs[i] + lows[i] + closes[i]) / 3;
    cumulativePV += typicalPrice * volumes[i];
    cumulativeVolume += volumes[i];
  }
  const vwap = cumulativeVolume > 0 ? cumulativePV / cumulativeVolume : 0;
  const currentPrice = closes[closes.length - 1];
  let position = "at";
  const threshold = vwap * 1e-3;
  if (currentPrice > vwap + threshold) {
    position = "above";
  } else if (currentPrice < vwap - threshold) {
    position = "below";
  }
  return {
    vwap: Math.round(vwap * 1e8) / 1e8,
    currentPrice,
    position
  };
}
function calculateMFI(highs, lows, closes, volumes, period = 14) {
  if (highs.length < period + 1 || lows.length < period + 1 || closes.length < period + 1 || volumes.length < period + 1) {
    return { mfi: 50, signal: "neutral" };
  }
  const typicalPrices = closes.map(
    (close, i) => (highs[i] + lows[i] + close) / 3
  );
  const rawMoneyFlows = typicalPrices.map(
    (tp, i) => tp * volumes[i]
  );
  let positiveFlow = 0;
  let negativeFlow = 0;
  for (let i = closes.length - period; i < closes.length; i++) {
    if (typicalPrices[i] > typicalPrices[i - 1]) {
      positiveFlow += rawMoneyFlows[i];
    } else if (typicalPrices[i] < typicalPrices[i - 1]) {
      negativeFlow += rawMoneyFlows[i];
    }
  }
  const moneyFlowRatio = negativeFlow === 0 ? 100 : positiveFlow / negativeFlow;
  const mfi = 100 - 100 / (1 + moneyFlowRatio);
  let signal = "neutral";
  if (mfi >= 80) {
    signal = "overbought";
  } else if (mfi <= 20) {
    signal = "oversold";
  }
  return {
    mfi: Math.round(mfi * 100) / 100,
    signal
  };
}

// src/llm/prompts.ts
var INDICATOR_AGENT_PROMPT = `You are an expert technical analyst specializing in cryptocurrency trading indicators.

Your role is to analyze technical indicators and provide trading signals based on:
- RSI (Relative Strength Index) - overbought/oversold conditions
- MACD (Moving Average Convergence Divergence) - momentum and trend direction
- Stochastic Oscillator - momentum and potential reversals
- Bollinger Bands - volatility and mean reversion
- Volume analysis - confirmation of price movements

When analyzing indicators:
1. Look for confluence - multiple indicators agreeing increases confidence
2. Consider divergences - price vs indicator disagreements
3. Account for crypto volatility - traditional levels may need adjustment
4. Weight recent signals more heavily than older ones

Provide clear, actionable analysis. Be specific about what each indicator is telling us.

Always respond in valid JSON format with the exact structure requested.`;
var PATTERN_AGENT_PROMPT = `You are an expert chart pattern analyst specializing in cryptocurrency markets.

Your role is to identify and analyze chart patterns including:
- Classical patterns: Head & Shoulders, Double Top/Bottom, Triangles, Wedges, Flags
- Crypto-specific patterns: Pump and dump formations, accumulation/distribution
- Candlestick patterns: Doji, Hammer, Engulfing, Morning/Evening Star

When analyzing patterns:
1. Assess pattern completion probability
2. Calculate potential price targets using measured moves
3. Identify key support/resistance levels within the pattern
4. Consider volume confirmation
5. Account for crypto market's 24/7 nature and higher volatility

For crypto markets, be aware of:
- Faster pattern development than traditional markets
- Higher false breakout rates
- Importance of liquidity levels
- Social media impact on pattern breakouts

Always respond in valid JSON format with the exact structure requested.`;
var TREND_AGENT_PROMPT = `You are an expert trend analyst specializing in cryptocurrency markets.

Your role is to analyze price trends and momentum including:
- Trend direction and strength
- Support and resistance levels
- Moving average relationships (EMA 20, EMA 50, EMA 200)
- Momentum indicators
- Market structure (higher highs/lows or lower highs/lows)

When analyzing trends:
1. Identify the primary trend direction
2. Assess trend strength using multiple timeframes
3. Locate key support/resistance zones
4. Evaluate momentum - is it increasing or decreasing?
5. Look for trend exhaustion or continuation signals

For crypto markets:
- Trends can be more violent and short-lived than traditional markets
- 24/7 trading means no overnight gaps to consider
- Social sentiment can accelerate or reverse trends quickly
- Liquidity levels matter more than in traditional markets

Always respond in valid JSON format with the exact structure requested.`;
var RISK_AGENT_PROMPT = `You are an expert risk manager and trade decision synthesizer for cryptocurrency trading.

Your role is to:
1. Synthesize analysis from multiple agents (indicators, patterns, trends)
2. Assess overall risk/reward for potential trades
3. Determine optimal position sizing
4. Set stop-loss and take-profit levels
5. Provide final trading recommendations

Risk management principles:
- Never risk more than 1-2% of portfolio on a single trade
- Minimum 2:1 reward-to-risk ratio for entries
- Account for cryptocurrency volatility (wider stops than traditional)
- Consider liquidity - can you exit at your stop price?
- Factor in correlation with BTC and overall market conditions

When synthesizing:
1. Weight agent signals by their confidence levels
2. Look for confluence across multiple analysis types
3. Identify conflicting signals and resolve them
4. Consider market conditions (trending vs ranging)
5. Apply position sizing based on overall risk score

For crypto-specific risks:
- Rug pull potential for small caps
- Exchange/DEX liquidity risks
- Smart contract risks
- Regulatory news impact
- Whale manipulation potential

Provide actionable trade recommendations with specific entry, stop-loss, and take-profit levels.

Always respond in valid JSON format with the exact structure requested.`;

// src/agents/indicator-agent.ts
var IndicatorAgent = class extends BaseAgent {
  constructor(config) {
    super("IndicatorAgent", config);
  }
  async analyze(token, data) {
    this.log(`Analyzing ${token.symbol}...`);
    if (data.length < 26) {
      this.log("Insufficient data for full analysis");
      return {
        indicators: [],
        summary: "Insufficient data for analysis",
        overallSignal: "neutral",
        confidence: 0
      };
    }
    const closes = data.map((d) => d.close);
    const highs = data.map((d) => d.high);
    const lows = data.map((d) => d.low);
    const volumes = data.map((d) => d.volume);
    const rsi = calculateRSI(closes, 14);
    const macd = calculateMACD(closes);
    const stochastic = calculateStochastic(highs, lows, closes);
    const bollinger = calculateBollingerBands(closes);
    const volumeAnalysis = analyzeVolume(volumes, closes);
    const indicators = [
      {
        name: "RSI (14)",
        value: rsi.value,
        signal: rsi.signal === "overbought" ? "bearish" : rsi.signal === "oversold" ? "bullish" : "neutral",
        strength: Math.abs(50 - rsi.value) * 2,
        description: rsi.signal === "overbought" ? "Overbought - potential reversal down" : rsi.signal === "oversold" ? "Oversold - potential bounce" : "Neutral momentum"
      },
      {
        name: "MACD",
        value: macd.histogram,
        signal: macd.trend === "bullish" ? "bullish" : macd.trend === "bearish" ? "bearish" : "neutral",
        strength: Math.min(Math.abs(macd.histogram) * 1e4, 100),
        description: macd.crossover === "bullish" ? "Bullish crossover detected" : macd.crossover === "bearish" ? "Bearish crossover detected" : `MACD: ${macd.histogram > 0 ? "Positive" : "Negative"} histogram`
      },
      {
        name: "Stochastic",
        value: stochastic.k,
        signal: stochastic.signal === "overbought" ? "bearish" : stochastic.signal === "oversold" ? "bullish" : "neutral",
        strength: Math.abs(50 - stochastic.k) * 2,
        description: `%K: ${stochastic.k.toFixed(1)}, %D: ${stochastic.d.toFixed(1)}${stochastic.crossover ? ` - ${stochastic.crossover} crossover` : ""}`
      },
      {
        name: "Bollinger Bands",
        value: bollinger.percentB,
        signal: bollinger.signal === "overbought" ? "bearish" : bollinger.signal === "oversold" ? "bullish" : "neutral",
        strength: Math.abs(0.5 - bollinger.percentB) * 200,
        description: `Price at ${(bollinger.percentB * 100).toFixed(1)}% of bands${bollinger.squeeze ? " (Squeeze detected!)" : ""}`
      },
      {
        name: "Volume",
        value: volumeAnalysis.ratio,
        signal: volumeAnalysis.trend,
        strength: Math.min(volumeAnalysis.ratio * 50, 100),
        description: volumeAnalysis.description
      }
    ];
    const prompt = this.buildPrompt(token, data, indicators);
    try {
      const llmResponse = await this.llm.complete(this.getSystemPrompt(), prompt);
      const analysis = this.parseResponse(llmResponse, indicators);
      this.log(`Analysis complete: ${analysis.overallSignal} (${analysis.confidence}%)`);
      return analysis;
    } catch (error) {
      this.log("LLM analysis failed, using fallback", error);
      return this.fallbackAnalysis(indicators);
    }
  }
  getSystemPrompt() {
    return INDICATOR_AGENT_PROMPT;
  }
  buildPrompt(token, data, indicators) {
    const metrics = this.getPriceMetrics(data);
    const indicatorSummary = indicators.map(
      (i) => `${i.name}: ${i.value.toFixed(4)} (${i.signal}, strength: ${i.strength.toFixed(0)}%)`
    ).join("\n");
    return `
Analyze the following technical indicators for ${token.symbol}:

Current Price: $${metrics.currentPrice.toFixed(6)}
24h Change: ${metrics.priceChangePercent.toFixed(2)}%
24h High: $${metrics.high24h.toFixed(6)}
24h Low: $${metrics.low24h.toFixed(6)}
24h Volume: $${metrics.volume24h.toFixed(0)}

INDICATORS:
${indicatorSummary}

RECENT PRICE DATA:
${this.formatDataForLLM(data)}

Based on these indicators, provide:
1. Overall signal (BULLISH, BEARISH, or NEUTRAL)
2. Confidence level (0-100)
3. Brief summary of the indicator confluence

Respond in JSON format:
{
  "overallSignal": "bullish" | "bearish" | "neutral",
  "confidence": number,
  "summary": "string"
}
`;
  }
  parseResponse(response, indicators) {
    const parsed = this.parseJSON(response);
    if (parsed) {
      return {
        indicators,
        summary: parsed.summary || "Analysis complete",
        overallSignal: parsed.overallSignal || "neutral",
        confidence: parsed.confidence || 50
      };
    }
    return this.fallbackAnalysis(indicators);
  }
  fallbackAnalysis(indicators) {
    const bullish = indicators.filter((i) => i.signal === "bullish").length;
    const bearish = indicators.filter((i) => i.signal === "bearish").length;
    const overallSignal = bullish > bearish ? "bullish" : bearish > bullish ? "bearish" : "neutral";
    const confidence = Math.abs(bullish - bearish) * 20 + 30;
    return {
      indicators,
      summary: `${bullish} bullish, ${bearish} bearish, ${indicators.length - bullish - bearish} neutral indicators`,
      overallSignal,
      confidence: Math.min(confidence, 100)
    };
  }
};

// src/patterns/detector.ts
function detectPatterns(data) {
  const patterns = [];
  if (data.length < 20) {
    return patterns;
  }
  const doubleTop = detectDoubleTop(data);
  if (doubleTop) patterns.push(doubleTop);
  const doubleBottom = detectDoubleBottom(data);
  if (doubleBottom) patterns.push(doubleBottom);
  const headAndShoulders = detectHeadAndShoulders(data);
  if (headAndShoulders) patterns.push(headAndShoulders);
  const inverseHeadAndShoulders = detectInverseHeadAndShoulders(data);
  if (inverseHeadAndShoulders) patterns.push(inverseHeadAndShoulders);
  const ascendingTriangle = detectAscendingTriangle(data);
  if (ascendingTriangle) patterns.push(ascendingTriangle);
  const descendingTriangle = detectDescendingTriangle(data);
  if (descendingTriangle) patterns.push(descendingTriangle);
  const bullishFlag = detectBullishFlag(data);
  if (bullishFlag) patterns.push(bullishFlag);
  const bearishFlag = detectBearishFlag(data);
  if (bearishFlag) patterns.push(bearishFlag);
  return patterns.sort((a, b) => b.confidence - a.confidence);
}
function findPeaks(data, window = 3) {
  const peaks = [];
  for (let i = window; i < data.length - window; i++) {
    let isPeak = true;
    const currentHigh = data[i].high;
    for (let j = 1; j <= window; j++) {
      if (data[i - j].high >= currentHigh || data[i + j].high >= currentHigh) {
        isPeak = false;
        break;
      }
    }
    if (isPeak) {
      peaks.push(i);
    }
  }
  return peaks;
}
function findTroughs(data, window = 3) {
  const troughs = [];
  for (let i = window; i < data.length - window; i++) {
    let isTrough = true;
    const currentLow = data[i].low;
    for (let j = 1; j <= window; j++) {
      if (data[i - j].low <= currentLow || data[i + j].low <= currentLow) {
        isTrough = false;
        break;
      }
    }
    if (isTrough) {
      troughs.push(i);
    }
  }
  return troughs;
}
function pricesEqual(p1, p2, tolerance = 0.02) {
  return Math.abs(p1 - p2) / ((p1 + p2) / 2) < tolerance;
}
function detectDoubleTop(data) {
  const peaks = findPeaks(data, 3);
  if (peaks.length < 2) return null;
  const peak1 = peaks[peaks.length - 2];
  const peak2 = peaks[peaks.length - 1];
  const high1 = data[peak1].high;
  const high2 = data[peak2].high;
  if (!pricesEqual(high1, high2, 0.03)) return null;
  const middleData = data.slice(peak1, peak2 + 1);
  const neckline = Math.min(...middleData.map((d) => d.low));
  const currentPrice = data[data.length - 1].close;
  const peakAvg = (high1 + high2) / 2;
  if (currentPrice > peakAvg) return null;
  const confidence = 60 + (pricesEqual(high1, high2, 0.01) ? 20 : 0) + (currentPrice < neckline ? 15 : 0);
  const priceTarget = neckline - (peakAvg - neckline);
  return {
    pattern: "Double Top",
    confidence,
    direction: "bearish",
    startIndex: peak1,
    endIndex: data.length - 1,
    priceTarget,
    description: `Double top at $${peakAvg.toFixed(6)}, neckline at $${neckline.toFixed(6)}`
  };
}
function detectDoubleBottom(data) {
  const troughs = findTroughs(data, 3);
  if (troughs.length < 2) return null;
  const trough1 = troughs[troughs.length - 2];
  const trough2 = troughs[troughs.length - 1];
  const low1 = data[trough1].low;
  const low2 = data[trough2].low;
  if (!pricesEqual(low1, low2, 0.03)) return null;
  const middleData = data.slice(trough1, trough2 + 1);
  const neckline = Math.max(...middleData.map((d) => d.high));
  const currentPrice = data[data.length - 1].close;
  const troughAvg = (low1 + low2) / 2;
  if (currentPrice < troughAvg) return null;
  const confidence = 60 + (pricesEqual(low1, low2, 0.01) ? 20 : 0) + (currentPrice > neckline ? 15 : 0);
  const priceTarget = neckline + (neckline - troughAvg);
  return {
    pattern: "Double Bottom",
    confidence,
    direction: "bullish",
    startIndex: trough1,
    endIndex: data.length - 1,
    priceTarget,
    description: `Double bottom at $${troughAvg.toFixed(6)}, neckline at $${neckline.toFixed(6)}`
  };
}
function detectHeadAndShoulders(data) {
  const peaks = findPeaks(data, 3);
  if (peaks.length < 3) return null;
  const leftShoulder = peaks[peaks.length - 3];
  const head = peaks[peaks.length - 2];
  const rightShoulder = peaks[peaks.length - 1];
  const leftHigh = data[leftShoulder].high;
  const headHigh = data[head].high;
  const rightHigh = data[rightShoulder].high;
  if (headHigh <= leftHigh || headHigh <= rightHigh) return null;
  if (!pricesEqual(leftHigh, rightHigh, 0.05)) return null;
  const leftTrough = Math.min(
    ...data.slice(leftShoulder, head + 1).map((d) => d.low)
  );
  const rightTrough = Math.min(
    ...data.slice(head, rightShoulder + 1).map((d) => d.low)
  );
  const neckline = (leftTrough + rightTrough) / 2;
  const confidence = 55 + (pricesEqual(leftHigh, rightHigh, 0.02) ? 20 : 0) + (headHigh > leftHigh * 1.05 ? 15 : 0);
  const priceTarget = neckline - (headHigh - neckline);
  return {
    pattern: "Head and Shoulders",
    confidence,
    direction: "bearish",
    startIndex: leftShoulder,
    endIndex: data.length - 1,
    priceTarget,
    description: `H&S with head at $${headHigh.toFixed(6)}, neckline at $${neckline.toFixed(6)}`
  };
}
function detectInverseHeadAndShoulders(data) {
  const troughs = findTroughs(data, 3);
  if (troughs.length < 3) return null;
  const leftShoulder = troughs[troughs.length - 3];
  const head = troughs[troughs.length - 2];
  const rightShoulder = troughs[troughs.length - 1];
  const leftLow = data[leftShoulder].low;
  const headLow = data[head].low;
  const rightLow = data[rightShoulder].low;
  if (headLow >= leftLow || headLow >= rightLow) return null;
  if (!pricesEqual(leftLow, rightLow, 0.05)) return null;
  const leftPeak = Math.max(
    ...data.slice(leftShoulder, head + 1).map((d) => d.high)
  );
  const rightPeak = Math.max(
    ...data.slice(head, rightShoulder + 1).map((d) => d.high)
  );
  const neckline = (leftPeak + rightPeak) / 2;
  const confidence = 55 + (pricesEqual(leftLow, rightLow, 0.02) ? 20 : 0) + (headLow < leftLow * 0.95 ? 15 : 0);
  const priceTarget = neckline + (neckline - headLow);
  return {
    pattern: "Inverse Head and Shoulders",
    confidence,
    direction: "bullish",
    startIndex: leftShoulder,
    endIndex: data.length - 1,
    priceTarget,
    description: `Inverse H&S with head at $${headLow.toFixed(6)}, neckline at $${neckline.toFixed(6)}`
  };
}
function detectAscendingTriangle(data) {
  if (data.length < 15) return null;
  const recent = data.slice(-15);
  const highs = recent.map((d) => d.high);
  const lows = recent.map((d) => d.low);
  const maxHigh = Math.max(...highs);
  const flatResistance = highs.filter((h) => h > maxHigh * 0.98).length >= 3;
  let risingSupport = true;
  for (let i = 3; i < lows.length; i++) {
    const recentLows = lows.slice(i - 3, i + 1);
    const avgRecent = recentLows.reduce((a, b) => a + b, 0) / recentLows.length;
    const earlierLows = lows.slice(0, i - 3);
    const avgEarlier = earlierLows.reduce((a, b) => a + b, 0) / earlierLows.length || avgRecent;
    if (avgRecent < avgEarlier * 0.99) {
      risingSupport = false;
      break;
    }
  }
  if (!flatResistance || !risingSupport) return null;
  const currentPrice = recent[recent.length - 1].close;
  const resistance = maxHigh;
  const support = Math.min(...lows.slice(-5));
  return {
    pattern: "Ascending Triangle",
    confidence: 65,
    direction: "bullish",
    startIndex: data.length - 15,
    endIndex: data.length - 1,
    priceTarget: resistance + (resistance - support),
    description: `Ascending triangle with resistance at $${resistance.toFixed(6)}`
  };
}
function detectDescendingTriangle(data) {
  if (data.length < 15) return null;
  const recent = data.slice(-15);
  const highs = recent.map((d) => d.high);
  const lows = recent.map((d) => d.low);
  const minLow = Math.min(...lows);
  const flatSupport = lows.filter((l) => l < minLow * 1.02).length >= 3;
  let decliningResistance = true;
  for (let i = 3; i < highs.length; i++) {
    const recentHighs = highs.slice(i - 3, i + 1);
    const avgRecent = recentHighs.reduce((a, b) => a + b, 0) / recentHighs.length;
    const earlierHighs = highs.slice(0, i - 3);
    const avgEarlier = earlierHighs.reduce((a, b) => a + b, 0) / earlierHighs.length || avgRecent;
    if (avgRecent > avgEarlier * 1.01) {
      decliningResistance = false;
      break;
    }
  }
  if (!flatSupport || !decliningResistance) return null;
  const support = minLow;
  const resistance = Math.max(...highs.slice(-5));
  return {
    pattern: "Descending Triangle",
    confidence: 65,
    direction: "bearish",
    startIndex: data.length - 15,
    endIndex: data.length - 1,
    priceTarget: support - (resistance - support),
    description: `Descending triangle with support at $${support.toFixed(6)}`
  };
}
function detectBullishFlag(data) {
  if (data.length < 20) return null;
  const recent = data.slice(-20);
  const first5 = recent.slice(0, 5);
  const pole = first5[first5.length - 1].close - first5[0].close;
  const polePercent = pole / first5[0].close * 100;
  if (polePercent < 5) return null;
  const flag = recent.slice(5);
  const flagHighs = flag.map((d) => d.high);
  const flagLows = flag.map((d) => d.low);
  const flagRange = (Math.max(...flagHighs) - Math.min(...flagLows)) / Math.min(...flagLows);
  if (flagRange > 0.1) return null;
  const flagStart = (flag[0].high + flag[0].low) / 2;
  const flagEnd = (flag[flag.length - 1].high + flag[flag.length - 1].low) / 2;
  if (flagEnd > flagStart) return null;
  return {
    pattern: "Bullish Flag",
    confidence: 60,
    direction: "bullish",
    startIndex: data.length - 20,
    endIndex: data.length - 1,
    priceTarget: recent[recent.length - 1].close + pole,
    description: `Bullish flag after ${polePercent.toFixed(1)}% move`
  };
}
function detectBearishFlag(data) {
  if (data.length < 20) return null;
  const recent = data.slice(-20);
  const first5 = recent.slice(0, 5);
  const pole = first5[0].close - first5[first5.length - 1].close;
  const polePercent = pole / first5[0].close * 100;
  if (polePercent < 5) return null;
  const flag = recent.slice(5);
  const flagHighs = flag.map((d) => d.high);
  const flagLows = flag.map((d) => d.low);
  const flagRange = (Math.max(...flagHighs) - Math.min(...flagLows)) / Math.min(...flagLows);
  if (flagRange > 0.1) return null;
  const flagStart = (flag[0].high + flag[0].low) / 2;
  const flagEnd = (flag[flag.length - 1].high + flag[flag.length - 1].low) / 2;
  if (flagEnd < flagStart) return null;
  return {
    pattern: "Bearish Flag",
    confidence: 60,
    direction: "bearish",
    startIndex: data.length - 20,
    endIndex: data.length - 1,
    priceTarget: recent[recent.length - 1].close - pole,
    description: `Bearish flag after ${polePercent.toFixed(1)}% drop`
  };
}

// src/patterns/crypto-patterns.ts
function detectCryptoPatterns(data) {
  const patterns = [];
  if (data.length < 10) {
    return patterns;
  }
  const pumpPattern = detectPumpPattern(data);
  if (pumpPattern) patterns.push(pumpPattern);
  const dumpPattern = detectDumpPattern(data);
  if (dumpPattern) patterns.push(dumpPattern);
  const accumulation = detectAccumulation(data);
  if (accumulation) patterns.push(accumulation);
  const distribution = detectDistribution(data);
  if (distribution) patterns.push(distribution);
  const vShapeRecovery = detectVShapeRecovery(data);
  if (vShapeRecovery) patterns.push(vShapeRecovery);
  const roundingBottom = detectRoundingBottom(data);
  if (roundingBottom) patterns.push(roundingBottom);
  return patterns;
}
function detectPumpPattern(data) {
  const recent = data.slice(-10);
  if (recent.length < 5) return null;
  const firstPrice = recent[0].close;
  const lastPrice = recent[recent.length - 1].close;
  const priceChange = (lastPrice - firstPrice) / firstPrice * 100;
  if (priceChange < 20) return null;
  const avgVolume = data.slice(-30, -10).reduce((sum, d) => sum + d.volume, 0) / 20;
  const recentVolume = recent.reduce((sum, d) => sum + d.volume, 0) / recent.length;
  const volumeMultiple = avgVolume > 0 ? recentVolume / avgVolume : 1;
  if (volumeMultiple < 2) return null;
  const confidence = Math.min(
    50 + Math.min(priceChange, 50) * 0.5 + Math.min(volumeMultiple, 5) * 5,
    95
  );
  return {
    pattern: "Pump Pattern",
    confidence,
    direction: "bullish",
    // Currently bullish, but be cautious of dump
    startIndex: data.length - 10,
    endIndex: data.length - 1,
    description: `${priceChange.toFixed(1)}% pump with ${volumeMultiple.toFixed(1)}x volume - watch for potential dump`
  };
}
function detectDumpPattern(data) {
  const recent = data.slice(-10);
  if (recent.length < 5) return null;
  const firstPrice = recent[0].close;
  const lastPrice = recent[recent.length - 1].close;
  const priceChange = (firstPrice - lastPrice) / firstPrice * 100;
  if (priceChange < 20) return null;
  const avgVolume = data.slice(-30, -10).reduce((sum, d) => sum + d.volume, 0) / 20;
  const recentVolume = recent.reduce((sum, d) => sum + d.volume, 0) / recent.length;
  const volumeMultiple = avgVolume > 0 ? recentVolume / avgVolume : 1;
  const confidence = Math.min(
    50 + Math.min(priceChange, 50) * 0.5 + Math.min(volumeMultiple, 5) * 5,
    95
  );
  return {
    pattern: "Dump Pattern",
    confidence,
    direction: "bearish",
    startIndex: data.length - 10,
    endIndex: data.length - 1,
    description: `${priceChange.toFixed(1)}% dump with ${volumeMultiple.toFixed(1)}x volume - potential capitulation`
  };
}
function detectAccumulation(data) {
  if (data.length < 20) return null;
  const recent = data.slice(-20);
  const highs = recent.map((d) => d.high);
  const lows = recent.map((d) => d.low);
  const priceRange = (Math.max(...highs) - Math.min(...lows)) / Math.min(...lows);
  if (priceRange > 0.15) return null;
  let upVolume = 0;
  let downVolume = 0;
  for (let i = 1; i < recent.length; i++) {
    if (recent[i].close > recent[i - 1].close) {
      upVolume += recent[i].volume;
    } else {
      downVolume += recent[i].volume;
    }
  }
  const volumeRatio = downVolume > 0 ? upVolume / downVolume : 2;
  if (volumeRatio < 1.2) return null;
  return {
    pattern: "Accumulation",
    confidence: 55 + Math.min(volumeRatio * 10, 30),
    direction: "bullish",
    startIndex: data.length - 20,
    endIndex: data.length - 1,
    description: `Accumulation phase with ${volumeRatio.toFixed(1)}x more buying volume`
  };
}
function detectDistribution(data) {
  if (data.length < 20) return null;
  const recent = data.slice(-20);
  const highs = recent.map((d) => d.high);
  const lows = recent.map((d) => d.low);
  const priceRange = (Math.max(...highs) - Math.min(...lows)) / Math.min(...lows);
  if (priceRange > 0.15) return null;
  let upVolume = 0;
  let downVolume = 0;
  for (let i = 1; i < recent.length; i++) {
    if (recent[i].close > recent[i - 1].close) {
      upVolume += recent[i].volume;
    } else {
      downVolume += recent[i].volume;
    }
  }
  const volumeRatio = upVolume > 0 ? downVolume / upVolume : 2;
  if (volumeRatio < 1.2) return null;
  return {
    pattern: "Distribution",
    confidence: 55 + Math.min(volumeRatio * 10, 30),
    direction: "bearish",
    startIndex: data.length - 20,
    endIndex: data.length - 1,
    description: `Distribution phase with ${volumeRatio.toFixed(1)}x more selling volume`
  };
}
function detectVShapeRecovery(data) {
  if (data.length < 15) return null;
  const recent = data.slice(-15);
  const midpoint = Math.floor(recent.length / 2);
  let lowestIndex = 0;
  let lowestPrice = recent[0].low;
  for (let i = 1; i < recent.length; i++) {
    if (recent[i].low < lowestPrice) {
      lowestPrice = recent[i].low;
      lowestIndex = i;
    }
  }
  if (lowestIndex < 3 || lowestIndex > recent.length - 3) return null;
  const startPrice = recent[0].close;
  const endPrice = recent[recent.length - 1].close;
  const drop = (startPrice - lowestPrice) / startPrice * 100;
  const recovery = (endPrice - lowestPrice) / lowestPrice * 100;
  if (drop < 10 || recovery < 10) return null;
  const recoveryRatio = recovery / drop;
  if (recoveryRatio < 0.7) return null;
  return {
    pattern: "V-Shape Recovery",
    confidence: 60 + Math.min(recovery, 30),
    direction: "bullish",
    startIndex: data.length - 15,
    endIndex: data.length - 1,
    priceTarget: startPrice * (1 + recovery / 100 * 0.5),
    description: `V-shape with ${drop.toFixed(1)}% drop and ${recovery.toFixed(1)}% recovery`
  };
}
function detectRoundingBottom(data) {
  if (data.length < 20) return null;
  const recent = data.slice(-20);
  let lowestIndex = 0;
  let lowestPrice = recent[0].low;
  for (let i = 1; i < recent.length; i++) {
    if (recent[i].low < lowestPrice) {
      lowestPrice = recent[i].low;
      lowestIndex = i;
    }
  }
  if (lowestIndex < 6 || lowestIndex > 14) return null;
  const beforeLow = recent.slice(0, lowestIndex);
  const afterLow = recent.slice(lowestIndex);
  let declining = true;
  for (let i = 1; i < beforeLow.length; i++) {
    if (beforeLow[i].close > beforeLow[i - 1].close * 1.02) {
      declining = false;
      break;
    }
  }
  let rising = true;
  for (let i = 1; i < afterLow.length; i++) {
    if (afterLow[i].close < afterLow[i - 1].close * 0.98) {
      rising = false;
      break;
    }
  }
  if (!declining || !rising) return null;
  const startPrice = recent[0].close;
  const endPrice = recent[recent.length - 1].close;
  return {
    pattern: "Rounding Bottom",
    confidence: 65,
    direction: "bullish",
    startIndex: data.length - 20,
    endIndex: data.length - 1,
    priceTarget: Math.max(startPrice, endPrice) * 1.1,
    description: `Rounding bottom with support at $${lowestPrice.toFixed(6)}`
  };
}

// src/agents/pattern-agent.ts
var PatternAgent = class extends BaseAgent {
  constructor(config) {
    super("PatternAgent", config);
  }
  async analyze(token, data) {
    this.log(`Scanning patterns for ${token.symbol}...`);
    if (data.length < 20) {
      this.log("Insufficient data for pattern detection");
      return null;
    }
    const classicalPatterns = detectPatterns(data);
    const cryptoPatterns = detectCryptoPatterns(data);
    const allPatterns = [...classicalPatterns, ...cryptoPatterns];
    if (allPatterns.length === 0) {
      this.log("No significant patterns detected");
      return null;
    }
    const topPattern = allPatterns.sort((a, b) => b.confidence - a.confidence)[0];
    const prompt = this.buildPrompt(token, data, topPattern, allPatterns);
    try {
      const llmResponse = await this.llm.complete(this.getSystemPrompt(), prompt);
      const result = this.parseResponse(llmResponse, topPattern);
      this.log(`Pattern detected: ${result.pattern} (${result.confidence}% confidence)`);
      return result;
    } catch (error) {
      this.log("LLM analysis failed, using detected pattern", error);
      return {
        pattern: topPattern.pattern,
        confidence: topPattern.confidence,
        direction: topPattern.direction,
        priceTarget: topPattern.priceTarget,
        description: topPattern.description
      };
    }
  }
  getSystemPrompt() {
    return PATTERN_AGENT_PROMPT;
  }
  buildPrompt(token, data, topPattern, allPatterns) {
    const metrics = this.getPriceMetrics(data);
    return `
Analyze chart patterns for ${token.symbol}:

Current Price: $${metrics.currentPrice.toFixed(6)}
24h Range: $${metrics.low24h.toFixed(6)} - $${metrics.high24h.toFixed(6)}
24h Change: ${metrics.priceChangePercent.toFixed(2)}%

DETECTED PATTERNS:
${allPatterns.map((p) => `- ${p.pattern}: ${p.confidence}% confidence, ${p.direction}`).join("\n")}

TOP PATTERN: ${topPattern.pattern}
Initial Confidence: ${topPattern.confidence}%
Direction: ${topPattern.direction}
${topPattern.priceTarget ? `Price Target: $${topPattern.priceTarget.toFixed(6)}` : ""}
Description: ${topPattern.description}

PRICE DATA:
${this.formatDataForLLM(data)}

Analyze this pattern and provide:
1. Refined confidence level based on pattern clarity
2. Price target if pattern completes
3. Key levels to watch
4. Brief description of the pattern

Respond in JSON format:
{
  "pattern": "string",
  "confidence": number,
  "direction": "bullish" | "bearish" | "neutral",
  "priceTarget": number | null,
  "description": "string"
}
`;
  }
  parseResponse(response, fallback) {
    const parsed = this.parseJSON(response);
    if (parsed) {
      return {
        pattern: parsed.pattern || fallback.pattern,
        confidence: parsed.confidence || fallback.confidence,
        direction: parsed.direction || fallback.direction,
        priceTarget: parsed.priceTarget ?? fallback.priceTarget,
        description: parsed.description || fallback.description
      };
    }
    return {
      pattern: fallback.pattern,
      confidence: fallback.confidence,
      direction: fallback.direction,
      priceTarget: fallback.priceTarget,
      description: fallback.description
    };
  }
};

// src/agents/trend-agent.ts
var TrendAgent = class extends BaseAgent {
  constructor(config) {
    super("TrendAgent", config);
  }
  async analyze(token, data) {
    this.log(`Analyzing trend for ${token.symbol}...`);
    if (data.length < 50) {
      this.log("Insufficient data for trend analysis");
      const currentPrice = data[data.length - 1]?.close || 0;
      return {
        direction: "sideways",
        strength: 0,
        support: currentPrice * 0.95,
        resistance: currentPrice * 1.05,
        momentum: 0,
        description: "Insufficient data for trend analysis"
      };
    }
    const trendMetrics = this.calculateTrendMetrics(data);
    const prompt = this.buildPrompt(token, data, trendMetrics);
    try {
      const llmResponse = await this.llm.complete(this.getSystemPrompt(), prompt);
      const result = this.parseResponse(llmResponse, trendMetrics);
      this.log(`Trend: ${result.direction} (strength: ${result.strength}%)`);
      return result;
    } catch (error) {
      this.log("LLM analysis failed, using calculated metrics", error);
      return {
        ...trendMetrics,
        description: `Trend is ${trendMetrics.direction} with ${trendMetrics.strength.toFixed(0)}% strength`
      };
    }
  }
  getSystemPrompt() {
    return TREND_AGENT_PROMPT;
  }
  calculateTrendMetrics(data) {
    const closes = data.map((d) => d.close);
    const ema20 = this.calculateEMA(closes, 20);
    const ema50 = this.calculateEMA(closes, 50);
    const ema200 = closes.length >= 200 ? this.calculateEMA(closes, 200) : ema50;
    const currentPrice = closes[closes.length - 1];
    let direction = "sideways";
    if (currentPrice > ema20 && ema20 > ema50) {
      direction = "up";
    } else if (currentPrice < ema20 && ema20 < ema50) {
      direction = "down";
    }
    const priceVsEma20 = (currentPrice - ema20) / ema20 * 100;
    const ema20Vs50 = (ema20 - ema50) / ema50 * 100;
    const strength = Math.min(Math.abs(priceVsEma20 + ema20Vs50) * 5, 100);
    const { support, resistance } = this.findSupportResistance(data);
    const lookback = Math.min(20, closes.length - 1);
    const previousPrice = closes[closes.length - lookback - 1];
    const momentum = (currentPrice - previousPrice) / previousPrice * 100;
    return {
      direction,
      strength,
      support,
      resistance,
      momentum,
      ema20,
      ema50,
      ema200
    };
  }
  findSupportResistance(data) {
    const recent = data.slice(-50);
    const lows = recent.map((d) => d.low);
    const highs = recent.map((d) => d.high);
    const sortedLows = [...lows].sort((a, b) => a - b);
    const support = sortedLows[Math.floor(sortedLows.length * 0.1)];
    const sortedHighs = [...highs].sort((a, b) => b - a);
    const resistance = sortedHighs[Math.floor(sortedHighs.length * 0.1)];
    return { support, resistance };
  }
  buildPrompt(token, data, metrics) {
    const priceMetrics = this.getPriceMetrics(data);
    return `
Analyze the trend for ${token.symbol}:

Current Price: $${priceMetrics.currentPrice.toFixed(6)}
EMA 20: $${metrics.ema20.toFixed(6)}
EMA 50: $${metrics.ema50.toFixed(6)}
EMA 200: $${metrics.ema200.toFixed(6)}
Support: $${metrics.support.toFixed(6)}
Resistance: $${metrics.resistance.toFixed(6)}
Momentum (20 period): ${metrics.momentum.toFixed(2)}%

Initial Assessment:
- Direction: ${metrics.direction}
- Strength: ${metrics.strength.toFixed(0)}%

PRICE DATA:
${this.formatDataForLLM(data)}

Provide refined trend analysis:
1. Confirm or adjust direction
2. Strength score (0-100)
3. Key support/resistance levels
4. Brief description

Respond in JSON format:
{
  "direction": "up" | "down" | "sideways",
  "strength": number,
  "support": number,
  "resistance": number,
  "momentum": number,
  "description": "string"
}
`;
  }
  parseResponse(response, fallback) {
    const parsed = this.parseJSON(response);
    if (parsed) {
      return {
        direction: parsed.direction || fallback.direction,
        strength: parsed.strength || fallback.strength,
        support: parsed.support || fallback.support,
        resistance: parsed.resistance || fallback.resistance,
        momentum: parsed.momentum || fallback.momentum,
        description: parsed.description || `Trend is ${fallback.direction} with ${fallback.strength}% strength`
      };
    }
    return {
      direction: fallback.direction,
      strength: fallback.strength,
      support: fallback.support,
      resistance: fallback.resistance,
      momentum: fallback.momentum,
      description: `Trend is ${fallback.direction} with ${fallback.strength.toFixed(0)}% strength`
    };
  }
};

// src/agents/risk-agent.ts
var RiskAgent = class extends BaseAgent {
  constructor(config) {
    super("RiskAgent", config);
  }
  async analyze(input) {
    const { token, data, indicators, pattern, trend } = input;
    this.log(`Synthesizing trade decision for ${token.symbol}...`);
    if (data.length === 0) {
      return this.getDefaultDecision(token, input);
    }
    const metrics = this.getPriceMetrics(data);
    const riskMetrics = this.calculateRiskMetrics(data, trend);
    const prompt = this.buildPrompt(input, metrics, riskMetrics);
    try {
      const llmResponse = await this.llm.complete(this.getSystemPrompt(), prompt);
      const decision = this.parseResponse(llmResponse, {
        token,
        indicators,
        pattern,
        trend,
        riskMetrics,
        currentPrice: metrics.currentPrice
      });
      this.log(`Decision: ${decision.action} (${decision.confidence}% confidence)`);
      return decision;
    } catch (error) {
      this.log("LLM analysis failed, using calculated decision", error);
      return this.calculateFallbackDecision(input, metrics, riskMetrics);
    }
  }
  getSystemPrompt() {
    return RISK_AGENT_PROMPT;
  }
  calculateRiskMetrics(data, trend) {
    const currentPrice = data[data.length - 1]?.close || 0;
    if (currentPrice === 0) {
      return {
        riskScore: 100,
        rewardRatio: 0,
        stopLoss: 0,
        takeProfit: 0,
        positionSize: 0,
        warnings: ["No price data available"]
      };
    }
    const atr = this.calculateATR(data, 14);
    const volatility = atr / currentPrice * 100;
    const stopLoss = currentPrice - atr * 2;
    const takeProfit = trend?.resistance || currentPrice + atr * 3;
    const risk = currentPrice - stopLoss;
    const reward = takeProfit - currentPrice;
    const rewardRatio = risk > 0 ? reward / risk : 0;
    let riskScore = 50;
    if (volatility > 10) riskScore += 15;
    if (volatility > 20) riskScore += 15;
    if (rewardRatio < 1.5) riskScore += 10;
    if (rewardRatio < 1) riskScore += 15;
    if (trend?.strength && trend.strength < 30) riskScore += 10;
    const warnings = [];
    if (volatility > 15) {
      warnings.push("High volatility detected - use wider stops");
    }
    if (rewardRatio < 1.5) {
      warnings.push("Poor risk/reward ratio - consider waiting for better entry");
    }
    if (trend?.strength && trend.strength < 30) {
      warnings.push("Weak trend - wait for confirmation");
    }
    if (atr > currentPrice * 0.05) {
      warnings.push("Very high ATR - reduce position size");
    }
    const positionSize = Math.max(100 - riskScore, 1);
    return {
      riskScore: Math.min(riskScore, 100),
      rewardRatio: Math.round(rewardRatio * 100) / 100,
      stopLoss: Math.round(stopLoss * 1e8) / 1e8,
      takeProfit: Math.round(takeProfit * 1e8) / 1e8,
      positionSize,
      warnings
    };
  }
  buildPrompt(input, metrics, riskMetrics) {
    const { token, indicators, indicatorSignal, indicatorConfidence, pattern, trend } = input;
    const indicatorSummary = indicators.map((i) => `${i.name}: ${i.signal} (strength: ${i.strength.toFixed(0)}%)`).join("\n");
    return `
TRADE DECISION REQUEST for ${token.symbol} (${token.chain})

CURRENT MARKET STATE:
- Price: $${metrics.currentPrice.toFixed(6)}
- 24h Change: ${metrics.priceChangePercent.toFixed(2)}%
- 24h Range: $${metrics.low24h.toFixed(6)} - $${metrics.high24h.toFixed(6)}
- 24h Volume: $${metrics.volume24h.toFixed(0)}

INDICATOR ANALYSIS (${indicatorSignal.toUpperCase()}, ${indicatorConfidence}% confidence):
${indicatorSummary}

PATTERN ANALYSIS:
${pattern ? `${pattern.pattern} - ${pattern.direction} (${pattern.confidence}% confidence)
   Price Target: ${pattern.priceTarget ? `$${pattern.priceTarget.toFixed(6)}` : "N/A"}
   ${pattern.description}` : "No significant pattern detected"}

TREND ANALYSIS:
- Direction: ${trend.direction}
- Strength: ${trend.strength.toFixed(0)}%
- Support: $${trend.support.toFixed(6)}
- Resistance: $${trend.resistance.toFixed(6)}
- Momentum: ${trend.momentum.toFixed(2)}%
- ${trend.description}

RISK METRICS:
- Risk Score: ${riskMetrics.riskScore}/100 (higher = riskier)
- Risk/Reward Ratio: ${riskMetrics.rewardRatio.toFixed(2)}
- Suggested Stop Loss: $${riskMetrics.stopLoss.toFixed(6)}
- Suggested Take Profit: $${riskMetrics.takeProfit.toFixed(6)}
- Suggested Position Size: ${riskMetrics.positionSize}% of portfolio
- Warnings: ${riskMetrics.warnings.length > 0 ? riskMetrics.warnings.join("; ") : "None"}

Based on ALL the above analysis, provide a trade decision.

Consider:
1. Agent confluence - do multiple agents agree?
2. Risk/reward - is it worth taking the trade?
3. Current market conditions
4. Any conflicting signals

Respond in JSON format:
{
  "action": "LONG" | "SHORT" | "HOLD" | "EXIT",
  "confidence": number (0-100),
  "entryPrice": number,
  "stopLoss": number,
  "takeProfit": number,
  "rationale": "string (2-3 sentences explaining the decision)"
}
`;
  }
  parseResponse(response, context) {
    const parsed = this.parseJSON(response);
    if (parsed) {
      return {
        action: parsed.action || "HOLD",
        confidence: parsed.confidence || 50,
        entryPrice: parsed.entryPrice || context.currentPrice,
        stopLoss: parsed.stopLoss || context.riskMetrics.stopLoss,
        takeProfit: parsed.takeProfit || context.riskMetrics.takeProfit,
        timeframe: "4h",
        rationale: parsed.rationale || "Based on technical analysis",
        indicators: context.indicators,
        pattern: context.pattern,
        trend: context.trend,
        risk: context.riskMetrics,
        timestamp: Date.now(),
        token: context.token
      };
    }
    return {
      action: "HOLD",
      confidence: 30,
      entryPrice: context.currentPrice,
      stopLoss: context.riskMetrics.stopLoss,
      takeProfit: context.riskMetrics.takeProfit,
      timeframe: "4h",
      rationale: "Insufficient confluence for high-confidence trade",
      indicators: context.indicators,
      pattern: context.pattern,
      trend: context.trend,
      risk: context.riskMetrics,
      timestamp: Date.now(),
      token: context.token
    };
  }
  calculateFallbackDecision(input, metrics, riskMetrics) {
    const { token, indicators, indicatorSignal, indicatorConfidence, pattern, trend } = input;
    let bullishSignals = 0;
    let bearishSignals = 0;
    if (indicatorSignal === "bullish") bullishSignals++;
    if (indicatorSignal === "bearish") bearishSignals++;
    if (pattern?.direction === "bullish") bullishSignals++;
    if (pattern?.direction === "bearish") bearishSignals++;
    if (trend.direction === "up") bullishSignals++;
    if (trend.direction === "down") bearishSignals++;
    let action = "HOLD";
    let confidence = 30;
    if (bullishSignals >= 2 && bearishSignals === 0) {
      action = "LONG";
      confidence = Math.min(50 + bullishSignals * 15, 80);
    } else if (bearishSignals >= 2 && bullishSignals === 0) {
      action = "SHORT";
      confidence = Math.min(50 + bearishSignals * 15, 80);
    }
    if (riskMetrics.riskScore > 70) {
      confidence = Math.max(confidence - 20, 20);
    }
    const rationale = action === "HOLD" ? "Mixed signals - waiting for clearer direction" : action === "LONG" ? `${bullishSignals} bullish signals across agents` : `${bearishSignals} bearish signals across agents`;
    return {
      action,
      confidence,
      entryPrice: metrics.currentPrice,
      stopLoss: riskMetrics.stopLoss,
      takeProfit: riskMetrics.takeProfit,
      timeframe: "4h",
      rationale,
      indicators,
      pattern,
      trend,
      risk: riskMetrics,
      timestamp: Date.now(),
      token
    };
  }
  getDefaultDecision(token, input) {
    return {
      action: "HOLD",
      confidence: 0,
      entryPrice: 0,
      stopLoss: 0,
      takeProfit: 0,
      timeframe: "4h",
      rationale: "Insufficient data for analysis",
      indicators: input.indicators,
      pattern: input.pattern,
      trend: input.trend,
      risk: {
        riskScore: 100,
        rewardRatio: 0,
        stopLoss: 0,
        takeProfit: 0,
        positionSize: 0,
        warnings: ["No data available"]
      },
      timestamp: Date.now(),
      token
    };
  }
};

// src/data/coingecko.ts
var BASE_URL = "https://api.coingecko.com/api/v3";
var TOKEN_IDS = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  BONK: "bonk",
  WIF: "dogwifcoin",
  JUP: "jupiter-exchange-solana",
  RAY: "raydium",
  ORCA: "orca",
  PYTH: "pyth-network",
  JTO: "jito-governance-token",
  RENDER: "render-token",
  HNT: "helium",
  RNDR: "render-token",
  INJ: "injective-protocol",
  TIA: "celestia",
  SEI: "sei-network",
  SUI: "sui",
  APT: "aptos",
  ARB: "arbitrum",
  OP: "optimism",
  MATIC: "matic-network",
  AVAX: "avalanche-2",
  LINK: "chainlink",
  UNI: "uniswap",
  AAVE: "aave"
};
function getTokenId(symbol) {
  const upperSymbol = symbol.toUpperCase();
  return TOKEN_IDS[upperSymbol] || symbol.toLowerCase();
}
async function fetchPrice(symbol) {
  try {
    const id = getTokenId(symbol);
    const response = await fetch(
      `${BASE_URL}/simple/price?ids=${id}&vs_currencies=usd&include_24hr_vol=true&include_24hr_change=true&include_market_cap=true`
    );
    if (!response.ok) {
      console.warn(`CoinGecko price fetch failed for ${symbol}: ${response.status}`);
      return null;
    }
    const data = await response.json();
    const tokenData = data[id];
    if (!tokenData) {
      return null;
    }
    return {
      price: tokenData.usd || 0,
      priceChange24h: 0,
      // Calculated from percent
      priceChangePercent24h: tokenData.usd_24h_change || 0,
      volume24h: tokenData.usd_24h_vol || 0,
      marketCap: tokenData.usd_market_cap || 0,
      high24h: 0,
      // Not available in simple endpoint
      low24h: 0
    };
  } catch (error) {
    console.error(`CoinGecko error for ${symbol}:`, error);
    return null;
  }
}
async function fetchOHLCV(symbol, days = 7) {
  try {
    const id = getTokenId(symbol);
    const response = await fetch(
      `${BASE_URL}/coins/${id}/ohlc?vs_currency=usd&days=${days}`
    );
    if (!response.ok) {
      console.warn(`CoinGecko OHLCV fetch failed for ${symbol}: ${response.status}`);
      return [];
    }
    const data = await response.json();
    return data.map((candle) => ({
      timestamp: candle[0],
      open: candle[1],
      high: candle[2],
      low: candle[3],
      close: candle[4],
      volume: 0
      // OHLC endpoint doesn't include volume
    }));
  } catch (error) {
    console.error(`CoinGecko OHLCV error for ${symbol}:`, error);
    return [];
  }
}
async function fetchMarketChart(symbol, days = 7) {
  try {
    const id = getTokenId(symbol);
    const response = await fetch(
      `${BASE_URL}/coins/${id}/market_chart?vs_currency=usd&days=${days}`
    );
    if (!response.ok) {
      console.warn(`CoinGecko market_chart failed for ${symbol}: ${response.status}`);
      return [];
    }
    const data = await response.json();
    const prices = data.prices || [];
    const volumes = data.total_volumes || [];
    const candles = [];
    const hourMs = 60 * 60 * 1e3;
    for (let i = 0; i < prices.length; i++) {
      const [timestamp, price] = prices[i];
      const volume = volumes[i]?.[1] || 0;
      const hourTimestamp = Math.floor(timestamp / hourMs) * hourMs;
      let candle = candles.find((c) => c.timestamp === hourTimestamp);
      if (!candle) {
        candle = {
          timestamp: hourTimestamp,
          open: price,
          high: price,
          low: price,
          close: price,
          volume: 0
        };
        candles.push(candle);
      }
      candle.high = Math.max(candle.high, price);
      candle.low = Math.min(candle.low, price);
      candle.close = price;
      candle.volume += volume / (prices.length / candles.length);
    }
    return candles.sort((a, b) => a.timestamp - b.timestamp);
  } catch (error) {
    console.error(`CoinGecko market_chart error for ${symbol}:`, error);
    return [];
  }
}
async function fetchTokenInfo(symbol) {
  try {
    const id = getTokenId(symbol);
    const response = await fetch(`${BASE_URL}/coins/${id}`);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return {
      id: data.id,
      symbol: data.symbol,
      name: data.name,
      marketCap: data.market_data?.market_cap?.usd || 0,
      rank: data.market_cap_rank || 0,
      ath: data.market_data?.ath?.usd || 0,
      athChangePercent: data.market_data?.ath_change_percentage?.usd || 0,
      atl: data.market_data?.atl?.usd || 0,
      atlChangePercent: data.market_data?.atl_change_percentage?.usd || 0
    };
  } catch (error) {
    console.error(`CoinGecko token info error for ${symbol}:`, error);
    return null;
  }
}

// src/data/dexscreener.ts
var BASE_URL2 = "https://api.dexscreener.com";
async function fetchTokenPairs(tokenAddress) {
  try {
    const response = await fetch(
      `${BASE_URL2}/latest/dex/tokens/${tokenAddress}`
    );
    if (!response.ok) {
      console.warn(`DexScreener fetch failed for ${tokenAddress}: ${response.status}`);
      return [];
    }
    const data = await response.json();
    return data.pairs || [];
  } catch (error) {
    console.error(`DexScreener error for ${tokenAddress}:`, error);
    return [];
  }
}
async function searchTokens(query) {
  try {
    const response = await fetch(
      `${BASE_URL2}/latest/dex/search?q=${encodeURIComponent(query)}`
    );
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    return data.pairs || [];
  } catch (error) {
    console.error(`DexScreener search error:`, error);
    return [];
  }
}
async function fetchSolanaToken(address) {
  const pairs = await fetchTokenPairs(address);
  if (pairs.length === 0) {
    return null;
  }
  const bestPair = pairs.filter((p) => p.chainId === "solana").sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];
  if (!bestPair) {
    return null;
  }
  return {
    price: parseFloat(bestPair.priceUsd) || 0,
    priceChange24h: bestPair.priceChange?.h24 || 0,
    volume24h: bestPair.volume?.h24 || 0,
    liquidity: bestPair.liquidity?.usd || 0,
    marketCap: bestPair.marketCap || 0,
    fdv: bestPair.fdv || 0,
    txCount24h: (bestPair.txns?.h24?.buys || 0) + (bestPair.txns?.h24?.sells || 0),
    poolAddress: bestPair.pairAddress,
    dex: bestPair.dexId
  };
}

// src/data/index.ts
async function fetchTokenData(token, timeframe) {
  const days = timeframe === "1d" ? 30 : timeframe === "4h" ? 7 : 3;
  if (token.chain === "solana" && token.address) {
    const dexData = await fetchSolanaToken(token.address);
    if (dexData) {
      const ohlcv2 = await fetchMarketChart(token.symbol, days);
      if (ohlcv2.length > 0) {
        return ohlcv2.map((candle) => ({
          timestamp: candle.timestamp,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
          volume: candle.volume
        }));
      }
      const now = Date.now();
      const hourMs = 60 * 60 * 1e3;
      const candles = [];
      const priceChange = dexData.priceChange24h / 100;
      const currentPrice = dexData.price;
      for (let i = 23; i >= 0; i--) {
        const timestamp = now - i * hourMs;
        const progress = (24 - i) / 24;
        const previousPrice = currentPrice / (1 + priceChange);
        const price = previousPrice + (currentPrice - previousPrice) * progress;
        const volatility = Math.abs(priceChange) * 0.1 + 5e-3;
        const high = price * (1 + volatility * Math.random());
        const low = price * (1 - volatility * Math.random());
        candles.push({
          timestamp,
          open: i === 23 ? previousPrice : candles[candles.length - 1]?.close || price,
          high,
          low,
          close: price,
          volume: dexData.volume24h / 24
        });
      }
      return candles;
    }
  }
  const ohlcv = await fetchMarketChart(token.symbol, days);
  if (ohlcv.length > 0) {
    return ohlcv.map((candle) => ({
      timestamp: candle.timestamp,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
      volume: candle.volume
    }));
  }
  const ohlc = await fetchOHLCV(token.symbol, days);
  return ohlc.map((candle) => ({
    timestamp: candle.timestamp,
    open: candle.open,
    high: candle.high,
    low: candle.low,
    close: candle.close,
    volume: candle.volume
  }));
}
async function fetchMarketData(token) {
  if (token.chain === "solana" && token.address) {
    const dexData = await fetchSolanaToken(token.address);
    if (dexData) {
      return {
        price: dexData.price,
        priceChange24h: dexData.priceChange24h,
        volume24h: dexData.volume24h,
        marketCap: dexData.marketCap,
        liquidity: dexData.liquidity,
        fdv: dexData.fdv
      };
    }
  }
  const [priceData, tokenInfo] = await Promise.all([
    fetchPrice(token.symbol),
    fetchTokenInfo(token.symbol)
  ]);
  return {
    price: priceData?.price || 0,
    priceChange24h: priceData?.priceChangePercent24h || 0,
    volume24h: priceData?.volume24h || 0,
    marketCap: priceData?.marketCap || tokenInfo?.marketCap || 0,
    ath: tokenInfo?.ath,
    athChange: tokenInfo?.athChangePercent
  };
}
async function searchTokens2(query, chain) {
  const pairs = await searchTokens(query);
  return pairs.filter((pair) => !chain || pair.chainId === chain).slice(0, 20).map((pair) => ({
    symbol: pair.baseToken.symbol,
    name: pair.baseToken.name,
    address: pair.baseToken.address,
    chain: pair.chainId,
    price: parseFloat(pair.priceUsd) || 0,
    marketCap: pair.marketCap || 0
  }));
}

// src/orchestrator/trading-graph.ts
var TradingGraph = class {
  indicatorAgent;
  patternAgent;
  trendAgent;
  riskAgent;
  config;
  constructor(config) {
    this.config = config;
    this.indicatorAgent = new IndicatorAgent(config.agentConfig);
    this.patternAgent = new PatternAgent(config.agentConfig);
    this.trendAgent = new TrendAgent(config.agentConfig);
    this.riskAgent = new RiskAgent(config.agentConfig);
  }
  /**
   * Run full analysis pipeline
   * Executes all agents and synthesizes a trading decision
   */
  async analyze(request) {
    const { token, timeframe = this.config.defaultTimeframe || "4h" } = request;
    this.log(`
Starting QuantAgent analysis for ${token.symbol}...`);
    this.log(`Timeframe: ${timeframe}`);
    let data = request.klineData;
    if (!data || data.length === 0) {
      this.log("Fetching market data...");
      try {
        data = await fetchTokenData(token, timeframe);
      } catch (error) {
        this.log(`Data fetch error: ${error}`);
        data = [];
      }
    }
    if (data.length < 50) {
      this.log(`Warning: Only ${data.length} candles available (need 50+ for full analysis)`);
    }
    this.log("\nRunning agents...");
    const startTime = Date.now();
    const [indicatorResult, patternResult, trendResult] = await Promise.all([
      this.runWithTiming(
        "Indicator Agent",
        () => this.indicatorAgent.analyze(token, data)
      ),
      this.runWithTiming(
        "Pattern Agent",
        () => this.patternAgent.analyze(token, data)
      ),
      this.runWithTiming(
        "Trend Agent",
        () => this.trendAgent.analyze(token, data)
      )
    ]);
    const decision = await this.runWithTiming(
      "Risk Agent",
      () => this.riskAgent.analyze({
        token,
        data,
        indicators: indicatorResult.indicators,
        indicatorSignal: indicatorResult.overallSignal,
        indicatorConfidence: indicatorResult.confidence,
        pattern: patternResult,
        trend: trendResult
      })
    );
    const totalTime = Date.now() - startTime;
    this.log(`
Analysis complete in ${totalTime}ms`);
    this.log(`Decision: ${decision.action} (${decision.confidence}% confidence)`);
    return decision;
  }
  /**
   * Quick analysis - indicators only (faster)
   * Good for initial screening
   */
  async quickAnalysis(request) {
    const { token, timeframe = "4h" } = request;
    let data = request.klineData;
    if (!data) {
      data = await fetchTokenData(token, timeframe);
    }
    const result = await this.indicatorAgent.analyze(token, data);
    return {
      signal: result.overallSignal,
      confidence: result.confidence,
      summary: result.summary
    };
  }
  /**
   * Get individual agent results without final synthesis
   * Useful for debugging or custom analysis
   */
  async getAgentResults(request) {
    const { token, timeframe = "4h" } = request;
    let data = request.klineData;
    if (!data) {
      data = await fetchTokenData(token, timeframe);
    }
    const [indicators, pattern, trend] = await Promise.all([
      this.indicatorAgent.analyze(token, data),
      this.patternAgent.analyze(token, data),
      this.trendAgent.analyze(token, data)
    ]);
    return { indicators, pattern, trend };
  }
  async runWithTiming(name, fn) {
    const start = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - start;
      this.log(`  ${name}: ${duration}ms`);
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.log(`  ${name}: FAILED after ${duration}ms - ${error}`);
      throw error;
    }
  }
  log(message) {
    if (this.config.showLogs !== false) {
      console.log(`[TradingGraph] ${message}`);
    }
  }
};
function createTradingGraph2(options) {
  const provider = options?.provider || "anthropic";
  const model = options?.model || (provider === "anthropic" ? "claude-sonnet-4-20250514" : "gpt-4o");
  return new TradingGraph({
    agentConfig: {
      llmProvider: provider,
      model,
      temperature: 0.3,
      maxTokens: 1e3
    },
    defaultTimeframe: "4h",
    showLogs: options?.showLogs ?? true
  });
}

// src/index.ts
async function analyzeToken(symbol, options) {
  const graph = createTradingGraph({
    provider: options?.provider || "anthropic",
    model: options?.model,
    showLogs: true
  });
  return graph.analyze({
    token: {
      symbol: symbol.toUpperCase(),
      name: symbol,
      address: options?.address,
      chain: options?.chain || "solana"
    },
    timeframe: options?.timeframe || "4h"
  });
}
async function quickSignal(symbol, options) {
  const graph = createTradingGraph({
    provider: options?.provider || "anthropic",
    showLogs: false
  });
  return graph.quickAnalysis({
    token: {
      symbol: symbol.toUpperCase(),
      name: symbol,
      address: options?.address,
      chain: options?.chain || "solana"
    },
    timeframe: options?.timeframe || "4h"
  });
}
export {
  IndicatorAgent,
  LLMClient,
  PatternAgent,
  RiskAgent,
  TradingGraph,
  TrendAgent,
  analyzeToken,
  analyzeVolume,
  calculateBollingerBands,
  calculateMACD,
  calculateMFI,
  calculateOBV,
  calculateRSI,
  calculateRSIWithDivergence,
  calculateStochRSI,
  calculateStochastic,
  calculateVWAP,
  createDefaultClient,
  createTradingGraph2 as createTradingGraph,
  detectBollingerBreakout,
  detectCryptoPatterns,
  detectPatterns,
  fetchMarketData,
  fetchTokenData,
  getBandwidthTrend,
  getMACDHistogramTrend,
  quickSignal,
  searchTokens2 as searchTokens
};
//# sourceMappingURL=index.js.map