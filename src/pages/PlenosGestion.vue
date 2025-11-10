<template>
    <q-page class="q-pa-md">
        <div class="row q-col-gutter-md">
            <!-- Header con botón crear -->
            <div class="col-12">
                <q-card>
                    <q-card-section>
                        <div class="row items-center">
                            <div class="col">
                                <div class="text-h5">Gestión de Plenos</div>
                                <div class="text-subtitle2 text-grey-7">Administrar plenos del sistema</div>
                            </div>
                            <div class="col-auto">
                                <q-btn v-if="userStore.canIniciarPleno" color="primary" icon="add" label="Nuevo Pleno"
                                    @click="mostrarDialogCrear" />
                            </div>
                        </div>
                    </q-card-section>
                </q-card>
            </div>

            <!-- Tabla de plenos -->
            <div class="col-12">
                <q-card>
                    <q-card-section>
                        <q-table :rows="plenoStore.plenos" :columns="columns" row-key="id" :loading="plenoStore.loading"
                            :pagination="{ rowsPerPage: 10 }">
                            <template v-slot:body-cell-estado="props">
                                <q-td :props="props">
                                    <q-chip :color="getEstadoColor(props.row.estado)" text-color="white" dense>
                                        {{ props.row.estado }}
                                    </q-chip>
                                </q-td>
                            </template>

                            <template v-slot:body-cell-acciones="props">
                                <q-td :props="props">
                                    <q-btn flat dense round icon="visibility" color="primary"
                                        @click="verPleno(props.row.id_pleno)">
                                        <q-tooltip>Ver detalles</q-tooltip>
                                    </q-btn>
                                    <q-btn v-if="userStore.canIniciarPleno" flat dense round icon="edit"
                                        color="secondary" @click="editarPleno(props.row)">
                                        <q-tooltip>Editar</q-tooltip>
                                    </q-btn>
                                    <q-btn v-if="userStore.canIniciarPleno" flat dense round icon="delete"
                                        color="negative" @click="confirmarEliminar(props.row)">
                                        <q-tooltip>Eliminar</q-tooltip>
                                    </q-btn>
                                </q-td>
                            </template>
                        </q-table>
                    </q-card-section>
                </q-card>
            </div>
        </div>

        <!-- Dialog Crear/Editar Pleno -->
        <q-dialog v-model="dialogPleno" persistent>
            <q-card style="min-width: 500px">
                <q-card-section>
                    <div class="text-h6">{{ modoEdicion ? 'Editar Pleno' : 'Nuevo Pleno' }}</div>
                </q-card-section>

                <q-card-section class="q-pt-none">
                    <q-form @submit="guardarPleno" class="q-gutter-md">
                        <q-input v-model="formPleno.descripcion" label="Descripción del Pleno" filled
                            :rules="[val => !!val || 'La descripción es requerida']" />

                        <q-input v-model="formPleno.fecha" label="Fecha" type="date" filled
                            :rules="[val => !!val || 'La fecha es requerida']" />

                        <q-select v-model="formPleno.estado" :options="estadosPleno" label="Estado" filled emit-value
                            map-options :rules="[val => !!val || 'El estado es requerido']" />

                        <div class="row q-gutter-sm justify-end">
                            <q-btn flat label="Cancelar" color="grey" @click="cerrarDialog" />
                            <q-btn type="submit" label="Guardar" color="primary" :loading="guardando" />
                        </div>
                    </q-form>
                </q-card-section>
            </q-card>
        </q-dialog>
    </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { usePlenoStore } from 'stores/plenoStore';
import { useUserStore } from 'stores/userStore';

const router = useRouter();
const $q = useQuasar();
const plenoStore = usePlenoStore();
const userStore = useUserStore();

const dialogPleno = ref(false);
const modoEdicion = ref(false);
const guardando = ref(false);
const plenoEditando = ref(null);

const formPleno = ref({
    descripcion: '',
    fecha: '',
    estado: 'pendiente'
});

const estadosPleno = [
    { label: 'Pendiente', value: 'pendiente' },
    { label: 'En Sesión', value: 'en_sesion' },
    { label: 'Cerrado', value: 'cerrado' }
];

const columns = [
    {
        name: 'id',
        label: 'ID',
        field: 'id_pleno',
        align: 'left',
        sortable: true
    },
    {
        name: 'descripcion',
        label: 'Descripción',
        field: 'descripcion',
        align: 'left',
        sortable: true
    },
    {
        name: 'fecha',
        label: 'Fecha',
        field: 'fecha',
        align: 'left',
        sortable: true
    },
    {
        name: 'estado',
        label: 'Estado',
        field: 'estado',
        align: 'center',
        sortable: true
    },
    {
        name: 'acciones',
        label: 'Acciones',
        field: 'acciones',
        align: 'center'
    }
];

onMounted(async () => {
    await plenoStore.cargarPlenos();
});

const getEstadoColor = (estado) => {
    const colores = {
        pendiente: 'grey',
        en_sesion: 'green',
        cerrado: 'blue'
    };
    return colores[estado] || 'grey';
};

const mostrarDialogCrear = () => {
    modoEdicion.value = false;
    plenoEditando.value = null;
    formPleno.value = {
        descripcion: '',
        fecha: new Date().toISOString().split('T')[0],
        estado: 'pendiente'
    };
    dialogPleno.value = true;
};

const editarPleno = (pleno) => {
    modoEdicion.value = true;
    plenoEditando.value = { ...pleno };
    formPleno.value = {
        descripcion: pleno.descripcion,
        fecha: pleno.fecha,
        estado: pleno.estado
    };
    dialogPleno.value = true;
};

const guardarPleno = async () => {
    guardando.value = true;
    try {
        if (modoEdicion.value) {
            const plenoId = Number(plenoEditando.value.id_pleno);

            if (isNaN(plenoId)) {
                throw new Error('ID de pleno inválido');
            }

            await plenoStore.actualizarPleno(plenoId, formPleno.value);
            $q.notify({
                type: 'positive',
                message: 'Pleno actualizado correctamente',
                position: 'top'
            });
        } else {
            const plenoData = {
                ...formPleno.value,
                creado_por: Number(userStore.user.id) || 1
            };
            await plenoStore.crearPleno(plenoData);
            $q.notify({
                type: 'positive',
                message: 'Pleno creado correctamente',
                position: 'top'
            });
        }
        cerrarDialog();
        await plenoStore.cargarPlenos();
    } catch (error) {
        $q.notify({
            type: 'negative',
            message: error.response?.data?.message || 'Error al guardar el pleno',
            position: 'top'
        });
    } finally {
        guardando.value = false;
    }
};

const confirmarEliminar = (pleno) => {
    $q.dialog({
        title: 'Confirmar Eliminación',
        message: `¿Está seguro de eliminar el pleno "${pleno.descripcion}"?`,
        cancel: true,
        persistent: true,
        color: 'negative'
    }).onOk(async () => {
        try {
            await plenoStore.eliminarPleno(Number(pleno.id_pleno));
            $q.notify({
                type: 'positive',
                message: 'Pleno eliminado correctamente',
                position: 'top'
            });
        } catch (error) {
            $q.notify({
                type: 'negative',
                message: error.response?.data?.message || 'Error al eliminar el pleno',
                position: 'top'
            });
        }
    });
};

const verPleno = (plenoId) => {
    router.push(`/pleno/${plenoId}`);
};

const cerrarDialog = () => {
    dialogPleno.value = false;
    formPleno.value = {
        descripcion: '',
        fecha: '',
        estado: 'pendiente'
    };
};
</script>
