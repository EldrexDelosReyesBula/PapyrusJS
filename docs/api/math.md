# Math API

This module details the reactive mathematical calculations engine (`papyr.math`) that lets you build auto-updating calculation trees.

---

## Overview

Unlike standard JS equations that execute once, `papyr.math` methods accept standard numbers, arrays, or reactive state variables, returning a derived computed property. Whenever any input state updates, the calculations trigger updates automatically:

$$ \text{Input States} \rightarrow \text{Auto Calculation} \rightarrow \text{Computed Value} $$

---

## Calculations Suite

All math APIs return a reactive **Computed** state.

### `papyr.math.sum(...args)`
Calculates the sum of numbers, arrays, or states:
```javascript
let a = papyr.state(10);
let b = papyr.state(5);
let total = papyr.math.sum(a, b, 15); // computed value = 30
```

### `papyr.math.sub(a, b)`
Calculates subtraction ($a - b$):
```javascript
let balance = papyr.state(100);
let charge = papyr.state(15);
let net = papyr.math.sub(balance, charge); // computed value = 85
```

### `papyr.math.mul(...args)`
Calculates the product of numbers, arrays, or states:
```javascript
let price = papyr.state(20);
let tax = papyr.state(1.12);
let total = papyr.math.mul(price, tax); // computed value = 22.4
```

### `papyr.math.div(a, b)`
Calculates division ($a / b$). Prevents divide-by-zero crashes:
```javascript
let miles = papyr.state(120);
let hours = papyr.state(0); // If 0, returns 0 automatically
let speed = papyr.math.div(miles, hours); // computed value = 0
```

### `papyr.math.avg(...args)`
Calculates the average:
```javascript
let scoreA = papyr.state(85);
let scoreB = papyr.state(95);
let finalGrade = papyr.math.avg(scoreA, scoreB); // computed value = 90
```

### `papyr.math.percent(val, total)`
Calculates the percentage ($val / total \times 100$):
```javascript
let load = papyr.state(40);
let max = papyr.state(200);
let usage = papyr.math.percent(load, max); // computed value = 20
```

### `papyr.math.round(val, decimals)`
Rounds a value to specified decimal places:
```javascript
let gross = papyr.state(15.7482);
let rounded = papyr.math.round(gross, 2); // computed value = 15.75
```

---

## Nested Equation Trees

You can nest math calls to construct complex dynamic equations:

```javascript
let subtotal = papyr.state(100);
let discountPercent = papyr.state(15); // 15%
let taxPercent = papyr.state(8);       // 8%

// 1. Calculate discount amount: subtotal * (discountPercent / 100)
let discount = papyr.math.mul(subtotal, papyr.math.div(discountPercent, 100));

// 2. Calculate price after discount: subtotal - discount
let discountedPrice = papyr.math.sub(subtotal, discount);

// 3. Calculate tax amount: discountedPrice * (taxPercent / 100)
let tax = papyr.math.mul(discountedPrice, papyr.math.div(taxPercent, 100));

// 4. Calculate final rounded total
let finalTotal = papyr.math.round(papyr.math.sum(discountedPrice, tax), 2);

console.log(finalTotal.value); // 91.8
subtotal.value = 200;
console.log(finalTotal.value); // 183.6 (auto-calculated!)
```
