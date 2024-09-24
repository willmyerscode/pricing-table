class PricingTable {
  static pluginTitle = "wmPricingTable";
  static defaultSettings = {
    titleTag: 'h3',
    subtitleTag: 'p',
    priceTag: 'h4',
    monthlyText: 'Monthly', 
    annuallyText: 'Annually',
    hooks: {
      beforeInit: [
        function () {
          
        },
      ],
      afterInit: [
        function () {
          
        },
      ],
      beforeOpenTab: [
        function () {
          
        },
      ],
      afterOpenTab: [
        function () {
          
        },
      ],
    },
  };
  static get userSettings() {
    return window[PricingTable.pluginTitle + "Settings"] || {};
  }
  constructor(el) {
    this.el = el;
    this.source = el.dataset.source;
    this.loadingState = "building";
    
    this.settings = this.deepMerge(
      {},
      PricingTable.defaultSettings,
      PricingTable.userSettings,
      this.instanceSettings
    );

    this.priceSuffix = this.el.getAttribute('data-suffix');
    if(this.priceSuffix) {
      this.priceSuffix = this.priceSuffix.toLowerCase();
      this.priceSuffix = this.priceSuffix.trim();
    }

    this.customBullets = this.el.getAttribute('data-bullets');
    if(this.customBullets) {
      this.customBullets = this.customBullets.toLowerCase();
      this.customBullets = this.customBullets.trim();
    }

    this.recommended = this.el.getAttribute('data-recommended');
    if(this.recommended) {
      this.recommended = this.recommended.toLowerCase();
      this.recommended = this.recommended.trim();
    }
    
    this.init();
  }
  async init() {
    this.runHooks("beforeInit");
    this.data = await this.getData(this.source);
    this.buildStructure()
    this.runHooks("afterInit");
  }
  async getData(url) {
    try {
      // Fetch the content from the URL
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const html = await response.text();
      const data = []
      const selector = '.page-section .user-items-list-item-container[data-current-context]'
  
      // Parse the HTML and extract content based on the selector
      // Create a new DOM parser
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const listSection = doc.querySelectorAll(selector);
      listSection.forEach(section => {
        const json = JSON.parse(section.dataset.currentContext)
        data.push(json)
      })
  
      // Return the outer HTML of the selected element or an empty string if not found
      return data;
    } catch (error) {
      console.error("Error fetching URL:", error);
      return "";
    }
  }
  bindEvents() {

  }
  
  buildStructure() {

    const listSectionDataOne = this.data[0]
    const itemsSectionOne = listSectionDataOne.userItems;

    const pricingWrapper = document.createElement('div');
    pricingWrapper.classList.add('pricing-wrapper');
    this.el.append(pricingWrapper);

    const wrapper = document.createElement('div')
    wrapper.classList.add('wm-pricing-table')
    wrapper.classList.add('pricing-active');
    pricingWrapper.append(wrapper);

    itemsSectionOne.forEach(item => {
      
      const pricingItem = document.createElement('div');
      pricingItem.classList.add('pricing-item');

      const titleWrapper = document.createElement('div');
      titleWrapper.classList.add('title-wrapper');
      pricingItem.append(titleWrapper);
      
      const itemTitle = this.getTitle(item);
      const titleElement = document.createElement(`${(this.settings.titleTag)}`);
      titleElement.classList.add('pricing-title')
      titleElement.innerHTML = itemTitle;
      titleWrapper.append(titleElement);

      const subtitle = this.getSubtitle(item);

      if (subtitle) {
        const subtitleElement = document.createElement(`${this.settings.subtitleTag}`);
        subtitleElement.classList.add('pricing-subtitle');
        subtitleElement.innerText = subtitle;
        titleWrapper.append(subtitleElement);
      }

      const price = this.getPrice(item);
      const itemPrice = document.createElement(`${(this.settings.priceTag)}`);
      itemPrice.classList.add('pricing-price');
      itemPrice.innerText = price;
      pricingItem.append(itemPrice);

      const description = this.getDescription(item);
      const pricingContent = document.createElement('div');
      pricingContent.classList.add('pricing-content');
      pricingContent.innerHTML = description;
      pricingItem.append(pricingContent);

      const button = document.createElement('a');
      button.classList.add('pricing-button');
      button.classList.add('sqs-button-element--primary');
      button.href = item.button.buttonLink;
      button.innerText = item.button.buttonText;
      pricingItem.append(button);
      
      wrapper.append(pricingItem);
    })

    if (this.data[1]) {
      const listSectionDataTwo = this.data[1];
      const itemsSectionTwo = listSectionDataTwo.userItems;

      const secondWrapper = document.createElement('div')
      secondWrapper.classList.add('wm-pricing-table')

      itemsSectionTwo.forEach(item => {
      
      const pricingItem = document.createElement('div');
      pricingItem.classList.add('pricing-item');

      const titleWrapper = document.createElement('div');
      titleWrapper.classList.add('title-wrapper');
      pricingItem.append(titleWrapper);

      const itemTitle = this.getTitle(item);
      const titleElement = document.createElement(`${(this.settings.titleTag)}`);
      titleElement.classList.add('pricing-title')
      titleElement.innerHTML = itemTitle;
      titleWrapper.append(titleElement);

      const subtitle = this.getSubtitle(item);

      if (subtitle) {
        const subtitleElement = document.createElement(`${this.settings.subtitleTag}`);
        subtitleElement.classList.add('pricing-subtitle');
        subtitleElement.innerText = subtitle;
        titleWrapper.append(subtitleElement);
      }

      const price = this.getPrice(item);
      const itemPrice = document.createElement(`${(this.settings.priceTag)}`);
      itemPrice.classList.add('pricing-price');
      itemPrice.innerText = price;
      pricingItem.append(itemPrice);

      const description = this.getDescription(item);
      const pricingContent = document.createElement('div');
      pricingContent.classList.add('pricing-content');
      pricingContent.innerHTML = description;
      pricingItem.append(pricingContent);

      const button = document.createElement('a');
      button.classList.add('pricing-button');
      button.classList.add('sqs-button-element--primary');
      button.href = item.button.buttonLink;
      button.innerText = item.button.buttonText;
      pricingItem.append(button);
      
      secondWrapper.append(pricingItem);
    })
      pricingWrapper.append(secondWrapper);
      this.addToggle();
    }
    
    this.pricingSuffix();
    this.customizeBullets();
    this.recommendedTag();
  }
  getTitle(item) {
    const title = item.title;

    var titleElement = document.createElement('div');
    titleElement.innerText = title;

    const cleanedTitle = title.replace(/\[.*?\]/g, '');
    titleElement.innerText = cleanedTitle.trim();

    return(titleElement.innerText);
 
  }
  getSubtitle(item) {
    const title = item.title;

    var subtitle = title.match(/\[.*?\]/g, '');
    if (subtitle) {
      subtitle[0] = subtitle[0].replace(/^\[|\]$/g, '');
      return(subtitle[0]);
    }
  }
  getPrice(item) {
    const description = item.description;

    const descriptionElement = document.createElement('div');
    descriptionElement.innerHTML = description;

    var priceLink = descriptionElement.querySelector('a[href="#price"');

    var price = "";

    if (priceLink) {
      price = priceLink.innerText;
    }

    return(price);

  }
  getDescription(item) {
    const description = item.description;
    const descriptionElement = document.createElement('div');
    descriptionElement.innerHTML = description;
    
    // Remove price link
    const priceLink = descriptionElement.querySelector('a[href="#price"]');
    if (priceLink) {
      priceLink.closest('p').remove();
    }
    
    // Create bullet points
    const paragraphs = descriptionElement.querySelectorAll('p');
    let hasBulletPoints = false;
    const bulletList = document.createElement('ul');
    bulletList.dataset.rteList = "default";
  
    paragraphs.forEach(function(paragraph) {
      if (paragraph.textContent.trim().startsWith('-')) {
        hasBulletPoints = true;
        const listItem = document.createElement('li');
        
        // Remove the leading dash and any whitespace after it
        paragraph.textContent = paragraph.textContent.replace(/^-\s*/, '');
        
        // Move the paragraph into the list item
        listItem.appendChild(paragraph);
        
        bulletList.appendChild(listItem);
      }
    });
    
    if (hasBulletPoints) {
      descriptionElement.appendChild(bulletList);
    }
    
    let updatedDescription = descriptionElement.innerHTML;
    return updatedDescription;
  }
  pricingSuffix(){
    const prices = document.querySelectorAll('.pricing-price');

    if (this.priceSuffix == 'true') {
      prices.forEach (price => {
        price.classList.add('price-suffix');
      })
    }

    else {
      return;
    }
  }
  customizeBullets(){
  
    const content = document.querySelectorAll('.pricing-content');
    
    if (this.customBullets == 'true') {
      content.forEach (section => {
        const bullets = section.querySelectorAll('ul');
        bullets.forEach (bullet => {
          bullet.classList.add('custom-bullets');
        })
      })
    }

    else {
      return;
    }
    
  }
  recommendedTag() {
  const pricingTables = document.querySelectorAll('.wm-pricing-table');
  
  pricingTables.forEach((table, index) => {
    const pricingItems = table.querySelectorAll('.pricing-item');
    
    if (this.recommended && pricingItems[this.recommended - 1]) {
      pricingItems[this.recommended - 1].classList.add('recommended');
    }
  });
  }
  addToggle(){
    const toggle = document.createElement('div');
    toggle.classList.add('pricing-toggle');

    const primary = document.createElement('button');
    primary.classList.add('toggle-primary');
    primary.classList.add('active');
    const primaryText = document.createElement('p');
    primaryText.innerText = this.settings.monthlyText; // Fix here
    primary.append(primaryText);

    const secondary = document.createElement('button');
    secondary.classList.add('toggle-secondary');
    const secondaryText = document.createElement('p');
    secondaryText.innerText = this.settings.annuallyText; // Fix here
    secondary.append(secondaryText);

    const active = document.createElement('div');
    active.classList.add('toggle-active');
    active.classList.add('primary');

    toggle.append(primary);
    toggle.append(secondary);
    toggle.append(active);
    this.el.prepend(toggle);

    this.toggleEvent();
  }
  toggleEvent() {
    const primaryLink = this.el.querySelector('.toggle-primary');
    const secondaryLink = this.el.querySelector('.toggle-secondary');
    const activeBar = this.el.querySelector('.toggle-active');
    const pricingTables = this.el.querySelectorAll('.wm-pricing-table');
    

    primaryLink.addEventListener('click', () => {
      primaryLink.classList.add('active');
      secondaryLink.classList.remove('active');
      activeBar.classList.add('primary');
      activeBar.classList.remove('secondary');
      pricingTables[0].classList.add('pricing-active');
      pricingTables[1].classList.remove('pricing-active');
    })

    secondaryLink.addEventListener('click', () => {
      primaryLink.classList.remove('active');
      secondaryLink.classList.add('active');
      activeBar.classList.remove('primary');
      activeBar.classList.add('secondary');
      pricingTables[0].classList.remove('pricing-active');
      pricingTables[1].classList.add('pricing-active');
    })
    
  }
  
  runHooks(hookName, ...args) {
    const hooks = this.settings.hooks[hookName] || [];
    hooks.forEach(callback => {
      if (typeof callback === "function") {
        callback.apply(this, args);
      }
    });
  }
  deepMerge(...objs) {
    function getType(obj) {
      return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
    }
    function mergeObj(clone, obj) {
      for (let [key, value] of Object.entries(obj)) {
        let type = getType(value);
        if (type === "object" || type === "array") {
          if (clone[key] === undefined) {
            clone[key] = type === "object" ? {} : [];
          }
          mergeObj(clone[key], value); // Corrected recursive call
        } else if (type === "function") {
          clone[key] = value; // Directly reference the function
        } else {
          clone[key] = value;
        }
      }
    }
    if (objs.length === 0) {
      return {};
    }
    let clone = {};
    objs.forEach(obj => {
      mergeObj(clone, obj);
    });
    return clone;
  }

  get instanceSettings() {
    const dataAttributes = {};
    // Function to set value in a nested object based on key path
    const setNestedProperty = (obj, keyPath, value) => {
      const keys = keyPath.split("__");
      let current = obj;

      keys.forEach((key, index) => {
        if (index === keys.length - 1) {
          current[key] = this.parseAttr(value);
        } else {
          current = current[key] = current[key] || {};
        }
      });
    };

    for (let [attrName, value] of Object.entries(this.el.dataset)) {
      setNestedProperty(dataAttributes, attrName, value);
    }
    return dataAttributes;
  }
  parseAttr(string) {
    if (string === "true") return true;
    if (string === "false") return false;
    const number = parseFloat(string);
    if (!isNaN(number) && number.toString() === string) return number;
    return string;
  }
}

(() => {
  function initPricingTable() {
    const els = document.querySelectorAll(
      '[data-wm-plugin="pricing-table"]:not([data-loading-state])'
    );
    if (!els.length) return;
    els.forEach(el => {
      el.dataset.loadingState = "loading";
      el.wmPricingTable = new PricingTable(el);
    });
  }
  window.wmPricingTable = {
    init: () => initPricingTable(),
  };
  window.wmPricingTable.init();
})();

