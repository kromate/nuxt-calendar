<template>
    <wc-datepicker
    id='datepicker'
    :range='range'
    :disabled='disabled'
    :disableDate='disableDate'
    :element-class-name='element_class_name'
    >
  </wc-datepicker>
</template>

<script setup lang="ts">

import { onMounted } from "vue";
import "../calendar/build/wc-datepicker.esm";
import '../calendar/themes/light.css'


defineProps({
  range: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  disableDate: {
    type: Function,
    default: () => false,
  },
  element_class_name: {
    type: String,
    default: 'wc-datepicker',
  },
});
onMounted(() => {
  const datepicker = document.getElementById('datepicker') as any;
});

</script>

<style scoped>

</style>