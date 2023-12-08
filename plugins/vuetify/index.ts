import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    themes: {
      light: {
        colors: {
          background: '#EFF5F9',
          primary: '#2045BC',
          secondary: '#4D6AC9',
          success: '#4CAF50',
          warning: '#FF6339',
          warningSecondary:"#FFE6EA",
          grey1: "#455A64",
          grey2: "#99ABB4",
          grey3: "#E6E6E6",
          grey4 :"#F6F6F6",
          grey5: "#EFF5F9",
          green1:"#42B4B4",
          orange1:"#F2AF5C",
          red:"#E54949",
        }
      }
    }
  }
})
export default vuetify
