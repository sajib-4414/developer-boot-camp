import NodeGeoCoder, { Options, Providers } from 'node-geocoder'
const geoCoderProvider = process.env.GEOCODER_PROVIDER as Providers
const options:Options = {
    provider: geoCoderProvider,
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
}

const geocoder = NodeGeoCoder(options)

module.exports = geocoder;