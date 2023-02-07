<script lang="ts" setup>



methods: {
    checkHiddenElement(elementName) {
      return !this.fConfigs.hiddenElements.includes(elementName)
    },
    onFocusIn() {
      if (this.fConfigs.isModal) {
        this.showCalendar = true
      }
    },
    onFocusOut(e) {
      if (
        this.fConfigs.isModal &&
        !hElContains(this.popoverElement, e.relatedTarget)
      ) {
        return (this.showCalendar = this.showMonthPicker = this.showYearPicker = false)
      }
    },

    hideMonthYearPicker(e) {
      this.$nextTick(() => {
        if (this.showMonthPicker || this.showYearPicker) {
          const key = this.showMonthPicker
            ? this.showMonthPicker - 1
            : this.showYearPicker - 1

          const MYactive = this.$refs.calendars.querySelectorAll(
            `.vfc-content-MY-picker`
          )[key]
          if (MYactive.contains(e.target)) {
            return
          }
          return (this.showMonthPicker = this.showYearPicker = false)
        }
      })
    },

    checkDateRangeStart(date) {
      if (Array.isArray(this.fConfigs.markedDateRange)) {
        return (
          this.fConfigs.markedDateRange.findIndex(range => {
            return range.start === date
          }) !== -1
        )
      }

      return date === this.fConfigs.markedDateRange.start
    },
    cleanRange() {
      if (!this.isMultipleDateRange) {
        this.calendar.dateRange.end = ''
        this.calendar.dateRange.start = ''
        return
      }
      this.calendar.multipleDateRange = []

    }
  }
}
</script>
