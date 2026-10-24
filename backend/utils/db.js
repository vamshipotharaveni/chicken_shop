const mongoose = require('mongoose');

let connectionPromise;

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

function getMongoErrorDetails(error) {
  const message = String(error && error.message || error || '').toLowerCase();
  if (message.includes('authentication failed') || message.includes('bad auth') || error && error.code === 18) {
    return { type: 'authentication', publicMessage: 'MongoDB authentication failed.' };
  }
  if (message.includes('not authorized') || message.includes('not allowed') || error && (error.code === 13 || error.code === 8000)) {
    return { type: 'permissions', publicMessage: 'The MongoDB user is not authorized for this database operation.' };
  }
  if (message.includes('ip that isn\'t whitelisted') || message.includes('ip address') || message.includes('whitelist')) {
    return { type: 'network_allowlist', publicMessage: 'Your network IP is not allowlisted by MongoDB Atlas.' };
  }
  if (message.includes('timed out') || message.includes('server selection') || message.includes('could not connect to any servers')) {
    return { type: 'connection_timeout', publicMessage: 'MongoDB could not be reached before the connection timeout.' };
  }
  if (message.includes('dns') || message.includes('enotfound') || message.includes('ssl') || message.includes('tls') || message.includes('econnrefused')) {
    return { type: 'network', publicMessage: 'MongoDB network or TLS configuration could not be reached.' };
  }
  return { type: 'database_error', publicMessage: 'A database operation failed.' };
}

function connectToDatabase() {
  if (isDbConnected()) return Promise.resolve(mongoose.connection);

  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI || mongoURI.includes('CLUSTER_URL') || mongoURI.includes('<db_password>') || mongoURI.includes('<db_username>') || mongoURI.includes('<cluster_host>')) {
    return Promise.reject(new Error('MONGODB_URI is missing or contains placeholder values.'));
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 8000 })
      .catch(error => {
        connectionPromise = null;
        throw error;
      });
  }
  return connectionPromise;
}

function requireDatabaseForVercel(req, res, next) {
  if (process.env.VERCEL !== '1') return next();
  connectToDatabase()
    .then(() => next())
    .catch(error => {
      const details = getMongoErrorDetails(error);
      console.error(`MongoDB unavailable (${details.type}):`, error.message);
      res.status(503).json({ error: details.publicMessage });
    });
}

module.exports = { isDbConnected, connectToDatabase, getMongoErrorDetails, requireDatabaseForVercel };
