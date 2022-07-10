# Contributing

## Adding new scripts

To add a new third-party script, you can either [create a new issue](https://github.com/Third-Party-Script-Watch/thirdpartyscriptwatch.com/issues/new) or create a fork of this repository with an addition to `src/watcher/DailyTrigger/scripts.json`:

* `id`: a unique identifier for the script (kebab-case)
* `name`: a human readable name for your script
* `url`: the initial request URL
* `initialisationHtml`: the HTML code required to run the script

...then open a [pull request](https://github.com/Third-Party-Script-Watch/thirdpartyscriptwatch.com/pulls)

## Running locally

For local development, you'll need to run a number of services (depending on what you're working on)

### Dependencies

* [Node JS](https://nodejs.org/) - v16
* [Docker](https://www.docker.com/products/docker-desktop/) - only required to run the watcher service

### UI

```sh
cd src/ui
npm install
npm start
```

UI will be available at http://localhost:1234/

### Watcher service

Start a local DB container & seed with test data from `container-config/mongo/initdb/init-db.js`:

```sh
docker-compose up -d
```

Start the function app:

```sh
cd src/watcher
npm i
npm start -- --port 7072
```

Manually trigger the function:

```sh
curl -v -H "Content-Type:application/json" --data {} http://localhost:7072/admin/functions/DailyTrigger
```

Shutdown DB container when you're done:

```sh
docker-compose down
```
