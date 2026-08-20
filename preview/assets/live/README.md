# Cached live assets

Copies of files already served publicly from `humanappealusa.org`, fetched so
that `build-live-preview.py` can render the page inside the real site shell
**offline, as a single file**.

| What | Files |
|---|---|
| Stylesheets | `css_theme-*.css`, `css_header-*.css`, `css_footer-*.css`, `css_hero-carousel-*.css`, `css_text-*.css` |
| Webfont | `fonts_din-next_DINNextLTPro-*.woff` |
| Markup | `header.html`, `footer.html` — the real header and footer, lifted from `/the-jummah-club` |
| Images | the quote pattern, the SVG sprite sheet, the footer's country flags |

Nothing here is authored by this project and nothing here is uploaded
anywhere. It exists only so the simulation can be checked without a network
connection.

**Refreshing:** if the live theme changes, re-download these files and re-run
`python3 build-live-preview.py`. The filenames are the URL path with `/`
replaced by `_`, so `/css/theme-iPrkB63a.css` is stored as
`css_theme-iPrkB63a.css`. Note that the site's CSS filenames carry a build
hash — a redeploy changes them, and `SITE_CSS` in `build-live-preview.py`
needs the new names.

**DIN Next is a licensed typeface.** These `.woff` files are Human Appeal's
own licensed copies, already public on their site. They are cached here for
internal preview only and must not be redistributed.
