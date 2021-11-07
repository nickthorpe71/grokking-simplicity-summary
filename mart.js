// Action = A 
// Calculation = C
// Data = D

// Global vars are actions
let shoppingCart = []; // A
let shoppingCartTotal = 0; // A

const shippingCost = 0.08;
const tax = 0.13;

function addItemToCart(name, price) { // A
    shoppingCart = addItem(shoppingCart, name, price);
    calcCartTotal();
}

function calcCartTotal() { // A
    shoppingCartTotal = calcTotal(shoppingCart);
    setCartTotalDOM();
    updateShippingIcons();
    updateTaxDOM();
}

function setCartTotalDOM() { // A
    console.log(shoppingCartTotal);
}

function updateShippingIcons() { // A
    let buttons = getBuyButtonsDOM();
    for (let i = 0; i < buttons.length; i++) {
        let button = buttons[i];
        let item = button.item;
        if (getsFreeShipping(shoppingCartTotal, item.price))
            console.log('gets free shipping');
        else
            console.log('no free shipping');
    }
}

function getBuyButtonsDOM() { // A
    return [
        {
            item: {
                name: "sword",
                price: 15
            }
        },
        {
            item: {
                name: "shield",
                price: 22
            }
        },
        {
            item: {
                name: "potion",
                price: 2
            }
        }
    ]
}

function updateTaxDOM() { // A
    console.log(calcTax(shoppingCartTotal));
}

function addItem(cart, name, price) { // C
    let newCart = cart.slice(); // copy cart array
    newCart.push({
        name,
        price
    });
    return newCart;
}

function calcTotal(cart) { // C
    let total = 0;
    for (let i = 0; i < cart.length; i++) {
        let item = cart[i];
        total += item.price;
    }
    return total;
}

function getsFreeShipping(total, itemPrice) { // C
    return itemPrice + total >= 20;
}

function calcTax(amount) { // C
    return amount * 0.10;
}

addItemToCart("sword", 12);
console.log(shoppingCart);