"use strict";

const path = require("path");

/**
 * Allows to configure aliases for you require loading
 */
module.exports.aliasConfig = {
    // enter all aliases to configure

    alias: {
        base: path.resolve(
            process.cwd(), // eslint-disable-next-line max-len
            "../storefront-reference-architecture/cartridges/app_storefront_base/cartridge/client/default/"
        ),
        ordermanagement: path.resolve(
            process.cwd(), // eslint-disable-next-line max-len
            "../plugin_ordermanagement/cartridges/plugin_ordermanagement/cartridge/client/default/"
        ),
        core: path.resolve(
            process.cwd(), // eslint-disable-next-line max-len
            "../united-health-care/cartridges/app_custom_uhc_core/cartridge/client/default/"
        ),
        uhch: path.resolve(
            process.cwd(), // eslint-disable-next-line max-len
            "../united-health-care/cartridges/app_custom_uhch/cartridge/client/default/"
        ),
        uhchearing: path.resolve(
            process.cwd(), // eslint-disable-next-line max-len
            "../united-health-care/cartridges/app_custom_uhchearing/cartridge/client/default/"
        ),
        aarphearing: path.resolve(
            process.cwd(), // eslint-disable-next-line max-len
            "../united-health-care/cartridges/app_custom_aarphearing/cartridge/client/default/"
        ),
        epichearing: path.resolve(
            process.cwd(), // eslint-disable-next-line max-len
            "../united-health-care/cartridges/app_custom_epichearing/cartridge/client/default/"
        ),
        adobeDatalayer: path.resolve(
            process.cwd(), // eslint-disable-next-line max-len
            "../abode_datalayer/cartridges/int_adobe_datalayer/cartridge/client/default/"
        ),
        paymentPortal: path.resolve(
            process.cwd(), // eslint-disable-next-line max-len
            "../payment-portal-integration/cartridges/int_custom_payment/cartridge/client/default/"
        )
    },
};

/**
 * Allows copying files to static folder
 */
module.exports.copyConfig = {
    "./cartridges/app_storefront_base": [{
            from: "./node_modules/font-awesome/fonts/",
            to: "default/fonts"
        },
        {
            from: "./node_modules/flag-icon-css/flags",
            to: "default/fonts/flags"
        },
    ],
};

/**
 * Allows custom include path config
 */
module.exports.includeConfig = {
    "../storefront-reference-architecture/cartridges/app_storefront_base": {
        scss: ["my-custom-node_modules"],
    },
};

/**
 * Exposes cartridges included in the project
 */
module.exports.cartridges = [
    "../storefront-reference-architecture/cartridges/app_storefront_base",
    "../plugin_ordermanagement/cartridges/plugin_ordermanagement/",
    "../united-health-care/cartridges/app_custom_uhch/",
    "../united-health-care/cartridges/app_custom_uhc_core/",
    "../united-health-care/cartridges/app_custom_uhchearing/",
    "../united-health-care/cartridges/app_custom_aarphearing/",
    "../united-health-care/cartridges/app_custom_epichearing/",
    "../abode_datalayer/cartridges/int_adobe_datalayer/",
    "../payment-portal-integration/cartridges/int_custom_payment/"
];

/**
 * Lint options
 */
module.exports.lintConfig = {
    eslintFix: true,
    stylelintFix: true,
};
