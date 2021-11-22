# Grokking Simplicity Summary

A repo that contains a summary of Grokking Simplicity by Eric Normand and code examples that reflect the examples in the book.

Serves as part 4 of the [Feynman Technique](https://en.wikipedia.org/wiki/Feynman_Technique) to solidify and apply the knowledge I've gained from reading Grokking Simplicity.

Part 1 is very valuable on its own. There is a lot of value in being able to recognize and organize your programs around actions, calculations, and data.

Part 2 covers more complex functional ideas and tools. 

## Part 1: Actions, Calculations, and Data

**Actions**
<details> 
<summary>Depend on how many times or when it is run</summary>

AKA - functions with side effects / impure functions

Examples - Sending an email, reading from a database

Actions are anything that has an effect on the world or is affected by the world. We want to try and use as few actions as possible and restrict them to interactions with the outside.
</details>
</br>

**Calculations**
<details> 
<summary>Computations from input to output</summary>

AKA - pure functions / mathematical functions

Examples - Finding the max number, check if an email is valid

Calculations will always give the same output given the same input no matter how many times or when they are run. 

Evaluation of a calculation has no side effects. Side effects refer to changing other attributes of the program not contained within the function, such as changing global variable values or using I/O streams.
</details>
</br>

**Data**
<details> 
<summary>Facts about events</summary>
Examples - The email address a user gave us, the dollar amount read from a bank's API
</details>
</br>

### Extracting Calculations from Actions
**Why prefer calculations over actions?**
- easier to test
- run them as many times as you want wherever you want
- don't have to worry about what else is running

For this example, we have a function that calculates the total price of a shopping cart for an e-commerce website. The original function totals the cart price then updates the DOM.

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

Mutation can cause a multitude of issues, let's use mutating an array as an example.

Often in Javascript, we use the built-in *push* array method to add an element to an array which is a mutation.

```js
let myArray = [1,2,3,4];
const element = 5;
myArray.push(element);
```

A functional solution for this is copy-on-write which just means making a copy of the array, adding the new element to this copy then replacing the old array with the copy.

**Issues this causes**
- The array can be scattered in memory
    - *when the array has first created the memory is concurrent in memory but when we push to it the new item could end up somewhere else which increases memory usage and decreases the efficiency of operations like searching*
- If multiple asynchronous processes are using the array we could end up with bad data
    - *languages that facilitate multithreading can be very complex especially when using mutable data structures and/or mutable state*

These issues apply to other data structures as well.

**Copy-on-write**

Copy-on-write solves the issues above and changes what would usually be an *Action* (mutating an array, object, etc) into a *Calculation*.

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

Implicit outputs limit when you can call the function as well. You can only call the function if you want that output to happen. What if you don’t want to output to the DOM at that time? What if you need the result, but put it somewhere else?

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
Notice how we can now save the new item to a variable instead of immediately adding it to the cart. In this simple example, we still add it to the cart right after creating it but if we needed to do something else to the item, or pass it to another function, we could.

### Stratified Design

Stratified design is a technique for building software in layers. Each layer defines new functions in terms of the functions in the layers below it.

An example of these layers could be:
- business rules
- domain-specific operations
- general operations
- language features

An e-commerce app as an example:

**business rules**

Functions that align with decisions the business makes.

- getsFreeShipping()
- isPrimeMember()

**domain-specific operations**

Functions that are specific to the functionality of the application and don't need to be concerned with the underlying data structures.

- calcCartTotal()
- getItemPrice()
- addItem()

**general operations**

Functions that are designed to add additional functionality on top of the standard language features but are not specific to our application.

- addElementLast()
- indexOfItem()
- setByKey()

**language features**

Functions that are built into the language we are using.

- splice()
- slice()
- map()

The idea is that the higher layers don't have to be concerned with the lower layers so they can change freely. Lower layers should be designed to not have dependencies so they don't have to change frequently.

An example of this flow could be:

getsFreeShipping() calls getItemPrice() calls indexOfItem() calls map()

With this structure, the rules around whether an item gets free shipping can change easily without needing to change how we get the price of an item.


---
## Part 2: First-class Abstractions

A first-class abstraction is taking something like a function, for loop, or try/catch statement and treating it like a value. This means you can pass them to functions, return them from functions, store them in variables, etc.

This can lead to what is called metaprogramming. 

### Higher Order Functions

A higher-order function is a function that takes a function as an argument or returns a function or both.

**Argument:**
```js
function alterString(alteration, str) {
    const result = alteration(str);
    return str;
}

function allCaps(str) {
    return str.toUpperCase();
}

function addDashes(str) {
    return str.split('').join('-');
}

alterString(allCaps, "the merchant was poor");
// returns "THE MERCHANT WAS POOR"

alterString(addDashes, "merchant");
// returns "m-e-r-c-h-a-n-t"
```

**Return:**
```js
function makeDomainAppender(domainStr) {
    return function(localStr) {
        localStr str + '@' + domainStr;
    }
}

function gmailDomainAppender = makeDomainAppender("gmail.com");

gmailDomainAppender("somemerchant");
// returns somemerchant@gmail.com
```

### Closures

A closure is a record storing a function together with an environment. 

```js
function outerFunction() {
    const message = 'hi';
    function innerFunction() {
        console.log(message);
    }
    return innerFunction;
}

const storedFunction = outerFunction();

storedFunction();
// prints 'hi'
```
In the example above we are using a closure to store the function's inner function along with the string variable 'hi' in another function called `storedFunction`. This is powerful because it not only allows us to treat a function as a variable but also store an environment with that function.

### Combinators

*This section is not covered directly in Grokking Simplicity but I wanted to add it for later reference since it applies to the discussion of first-class abstractions*

**Technical Explanation**

A combinator is an expression with no free variables. That is, it is either a constant or a lambda expression that only refers to its bound variables.

Examples of combinators:

- 2  is a constant, and therefore a combinator.
- λx.x  is a lambda expression that only refers to the bound variable x, and therefore a combinator.
- λx.y  is not a combinator; it has a free variable.

**Simplified Explanation**
A combinator is a function that takes one or more functions and transforms them into a new function. They allow you to put together pieces of logic in interesting and advanced manners. 

An example of this is a function that takes two functions and returns a new function that runs them in sequence.
```js
function sequence(first, second) {
    return function () {
        first();
        second();
    } 
}

function doAThing() {
    console.log("first")
}

function doAnotherThing() {
    console.log("second")
}

sequence(doAthing, doAnotherThing);
// prints:
// "first"
// "second"

```

### Functional Iteration and Other Functional Tools
A simple example of functional iteration is a forEach loop. Instead of having to write a for loop every time you need to iterate you can abstract it and only expose the part that changes.

**forEach array example**
```js
function forEach(array, f) {
    for (let i = 0; i < array.length; i++) {
        f(array[i]);
    }
}

// in use
function counter() {
    let numbers = [1,2,3,4,5,6,7,8];
    forEach(numbers, function (number) {
        console.log(number);
    });
}

counter();
// prints 1 2 3 4 5 6 7 8
```

Three of the most popular functional tools are map, filter, and reduce. These are examples of things that are done so frequently, it's worth abstracting them.

#### Map 
Iterate over a data structure and do something to each element.
Javascript comes with a built-in array method for map but you can write a custom map function as well.

**map array example**
```js
function map(array, f) {
    let newArray = [];
    forEach(array, function (element) {
        newArray.push(f(element));
    });
    return newArray;
}

// in use
function doubleAll(numbers) {
    return map(numbers, function (number) {
        return number * 2;
    });
}

// alternate with built in js map
const doubleAll = numbers => numbers.map(number => number * 2);

doubleAll();
// returns a new array [2,4,6]
```
We can also write a custom map for objects
**map object example**
```js
function mapObj(obj, f) {
    let newObject = {};
    forEach(Object.keys(obj), function (key) {
        newObject[key] = f(obj[key]);
    });
    return newObject;
}

function increaseScores(players, amount) {
    return mapObj(players, function (score) {
        return score + amount;
    });
}

// in use
// increase all player scores by 100
increaseScores({
    p1: 100,
    p2: 340,
    p3: 210,
    p4: 230,
}, 100);
// returns 
/* {
    p1: 200,
    p2: 440,
    p3: 310,
    p4: 330,
} */

```

#### Filter
Iterate over a data structure and filter out any elements that don't pass the given condition.
Javascript comes with a built-in array method for filter but you can write a custom filter function as well.

**filter array example**
```js
function filter(array, f) {
    let newArray = [];
    forEach(array, function (element) {
        if (f(element)) {
            newArray.push(element);
        }
    });
    return newArray;
}

// in use
function playersOverLevel(players, levelCap) {
    return filter(players, function(player) {
        return player.level > levelCap;
    });
}

// alternate with built in js filter
const playersOverLevel = (players, levelCap) => players.filter(player => player.level > levelCap);

playersOverLevel([
    {
        name: "p1",
        level: 11
    },
    {
        name: "p2",
        level: 4
    },
    {
        name: "p3",
        level: 44
    },
    {
        name: "p4",
        level: 9
    }
], 10);
// returns
/*
[
    {
        name: "p1",
        level: 11
    },
    {
        name: "p3",
        level: 44
    }
]
*/
```

#### Reduce
Accumulate a value while iterating over a data structure.
Javascript comes with a built-in array method for reduce but you can write a custom reduce function as well.

Accumulating a value is kind of an abstract idea. It could take many concrete forms. For instance, adding things up is an accumulation. So is adding stuff to a hash map or concatenating strings. You get to decide what accumulation means by the function you pass in.

**reduce array example**
reduce takes three arguments:
- the array to iterate over
- an initializer aka the starting point for the value
```js
function reduce(array, initializer, f) {
    let accumulator = initializer;
    forEach(array, function (element) {
        accumulator = f(accumulator, element);
    });
    return accumulator;
}

// in use
function concatStrings(strings) {
    return reduce(strings, "", function(accumulator, string) {
        return accumulator + string;
    });
}

// alternate with built in js reduce
const concatStrings = strings => strings.reduce((accumulator, string) => accumulator + string);

concatStrings(["the ", "merchant ", "is ", "poor."]);
// returns "the merchant is poor"
```

There are two things to be careful about with reduce(). 

The first is the argument order. Because there are three arguments to reduce(), and there are two arguments to the function you pass to reduce(), it can be easy to mess up the order.

The second is how to determine the initial value. It depends on the operation and the context. But it’s the same answer as these questions:

- Where does the calculation start? For instance, summing starts at zero, so that’s the initial value for addition. But multiplying starts at 1, so that’s the initial value for multiplication.
- What value should you return if the array is empty? In the case of an empty list of strings, concatenating them should be an empty string.

### Other Functional Tools

**pluck()**

Tired of writing callbacks for map() that just pull out a field? pluck() is your answer:
```js
function pluck(array, field) {
    return map(array, function(object) {
        return object[field];
    });
}
```

**concat()**

concat() unnests arrays inside of an array. It removes that one pesky level of nesting:

```js
function concat(arrays) {
    var ret = [];
    forEach(arrays, function(array) {
        forEach(array, function(element) {
            ret.push(element);
        });
    });
    return ret;
}
```

**frequenciesBy() and groupBy()**

Counting and grouping are invaluable. These functions return objects (hash maps):

```js
function frequenciesBy(array, f) {
    var ret = {};
    forEach(array, function(element) {
        var key = f(element);
        if(ret[key]) ret[key] += 1;
        else     ret[key] = 1;
    });
    return ret;
}
 
function groupBy(array, f) {
    var ret = {};
    forEach(array, function(element) {
        var key = f(element);
        if(ret[key]) ret[key].push(element);
        else     ret[key] = [element];
    });
    return ret;
}
```

**update()**
update() is another important functional tool. The functional tools we learned in the last chapters operated on arrays, but this one operates on objects (treated as hash maps). Let’s look at it more closely:

```js
function update(object, key, modify) {
    var value = object[key];
    var newValue = modify(value);
    var newObject = objectSet(object, key, newValue);
    return newObject;
}
```

### Chaining Functional Tools Into Data Transformation Pipelines

We can also use functional tools in sequence.

Here's an example:

```js
function shoesAndSocksInventory(products) { 
    const shoesAndSocks = filter(products, function(product) { 
        return product.type === "shoes" || product.type === "socks"; 
    }); 
    const inventoryCounts = map(shoesAndSocks, function(product) { 
        return product.numberInInventory; 
    }); 
    return reduce(inventoryCounts, 0, plus); 
}
```

This can also be chained together in JS:

```js
function shoesAndSocksInventory(products) 
    => filter(products, product => product.type === "shoes" || product.type === "socks")
      .map(shoesAndSocks, product => product.numberInInventory)
      .reduce(inventoryCounts, 0, plus);
```

### Functional Tools for Nested Data

If we have an object and we want to call the update function on it which updates a specific value by key we can use recursion. 

Let's take this object as an example:

```js
const cart = {
    shirt: {
        name: "shirt",
        price: 13,
        options: {
            color: "blue",
            size: 3
        }
    }
}
```
This nestedUpdate function can be used to modify a specific value inside a nested data structure.
```js
function update(object, key, modify) {
    var value = object[key];
    var newValue = modify(value);
    var newObject = objectSet(object, key, newValue);
    return newObject;
}

function nestedUpdate(object, keys, modify) {
    if(keys.length === 0)
        return modify(object);
    const key1 = keys[0];
    const restOfKeys = drop_first(keys);
    return update(object, key1, function(value1) {
        return nestedUpdate(value1, restOfKeys, modify);
    });
}

// use case to increment the size of the shirt in our nested cart object
nestedUpdate(cart, ["shirt", "options", "size"], increment)
```

The "keys" argument can also be called a path. This is a series of levels that need to be traversed to get the key of the value we are trying to update. 

**Recursion**
Recursion means a function that calls itself. Recursion is useful when a problem can be divided into smaller problems that can all use the same algorithm to solve them. In our example the algorithm is:
1. store the first key in the keys array 
2. remove the first key from the keys array
3. pass the object and the first key in the keys array into update along with a recursive call to nestedUpdate
4. update receives the recursive call to nested update and runs it on the value associated with the key passed in

This is repeated until we hit the `base case` which, in this situation, is when there are no more keys in the keys array.

The nestedUpdate function uses recursion to move through each key in the keys array and call itself at each level.

**Base Case** 
Some kind of condition to tell the recursive function to stop calling itself.

## Conclusion

I learned am amazing amount from this book and have already been able to put some of what I learned into practice.

I strongly recommend [this book](https://www.manning.com/books/grokking-simplicity?gclid=Cj0KCQiA-eeMBhCpARIsAAZfxZAMxyX1UrZIrIruLAbrCGoDz2ikq0lB6nTdOPEeMl2irsRiFAq51noaArbCEALw_wcB) to anyone who wants to learn more about the topics summarized above. 

## Footnote

This was a summary of roughly the first 75% of the Grokking Simplicity. The later chapters discuss distributed systems and architecture. I find these topics equally interesting and the content equally useful but I wanted to keep this summary as focused as possible. 
