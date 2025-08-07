import axios from 'axios';

const subscriptionAPI = axios.create({
  baseURL: process.env.SUBSCRIPTION_SERVICE_URL || 'http://localhost:3004',
  timeout: 5000,
});

export { subscriptionAPI };
