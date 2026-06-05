# Legacy Renovation API

This module details the progressive modernization layer (`papyr.renovate`) designed to renovate legacy jQuery, CRM, or PHP applications non-destructively.

---

## Renovation Initializer

Audit and progressively replace elements within a target container:

### Signature
```javascript
const { auditResults, root } = papyr.renovate(options);
```

### Options
* `root` (String | HTMLElement): Selector target container root. Defaults to `'#legacy-app'`.
* `preserveStyles` (Boolean): If `true`, applies legacy class names and inline styles onto modern replacement nodes. Defaults to `true`.
* `preserveLayout` (Boolean): If `true`, avoids removing width/height parameters during responsive modernization. Defaults to `true`.
* `replacements` (Object): Mapping of selectors to replacement component factories:
  ```javascript
  replacements: {
      '.legacy-button': (targetEl) => papyr.button("Modern Button", {
          onclick: () => alert("Renovated Click!")
      })
  }
  ```

---

## Audit Results Schema

`papyr.renovate` returns a report containing scanned issues across the DOM subtree:

```json
{
  "accessibility": [
    { "element": HTMLElement, "issue": "Missing 'alt' attribute", "severity": "high" }
  ],
  "performance": [
    { "element": HTMLElement, "issue": "Inline style contains multiple definitions", "severity": "low" }
  ],
  "responsive": [
    { "element": HTMLElement, "issue": "Hardcoded width attribute", "severity": "medium" }
  ],
  "legacyElements": [
    { "element": HTMLElement, "issue": "Obsolete marquee element detected", "severity": "high" }
  ]
}
```
