# SMTP mock server

Provides a mock SMTP server that can be used to verify and look at e-mails in end-to-end test. It provides a JSON API to await received e-mails.


## Running

```sh
$ npx @anton-johansson/smtp-mock-server
```

#### Options

| Switch               | Description                                               |
| -------------------- | --------------------------------------------------------- |
| `--smtp-port <port>` | The port to serve the SMTP server on. Defaults to `3025`. |
| `--api-port <port>`  | The port to serve the API on. Defaults to `3080`.         |


## Example setup

`package.json`:

```json
{
  "scripts": {
    "start": "node dist/index.js",
    "test:e2e": "npx playwright test",
    "test:e2e-ci": "start-test start 3000 'npx @anton-johansson/smtp-mock-server' 3080 test:e2e"
  },
  "devDependencies": {
    "start-server-and-test": "2.0.0"
  }
}
```

Then simply run `npm run test:e2e-ci` on your continuous integration server. It will fire up your server, the SMTP mock server, run the tests and then shut down the servers again.


## API

### Await e-mail

```sh
$ curl http://localhost:3080/await-email?subject=Hello
```

#### Parameters

| Query parameter key | Description                                                                              |
| ------------------- | ---------------------------------------------------------------------------------------- |
| `subject`           | Optional subject to filter by when awaiting e-mail.                                      |
| `timeout`           | The number of milliseconds to wait for the e-mail. Defaults to `5000`.                   |
| `remove`            | Whether or not to remove the email from the list after receiving it. Defaults to `true`. |

### Clear e-mails

This one is not really useful during the actual end-to-end tests, but it can be useful to clear the e-mails before starting the tests when running tests locally.

```shell
$ curl -XPOST http://localhost:3080/clear-emails
```
