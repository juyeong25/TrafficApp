export const DateToString = (date) => {
    return date.getFullYear() + '' + (date.getMonth() + 1).toString().padStart(2, '0') + '' + date.getDate().toString().padStart(2, '0')
}

export const DateTimeToString = (_date, delimiter) => {

    const year = _date.getFullYear()
    const month = (_date.getMonth() + 1).toString().padStart(2, '0')
    const day = _date.getDate().toString().padStart(2, '0')
    const hours = _date.getHours().toString().padStart(2, '0')
    const minutes = _date.getMinutes().toString().padStart(2, '0')
    const seconds = _date.getSeconds().toString().padStart(2, '0')

    const date = [year, month, day].join(delimiter)
    const time = [hours, minutes, seconds].join(':')

    const setTime = date+" "+time

    return setTime
}

export const TimeToString = (_date) =>{
    const hours = _date.getHours().toString().padStart(2, '0')
    const minutes = _date.getMinutes().toString().padStart(2, '0')
    const seconds = _date.getSeconds().toString().padStart(2, '0')
    const time = [hours, minutes, seconds].join(':')
    return time
}