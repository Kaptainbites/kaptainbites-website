let quantity=1
let quantity2=1

function increase(){
quantity++
document.getElementById("qty").innerText=quantity
}

function decrease(){
if(quantity>1){
quantity--
document.getElementById("qty").innerText=quantity
}
}

function increase2(){
quantity2++
document.getElementById("qty2").innerText=quantity2
}

function decrease2(){
if(quantity2>1){
quantity2--
document.getElementById("qty2").innerText=quantity2
}
}

function order(){

let message=`Hi, I want to order:

Product: Spice Crew Cashew
Quantity: ${quantity}

Please share payment details.`

let url=`https://wa.me/91YOURNUMBER?text=${encodeURIComponent(message)}`

window.open(url)
}


function order2(){

let message=`Hi, I want to order:

Product: Mint Mond Cashew
Quantity: ${quantity2}

Please share payment details.`

let url=`https://wa.me/91YOURNUMBER?text=${encodeURIComponent(message)}`

window.open(url)
}
