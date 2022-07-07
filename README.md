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

TODO: run Azure function from command line

### UI

TODO: run Parcel, proxy to local or QA API

### Script watcher

TODO: run Azure function from command line
