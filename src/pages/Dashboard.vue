<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h5">Dashboard</div>
            <div class="text-subtitle2">Bienvenido al Sistema de Votación</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Estadísticas -->
      <div class="col-12 col-md-4">
        <q-card class="text-white bg-primary">
          <q-card-section>
            <div class="text-h6">Plenos Activos</div>
            <div class="text-h3">{{ stats.plenosActivos }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card class="text-white bg-secondary">
          <q-card-section>
            <div class="text-h6">Votaciones Hoy</div>
            <div class="text-h3">{{ stats.votacionesHoy }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card class="text-white bg-positive">
          <q-card-section>
            <div class="text-h6">Total Votos</div>
            <div class="text-h3">{{ stats.totalVotos }}</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Accesos rápidos -->
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">Accesos Rápidos</div>
            <div class="row q-col-gutter-sm">
              <div class="col-6 col-md-3">
                <q-btn
                  color="primary"
                  icon="gavel"
                  label="Ver Pleno"
                  class="full-width"
                  @click="$router.push('/pleno')"
                />
              </div>
              <div class="col-6 col-md-3">
                <q-btn
                  color="secondary"
                  icon="how_to_vote"
                  label="Nueva Votación"
                  class="full-width"
                  @click="$router.push('/votacion')"
                />
              </div>
              <div class="col-6 col-md-3">
                <q-btn
                  color="positive"
                  icon="bar_chart"
                  label="Resultados"
                  class="full-width"
                  @click="$router.push('/resultados')"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';

const stats = ref({
  plenosActivos: 3,
  votacionesHoy: 5,
  totalVotos: 125
});
</script>
