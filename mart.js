// Action = A 
// Calculation = C
// Data = D

// Global vars are actions
let shoppingCart = []; // A
let shoppingCartTotal = 0; // A

function addItemToCart(name, price) { // A
    const item = makeCartItem(name, price);
    shoppingCart = addItem(shoppingCart, item);

    const total = calcTotal(shoppingCart);
    setCartTotalDOM(total);
    updateShippingIcons(shoppingCart);
    updateTaxDOM(total);
}

function setCartTotalDOM(total) { // A
    console.log("Cart total in DOM: " + total);
}

function updateShippingIcons(cart) { // A
    const buttons = getBuyButtonsDOM();
    console.log("Shipping Icons:");
    for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i];
        const item = button.item;
        const newCart = addItem(cart, item);
        if (getsFreeShipping(newCart))
            console.log(item.name + ' - gets free shipping');
        else
            console.log(item.name + ' - no free shipping');
    }
}

function getBuyButtonsDOM() { // A
    return [
        {
            item: makeCartItem("sword", 12)
        },
        {
            item: makeCartItem("shield", 22)
        },
        {
            item: makeCartItem("potion", 3)
        }
    ]
}

function updateTaxDOM(total) { // A
    console.log("Tax on cart: " + calcTax(total));
}

function addElementLast(array, elem) {
    const newArray = array.slice();
    newArray.push(elem);
    return newArray;
}

function addItem(cart, item) { // C
    return addElementLast(cart, item);
}

function makeCartItem(name, price) {
    return {
        name,
        price
    };
}

function calcTotal(cart) { // C
    let total = 0;
    for (let i = 0; i < cart.length; i++) {
        let item = cart[i];
        total += item.price;
    }
    return total;
}

function getsFreeShipping(cart) { // C
    return calcTotal(cart) >= 20;
}

function calcTax(amount) { // C
    return amount * 0.10;
}

// Execute
addItemToCart("sword", 12);
console.log(shoppingCart);