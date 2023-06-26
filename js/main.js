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
            tipo: producto.tipo,  
            carrito: producto.carrito//
        })
    });

    pintar(productos)
   
      
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
        for (const resetCant of productos) {
                resetCant.carrito = 0
        }
            pintar(productos)  
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
         productos[ids - 1].carrito  = productos[ids - 1].carrito + 1 //pinto en items, que se agrego un producto
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
         pintar(productos)
         pintarCarrito(carrito) //repinto el carro
         pintarFooter(carrito) // repinto el footerS
        
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
    presupuesto.innerHTML = " "
        if(e.target.classList.contains('btn-success')){
           let objeto = e.target.parentElement.parentElement
           let ids = objeto.querySelector('.btn-success').dataset.id
           let position = carrito.findIndex(index => index.id == ids)
           carrito[position].cantidad++
           productos[ids - 1].carrito  = productos[ids - 1].carrito + 1 //pinto en items, que se agrego un producto
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
             productos[ids - 1].carrito  = productos[ids - 1].carrito - 1 //pinto en items, que se saco un producto
           }
           else{         
              productos[ids - 1].carrito  = productos[ids - 1].carrito - 1 //pinto en items, que se saco un producto
              carrito.splice(position,1)
              if(carrito.length === 0){
                    vaciar()
                    return
              }
             
           }
           const clone = templatepresupuesto.cloneNode(true)
           fragment.appendChild(clone)
           presupuesto.appendChild(fragment)
        }
        pintar(productos)
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
          vaciar()
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
    pintar(productosBuscados)
}
const pintar = (array) => {
    items.innerHTML=""
    array.forEach(producto => {
        templateCards.querySelector('h5').textContent = producto.producto
        templateCards.querySelector('span').textContent = producto.precio
        templateCards.getElementById('imgCard').setAttribute("src",producto.imgUrl)
        templateCards.querySelector('.btn-dark').dataset.id = producto.id
        templateCards.querySelector('.cant-Card').textContent = producto.carrito
        if(templateCards.querySelector('.cant-Card').textContent == 0){
            templateCards.querySelector('.cant-Card').style.display = "none";  //si es cero le pongo display none por cuestion estetica
        }
        else{
            templateCards.querySelector('.cant-Card').style.display = "inline-block"; //si es mayor a cero permito ver el contenido de la cantidad 
        }
        const clone = templateCards.cloneNode(true)
        fragment.appendChild(clone)

    });
    
    
    items.appendChild(fragment)
}
const vaciar = () =>{
    carrito.splice(0,carrito.length)
    pintarCarrito(carrito)
    footer.innerHTML = ` <tr id="footer">
                         <th scope="row" colspan="5">Arma tu pedido ... !</th>
                         </tr>`
    for (const resetCant of productos) {
        resetCant.carrito = 0
    }
    pintar(productos)
}