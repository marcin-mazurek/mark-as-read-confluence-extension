const LOCAL_STORAGE_KEY = 'mark_as_read_conf_urls';
const PAGE_TREE_SELETOR = '.plugin_pagetree';
const LINK_CONTAINER_ENHANCED_CLASS = '__mare';
const CONTAINER_READ_CLASS = '__mare-read';
const CONTAINER_BUTTON_CLASS = '__mare-button';
const LINK_CONTAINER_SELECTOR = `.plugin_pagetree_children_span:not(.${LINK_CONTAINER_ENHANCED_CLASS})`;

function cleanUrl(url) {
  return url.replace('?src=contextnavpagetreemode', '')
    .replace('&src=contextnavpagetreemode', '');
}

function handleButtonClick() {
  const container = this.parentNode;

  if (container.classList.contains(CONTAINER_READ_CLASS)) {
    setPageAsUnread(this.__url);
  } else {
    setPageAsRead(this.__url);
  }

  container.classList.toggle(CONTAINER_READ_CLASS);
}

function createReadToggleButton(url) {
  const button = document.createElement('button');
  button.className = CONTAINER_BUTTON_CLASS;
  button.__url = url;
  button.addEventListener('click', handleButtonClick);
  return button;
}

function markLinksAsReadInPageTree() {
  const serializedReadPages = localStorage.getItem(LOCAL_STORAGE_KEY);
  const readPages = JSON.parse(serializedReadPages) || [];

  const $pageTree = document.querySelector(PAGE_TREE_SELETOR);
  const $linkContainers = $pageTree.querySelectorAll(LINK_CONTAINER_SELECTOR);

  for (const $linkContainer of $linkContainers) {
    const $link = $linkContainer.querySelector('a');
    const url = cleanUrl($link.href);
    const isRead = readPages.includes(url);

    if (isRead) {
      $linkContainer.classList.add(CONTAINER_READ_CLASS);
    }

    const button = createReadToggleButton(url);
    $linkContainer.appendChild(button);
    $linkContainer.classList.add(LINK_CONTAINER_ENHANCED_CLASS);
  }
}

function getReadPages() {
  const serializedReadPages = localStorage.getItem(LOCAL_STORAGE_KEY);
  return new Set(JSON.parse(serializedReadPages) || []);
}

function saveReadPages(pageSet) {
  const serializedReadPages = JSON.stringify([...pageSet]);
  localStorage.setItem(LOCAL_STORAGE_KEY, serializedReadPages);
}

function setPageAsRead(url) {
  console.log(url);
  const readPages = getReadPages();
  readPages.add(url);
  saveReadPages(readPages);
}

function setPageAsUnread(url) {
  const readPages = getReadPages();
  readPages.delete(url);
  saveReadPages(readPages);
}

function addStyleSheet() {
  const css = `
    .${CONTAINER_READ_CLASS} a {
      color: #777 !important;
      font-style: italic !important;
    }

    .${CONTAINER_BUTTON_CLASS} {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0;
    }

    .${CONTAINER_BUTTON_CLASS}::after {
      content: '⩗';
    }

    .${CONTAINER_READ_CLASS} .${CONTAINER_BUTTON_CLASS}::after {
      content: '⤺';
    }
  `;

  const style = document.createElement('style');
  style.type = 'text/css';
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);
}

function init() {
  addStyleSheet();
  markLinksAsReadInPageTree();

  const observer = new MutationObserver(markLinksAsReadInPageTree);
  observer.observe(
    document.querySelector(PAGE_TREE_SELETOR),
    { childList: true, subtree: true }
  );
}