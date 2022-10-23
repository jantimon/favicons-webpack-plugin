# Snapshot report for `test/manifest.light.test.mjs`

The actual snapshot is saved in `manifest.light.test.mjs.snap`.

Generated by [AVA](https://avajs.dev).

## should generate a result with custom manifest values

> Snapshot 1

    [
      'assets/favicon.png',
      'assets/manifest.webmanifest',
      'main.js',
    ]

> Snapshot 2

    [
      {
        assetName: 'assets/favicon.png',
        content: 'png 874x989',
      },
      {
        assetName: 'assets/manifest.webmanifest',
        content: `{␊
          "name": "FaviconsDemo",␊
          "short_name": "FaviconsDemo",␊
          "description": "Just a demo",␊
          "dir": "auto",␊
          "lang": "en",␊
          "display": "standalone",␊
          "background_color": "#fff",␊
          "theme_color": "#fff",␊
          "icons": [␊
            {␊
              "src": "favicon.png"␊
            }␊
          ]␊
        }`,
      },
    ]