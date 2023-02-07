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
    validator(format) {
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
  placeholder: false,
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
  enabledDates: [],
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
  selectedDates: [],
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
const popoverElement = ref("");
const hoveredObject = ref(null);
const transitionPrefix = ref("left");
const showCalendar = ref(true);
const showMonthPicker = ref(false);
const showYearPicker = ref(false);
const showTimePicker = ref(false);
const allowPreDate = ref(true);
const allowNextDate = ref(true);
const listCalendars = ref([]);

const startDMY = computed(() => {
  if (this.calendar.dateRange.start) {
    return this.calendar.dateRange.start.split(" ")[0];
  }
  return "";
});

const endDMY = computed(() => {
  if (this.calendar.dateRange.end) {
    return this.calendar.dateRange.end.split(" ")[0];
  }
  return "";
});

const rangeIsSelected = computed(() => {
  if (!this.isMultipleDateRange) {
    return !!(this.calendar.dateRange.end && this.calendar.dateRange.start);
  }
  return this.calendar.multipleDateRange.length > 0;
});
const helpCalendar = computed(() => {
  return new helpCalendarClass(
    fConfigs.value.sundayStart,
    this.checkHiddenElement("leftAndRightDays"),
    this.fConfigs.dateFormat,
    this.fConfigs.dayNames
  );
});
const singleSelectedDate = computed({
  get() {
    let res = "";
    if (this.displayTimeInput) {
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
      let format = this.fConfigs.dateFormat;
      if (this.dateFormat) {
        format = this.dateFormat;
      }
      if (validFormats.indexOf(format.split(" ")[1]) > 3) {
        res +=
          " " +
          [this.calendar.selectedHour, this.calendar.selectedMinute]
            .reverse()
            .join(":");
      } else {
        res +=
          " " +
          [this.calendar.selectedHour, this.calendar.selectedMinute].join(":");
      }
    }

    return this.calendar.selectedDate ? this.calendar.selectedDate + res : "";
  },
  set(newValue) {
    newValue = this.helpCalendar.mask(newValue);
    if (this.helpCalendar.getDateFromFormat(newValue).getMonth()) {
      this.calendar.selectedDate = newValue;
    }
  },
});

  const initCalendar = ()=> {
      this.setCalendarData()
      this.listRendering()
      this.markChooseDays()
      this.checkLimits(this.calendar.currentDate)
    }

  const updateCalendar = ()=> {
      this.setExistingCalendarData()
      this.listRendering()
      this.markChooseDays()
    }

      const  isNotSeparatelyAndFirst =(key) =>{
      return this.isSeparately || key == 0
    }

       const setCalendarData=() =>{
      let date = this.calendar.currentDate
      date = new Date(date.getFullYear(), date.getMonth() - 1)

      this.listCalendars = []

      for (let i = 0; i < this.fConfigs.calendarsCount; i++) {
        date = new Date(date.getFullYear(), date.getMonth() + 1)

        const calendar = {
          key: i + hUniqueID(),
          date: date,
          dateTop: `${
            this.fConfigs.monthNames[date.getMonth()]
          } ${date.getFullYear()}`,
          month: this.fConfigs.monthNames[date.getMonth()],
          year: date.getFullYear(),
          weeks: this.helpCalendar.getFinalizedWeeks(
            date.getMonth(),
            date.getFullYear()
          )
        }

        this.listCalendars.push(calendar)

        if (!this.fConfigs.isMultiple) {
          break
        }
      }
    }

  const setExistingCalendarData = ()=> {
      for (let i = 0; i < this.listCalendars.length; i++) {
        const calendar = this.listCalendars[i]
        const date = calendar.date

        this.$set(this.listCalendars, i, {
          key: calendar.key,
          date: date,
          dateTop: `${
            this.fConfigs.monthNames[date.getMonth()]
          } ${date.getFullYear()}`,
          month: this.fConfigs.monthNames[date.getMonth()],
          year: date.getFullYear(),
          weeks: this.helpCalendar.getFinalizedWeeks(
            date.getMonth(),
            date.getFullYear()
          )
        })

        if (!this.fConfigs.isMultiple) {
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
          if (typeof this.fConfigs[objectKey] !== 'undefined') {
            console.log(this);
            this.$set(this.fConfigs, objectKey, globalOptions[objectKey])
          }
        })
      }

      if (typeof this.configs !== 'undefined') {
        Object.keys(this.fConfigs).forEach(objectKey => {
          if (typeof this.configs[objectKey] !== 'undefined') {
            // Get From Configs
            console.log(this);
            this.$set(this.fConfigs, objectKey, this.configs[objectKey])
          }
        })
      } else {
        Object.keys(this.$props).forEach(objectKey => {
          if (
            typeof this.fConfigs[objectKey] !== 'undefined' &&
            typeof this.$props[objectKey] !== 'undefined'
          ) {
            console.log(this);
            this.$set(this.fConfigs, objectKey, this.$props[objectKey])
          }
        })
      }

      // Is Modal
      if (this.fConfigs.isModal) this.showCalendar = false

      // Placeholder
      if (!this.fConfigs.placeholder)
        this.fConfigs.placeholder = this.fConfigs.dateFormat

      if (typeof this.newCurrentDate !== 'undefined') {
        this.calendar.currentDate = this.newCurrentDate
      }

      // Sunday Start
      if (this.fConfigs.sundayStart) {
        const dayNames = [...this.fConfigs.dayNames]
        const sundayName = dayNames[dayNames.length - 1]
        dayNames.splice(dayNames.length - 1, 1)
        dayNames.unshift(sundayName)
        this.fConfigs.dayNames = dayNames
      }
}

const listRendering = () => {
      // Each Calendars
      this.listCalendars.forEach(calendar => {
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
            if (typeof this.fConfigs.markedDates[0] === 'object') {
              checkMarked = this.fConfigs.markedDates.find(markDate => {
                return markDate.date === this.helpCalendar.formatDate(date)
              })
            } else {
              // Without Classes
              checkMarked = this.fConfigs.markedDates.find(markDate => {
                return markDate === this.helpCalendar.formatDate(date)
              })
            }

            if (this.startDMY === this.helpCalendar.formatDate(date)) {
              checkMarked = true
            }

            let isMarked = false
            if (typeof checkMarked !== 'undefined') {
              isMarked = true
            }

            finalizedDays.push({
              day: day.day,
              date: this.helpCalendar.formatDate(date),
              hide: day.hide,
              isMouseToLeft: false,
              isMouseToRight: false,
              isHovered: false,
              isDateRangeStart: this.checkDateRangeStart(
                this.helpCalendar.formatDate(date)
              ),
              isDateRangeEnd: this.checkDateRangeEnd(
                this.helpCalendar.formatDate(date)
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
      if (this.fConfigs.withTimePicker && this.fConfigs.isDateRange) {
        item.date = item.date + ' 00:00'
      }
      this.$emit('dayClicked', item)

      if (
        !this.fConfigs.isDateRange &&
        !this.fConfigs.isDatePicker &&
        !this.fConfigs.isMultipleDatePicker
      ) {
        return false
      }

      //Disabled Dates - Start

      // Disable days of week if set in configuration
      let dateDay = this.helpCalendar.getDateFromFormat(item.date).getDay() - 1
      if (dateDay === -1) {
        dateDay = 6
      }

      const dayOfWeekString = this.fConfigs.dayNames[dateDay]
      if (
        this.fConfigs.disabledDayNames.includes(dayOfWeekString) ||
        isDisabledDate(item.date)
      ) {
        return false
      }

      //Disabled Dates - End

      // Limits
      if (this.fConfigs.limits) {
        const min = this.helpCalendar
          .getDateFromFormat(this.fConfigs.limits.min)
          .getTime()
        const max = this.helpCalendar
          .getDateFromFormat(this.fConfigs.limits.max)
          .getTime()
        const date = this.helpCalendar.getDateFromFormat(item.date).getTime()

        if (date < min || date > max) {
          return false
        }
      }

      // Date Multiple Range
      if (this.fConfigs.isMultipleDateRange) {
        const clickDate = this.helpCalendar
          .getDateFromFormat(item.date.split(' ')[0])
          .getTime()
        let rangesLength = this.calendar.multipleDateRange.length
        let lastRange = this.calendar.multipleDateRange[rangesLength - 1]
        let startDate = ''
        // if (lastRange) {
        //   // if (lastRange.start && lastRange.end)
        // } else

        if (!lastRange) {
          this.calendar.multipleDateRange.push({ end: '', start: '' })
          rangesLength = this.calendar.multipleDateRange.length
          lastRange = this.calendar.multipleDateRange[rangesLength - 1]
        }

        if (lastRange.start) {
          startDate = this.helpCalendar.getDateFromFormat(lastRange.start)
        }

        // Two dates is not empty
        if (lastRange.start !== '' && lastRange.end !== '') {
          this.calendar.multipleDateRange.push({ end: '', start: item.date })
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
            if (this.calendar.withTimePicker) {
              this.$refs['timePicker'].startDateActive = true
            }
          })
          lastRange.end = lastRange.start
          lastRange.start = item.date
        }

        //Get number of days between date range dates
        if (lastRange.start !== '' && lastRange.end !== '') {
          const oneDay = 24 * 60 * 60 * 1000
          const firstDate = this.helpCalendar.getDateFromFormat(lastRange.start)
          const secondDate = this.helpCalendar.getDateFromFormat(lastRange.end)
          const diffDays = Math.round(
            Math.abs((firstDate.getTime() - secondDate.getTime()) / oneDay)
          )
          const itemTime = this.helpCalendar
            .getDateFromFormat(item.date)
            .getTime()

          this.$emit('selectedDaysCount', diffDays)

          // Is Auto Closeable
          if (this.fConfigs.isModal && this.fConfigs.isAutoCloseable) {
            this.showCalendar = false
          }

          // Minimum Selected Days
          const minSelDays = this.fConfigs.minSelDays

          if (
            minSelDays &&
            itemTime >= startDate.getTime() &&
            diffDays < minSelDays
          ) {
            startDate.setDate(startDate.getDate() + (minSelDays - 1))
            lastRange.end = this.helpCalendar.formatDate(startDate)
          }

          if (
            minSelDays &&
            itemTime < startDate.getTime() &&
            diffDays < minSelDays
          ) {
            startDate.setDate(startDate.getDate() - (minSelDays - 1))
            lastRange.start = this.helpCalendar.formatDate(startDate)
          }

          // Maximum Selected Days
          const maxSelDays = this.fConfigs.maxSelDays

          if (
            maxSelDays &&
            itemTime >= startDate.getTime() &&
            diffDays >= maxSelDays
          ) {
            startDate.setDate(startDate.getDate() + (maxSelDays - 1))
            lastRange.end = this.helpCalendar.formatDate(startDate)
          }

          if (
            maxSelDays &&
            itemTime < startDate.getTime() &&
            diffDays >= maxSelDays
          ) {
            startDate.setDate(startDate.getDate() - (maxSelDays - 1))
            lastRange.start = this.helpCalendar.formatDate(startDate)
          }
        }

        this.$emit('input', this.calendar)
      } // Date Range
      else if (this.fConfigs.isDateRange) {
        const clickDate = this.helpCalendar
          .getDateFromFormat(item.date.split(' ')[0])
          .getTime()

        let startDate = ''
        if (this.calendar.dateRange.start) {
          startDate = this.helpCalendar.getDateFromFormat(
            this.calendar.dateRange.start
          )
        }

        // Two dates is not empty
        if (
          this.calendar.dateRange.start !== '' &&
          this.calendar.dateRange.end !== ''
        ) {
          this.calendar.dateRange.start = item.date
          this.calendar.dateRange.end = ''
          // Not date selected
        } else if (
          this.calendar.dateRange.start === '' &&
          this.calendar.dateRange.end === ''
        ) {
          this.calendar.dateRange.start = item.date
          // Start Date not empty, chose date > start date
        } else if (
          this.calendar.dateRange.end === '' &&
          clickDate > startDate.getTime()
        ) {
          this.calendar.dateRange.end = item.date
          // Start date not empty, chose date <= start date (also same date range select)
        } else if (
          this.calendar.dateRange.start !== '' &&
          clickDate <= startDate.getTime()
        ) {
          this.$nextTick(() => {
            if (this.calendar.dateRange && this.calendar.withTimePicker) {
              this.$refs['timePicker'].startDateActive = true
            }
          })
          this.calendar.dateRange.end = this.calendar.dateRange.start
          this.calendar.dateRange.start = item.date
        }

        //Get number of days between date range dates
        if (
          this.calendar.dateRange.start !== '' &&
          this.calendar.dateRange.end !== ''
        ) {
          const oneDay = 24 * 60 * 60 * 1000
          const firstDate = this.helpCalendar.getDateFromFormat(
            this.calendar.dateRange.start
          )
          const secondDate = this.helpCalendar.getDateFromFormat(
            this.calendar.dateRange.end
          )
          const diffDays = Math.round(
            Math.abs((firstDate.getTime() - secondDate.getTime()) / oneDay)
          )
          const itemTime = this.helpCalendar
            .getDateFromFormat(item.date)
            .getTime()

          this.$emit('selectedDaysCount', diffDays)

          // Is Auto Closeable
          if (this.fConfigs.isModal && this.fConfigs.isAutoCloseable) {
            this.showCalendar = false
          }

          // Minimum Selected Days
          const minSelDays = this.fConfigs.minSelDays

          if (
            minSelDays &&
            itemTime >= startDate.getTime() &&
            diffDays < minSelDays
          ) {
            startDate.setDate(startDate.getDate() + (minSelDays - 1))
            this.calendar.dateRange.end = this.helpCalendar.formatDate(
              startDate
            )
          }

          if (
            minSelDays &&
            itemTime < startDate.getTime() &&
            diffDays < minSelDays
          ) {
            startDate.setDate(startDate.getDate() - (minSelDays - 1))
            this.calendar.dateRange.start = this.helpCalendar.formatDate(
              startDate
            )
          }

          // Maximum Selected Days
          const maxSelDays = this.fConfigs.maxSelDays

          if (
            maxSelDays &&
            itemTime >= startDate.getTime() &&
            diffDays >= maxSelDays
          ) {
            startDate.setDate(startDate.getDate() + (maxSelDays - 1))
            this.calendar.dateRange.end = this.helpCalendar.formatDate(
              startDate
            )
          }

          if (
            maxSelDays &&
            itemTime < startDate.getTime() &&
            diffDays >= maxSelDays
          ) {
            startDate.setDate(startDate.getDate() - (maxSelDays - 1))
            this.calendar.dateRange.start = this.helpCalendar.formatDate(
              startDate
            )
          }
        }

        this.$emit('input', this.calendar)
      } else if (this.fConfigs.isDatePicker) {
        this.calendar.selectedDate = item.date
        this.$emit('input', this.calendar)

        // Is Auto Closeable
        if (this.fConfigs.isModal && this.fConfigs.isAutoCloseable) {
          this.showCalendar = false
        }
      } else if (this.fConfigs.isMultipleDatePicker) {
        if (
          this.calendar.hasOwnProperty('selectedDates') &&
          this.calendar.selectedDates.find(date => date.date === item.date)
        ) {
          const dateIndex = this.calendar.selectedDates.findIndex(
            date => date.date === item.date
          )
          this.calendar.selectedDates.splice(dateIndex, 1)
        } else {
          const date = Object.assign({}, this.defaultDateFormat)
          date.date = item.date

          if (!this.calendar.hasOwnProperty('selectedDates')) {
            this.calendar.selectedDates = []
          }

          this.calendar.selectedDates.push(date)
        }

        this.$emit('input', this.calendar)
      }

      this.markChooseDays()

      // Time Picker
      if (this.fConfigs.withTimePicker) {
        if (this.fConfigs.isDateRange || this.fConfigs.isDatePicker) {
          this.openTimePicker()
        }

        if (
          this.calendar.selectedDates.find(date => date.date === item.date) &&
          this.fConfigs.isMultipleDatePicker
        ) {
          this.openTimePicker()
        }
      }

      this.$emit('choseDay', item)
}

const markChooseDays=()=> {
      const startDate = this.startDMY
      const endDate = this.endDMY
      this.listCalendars.forEach(calendar => {
        calendar.weeks.forEach(week => {
          week.days.forEach(day => {
            day.isMarked = false
            day.date = day.date.split(' ')[0]
            // Date Picker
            if (this.fConfigs.isDatePicker) {
              if (this.calendar.selectedDate === day.date) day.isMarked = true
            } else if (this.fConfigs.isMultipleDatePicker) {
              if (
                this.calendar.hasOwnProperty('selectedDates') &&
                this.calendar.selectedDates.find(date => date.date === day.date)
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
              if (this.calendar.multipleDateRange) {
                if (
                  ~this.calendar.multipleDateRange
                    .map(range => range.start.split(' ')[0])
                    .indexOf(day.date)
                ) {
                  day.isMouseToLeft = !!endDate
                  day.isMarked = true
                }
                if (
                  ~this.calendar.multipleDateRange
                    .map(range => range.end.split(' ')[0])
                    .indexOf(day.date)
                ) {
                  day.isMouseToRight = !!endDate
                  day.isMarked = true
                }
                this.calendar.multipleDateRange.forEach(range => {
                  if (range.start && range.start === range.end) {
                    day.isMouseToLeft = false
                    day.isMouseToRight = false
                  }
                  if (range.start && range.end) {
                    if (
                      this.helpCalendar.getDateFromFormat(day.date).getTime() >
                        this.helpCalendar.getDateFromFormat(range.start) &&
                      this.helpCalendar.getDateFromFormat(day.date) <
                        this.helpCalendar.getDateFromFormat(range.end)
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
                  this.helpCalendar.getDateFromFormat(day.date).getTime() >
                    this.helpCalendar.getDateFromFormat(startDate) &&
                  this.helpCalendar.getDateFromFormat(day.date) <
                    this.helpCalendar.getDateFromFormat(endDate)
                ) {
                  day.isMarked = true
                }
              }
            }
            if (this.fConfigs.markedDates.includes(day.date))
              day.isMarked = true
          })
        })
      })
}

const dayMouseOver = (date) => {
      this.$emit('dayMouseOver', date)

      if (!this.fConfigs.isDateRange) {
        return false
      }

      // Limits
      if (this.fConfigs.limits) {
        const limitMin = this.helpCalendar
          .getDateFromFormat(this.fConfigs.limits.min)
          .getTime()
        const limitMax = this.helpCalendar
          .getDateFromFormat(this.fConfigs.limits.max)
          .getTime()
        const limitDate = this.helpCalendar.getDateFromFormat(date).getTime()

        if (limitDate < limitMin || limitDate > limitMax) {
          return false
        }
      }

      //Multiple Range

      if (
        (this.calendar.dateRange.start === '' ||
          this.calendar.dateRange.end === '') &&
        (this.calendar.dateRange.start !== '' ||
          this.calendar.dateRange.end !== '')
      ) {
        for (let e = 0; e < this.listCalendars.length; e++) {
          const calendar = this.listCalendars[e]

          for (let f = 0; f < calendar.weeks.length; f++) {
            const week = calendar.weeks[f]

            for (let i = 0; i < week.days.length; i++) {
              const item = week.days[i]

              this.listCalendars[e].weeks[f].days[i].isHovered = false
              if (
                item.date !== this.startDMY &&
                !this.fConfigs.markedDates.includes(item.date)
              ) {
                this.listCalendars[e].weeks[f].days[i].isMarked = false
              }

              if (this.calendar.dateRange.start) {
                const itemDate = this.helpCalendar
                  .getDateFromFormat(item.date)
                  .getTime()

                const thisDate = this.helpCalendar
                  .getDateFromFormat(date)
                  .getTime()
                const startDate = this.helpCalendar.getDateFromFormat(
                  this.calendar.dateRange.start
                )

                this.listCalendars[e].weeks[f].days[i].isMouseToLeft =
                  (itemDate === startDate.getTime() &&
                    thisDate > startDate.getTime()) ||
                  (itemDate === thisDate && thisDate < startDate.getTime())
                this.listCalendars[e].weeks[f].days[i].isMouseToRight =
                  (itemDate === startDate.getTime() &&
                    thisDate < startDate.getTime()) ||
                  (itemDate === thisDate && thisDate > startDate.getTime())

                let dateDay =
                  this.helpCalendar.getDateFromFormat(item.date).getDay() - 1
                if (dateDay === -1) {
                  dateDay = 6
                }

                const dayOfWeekString = this.fConfigs.dayNames[dateDay]
                if (
                  !this.fConfigs.disabledDayNames.includes(dayOfWeekString) &&
                  ((itemDate > startDate.getTime() && itemDate < thisDate) ||
                    (itemDate < startDate.getTime() && itemDate > thisDate))
                ) {
                  this.listCalendars[e].weeks[f].days[i].isMarked = true
                }

                if (!this.calendar.dateRange.end && itemDate === thisDate) {
                  this.listCalendars[e].weeks[f].days[i].isHovered = false
                }

                if (
                  this.checkSelDates(
                    'min',
                    this.calendar.dateRange.start,
                    item.date,
                    date
                  )
                ) {
                  this.listCalendars[e].weeks[f].days[i].isMarked = true

                  let minDateToRight, minDateToLeft
                  minDateToLeft = new Date(startDate.getTime())
                  minDateToRight = new Date(startDate.getTime())
                  minDateToLeft.setDate(
                    minDateToLeft.getDate() - this.fConfigs.minSelDays + 1
                  )
                  minDateToRight.setDate(
                    minDateToRight.getDate() + this.fConfigs.minSelDays - 1
                  )

                  if (
                    thisDate >= minDateToLeft.getTime() &&
                    this.helpCalendar.formatDate(minDateToLeft) === item.date
                  ) {
                    this.listCalendars[e].weeks[f].days[i].isMarked = false
                    this.listCalendars[e].weeks[f].days[i].isMouseToLeft = true
                    this.listCalendars[e].weeks[f].days[i].isHovered = true
                  } else if (
                    thisDate <= minDateToRight.getTime() &&
                    this.helpCalendar.formatDate(minDateToRight) === item.date
                  ) {
                    this.listCalendars[e].weeks[f].days[i].isMarked = false
                    this.listCalendars[e].weeks[f].days[i].isMouseToRight = true
                    this.listCalendars[e].weeks[f].days[i].isHovered = true
                  }
                }

                if (
                  this.checkSelDates(
                    'max',
                    this.calendar.dateRange.start,
                    item.date,
                    date
                  )
                ) {
                  this.listCalendars[e].weeks[f].days[i].isMarked = false
                  this.listCalendars[e].weeks[f].days[i].isHovered = false
                  this.listCalendars[e].weeks[f].days[i].isMouseToLeft = false
                  this.listCalendars[e].weeks[f].days[i].isMouseToRight = false

                  let maxDateToLeft, maxDateToRight
                  maxDateToLeft = new Date(startDate.getTime())
                  maxDateToRight = new Date(startDate.getTime())
                  maxDateToLeft.setDate(
                    maxDateToLeft.getDate() - this.fConfigs.maxSelDays + 1
                  )
                  maxDateToRight.setDate(
                    maxDateToRight.getDate() + this.fConfigs.maxSelDays - 1
                  )

                  if (thisDate <= maxDateToLeft.getTime()) {
                    if (
                      this.helpCalendar.formatDate(maxDateToLeft) === item.date
                    ) {
                      this.listCalendars[e].weeks[f].days[i].isHovered = true
                      this.listCalendars[e].weeks[f].days[
                        i
                      ].isMouseToLeft = true
                    }
                  }

                  if (thisDate >= maxDateToRight.getTime()) {
                    if (
                      this.helpCalendar.formatDate(maxDateToRight) === item.date
                    ) {
                      this.listCalendars[e].weeks[f].days[i].isHovered = true
                      this.listCalendars[e].weeks[f].days[
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
      if (this.calendar.multipleDateRange) {
        const range = this.calendar.multipleDateRange[
          this.calendar.multipleDateRange.length - 1
        ]
        if (!range) return
        // this.calendar.multipleDateRange.forEach((range, index) => {
        if (
          (range.start === '' || range.end === '') &&
          (range.start !== '' || range.end !== '')
        ) {
          for (let e = 0; e < this.listCalendars.length; e++) {
            const calendar = this.listCalendars[e]

            for (let f = 0; f < calendar.weeks.length; f++) {
              const week = calendar.weeks[f]

              for (let i = 0; i < week.days.length; i++) {
                const item = week.days[i]

                this.listCalendars[e].weeks[f].days[i].isHovered = false
                if (
                  item.date !== this.startDMY &&
                  !this.fConfigs.markedDates.includes(item.date)
                ) {
                  this.listCalendars[e].weeks[f].days[i].isMarked = false
                }

                if (range.start) {
                  const itemDate = this.helpCalendar
                    .getDateFromFormat(item.date)
                    .getTime()

                  const thisDate = this.helpCalendar
                    .getDateFromFormat(date)
                    .getTime()
                  const startDate = this.helpCalendar.getDateFromFormat(
                    range.start
                  )

                  this.listCalendars[e].weeks[f].days[i].isMouseToLeft =
                    (itemDate === startDate.getTime() &&
                      thisDate > startDate.getTime()) ||
                    (itemDate === thisDate && thisDate < startDate.getTime())
                  this.listCalendars[e].weeks[f].days[i].isMouseToRight =
                    (itemDate === startDate.getTime() &&
                      thisDate < startDate.getTime()) ||
                    (itemDate === thisDate && thisDate > startDate.getTime())

                  let dateDay =
                    this.helpCalendar.getDateFromFormat(item.date).getDay() - 1
                  if (dateDay === -1) {
                    dateDay = 6
                  }

                  const dayOfWeekString = this.fConfigs.dayNames[dateDay]
                  if (
                    !this.fConfigs.disabledDayNames.includes(dayOfWeekString) &&
                    ((itemDate > startDate.getTime() && itemDate < thisDate) ||
                      (itemDate < startDate.getTime() && itemDate > thisDate))
                  ) {
                    this.listCalendars[e].weeks[f].days[i].isMarked = true
                  }

                  if (!range.end && itemDate === thisDate) {
                    this.listCalendars[e].weeks[f].days[i].isHovered = false
                  }

                  if (this.checkSelDates('min', range.start, item.date, date)) {
                    this.listCalendars[e].weeks[f].days[i].isMarked = true

                    let minDateToRight, minDateToLeft
                    minDateToLeft = new Date(startDate.getTime())
                    minDateToRight = new Date(startDate.getTime())
                    minDateToLeft.setDate(
                      minDateToLeft.getDate() - this.fConfigs.minSelDays + 1
                    )
                    minDateToRight.setDate(
                      minDateToRight.getDate() + this.fConfigs.minSelDays - 1
                    )

                    if (
                      thisDate >= minDateToLeft.getTime() &&
                      this.helpCalendar.formatDate(minDateToLeft) === item.date
                    ) {
                      this.listCalendars[e].weeks[f].days[i].isMarked = false
                      this.listCalendars[e].weeks[f].days[
                        i
                      ].isMouseToLeft = true
                      this.listCalendars[e].weeks[f].days[i].isHovered = true
                    } else if (
                      thisDate <= minDateToRight.getTime() &&
                      this.helpCalendar.formatDate(minDateToRight) === item.date
                    ) {
                      this.listCalendars[e].weeks[f].days[i].isMarked = false
                      this.listCalendars[e].weeks[f].days[
                        i
                      ].isMouseToRight = true
                      this.listCalendars[e].weeks[f].days[i].isHovered = true
                    }
                  }

                  if (this.checkSelDates('max', range.start, item.date, date)) {
                    this.listCalendars[e].weeks[f].days[i].isMarked = false
                    this.listCalendars[e].weeks[f].days[i].isHovered = false
                    this.listCalendars[e].weeks[f].days[i].isMouseToLeft = false
                    this.listCalendars[e].weeks[f].days[
                      i
                    ].isMouseToRight = false

                    let maxDateToLeft, maxDateToRight
                    maxDateToLeft = new Date(startDate.getTime())
                    maxDateToRight = new Date(startDate.getTime())
                    maxDateToLeft.setDate(
                      maxDateToLeft.getDate() - this.fConfigs.maxSelDays + 1
                    )
                    maxDateToRight.setDate(
                      maxDateToRight.getDate() + this.fConfigs.maxSelDays - 1
                    )

                    if (thisDate <= maxDateToLeft.getTime()) {
                      if (
                        this.helpCalendar.formatDate(maxDateToLeft) ===
                        item.date
                      ) {
                        this.listCalendars[e].weeks[f].days[i].isHovered = true
                        this.listCalendars[e].weeks[f].days[
                          i
                        ].isMouseToLeft = true
                      }
                    }

                    if (thisDate >= maxDateToRight.getTime()) {
                      if (
                        this.helpCalendar.formatDate(maxDateToRight) ===
                        item.date
                      ) {
                        this.listCalendars[e].weeks[f].days[i].isHovered = true
                        this.listCalendars[e].weeks[f].days[
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

      const step = this.fConfigs.changeMonthStep

      calendarKey = calendarKey !== null ? calendarKey : 0

      const currentCalendar = this.listCalendars[calendarKey]
      currentCalendar.date = new Date(
        currentCalendar.date.getFullYear(),
        currentCalendar.date.getMonth() - step
      )
      currentCalendar.key -= hUniqueID()
      this.updateCalendar()

      if (!this.fConfigs.isSeparately) {
        this.calendar.currentDate = currentCalendar.date
        this.initCalendar()
      }

      this.$emit('changedMonth', currentCalendar.date)
}

const  NextMonth =(calendarKey = null)=> {
      if (!this.allowNextDate) return false

      this.transitionPrefix = 'left'

      const step = this.fConfigs.changeMonthStep

      calendarKey = calendarKey !== null ? calendarKey : 0

      const currentCalendar = this.listCalendars[calendarKey]
      currentCalendar.date = new Date(
        currentCalendar.date.getFullYear(),
        currentCalendar.date.getMonth() + step
      )
      currentCalendar.key += hUniqueID()
      this.updateCalendar()

      if (!this.fConfigs.isSeparately) {
        this.calendar.currentDate = currentCalendar.date
        this.initCalendar()
      }

      this.$emit('changedMonth', currentCalendar.date)
}

const  PreYear =(calendarKey = null) =>{
      if (!this.allowPreDate) return false

      const step = this.showYearPicker ? this.fConfigs.changeYearStep : 1

      calendarKey = calendarKey !== null ? calendarKey : 0

      const currentCalendar = this.listCalendars[calendarKey]
      currentCalendar.date = new Date(
        currentCalendar.date.getFullYear() - step,
        currentCalendar.date.getMonth()
      )
      this.updateCalendar()

      if (!this.fConfigs.isSeparately) {
        this.calendar.currentDate = currentCalendar.date
        this.initCalendar()
      }

      this.$emit('changedYear', currentCalendar.date)
}
const  NextYear =(calendarKey = null)=> {
      if (!this.allowNextDate) return false

      const step = this.showYearPicker ? this.fConfigs.changeYearStep : 1

      calendarKey = calendarKey !== null ? calendarKey : 0

      const currentCalendar = this.listCalendars[calendarKey]
      currentCalendar.date = new Date(
        currentCalendar.date.getFullYear() + step,
        currentCalendar.date.getMonth()
      )
      this.updateCalendar()

      if (!this.fConfigs.isSeparately) {
        this.calendar.currentDate = currentCalendar.date
        this.initCalendar()
      }

      this.$emit('changedYear', currentCalendar.date)
}
const  ChooseDate =(date) => {
      let newDate = this.helpCalendar.getDateFromFormat(date)

      if (date === 'today') {
        newDate = new Date()
      }

      this.listCalendars[0].date = this.calendar.currentDate = newDate

      this.updateCalendar()
      this.initCalendar()
}
const  openMonthPicker = (key)=> {
      if (this.fConfigs.changeMonthFunction) {
        this.showMonthPicker = key === this.showMonthPicker ? false : key
        this.showYearPicker = false
      }
}
const  openYearPicker = (key) => {
      if (this.fConfigs.changeYearFunction) {
        this.showYearPicker = key === this.showYearPicker ? false : key
        this.showMonthPicker = false
      }
}
const  pickMonth = (key, calendarKey)=> {
      this.showMonthPicker = false
      if (!this.isSeparately) {
        this.listCalendars.forEach((currentCalendar, index) => {
          const date = currentCalendar.date
          currentCalendar.date = new Date(
            date.getFullYear(),
            key + 1 + index,
            0
          )
          currentCalendar.key += hUniqueID()
        })
      } else {
        const currentCalendar = this.listCalendars[calendarKey]
        const date = currentCalendar.date
        currentCalendar.date = new Date(date.getFullYear(), key + 1, 0)
        currentCalendar.key += hUniqueID()
      }

      const currentCalendar = this.listCalendars[calendarKey]
      this.$emit('changedMonth', currentCalendar.date);
      this.updateCalendar()
}
const  openTimePicker = ()=> {
      this.showTimePicker = true
}
const  pickYear =(year, calendarKey) =>{
      this.showYearPicker = false
      if (!this.isSeparately) {
        this.listCalendars.forEach(currentCalendar => {
          const date = currentCalendar.date
          currentCalendar.date = new Date(year, date.getMonth() + 1, 0)
          currentCalendar.key += hUniqueID()
          this.$emit('changedYear', currentCalendar.date)
        })
      } else {
        const currentCalendar = this.listCalendars[calendarKey]
        const date = currentCalendar.date
        currentCalendar.date = new Date(year, date.getMonth() + 1, 0)
        currentCalendar.key += hUniqueID()
        this.$emit('changedYear', currentCalendar.date)
      }
      this.updateCalendar()
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
      if (this.helpCalendar.checkValidDate(this.calendar.selectedDatesItem)) {
        const date = Object.assign({}, this.defaultDateFormat)
        date.date = this.calendar.selectedDatesItem
        this.calendar.selectedDates.push(date)
        this.calendar.selectedDatesItem = ''
        this.markChooseDays()
      }
}
const  removeFromSelectedDates=(index)=> {
      this.calendar.selectedDates.splice(index, 1)
      this.markChooseDays()
}
const  checkDateRangeEnd =(date) => {
      if (Array.isArray(this.fConfigs.markedDateRange)) {
        return (
          this.fConfigs.markedDateRange.findIndex(range => {
            return range.end === date
          }) !== -1
        )
      }

      return date === this.fConfigs.markedDateRange.end
}
const  checkSelDates = (type, startDate, itemDate, hoverDate)=> {
      const startTime = this.helpCalendar.getDateFromFormat(startDate).getTime()
      const itemTime = this.helpCalendar.getDateFromFormat(itemDate).getTime()
      const hoverTime = this.helpCalendar.getDateFromFormat(hoverDate).getTime()

      const days =
        type === 'min' ? this.fConfigs.minSelDays : this.fConfigs.maxSelDays - 2
      const minTime = days * 1000 * 60 * 60 * 24
      const rightTime = startTime + minTime
      const leftTime = startTime - minTime

      let result
      if (hoverTime > startTime) {
        if (type === 'min')
          result =
            itemTime < rightTime &&
            itemTime > startTime &&
            this.fConfigs.minSelDays
        else
          result =
            itemTime > rightTime &&
            itemTime > startTime &&
            this.fConfigs.maxSelDays
      } else if (hoverTime < startTime) {
        if (type === 'min')
          result =
            itemTime > leftTime &&
            itemTime < startTime &&
            this.fConfigs.minSelDays
        else
          result =
            itemTime < leftTime &&
            itemTime < startTime &&
            this.fConfigs.maxSelDays
      }

      return result
}
const  checkLimits =(value) => {
      if (this.fConfigs.limits) {
        const min = new Date(
          this.helpCalendar.getDateFromFormat(this.fConfigs.limits.min)
        )
        min.setDate(1)
        min.setHours(0, 0, 0, 0)
        const max = new Date(
          this.helpCalendar.getDateFromFormat(this.fConfigs.limits.max)
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
      if (!this.fConfigs.transition) return ''

      let name = ''
      if (this.transitionPrefix === 'left') {
        name = 'vfc-calendar-slide-left'
      } else if (this.transitionPrefix === 'right') {
        name = 'vfc-calendar-slide-right'
      }
      return name
}


watch(
  () => this.enabledDates,
  () => {
    this.fConfigs.enabledDates = this.enabledDates;
  },
  { deep: true }
);
watch(
  () => this.configs.enabledDates,
  () => {
    this.fConfigs.enabledDates = this.configs.enabledDates;
  },
  { deep: true }
);
watch(
  () => this.fConfigs,
  () => {
    this.markChooseDays();
  },
  { deep: true, immediate: true }
);
watch(
  () => this.calendar,
  () => {
    this.markChooseDays();
  },
  { deep: true, immediate: true }
);
watch(
  () => this.calendar.currentDate,
  (value) => {
    this.$emit("input", this.calendar);
    this.checkLimits(value);
  }
);

onMounted(
   this.setConfigs();
  this.initCalendar();

  // show time placeholder
  if (this.displayTimeInput) {
    const timeFormat = this.fConfigs.placeholder.split(' ')[1];
    if (!timeFormat) {
      this.fConfigs.placeholder += ' hh:mm';
    }
  }

  this.popoverElement = this.$refs.popoverElement;
  // Event
  this.popoverElement.addEventListener('focusin', this.onFocusIn);
  this.popoverElement.addEventListener('focusout', this.onFocusOut);
  window.addEventListener('click', this.hideMonthYearPicker, {
    capture: true
  });

  // Reacts to external selected dates
  watch(
    () => this.value,
    value => {
      if (
        typeof value === 'object' &&
        (value.hasOwnProperty('dateRange') ||
          value.hasOwnProperty('selectedDate'))
      ) {
        this.calendar = value;
      } else if (
        typeof value === 'object' &&
        value.hasOwnProperty('multipleDateRange')
      ) {
        this.calendar.multipleDateRange = value.multipleDateRange;
        const lastElement = this.calendar.multipleDateRange[
          Math.max(0, this.calendar.multipleDateRange.length - 1)
        ];
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
    () => this.showCalendar,
    value => {
      if (value) this.$emit('opened');
      else this.$emit('closed');
    },
    { immediate: true, deep: true }
  );
)
onUnmounted(
  ()=>{
        window.removeEventListener('focusin', this.onFocusIn)
    window.removeEventListener('focusout', this.onFocusOut)
    window.removeEventListener('click', this.hideMonthYearPicker)
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
