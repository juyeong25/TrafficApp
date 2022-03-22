import React, {useState, useEffect, forwardRef} from 'react'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css";

function DatePickerButton (props) {
    const [date, setDate] = useState(new Date())
    const [isCalendarOpen, setIsCalendarOpen] = useState(false)

    useEffect(()=>{
        props.date_update(date)
    },[date])
    const DownIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-caret-down-fill float-right" viewBox="0 0 16 16">
            <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
        </svg>
    )
    const UpIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-caret-up-fill float-right" viewBox="0 0 16 16">
            <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z"/>
        </svg>
    )

    const DatePickerButtonItem = forwardRef(({value, onClick}, ref) => (
        <div className={'datePicker'} style={DatePickerStyle} onClick={onClick} ref={ref}>
            {value.split('/')[2]+'년 '+value.split('/')[0]+'월 '+value.split('/')[1]+'일'}
            {isCalendarOpen ? <UpIcon /> : <DownIcon />}
        </div>
    ))
    DatePickerButtonItem.displayName='DatePickerButtonItem'

    const DatePickerStyle = {
        padding: '4px 12px',
        marginRight: '10px',
        border: '2px solid #707070',
        borderRadius: '5px',
        width: '130px',
        fontSize: '14px',
        fontWeight: 'bold',
        display: 'flex',
        cursor: 'pointer',
        color: '#707070',
    }

    const handleCalendarClose = () => {setIsCalendarOpen(false)}
    const handleCalendarOpen = () => {setIsCalendarOpen(true)}

    const startPicker = () => {
        return <DatePicker
            selected={props.start_date}
            onChange={props.date_update}
            onCalendarClose={handleCalendarClose}
            onCalendarOpen={handleCalendarOpen}

            startDate={props.start_date}
            endDate={props.end_date}
            minDate={props.min_date}
            maxDate={new Date()}
            customInput={<DatePickerButtonItem value={date} onClick={()=>{}} />}
        />
    }
    const endPicker = () => {
        return <DatePicker
            selected={props.end_date}
            onChange={props.date_update}
            onCalendarClose={handleCalendarClose}
            onCalendarOpen={handleCalendarOpen}

            startDate={props.start_date}
            endDate={props.end_date}
            minDate={props.min_date}
            maxDate={new Date()}
            customInput={<DatePickerButtonItem value={date} onClick={()=>{}} />}
        />
    }

    return (
        <>
            {props.startpicker === 'true' ? startPicker():endPicker()}
        </>

    )

}


export default DatePickerButton;