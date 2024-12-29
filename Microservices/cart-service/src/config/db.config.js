const mongoose = require('mongoose');
const consul = require('consul')();

let config = '';

// Function to handle MongoDB connection
const connectDB = async () => {
  try {
    // Ensure the config is populated before connecting
    if (!config || !config.DataSource || !config.DBHost || !config.DBPort || !config.cartDB) {
      throw new Error('Invalid configuration. Missing required fields.');
    }

    const connectionString = `${config.DataSource}://${config.DBHost}:${config.DBPort}/${config.cartDB}`;

    // Avoid multiple connections
    if (mongoose.connection.readyState === 1) {
      console.log('DB is already connected.');
      return;
    }

    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`DB connected successfully to ${config.cartDB}`);
  } catch (err) {
    console.error('Error connecting to DB:', err.message);
  }
};

// Fetch initial configuration from Consul and connect to DB
consul.kv.get('MSConfig', (err, result) => {
  if (err) {
    console.error('Error fetching configuration from Consul:', err.message);
    return;
  }

  try {
    config = JSON.parse(result.Value);
    connectDB(); // Call connectDB once the config is fetched
  } catch (parseError) {
    console.error('Error parsing configuration:', parseError.message);
  }
});

// Watch for changes in the MSConfig key and reconnect if config changes
const watch = consul.watch({
  method: consul.kv.get,
  options: {
    key: 'MSConfig',
  },
  backoffFactor: 1000, // Retry delay
});

watch.on('change', async (data) => {
  try {
    console.log('Configuration change detected.');

    const newConfig = JSON.parse(data.Value);

    // Compare new config with the existing one to determine if a reconnect is necessary
    if (JSON.stringify(newConfig) !== JSON.stringify(config)) {
      config = newConfig;

      if (mongoose.connection.readyState === 1) {
        console.log('Closing existing DB connection.');
        await mongoose.connection.close(); // Close the existing connection
      }

      console.log('Reconnecting to DB with updated configuration...');
      connectDB();
    } else {
      console.log('No significant changes in configuration. Skipping reconnect.');
    }
  } catch (err) {
    console.error('Error handling config change:', err.message);
  }
});

// Handle Consul watch errors
watch.on('error', (err) => {
  console.error('Consul watch encountered an error:', err.message);
});

module.exports = connectDB;
