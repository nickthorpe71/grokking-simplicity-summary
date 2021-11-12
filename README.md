# Grokking Simplicity Summary

A repo that contains a summary of Grokking Simplicity by Eric Normand and code examples that reflect the examples in the book.

Serves as part 4 of the [Feynman Technique](https://en.wikipedia.org/wiki/Feynman_Technique) to solidify and apply the knowledge I've gained from reading Grokking Simplicity.

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
### Implementing Immutability to Make Reading Data Into a Calculation

**Why is immutability important?**

Mutation can cause a multitude of issues, lets use mutating an array as an exmaple.

Often in Javascript we often use the built in *push* array method to add an element to an array which is a mutation.

```js
let myArray = [1,2,3,4];
const element = 5;
myArray.push(element);
```

A functional solution for this is copy-on-wirte which just means make a copy of the array, add the new element to this copy then replace the old array with the copy.

**Issues this causes**
- The array can be scattered in memory
    - *when the array is first created the memory is concurrent in memory but when we push to it the new item could end up somewhere else which increases memory usage and decreases effeciency of operations like searching*
- If multiple asynchronous processes are using the array we could end up with bad data
    - *languages that facilitate multithreading can be very complex especially when using mutable datastructures and/or mutable state*

These issues apply to other data structures as well.

**Copy-on-write**

Copy-on-write solves the issues above and changes what would usually be an *Action* (mutating an array, object, etc) into a *Calcilation*.

1. Make a copy, but never modify the original.
2. The copy stays within the local scope of the function. That means no other code has access to it while we modify it.
3. After we’re done modifying it, we let it leave the scope (we return it). Nothing will modify it after that.

**Copy-on-write Array Example**

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
*You can imagine how this approach could also be used to add items to the front of an array, delete an item from an array, etc.*

**Copy-on-write JS Object Example**
```js
function objectSet(object, key, value) {
    let copy = Object.assign({}, object);
    copy[key] = value;
    return copy;
}
```

When you enforce immutability you can keep your application architecture and mental model simple, which makes it easier to reason about your application.

There are JS libraries such as Lodash that provide immutable data structures along with other functional tools. 


### Improving Actions by Replacing Implicit Inputs and Outputs with Explicit Ones

We want to eliminate implicit inputs and outputs by replacing them with arguments.

The function `updateShippingIcons` below implicitly uses the global `shoppingCart` variable. This limits when you can call it because something else could be using the `shoppingCart` variable. 
```js
function updateShippingIcons() {
    vonst buttons = getBuyButtonsDOM();
    for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i];
        const item = button.item;
        const newCart = addItem(shoppingCart, item.name, item.price);
        if (getsFreeShipping(newCart))
            button.showFreeShippingIcon();
        else
            button.hideFreeShippingIcon();
    }
}
```

Here's an improved version of the same function:
```js
function updateShippingIcons(cart) {
    vonst buttons = getBuyButtonsDOM();
    for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i];
        const item = button.item;
        const newCart = addItem(cart, item.name, item.price);
        if (getsFreeShipping(newCart))
            button.showFreeShippingIcon();
        else
            button.hideFreeShippingIcon();
    }
}
```
It's a small change but in more complex scenarios it helps make sure things happen according to your design instead of unexpected times.

Implicit outputs limit when you can call the function as well. You can only call the function if you want that output to happen. What if you don’t want to output to the DOM at that time? What if you need the result, but put somewhere else?

This function has an explicit input but an implicit output:
```js
function addItem(cart, name, price) {
    var new_cart = cart.slice();
    new_cart.push({
        name: name,
        price: price
    });
    return newCart;
}
```

We can break this into multiple functions with explicit inputs and outputs:
```js
function addItem(cart, item) {
    // this function is defined in the Copy-on-write pattern above
    // returns an array with the item appended
    return addElementLast(cart, item);
}

function makeCartItem(name, price) {
    return {
        name: name,
        price: price
    };
}
```
These new functions in use:
```js
function addItemToCart(cart, name, price) {
    const item = makeCartItem(name, price);
    // you could call addElementLast instead of addItem but
    // this extra level of abstraction can help separate 
    // business logic and make functions easier to read
    newCart = addItem(cart, item);
    return newCart;
}
```
Notice how we can now save the new item to a variable instead of immediately adding it to the cart. In this simple example we still add it to the cart right after creating it but if we needed to do something else to the item, or pass it to another funciton, we could.

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
