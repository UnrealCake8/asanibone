export type CartItem={id:string;name:string;price:number;imageUrl:string|null;merchantId:string;merchantName:string;merchantSlug:string;quantity:number};
const KEY="asanibone_shop_cart";
export function readCart():CartItem[]{if(typeof window==="undefined")return[];try{return JSON.parse(localStorage.getItem(KEY)||"[]")}catch{return[]}}
export function writeCart(items:CartItem[]){localStorage.setItem(KEY,JSON.stringify(items));window.dispatchEvent(new Event("asanibone-cart"))}
export function addCartItem(item:Omit<CartItem,"quantity">){const cart=readCart();const same=cart.filter(x=>x.merchantId===item.merchantId);const found=same.find(x=>x.id===item.id);if(found)found.quantity+=1;else same.push({...item,quantity:1});writeCart(same)}
export function clearCart(){writeCart([])}
