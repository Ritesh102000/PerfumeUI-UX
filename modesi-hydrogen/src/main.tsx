import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ShopifyProvider } from "@shopify/hydrogen-react";
import App from "./App";
import { hasHydrogenToken, hydrogenConfig } from "./commerce";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {hasHydrogenToken ? (
      <ShopifyProvider
        storeDomain={hydrogenConfig.storeDomain}
        storefrontToken={hydrogenConfig.storefrontToken}
        storefrontApiVersion={hydrogenConfig.apiVersion}
        countryIsoCode="IN"
        languageIsoCode="EN"
      >
        <App />
      </ShopifyProvider>
    ) : <App />}
  </StrictMode>,
);
