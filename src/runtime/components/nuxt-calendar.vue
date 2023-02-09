<template>
  <input type="text" class='input' id='calendarInput'>
    <wc-datepicker
    id='datepicker'
    ref='datepicker'
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
import "../calendar/dist/wc-datepicker/wc-datepicker.esm";
import '../calendar/themes/light.css'
import props from './props'
import { ref } from 'vue'

defineProps({
...props
});

onMounted(() => {
  const datepicker = document.getElementById('datepicker') as any;
  console.log(datepicker);
  
  //  datepicker.addEventListener('selectDate', function(event:any) {
  //   console.log( 'selectDate====',  event.detail);
  // });
  //  datepicker.addEventListener('changeMonth', function(event:any) {
  //   console.log( 'changeMonth====',  event.detail);
  // });
});

</script>

<style scoped>
input{
      height: 2.75rem;
    width: 100%;
    border-radius: 0.375rem;
    border-width: 1px;
    border-color: rgb(156 163 175 / 1);
    border-color: rgb(156 163 175 );
    padding-left: 1rem;
    padding-right: 1rem;
    outline: 2px solid transparent;
    outline-offset: 2px;
    transition-property: all;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 200ms;
    transition-timing-function: cubic-bezier(0.4, 0, 1, 1);
}
</style>