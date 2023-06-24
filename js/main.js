//comunico el json con FETCH
document.addEventListener('DOMContentLoaded', () => { fetchdata()})
const templateCards = document.getElementById('t-cards').content
const templatepresupuesto = document.getElementById('t-presupuesto').content
const templateFooterPresupuesto = document.getElementById('t-presupuestoFooter').content
const items =  document.getElementById('items')
const footer = document.getElementById('footer')
const enviarPresupuesto = document.getElementById('enviar')
const presupuesto = document.getElementById('presupuesto')
const listarProductos = document.querySelector('.listarProductos')
const filtrarColumnas = document.querySelector(".filtrarColumnas")
const filtrarAccesorios = document.querySelector(".filtrarAccessorios")
const buscarProductos = document.querySelector(".buscarProductos")
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
            producto : producto.producto.toUpperCase(),
            precio : producto.precio,
            imgUrl: producto.imgUrl,
            tipo: producto.tipo
        })
    });
    productos.forEach(producto => {
        templateCards.querySelector('h5').textContent = producto.producto
        templateCards.querySelector('span').textContent = producto.precio
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
enviarPresupuesto.addEventListener('click',e =>{
    if(e.target.classList.contains('round')){
        enviarPresupuesto.classList.replace("round","hidden")
    }
    else{
        e.target.classList.toggle("round")
        e.target.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-check-circle-fill" viewBox="0 0 16 16">
        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
        </svg>`
        carrito.splice(0,carrito.length)
        pintarCarrito(carrito)
        pintarFooter(carrito)
        footer.innerHTML = ` <tr id="footer">
        <th scope="row" colspan="5">Enviamos tu pedido, nuestros encargados de ventas se pondran en contacto.</th>
      </tr>`
      
    }
})

//aplico filtros
filtrarColumnas.addEventListener('click', e =>{
    filtroColumnas(e)
})
listarProductos.addEventListener('click', e =>{
    listaProductos(e)
})
filtrarAccesorios.addEventListener('click',e => {
    filtroAccesorio(e)
})
buscarProductos.addEventListener('click',e =>{
    buscarProducto(e)
})

const agregarCarrito = e =>{
    if(e.target.classList.contains('btn-dark')){
        if(enviarPresupuesto.classList.contains("round") || enviarPresupuesto.classList.contains("hidden")){
            enviarPresupuesto.classList.replace("round","normal")
            enviarPresupuesto.classList.replace("hidden","normal")
            enviarPresupuesto.innerHTML = "ENVIAR"
        }
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
                    producto: objeto.querySelector('.card-producto').textContent,
                    cantidad: 1,
                    precio: objeto.querySelector('.Precio').textContent               
                }
            )
         }
         pintarCarrito(carrito)
         pintarFooter(carrito) 
    }
    
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
    console.log(e.target)
    presupuesto.innerHTML = " "
        if(e.target.classList.contains('btn-success')){
           let objeto = e.target.parentElement.parentElement
           let ids = objeto.querySelector('.btn-success').dataset.id
           let position = carrito.findIndex(index => index.id == ids)
           carrito[position].cantidad++
           const clone = templatepresupuesto.cloneNode(true)
           fragment.appendChild(clone)
           presupuesto.appendChild(fragment)
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
           }
           const clone = templatepresupuesto.cloneNode(true)
           fragment.appendChild(clone)
           presupuesto.appendChild(fragment)
        }
        pintarCarrito(carrito)
        pintarFooter(carrito) 
        e.stopPropagation(e)
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
const filtroColumnas = (e) => {
    items.innerHTML = ""
    const productoFiltrado = productos.filter(filtrado  => filtrado.tipo.includes("Columna"))
    productoFiltrado.forEach(producto => {
        templateCards.querySelector('h5').textContent = producto.producto
        templateCards.querySelector('span').textContent = producto.precio
        templateCards.getElementById('imgCard').setAttribute("src",producto.imgUrl)
        templateCards.querySelector('.btn-dark').dataset.id = producto.id
        const clone = templateCards.cloneNode(true)
        fragment.appendChild(clone)
       
    });
    items.appendChild(fragment)
}
const listaProductos = e =>{
    items.innerHTML =""
    productos.forEach(producto =>{
        templateCards.querySelector('h5').textContent = producto.producto
        templateCards.querySelector('span').textContent = producto.precio
        templateCards.getElementById('imgCard').setAttribute("src",producto.imgUrl)
        templateCards.querySelector('.btn-dark').dataset.id = producto.id
        const clone = templateCards.cloneNode(true)
        fragment.appendChild(clone)  
    });
    items.appendChild(fragment)
}
const filtroAccesorio = e =>{

    //tengo que agregar un tipo = accesorio en la json y filtrar por eso.
    items.innerHTML = ""
    const productoFiltrado = productos.filter(filtrado  => filtrado.tipo.includes("Accesorio"))
    productoFiltrado.forEach(producto => {
        templateCards.querySelector('h5').textContent = producto.producto
        templateCards.querySelector('span').textContent = producto.precio
        templateCards.getElementById('imgCard').setAttribute("src",producto.imgUrl)
        templateCards.querySelector('.btn-dark').dataset.id = producto.id
        const clone = templateCards.cloneNode(true)
        fragment.appendChild(clone)
       
    });
    items.appendChild(fragment)
}
const buscarProducto = e =>{
    items.innerHTML=""
    let productoAbuscar = document.querySelector(".productoAbuscar").value
    const productosBuscados = productos.filter(filtrado => filtrado.producto.includes(productoAbuscar.toUpperCase()))
    productosBuscados.forEach(producto => {
        templateCards.querySelector('h5').textContent = producto.producto
        templateCards.querySelector('span').textContent = producto.precio
        templateCards.getElementById('imgCard').setAttribute("src",producto.imgUrl)
        templateCards.querySelector('.btn-dark').dataset.id = producto.id
        const clone = templateCards.cloneNode(true)
        fragment.appendChild(clone)
       
    });
    items.appendChild(fragment)
}