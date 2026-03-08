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

function noSearchDefaultPageRender() {
  const app = document.querySelector<HTMLDivElement>("#app")!;
  const currentDefaultBang = localStorage.getItem("default-bang") ?? "g";

  const bangOptions = sortedBangs
    .map((b: Bang) => `<option value="${b.t} - ${b.s}">`)
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
            value="${window.location.href.split('?')[0]}?q=%s"
            readonly 
          />
          <button class="copy-button">
            <img src="clipboard.svg" alt="Copy" />
          </button>
        </div>
        <div class="bang-selector-container">
          <label for="bang-selector">Default search engine:</label>
          <input list="bang-options" id="bang-selector" value="${currentDefaultBang} - ${sortedBangs.find((b: Bang) => b.t === currentDefaultBang)?.s ?? 'Google'}" />
          <datalist id="bang-options">
            ${bangOptions}
          </datalist>
        </div>
      </div>
      <footer class="footer">
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
  bangSelector.addEventListener("change", () => {
    const selectedTag = bangSelector.value.split(" - ")[0];
    localStorage.setItem("default-bang", selectedTag);
  });
}

const LS_DEFAULT_BANG = localStorage.getItem("default-bang") ?? "g";
const defaultBang = bangs.find((b) => b.t === LS_DEFAULT_BANG);

function getBangredirectUrl() {
  const url = new URL(window.location.href);
  const query = url.searchParams.get("q")?.trim() ?? "";
  if (!query) {
    noSearchDefaultPageRender();
    return null;
  }

  const match = query.match(/!(\S+)/i);

  const bangCandidate = match?.[1]?.toLowerCase();
  const selectedBang = bangs.find((b) => b.t === bangCandidate) ?? defaultBang;

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
