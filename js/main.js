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
const buscarProductos = document.getElementById('buscarProductos')
const fragment = document.createDocumentFragment()
const productos = []
const carrito = []
let estado = 0   // 1- Listar 2-FiltroColumna 3-FiltroAccesorio 4-Buscar  //lo aplico para refrescar solo el lugar donde estoy parado 
                                                                          //ej: si estoy sobre el filtro columnas refrescar solo las columnas

//cargo los datos del json que lo tengo en una pagina aparte
const fetchdata = async() => {
    try {
          const res = await fetch('../api.json')
          const data = await res.json()
          pintCards(data)
    } catch (error) {
        console.log(error)
    }   
}
//comienzo cargando el json en un objeto. para poder usarlo a gusto
const pintCards = data => {
    let storageGetProducto = localStorage.getItem("storageProducto")
    let objetoStorageProducto = JSON.parse(storageGetProducto)
    if(objetoStorageProducto == null){
        data.forEach(producto => {    //Cargo todos los datos en un objeto productos que viene de la json si es que no hay datos en memoria
            productos.push({
                id: producto.id,
                producto : producto.producto.toUpperCase(),
                precio : producto.precio,
                imgUrl: producto.imgUrl,
                tipo: producto.tipo,  
                carrito: producto.carrito//
            })
        });
    }
    else{
            recuperoStorageProductos()
            recuperoStorageCarrito()
            pintarCarrito(carrito)
            pintarFooter(carrito) 
      //  console.log(recuperoStorageCarrito())
    }     
            pintar(productos)
            //pintar(carrito)
}

//Eventos.
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
        vaciar()
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
filtrarColumnas.addEventListener('click', e =>{
    filtroColumnas(e)
})
filtrarAccesorios.addEventListener('click',e => {
    filtroAccesorio(e)
})
listarProductos.addEventListener('click', e =>{
    listaProductos(e)
})
buscarProductos.addEventListener('click', () =>{
   buscarProducto()
})

//FUNCIONES

//pinto el array en las cards     
const pintar = (array) => {
    items.innerHTML=""
    array.forEach(({producto,precio,imgUrl,id,carrito}) => {  //use el desestructurar el objeto por q lo solicitaba la entrega
        templateCards.querySelector('h5').textContent = producto
        templateCards.querySelector('span').textContent = precio
        templateCards.getElementById('imgCard').setAttribute("src",imgUrl)
        templateCards.querySelector('.btn-dark').dataset.id = id
        templateCards.querySelector('.cant-Card').textContent = carrito
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
//pinto el carrito en la tabla
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
//pinto la cantidad total del carrito y el precio total, en la parte inferior de la tabla.
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
//agrego items al carrito (tabla) le llamo carrito pero no es un carrito. estoy armando una planilla de presupuesto.
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
         guardarStorage()
         estadoPintar()
         pintarCarrito(carrito) //repinto el carro
         pintarFooter(carrito) // repinto el footerS
        
    } 
    e.stopPropagation()
}
//funciones de los botones + y - de la tabla, con la que agrego o saco elementos, lo mismo son descontados tambien de las cars en el section principal
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
        guardarStorage()

        estadoPintar()
        pintarCarrito(carrito)
        pintarFooter(carrito) 
        e.stopPropagation()
}
//Vacio la planilla de presupuesto completa con un boton. Tambien puedo vaciar item a item. con el  btn " - " de la tabla
const btnVaciarCarrito = e => {
    if(e.target.classList.contains('btn-danger')){
          vaciar()
    }
}
//funcion para filtrar por columnas, que es el producto principal q vende la empresa. le paso el array del filter a la funcion pintar. 
const filtroColumnas = () => {
    estado = 2
    items.innerHTML = ""
    const productoFiltrado = productos.filter(filtrado  => filtrado.tipo.includes("Columna"))
    pintar(productoFiltrado)
}
//funcion para filtrar por accesorio, producto secundario q vende la empresa. le paso el array del filter a la funcion pintar. 
const filtroAccesorio = () =>{
    estado= 3
    items.innerHTML = ""
    const productoFiltrado = productos.filter(filtrado  => filtrado.tipo.includes("Accesorio"))
    pintar(productoFiltrado)
}
//llama a la funcion pintar() y me vuelve a listar los productos cuando doy click en su respectivo boton
const listaProductos = () =>{
    estado = 1
    pintar(productos)
}
//Busco los productos del array de objetos
const buscarProducto = () =>{
    estado = 4 
   // items.innerHTML = ""
    let InputBuscar = document.getElementById('productoAbuscar').value.toUpperCase()
    const busqueda = productos.filter(fil  => fil.producto.toUpperCase().includes(InputBuscar))
    console.log(busqueda)
    pintar(busqueda) 
}
//Con esta funcion vacio el carro.  es llamada por btnVaciarCarrito 
const vaciar = () =>{
    carrito.splice(0,carrito.length)
    pintarCarrito(carrito)
    footer.innerHTML = ` <tr id="footer">
                         <th scope="row" colspan="5">Arma tu pedido ... !</th>
                         </tr>`
    for (const resetCant of productos) {
        resetCant.carrito = 0
    }
    localStorage.clear()
    pintar(productos)
}
const estadoPintar = () =>{
    if(estado === 2){   
        filtroColumnas()  //Si entra en esta funcion es que estoy en el filtro de columnas, por lo que agrego al carro y refresco solo las cards columnas
     }
     else if(estado === 3){
        filtroAccesorio() //Si entra en esta funcion es que estoy en el filtro de accesorio, por lo que agrego al carro y refresco solo las cards accesorio
     }
     else if(estado === 4){
        buscarProducto() //Si entra en esta funcion es que estoy en el filtro de busquede de usuario, por lo que agrego al carro y refresco solo las cards de lo que busco el usuario
     }
     else{
        pintar(productos) // refresco todas las cards despues de agregar al carrito
     }  
}


//STORAGE; 
function recuperoStorageProductos(){
    let storageGetProducto = localStorage.getItem("storageProducto")   //recupero los datos y los guardo en productos para trabajarlos normal
    let objetoStorageProducto = JSON.parse(storageGetProducto)
    objetoStorageProducto.forEach(({id,producto,precio,imgUrl,tipo,carrito}) => {    // Si hay datos en el storage los guardo en el objeto productos
        productos.push({
            id: id,
            producto : producto.toUpperCase(),
            precio : precio,
            imgUrl: imgUrl,
            tipo: tipo,  
            carrito: carrito//
        })
    })
}
function recuperoStorageCarrito(){
    let storageGetCarrito = localStorage.getItem("storageCarrito") //recupero los datos y los guardo en carrito para trabajarlos normal
    let objetoStorageCarrito = JSON.parse(storageGetCarrito)
    objetoStorageCarrito.forEach(({id,producto,cantidad,precio}) =>{
        carrito.push(
            {
                id: id,
                producto: producto,
                cantidad: cantidad,
                precio: precio              
            })
    })
}
function guardarStorage(){
  //Guardo el carrito y el producto en el storage. 
  let storageProducto = JSON.stringify(productos)
  localStorage.setItem("storageProducto",storageProducto)
  let storageCarrito = JSON.stringify(carrito)
  localStorage.setItem("storageCarrito",storageCarrito)
}