const yargsConfig = {
    NODE_ENV: process.env.NODE_ENV || 'dev',
    HOST: process.env.HOST || 'mongodb://localhost:27017/CODERHOUSE',
    PORT: process.env.PORT || '8080'
}
export default yargsConfig;