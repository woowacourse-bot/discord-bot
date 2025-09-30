/* eslint-disable no-await-in-loop */
export const sleep = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });

export const retryWithBackoff = async (
  fn,
  {
    retries = 3,
    baseMs = 300,
    jitterMs = 50,
    onError,
  } = {},
) => {
  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      // 소량 지연으로 버스트 완화
      const jitter = Math.floor(Math.random() * jitterMs);
      if (jitter > 0) await sleep(jitter);
      return await fn();
    } catch (err) {
      attempt += 1;
      if (onError) onError(err, attempt);

      // 디스코드 429 처리: Retry-After 헤더 존중(단위: 초)
      const retryAfterHeader = err?.status === 429 && (err?.headers?.['retry-after'] || err?.headers?.get?.('retry-after'));
      const retryAfterMs = retryAfterHeader ? Number(retryAfterHeader) * 1000 : null;

      if (attempt > retries) throw err;
      const backoff = retryAfterMs ?? baseMs * 2 ** (attempt - 1);
      await sleep(backoff);
    }
  }
};
