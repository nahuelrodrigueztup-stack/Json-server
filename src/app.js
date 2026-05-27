let filasAlumnos = document.getElementById("filas-alumnos");
let form = document.getElementById("formulario-alumnos");
let botonSubmit = document.getElementById("boton-submit");
let arrayAlumnos = [];
let idEnEdicion = null;

console.log('hola mundo');
form.addEventListener("submit", (event) =>handleSubmit(event));
  //puedo agregar atributos personalizados a cualquier etiqueta html y ponerles cualquier nombre,
  //sin embargo no es una buena practica utilizar nombres de atributos como accion, o nombre o identificador etc, 
  //ya que pueden entrar en conflicto con atributos nativos de html, y ademas
  //no es el estandar ni la forma correcta de hacerlo, lo correcto es utilizar el prefijo data- seguido del nombre que queramos darle al atributo, por ejemplo data-id, data-accion, data-nombre etc, de esta forma estamos siguiendo el estandar y evitando posibles conflictos con atributos nativos de html.

async function mostrarAlumnos(){
  await fetch("http://localhost:3000/alumnos")
  .then(respuesta => respuesta.json())
  .then(alumnos => {
    filasAlumnos.innerHTML = "";
    arrayAlumnos = alumnos;
    arrayAlumnos.forEach(alumno => 
    {
      let fila = document.createElement("tr");
      fila.innerHTML = `
      <td>${alumno.id}</td>
      <td>${alumno.nombre}</td>
      <td>${alumno.apellido}</td>
      <td>${alumno.edad}</td>
      <td>${alumno.email}</td>
      <td>${alumno.comision}</td>
      <td>${alumno.activo}</td>
      <td>
        <button class="btn-editar" data-id="${alumno.id}" data-accion="editar" >Editar</button>
        <button class="btn-eliminar" data-id="${alumno.id}" data-accion="eliminar" >Eliminar</button>
      </td>
      `
      filasAlumnos.appendChild(fila);
    }
    )  
  });
}

mostrarAlumnos();

//e.target es el elemento exacto del dom
//e.target.closest("button") busca el boton mas cercano al elemento que se hizo click, si el click se hizo en el boton, devuelve el boton, si el click se hizo en un hijo del boton, devuelve el boton, si el click se hizo fuera del boton, devuelve null
//si se hace click afuera del boton, boton va a ser null, por lo tanto no se va a ejecutar el codigo que esta dentro del if, y se va a salir de la funcion, si se hace click en el boton o en un hijo del boton, boton va a ser el boton, por lo tanto se va a ejecutar el codigo que esta dentro del if, y se va a obtener el id y la accion del boton para luego realizar la accion correspondiente (editar o eliminar) dependiendo de la accion que se haya obtenido.

//aqui delegamos el manejo del evento al elemento padre, en este caso filasAlumnos, para evitar tener que agregar un event listener a cada boton de editar y eliminar, ya que estos botones se generan dinamicamente cada vez que se muestra la lista de alumnos, y si agregamos un event listener a cada boton, tendriamos que agregarlo cada vez que se genera un nuevo boton, lo cual no es eficiente ni escalable, en cambio delegando el manejo del evento al elemento padre, podemos manejar el evento de todos los botones de editar y eliminar con un solo event listener, y ademas podemos manejar el evento de los botones que se generen dinamicamente sin tener que agregar un event listener cada vez.

filasAlumnos.addEventListener("click", (e) => {
 const boton = e.target.closest("button");
  console.log(boton);
  if (!boton) return;

  idEnEdicion = boton.dataset.id;
  let accion = boton.dataset.accion;
  console.log(id, accion);

  if (accion === 'eliminar') {
    confirm("¿Estas seguro que quieres eliminar este alumno?") && eliminarAlumno(idEnEdicion);
    mostrarAlumnos();    
  }

  if (accion === 'editar') {    
    prepararEdicion(idEnEdicion);
  }
  
})

async function eliminarAlumno(id) {
  await fetch(`http://localhost:3000/alumnos/${id}`, {
    method: "DELETE"
  })
  .then(respuesta => respuesta.json())
  .then(() => {
    arrayAlumnos = arrayAlumnos.filter(alumno => alumno.id != id);
    resetearFormulario();
    mostrarAlumnos();
  })
}

function prepararEdicion(id) {
  botonSubmit.innerText = "Editar Alumno";
  let alumno = arrayAlumnos.find(alumno => alumno.id == id);
  console.log(alumno);
  formulario.nombre.value = alumno.nombre;
  formulario.apellido.value = alumno.apellido;
  formulario.edad.value = alumno.edad;
  formulario.email.value = alumno.email;
  formulario.comision.value = alumno.comision;
  formulario.activo.value = alumno.activo;
}

async function handleSubmit(evento) {
  evento.preventDefault();
  const alumno = {
    nombre: formulario.nombre.value,
    apellido: formulario.apellido.value,
    edad: formulario.edad.value,
    email: formulario.email.value,
    comision: formulario.comision.value,
    activo: formulario.activo.value
  };
  if (idEnEdicion) {
    await editAlumno(idEnEdicion, alumno);
  } else {
    await createAlumno(alumno);
  }
}

async function createAlumno(alumno) {
  await fetch("http://localhost:3000/alumnos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(alumno)
  })
  .then(respuesta => respuesta.json())
  .then(alumnoCreado => {
    arrayAlumnos.push(alumnoCreado);
    mostrarAlumnos();
  })
}

async function editAlumno(id,alumno) {
  await fetch(`http://localhost:3000/alumnos/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(alumno)
  })
  .then(respuesta => respuesta.json())
  .then(alumnoEditado => {
    let indice = arrayAlumnos.findIndex(a => a.id == alumnoEditado.id);
    arrayAlumnos[indice] = alumnoEditado;
    resetearFormulario();
    mostrarAlumnos();
  })
}

function resetearFormulario() {
  idEnEdicion = null;
  formulario.reset();
  botonSubmit.innerText = "Agregar Alumno";
}