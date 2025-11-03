<template>
  <q-page class="flex flex-center bg-gradient">
    <q-card class="login-card q-pa-md" style="min-width: 400px;">
      <q-card-section class="text-center">
        <div class="text-h4 text-primary q-mb-md">
          <q-icon name="how_to_vote" size="64px" color="primary" />
        </div>
        <div class="text-h4 text-primary q-mb-md">Sistema de Votación</div>
        <div class="text-subtitle2 text-grey-7">Ingrese sus credenciales</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="onSubmit" class="q-gutter-md">
          <q-input
            v-model="credentials.username"
            label="Usuario"
            filled
            :rules="[val => !!val || 'El usuario es requerido']"
          >
            <template v-slot:prepend>
              <q-icon name="person" />
            </template>
          </q-input>

          <q-input
            v-model="credentials.password"
            label="Contraseña"
            type="password"
            filled
            :rules="[val => !!val || 'La contraseña es requerida']"
          >
            <template v-slot:prepend>
              <q-icon name="lock" />
            </template>
          </q-input>

          <q-btn
            type="submit"
            color="primary"
            label="Ingresar"
            class="full-width"
            :loading="loading"
            size="lg"
          />
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

const router = useRouter();
const $q = useQuasar();

const credentials = ref({
  username: '',
  password: ''
});

const loading = ref(false);

const onSubmit = async () => {
  loading.value = true;
  
  try {
    // Simulación de login - TEMPORAL
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Guardar token simulado
    localStorage.setItem('token', 'token-simulado-' + Date.now());
    
    $q.notify({
      type: 'positive',
      message: 'Inicio de sesión exitoso',
      position: 'top'
    });
    
    router.push('/dashboard');
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al iniciar sesión',
      position: 'top'
    });
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped lang="scss">
.bg-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}
</style>
