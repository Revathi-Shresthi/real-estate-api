import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 50,
  duration: '30s',
};

export default function () {
  const healthRes = http.get('http://localhost:3000/health');
  check(healthRes, {
    'health status 200': (r) => r.status === 200,
  });

  const listingsRes = http.get('http://localhost:3000/api/listings');
  check(listingsRes, {
    'listings status 200': (r) => r.status === 200,
  });

  sleep(1);
}