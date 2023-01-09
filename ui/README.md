# Image-pair 

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Setup

You need `node 18.x.x` and `yarn` installed in your machine.

To install `node`, please follow the instructions for your architecture on the [Node download page](https://nodejs.org/en/).

To install yarn, please follow the instructions on the [Yarn installation page](https://yarnpkg.com/getting-started/install).

## Run the project

In the project directory, you can run:

### Create symlink to your image library

The UI app needs to access images to annotate from the `./ui/public/data/images` folder.
You can create a symlink by running the following command from the root of the repository.

```bash
ln -s /your/image/library/path ./ui/public/data/images
```

### Install all the dependencies

From the `./ui/` folder, run:

```bash
yarn
```

### Run the UI app

From the `./ui/` folder, run:

```bash
yarn start
```

Which will start the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.
