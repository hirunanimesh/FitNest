const axios = require('axios');
const config = require('../config');

const serviceHealth = {
  auth: false,
  gym: false,
  payment: false,
  user: false,
  trainer: false,
  admin: false
};

const checkServiceHealth = async (serviceName, url) => {
  try {
    const response = await axios.get(`${url}/health`, { 
      timeout: 3000,
      validateStatus: (status) => status === 200
    });
    
    if (!serviceHealth[serviceName]) {
      console.log(`[Service Health] ✅ ${serviceName} service is back online`);
    }
    serviceHealth[serviceName] = true;
  } catch (error) {
    if (serviceHealth[serviceName]) {
      console.error(`[Service Health] ❌ ${serviceName} service is down: ${error.message}`);
    }
    serviceHealth[serviceName] = false;
  }
};

// Check health every 30 seconds
const startHealthChecks = () => {
  console.log(`[Service Health] Starting health checks...`);
  
  // Initial health check (delayed to allow services to start)
  setTimeout(() => {
    checkServiceHealth('auth', config.services.auth);
    checkServiceHealth('gym', config.services.gym);
    checkServiceHealth('payment',config.services.payment)
    checkServiceHealth('user', config.services.user);
    checkServiceHealth('trainer', config.services.trainer);
    checkServiceHealth('admin', config.services.admin);
  }, 2000);

  // Periodic health checks
  setInterval(() => {
    checkServiceHealth('auth', config.services.auth);
    checkServiceHealth('gym', config.services.gym);
    checkServiceHealth('payment',config.services.payment)
    checkServiceHealth('user', config.services.user);
    checkServiceHealth('trainer', config.services.trainer);
    checkServiceHealth('admin', config.services.admin);
  }, 30000);
};

module.exports = { serviceHealth, checkServiceHealth, startHealthChecks };
