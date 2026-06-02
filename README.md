# Unduck

DuckDuckGo's bang redirects are too slow. Add the following URL as a custom search engine to your browser. Enables all of DuckDuckGo's bangs to work, but much faster.

```
https://teoc98.github.io/unduck?q=%s
```

## How is it that much faster?

DuckDuckGo does their redirects server side. Their DNS is...not always great. Result is that it often takes ages.

I solved this by doing all of the work client side. Once you've went to https://teoc98.github.io/unduck once, the JS is all cache'd and will never need to be downloaded again. Your device does the redirects, not me.

## Features

This fork of [unduck](https://github.com/T3-Content/unduck) introduces the following enhancements:

### Default search engine

You can now set your preferred search engine that persists across sessions. On the main page, use the dropdown to select a default bang and click the save button. Your choice is stored in your browser's localStorage.

Alternatively, add the URL with the `d` parameter directly in your browser's custom search engine settings (e.g., `https://teoc98.github.io/unduck?d=g&q=%s` sets Google as default).

### URL parameters

- `q`: Your search query (use `!bang` prefix for instant redirects)
- `d`: Override the default search engine per-query (e.g., `?d=w&q=github`)

### Search engine priority order

When you search, Unduck uses the bang in this order:
1. The bang in the query (e.g. `!w github`)
2. The `d` parameter (e.g. `?d=w&q=github`)
3. Your saved default search engine
4. Google as fallback

