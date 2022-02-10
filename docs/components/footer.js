define(["require", "exports", "preact"], function (require, exports, preact_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Footer = void 0;
    const _DEFAULT_LINKS = [
        {
            name: "About Oracle",
            linkId: "aboutOracle",
            linkTarget: "http://www.oracle.com/us/corporate/index.html#menu-about"
        },
        {
            name: "Contact Us",
            linkId: "contactUs",
            linkTarget: "http://www.oracle.com/us/corporate/contact/index.html"
        },
        {
            name: "Legal Notices",
            linkId: "legalNotices",
            linkTarget: "http://www.oracle.com/us/legal/index.html"
        },
        {
            name: "Terms Of Use",
            linkId: "termsOfUse",
            linkTarget: "http://www.oracle.com/us/legal/terms/index.html"
        },
        {
            name: "Your Privacy Rights",
            linkId: "yourPrivacyRights",
            linkTarget: "http://www.oracle.com/us/legal/privacy/index.html"
        }
    ];
    function Footer({ links = _DEFAULT_LINKS }) {
        return (preact_1.h("footer", { class: "oj-web-applayout-footer", role: "contentinfo" },
            preact_1.h("div", { class: "oj-web-applayout-footer-item oj-web-applayout-max-width" },
                preact_1.h("ul", null, links.map((item) => (preact_1.h("li", null,
                    preact_1.h("a", { id: item.linkId, href: item.linkTarget, target: "_blank" }, item.name)))))),
            preact_1.h("div", { class: "oj-web-applayout-footer-item oj-web-applayout-max-width oj-text-secondary-color oj-text-sm" }, "Copyright \u00A9 2014, 2022 Oracle and/or its affiliates All rights reserved.")));
    }
    exports.Footer = Footer;
});
