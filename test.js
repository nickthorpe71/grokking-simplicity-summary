function forEach(array, f) {
    for (let i = 0; i < array.length; i++) {
        f(array[i]);
    }
}

function reduce(array, initializer, f) {
    let accumulator = initializer;
    forEach(array, function (element) {
        accumulator = f(accumulator, element);
    });
    return accumulator;
}

// in use
// function concatStrings(strings) {
//     return reduce(strings, "", function (accumulator, string) {
//         return accumulator + string;
//     });
// }

// alternate with built in js reduce
const concatStrings = strings => strings.reduce((accumulator, string) => accumulator + string);

console.log(concatStrings(["the ", "merchant ", "is ", "poor."]));