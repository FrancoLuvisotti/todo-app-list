// Función para obtener y mostrar tareas
async function fetchTasks() {
    const token = localStorage.getItem('jwtToken'); // Obtener el token desde localStorage

    if(!token){
        window.location.href = './login.html';
    }

    try {
        const response = await fetch('http://localhost:5000/tasks', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Incluyendo el token JWT
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error al obtener tareas', errorData);
            alert(`Error: ${errorData.message}`);
            return;
        }

        const tasks = await response.json();

        if (!Array.isArray(tasks)) {
            throw new TypeError('Se esperaba un arreglo de tareas');
        }

        const taskList = document.getElementById('task-list');
        taskList.innerHTML = ''; // Limpiar la lista antes de agregar las tareas

        tasks.forEach(task => {
            const taskItem = document.createElement('div');
            taskItem.className = 'card mb-3';
            taskItem.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title ${task.status === 'completed' ? 'task-completed' : ''}">${task.title}</h5>
                    <p class="card-text">${task.description}</p>
                    <div class="d-flex justify-content-between mt-auto">
                        <button class="btn btn-success" onclick="completeTask('${task._id}')">Completar</button>
                        <button class="btn btn-warning" onclick="openEditModal('${task._id}', '${task.title}', '${task.description}')">Editar</button>
                        <button class="btn btn-danger" onclick="deleteTask('${task._id}')">Eliminar</button>
                    </div>
                </div>
            `;
            taskList.appendChild(taskItem);
        });
    } catch (error) {
        console.error('Error al obtener tareas:', error);
        alert('Ocurrió un error al cargar las tareas. Intenta nuevamente.');
    }
}

// Función para agregar una nueva tarea
async function addTask(event) {
    event.preventDefault(); // Evitar el comportamiento por defecto del formulario

    const title = document.getElementById('task-title').value.trim();
    const description = document.getElementById('task-description').value.trim();

    if (!title || !description) {
        alert('Por favor, completa todos los campos.');
        return;
    }

    const newTask = { title, description };
    const token = localStorage.getItem('jwtToken') // Obtener el token desde localStorage

    try {
        const response = await fetch(`http://localhost:5000/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Incluyendo el token JWT
            },
            body: JSON.stringify(newTask)
        });

        if (response.ok) {
            alert('Tarea agregada con éxito!');
            fetchTasks(); // Actualizar la lista de tareas
            const addModal = new bootstrap.Modal(document.getElementById('add-task-modal'));
            addModal.hide(); // Cerrar el modal
            document.getElementById('add-task-form').reset(); // Reiniciar el formulario
        } else {
            const errorData = await response.json();
            alert(`Error: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error al agregar tarea:', error);
        alert('Ocurrió un error al agregar la tarea. Intenta nuevamente.');
    }
}

// Función para completar una tarea
async function completeTask(taskId) {
    const token = localStorage.getItem('jwtToken') // Obtener el token desde localStorage

    try {
        const response = await fetch(`http://localhost:5000/tasks/${taskId}/complete`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Incluyendo el token JWT
            },
        });

        if (response.ok) {
            alert('Tarea marcada como completada!');
            fetchTasks(); // Actualizar la lista de tareas
        } else {
            const errorData = await response.json();
            alert(`Error: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error al completar la tarea:', error);
        alert('Ocurrió un error al completar la tarea. Intenta nuevamente.');
    }
}

// Función para abrir el modal de edición
function openEditModal(taskId, title, description) {
    document.getElementById('edit-task-id').value = taskId;
    document.getElementById('edit-task-title').value = title;
    document.getElementById('edit-task-description').value = description;
    const editModal = new bootstrap.Modal(document.getElementById('edit-task-modal'));
    editModal.show();
}

// Función para editar una tarea
async function editTask(event) {
    event.preventDefault(); // Evitar el comportamiento por defecto del formulario

    const taskId = document.getElementById('edit-task-id').value;
    const title = document.getElementById('edit-task-title').value.trim();
    const description = document.getElementById('edit-task-description').value.trim();

    if (!title || !description) {
        alert('Por favor, completa todos los campos.');
        return;
    }

    const updatedTask = { title, description };
    const token = localStorage.getItem('jwtToken') // Obtener el token desde localStorage

    try {
        //console.log('taskId:', taskId);
        const response = await fetch(`http://localhost:5000/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Incluyendo el token JWT
            },
            body: JSON.stringify(updatedTask)
        });

        if (response.ok) {
            alert('Tarea editada con éxito!');
            fetchTasks(); // Actualizar la lista de tareas
            const editModal = bootstrap.Modal.getInstance(document.getElementById('edit-task-modal'));
            editModal.hide(); // Cerrar el modal
        } else {
            const errorData = await response.json();
            alert(`Error: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error al editar tarea:', error);
        alert('Ocurrió un error al editar la tarea. Intenta nuevamente.');
    }
}

// Función para eliminar una tarea
async function deleteTask(taskId) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
        return; // Cancelar la acción si el usuario no confirma
    }

    const token = localStorage.getItem('jwtToken') // Obtener el token desde localStorage

    try {
        const response = await fetch(`http://localhost:5000/tasks/${taskId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}` // Incluyendo el token JWT
            }
        });

        if (response.ok) {
            alert('Tarea eliminada con éxito!');
            fetchTasks(); // Actualizar la lista de tareas
        } else {
            const errorData = await response.json();
            alert(`Error: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error al eliminar tarea:', error);
        alert('Ocurrió un error al eliminar la tarea. Intenta nuevamente.');
    }
}

//Funcion para cerrar sesion
function logout() {
    //Eliminar jwt del localStorage
    localStorage.removeItem('jwtToken');
    //Redirigir a la pagina del login
    window.location.href = '../views/login.html';

}

// Obtener y mostrar las tareas al cargar la página
document.addEventListener('DOMContentLoaded', fetchTasks);

// Añadir eventos a los formularios
document.getElementById('add-task-form').addEventListener('submit', addTask);
document.getElementById('edit-task-form').addEventListener('submit', editTask);