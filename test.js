const bonjour = require('bonjour')()

bonjour.find({ type: 'signaldock' }, (service) => {
  console.log(service)
})