//comunico el json con FETCH
document.addEventListener('DOMContentLoaded', () => { fetchdata()})
const templateCards = document.getElementById('t-cards').content
const templatepresupuesto = document.getElementById('t-presupuesto').content
const templateFooterPresupuesto = document.getElementById('t-presupuestoFooter').content
const items =  document.getElementById('items')
const footer = document.getElementById('footer')
const presupuesto = document.getElementById('presupuesto')
const fragment = document.createDocumentFragment()
const productos = []
const carrito = []

const fetchdata = async() => {
    try {
          const res = await fetch('../api.json')
          const data = await res.json()
          pintCards(data)
    } catch (error) {
        console.log(error)
    }   
}
const pintCards = data => {
    data.forEach(producto => {    //Cargo todos los datos en un objeto productos
        productos.push({
            id: producto.id,
            title : producto.title,
            precio : producto.precio,
            imgUrl: producto.imgUrl
        })
    });
    productos.forEach(producto => {
        templateCards.querySelector('h5').textContent = producto.title
        templateCards.querySelector('p').textContent = producto.precio
        templateCards.getElementById('imgCard').setAttribute("src",producto.imgUrl)
        templateCards.querySelector('.btn-dark').dataset.id = producto.id
        const clone = templateCards.cloneNode(true)
        fragment.appendChild(clone)
       
    });
    items.appendChild(fragment)
      
}
items.addEventListener('click',e =>{
    agregarCarrito(e)
})
presupuesto.addEventListener('click',e => {
    btnaccion(e)
})
footer.addEventListener('click',e => {
    btnVaciarCarrito(e)
})
const agregarCarrito = e =>{
    if(e.target.classList.contains('btn-dark')){
         let objeto = e.target.parentElement
         let ids = objeto.querySelector('.btn-dark').dataset.id
         if(carrito.find(ele => ele.id == ids)){
             let position = carrito.findIndex((index) => index.id == ids)
             carrito[position].cantidad++
         }
         else{
            carrito.push(
                {
                    id: ids,
                    producto: objeto.querySelector('.card-title').textContent,
                    cantidad: 1,
                    precio: objeto.querySelector('.Precio').textContent               
                }
            )
         }
    }
    pintarCarrito(carrito)
    pintarFooter(carrito) 
    e.stopPropagation()
}
const pintarCarrito = carrito => {
    presupuesto.innerHTML=""
    for (const element of carrito) {
        templatepresupuesto.querySelector('th').textContent = element.id
        templatepresupuesto.getElementById('prod').textContent = element.producto
        templatepresupuesto.getElementById('cant').textContent = element.cantidad
        templatepresupuesto.querySelector('span').textContent = element.precio * element.cantidad
        templatepresupuesto.querySelector('.btn-success').dataset.id = element.id
        templatepresupuesto.querySelector('.btn-danger').dataset.id = element.id
        const clone =templatepresupuesto.cloneNode(true)
        fragment.appendChild(clone)
    }
    presupuesto.appendChild(fragment) 
          
}
const btnaccion = e => {
    presupuesto.innerHTML = " "
        if(e.target.classList.contains('btn-success')){
           let objeto = e.target.parentElement.parentElement
           let ids = objeto.querySelector('.btn-success').dataset.id
           let position = carrito.findIndex(index => index.id == ids)
           carrito[position].cantidad++
           const clone = templatepresupuesto.cloneNode(true)
           fragment.appendChild(clone)
           presupuesto.appendChild(fragment)
           pintarCarrito(carrito)
           pintarFooter(carrito) 
        }
        else if(e.target.classList.contains('btn-danger')){
           let objeto =  e.target.parentElement.parentElement
           let ids = objeto.querySelector('.btn-danger').dataset.id
           let position = carrito.findIndex(index => index.id == ids)
           if(carrito[position].cantidad > 1){
             carrito[position].cantidad--
           }
           else{
              carrito.splice(position,1)
              footer.innerHTML = ` <tr id="footer">
                <th scope="row" colspan="5">Carrito vacío - comience a comprar!</th>
              </tr>`
              return
           }
           const clone = templatepresupuesto.cloneNode(true)
           fragment.appendChild(clone)
           presupuesto.appendChild(fragment)
           pintarCarrito(carrito)
           pintarFooter(carrito) 
        }
        e.stopPropagation()
}
const pintarFooter = (carrito) => {
    footer.innerHTML = ""
    let cantProductos = carrito.reduce((acum,{cantidad}) => acum + cantidad,0)
    let precioTotal = carrito.reduce((acum,{cantidad,precio}) => acum + cantidad * precio,0)
    templateFooterPresupuesto.querySelectorAll('td')[0].textContent = cantProductos
    templateFooterPresupuesto.querySelector('span').textContent = precioTotal
    const clone = templateFooterPresupuesto.cloneNode(true)
    fragment.appendChild(clone)
    footer.appendChild(fragment)
}
const btnVaciarCarrito = e => {
    if(e.target.classList.contains('btn-danger')){
           carrito.splice(0,carrito.length)
           pintarCarrito(carrito)
           pintarFooter(carrito)
           footer.innerHTML = ` <tr id="footer">
           <th scope="row" colspan="5">Carrito vacío - comience a comprar!</th>
         </tr>`
    }
}