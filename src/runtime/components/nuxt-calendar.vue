<template>
    <wc-datepicker
    id='datepicker'
    :range='range'
    :disabled='disabled'
    :disableDate='disableDate'
    :element-class-name='element_class_name'
    :first-day-of-week='first_day_of_week'
    :labels='labels'
    :locale='locale'
    :show-clear-button='show_clear_button'
    :show-month-stepper	='show_month_stepper'
    :show-today-button='show_today_button'
    :show-year-stepper='show_year_stepper'
    :start-date='start_date'
    >
  </wc-datepicker>
</template>

<script setup lang="ts">

import { onMounted } from "vue";
import "../calendar/build/wc-datepicker.esm";
import '../calendar/themes/light.css'
import props from './props'

defineProps({
...props
});
onMounted(() => {
  const datepicker = document.getElementById('datepicker') as any;
});

</script>

<style scoped>

</style>