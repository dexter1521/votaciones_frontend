<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          Sistema de Votación
        </q-toolbar-title>

        <q-btn flat dense round icon="notifications" class="q-mr-sm">
          <q-badge color="red" floating>3</q-badge>
          <q-tooltip>Notificaciones</q-tooltip>
        </q-btn>

        <q-btn-dropdown flat dense label="Usuario" icon="account_circle">
          <q-list>
            <q-item clickable v-close-popup>
              <q-item-section avatar>
                <q-icon name="person" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Perfil</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup>
              <q-item-section avatar>
                <q-icon name="settings" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Configuración</q-item-label>
              </q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-close-popup @click="logout">
              <q-item-section avatar>
                <q-icon name="logout" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Cerrar Sesión</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header>
          Menú Principal
        </q-item-label>

        <q-item clickable :to="'/dashboard'" exact>
          <q-item-section avatar>
            <q-icon name="dashboard" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Dashboard</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable :to="'/plenos'" exact>
          <q-item-section avatar>
            <q-icon name="gavel" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Plenos</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable :to="'/votacion'" exact>
          <q-item-section avatar>
            <q-icon name="how_to_vote" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Votaciones</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable :to="'/resultados'" exact>
          <q-item-section avatar>
            <q-icon name="bar_chart" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Resultados</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useUserStore } from 'stores/userStore';

const router = useRouter();
const $q = useQuasar();
const userStore = useUserStore();

const leftDrawerOpen = ref(false);

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

const logout = () => {
  $q.dialog({
    title: 'Cerrar Sesión',
    message: '¿Está seguro de que desea cerrar sesión?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    userStore.logout();
    router.push('/login');
    $q.notify({
      type: 'info',
      message: 'Sesión cerrada correctamente',
      position: 'top'
    });
  });
};
</script>
