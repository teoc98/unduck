import { bangs } from "./bang";
import "./global.css";

interface Bang {
  c: string;
  d: string;
  r: number;
  s: string;
  sc: string;
  t: string;
  u: string;
}

const sortedBangs = ([...bangs] as Bang[]).sort((a, b) => b.r - a.r);

function findBang(tag) {
  return tag ? bangs.find((b) => b.t === tag) : null;
}

function formatBang(tag) {
  let bang = findBang(tag);
  return tag + (bang ? ` - ${bang.s} (${bang.d})` : "");
}

function searchEngineUrl(tag) {
  return `${window.location.href.split('?')[0]}?${tag ? `d=${tag}&` : ""}q=%s`;
}

function noSearchDefaultPageRender() {
  const app = document.querySelector<HTMLDivElement>("#app")!;
  const currentDefaultBang = localStorage.getItem("default-bang");

  const bangOptions = sortedBangs
    .map((b: Bang) => `<option value="${b.t} - ${b.s} (${b.d})">`)
    .join("");

  app.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh;">
      <div class="content-container">
        <h1>Und*ck</h1>
        <p>DuckDuckGo's bang redirects are too slow. Add the following URL as a custom search engine to your browser. Enables <a href="https://duckduckgo.com/bang.html" target="_blank">all of DuckDuckGo's bangs.</a></p>
        <div class="url-container"> 
          <input 
            type="text" 
            class="url-input"
            value="${searchEngineUrl(null)}"
            readonly 
          />
          <button class="copy-button icon-button">
            <img src="clipboard.svg" alt="Copy" />
          </button>
        </div>
        <div class="bang-selector-container">
          <label for="bang-selector">Default search engine:</label>
          <div class="bang-selector-row">
            <input list="bang-options" id="bang-selector" value="${currentDefaultBang ? formatBang(currentDefaultBang) : ''}" />
            <button id="save-bang" class="save-button icon-button">
              <img src="save.svg" alt="Save" />
            </button>
          </div>
          <datalist id="bang-options">
            ${bangOptions}
          </datalist>
         </div>
      </div>
      <div>
        <br>
        Unduck uses in order:
        <ul>
          <li>the bang in the query</li>
          <li>the bang in the <mono>d<mono> parameter</li>
          <li>the default search engine</li>
          <li>Google</li>
        </ul>
      </div>
      <footer class="footer">
        <a href="src/bang.ts" target="_blank">bangs</a>
        <span> · </span>
        <a href="https://github.com/teoc98/unduck" target="_blank">github</a>
      </footer>
    </div>
  `;

  const copyButton = app.querySelector<HTMLButtonElement>(".copy-button")!;
  const copyIcon = copyButton.querySelector("img")!;
  const urlInput = app.querySelector<HTMLInputElement>(".url-input")!;

  copyButton.addEventListener("click", async () => {
    await navigator.clipboard.writeText(urlInput.value);
    copyIcon.src = "clipboard-check.svg";

    setTimeout(() => {
      copyIcon.src = "clipboard.svg";
    }, 2000);
  });

  const bangSelector = app.querySelector<HTMLInputElement>("#bang-selector")!;
  const saveButton = app.querySelector<HTMLButtonElement>("#save-bang")!;
  const saveIcon = saveButton.querySelector("img")!;

  function getSelectedTag(selector) {
    const selectedValue = bangSelector.value;
    return selectedValue?.match(/^[^\s]+/)?.[0] ?? null;
  }

  bangSelector.addEventListener("input", () => {
    const selectedTag = getSelectedTag(bangSelector);
    urlInput.value = searchEngineUrl(selectedTag);
  });

  saveButton.addEventListener("click", () => {
    const selectedTag = getSelectedTag(bangSelector);
    if (selectedTag) {
      localStorage.setItem("default-bang", selectedTag);
    } else {
      localStorage.removeItem("default-bang");
    }
    saveIcon.src = "check.svg";
    setTimeout(() => {
      saveIcon.src = "save.svg";
    }, 2000);
  });
}

function getBangredirectUrl() {
  const url = new URL(window.location.href);
  const query = url.searchParams.get("q")?.trim() ?? "";
  const def = url.searchParams.get("d")?.trim() ?? "";
  if (!query) {
    noSearchDefaultPageRender();
    return null;
  }

  const match = query.match(/!(\S+)/i);

  const bangCandidates = [
    match?.[1]?.toLowerCase(),
    def.toLowerCase(),
    localStorage.getItem("default-bang"),
    "g"
  ];
  let selectedBang;
  for (const bangCandidate of bangCandidates) {
    if (selectedBang = findBang(bangCandidate))
      break;
  }

  // Remove the first bang from the query
  const cleanQuery = query.replace(/!\S+\s*/i, "").trim();

  // If the query is just `!gh`, use `github.com` instead of `github.com/search?q=`
  if (cleanQuery === "")
    return selectedBang ? `https://${selectedBang.d}` : null;

  // Format of the url is:
  // https://www.google.com/search?q={{{s}}}
  const searchUrl = selectedBang?.u.replace(
    "{{{s}}}",
    // Replace %2F with / to fix formats like "!ghr+t3dotgg/unduck"
    encodeURIComponent(cleanQuery).replace(/%2F/g, "/"),
  );
  if (!searchUrl) return null;

  return searchUrl;
}

function doRedirect() {
  const searchUrl = getBangredirectUrl();
  if (!searchUrl) return;
  window.location.replace(searchUrl);
}

doRedirect();
