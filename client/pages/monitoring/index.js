import React, {useState, useEffect} from 'react';
import Container from "../../components/Container";
import { Chart as ChartJS, CategoryScale, LinearScale, ArcElement, Tooltip, Legend} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {DateTimeToString} from '../../service/dateToString'
import axios from 'axios'
import io from 'socket.io-client';
import {authCheck} from "../../authCheck";

ChartJS.register(
    CategoryScale,
    LinearScale,
    ArcElement,
    Tooltip,
    Legend,
    ChartDataLabels
)

const socket =  io.connect('http://192.168.1.182:9000/') //'http://14.51.232.120:9000/' 'http://localhost:9000/'
let naverMap = null
const Monitoring = (props) => {

    const [user] = useState(props.userId)
    const [loaded, setLoaded] = useState(false)

    //useState 변수
    const [status, setStatus] = useState([
        {name: '그룹 교차로 개수', total: 8, value: ''},
        {name: '검지기 연결불량 개수', total: 20, value: 1},
        {name: '보행자 버튼 고장 개수', total: 10, value: 1},
        {name: '감응 교차로 개수', total: 8, value: 4}
    ])
    const [time, setTime] = useState() //이벤트 분석 조회 시간
    const [chartData, setChartData] = useState([]) //이벤트 분석 차트 데이터
    const [chartLabels, setChartLabels] = useState([]) //이벤트 분석 차트 라벨
    const [focus, setFocus] = useState({ //지도별 중심 좌표
        lat: 35.96334033513462, lng: 127.02098276357472
    })
    const [mapType, setMapType] = useState('NORMAL') //지도 타입
    const [dataType, setDataType] = useState(0) //0 => 전체모니터링, 1 => 그룹모니터링

    let markers = []
    let infoWindows = []

    //api data
    const [mapList, setMapList] = useState([])
    const [logList, setLogList] = useState([]) //시스템 로그 가공 version
    const [system_msg, setSystem_msg] = useState([])
    const [eventChartData, setEventChartData] = useState([])
    const [groupList, setGroupList] =useState([])
    const [weatherData, setWeatherData] = useState(null)

    //socket data
    const [stsData, setStsData] = useState([]) //STS 데이터

    useEffect(()=>{
        const scriptTag = document.createElement('script')
        scriptTag.src= 'https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=r1c367pze3'
        scriptTag.addEventListener('load', ()=>setLoaded(true))
        document.body.appendChild(scriptTag)

    },[])
    useEffect(async () => {
        if(!loaded) return
        const navermaps = window.naver.maps
        if(navermaps!=null) initMap(null, null)
        getMapList().then(()=>{
            socket.on('STS', (_data)=>{
                let array = []
                _data.map((item, index)=>{
                    const _net = parseInt(item[8].toString(2).padStart(8, '0').slice(5), 2)
                    array.push({
                        id:index,
                        network: item[0] == 0 ? 'OFF' : _net == 1 || _net == 5? '비감응' : '감응',
                        cycle: item[20],
                        sc:item[18]
                    })
                })
                setStsData(array)
            })
        })
        getSystemLog().then(()=>{
            socket.on('newEvent', (_data)=>{
                setSystem_msg(_data)
            })
        }).catch((err)=> console.log(err))
        getEventChartData().catch((err)=>console.error(err))
        getGroupList().catch((err)=>console.error(err))
        getWeatherAPI().catch((err)=>console.error(err))
        return () => {
            socket.off('STS')
            socket.off('newEvent')
        }
    }, [loaded]);
    useEffect(()=>{
    },[logList])
    useEffect(()=>{
        setLogList([system_msg,...logList.slice(0, logList.length-1)])
    },[system_msg])
    useEffect(()=>{
        if(naverMap!=null) SettingMapCenter()
    },[focus])
    useEffect(()=>{
        if(naverMap!=null) SettingMapType()
    },[mapType])
    useEffect(()=>{
        if(mapList.length>0 && naverMap != null){

            if(dataType==0){
                let _status = status
                _status[0].total = mapList.length
                setStatus(_status)
            }

            markers.map((item)=>{ item.setMap(null) })
            markers = []
            infoWindows = []
            //create content
            setFocus({ lat: 35.96334033513462, lng: 127.02098276357472})
            mapList.map((item)=>{
                markers.push(
                    new naver.maps.Marker({
                        position: new naver.maps.LatLng({lat: item.location_lat, lng: item.location_long}),
                        map: naverMap,
                        title: item.location_name,
                        icon: {
                            url: '/service-map-icon.png',
                            size: new naver.maps.Size(50,56),
                            scaledSize: new naver.maps.Size(25, 34),
                            origin: new naver.maps.Point(0, 0),
                            anchor: new naver.maps.Point(10, 35)
                        }

                    })
                )
                infoWindows.push(new naver.maps.InfoWindow({
                    content: `<div style="width: 120px; text-align: center; font-size: 14px;">${item.location_id}번 ${item.location_name}</div>`
                }))
            })


            markers.map((item, index)=>{
                naver.maps.Event.addListener(item, 'click', function(){
                    let marker = markers[index], infoWindow = infoWindows[index]
                    if(infoWindow.getMap()) infoWindow.close()
                    else infoWindow.open(naverMap, marker)
                })
            })

            naver.maps.Event.addListener(naverMap, 'click', function(){
                infoWindows.map((item)=>{item.close()})
            })
        }
    },[mapList])
    useEffect(()=>{
        setTime(DateTimeToString(new Date(), '-'))
        let dataset = []
        let labels =[]

        eventChartData.map((item)=>{
            dataset.push(parseInt(item.cnt))
            labels.push(item.event_name)
        })
        setChartData(dataset.slice(0, 5))
        setChartLabels(labels.slice(0, 5))
    },[eventChartData])
    useEffect(()=>{
    },[groupList])

    async function getMapList(){
        try{
            const response = await axios.get('http://192.168.1.43:3001/locations/listAll')
            setMapList(response.data)
        }catch(error){
            console.error(error)
        }
    }
    async function getEventChartData () {
        try{
            const response = await axios.get('http://192.168.1.43:3001/event-log/today/ranking')
            setEventChartData(response.data)
        }catch(error){
            console.error(error)
        }
    }

    async function getSystemLog(){
        try{
            const response = await axios.get('http://192.168.1.43:3001/event-log/console/logger/20')
            setLogList(response.data)
        }catch (error){
            console.error(error)
        }
    }
    async function getGroupList() {
        try{
            const response = await axios.get('http://192.168.1.43:3001/group/listAll')
            setGroupList(response.data)
        }catch(error){
            console.error(error)
        }
    }
    async function getWeatherAPI(){
        try{
            const response = await axios.get('https://api.openweathermap.org/data/2.5/weather?lat=35.948108&lon=126.96116&appid=ea4f6624c255b53f3932bc278377674c')
            setWeatherData(response.data)
            console.log(response.data)
        }catch(error){
            console.error(error)
        }
    }

    const statusIcon = [
        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="#707070" className="bi bi-map" viewBox="0 0 16 16">
            <path d="M15.817.113A.5.5 0 0 1 16 .5v14a.5.5 0 0 1-.402.49l-5 1a.502.502 0 0 1-.196 0L5.5 15.01l-4.902.98A.5.5 0 0 1 0 15.5v-14a.5.5 0 0 1 .402-.49l5-1a.5.5 0 0 1 .196 0L10.5.99l4.902-.98a.5.5 0 0 1 .415.103zM10 1.91l-4-.8v12.98l4 .8V1.91zm1 12.98 4-.8V1.11l-4 .8v12.98zm-6-.8V1.11l-4 .8v12.98l4-.8z"/>
        </svg>,
        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="#707070" className="bi bi-camera-video-off" viewBox="0 0 16 16">
            <path d="M10.961 12.365a1.99 1.99 0 0 0 .522-1.103l3.11 1.382A1 1 0 0 0 16 11.731V4.269a1 1 0 0 0-1.406-.913l-3.111 1.382A2 2 0 0 0 9.5 3H4.272l.714 1H9.5a1 1 0 0 1 1 1v6a1 1 0 0 1-.144.518l.605.847zM1.428 4.18A.999.999 0 0 0 1 5v6a1 1 0 0 0 1 1h5.014l.714 1H2a2 2 0 0 1-2-2V5c0-.675.334-1.272.847-1.634l.58.814zM15 11.73l-3.5-1.555v-4.35L15 4.269v7.462zm-4.407 3.56-10-14 .814-.58 10 14-.814.58z"/>
        </svg>,
        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="#707070" className="bi bi-camera-video-off" viewBox="0 0 16 16">
            <path d="M10.961 12.365a1.99 1.99 0 0 0 .522-1.103l3.11 1.382A1 1 0 0 0 16 11.731V4.269a1 1 0 0 0-1.406-.913l-3.111 1.382A2 2 0 0 0 9.5 3H4.272l.714 1H9.5a1 1 0 0 1 1 1v6a1 1 0 0 1-.144.518l.605.847zM1.428 4.18A.999.999 0 0 0 1 5v6a1 1 0 0 0 1 1h5.014l.714 1H2a2 2 0 0 1-2-2V5c0-.675.334-1.272.847-1.634l.58.814zM15 11.73l-3.5-1.555v-4.35L15 4.269v7.462zm-4.407 3.56-10-14 .814-.58 10 14-.814.58z"/>
        </svg>,
        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="#707070" className="bi bi-map" viewBox="0 0 16 16">
            <path d="M15.817.113A.5.5 0 0 1 16 .5v14a.5.5 0 0 1-.402.49l-5 1a.502.502 0 0 1-.196 0L5.5 15.01l-4.902.98A.5.5 0 0 1 0 15.5v-14a.5.5 0 0 1 .402-.49l5-1a.5.5 0 0 1 .196 0L10.5.99l4.902-.98a.5.5 0 0 1 .415.103zM10 1.91l-4-.8v12.98l4 .8V1.91zm1 12.98 4-.8V1.11l-4 .8v12.98zm-6-.8V1.11l-4 .8v12.98l4-.8z"/>
        </svg>
    ]
    const colors = ['rgba(239, 79, 79, 1)', 'rgba(255, 141, 65, 1)', 'rgba(255, 206, 84, 1)', 'rgba(72, 207, 173, 1)', 'rgba(39, 156, 200, 1)',]
    const backgroundColors = ['rgba(239, 79, 79, 1)', 'rgba(255, 141, 65, 1)', 'rgba(255, 206, 84, 1)', 'rgba(72, 207, 173, 1)', 'rgba(39, 156, 200, 1)',]
    const chartOptions = {
        responsive: false,
        cutout: 30,
        plugins: {
            legend:{
                display: false,
            }, datalabels: {
                formatter : (value, context) => {
                    return null
                }
            }
        }
    }
    const chartDatasets  = () => {
        return { chartLabels, datasets: [
                {
                    label: '이벤트 분석',
                    data: chartData,
                    backgroundColor: backgroundColors,
                    borderColor: colors,
                    borderWidth: 1,
                }
            ]}
    }
    const setColor = (color) => {
        return {
            backgroundColor: color,
            marginRight: '10px'
        }
    }
    const initMap = (center, type) => {
        const map = new naver.maps.Map('map', {
            center: new naver.maps.LatLng(focus),
            zoom: 13,
            zoomControl: true,
            minZoom: 10,
            maxZoom: 25,
        });
        // const trafficLayer = new naver.maps.TrafficLayer({ interval: 300000 }).setMap(map)
        naverMap = map
    }
    const SettingMapCenter = () => {
        naverMap.panTo(new naver.maps.LatLng(focus))
    }
    const SettingMapType = () => {
        naverMap.setMapTypeId(naver.maps.MapTypeId[mapType])
    }

    const clickMap = (e) =>{
        console.log(e.target.id)
        document.querySelectorAll(".tabs li").forEach((el) => {
            el.classList.remove("active");
        });
        e.target.classList.toggle("active");
        const index = groupList.findIndex((g)=>{return g.group_id == parseInt(e.target.id)})
        if(e.target.id == '0'){
            setFocus({ lat: 35.96334033513462, lng: 127.02098276357472 })
            let _status = status
            _status[0].total = mapList.length
            setStatus(_status)
            setDataType(0)
            document.getElementById('title').innerText='전체교차로모니터링'
        }else {
            setFocus({lat: groupList[index].group_lat, lng: groupList[index].group_long})
            let _status = status
            _status[0].total = groupList[index].location!=undefined ? groupList[index].location.length : 0
            setStatus(_status)
            setDataType(index)
            document.getElementById('title').innerText='그룹교차로모니터링 | ' + groupList[index].group_name
        }
    }
    const changeMapType = (e) => {
        document.querySelectorAll('button.active').forEach((el)=>{
            el.classList.remove("active")
        })
        e.target.classList.toggle('active')
        switch (e.target.innerText){
            case '일반지도' : setMapType('NORMAL'); break;
            case '지형도' : setMapType('TERRAIN'); break;
            case '위성지도' : setMapType('HYBRID'); break;
        }
    }
    const reducer = (acc, curr) => acc+curr

    return (
        <>

            <h3 id={'title'}>전체교차로모니터링</h3>
            <div className={'display-flex'}>
                <div>
                    <div className={'display-flex'}>
                        <Container width={'255px'} height={'100px'} padding={'20px'} margin={'15px 15px 15px 0px'}>
                            {weatherData !== null ?
                                <div>
                                    <div className={'display-flex'}>
                                        <div className={'weather-main-icon'}>
                                            <img src={'http://openweathermap.org/img/wn/'+weatherData.weather[0].icon+'@2x.png'}/>
                                        </div>
                                        <div className={'weather-text'}>
                                            <h2>{(weatherData.main.temp - 273.15).toFixed(2)} ºC</h2>
                                            <h4>{weatherData.name}</h4>
                                        </div>
                                    </div>
                                    <div className={'display-flex'}>
                                        <div className={'weather-icon'}><img src={'/wind.svg'}/><h5>{weatherData.wind.speed}m/s</h5> </div>
                                        <div className={'weather-icon'}><img src={'/moisture.svg'}/><h5>{weatherData.main.humidity}%</h5></div>
                                        <div className={'weather-icon'}><img src={'/cloud.svg'}/><h5>{weatherData.clouds.all}%</h5></div>
                                    </div>
                                </div>
                                : null }
                        </Container>
                        <Container width={'750px'} height={'100px'} padding={'20px'} margin={'15px 0px'}>
                            <div className={'display-flex'}>
                                {
                                    status.map((item, index)=>(
                                        <div className={'statusItem'} key={'status_item_'+index}>
                                            {index === 0 ? null : <div className={'statusLine'}></div>}
                                            <div className={'content'}>
                                                {statusIcon[index]}
                                                <div>
                                                    {index===0 ? <h4>{item.total}</h4>:<h4><span className={'red'}>{item.value}</span>/<span>{item.total}</span></h4>}
                                                </div>
                                                <div>
                                                    <label>{item.name}</label>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </Container>
                    </div>

                    <Container width={'1060px'} height={'618px'} padding={'20px'} margin={'0px'}>
                        <div className={'map-content'}>
                            <ul className={'tabs'}>
                                <li id='0' className='active' onClick={clickMap.bind(this)}>전체</li>
                                { groupList.length > 0 ? groupList.map((item, index)=>(
                                    <li key={'groupTab-'+index} id={item.group_id} onClick={clickMap.bind(this)}>{item.group_name}</li>
                                )):null}
                            </ul>
                            <div className={'mapTypeButtonGroup'}>
                                <button onClick={changeMapType.bind(this)} className={'active'}>일반지도</button>
                                <button onClick={changeMapType.bind(this)}>지형도</button>
                                <button onClick={changeMapType.bind(this)}>위성지도</button>
                            </div>
                            <div className={'map'} id={'map'}></div>
                        </div>
                    </Container>
                </div>
                <div>
                    <Container width={'450px'} height={'160px'} padding={'20px'} margin={'15px 0px 0px 20px'}>
                        <div>
                            <h4 className={'floatLeft box-title'}>이벤트 분석</h4>
                            <h5 className={'chartTime'}>{time}</h5>
                        </div>
                        <div>
                            <table className={'eventChart'}>
                                <thead>
                                <tr>
                                    <th>Top 5</th>
                                    <th>Event Name</th>
                                    <th>Count(percentage)</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <td rowSpan={10}>
                                        <div style={{paddingLeft: '10px', width:'100px' }}>
                                            <Doughnut options={chartOptions} data={chartDatasets} width={120} height={140} />
                                        </div>
                                    </td>
                                </tr>
                                {
                                    chartData.map((item, index)=>(
                                        <tr key={'event-chart-'+index}>
                                            <td style={{textAlign: 'left', padding: '0px 10px'}}><div className={'indexBox'} style={setColor(colors[index])}></div>{chartLabels[index]}</td>
                                            <td style={{textAlign: 'right', padding: '0px 10px'}}>{item}({Math.round(item/chartData.reduce(reducer)*100)}%)</td>
                                        </tr>
                                    ))
                                }
                                <tr>
                                    <th style={{height: '20px'}}>TOTAL</th>
                                    <th>{chartData.length > 0 ? chartData.reduce(reducer) : 0}</th>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </Container>
                    <Container width={'450px'} height={'320px'} padding={'20px'} margin={'20px 0px 0px 20px'}>
                        <h4 className={'box-title'}>전체 교차로 정보</h4>
                        <div className={'dataTable'}>
                            <table>
                                <thead>
                                <tr>
                                    <th colSpan={2}>교차로</th>
                                    <th>온라인</th>
                                    <th>주기</th>
                                    <th>SC</th>
                                </tr>
                                </thead>
                                <tbody>

                                {
                                    socket.connected && stsData.length > 0?
                                        mapList.map((item, index)=>(
                                            <tr key={'data-table-index-'+index}>
                                                <th>{index+1}</th>
                                                <td>{item.location_name}</td>
                                                {
                                                    stsData[index] != undefined ? <td style={stsData[index].network == 'OFF' ? {color: '#707070'} : {color: '#727CF5'}}>{stsData[index].network}</td> : null
                                                }
                                                {
                                                    stsData[index] != undefined ? <td>{stsData[index].cycle}</td> : null
                                                }
                                                {
                                                    stsData[index] != undefined ? <td>{stsData[index].sc}</td> : null
                                                }
                                            </tr>
                                        )) : null
                                }
                                </tbody>
                            </table>
                        </div>
                    </Container>
                    <Container width={'450px'} height={'172px'} padding={'20px'} margin={'20px 0px 0px 20px'}>
                        <h4 className={'box-title'}>시스템 로그</h4>
                        <div className={'logArea'}>
                            <ul className={'log-group'}>
                                {
                                    logList.map((item, index)=>(
                                        <li className={'log-item'} key={'log-item-'+index}>
                                            <div className={'log-title'}>{index===0?<span style={{color: "red"}}>new </span>:null}{
                                                `${item.log_time} ${item.location_id}.${item.location_name} 교차로 이벤트 발생`
                                            }</div>
                                            <div className={'log-text'}>{
                                                `${item.location_id}.${item.location_name}에서 ${item.event_code} ${item.event_status} 이벤트가 발생하였습니다.`
                                            }</div>
                                        </li>
                                    ))
                                }
                            </ul>
                        </div>

                    </Container>
                </div>
            </div>

            <style jsx>{`
              .floatLeft {
                float: left;
              }
              span, h5, h4, h3 {
                color: #707070;
              }
              .red {
                color: red;
              }
              .statusItem {
                display: table-cell;
                text-align: center;
                width: 500px;
                padding-top: 5px;
                padding-bottom: 5px;
              }
              .statusItem .content {
                padding-top: 12px;
              }
              .statusLine {
                height: 90px;
                width: 1px;
                background-color: #E4E7EA;
                float: left;
              }
              .chartTime {
                float: right;
              }
              .indexBox {
                width: 12px;
                height: 12px;
                float: left;
                margin-left: 5px;
              }
              .eventChart th {
                font-size: 14px;
                color: #707070;
                background-color: #FAFAFA;
                border-bottom: 1px solid #EBEBEB;
                text-align: center;
              }
              .eventChart td {
                font-size: 14px;
                color: #707070;
                line-height: 14px;
              }
              .eventChart th:not(:last-child) {
                border-right: 1px solid #EBEBEB;
              }
              .eventChart td:not(:first-child) {
                border-left: 0.1px solid #EBEBEB;
              }
              label {
                font-weight: bold;
                font-size: 14px;
                color: #707070;
              }
              .tabs {
                display: table;
                table-layout: fixed;
                width: 70%;
                -webkit-transform: trasnlateY(2px);
                transform: translateY(2px);
                z-index: 0;
                top: -9px;
              }
              .tabs li:hover {
                color: rgb(194, 194, 194)
              }
              .tabs > li {
                transition-duration: .25s;
                display: table-cell;
                list-style: none;
                text-align: center;
                padding: 10px 10px 10px 10px;
                position: relative;
                overflow: hidden;
                cursor: pointer;
                color: #707070;
                border: 0.1px solid #EBEBEB;
              }
              .tabs > li::before {
                z-index: -1;
                position: absolute;
                content: "";
                width: 100%;
                height: 100%;
                top: 0;
                left: 0;
                background-color: #293042;
                -webkit-transform: translateY(100%);
                transform: translateY(100%);
                transition-duration: .25s;
                box-shadow: 2px -2px black;
              }
              .tabs .active {
                color: white;
              }
              .tabs .active::before {
                transition-duration: .5s;
                background-color: #293042;
                -webkit-transform: translateY(0);
                transform: translateY(0);
              }
              .tabs .active:hover {
                color: #dbdbdb;
              }
              .mapTypeButtonGroup {
                float: right;
                margin-top: -30px;
                right: 0px;
              }
              .map {
                width: 1060px;
                height: 570px;
                margin-top: -2px;
              }
              .map-content{
                position: relative;
              }
              .dataTable {
                height: 280px;
                overflow: auto;
                text-align: center;
                font-weight: bold;
                border-collapse: collapse;
              }
              .dataTable th {
                color: #707070;
                background-color: #FAFAFA;
                height: 40px;
                font-size: 17px;
                border-bottom: 1px solid #DEDEDE;
              }
              .dataTable th:not(:last-child){
                border-right: 1px solid #DEDEDE;
              }
              .dataTable th:first-child {
                padding: 0px 10px;
              }
              .dataTable td {
                font-size: 14px;
                border-bottom: 1px solid #DEDEDE;
              }
              .dataTable td:not(:last-child){
                border-right: 1px solid #DEDEDE;
              }
              .dataTable td:nth-child(3) {
                color: #727CF5;
              }
              .dataTable td:not(:nth-child(3)) {
                color: black;
              }
              .display-flex {
                display: flex;
              }
              .box-title {
                margin-bottom: 4px;
              }
              .logArea {
                height: 130px;
                overflow: auto;
                position: relative;
                color: #707070;
              }
              .log-title {
                font-size: 14px;
                font-weight: bold;
                margin-left: 25px;
              }
              .log-text {
                font-size: 13px;
                margin-left: 25px
              }
              .log-item {
                margin-bottom: 20px;
              }
              .log-group::before {
                height: 1000px;
                background: #DCDCDC;
                left: 9px;
                width: 2px;
              }
              .log-group::before, .log-item::before {
                content: "";
                display: inline-block;
                position: absolute;
                z-index: 1;
              }
              .log-item:not(:first-child)::before {
                background: #fff;
                border: 3px solid #3f80ea;
                border-radius: 50%;
                height: 11px;
                left: 2px;
                width: 11px;
              }
              .log-item::before {
                background: #fff;
                border: 3px solid #3f80ea;
                border-radius: 50%;
                height: 13px;
                left: 0px;
                width: 13px;
              }
              .weather-icon{
                width: 150px;
                height: 25px;
                margin-right: 0px;
                margin-left: 10px;
                text-align: center;
              }
              .weather-icon img{
                width: 25px;
              }
              .weather-text{
                text-align: right;
              }
              .weather-main-icon{
                width: 130px;
              }
              .weather-main-icon img{
                width: 60px;
                height: 60px;
                margin-left: 40px;
              }
            `}</style>
        </>
    );
};
export async function getServerSideProps(context) {
    return authCheck(context)
}


export default Monitoring;
