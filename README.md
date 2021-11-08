# Grokking Simplicity Summary

A repo that contains a summary of Grokking Simplicity by Eric Normand and code examples that reflect the examples in the book.

Serves as part 4 of the [Feynman Technique](https://en.wikipedia.org/wiki/Feynman_Technique) to solidify and apply the knowledge I gained from reading Grokking Simplicity.

## Part 1: Actions, Calculations, and Data

**Actions**
<details> 
<summary>Depend on how many times or when it is run</summary>

AKA - functions with side effects / impure functions

Examples - Sending an email, reading from a database

Actions are anything that have an effect on the world or are affected by the world. We want to try and use as few actions as possible and restrict them to interactions with the outside.
</details>
</br>

**Calculations**
<details> 
<summary>Computations from input to output</summary>

AKA - pure functions / mathematical functions

Examples - Finding the max number, check if an email is valid

Caclulations will always give the same output given the same input no matter how many times or when they are run. 

Evaluation of a calculation has no side effects. Side effects refer to changing other attributes of the program not contained within the function, such as changing global variable values or using I/O streams.
</details>
</br>

**Data**
<details> 
<summary>Facts about events</summary>
Examples - The email address a user gave us, the dollar amount read from a banks API
</details>
</br>

### Extracting Calculations from Actions
**Why prefer calculations over actions?**
- easier to test
- run them as many times as you want wherever you want
- don't have to worry about what else is running

For this example we have a function that calculates the total price of a shopping cart for an ecommerce website. The original function totals the cart price then updates the DOM.

**Original**
``` js
function calcCartTotal() {
    shoppingCartTotal = 0;
    for (let i = 0; i < shoppingCart.length; i++) {
        let item = shoppingCart[i];
        shoppingCartTotal += item.price;
    }

    setCartTotalDOM();
    updateShippingIcons();
    updateTaxDOM();
} 
```

We can extract summing the cart total into a calculation.

**Extracted**
``` js
function calcCartTotal() {
    shoppingCartTotal = calcTotal(shoppingCart);
    setCartTotalDOM();
    updateShippingIcons();
    updateTaxDOM();
} 

function calcTotal(cart) {
    let total = 0;
    for (let i = 0; i < cart.length; i++) {
        let item = cart[i];
        total += item.price;
    }
    return total;
}
```
### Copy-on-write Pattern **(Array)**

Often in Javascript we often use the built in *push* array method to add an element to an array.

```js
let myArray = [1,2,3,4];
const element = 5;
myArray.push(element);
```

This mutates the array which can cause a multitude of issues including having the array scattered in memory and unpredictability with async programs. 

A functional solutions for this is to copy-on-wirte which just means make a copy of the array, add the new element to this copy then replace the old array with the copy.

```js
function addElementLast(array, element) {
    arrayCopy = array.slice(); // slice makes a shallow copy of an array
    arrayCopy.push(element);
    return arrayCopy;
}

let myArray = [1,2,3,4];
const element = 5;
myArray = addElementLast(element);
// [1,2,3,4,5];
```

### Improving Actions by Replacing Implicit Inputs and Outputs with Explicit Ones



### Implementing Immutability to Make Reading Data Into a Calculation

### Stratified Design

---
## Part 2: First-class Abstractions

### Making Syntactic Operations First-class

### Functional Iteration and Other Functional Tools

### Chaining Functional Tools Into Data Transformation Pipelines

### Understanding Distributed and Concurrent Systems with Timeline Diagrams

### Manipulating Timelines to Eleminate Bugs

### Mutating State Safely with Higher-order Functions

### Reactive Architecture

Used to decouple cause and effect.

### Onion Architecture
