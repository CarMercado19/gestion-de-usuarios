<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from './stores/useUserStore';

const store = useUserStore();

const getInitialForm = () => ({
    id: null,
    name: '',
    email: '',
    address: { street: '' },
    phone: '',
    website: ''
});

const formData = ref(getInitialForm());
const errors = ref({});
const generalError = ref('');
const successMessage = ref('');
const isEditing = ref(false);

onMounted(() => {
    store.fetchUsers();
});

const validateForm = () => {
    errors.value = {};
    generalError.value = '';
    successMessage.value = '';
    let isValid = true;

    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!formData.value.name || !nameRegex.test(formData.value.name.trim())) {
        errors.value.name = "Solo se permiten letras, acentos y ñ.";
        isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.value.email || !emailRegex.test(formData.value.email.trim())) {
        errors.value.email = "Ingresa un correo electrónico válido.";
        isValid = false;
    }

    const streetRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!formData.value.address.street || !streetRegex.test(formData.value.address.street.trim())) {
        errors.value.street = "La calle solo acepta caracteres alfanuméricos.";
        isValid = false;
    }

    const phoneRegex = /^\d{10}$/;
    if (!formData.value.phone || !phoneRegex.test(formData.value.phone.trim())) {
        errors.value.phone = "El teléfono debe contener exactamente 10 números.";
        isValid = false;
    }

    const websiteRegex = /^https:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]*)?$/;
    if (!formData.value.website || !websiteRegex.test(formData.value.website.trim())) {
        errors.value.website = "Debe iniciar con https:// y tener un dominio válido (ej. https://sitioweb.com).";
        isValid = false;
    }

    if (!isValid) {
        generalError.value = "No se puede realizar el guardado revisa tus datos";
    }

    return isValid;
};

const saveUser = () => {
    if (validateForm()) {
        if (isEditing.value) {
            store.updateUser(formData.value);
        } else {
            store.addUser(formData.value);
        }

        successMessage.value = "Guardado Exitosamente";

        cancelEdit();
    }
};

const editUser = (user) => {
    formData.value = JSON.parse(JSON.stringify(user));
    if (!formData.value.address) formData.value.address = { street: '' };
    isEditing.value = true;
    errors.value = {};
    generalError.value = '';
    successMessage.value = '';
};

const deleteUser = (id) => {
    if (confirm("¿Estás seguro de eliminar este usuario?")) {
        store.deleteUser(id);
    }
};

const cancelEdit = () => {
    formData.value = getInitialForm();
    isEditing.value = false;
    errors.value = {};
};

const downloadJson = () => {
    const dataStr = JSON.stringify(store.users, null, 2);

    const blob = new Blob([dataStr], { type: 'application/json' });

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'usuarios.json';
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

</script>

<template>
    <div class="container">
        <h1>Gestión de Usuarios</h1>

        <div v-if="generalError" class="alert error-legend">{{ generalError }}</div>
        <div v-if="successMessage" class="alert success-legend">{{ successMessage }}</div>

        <form @submit.prevent="saveUser" class="user-form">

            <div class="form-group">
                <label>Nombre:</label>
                <input v-model="formData.name" type="text" placeholder="Ej. Juan Pérez"/>
                <span class="error-text" v-if="errors.name">{{ errors.name }}</span>
            </div>

            <div class="form-group">
                <label>Correo Electrónico:</label>
                <input v-model="formData.email" type="text" placeholder="ejemplo@correo.com"/>
                <span class="error-text" v-if="errors.email">{{ errors.email }}</span>
            </div>

            <div class="form-group">
                <label>Calle:</label>
                <input v-model="formData.address.street" type="text" placeholder="Calle 123"/>
                <span class="error-text" v-if="errors.street">{{ errors.street }}</span>
            </div>

            <div class="form-group">
                <label>Teléfono (máx 10 dígitos):</label>
                <input v-model="formData.phone" type="text" placeholder="5551234567"/>
                <span class="error-text" v-if="errors.phone">{{ errors.phone }}</span>
            </div>

            <div class="form-group">
                <label>Sitio Web:</label>
                <input v-model="formData.website" type="text" placeholder="https://misitio.com"/>
                <span class="error-text" v-if="errors.website">{{ errors.website }}</span>
            </div>

            <div class="button-group">
                <button type="submit">
                    {{ isEditing ? 'Actualizar Usuario' : 'Guardar Usuario' }}
                </button>
                <button type="button" @click="cancelEdit" v-if="isEditing" class="btn-cancel">
                    Cancelar
                </button>
                <button type="button" @click="downloadJson" :disabled="isEditing"
                        class="btn-export">
                    Descargar JSON
                </button>
            </div>
        </form>

        <hr/>

        <h2>Lista de Usuarios</h2>
        <table>
            <thead>
            <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Calle</th>
                <th>Teléfono</th>
                <th>Sitio Web</th>
                <th>Acciones</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="user in store.users" :key="user.id">
                <td>{{ user.id }}</td>
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td>{{ user.address?.street }}</td>
                <td>{{ user.phone }}</td>
                <td>{{ user.website }}</td>
                <td>
                    <button @click="editUser(user)" :disabled="isEditing" class="btn-edit">Editar
                    </button>
                    <button @click="deleteUser(user.id)" :disabled="isEditing" class="btn-delete">
                        Eliminar
                    </button>
                </td>
            </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped>
.container {
    font-family: Arial, sans-serif;
    max-width: 900px;
    margin: 0 auto;
    padding: 20px;
}

.user-form {
    background: #f9f9f9;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
}

.form-group {
    margin-bottom: 15px;
    display: flex;
    flex-direction: column;
}

.form-group label {
    margin-bottom: 5px;
    font-weight: bold;
}

.form-group input {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.error-text {
    color: red;
    font-size: 0.85em;
    margin-top: 5px;
}

.alert {
    padding: 10px;
    margin-bottom: 15px;
    border-radius: 4px;
    font-weight: bold;
    text-align: center;
}

.error-legend {
    background-color: #ffe6e6;
    color: #cc0000;
    border: 1px solid #cc0000;
}

.success-legend {
    background-color: #e6ffe6;
    color: #008000;
    border: 1px solid #008000;
}

.button-group {
    display: flex;
    gap: 10px;
}

button {
    padding: 10px 15px;
    border: none;
    border-radius: 4px;
    background-color: #007bff;
    color: white;
    cursor: pointer;
}

button:hover {
    background-color: #0056b3;
}

.btn-cancel {
    background-color: #6c757d;
}

button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
}

.btn-edit {
    background-color: #ffc107;
    color: black;
    margin-right: 5px;
    margin-bottom: 5px;
}

.btn-delete {
    background-color: #dc3545;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
}

th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
}

th {
    background-color: #f2f2f2;
}

.btn-export {
    background-color: #28a745;
    color: white;
}

.btn-export:hover {
    background-color: #218838;
}
</style>
