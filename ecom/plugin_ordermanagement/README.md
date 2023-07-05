# plugin\_ordermanagement: Storefront Reference Architecture (SFRA)

This is the repository for the plugin\_ordermanagement plugin. This plugin enhances the app\_storefront\_base cartridge by providing "Salesforce Order Management self service" functionality, including the following capabilities:

* Shoppers as a guest can search for their order.
* Shoppers as a register user can view their order history.
* Shoppers can view the status of their order.
* Shoppers can initiate a return for non-RMA products 
* Shoppers can cancel an order that has not been picked up by a fulfillment

# Cartridge Path Considerations
The plugin\_ordermanagement plugin requires the app\_storefront\_base cartridge. In your cartridge path, include the cartridges in the following order:

```
plugin_ordermanagement:app_storefront_base
```

# Template Conflicts
  
Each template in the following table is present in multiple cartridges. If the file exists in the app\_storefront\_base cartridge and in this plugin cartridge, the plugin template overrides the base template. The presence of a template file in multiple plugin cartridges indicates a conflict that you have to resolve in a customization cartridge. However, if you are using only one of the conflicting plugin cartridges, no action is necessary.
 
| Template File | Cartridge | Location |
| :--- | :--- | :--- |
|dashboardProfileCards.isml|app\_storefront\_base|app_storefront_base/cartridge/templates/default/account/dashboardProfileCards.isml|
|dashboardProfileCards.isml|plugin\_cartridge\_merge|plugin_cartridge_merge/cartridges/plugin_cartridge_merge/cartridge/templates/default/account/dashboardProfileCards.isml|
|dashboardProfileCards.isml|plugin\_giftregistry|plugin_giftregistry/cartridges/plugin_giftregistry/cartridge/templates/default/account/dashboardProfileCards.isml|
|dashboardProfileCards.isml|plugin\_wishlists|plugin_wishlists/cartridges/plugin_wishlists/cartridge/templates/default/account/dashboardProfileCards.isml|
|orderDetails.isml|app\_storefront\_base|app_storefront_base/cartridge/templates/default/account/orderDetails.isml|
|history.isml|app\_storefront\_base|app_storefront_base/cartridge/templates/default/account/order/history.isml|
|orderHistoryCard.isml|app\_storefront\_base|app_storefront_base/cartridge/templates/default/account/order/orderHistoryCard.isml|

# Getting Started

1. Clone this repository. (The name of the top-level folder is plugin\_ordermanagement.)
2. In the top-level plugin\_ordermanagement folder, enter the following command: `npm install`. (This command installs all of the package dependencies required for this plugin.)
3. In the top-level plugin\_ordermanagement folder, edit the paths.base property in the package.json file. This property should contain a relative path to the local directory containing the Storefront Reference Architecture repository. For example:
```
"paths": {
    "base": "../storefront-reference-architecture/cartridges/app_storefront_base/"
  }
```
4. In the top-level plugin\_ordermanagement folder, enter the following command: `npm run compile:js && npm run compile:scss`
5. Create `dw.json` file in the root of the project. Please note that there is no need to provide the [webdav_access_key_from_BM](https://documentation.b2c.commercecloud.salesforce.com/DOC1/index.jsp?topic=%2Fcom.demandware.dochelp%2Fcontent%2Fb2c_commerce%2Ftopics%2Fadmin%2Fb2c_access_keys_for_business_manager.html) in this file as you will be prompted if not provided in this file :
```json
{
    "hostname": "your-sandbox-hostname.demandware.net",
    "username": "AM username like me.myself@company.com",
    "password": "webdav_access_key_from_BM",
    "code-version": "version_to_upload_to"
}
```
6. In the top-level plugin\_ordermanagement folder, enter the following command: `npm run uploadCartridge`

# Configuration
The plugin\_ordermanagement cartridge uses the [somPreferences.js](cartridges/plugin_ordermanagement/cartridge/config/somPreferences.js) as configuration file as a way to improve extensibility. This configuration file contains the following settings:

* `somServiceID` - ID string for connection.
* `version` - version string, used to create the HTTP request address to the API
* `urlBegin` - base URL string, used to create the HTTP request address to the API
* `somApiEndpoints` - an object with different endpoints for different requests 
* `orderHistoryQuery` - prepared query requests for composite API
* `checkNonRMA` - enables check for availability of return option for products marked with a special custom attribute
* `nonRMAProductCustomAttribute` - the identifier of the custom attribute of the product, which is marked with a product that is not available for return
* `nonRMAInfoAsset` - the identifier of the asset content for the information popup on the page for selecting products to return (if a non-existing one is specified, the popup call button is hidden)
* `cancelShippingReductionFlag` - reduction control flag on cancel
* `returnShippingReductionFlag` - reduction control flag on return
* `statusOrdered` - constant for internal use
* `statusInProgress` - constant for internal use
* `statusShipped` - constant for internal use
* `statusCanceled` - constant for internal use
* `statusReturned` - constant for internal use
* `statusFulfilled` - constant for internal use
* `filters` - filters for order history page
* `filterUnits` - pre-calculated duration constants for different time period
* `cancelReason` - list of available reasons for cancellation
* `returnReason` - list of available reasons for return

## Creating a Custom Product Property for the nonRMAProductCustomAttribute
The Self Service feature supports non-RMA, immediate refund style returns.  If this type of return is not suitable for your business, then you must make the product ineligible for returns in Self Service.

1. Log in to Salesforce Commerce Cloud Business Manager.
2. Select **_Administration >  Site Development >  System Object Types_**.
3. On the System Object Type List page, click the **Product** system object.
4. Click the **Attribute Definitions** tab, and click **New** to begin the definition process.
5. Select the Value Type as boolean type.
6. Give the custom attribute the ID “nonRMA”.
7. Write the identifier of the created field to the nonRMAProductCustomAttribute  property in the config file. 
8. Click Back, and add the created attribute to the existing attribute group, or create a new attribute group in the "Attribute Groups" tab.
9. On the product page, set the created flag to a positive value for non-returnable items.

## Salesforce Org 

### App Permissions
The Edit Activated Order permission is required for cancellations and returns to function correctly. To enable:

1. Navigate to Setup page of your Salesforce Org.
2. From Setup, navigate to **_Permission Sets > OMSelfServicePermissions > App Permissions_** and enable the **Edit Activated Order** permission.

### Grant Trust Process for SFRA Self-Service
A trusted relationship between Salesforce core platform and SFRA self-service is required to retrieve the order information. Salesforce support manages the process of establishing trust. Open a [support ticket](https://help.salesforce.com/articleView?id=000329621&type=1&mode=1) and request trust granted for SOM-SFRA Self-Service. Be sure to include your Salesforce Org ID and your B2C Business Manager URL.

### Enable SFRA Toggle in Salesforce Core
After trust is granted, in Setup go to **Settings** > **Order Management**, and enable the B2C Commerce Connection toggle. Orders in Salesforce Core won’t appear in SFRA Self-Service until this toggle is enabled.

# NPM scripts
Use the provided NPM scripts to compile and upload changes to your Sandbox.

## Compiling your application

* `npm run compile:scss` - Compiles all scss files into css.
* `npm run compile:js` - Compiles all js files and aggregates them.

## Linting your code

`npm run lint` - Execute linting for all JavaScript and SCSS files in the project. You should run this command before committing your code.

## Watching for changes and uploading

`npm run watch:static` - Watches js and scss files for changes, recompiles them and uploads result to the sandbox. Requires a valid dw.json file at the root that is configured for the sandbox to upload.

`npm run watch:cartridge` - Watches all cartridge files (except for static content) and uploads it to sandbox. Requires a valid dw.json file at the root that is configured for the sandbox to upload.

`npm run watch` - Watches everything and recompiles (if necessary) and uploads to the sandbox. Requires a valid dw.json file at the root that is configured for the sandbox to upload.

# Testing
## Running unit tests

You can run `npm test` to execute all unit tests in the project. Run `npm run cover` to get coverage information. Coverage will be available in `coverage` folder under root directory.

# Additional Notes

## force.com API
3 main APIs are used to read and write data from SOM. These 3 APIs are used to accomplish the tasks set for the cartridge, which enables the user to manage their orders on their own.
1. Endpoint: `/services/data/v51.0/query` 
SOQL queries are a specific SQL for Salesforce objects, used to access data stored on the Salesforce platform.
Some objects have child relationships to their parents, which allows you to get the parent and the associated children in one request. However, if you are addressing the parent object, then you must write the name of the object after FROM. When you describe which child object to get, you must use a special Child Relation name.
2. Endpoint: `/services/data/v51.0/composite`
Used to unite several requests to the API in one call. Query objects are formed in a chain. It is possible to use the results of previous requests in future requests, making it possible to form rather complex single calls.
3. Endpoint: `/services/data/v51.0/action`
These calls are used for manipulating objects.

## Frontend JavaScript

The cancelation.js and return.js files are similar to each other, but there are differences in the reason choice. For cancellation the reason is the same for all marked goods, but for the return you can choose a different ‘Reason Choice’ for each product. 
There is a small peculiarity of how the user gets to the success page after confirming the desire to cancel or return. The confirmation is sent using the ajax request, and if the request is successfully completed, the URL of the success page comes to the script and the JavaScript sends the user to this address.

## Non-RMA Returns
If the checkNonRMA setting is enabled, then the value from the product property is added to the [orderHelpers.js](cartridges/plugin_ordermanagement/cartridge/scripts/order/orderHelpers.js) file in the `addProductData` function.

If the setting is disabled, the value from the product property is ignored and all products become available for return regardless of the properties of the products themselves

## Nuances
* Cost of Delivery
If the order contains a product on which an additional delivery cost is imposed, the order value is not calculated correctly on the force.com side since this cost is added as an additional invisible product.
Also, if a fixed cost for a different basket price is configured for shipping, the delivery cost may not be recalculated correctly. If it is configured, the cost of delivery of goods depends on the amount of the order. For example, if there is less than $100 worth of products in the basket, then delivery costs $10, if between $100 and $200 then $15. If someone orders two products for $75 each, there is $150 in the basket, and the delivery cost is $15; however if they cancel one of the items, force.com is not able to correctly calculate the delivery cost according to our rules.

* Commerce Cloud connects to the force platform without a user, but uses the "OMSelfServicePermissionSet" group to control access levels. 

* If the shipping method is not present on the platform, then the order with this method is not imported. This throws the exception “OrderMapping: `[<sandboxId>]` Missing shipping method `'<shippingMethodId>'`”.
 
* If you are receiving an error with status code "INVALID_API_INPUT" with message "No matching reason found. Provide a valid cancel reason.", ensure that the reasons defined in [somPreferences.js](cartridges/plugin_ordermanagement/cartridge/config/somPreferences.js) match the reasons defined in the Salesforce Org   

* At this time the cartridge `plugin_ordermanagement` is intended to only work with the SFRA base cartridge. It is not intended to work in conjunction with other SFRA plugins.
