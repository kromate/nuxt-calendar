<template>
  <div ref="popoverElement" class="vfc-popover-container" tabindex="0">
    <PickerInputs
      :f-configs="fConfigs"
      :single-selected-date="singleSelectedDate"
      :calendar="calendar"
    >
      <template #dateRangeInputs="props">
        <slot
          :start-date="props.startDate"
          :end-date="props.endDate"
          :is-typeable="fConfigs.isTypeable"
          name="dateRangeInputs"
        />
      </template>
      <template #datePickerInput="props">
        <slot
          :selected-date="props.selectedDate"
          :is-typeable="fConfigs.isTypeable"
          name="datePickerInput"
        />
      </template>
    </PickerInputs>

    <div
      v-show="showCalendar"
      ref="mainContainer"
      class="vfc-main-container"
      :class="{
        'vfc-modal':
          fConfigs.isModal &&
          (fConfigs.isDatePicker ||
            fConfigs.isDateRange ||
            fConfigs.isMultipleDatePicker),
        'vfc-dark': fConfigs.isDark,
      }"
    >
      <time-picker
        v-if="showTimePicker"
        ref="timePicker"
        :height="$refs.popoverElement.clientHeight"
        :hours="activeHours"
        :minutes="activeMinutes"
      />

      <template v-else>
        <div class="vfc-calendars-container">
          <Arrows
            :is-multiple="false"
            :f-configs="fConfigs"
            :allow-pre-date="allowPreDate"
            :allow-next-date="allowNextDate"
          >
            <template #navigationArrowLeft>
              <slot name="navigationArrowLeft" />
            </template>
            <template #navigationArrowRight>
              <slot name="navigationArrowRight" />
            </template>
          </Arrows>

          <div ref="calendars" class="vfc-calendars">
            <div
              v-for="(calendarItem, key) in listCalendars"
              :key="calendarItem.key"
              class="vfc-calendar"
            >
              <month-year-picker
                v-show="
                  showMonthPicker === key + 1 || showYearPicker === key + 1
                "
                ref="monthContainer"
                :class="'vfc-' + fConfigs.titlePosition"
                :change-year-step="changeYearStep"
                :calendar-key="key"
              />
              <div class="vfc-content">
                <Arrows
                  :is-multiple="true"
                  :f-configs="fConfigs"
                  :allow-pre-date="allowPreDate"
                  :allow-next-date="allowNextDate"
                  :calendar-key="key"
                >
                  <template #navigationArrowLeft>
                    <slot name="navigationArrowLeft" />
                  </template>
                  <template #navigationArrowRight>
                    <slot name="navigationArrowRight" />
                  </template>
                </Arrows>

                <transition tag="div" :name="getTransition_()" appear>
                  <div
                    v-if="checkHiddenElement('month')"
                    class="vfc-top-date"
                    :class="'vfc-' + fConfigs.titlePosition"
                  >
                    <span
                      :class="{
                        'vfc-cursor-pointer vfc-underline':
                          fConfigs.changeMonthFunction &&
                          isNotSeparatelyAndFirst(key),
                        'vfc-underline-active': showMonthPicker === key + 1,
                      }"
                      @click.prevent="
                        isNotSeparatelyAndFirst(key) && openMonthPicker(key + 1)
                      "
                    >
                      {{ calendarItem.month }}</span
                    >
                    <span
                      :class="{
                        'vfc-cursor-pointer vfc-underline':
                          fConfigs.changeYearFunction &&
                          isNotSeparatelyAndFirst(key),
                        'vfc-underline-active': showYearPicker === key + 1,
                      }"
                      @click.prevent="
                        isNotSeparatelyAndFirst(key) && openYearPicker(key + 1)
                      "
                    >
                      {{ calendarItem.year }}
                    </span>
                  </div>
                </transition>
                <transition tag="div" :name="getTransition_()" appear>
                  <div class="vfc-dayNames">
                    <span v-if="fConfigs.showWeekNumbers" />
                    <span
                      v-for="(dayName, dayKey) in fConfigs.dayNames"
                      :key="key + dayKey + 1"
                      class="vfc-day"
                    >
                      <template v-if="checkHiddenElement('dayNames')">
                        {{ dayName }}
                      </template>
                    </span>
                  </div>
                </transition>
                <transition-group tag="div" :name="getTransition_()" appear>
                  <div
                    v-for="(week, week_key) in calendarItem.weeks"
                    :key="key + week_key + 1"
                    class="vfc-week"
                  >
                    <WeekNumbers
                      v-if="showWeekNumbers"
                      :number="week.number"
                      :border-color="borderColor"
                    />
                    <Day
                      v-for="(day, day_key) in week.days"
                      ref="day"
                      :key="key + week_key + day_key + 1"
                      :is-multiple-date-range="isMultipleDateRange"
                      :day="day"
                      :f-configs="fConfigs"
                      :calendar="calendar"
                      :help-calendar="helpCalendar"
                      :week="week"
                      :day_key="day_key"
                      :always-use-default-classes="alwaysUseDefaultClasses"
                      @dayMouseOver="dayMouseOver"
                    >
                      <template #default="props">
                        <slot :week="props.week" :day="props.day" />
                      </template>
                    </Day>
                  </div>
                  <template
                    v-if="
                      calendarItem.weeks.length < 6 &&
                      !fConfigs.isLayoutExpandable
                    "
                  >
                    <!-- stabilizator -->
                    <div
                      v-for="moreWeekKey in 6 - calendarItem.weeks.length"
                      :key="key + moreWeekKey + 'moreWeek'"
                      style="height: 32.6px"
                    >
                      &nbsp;
                    </div>
                  </template>
                </transition-group>
              </div>
            </div>
          </div>
          <CalendarFooter v-if="canClearRange || $slots['footer']">
            <template #footer>
              <div @click="cleanRange">
                <slot name="cleaner">
                  <div
                    v-if="canClearRange && fConfigs.isDateRange"
                    class="rangeCleaner"
                  >
                    <span
                      :class="[rangeIsSelected ? 'active' : 'disabled']"
                      @click="cleanRange"
                      >Clear Range{{ isMultipleDateRange && "s" }}</span
                    >
                  </div>
                </slot>
              </div>
              <slot name="footer" />
            </template>
            <!-- <span>&nbsp;</span> -->
          </CalendarFooter>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import helpCalendarClass from "../assets/js/helpCalendar";
import { propsAndData } from "../mixins/propsAndData";
import TimePicker from "../components/TimePicker.vue";
import Arrows from "../components/Arrows.vue";
import WeekNumbers from "../components/WeekNumbers.vue";
import Day from "../components/Day.vue";
import MonthYearPicker from "../components/MonthYearPicker.vue";
import PickerInputs from "../components/PickerInputs.vue";
import CalendarFooter from "../components/Footer.vue";
import { hElContains, hUniqueID } from "../utils/helpers";
import {computed, ref, watch, onMounted, onUnmounted} from "vue";

const emit = defineEmits(['dayClicked', 'selectedDaysCount', 'input', 'choseDay', 'closed', 'opened', 'changedYear', 'changedMonth'])

const props = defineProps({
  activeHours: {
    type: Array,
    required: false,
  },
  activeMinutes: {
    type: Array,
    required: false,
  },
  borderColor: {
    type: String,
    default: "",
  },
  displayTimeInput: {
    type: Boolean,
    default: false,
  },
  configs: {
    type: Object,
    default: () => {},
  },
  sundayStart: {
    type: Boolean,
    default: () => undefined,
  },
  placeholder: {
    type: [String, Boolean],
    default: () => undefined,
  },
  dateFormat: {
    type: String,
    validator(format:any) {
      let timeFormat = format.split(" ")[1];
      if (!timeFormat) {
        return true;
      }
      const validFormats = ["HH:MM", "HH:mm", "hh:MM", "hh:mm"];
      return !!~validFormats.indexOf(timeFormat);
    },
  },
  canClearRange: {
    type: Boolean,
    default: false,
  },
  isMultiple: {
    type: Boolean,
    default: () => undefined,
  },
  isSeparately: {
    type: Boolean,
    default: () => undefined,
  },
  isDatePicker: {
    type: Boolean,
    default: () => undefined,
  },
  isMultipleDatePicker: {
    type: Boolean,
    default: () => undefined,
  },
  isMultipleDateRange: {
    type: Boolean,
    default: () => undefined,
  },
  isDateRange: {
    type: Boolean,
    default: () => undefined,
  },
  withTimePicker: {
    type: Boolean,
    default: () => undefined,
  },
  calendarsCount: {
    type: Number,
  },
  isModal: {
    type: Boolean,
    default: () => undefined,
  },
  isTypeable: {
    type: Boolean,
    default: () => undefined,
  },
  changeMonthFunction: {
    type: Boolean,
    default: () => undefined,
  },
  changeYearFunction: {
    type: Boolean,
    default: () => undefined,
  },
  changeYearStep: {
    type: Number,
    default: () => 3,
  },
  changeMonthStep: {
    type: Number,
    default: () => 1,
  },
  newCurrentDate: {
    type: Date,
  },
  markedDates: {
    type: Array,
    default: () => [],
  },
  markedDateRange: {
    type: [Object, Array],
  },
  disabledDayNames: {
    type: Array,
  },
  disabledDates: {
    type: Array,
    default: () => [],
  },
  enabledDates: {
    type: Array,
    default: () => [],
  },
  limits: {
    type: [Object, Boolean],
    default: () => undefined,
  },
  minSelDays: {
    type: [Number, Boolean],
    default: () => undefined,
  },
  maxSelDays: {
    type: [Number, Boolean],
    default: () => undefined,
  },
  dayNames: {
    type: Array,
  },
  monthNames: {
    type: Array,
  },
  shortMonthNames: {
    type: Array,
  },
  showWeekNumbers: {
    type: Boolean,
    default: () => undefined,
  },
  value: {
    type: Object,
  },
  transition: {
    type: Boolean,
    default: () => undefined,
  },
  hiddenElements: {
    type: Array,
  },
  isAutoCloseable: {
    type: Boolean,
    default: undefined,
  },
  isDark: {
    type: Boolean,
    default: undefined,
  },
  isLayoutExpandable: {
    type: Boolean,
    default: undefined,
  },
  titlePosition: {
    type: String,
    default: "center",
  },
  arrowsPosition: {
    type: String,
    default: "space-between",
  },
  alwaysUseDefaultClasses: {
    type: Boolean,
    default: false,
  },
});

const fConfigs = ref({
  sundayStart: false,
  placeholder: '',
  dateFormat: "dd/mm/yyyy hh:MM",
  isMultipleDateRange: false,
  isDatePicker: false,
  isMultipleDatePicker: false,
  isDateRange: false,
  withTimePicker: false,
  isMultiple: false,
  calendarsCount: 1,
  isSeparately: false,

  isModal: false,
  isTypeable: false,

  changeMonthFunction: false,
  changeYearFunction: false,
  changeYearStep: 3,

  changeMonthStep: 1,

  markedDates: [],
  markedDateRange: {
    start: false,
    end: false,
  },

  limits: false,
  minSelDays: false,
  maxSelDays: false,

  disabledDates: [],
  enabledDates: [] as any,
  disabledDayNames: [],

  dayNames: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
  monthNames: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  shortMonthNames: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],

  showWeekNumbers: false,
  transition: true,
  hiddenElements: [],
  isAutoCloseable: false,
  isDark: false,
  isLayoutExpandable: false,

  titlePosition: "center",
  arrowsPosition: "space-between",
});

const calendar = ref({
  currentDate: new Date(),
  selectedDate: false,
  selectedDateTime: false,
  selectedHour: "00",
  selectedMinute: "00",
  selectedDatesItem: "",
  selectedDates: [] as any,
  dateRange: {
    start: "",
    end: "",
  },
  multipleDateRange: [],
});

const defaultDateFormat = ref({
  date: false,
  dateTime: false,
  hour: "00",
  minute: "00",
});
const popoverElement = ref<HTMLBaseElement>();
const hoveredObject = ref(null);
const transitionPrefix = ref("left");
const showCalendar = ref(true);
const showMonthPicker = ref();
const showYearPicker = ref();
const showTimePicker = ref(false);
const allowPreDate = ref(true);
const allowNextDate = ref(true);
const listCalendars = ref([] as any);

const startDMY = computed(() => {
  if (calendar.value.dateRange.start) {
    return calendar.value.dateRange.start.split(" ")[0];
  }
  return "";
});

const endDMY = computed(() => {
  if (calendar.value.dateRange.end) {
    return calendar.value.dateRange.end.split(" ")[0];
  }
  return "";
});

const rangeIsSelected = computed(() => {
  if (!props.isMultipleDateRange) {
    return !!(calendar.value.dateRange.end && calendar.value.dateRange.start);
  }
  return calendar.value.multipleDateRange.length > 0;
});
const helpCalendar = computed(() => {
  return new helpCalendarClass(
    fConfigs.value.sundayStart,
    checkHiddenElement("leftAndRightDays"),
    fConfigs.value.dateFormat,
    fConfigs.value.dayNames
  );
});
const singleSelectedDate = computed({
  get() {
    let res = "";
    if (props.displayTimeInput) {
      const validFormats = [
        "HH:MM",
        "HH:mm",
        "hh:MM",
        "hh:mm",
        "MM:HH",
        "mm:HH",
        "MM:hh",
        "mm:hh",
      ];
      let format = fConfigs.value.dateFormat;
      if (this.dateFormat) {
        format = this.dateFormat;
      }
      if (validFormats.indexOf(format.split(" ")[1]) > 3) {
        res +=
          " " +
          [calendar.value.selectedHour, calendar.value.selectedMinute]
            .reverse()
            .join(":");
      } else {
        res +=
          " " +
          [calendar.value.selectedHour, calendar.value.selectedMinute].join(":");
      }
    }

    return calendar.value.selectedDate ? calendar.value.selectedDate + res : "";
  },
  set(newValue) {
    newValue = helpCalendar.value.mask(newValue);
    if (helpCalendar.value.getDateFromFormat(newValue).getMonth()) {
      calendar.value.selectedDate = newValue;
    }
  },
});

  const initCalendar = ()=> {
      setCalendarData()
      listRendering()
      markChooseDays()
      checkLimits(calendar.value.currentDate)
    }

  const updateCalendar = ()=> {
      setExistingCalendarData()
      listRendering()
      markChooseDays()
    }

      const  isNotSeparatelyAndFirst =(key) =>{
      return props.isSeparately || key == 0
    }

       const setCalendarData=() =>{
      let date = calendar.value.currentDate
      date = new Date(date.getFullYear(), date.getMonth() - 1)

      listCalendars.value = []

      for (let i = 0; i < fConfigs.value.calendarsCount; i++) {
        date = new Date(date.getFullYear(), date.getMonth() + 1)

        const calendar = {
          key: i + hUniqueID(),
          date: date,
          dateTop: `${
            fConfigs.value.monthNames[date.getMonth()]
          } ${date.getFullYear()}`,
          month: fConfigs.value.monthNames[date.getMonth()],
          year: date.getFullYear(),
          weeks: helpCalendar.value.getFinalizedWeeks(
            date.getMonth(),
            date.getFullYear()
          )
        }

       listCalendars.value.push(calendar)

        if (!fConfigs.value.isMultiple) {
          break
        }
      }
    }

  const setExistingCalendarData = ()=> {
      for (let i = 0; i <listCalendars.value.length; i++) {
        const calendar =listCalendars.value[i]
        const date = calendar.date

        listCalendars[i] = {
          key: calendar.key,
          date: date,
          dateTop: `${
            fConfigs.value.monthNames[date.getMonth()]
          } ${date.getFullYear()}`,
          month: fConfigs.value.monthNames[date.getMonth()],
          year: date.getFullYear(),
          weeks: helpCalendar.value.getFinalizedWeeks(
            date.getMonth(),
            date.getFullYear()
          )
        }

        if (!fConfigs.value.isMultiple) {
          break
        }
      }
    }

const setConfigs=()=> {
      let globalOptions
      if (typeof this.$getOptions !== 'undefined') {
        // Global Options
        globalOptions = this.$getOptions()
        Object.keys(globalOptions).forEach(objectKey => {
          if (typeof fConfigs.value[objectKey] !== 'undefined') {
            console.log(this);
            this.$set(fConfigs.value, objectKey, globalOptions[objectKey])
          }
        })
      }

      if (typeof this.configs !== 'undefined') {
        Object.keys(fConfigs.value).forEach(objectKey => {
          if (typeof this.configs[objectKey] !== 'undefined') {
            // Get From Configs
            console.log(this);
            this.$set(fConfigs.value, objectKey, this.configs[objectKey])
          }
        })
      } else {
        Object.keys(this.$props).forEach(objectKey => {
          if (
            typeof fConfigs.value[objectKey] !== 'undefined' &&
            typeof this.$props[objectKey] !== 'undefined'
          ) {
            console.log(this);
            this.$set(fConfigs.value, objectKey, this.$props[objectKey])
          }
        })
      }

      // Is Modal
      if (fConfigs.value.isModal) showCalendar.value = false

      // Placeholder
      if (!fConfigs.value.placeholder)
        fConfigs.value.placeholder = fConfigs.value.dateFormat

      if (typeof this.newCurrentDate !== 'undefined') {
        calendar.value.currentDate = this.newCurrentDate
      }

      // Sunday Start
      if (fConfigs.value.sundayStart) {
        const dayNames = [...fConfigs.value.dayNames]
        const sundayName = dayNames[dayNames.length - 1]
        dayNames.splice(dayNames.length - 1, 1)
        dayNames.unshift(sundayName)
        fConfigs.value.dayNames = dayNames
      }
}

const listRendering = () => {
      // Each Calendars
     listCalendars.value.forEach(calendar => {
        // Set Calendar Weeks
        calendar.weeks.forEach(week => {
          const finalizedDays = []

          week.days.forEach(day => {
            const date = new Date(day.year, day.month, day.day)
            const now = new Date()

            let isToday = false

            date.setHours(0, 0, 0, 0)
            now.setHours(0, 0, 0, 0)

            if (date.getTime() === now.getTime()) {
              isToday = true
            }

            let checkMarked
            // With Custom Classes
            if (typeof fConfigs.value.markedDates[0] === 'object') {
              checkMarked = fConfigs.value.markedDates.find(markDate => {
                return markDate.date === helpCalendar.value.formatDate(date)
              })
            } else {
              // Without Classes
              checkMarked = fConfigs.value.markedDates.find(markDate => {
                return markDate === helpCalendar.value.formatDate(date)
              })
            }

            if (this.startDMY === helpCalendar.value.formatDate(date)) {
              checkMarked = true
            }

            let isMarked = false
            if (typeof checkMarked !== 'undefined') {
              isMarked = true
            }

            finalizedDays.push({
              day: day.day,
              date: helpCalendar.value.formatDate(date),
              hide: day.hide,
              isMouseToLeft: false,
              isMouseToRight: false,
              isHovered: false,
              isDateRangeStart: this.checkDateRangeStart(
                helpCalendar.value.formatDate(date)
              ),
              isDateRangeEnd: this.checkDateRangeEnd(
                helpCalendar.value.formatDate(date)
              ),
              hideLeftAndRightDays: day.hideLeftAndRightDays,
              isToday,
              isMarked
            })
          })

          week.days = finalizedDays
        })
      })
}

const clickDay = (item, isDisabledDate)=> {
      if (fConfigs.value.withTimePicker && fConfigs.value.isDateRange) {
        item.date = item.date + ' 00:00'
      }
      emit('dayClicked', item)

      if (
        !fConfigs.value.isDateRange &&
        !fConfigs.value.isDatePicker &&
        !fConfigs.value.isMultipleDatePicker
      ) {
        return false
      }

      //Disabled Dates - Start

      // Disable days of week if set in configuration
      let dateDay = helpCalendar.value.getDateFromFormat(item.date).getDay() - 1
      if (dateDay === -1) {
        dateDay = 6
      }

      const dayOfWeekString = fConfigs.value.dayNames[dateDay]
      if (
        fConfigs.value.disabledDayNames.includes(dayOfWeekString) ||
        isDisabledDate(item.date)
      ) {
        return false
      }

      //Disabled Dates - End

      // Limits
      if (fConfigs.value.limits) {
        const min = helpCalendar.value
          .getDateFromFormat(fConfigs.value.limits.min)
          .getTime()
        const max = helpCalendar.value
          .getDateFromFormat(fConfigs.value.limits.max)
          .getTime()
        const date = helpCalendar.value.getDateFromFormat(item.date).getTime()

        if (date < min || date > max) {
          return false
        }
      }

      // Date Multiple Range
      if (fConfigs.value.isMultipleDateRange) {
        const clickDate = helpCalendar.value
          .getDateFromFormat(item.date.split(' ')[0])
          .getTime()
        let rangesLength = calendar.value.multipleDateRange.length
        let lastRange = calendar.value.multipleDateRange[rangesLength - 1]
        let startDate = ''
        // if (lastRange) {
        //   // if (lastRange.start && lastRange.end)
        // } else

        if (!lastRange) {
          calendar.value.multipleDateRange.push({ end: '', start: '' })
          rangesLength = calendar.value.multipleDateRange.length
          lastRange = calendar.value.multipleDateRange[rangesLength - 1]
        }

        if (lastRange.start) {
          startDate = helpCalendar.value.getDateFromFormat(lastRange.start)
        }

        // Two dates is not empty
        if (lastRange.start !== '' && lastRange.end !== '') {
          calendar.value.multipleDateRange.push({ end: '', start: item.date })
          // lastRange.start = item.date
          // lastRange.end = ''
          // Not date selected
        } else if (lastRange.start === '' && lastRange.end === '') {
          lastRange.start = item.date
          // Start Date not empty, chose date > start date
        } else if (lastRange.end === '' && clickDate > startDate.getTime()) {
          lastRange.end = item.date
          // Start date not empty, chose date <= start date (also same date range select)
        } else if (lastRange.start !== '' && clickDate <= startDate.getTime()) {
          this.$nextTick(() => {
            if (calendar.value.withTimePicker) {
              this.$refs['timePicker'].startDateActive = true
            }
          })
          lastRange.end = lastRange.start
          lastRange.start = item.date
        }

        //Get number of days between date range dates
        if (lastRange.start !== '' && lastRange.end !== '') {
          const oneDay = 24 * 60 * 60 * 1000
          const firstDate = helpCalendar.value.getDateFromFormat(lastRange.start)
          const secondDate = helpCalendar.value.getDateFromFormat(lastRange.end)
          const diffDays = Math.round(
            Math.abs((firstDate.getTime() - secondDate.getTime()) / oneDay)
          )
          const itemTime = helpCalendar.value
            .getDateFromFormat(item.date)
            .getTime()

          emit('selectedDaysCount', diffDays)

          // Is Auto Closeable
          if (fConfigs.value.isModal && fConfigs.value.isAutoCloseable) {
            showCalendar.value = false
          }

          // Minimum Selected Days
          const minSelDays = fConfigs.value.minSelDays

          if (
            minSelDays &&
            itemTime >= startDate.getTime() &&
            diffDays < minSelDays
          ) {
            startDate.setDate(startDate.getDate() + (minSelDays - 1))
            lastRange.end = helpCalendar.value.formatDate(startDate)
          }

          if (
            minSelDays &&
            itemTime < startDate.getTime() &&
            diffDays < minSelDays
          ) {
            startDate.setDate(startDate.getDate() - (minSelDays - 1))
            lastRange.start = helpCalendar.value.formatDate(startDate)
          }

          // Maximum Selected Days
          const maxSelDays = fConfigs.value.maxSelDays

          if (
            maxSelDays &&
            itemTime >= startDate.getTime() &&
            diffDays >= maxSelDays
          ) {
            startDate.setDate(startDate.getDate() + (maxSelDays - 1))
            lastRange.end = helpCalendar.value.formatDate(startDate)
          }

          if (
            maxSelDays &&
            itemTime < startDate.getTime() &&
            diffDays >= maxSelDays
          ) {
            startDate.setDate(startDate.getDate() - (maxSelDays - 1))
            lastRange.start = helpCalendar.value.formatDate(startDate)
          }
        }

        emit('input', calendar.value)
      } // Date Range
      else if (fConfigs.value.isDateRange) {
        const clickDate = helpCalendar.value
          .getDateFromFormat(item.date.split(' ')[0])
          .getTime()

        let startDate = ''
        if (calendar.value.dateRange.start) {
          startDate = helpCalendar.value.getDateFromFormat(
            calendar.value.dateRange.start
          )
        }

        // Two dates is not empty
        if (
          calendar.value.dateRange.start !== '' &&
          calendar.value.dateRange.end !== ''
        ) {
          calendar.value.dateRange.start = item.date
          calendar.value.dateRange.end = ''
          // Not date selected
        } else if (
          calendar.value.dateRange.start === '' &&
          calendar.value.dateRange.end === ''
        ) {
          calendar.value.dateRange.start = item.date
          // Start Date not empty, chose date > start date
        } else if (
          calendar.value.dateRange.end === '' &&
          clickDate > startDate.getTime()
        ) {
          calendar.value.dateRange.end = item.date
          // Start date not empty, chose date <= start date (also same date range select)
        } else if (
          calendar.value.dateRange.start !== '' &&
          clickDate <= startDate.getTime()
        ) {
          this.$nextTick(() => {
            if (calendar.value.dateRange && calendar.value.withTimePicker) {
              this.$refs['timePicker'].startDateActive = true
            }
          })
          calendar.value.dateRange.end = calendar.value.dateRange.start
          calendar.value.dateRange.start = item.date
        }

        //Get number of days between date range dates
        if (
          calendar.value.dateRange.start !== '' &&
          calendar.value.dateRange.end !== ''
        ) {
          const oneDay = 24 * 60 * 60 * 1000
          const firstDate = helpCalendar.value.getDateFromFormat(
            calendar.value.dateRange.start
          )
          const secondDate = helpCalendar.value.getDateFromFormat(
            calendar.value.dateRange.end
          )
          const diffDays = Math.round(
            Math.abs((firstDate.getTime() - secondDate.getTime()) / oneDay)
          )
          const itemTime = helpCalendar.value
            .getDateFromFormat(item.date)
            .getTime()

          emit('selectedDaysCount', diffDays)

          // Is Auto Closeable
          if (fConfigs.value.isModal && fConfigs.value.isAutoCloseable) {
            showCalendar.value = false
          }

          // Minimum Selected Days
          const minSelDays = fConfigs.value.minSelDays

          if (
            minSelDays &&
            itemTime >= startDate.getTime() &&
            diffDays < minSelDays
          ) {
            startDate.setDate(startDate.getDate() + (minSelDays - 1))
            calendar.value.dateRange.end = helpCalendar.value.formatDate(
              startDate
            )
          }

          if (
            minSelDays &&
            itemTime < startDate.getTime() &&
            diffDays < minSelDays
          ) {
            startDate.setDate(startDate.getDate() - (minSelDays - 1))
            calendar.value.dateRange.start = helpCalendar.value.formatDate(
              startDate
            )
          }

          // Maximum Selected Days
          const maxSelDays = fConfigs.value.maxSelDays

          if (
            maxSelDays &&
            itemTime >= startDate.getTime() &&
            diffDays >= maxSelDays
          ) {
            startDate.setDate(startDate.getDate() + (maxSelDays - 1))
            calendar.value.dateRange.end = helpCalendar.value.formatDate(
              startDate
            )
          }

          if (
            maxSelDays &&
            itemTime < startDate.getTime() &&
            diffDays >= maxSelDays
          ) {
            startDate.setDate(startDate.getDate() - (maxSelDays - 1))
            calendar.value.dateRange.start = helpCalendar.value.formatDate(
              startDate
            )
          }
        }

        emit('input', calendar.value)
      } else if (fConfigs.value.isDatePicker) {
        calendar.value.selectedDate = item.date
        emit('input', calendar.value)

        // Is Auto Closeable
        if (fConfigs.value.isModal && fConfigs.value.isAutoCloseable) {
          showCalendar.value = false
        }
      } else if (fConfigs.value.isMultipleDatePicker) {
        if (
          calendar.value.hasOwnProperty('selectedDates') &&
          calendar.value.selectedDates.find(date => date.date === item.date)
        ) {
          const dateIndex = calendar.value.selectedDates.findIndex(
            date => date.date === item.date
          )
          calendar.value.selectedDates.splice(dateIndex, 1)
        } else {
          const date = Object.assign({}, this.defaultDateFormat)
          date.date = item.date

          if (!calendar.value.hasOwnProperty('selectedDates')) {
            calendar.value.selectedDates = []
          }

          calendar.value.selectedDates.push(date)
        }

        emit('input', calendar.value)
      }

      markChooseDays()

      // Time Picker
      if (fConfigs.value.withTimePicker) {
        if (fConfigs.value.isDateRange || fConfigs.value.isDatePicker) {
          openTimePicker()
        }

        if (
          calendar.value.selectedDates.find(date => date.date === item.date) &&
          fConfigs.value.isMultipleDatePicker
        ) {
          this.openTimePicker()
        }
      }

      emit('choseDay', item)
}

const markChooseDays=()=> {
      const startDate = this.startDMY
      const endDate = this.endDMY
     listCalendars.value.forEach(calendar => {
        calendar.weeks.forEach(week => {
          week.days.forEach(day => {
            day.isMarked = false
            day.date = day.date.split(' ')[0]
            // Date Picker
            if (fConfigs.value.isDatePicker) {
              if (calendar.value.selectedDate === day.date) day.isMarked = true
            } else if (fConfigs.value.isMultipleDatePicker) {
              if (
                calendar.value.hasOwnProperty('selectedDates') &&
                calendar.value.selectedDates.find(date => date.date === day.date)
              )
                day.isMarked = true
            } else {
              day.isMouseToLeft = false
              day.isMouseToRight = false
              // Date Range
              if (startDate === day.date) {
                day.isMouseToLeft = !!endDate
                day.isMarked = true
              }

              if (endDate === day.date) {
                day.isMouseToRight = !!endDate
                day.isMarked = true
              }
              //Multiple Range
              if (calendar.value.multipleDateRange) {
                if (
                  ~calendar.value.multipleDateRange
                    .map(range => range.start.split(' ')[0])
                    .indexOf(day.date)
                ) {
                  day.isMouseToLeft = !!endDate
                  day.isMarked = true
                }
                if (
                  ~calendar.value.multipleDateRange
                    .map(range => range.end.split(' ')[0])
                    .indexOf(day.date)
                ) {
                  day.isMouseToRight = !!endDate
                  day.isMarked = true
                }
                calendar.value.multipleDateRange.forEach(range => {
                  if (range.start && range.start === range.end) {
                    day.isMouseToLeft = false
                    day.isMouseToRight = false
                  }
                  if (range.start && range.end) {
                    if (
                      helpCalendar.value.getDateFromFormat(day.date).getTime() >
                        helpCalendar.value.getDateFromFormat(range.start) &&
                      helpCalendar.value.getDateFromFormat(day.date) <
                        helpCalendar.value.getDateFromFormat(range.end)
                    ) {
                      day.isMarked = true
                    }
                  }
                })
              }

              if (startDate && startDate === endDate) {
                day.isMouseToLeft = false
                day.isMouseToRight = false
              }
              if (startDate && endDate) {
                if (
                  helpCalendar.value.getDateFromFormat(day.date).getTime() >
                    helpCalendar.value.getDateFromFormat(startDate) &&
                  helpCalendar.value.getDateFromFormat(day.date) <
                    helpCalendar.value.getDateFromFormat(endDate)
                ) {
                  day.isMarked = true
                }
              }
            }
            if (fConfigs.value.markedDates.includes(day.date))
              day.isMarked = true
          })
        })
      })
}

const dayMouseOver = (date) => {
      emit('dayMouseOver', date)

      if (!fConfigs.value.isDateRange) {
        return false
      }

      // Limits
      if (fConfigs.value.limits) {
        const limitMin = helpCalendar.value
          .getDateFromFormat(fConfigs.value.limits.min)
          .getTime()
        const limitMax = helpCalendar.value
          .getDateFromFormat(fConfigs.value.limits.max)
          .getTime()
        const limitDate = helpCalendar.value.getDateFromFormat(date).getTime()

        if (limitDate < limitMin || limitDate > limitMax) {
          return false
        }
      }

      //Multiple Range

      if (
        (calendar.value.dateRange.start === '' ||
          calendar.value.dateRange.end === '') &&
        (calendar.value.dateRange.start !== '' ||
          calendar.value.dateRange.end !== '')
      ) {
        for (let e = 0; e <listCalendars.value.length; e++) {
          const calendar =listCalendars.value[e]

          for (let f = 0; f < calendar.weeks.length; f++) {
            const week = calendar.weeks[f]

            for (let i = 0; i < week.days.length; i++) {
              const item = week.days[i]

             listCalendars.value[e].weeks[f].days[i].isHovered = false
              if (
                item.date !== this.startDMY &&
                !fConfigs.value.markedDates.includes(item.date)
              ) {
               listCalendars.value[e].weeks[f].days[i].isMarked = false
              }

              if (calendar.value.dateRange.start) {
                const itemDate = helpCalendar.value
                  .getDateFromFormat(item.date)
                  .getTime()

                const thisDate = helpCalendar.value
                  .getDateFromFormat(date)
                  .getTime()
                const startDate = helpCalendar.value.getDateFromFormat(
                  calendar.value.dateRange.start
                )

               listCalendars.value[e].weeks[f].days[i].isMouseToLeft =
                  (itemDate === startDate.getTime() &&
                    thisDate > startDate.getTime()) ||
                  (itemDate === thisDate && thisDate < startDate.getTime())
               listCalendars.value[e].weeks[f].days[i].isMouseToRight =
                  (itemDate === startDate.getTime() &&
                    thisDate < startDate.getTime()) ||
                  (itemDate === thisDate && thisDate > startDate.getTime())

                let dateDay =
                  helpCalendar.value.getDateFromFormat(item.date).getDay() - 1
                if (dateDay === -1) {
                  dateDay = 6
                }

                const dayOfWeekString = fConfigs.value.dayNames[dateDay]
                if (
                  !fConfigs.value.disabledDayNames.includes(dayOfWeekString) &&
                  ((itemDate > startDate.getTime() && itemDate < thisDate) ||
                    (itemDate < startDate.getTime() && itemDate > thisDate))
                ) {
                 listCalendars.value[e].weeks[f].days[i].isMarked = true
                }

                if (!calendar.value.dateRange.end && itemDate === thisDate) {
                 listCalendars.value[e].weeks[f].days[i].isHovered = false
                }

                if (
                  this.checkSelDates(
                    'min',
                    calendar.value.dateRange.start,
                    item.date,
                    date
                  )
                ) {
                 listCalendars.value[e].weeks[f].days[i].isMarked = true

                  let minDateToRight, minDateToLeft
                  minDateToLeft = new Date(startDate.getTime())
                  minDateToRight = new Date(startDate.getTime())
                  minDateToLeft.setDate(
                    minDateToLeft.getDate() - fConfigs.value.minSelDays + 1
                  )
                  minDateToRight.setDate(
                    minDateToRight.getDate() + fConfigs.value.minSelDays - 1
                  )

                  if (
                    thisDate >= minDateToLeft.getTime() &&
                    helpCalendar.value.formatDate(minDateToLeft) === item.date
                  ) {
                   listCalendars.value[e].weeks[f].days[i].isMarked = false
                   listCalendars.value[e].weeks[f].days[i].isMouseToLeft = true
                   listCalendars.value[e].weeks[f].days[i].isHovered = true
                  } else if (
                    thisDate <= minDateToRight.getTime() &&
                    helpCalendar.value.formatDate(minDateToRight) === item.date
                  ) {
                   listCalendars.value[e].weeks[f].days[i].isMarked = false
                   listCalendars.value[e].weeks[f].days[i].isMouseToRight = true
                   listCalendars.value[e].weeks[f].days[i].isHovered = true
                  }
                }

                if (
                  this.checkSelDates(
                    'max',
                    calendar.value.dateRange.start,
                    item.date,
                    date
                  )
                ) {
                 listCalendars.value[e].weeks[f].days[i].isMarked = false
                 listCalendars.value[e].weeks[f].days[i].isHovered = false
                 listCalendars.value[e].weeks[f].days[i].isMouseToLeft = false
                 listCalendars.value[e].weeks[f].days[i].isMouseToRight = false

                  let maxDateToLeft, maxDateToRight
                  maxDateToLeft = new Date(startDate.getTime())
                  maxDateToRight = new Date(startDate.getTime())
                  maxDateToLeft.setDate(
                    maxDateToLeft.getDate() - fConfigs.value.maxSelDays + 1
                  )
                  maxDateToRight.setDate(
                    maxDateToRight.getDate() + fConfigs.value.maxSelDays - 1
                  )

                  if (thisDate <= maxDateToLeft.getTime()) {
                    if (
                      helpCalendar.value.formatDate(maxDateToLeft) === item.date
                    ) {
                     listCalendars.value[e].weeks[f].days[i].isHovered = true
                     listCalendars.value[e].weeks[f].days[
                        i
                      ].isMouseToLeft = true
                    }
                  }

                  if (thisDate >= maxDateToRight.getTime()) {
                    if (
                      helpCalendar.value.formatDate(maxDateToRight) === item.date
                    ) {
                     listCalendars.value[e].weeks[f].days[i].isHovered = true
                     listCalendars.value[e].weeks[f].days[
                        i
                      ].isMouseToRight = true
                    }
                  }
                }
              }
            }
          }
        }
      }
      if (calendar.value.multipleDateRange) {
        const range = calendar.value.multipleDateRange[
          calendar.value.multipleDateRange.length - 1
        ]
        if (!range) return
        // calendar.value.multipleDateRange.forEach((range, index) => {
        if (
          (range.start === '' || range.end === '') &&
          (range.start !== '' || range.end !== '')
        ) {
          for (let e = 0; e <listCalendars.value.length; e++) {
            const calendar =listCalendars.value[e]

            for (let f = 0; f < calendar.weeks.length; f++) {
              const week = calendar.weeks[f]

              for (let i = 0; i < week.days.length; i++) {
                const item = week.days[i]

               listCalendars.value[e].weeks[f].days[i].isHovered = false
                if (
                  item.date !== this.startDMY &&
                  !fConfigs.value.markedDates.includes(item.date)
                ) {
                 listCalendars.value[e].weeks[f].days[i].isMarked = false
                }

                if (range.start) {
                  const itemDate = helpCalendar.value
                    .getDateFromFormat(item.date)
                    .getTime()

                  const thisDate = helpCalendar.value
                    .getDateFromFormat(date)
                    .getTime()
                  const startDate = helpCalendar.value.getDateFromFormat(
                    range.start
                  )

                 listCalendars.value[e].weeks[f].days[i].isMouseToLeft =
                    (itemDate === startDate.getTime() &&
                      thisDate > startDate.getTime()) ||
                    (itemDate === thisDate && thisDate < startDate.getTime())
                 listCalendars.value[e].weeks[f].days[i].isMouseToRight =
                    (itemDate === startDate.getTime() &&
                      thisDate < startDate.getTime()) ||
                    (itemDate === thisDate && thisDate > startDate.getTime())

                  let dateDay =
                    helpCalendar.value.getDateFromFormat(item.date).getDay() - 1
                  if (dateDay === -1) {
                    dateDay = 6
                  }

                  const dayOfWeekString = fConfigs.value.dayNames[dateDay]
                  if (
                    !fConfigs.value.disabledDayNames.includes(dayOfWeekString) &&
                    ((itemDate > startDate.getTime() && itemDate < thisDate) ||
                      (itemDate < startDate.getTime() && itemDate > thisDate))
                  ) {
                   listCalendars.value[e].weeks[f].days[i].isMarked = true
                  }

                  if (!range.end && itemDate === thisDate) {
                   listCalendars.value[e].weeks[f].days[i].isHovered = false
                  }

                  if (this.checkSelDates('min', range.start, item.date, date)) {
                   listCalendars.value[e].weeks[f].days[i].isMarked = true

                    let minDateToRight, minDateToLeft
                    minDateToLeft = new Date(startDate.getTime())
                    minDateToRight = new Date(startDate.getTime())
                    minDateToLeft.setDate(
                      minDateToLeft.getDate() - fConfigs.value.minSelDays + 1
                    )
                    minDateToRight.setDate(
                      minDateToRight.getDate() + fConfigs.value.minSelDays - 1
                    )

                    if (
                      thisDate >= minDateToLeft.getTime() &&
                      helpCalendar.value.formatDate(minDateToLeft) === item.date
                    ) {
                     listCalendars.value[e].weeks[f].days[i].isMarked = false
                     listCalendars.value[e].weeks[f].days[
                        i
                      ].isMouseToLeft = true
                     listCalendars.value[e].weeks[f].days[i].isHovered = true
                    } else if (
                      thisDate <= minDateToRight.getTime() &&
                      helpCalendar.value.formatDate(minDateToRight) === item.date
                    ) {
                     listCalendars.value[e].weeks[f].days[i].isMarked = false
                     listCalendars.value[e].weeks[f].days[
                        i
                      ].isMouseToRight = true
                     listCalendars.value[e].weeks[f].days[i].isHovered = true
                    }
                  }

                  if (this.checkSelDates('max', range.start, item.date, date)) {
                   listCalendars.value[e].weeks[f].days[i].isMarked = false
                   listCalendars.value[e].weeks[f].days[i].isHovered = false
                   listCalendars.value[e].weeks[f].days[i].isMouseToLeft = false
                   listCalendars.value[e].weeks[f].days[
                      i
                    ].isMouseToRight = false

                    let maxDateToLeft, maxDateToRight
                    maxDateToLeft = new Date(startDate.getTime())
                    maxDateToRight = new Date(startDate.getTime())
                    maxDateToLeft.setDate(
                      maxDateToLeft.getDate() - fConfigs.value.maxSelDays + 1
                    )
                    maxDateToRight.setDate(
                      maxDateToRight.getDate() + fConfigs.value.maxSelDays - 1
                    )

                    if (thisDate <= maxDateToLeft.getTime()) {
                      if (
                        helpCalendar.value.formatDate(maxDateToLeft) ===
                        item.date
                      ) {
                       listCalendars.value[e].weeks[f].days[i].isHovered = true
                       listCalendars.value[e].weeks[f].days[
                          i
                        ].isMouseToLeft = true
                      }
                    }

                    if (thisDate >= maxDateToRight.getTime()) {
                      if (
                        helpCalendar.value.formatDate(maxDateToRight) ===
                        item.date
                      ) {
                       listCalendars.value[e].weeks[f].days[i].isHovered = true
                       listCalendars.value[e].weeks[f].days[
                          i
                        ].isMouseToRight = true
                      }
                    }
                  }
                }
              }
            }
          }
        }
        // })
      }
}

const PreMonth = (calendarKey = null) => {
      if (!this.allowPreDate) return false

      this.transitionPrefix = 'right'

      const step = fConfigs.value.changeMonthStep

      calendarKey = calendarKey !== null ? calendarKey : 0

      const currentCalendar =listCalendars.value[calendarKey]
      currentCalendar.date = new Date(
        currentCalendar.date.getFullYear(),
        currentCalendar.date.getMonth() - step
      )
      currentCalendar.key -= hUniqueID()
      this.updateCalendar()

      if (!fConfigs.value.isSeparately) {
        calendar.value.currentDate = currentCalendar.date
        this.initCalendar()
      }

      emit('changedMonth', currentCalendar.date)
}

const  NextMonth =(calendarKey = null)=> {
      if (!this.allowNextDate) return false

      this.transitionPrefix = 'left'

      const step = fConfigs.value.changeMonthStep

      calendarKey = calendarKey !== null ? calendarKey : 0

      const currentCalendar =listCalendars.value[calendarKey]
      currentCalendar.date = new Date(
        currentCalendar.date.getFullYear(),
        currentCalendar.date.getMonth() + step
      )
      currentCalendar.key += hUniqueID()
      this.updateCalendar()

      if (!fConfigs.value.isSeparately) {
        calendar.value.currentDate = currentCalendar.date
        this.initCalendar()
      }

      emit('changedMonth', currentCalendar.date)
}

const  PreYear =(calendarKey = null) =>{
      if (!this.allowPreDate) return false

      const step = showYearPicker.value ? fConfigs.value.changeYearStep : 1

      calendarKey = calendarKey !== null ? calendarKey : 0

      const currentCalendar =listCalendars.value[calendarKey]
      currentCalendar.date = new Date(
        currentCalendar.date.getFullYear() - step,
        currentCalendar.date.getMonth()
      )
      this.updateCalendar()

      if (!fConfigs.value.isSeparately) {
        calendar.value.currentDate = currentCalendar.date
        this.initCalendar()
      }

      emit('changedYear', currentCalendar.date)
}
const  NextYear =(calendarKey = null)=> {
      if (!this.allowNextDate) return false

      const step = showYearPicker.value ? fConfigs.value.changeYearStep : 1

      calendarKey = calendarKey !== null ? calendarKey : 0

      const currentCalendar =listCalendars.value[calendarKey]
      currentCalendar.date = new Date(
        currentCalendar.date.getFullYear() + step,
        currentCalendar.date.getMonth()
      )
      this.updateCalendar()

      if (!fConfigs.value.isSeparately) {
        calendar.value.currentDate = currentCalendar.date
        this.initCalendar()
      }

      emit('changedYear', currentCalendar.date)
}
const  ChooseDate =(date) => {
      let newDate = helpCalendar.value.getDateFromFormat(date)

      if (date === 'today') {
        newDate = new Date()
      }

     listCalendars.value[0].date = calendar.value.currentDate = newDate

      this.updateCalendar()
      this.initCalendar()
}
const  openMonthPicker = (key)=> {
      if (fConfigs.value.changeMonthFunction) {
        showMonthPicker.value = key === showMonthPicker.value ? false : key
        showYearPicker.value = false
      }
}
const  openYearPicker = (key) => {
      if (fConfigs.value.changeYearFunction) {
        showYearPicker.value = key === showYearPicker.value ? false : key
        showMonthPicker.value = false
      }
}
const  pickMonth = (key, calendarKey)=> {
      showMonthPicker.value = false
      if (!props.isSeparately) {
       listCalendars.value.forEach((currentCalendar, index) => {
          const date = currentCalendar.date
          currentCalendar.date = new Date(
            date.getFullYear(),
            key + 1 + index,
            0
          )
          currentCalendar.key += hUniqueID()
        })
      } else {
        const currentCalendar =listCalendars.value[calendarKey]
        const date = currentCalendar.date
        currentCalendar.date = new Date(date.getFullYear(), key + 1, 0)
        currentCalendar.key += hUniqueID()
      }

      const currentCalendar =listCalendars.value[calendarKey]
      emit('changedMonth', currentCalendar.date);
      updateCalendar()
}
const  openTimePicker = ()=> {
      this.showTimePicker = true
}
const  pickYear =(year, calendarKey) =>{
      showYearPicker.value = false
      if (!props.isSeparately) {
       listCalendars.value.forEach(currentCalendar => {
          const date = currentCalendar.date
          currentCalendar.date = new Date(year, date.getMonth() + 1, 0)
          currentCalendar.key += hUniqueID()
          emit('changedYear', currentCalendar.date)
        })
      } else {
        const currentCalendar =listCalendars.value[calendarKey]
        const date = currentCalendar.date
        currentCalendar.date = new Date(year, date.getMonth() + 1, 0)
        currentCalendar.key += hUniqueID()
        emit('changedYear', currentCalendar.date)
      }
      updateCalendar()
}
const  getYearList = (date, delta) =>{
      const years = []
      const year = date.getFullYear() - 4 + delta
      for (let i = 0; i < 12; i++) {
        const finalYear = year + i

        years.push({
          year: finalYear
        })
      }
      return years
}
const  addToSelectedDates=() =>{
      if (helpCalendar.value.checkValidDate(calendar.value.selectedDatesItem)) {
        const date = Object.assign({}, this.defaultDateFormat)
        date.date = calendar.value.selectedDatesItem
        calendar.value.selectedDates.push(date)
        calendar.value.selectedDatesItem = ''
        this.markChooseDays()
      }
}
const  removeFromSelectedDates=(index)=> {
      calendar.value.selectedDates.splice(index, 1)
      this.markChooseDays()
}
const  checkDateRangeEnd =(date) => {
      if (Array.isArray(fConfigs.value.markedDateRange)) {
        return (
          fConfigs.value.markedDateRange.findIndex(range => {
            return range.end === date
          }) !== -1
        )
      }

      return date === fConfigs.value.markedDateRange.end
}
const  checkSelDates = (type, startDate, itemDate, hoverDate)=> {
      const startTime = helpCalendar.value.getDateFromFormat(startDate).getTime()
      const itemTime = helpCalendar.value.getDateFromFormat(itemDate).getTime()
      const hoverTime = helpCalendar.value.getDateFromFormat(hoverDate).getTime()

      const days =
        type === 'min' ? fConfigs.value.minSelDays : fConfigs.value.maxSelDays - 2
      const minTime = days * 1000 * 60 * 60 * 24
      const rightTime = startTime + minTime
      const leftTime = startTime - minTime

      let result
      if (hoverTime > startTime) {
        if (type === 'min')
          result =
            itemTime < rightTime &&
            itemTime > startTime &&
            fConfigs.value.minSelDays
        else
          result =
            itemTime > rightTime &&
            itemTime > startTime &&
            fConfigs.value.maxSelDays
      } else if (hoverTime < startTime) {
        if (type === 'min')
          result =
            itemTime > leftTime &&
            itemTime < startTime &&
            fConfigs.value.minSelDays
        else
          result =
            itemTime < leftTime &&
            itemTime < startTime &&
            fConfigs.value.maxSelDays
      }

      return result
}
const  checkLimits =(value) => {
      if (fConfigs.value.limits) {
        const min = new Date(
          helpCalendar.value.getDateFromFormat(fConfigs.value.limits.min)
        )
        min.setDate(1)
        min.setHours(0, 0, 0, 0)
        const max = new Date(
          helpCalendar.value.getDateFromFormat(fConfigs.value.limits.max)
        )
        max.setDate(1)
        max.setHours(0, 0, 0, 0)

        this.allowPreDate = true
        this.allowNextDate = true

        const current = new Date(value)
        current.setDate(1)
        current.setHours(0, 0, 0, 0)

        if (current <= min) {
          this.allowPreDate = false
        }

        if (current >= max) {
          this.allowNextDate = false
        }
      }
}
const  getTransition_ =()=>{
      if (!fConfigs.value.transition) return ''

      let name = ''
      if (this.transitionPrefix === 'left') {
        name = 'vfc-calendar-slide-left'
      } else if (this.transitionPrefix === 'right') {
        name = 'vfc-calendar-slide-right'
      }
      return name
}

const checkHiddenElement = (elementName) => 
  !fConfigs.value.hiddenElements.includes(elementName)

const onFocusIn = () => {
  if (fConfigs.value.isModal) {
    showCalendar.value = true
  }
}

const onFocusOut = (e) => {
  if (
    fConfigs.value.isModal &&
    !hElContains(popoverElement, e.relatedTarget)
  ) {
    showCalendar.value = showMonthPicker.value = showYearPicker.value = false
    return
  }
}

const hideMonthYearPicker = (e) => {
  if (showMonthPicker.value || showYearPicker.value) {
    const key = showMonthPicker.value
      ? showMonthPicker.value - 1
      : showYearPicker.value - 1

    const MYactive = refs.calendars.value.querySelectorAll(
      `.vfc-content-MY-picker`
    )[key]
    if (MYactive.contains(e.target)) {
      return
    }
    showMonthPicker.value = showYearPicker.value = false
    return
  }
}

const checkDateRangeStart = (date) => {
  if (Array.isArray(fConfigs.value.markedDateRange)) {
    return (
      fConfigs.value.markedDateRange.findIndex(range => {
        return range.start === date
      }) !== -1
    )
  }

  return date === fConfigs.value.markedDateRange.start
}

const cleanRange = () => {
  if (props.isMultipleDateRange) {
    calendar.value.dateRange.end = ''
    calendar.value.dateRange.start = ''
    return
  }
  calendar.value.multipleDateRange = []
}

watch(
  () => props.enabledDates,
  () => {
    fConfigs.value.enabledDates = props.enabledDates;
  },
  { deep: true }
);
watch(
  () => props.configs.enabledDates,
  () => {
    fConfigs.value.enabledDates = props.configs.enabledDates;
  },
  { deep: true }
);
watch(
  () => fConfigs.value,
  () => {
    markChooseDays();
  },
  { deep: true, immediate: true }
);
watch(
  () => calendar.value,
  () => {
    markChooseDays();
  },
  { deep: true, immediate: true }
);
watch(
  () => calendar.value.currentDate,
  (value) => {
    emit("input", calendar.value);
    checkLimits(value);
  }
);

onMounted(() => {
  setConfigs();
  initCalendar();

  // show time placeholder
  if (props.displayTimeInput) {
    const timeFormat = fConfigs.value.placeholder.split(' ')[1];
    if (!timeFormat) {
      fConfigs.value.placeholder += ' hh:mm';
    }
  }

  // Event
  popoverElement.value!.addEventListener('focusin', onFocusIn);
  popoverElement.value!.addEventListener('focusout', onFocusOut);
  window.addEventListener('click', hideMonthYearPicker, {
    capture: true
  });

  // Reacts to external selected dates
  watch(
    () => props.value,
    value => {
      if (
        typeof value === 'object' &&
        (value.hasOwnProperty('dateRange') ||
          value.hasOwnProperty('selectedDate'))
      ) {
        calendar.value = value as any;
      } else if (
        typeof value === 'object' &&
        value.hasOwnProperty('multipleDateRange')
      ) {
        calendar.value.multipleDateRange = value.multipleDateRange;
        const lastElement = calendar.value.multipleDateRange[
          Math.max(0, calendar.value.multipleDateRange.length - 1)
        ] as any;
        if (
          lastElement &&
          ((lastElement.start && !lastElement.end) ||
            (!lastElement.start && lastElement.end))
        ) {
          throw new Error('Invalid Data Range');
        }
      }
    },
    { immediate: true, deep: true }
  );

  watch(
    () => showCalendar,
    value => {
      if (value)  emit('opened');
      else emit('closed');
    },
    { immediate: true, deep: true }
  );
})
onUnmounted(
  ()=>{
        window.removeEventListener('focusin', onFocusIn)
    window.removeEventListener('focusout', onFocusOut)
    window.removeEventListener('click', hideMonthYearPicker)
  }
)
</script>

<style lang="scss">
@import "../assets/scss/calendar.scss";
.rangeCleaner {
  padding: 5px 0 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  span {
    color: white;
    border-radius: 5px;
    border: none;
    padding: 5px;
    &.active {
      &:hover {
        background-color: #4f8a9e;
        cursor: pointer;
      }
      background-color: #66b3cc;
    }
    &.disabled {
      background-color: rgb(148, 148, 148);
    }
  }
}
</style>
