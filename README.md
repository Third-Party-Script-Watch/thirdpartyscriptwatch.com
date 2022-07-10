# thirdpartyscriptwatch.com

## Running locally

For local development, you'll need to run a number of services (depending on what you're working on)

TODO: dependencies

### Database

Start a local DB container & seed with test data from `container-config/mongo/initdb/init-db.js`:

```sh
docker-compose up -d
```

Shutdown DB container when you're done:

```sh
docker-compose down
```

### API

If it's the first time you've run it:

1. Install dependencies:

```sh
cd src/api && npm i
```

Run API:

```sh
cd src/api && npm start
```

### UI

If it's the first time you've run it:

1. Install dependencies:

```sh
cd src/ui && npm i
```

Run ui:

```sh
cd src/ui && npm start
```

UI will be available at http://localhost:1234/

TODO: proxy to local or QA API

### Script watcher

If it's the first time you've run it:

1. Install dependencies:

```sh
cd src/watcher && npm i
```

Run storage emulator &  watcher:

```sh
docker run -p 10000:10000 mcr.microsoft.com/azure-storage/azurite azurite-blob --blobHost 0.0.0.0 --blobPort 10000
cd src/watcher && npm start -- --port 7072
```

Manually trigger:

```sh
curl -v -H "Content-Type:application/json" --data {} http://localhost:7072/admin/functions/DailyTrigger
```
