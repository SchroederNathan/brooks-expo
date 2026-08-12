#!/usr/bin/env bun

/**
 * Reproduce the Brooks Exact Sale-grid image transport workload without
 * pretending that a Bun fetch is a browser or native assignment benchmark.
 *
 * @ref LLP 0004#addendum-2026-07-14-bounded-image-work — Compare the former
 * 97-card eager workload with the current 12-card, four-critical policy.
 */

import { gridFor, gridPage } from '../../apps/exact/src/data/brooks.ts';

interface Options {
  mode: 'eager' | 'bounded';
  concurrency: number;
  exactCommit: string;
  details: boolean;
}

interface Sample {
  id: string;
  url: string;
  startOffsetMs: number;
  ttfbMs: number;
  totalMs: number;
  status: number;
  contentType: string;
  bytes: number;
  serverTiming: string;
}

function parseOptions(argv: readonly string[]): Options {
  let mode: Options['mode'] = 'bounded';
  let concurrency = 6;
  let exactCommit = 'unknown';
  let details = false;
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const value = argv[index + 1];
    if (arg === '--mode' && (value === 'eager' || value === 'bounded')) {
      mode = value;
      index += 1;
    } else if (arg === '--concurrency' && value) {
      concurrency = Number(value);
      index += 1;
    } else if (arg === '--exact-commit' && value) {
      exactCommit = value;
      index += 1;
    } else if (arg === '--details') {
      details = true;
    } else {
      throw new Error(`Unknown or incomplete argument: ${arg}`);
    }
  }
  if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 32) {
    throw new Error('--concurrency must be an integer from 1 through 32');
  }
  return { mode, concurrency, exactCommit, details };
}

function percentile(values: readonly number[], quantile: number): number {
  if (values.length === 0) return 0;
  const ordered = [...values].sort((left, right) => left - right);
  const index = Math.min(ordered.length - 1, Math.ceil(ordered.length * quantile) - 1);
  return ordered[Math.max(0, index)] ?? 0;
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

async function gitCommit(): Promise<string> {
  const result = Bun.spawnSync(['git', 'rev-parse', 'HEAD'], {
    cwd: new URL('../..', import.meta.url).pathname,
    stdout: 'pipe',
    stderr: 'ignore',
  });
  return result.exitCode === 0 ? result.stdout.toString().trim() : 'unknown';
}

async function main(): Promise<void> {
  const options = parseOptions(Bun.argv.slice(2));
  const sale = gridFor('sale', '');
  const logicalItems = options.mode === 'bounded' ? gridPage(sale, 12) : sale;
  const uniqueItems = logicalItems.filter(
    (item, index, items) => items.findIndex((candidate) => candidate.imageUrl === item.imageUrl) === index,
  );
  const benchmarkStart = performance.now();
  const samples: Sample[] = new Array(uniqueItems.length);
  let cursor = 0;

  async function worker(): Promise<void> {
    while (cursor < uniqueItems.length) {
      const index = cursor;
      cursor += 1;
      const item = uniqueItems[index]!;
      const start = performance.now();
      const response = await fetch(item.imageUrl, {
        headers: {
          Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        },
        redirect: 'follow',
      });
      const headersAt = performance.now();
      const bytes = await response.arrayBuffer();
      const completeAt = performance.now();
      samples[index] = {
        id: item.id,
        url: item.imageUrl,
        startOffsetMs: round(start - benchmarkStart),
        ttfbMs: round(headersAt - start),
        totalMs: round(completeAt - start),
        status: response.status,
        contentType: response.headers.get('content-type') ?? '',
        bytes: bytes.byteLength,
        serverTiming: response.headers.get('server-timing') ?? '',
      };
    }
  }

  await Promise.all(Array.from(
    { length: Math.min(options.concurrency, uniqueItems.length) },
    () => worker(),
  ));

  const wallMs = performance.now() - benchmarkStart;
  const firstVisibleIds = new Set(logicalItems.slice(0, 4).map((item) => item.id));
  const firstVisibleSamples = samples.filter((sample) => firstVisibleIds.has(sample.id));
  const successful = samples.filter(
    (sample) => sample.status >= 200
      && sample.status < 300
      && sample.contentType.toLowerCase().startsWith('image/'),
  );
  const result = {
    schemaVersion: 1,
    capturedAt: new Date().toISOString(),
    client: 'Bun fetch transport control (not browser/native assignment)',
    networkState: 'live network; no client HTTP cache',
    mode: options.mode,
    policy: options.mode === 'bounded'
      ? '12 initially mounted; first 4 eager/high; remaining 8 lazy/auto'
      : 'all 97 mounted eagerly; no priority split',
    concurrency: options.concurrency,
    brooksCommit: await gitCommit(),
    exactCommit: options.exactCommit,
    logicalImageNodes: logicalItems.length,
    uniqueRequests: uniqueItems.length,
    successfulImages: successful.length,
    failedRequests: samples.length - successful.length,
    firstVisibleRowControlMs: round(Math.max(...firstVisibleSamples.map((sample) =>
      sample.startOffsetMs + sample.totalMs))),
    wallMs: round(wallMs),
    encodedBytes: successful.reduce((total, sample) => total + sample.bytes, 0),
    ttfbMs: {
      p50: round(percentile(samples.map((sample) => sample.ttfbMs), 0.5)),
      p95: round(percentile(samples.map((sample) => sample.ttfbMs), 0.95)),
      max: round(Math.max(...samples.map((sample) => sample.ttfbMs))),
    },
    totalMs: {
      p50: round(percentile(samples.map((sample) => sample.totalMs), 0.5)),
      p95: round(percentile(samples.map((sample) => sample.totalMs), 0.95)),
      max: round(Math.max(...samples.map((sample) => sample.totalMs))),
    },
    ...(options.details ? { samples } : {}),
  };
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

await main();
