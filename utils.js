import moment from 'moment'

function formatRut(rut) {
  var valor = rut.replace(/[.-]/g, '')
  valor = valor.replace(/^(\d{1,2})(\d{3})(\d{3})(\w{1})$/, '$1.$2.$3-$4')
  return valor
}

function yearsOld(date_of_birth) {
  var yearsOld = null
  if (date_of_birth == null) {
    yearsOld = 0
  } else {
    date_of_birth = moment(date_of_birth)
    const today = moment()
    yearsOld = today.diff(date_of_birth, 'years')
  }
  return yearsOld
}

function renderMoneystr(value) {
  if (value < 0) {
      value = value.toString()
      value = value.replace(/[^0-9]/g, '')
      value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
      value = '$ -' + value
      return value
  } else {
      value = value.toString()
      value = value.replace(/[^0-9]/g, '')
      value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
      value = '$ ' + value
      return value
  }
}

function moneyToInt(value) {
  value = value.replace(/\D/g,'')
  value = parseInt(value)
  return value
}


export { formatRut, yearsOld, renderMoneystr, moneyToInt }