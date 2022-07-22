# ZeroPass Client

ZeroPass is more than a Password Protection and Management tool, it secures all your valuable digital assets in your own vault, including the personal vault and the company vault

## Getting Started

This project is the client part of ZeroPass, it needs to work with the [server part](https://github.com/metaguardpte/ZeroPass-Server) on a live system.

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

```
node v16.15.0 (32-bit)
yarn
```

### Installing

#### Install dependencies

Under the root directory, run the following to install the dependencies.

```
yarn
cd render && yarn
```

#### Run render process project

Under the root directory, run the following to start the render process project.

ZeroPass Server URL: ZeroPass Server Deployment URL (https://xxxxxxx)

```
cd render
npm start --PROXY_URL=[ZeroPass Server URL]
```

#### Run main process project

Under the root directory, run the following to start the main process project.

```
npm run electron
```

## Deployment

#### Install dependencies

Under the root directory, run the following to install the dependencies.

```
yarn
cd render && yarn
```

#### Build project

Under the root directory, run the following to build the project.

ZeroPass Server URL: ZeroPass Server Deployment URL (https://xxxxxxx)  
ZeroPass Client update URL(option): ZeroPass Client Deployment URL (https://xxxxxx)

```
npm run electron-win:build --BASE_URL=[ZeroPass Server URL] --UPDATE_URL=[ZeroPass Client update URL]
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for details on the contributing and our code of conduct.

## Versioning

For the versions available, see the [tags on this repository](https://github.com/metaguardpte/ZeroPass-Client/tags).

## Releases

For the releases available, see the [releases on this repository](https://github.com/metaguardpte/ZeroPass-Client/releases).

## Authors

See the list of [contributors](https://github.com/metaguardpte/ZeroPass-Client/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
