# United Health Care (SFRA)

# The latest version

The latest version of SFRA is 6.1.0

# Getting Started

1. Clone this repository.

2. Go to `sfra-webpack-builder` folder and open the terminal

3. Run `npm install` to install all of the local dependencies (SFRA has been tested with v14.18.2 and is recommended)

4. Run `npm run npmInstall` to install all of the local dependencies for all the cartridges.

5. Run `npm run dev` from the command line that would compile all client-side JS and CSS files.

6. Create `dw.json` file in the root of the project. Providing a [WebDAV access key from BM](https://documentation.b2c.commercecloud.salesforce.com/DOC1/index.jsp?topic=%2Fcom.demandware.dochelp%2Fcontent%2Fb2c_commerce%2Ftopics%2Fadmin%2Fb2c_access_keys_for_business_manager.html) in the `password` field is optional, as you will be prompted if it is not provided.
```json
{
    "hostname": "your-sandbox-hostname.demandware.net",
    "username": "AM username like me.myself@company.com",
    "password": "your_webdav_access_key",
    "code-version": "version_to_upload_to"
}
```

7. You should now be ready to navigate to and use your site.

# NPM scripts
Use the provided NPM scripts to compile and upload changes to your Sandbox.

## Compiling your application

* `npm run dev` - Compiles all .scss and .js files into CSS and js.

## Linting your code

`npm run lint` - Execute linting for all JavaScript and SCSS files in the project. You should run this command before committing your code.

## Watching for changes and uploading

`npm run watch` - Watches everything and recompiles (if necessary) and uploads to the sandbox. Requires a valid `dw.json` file at the root that is configured for the sandbox to upload.