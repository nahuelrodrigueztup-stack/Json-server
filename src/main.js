let filasAlumnos = document.getElementById("filas-alumnos");
let formulario = document.getElementById("formulario-alumnos");
let botonSubmit = document.getElementById("boton-submit");
let arrayAlumnos = [];
let idEnEdicion = null;

formulario.addEventListener("submit", (e) =>handleSubmit(e));
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
        <button class="btn-editar" data-id="${alumno.id}" data-accion="editar" ><span>Editar</span></button>
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
  e.preventDefault();
  console.log(e.target.closest("button"));
  const boton = e.target.closest("button");

  if (!boton) return;

  idEnEdicion = boton.dataset.id;
  let accion = boton.dataset.accion;


  if (accion === 'eliminar') {
    confirm("¿Estas seguro que quieres eliminar este alumno?") && eliminarAlumno(idEnEdicion); 
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
  botonSubmit.textContent = "Editar Alumno";
  let alumno = arrayAlumnos.find(alumno => alumno.id == id);
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
  //'',0, undefined, null, NaN son valores falsy, es decir que en una condicion if se consideran como false, mientras que cualquier otro valor se considera como true, por lo tanto si idEnEdicion es null, la condicion if (idEnEdicion) va a ser false, y se va a ejecutar el bloque de codigo del else, que es crear un nuevo alumno, si idEnEdicion tiene un valor (por ejemplo un id), la condicion if (idEnEdicion) va a ser true, y se va a ejecutar el bloque de codigo del if, que es editar el alumno existente.
  //si es null la condicion es false, porque null es un valor falsy, por lo tanto se va a ejecutar el bloque de codigo del else, que es crear un nuevo alumno, si tiene un valor, la condicion es true, porque cualquier valor que no sea falsy es truthy, por lo tanto se va a ejecutar el bloque de codigo del if, que es editar el alumno existente.
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
  botonSubmit.textContent = "Agregar Alumno";
}