import { addUIStyles } from '../../utils';
import styles from '../styles/fixes.css';

const fixPassingParcel = () => {
  const passingParcel = document.querySelector('.inventoryPage-item[data-item-type="passing_parcel_message_item"]');
  if (! passingParcel) {
    return;
  }

  const quantity = passingParcel.querySelector('.quantity');
  if (! quantity) {
    return;
  }

  const newMarkup = `<div class="inventoryPage-item full convertible " onclick="app.pages.InventoryPage.useItem(this); return false;" data-item-id="1281" data-item-type="passing_parcel_convertible" data-item-classification="convertible" data-name="Passing Parcel" data-display-order="0">
	<div class="inventoryPage-item-margin clear-block">
		<div class="inventoryPage-item-name">
      <a href="#" class="" onclick="hg.views.ItemView.show('passing_parcel_convertible'); return false;">
        <abbr title="Passing Parcel">Passing Parcel (collectible)</abbr>
      </a>
    </div>
    <a href="#" class="inventoryPage-item-larryLexicon" onclick="hg.views.ItemView.show('passing_parcel_convertible'); return false;">?</a>
    <div class="inventoryPage-item-imageContainer">
      <div class="itemImage"><a href="#" class="" onclick="hg.views.ItemView.show('passing_parcel_convertible'); return false;">
        <img src="https://www.mousehuntgame.com/images/items/message_items/5591e5c34f081715aaca4e95e97a3379.jpg?cv=2"></a>
          <div class="quantity">${quantity.innerText}</div>
        </div>
      </div>
      <div class="inventoryPage-item-contentContainer">
        <div class="inventoryPage-item-content-description">
          <div class="inventoryPage-item-content-description-text">
            This parcel is meant to be passed along to a friend! If a friend sends one to you, tear away a layer and see if there's something inside!
          </div>
          <div class="inventoryPage-item-content-action">
            <input type="button" id="passing-parcel-action" class="inventoryPage-item-button button" value="Pass Along">
          </div>
      </div>
    </div>
  </div>`;

  passingParcel.outerHTML = newMarkup;

  const passingParcelAction = document.querySelector('#passing-parcel-action');
  passingParcelAction.addEventListener('click', () => {
    window.location.href = 'https://www.mousehuntgame.com/supplytransfer.php?item_type=passing_parcel_message_item';
  });
};

const updateItemClassificationLinks = () => {
  const itemClassificationLink = document.querySelectorAll('.itemView-header-classification-link a');
  if (! itemClassificationLink) {
    return;
  }

  itemClassificationLink.forEach((link) => {
    // get the onclick attribute, remove 'hg.views.ItemView.hide()', then set the onclick attribute
    const onclick = link.getAttribute('onclick');
    if (! onclick) {
      return;
    }

    // get the page title and tab via regex
    const page = onclick.match(/setPage\('(.+?)'.+tab:'(.+)'/);
    if (! page) {
      return;
    }

    const pageTitle = page[1];
    let tab = page[2];
    let subtab = null;

    if ('skin' === tab || 'trinket' === tab) {
      subtab = tab;
      tab = 'traps';
    }

    // build the url
    let url = `https://www.mousehuntgame.com/${pageTitle.toLowerCase()}.php?tab=${tab}`;
    if (subtab) {
      url += `&sub_tab=${subtab}`;
    }

    // remove the onclick attribute and add the href attribute
    link.removeAttribute('onclick');
    link.setAttribute('href', url);
  });
};

const fixMpBuyButton = () => {
  hg.views.MarketplaceView.setOrderPrice = (price) => {
    const input = document.querySelector('.marketplaceView-item-unitPriceWithTariff');
    if (input) {
      input.value = price;
      hg.views.MarketplaceView.blurInput(input);
    }
  };
};

export default () => {
  addUIStyles(styles);

  if ('item' === getCurrentPage()) {
    updateItemClassificationLinks();
  }

  fixMpBuyButton();

  onNavigation(fixPassingParcel,
    {
      page: 'inventory',
      tab: 'special',
      onLoad: true,
    }
  );
};