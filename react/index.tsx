import { PixelMessage } from "./typings/events";
import { canUseDOM } from "vtex.render-runtime";

function handleMessages(e: PixelMessage) {
  const {
    __btg360: { BTGId: account, BTGDomain: domain },
    location: { pathname }
  } = window;
  switch (e.data.eventName) {
    case "vtex:pageInfo": {
      if (e.data.eventType === "internalSiteSearchView") {
        const items = pathname
          .split("?")[0]
          .split("/")
          .filter(item => item.toLocaleLowerCase())
          .map(keyword => ({ keyword }));
        const event = "search";
        const BTG360SearchEvent = {
          account,
          domain,
          event,
          items
        };
        Btg360.add(BTG360SearchEvent);
      }
      break;
    }
    case "vtex:orderPlaced": {
      const { transactionId, transactionProducts: items } = e.data;
      const BTG360TransactionEvent = {
        account,
        domain,
        event: "transaction",
        items: items.map(({ sku: id, name, price, categoryTree: [department = "", category = "", subcategory = ""], brand }) => ({
          transactionId,
          id,
          name,
          price: price.toFixed(2),
          department,
          category,
          subcategory,
          brand
        }))
      };
      Btg360.add(BTG360TransactionEvent);
      break;
    }
    case "vtex:productView": {
      const {
        product: {
          productId: id,
          productName: name,
          categories,
          brand,
          items: [
            {
              sellers: [
                {
                  commertialOffer: { Price: price }
                }
              ]
            }
          ]
        }
      } = e.data;
      const [categoryTree] = categories;
      const [department = "", category = "", subcategory = ""] = categoryTree.split("/").filter(item => item);
      const BTG360ProductEventItem = {
        id,
        name,
        price: price.toFixed(2),
        department,
        category,
        subcategory,
        brand
      };
      const BTG360ProductEvent = {
        account,
        domain,
        event: "product",
        items: [BTG360ProductEventItem]
      };
      Btg360.add(BTG360ProductEvent);
      break;
    }
    case "vtex:addToCart": {
      const { items } = e.data;
      const BTG360CartEvent = {
        account,
        domain,
        event: "cart",
        items: items.map(({ name, price, skuId: id, brand, category: categoryTree }) => {
          const [department = "", category = "", subcategory = ""] = categoryTree.split("/");
          return {
            id,
            name: name.toUpperCase(),
            price: price.toFixed(2),
            department,
            category,
            subcategory,
            brand
          };
        })
      };
      Btg360.add(BTG360CartEvent);
      break;
    }
  }
}

if (canUseDOM) {
  window.addEventListener("message", handleMessages);
}
