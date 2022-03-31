import crypto from 'crypto';

export function getTimestamp() {
  return new Date().getTime();
}

export function getSignature(query_string) {
  return crypto.createHmac('sha256', process.env.BINANCE_API_SECRET).update(query_string).digest("hex");
}

export function getHeaders() {
  return {
    headers: {
      'Content-Type': 'application/json',
      'X-MBX-APIKEY': process.env.BINANCE_API_KEY,
    }
  }
}