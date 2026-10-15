import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('userStore', () => {
    const users = ref([]);

    async function fetchUsers() {
        const localData = localStorage.getItem('users_json');
        if (localData) {
            users.value = JSON.parse(localData);
        } else {
            try {
                const response = await fetch('https://jsonplaceholder.typicode.com/users');
                users.value = await response.json();
                saveToLocalJson();
            } catch (error) {
                console.error("Error al obtener los usuarios:", error);
            }
        }
    }

    function saveToLocalJson() {
        localStorage.setItem('users_json', JSON.stringify(users.value));
    }

    function addUser(user) {
        const maxId = users.value.length > 0 ? Math.max(...users.value.map(u => u.id)) : 0;
        users.value.push({ ...user, id: maxId + 1 });
        saveToLocalJson();
    }

    function updateUser(updatedUser) {
        const index = users.value.findIndex(u => u.id === updatedUser.id);
        if (index !== -1) {
            users.value[index] = { ...updatedUser };
            saveToLocalJson();
        }
    }

    function deleteUser(id) {
        users.value = users.value.filter(u => u.id !== id);
        saveToLocalJson();
    }

    return { users, fetchUsers, addUser, updateUser, deleteUser };
});
