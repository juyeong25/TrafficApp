import Container from "../../components/Container";
import DatePickerButton from "../../components/DatePickerButton";
import {DateToString} from "../../service/dateToString";
import { useEffect, useState } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, ArcElement, Tooltip, Legend} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import Image from "next/image";

import axios from 'axios'
import {authCheck} from "../../authCheck";

ChartJS.register(
    CategoryScale,
    LinearScale,
    ArcElement,
    Tooltip,
    Legend,
)

const EventLog = () => {

    const [startDate, setStartDate] = useState()
    const [endDate, setEndDate] = useState()
    const [eventCode, setEventCode] = useState([]) //number group
    const [eventList, setEventList] = useState([])
    const [checkCode, setCheckCode] = useState([])
    const [mapList, setMapList] = useState([])
    const [checkMap, setCheckMap] = useState([])
    const [groupList, setGroupList] = useState([])

    const [pageIndex, setPageIndex] = useState(0)
    const [maxIndex, setMaxIndex] = useState(1)

    let labels = []
    let chartData = []

    useEffect(() => {
        getEventCode().catch((err)=> console.log(err))
        getMapList().catch((err)=>console.log(err))
        getGroupList().catch((err)=>console.log(err))
    }, []);
    useEffect(()=>{
        eventDatasets()
        console.log(eventList)
        setMaxIndex(Math.ceil(eventList.length/24))

        if(eventList.length > 0){
            const checkBoxGroup = document.getElementsByClassName('code-list')[0].querySelectorAll("input[type='checkbox']")
            checkBoxGroup.forEach((e=>{e.checked = false}))
            let _data = eventList.map((item)=>{return item.event_code})
            _data = _data.filter((el, index)=>{return _data.indexOf(el) === index}) //중복제거
            const code_list = _data.map((item, index) =>{return eventCode.filter((e)=>{return e.event_name == item})[0].event_code})
            console.log(code_list)
            code_list.map((item)=>{
                if(item != 99)  checkBoxGroup[item].checked = true
                else checkBoxGroup[checkBoxGroup.length-1].checked = true
            })

            setCheckCode(code_list)
        }
    },[eventList])
    useEffect(()=>{
        console.log(checkCode)
    },[checkCode])
    useEffect(()=>{
    },[mapList])
    useEffect(()=>{
    },[checkMap])
    useEffect(()=>{},[groupList])

    {/*api*/}
    async function getEventCode(){
        try{
            const response = await axios.get('http://192.168.1.43:3001/event-code/listAll')
            setEventCode(response.data)
            console.log(response.data)
        }catch (error){
            console.error(error)
        }
    }
    async function getEventList(){
        try{
            let url = 'http://192.168.1.43:3001/event-log/'
            url = url + DateToString(startDate)
            url = url+'/'+ DateToString(endDate) + '/locations/listAll'
            if(checkMap.length > 0){
                url = url+'?location_id='
                checkMap.map((item, index)=>{
                    url = index == checkMap.length-1 ? url+item : url+item+','
                })
            }
            if(checkCode.length > 0){
                url = url + '&event_code='
                checkCode.map((item, index)=>{
                    url = index == checkCode.length-1 ? url+item : url+item+','
                })
            }
            console.log(url)
            const response = await axios.get(url)
            setEventList(response.data)
        }catch (error){
            console.error(error)
            console.log(error)
            if(checkMap.length == 0)
                alert('교차로를 선택해주세요.')
        }
    }
    async function getMapList(){
        try{
            const response = await axios.get('http://192.168.1.43:3001/locations/listAll')
            setMapList(response.data)
        }catch (error){
            console.error(error)
        }
    }

    async function getGroupList(){
        try {
            const response = await axios.get('http://192.168.1.43:3001/group/listAll')
            setGroupList(response.data)
            console.log(response.data)
        }catch (e) {
            console.error(e)
        }
    }

    {/*chechBox onClick Event*/}
    const updateCodeCheckList = (content) => {
        content.target.checked ? setCheckCode([...checkCode, parseInt(content.target.value)]) : setCheckCode(checkCode.filter((e)=> e!== parseInt(content.target.value)))
    }
    const updateMapCheckList = (content) =>{
        content.target.checked ? setCheckMap([...checkMap, parseInt(content.target.value)]) : setCheckMap(checkMap.filter((e)=>e!==parseInt(content.target.value)))
    }
    const updateGroupClick = async (content) => {
        const checkbox = document.getElementById(content.target.id).parentNode.querySelectorAll('.mapListItem')
        let listArray = checkMap.slice()
        if(content.target.checked){
            checkbox.forEach((e=>{
                e.querySelectorAll("input[type='checkbox']").forEach((item=>{
                    item.checked = true
                    if(listArray.find(e=>e==parseInt(item.value))==undefined){
                        listArray.push(parseInt(item.value))
                    }
                }))
            }))
        }else {
            checkbox.forEach((e=>{
                e.querySelectorAll("input[type='checkbox']").forEach((item=>{
                    item.checked = false
                    listArray = listArray.filter(x=>{return x !== parseInt(item.value)})
                }))
            }))
        }

        setCheckMap(listArray)

    }

    {/*chart*/}
    const colors = ['rgba(239, 79, 79, 1)', 'rgba(255, 141, 65, 1)', 'rgba(255, 206, 84, 1)', 'rgba(72, 207, 173, 1)', 'rgba(39, 156, 200, 1)',]
    const backgroundColors = ['rgba(239, 79, 79, 1)', 'rgba(255, 141, 65, 1)', 'rgba(255, 206, 84, 1)', 'rgba(72, 207, 173, 1)', 'rgba(39, 156, 200, 1)',]
    const chartOptions = {
        responsive: false,
        cutout: 35,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    boxWidth: 5,
                    boxHeight: 5,
                }
            },
            datalabels: {
                formatter : (value, context) => {
                    return ''
                }
            }
        }
    }
    const dataCount = () => {
        const _data = eventList.map((item)=>{return item.event_code})
        let newArray = []
        let sortArray = []
        _data.forEach((element=>{newArray[element] = (newArray[element]||0)+1}))
        for(let e in newArray){
            sortArray.push([e, newArray[e]])
        }
        sortArray.sort((a,b)=>{return b[1]-a[1]})
        sortArray = sortArray.slice(0,5)
        labels = sortArray.map((item)=>{return item[0]})
        chartData = sortArray.map((item)=>{return item[1]})
    }
    const eventDatasets = () => {
        const label = '이벤트 분석 차트'
        dataCount()
        return {labels, datasets: [{
                label: label,
                data: chartData,
                backgroundColor: backgroundColors,
                borderColor: colors,
                borderWidth: 1,
            }]}
    }

    {/*chart table*/}
    const chartDataTable = () => {
        let returnArray = []

        labels.map((item, index)=>{
            returnArray.push(
                <tr key={'chart-data-table-tr-'+index}>
                    <th>{index+1}</th>
                    <td>{item}</td>
                    <td>{chartData[index]}</td>
                </tr>
            )
        })
        return returnArray
    }

    {/*index + dataTable*/}
    const createIndex = () => {
        let index_array =[]
        let index = []
        if((10*Math.floor(pageIndex/10))+10 > maxIndex){
            for(let i = (10*Math.floor(pageIndex/10)); i < maxIndex; i++){
                if(i == (10*Math.floor(pageIndex/10))){
                    index_array.push(<li className={'index-button active'} key={'index-button-'+(i+1)} onClick={changeIndex.bind(this)} id={'pageIndex_'+i}>{i+1}</li>)
                }else {
                    index_array.push(<li className={'index-button'} key={'index-button-'+(i+1)} onClick={changeIndex.bind(this)} id={'pageIndex_'+i}>{i+1}</li>)
                }
            }
        }else {
            for(let i = (10*Math.floor(pageIndex/10)); i < (10*Math.floor(pageIndex/10))+10; i++){
                if(i == (10*Math.floor(pageIndex/10))){
                    index_array.push(<li className={'index-button active'} key={'index-button-'+(i+1)} onClick={changeIndex.bind(this)} id={'pageIndex_'+i}>{i+1}</li>)
                }else {
                    index_array.push(<li className={'index-button'} key={'index-button-'+(i+1)} onClick={changeIndex.bind(this)} id={'pageIndex_'+i}>{i+1}</li>)
                }
            }
        }

        if(maxIndex>10){
            index_array.unshift(<li key={'index_list_update_prevButton'} className={'index-list-update-button'} onClick={IndexListUpdateButton.bind(this)} id={'prevButton'}>◁</li>)
            index_array.push(<li key={'index_list_update_nextButton'}  className={'index-list-update-button'} onClick={IndexListUpdateButton.bind(this)} id={'nextButton'}>▷</li>)
        }

        index.push(<ul key={'index-button-group'} style={index_list_group_style}>{index_array}</ul>)
        return index
    }
    const IndexListUpdateButton = (listUpdateButton) => {
        if(listUpdateButton.target.id === 'prevButton'){
            if(10*Math.floor(pageIndex/10) != 0){
                setPageIndex(10*Math.floor(pageIndex/10) - 10)
            }
            console.log(10*Math.floor((pageIndex/15)))
        }else if(listUpdateButton.target.id === 'nextButton') {
            if(10*Math.floor(pageIndex/10)+10 < maxIndex){
                setPageIndex(10*Math.floor(pageIndex/10) + 10)
            }
        }
    }
    const changeIndex = (indexItem) => {
        setPageIndex(parseInt(indexItem.target.id.split('_')[1]))
        document.querySelectorAll(".index-button").forEach((el) => {
            el.classList.remove("active");
        });
        indexItem.target.classList.add('active')
    }
    const index_list_group_style={
        display: 'flex',
        justifyContent: 'center',
        marginTop: '10px',
        fontSize: '13px'
    }

    const ShowEventListTable = () => {
        let returnArray = []
        const max = (Math.ceil(eventList.length/24)) - 1
        const startNumber = max < pageIndex ? 0 :  pageIndex * 24
        if(eventList.length!==0){
            if(pageIndex == max || max < pageIndex){
                for(let i = startNumber ; i < eventList.length; i++){
                    returnArray.push(
                        <tr key={'data-list-tr-'+i}>
                            <th>{i+1}</th>
                            <td>{eventList[i].log_time}</td>
                            <td></td>
                            <td>{eventList[i].location_id}</td>
                            <td>{eventList[i].event_code}</td>
                            <td>{eventList[i].event_status}</td>
                        </tr>
                    )
                }
            }else {
                for(let i = startNumber ; i < startNumber + 24; i++){
                    returnArray.push(
                        <tr key={'data-list-tr-'+i}>
                            <th>{i+1}</th>
                            <td>{eventList[i].log_time}</td>
                            <td></td>
                            <td>{eventList[i].location_id}</td>
                            <td>{eventList[i].event_code}</td>
                            <td>{eventList[i].event_status}</td>
                        </tr>
                    )
                }

            }
        }
        return returnArray
    }

    const exportCSVData = () =>{
        if(eventList.length>0){
            let text = ''
            text += 'no,log_time,device,id,event_name,event_status\r\n'
            eventList.map((item, index)=>{
                text += (index+1)+','+item.log_time+',,'+item.location_id+','+item.event_code+','+item.event_status+'\r\n'
            })
            const downloadLink = document.createElement('a')
            const blob = new Blob([text], {type:'text/csv;charset=utf-8'})
            const url = URL.createObjectURL(blob)
            downloadLink.href = url
            downloadLink.download = 'data.csv'
            downloadLink.click()
        }else {
            alert('데이터 조회 후 사용해주세요.')
        }
    }
    const exportGraphImage = () => {
        if(eventList.length>0){
            const canvas = document.querySelector('canvas')
            const image = canvas.toDataURL()
            const link = document.createElement('a')
            link.href = image;
            link.download = 'eventGraph'
            link.click()
        }else {
            alert('데이터 조회 후 사용해주세요.')
        }
    }

    return <>
        <h3>이벤트분석/조회</h3>
        <Container width={'1570px'} height={'772px'} margin={'15px 0px 0px 0px'} padding={'20px'}>
            <div className={'select-container'}>
                <h4>시작일</h4>
                <div key={'startDatePicker'}> <DatePickerButton startpicker={'true'} start_date={startDate} end_date={endDate} date_update={setStartDate}/> </div>
                <h4>종료일</h4>
                <div key={'endDatePicker'}> <DatePickerButton startpicker={'false'} start_date={startDate} end_date={endDate} min_date={startDate} date_update={setEndDate}/> </div>
                <button onClick={getEventList}>조회</button>
                <div style={{marginLeft: 'auto'}}>
                    <button onClick={exportCSVData}>CSV내보내기</button>
                    <button onClick={exportGraphImage}>그래프저장</button>
                </div>
            </div> {/*select area*/}
            <div className={'content'}>
                <div className={'code-list'}>
                    {/*code*/}
                    <h4>Event Code</h4>
                    {
                        eventCode.map((item, index)=>(<div key={'code-list-checkbox-item-'+index}>
                            <input type={'checkbox'} id={'code-list-checkbox-'+index} value={item.event_code} onClick={updateCodeCheckList}/>
                            <label htmlFor={'code-list-checkbox-'+index}>{item.event_code}. {item.event_name}</label>
                        </div>))
                    }
                </div>
                <div className={'intersection-list'}>
                    {/*교차로 리스트*/}
                    <h4>교차로 리스트</h4>
                    {
                        groupList.map((item, index)=>(
                            <div key={'group-list-'+index}>
                                <input type={'checkbox'} id={'group-checkbox-'+index} value={item.group_id} onClick={updateGroupClick} />
                                <label htmlFor={'group-checkbox-'+index}>{item.group_id}번 {item.group_name}</label>
                                {
                                    item.location.map((mapItem, mapIndex)=>(
                                        <div key={'group-'+index+'-mapItem-'+mapIndex} className={'mapListItem'}>
                                            <Image src={'/arrow-return-right.svg'} width={15} height={22} />
                                            <input type={'checkbox'} id={'mapList-item-checkbox-'+index+'-'+mapIndex} value={mapItem.location_id} onClick={updateMapCheckList}/>
                                            <label htmlFor={'mapList-item-checkbox-'+index+'-'+mapIndex}>{mapItem.location_id}. {mapItem.location_name}</label>
                                        </div>
                                    ))
                                }
                            </div>
                        ))
                    }
                </div>
                <div className={'data-view'}>
                    <div className={'data-list'}>
                        {/*list*/}
                        <table>
                            <thead>
                                <tr>
                                    <th>LOG_NO</th>
                                    <th>로그시간</th>
                                    <th>DEVICE</th>
                                    <th>ID</th>
                                    <th>EVENT_NAME</th>
                                    <th>EVENT_STATUS</th>
                                </tr>
                            </thead>
                            <tbody>
                            {
                                eventList.length !== 0 ? ShowEventListTable() : null
                            }
                            </tbody>
                        </table>
                        <div>
                            {createIndex()}
                        </div>
                    </div>
                    <div className={'data-chart'}>
                        {/*chart*/}
                        <Doughnut options={chartOptions} data={eventDatasets()} width={400} height={300}/>
                        {/*table*/}
                        <table>
                            <thead>
                                <tr>
                                    <th>Index</th>
                                    <th>Event Name</th>
                                    <th>Count</th>
                                </tr>
                            </thead>
                            <tbody>
                                {chartDataTable()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Container>
        <style jsx>{`
          h3, h4{
            color: #707070;
          }
          .select-container{
            display: flex;
            align-items: center;
          }
          .select-container h4{
            margin-right: 10px;
          }
          .content{
            display: flex;
            width: 100%;
            height: 95%;
            margin-top: 10px;
          }
          .code-list{
            width: 12%;
            height: 95%;
            box-shadow: 2px 2px .1px #DADBDE inset;
            margin-right: 20px;
            padding: 20px;
            overflow: auto;
          }
          .code-list label, .intersection-list label{
            font-size: 13px;
          }
          .code-list h4, .intersection-list h4{
            margin-bottom: 10px;
          }
          .intersection-list{
            width: 12%;
            height: 95%;
            box-shadow: 2px 2px .1px #DADBDE inset;
            margin-right: 20px;
            padding: 20px;
            overflow: auto;
          }
          .data-view{
            width: 75%;
            height: 100%;
            box-shadow: 2px 2px .1px #DADBDE inset;
            display: flex;
          }
          .data-list{
            width: 65%;
            height: 95%;
            margin-right: 20px;
            padding: 20px;
          }
          .data-chart{
            width: 35%;
            height: 95%;
            padding: 20px;
            text-align: center;
            border: 1px solid #DEDEDE;
          }
          .data-list table{
            border-collapse: collapse;
            text-align: center;
            color: #707070;
            font-size: 13px;
          }
          .data-list th{
            background-color: #FAFAFA;
            padding: 4px 5px;
          }
          .data-list th:not(:last-child){
            border-right: 1px solid #DEDEDE;
          }
          .index-list{
            display: flex;
          }
          .index-list li{
            list-style:none;
          }
          .data-chart table{
            margin-top: 20px;
            border-collapse: collapse;
            font-size: 13px;
          }
          .mapListItem{
            display: flex;
            margin-left: 5px;
          }
          
        `}</style>
    </>
};
export async function getServerSideProps(context) {
    return authCheck(context)
}
export default EventLog;
