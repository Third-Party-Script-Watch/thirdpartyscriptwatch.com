# Third Party Script Watch

**A service to track third-party script sizes over time**

Based on [this Twitter conversation](https://twitter.com/toolmantim/status/1544169316933062656).

## Contributing

Want to suggest a new script to track? Or make some changes?
Take a look at the [contribution guidelines](CONTRIBUTING.md)

## How does it work?

### The Watcher

The Watcher is an Azure Function, triggered each day at midnight UTC.

It launches a [Puppeteer](https://pptr.dev/) instance, injects the `initialisationHtml` from `src/watcher/DailyTrigger/scripts.json`, then captures the resulting network traffic.

Selected metrics from the traffic (URL, type, encoding, encoded & decoded size) are stored in Azure Cosmos DB (MongoDB API).

A static JSON file is then written out to Azure Blob Storage, containing the scripts + metrics for the last 30 days.

**Built using:**

* TypeScript
* Puppeteer
* MongoDB
* Azure Functions Core Tools

### The UI

The UI is a fairly basic pile of JavaScript that generates interactive SVG charts from the metrics; and allows filtering, deep-linking & display of details on the scripts & metrics.

**Built using:**

* TypeScript
* Sass
* Parcel
* Google Material Icons
