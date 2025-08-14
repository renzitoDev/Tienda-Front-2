//variables globales
let tablePro = document.querySelector("#table-pro > tbody");
let searchInput = document.querySelector("#search-input");
let nameUser = document.querySelector("#nombre-usuario");
let btnLogout = document.querySelector("#btnLogout");

//funcion para poner el nombre del usuario
let getUser = () => {
    let user = JSON.parse(localStorage.getItem("userLogin"));
    nameUser.textContent = user.nombre;
};

//evento para el boton del logout
btnLogout.addEventListener("click", () =>{
    localStorage.removeItem("userLogin");
    location.href = "../login.html";
});

//evento para probar el campo de buscar
searchInput.addEventListener("keyup", ()=>{
    //console.log(searchInput.value);
    searchProductTable();
});

//evento para el navegador
document.addEventListener("DOMContentLoaded", ()=>{
    getTableData();
    getUser();
});

//funcion para traer los datos de la BD a la tabla
let getTableData = async ()=>{
    let url = "http://localhost/backend-apiCrud/productos";
    try {
        let respuesta = await fetch(url,{
            method: "GET",
            headers: {
                "Content-Type" : "application/json"
            }
        });
        if (respuesta.status === 204) {
           console.log("No hay datos en la BD");
        }else{
            let tableData = await respuesta.json();
            console.log(tableData);
            //agregar los datos de la tabla a localStorage
            localStorage.setItem("datosTabla", JSON.stringify(tableData));
            //agregar los datos a la tabla
            tableData.forEach((dato, i)=>{
                let row = document.createElement("tr");
                row.innerHTML = `
                    <td> ${i+1} </td>
                    <td> ${dato.nombre} </td>
                    <td> ${dato.descripcion} </td>
                    <td> ${dato.precio} </td>
                    <td> ${dato.stock} </td>
                    <td>  <img src="${dato.imagen}" width="100"> </td>
                    <td>
                        <button  id="btn-edit" onclick="editDataTable(${i})" type="button" class="btn btn-warning">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                                <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                            </svg>
                        </button> - 
                        ${  nameUser.textContent == "vendedor" ? "" :  
                        `<button  id="btn-delete" onclick="deleteDataTable(${i})" type="button" class="btn btn-danger">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                                <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                            </svg>
                        </button>`}
                    </td>
                `;
                tablePro.appendChild(row);
            });
           
        }
    } catch (error) {
        console.log(error);
    }

};


//funcion para editar algun producto de la tabla
let editDataTable = ( pos )=>{
    let products = [];
    let productsSave = JSON.parse(localStorage.getItem("datosTabla"));
    if (productsSave != null) {
        products = productsSave;
    }
    let singleProduct = products[pos];
    //console.log(singleProduct);
    localStorage.setItem("productEdit", JSON.stringify(singleProduct));
    localStorage.removeItem("datosTabla");
    location.href = "../crear-pro.html"
}


//funcion para eliminar algun dato de la tabla
let deleteDataTable = ( pos )=>{
    let products = [];
    let productsSave = JSON.parse(localStorage.getItem("datosTabla"));
    if (productsSave != null) {
        products = productsSave;
    }
    let singleProduct = products[pos];
    //console.log( "Producto a eliminar: "+singleProduct.nombre );
    let IDProduct = {
        id: singleProduct.id
    }
    let confirmar = confirm(`¿Deseas eliminar ${singleProduct.nombre} ?`);
    if (confirmar) {
        //llamar la funcion para realziar la peticion
        sendDeleteProduct( IDProduct );
    }
}

//funcion para realizar la peticion de eliminar un producto
let sendDeleteProduct = async ( id )=>{
    let url = "http://localhost/backend-apiCrud/productos";
    try {
        let respuesta = await fetch(url,{
            method: "DELETE",
            headers: {
                "Content-Type" : "application/json"
            },
            body: JSON.stringify(id)
        });
        if (respuesta.status === 406) {
            alert("El ID enviado no fue admitido");
        }else{
            let mensaje = await respuesta.json();
            alert(mensaje.message);
            location.reload();
        }
    } catch (error) {
        console.log(error);
    }
}

//funcion para quitar productos de la tabla
let clearDataTable = ()=>{
    let rowTable = document.querySelectorAll("#table-pro > tbody > tr");
    //console.log(rowTable);
    rowTable.forEach((row)=>{
        row.remove();
    });
};

//funcion para buscar un product de la tabla
let searchProductTable = ()=>{
    let products = [];
    let productsSave = JSON.parse(localStorage.getItem("datosTabla"));
    if (productsSave != null) {
        products = productsSave;
    }

    //console.log(products);
    //obtener lo escrito en campo de texto
    let textSearch = searchInput.value.toLowerCase();
    //console.log(textSearch);
    clearDataTable();
    let i = 0;
    for (let pro of products) {
        //comprobar coincidencia de los productos
        if ( pro.nombre.toLowerCase().indexOf(textSearch) != -1) {
            //console.log("encontre algo");
            let row = document.createElement("tr");
                row.innerHTML = `
                    <td> ${i++} </td>
                    <td> ${pro.nombre} </td>
                    <td> ${pro.descripcion} </td>
                    <td> ${pro.precio} </td>
                    <td> ${pro.stock} </td>
                    <td>  <img src="${pro.imagen}" width="100"> </td>
                    <td>
                        <button  id="btn-edit" onclick="editDataTable(${i})" type="button" class="btn btn-warning">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                                <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                            </svg>
                        </button> - 
                        ${  nameUser.textContent == "vendedor" ? "" :  
                        `<button  id="btn-delete" onclick="deleteDataTable(${i})" type="button" class="btn btn-danger">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                                <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                            </svg>
                        </button>`}
                    </td>
                `;
                tablePro.appendChild(row);
        }
    }

};