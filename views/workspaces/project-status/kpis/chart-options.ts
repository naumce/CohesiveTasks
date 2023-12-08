
export const statusCardChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  // animation: false,
  elements: {
    point: {
      radius: 5,
      borderWidth: 0
    },
    line: {
      borderWidth: 4
    }
  },
  plugins: {
    legend: {
      labels: {
        usePointStyle: true,
        pointStyle: 'circle',
        // pointStyleWidth: 5
      }
    },
  }
  // scales: {
  //   x: {
  //     // display: false,
  //     title: {
  //       display: true
  //     },
  //     grid: {
  //       display: false
  //     }
  //   },
  //   y: {
  //     // display: false,
  //     title: {
  //       display: false
  //     },
  //     grid: {
  //       display: false
  //     },
  //     ticks: {
  //       beginAtZero: true
  //     },
  //     suggestedMin: 0,
  //     suggestedMax: 1
  //   }
  // }
}

export const kpisCardSparkLineOptions= {
  responsive: true,
  maintainAspectRatio: false,
  elements: {
    point: {
      radius: 0,
      borderWidth: 0
    },
    line: {
      borderWidth: 3,
    }
  },

    plugins: {
    legend: {
      display: false,
    },

  },

}