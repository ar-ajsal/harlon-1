
    (function() {
      var cdnOrigin = "https://cdn.shopify.com";
      var scripts = ["/cdn/shopifycloud/checkout-web/assets/c1/polyfills-legacy.uhRbxNvx.js","/cdn/shopifycloud/checkout-web/assets/c1/app-legacy.CAgHHgBJ.js","/cdn/shopifycloud/checkout-web/assets/c1/dist-vendor-legacy.C0qluXxG.js","/cdn/shopifycloud/checkout-web/assets/c1/browser-legacy.DGSUaKOj.js","/cdn/shopifycloud/checkout-web/assets/c1/approval-scopes-FullScreenBackground-legacy.D5zPS6xo.js","/cdn/shopifycloud/checkout-web/assets/c1/shared-unactionable-errors-legacy.Da1s8eA2.js","/cdn/shopifycloud/checkout-web/assets/c1/actions-shop-discount-offer-legacy.Cxxn-Ct8.js","/cdn/shopifycloud/checkout-web/assets/c1/utilities-alternativePaymentCurrency-legacy.CFuC7aew.js","/cdn/shopifycloud/checkout-web/assets/c1/utils-proposal-legacy.P5vmxbM2.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-useHasOrdersFromMultipleShops-legacy.C7L6ZpJ2.js","/cdn/shopifycloud/checkout-web/assets/c1/locale-en-legacy.B-o54M20.js","/cdn/shopifycloud/checkout-web/assets/c1/page-OnePage-legacy.BWwXkhJN.js","/cdn/shopifycloud/checkout-web/assets/c1/Captcha-PaymentButtons-legacy.DKjnEGmk.js","/cdn/shopifycloud/checkout-web/assets/c1/Menu-LocalPickup-legacy.ryn6Zai-.js","/cdn/shopifycloud/checkout-web/assets/c1/timeout-trigger-MarketsProDisclaimer-legacy.DcS9hqsi.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-NoAddressLocation-legacy.C-0pCZEC.js","/cdn/shopifycloud/checkout-web/assets/c1/shopPaySessionTokenStorage-Page-legacy.M9NOw78V.js","/cdn/shopifycloud/checkout-web/assets/c1/icons-OffsitePaymentFailed-legacy.BxcpGSkb.js","/cdn/shopifycloud/checkout-web/assets/c1/icons-ShopPayLogo-legacy.CxYpQwi1.js","/cdn/shopifycloud/checkout-web/assets/c1/BuyWithPrimeChangeLink-VaultedPayment-legacy.DdO939TH.js","/cdn/shopifycloud/checkout-web/assets/c1/DeliveryMacros-ShippingGroupsSummaryLine-legacy.CUUB9RR8.js","/cdn/shopifycloud/checkout-web/assets/c1/MerchandisePreviewThumbnail-StackedMerchandisePreview-legacy.C-vKp5pv.js","/cdn/shopifycloud/checkout-web/assets/c1/Map-PickupPointCarrierLogo-legacy.TirXxo_v.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-legacy.DVgleRmf.js","/cdn/shopifycloud/checkout-web/assets/c1/PostPurchaseShouldRender-AddDiscountButton-legacy.CU9cIjB5.js","/cdn/shopifycloud/checkout-web/assets/c1/graphql-RememberMeDescriptionText-legacy.CJLEZqs4.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-ShopPayOptInDisclaimer-legacy.B-wWRgrT.js","/cdn/shopifycloud/checkout-web/assets/c1/utilities-MobileOrderSummary-legacy.BK63DX0X.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-OrderEditVaultedDelivery-legacy.DNNczDSV.js","/cdn/shopifycloud/checkout-web/assets/c1/captcha-SeparatePaymentsNotice-legacy.BBS9WBcK.js","/cdn/shopifycloud/checkout-web/assets/c1/StockProblems-StockProblemsLineItemList-legacy.Dp6Ix83o.js","/cdn/shopifycloud/checkout-web/assets/c1/redemption-useShopCashCheckoutEligibility-legacy.b_5ms-tR.js","/cdn/shopifycloud/checkout-web/assets/c1/negotiated-ShipmentBreakdown-legacy.DP2-pgfF.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-MerchandiseModal-legacy.B1XHTyQU.js","/cdn/shopifycloud/checkout-web/assets/c1/utilities-shipping-options-legacy.M4_qK-YU.js","/cdn/shopifycloud/checkout-web/assets/c1/graphql-DutyOptions-legacy.D-DEfZkF.js","/cdn/shopifycloud/checkout-web/assets/c1/DeliveryInstructionsFooter-ShippingMethodSelector-legacy.BX5ghmH-.js","/cdn/shopifycloud/checkout-web/assets/c1/hooks-SubscriptionPriceBreakdown-legacy.CSgijTpE.js"];
      var styles = [];
      var fontPreconnectUrls = [];
      var fontPrefetchUrls = [];
      var imgPrefetchUrls = [];

      function preconnect(url, callback) {
        var link = document.createElement('link');
        link.rel = 'dns-prefetch preconnect';
        link.href = url;
        link.crossOrigin = '';
        link.onload = link.onerror = callback;
        document.head.appendChild(link);
      }

      function preconnectAssets() {
        var resources = [cdnOrigin].concat(fontPreconnectUrls);
        var index = 0;
        (function next() {
          var res = resources[index++];
          if (res) preconnect(res, next);
        })();
      }

      function prefetch(url, as, callback) {
        var link = document.createElement('link');
        if (link.relList.supports('prefetch')) {
          link.rel = 'prefetch';
          link.fetchPriority = 'low';
          link.as = as;
          if (as === 'font') link.type = 'font/woff2';
          link.href = url;
          link.crossOrigin = '';
          link.onload = link.onerror = callback;
          document.head.appendChild(link);
        } else {
          var xhr = new XMLHttpRequest();
          xhr.open('GET', url, true);
          xhr.onloadend = callback;
          xhr.send();
        }
      }

      function prefetchAssets() {
        var resources = [].concat(
          scripts.map(function(url) { return [url, 'script']; }),
          styles.map(function(url) { return [url, 'style']; }),
          fontPrefetchUrls.map(function(url) { return [url, 'font']; }),
          imgPrefetchUrls.map(function(url) { return [url, 'image']; })
        );
        var index = 0;
        function run() {
          var res = resources[index++];
          if (res) prefetch(res[0], res[1], next);
        }
        var next = (self.requestIdleCallback || setTimeout).bind(self, run);
        next();
      }

      function onLoaded() {
        try {
          if (parseFloat(navigator.connection.effectiveType) > 2 && !navigator.connection.saveData) {
            preconnectAssets();
            prefetchAssets();
          }
        } catch (e) {}
      }

      if (document.readyState === 'complete') {
        onLoaded();
      } else {
        addEventListener('load', onLoaded);
      }
    })();
  