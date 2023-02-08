export default {
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
    first_day_of_week: {
        type: Number,
        default: 0,
    },
    labels: {
        type: Object,
        default: () => ({
            clearButton: 'Clear value',
            monthSelect: 'Select month',
            nextMonthButton: 'Next month',
            nextYearButton: 'Next year',
            picker: 'Choose date',
            previousMonthButton: 'Previous month',
            previousYearButton: 'Previous year',
            todayButton: 'Show today',
            yearSelect: 'Select year'
        })
    },
    locale: {
        type: String,
        default:  'en-US',
    },
    show_clear_button: {
        type: Boolean,
        default: false,
    },
    show_month_stepper: {
        type: Boolean,
        default: true,
    },
    show_today_button: {
        type: Boolean,
        default: true,
    },
    show_year_stepper: {
        type: Boolean,
        default: true,
    },
    start_date: {
        type: String,
        default: null,
    },
    value: {
        type: Date,
        default: null,
    }
}