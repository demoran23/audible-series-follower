import { RateLimiter } from 'limiter';

export const limiter = new RateLimiter({
  tokensPerInterval: 5,
  interval: 'second',
});
