import {useState, useEffect} from 'react'
import {useRouter} from "next/router";
import Container from "../../components/Container";
import Image from "next/image";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, ArcElement, LineElement, Title, Tooltip, Legend, Filler} from 'chart.js'
import { Line, Doughnut } from 'react-chartjs-2'
import ChartDataLabels from 'chartjs-plugin-datalabels';
import axios from 'axios'
import io from 'socket.io-client';
import {DateToString} from "../../service/dateToString";
import {authCheck} from "../../authCheck";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    ArcElement,
    LineElement,
    Filler,
    Title,
    Tooltip,
    Legend,
    ChartDataLabels,
)

const socket =  io.connect('http://192.168.1.182:9000/')
let naverMap = null
let markers = []
let detectorMarker = []

const IntersectionMonitoring = () => {

    const router = useRouter()
    const { id } = router.query

    const [loaded, setLoaded] = useState(false)

    const [mapType, setMapType] = useState('NORMAL') //지도 타입
    const [focus, setFocus] = useState({ //지도별 중심 좌표
        lat: 37.394718922846614, lng: 126.96896125393958
    })
    const [overview, setOverview] = useState(false)

    const [groupIndex, setGroupIndex] = useState(1)
    const [mapIndex, setMapIndex] = useState(1)

    //api data
    const [mapList, setMapList] = useState([])
    const [groupList, setGroupList] = useState([])
    const [mapData, setMapData] = useState([])
    const [movementIcon, setMovementIcon] = useState(null)
    const [detectorIcon, setDetectorIcon] = useState([])

    //graph data
    const [detectLog, setDetectLog] = useState([])


    const [stsData, setStsData] = useState()



    useEffect(()=>{
        const scriptTag = document.createElement('script')
        scriptTag.src= 'https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=r1c367pze3'
        scriptTag.addEventListener('load', ()=>setLoaded(true))
        document.body.appendChild(scriptTag)

    },[])
    useEffect(() => {
        if(!loaded) return
        naverMap = window.naver.maps
        if(naverMap!=null) initMap()
        getMapListAPI().catch((e)=>{console.error(e)})
        getMapDataAPI(mapIndex).catch((e)=>{console.error(e)})
        getGroupListAPI().catch((e)=>{console.error(e)})
        getDetectLogAPI().catch((e)=>{console.error(e)})
        getMovementAPI().catch((e)=>{console.error(e)})
        getDetectorDataAPI().catch((e)=>{console.error(e)})

        socket.on('STS', (_data)=>{
            setStsData(_data)
        })
        return()=>{
            socket.off('STS')
        }
    }, [loaded]);
    useEffect(()=>{
    },[mapList])
    useEffect(()=>{
        if(mapData && loaded){
            setFocus({lat: mapData.location_lat,  lng: mapData.location_long})
        }
    },[mapData])
    useEffect(()=>{
        getMovementAPI().catch((e)=>{console.error(e)})
    },[groupIndex, mapIndex])
    useEffect(()=>{},[groupList])
    useEffect(()=>{
        if(movementIcon != null) {
            removeMarkers()
            createMarkers()
        }
    }, [stsData])
    useEffect(()=>{if(loaded) SettingMapType() },[mapType])
    useEffect(()=>{if(loaded) SettingMapCenter()},[focus])
    useEffect(()=>{
    },[detectLog])
    useEffect(()=>{
        if(detectorIcon.length>0){
            detectorMarker.map((item)=>{item.setMap(null)})
            detectorMarker = []
            detectorIcon.map((item)=>{
                detectorMarker.push(
                    new naver.maps.Marker({
                        position: new naver.maps.LatLng({lat: item.camera_latitude, lng: item.camera_longitude}),
                        map: naverMap,
                        title: 'detectorIcon_'+item.detector_channel,
                        icon: {
                            content: [
                                `<img style="position: absolute; width: 52px; height: 70px; transform: rotate(${item.camera_angle}deg)" src="/signal_icon_gray.png"/>`
                            ].join(''),
                            size: new naver.maps.Size(40,55),
                            scaledSize: new naver.maps.Size(40,55),
                            origin: new naver.maps.Point(0,0),
                            anchor: new naver.maps.Point(30,40)
                        }
                }))
            })
        }
    },[detectorIcon])


    async function getMapListAPI(){
        try{
            const response = await axios.get('http://192.168.1.43:3001/locations/listAll')
            setMapList(response.data)
        }catch (e) {
            console.error(e)
        }
    }
    async function getMapDataAPI(index){
        try{
            const url = 'http://192.168.1.43:3001/locations/read/'+index
            const response = await axios.get(url)
            setMapData(response.data)
        }catch (e) {
            console.error(e)
        }
    }
    async function getGroupListAPI() {
        try{
            const response = await axios.get('http://192.168.1.43:3001/group/listAll')
            setGroupList(response.data)
        }catch (e) {
            console.error(e)
        }
    }
    async function getDetectLogAPI() {
        try{
            const url = 'http://192.168.1.43:3001/detect-log/'+DateToString(new Date())+'/'+DateToString(new Date())+'/'+mapIndex+'/listAll'
            const response = await axios.get(url)
            setDetectLog(response.data)
        }catch (e) {
            console.error(e)
        }
    }
    async function getMovementAPI() {
        try {
            const url = 'http://192.168.1.43:3001/phase/read/phases/location/'+mapIndex
            const response = await axios.get(url)
            setMovementIcon(response.data)
        }catch (e){
            console.error(e)
        }
    }
    async function getDetectorDataAPI() {
        try {
            const url = 'http://192.168.1.43:3001/detector/getList/location/'+mapIndex
            const response = await axios.get(url)
            setDetectorIcon(response.data)
        }catch (e){
            console.error(e)
        }
    }

    //검지기 그래프
    const DetectChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
                maxHeight: 20,
                labels: {
                    boxWidth: 5,
                }
            },
            datalabels: {
                display: false,
            }
        },
        elements: {
            point: {
                radius: 0,
            }
        },
        scales: {
            xAxis:{
                display: false,
            },
            'y-left':{
                type: 'linear',
                position: 'left',
                title: {
                    display: false,
                    text: 'Y Axis Left'
                },
                grid: {
                    display: false
                }
            },
            'y-right':{
                type: 'linear',
                position: 'right',
                title: {
                    display: false,
                    text: 'Y Axis right'
                },
                grid: {
                    display: false
                }
            }
        },
    }
    const DetectChartDatasets = () => {

        const labels = detectLog.map((item)=>{return item.log_time})
        let JsonArray = []
        let data = []
        let prevData = 0
        JsonArray[0] = detectLog.map((item)=>{return item.occ_1})
        JsonArray[1] = detectLog.map((item)=>{ return item.occ_2 })
        JsonArray[2] = detectLog.map((item, index)=>{
            prevData = index === 0 ? item.vol_1 : item.vol_1 + prevData
            return prevData
        })
        JsonArray[3] = detectLog.map((item, index)=>{
            prevData = index === 0 ? item.vol_2 : item.vol_2 + prevData
            return prevData
        })
        for(var i = 0; i<JsonArray.length;i++){
            data[i] = JsonArray[i].map((item, index)=>{ return index === 0? item:item+JsonArray[i][index-1]})
        }

        return {labels, datasets: [
                {
                    label: 'vol_1',
                    yAxisID: 'y-left',
                    data: data[2],
                    borderColor: 'rgb(25, 170, 222)',
                    backgroundColor: 'rgba(25, 170, 222, 0.5)',
                    borderWidth: 1,
                }, {
                    label: 'vol_2',
                    yAxisID: 'y-left',
                    data: data[3],
                    borderColor: 'rgb(29, 228, 189)',
                    backgroundColor: 'rgba(29, 228, 189, 0.5)',
                    borderWidth: 1,
                },
                {
                    label: 'occ_1',
                    yAxisID: 'y-right',
                    data: data[0],
                    borderColor: 'rgb(239, 126, 50)',
                    backgroundColor: 'rgba(239, 126, 50, 0.5)',
                    borderWidth: 1,
                }, {
                    label: 'occ_2',
                    yAxisID: 'y-right',
                    data: data[1],
                    borderColor: 'rgb(231, 227, 78)',
                    backgroundColor: 'rgba(231, 227, 78, 0.5)',
                    borderWidth: 1,
                },

            ]}
    }

    //현시 그래프
    const PhaseChartOptions = {
        responsive: false,
        cutout: 35,
        plugins: {
            legend: {
                display: true,
                position: 'left',
                labels: {
                    boxWidth: 5,
                    boxHeight: 5,
                },
            },
            datalabels: {
                formatter : (value, context) => {
                    return value
                },
                color: 'black'
            }
        }
    }
    const PhaseChartDatasets = () => {

        const label = '주기'
        let labels = []
        let data = []
        let count = 1
        for(let i = 43; i<50;i++){
            if(stsData[mapIndex-1][i] != 0){
                data.push(stsData[mapIndex-1][i])
                labels.push(count+'현시')
            }
            count ++;
        }

        const backgroundColor = ['rgba(239, 79, 79, 1)', 'rgba(255, 141, 65, 1)', 'rgba(255, 206, 84, 1)', 'rgba(72, 207, 173, 1)', 'rgba(39, 156, 200, 1)',]
        const borderColor = ['rgba(239, 79, 79, 1)', 'rgba(255, 141, 65, 1)', 'rgba(255, 206, 84, 1)', 'rgba(72, 207, 173, 1)', 'rgba(39, 156, 200, 1)',]

        return { labels, datasets: [{
                label: label,
                data: data,
                backgroundColor: backgroundColor,
                borderColor: borderColor,
                borderWidth: 1,
            }]}
    }

    //map
    const initMap = () => {
        const map = new naver.maps.Map('map', {
            center: new naver.maps.LatLng(focus),
            zoom: 19,
            draggable: false,
            pinchZoom: false,
            scrollWheel: false,
            keyboardShortcuts: false,
            disableDoubleTapZoom: true,
            disableDoubleClickZoom: true,
            disableTwoFingerTapZoom: true,
        });
        // const trafficLayer = new naver.maps.TrafficLayer({ interval: 300000 })
        // naver.maps.Event.once(map, 'init', function(){ trafficLayer.setMap(map) })
        naverMap = map
    }
    const SettingMapCenter = () => {
        naverMap.panTo(new naver.maps.LatLng(focus))
    }
    const SettingMapType = () => {
        naverMap.setMapTypeId(naver.maps.MapTypeId[mapType])
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
    const overViewContent = () => {
        const overViewBackgroundStyle = {
            width: '100%',
            height: '100%',
            backgroundColor: '#0000003d',
            position: 'absolute',
            left: '0px',
            top: '0px',
            zIndex: '10000',
        }
        const overViewContent = {
            width: '25%',
            height: '100%',
            backgroundColor: 'white',
            position: 'absolute',
            right:'0px',
            top:'0px',
            zIndex: '10001'
        }

        const specialCommandEvent = () =>{
            //선택된 라디오버튼을 찾아서 해당하는 OPCODE 와 값을 보내야한다. ON -> 0, 1 OFF -> 0, 0
            const checkItem = document.querySelector('input[name=controlItem]:checked')
            if(checkItem!=undefined){
                let opcode_byte1 = 0x00
                let opcode_byte2 = 0x00
                let status = 0
                switch (checkItem.id.split('-')[1]){
                    case '0' : opcode_byte1 = 0x01; status = 1; break; //주제어부리셋
                    case '1' : opcode_byte1 = 0x40; status = 1; break; //점멸시작
                    case '2' : opcode_byte1 = 0x40; status = 0; break; //점멸종료
                    case '3' : opcode_byte1 = 0x04; status = 1; break; //모순해제
                    case '4' : opcode_byte1 = 0x80; status = 1; break; //소등시작
                    case '5' : opcode_byte1 = 0x80; status = 0; break; //소등종료
                    case '6' : opcode_byte2 = 0x01; status = 1; break; //시차좌회전시작
                    case '7' : opcode_byte1 = 0x20; status = 1; break; //조광시작
                    case '8' : opcode_byte1 = 0x20; status = 0; break; //조광종료
                    case '9' : opcode_byte2 = 0x01; status = 0; break; //시차좌회전종료
                    case '10' : opcode_byte2 = 0x02; status = 1; break; //감응시작
                    case '11' : opcode_byte2 = 0x02; status = 0; break; //감응종료
                    case '12' : opcode_byte2 = 0x80; status = 1; break; //PPC 제어시작
                    case '13' : opcode_byte2 = 0x40; status = 1; break; //보행자버튼활성
                    case '14' : opcode_byte2 = 0x40; status = 0; break; //보행자버튼해제
                    case '15' : opcode_byte2 = 0x80; status = 0; break; //PPC 제어종료
                    case '16' : opcode_byte1 = 0x08; status = 1; break; //수동제어허용
                    case '17' : opcode_byte1 = 0x08; status = 0; break; //수동제어금지
                    case '18' : break; //미설정
                    case '19' : opcode_byte1 = 0x10; status = 1; break; //모순제어허용
                    case '20' : opcode_byte1 = 0x10; status = 0; break; //모순제어금지
                    default: break;
                }
                if( opcode_byte1 != 0x00 && opcode_byte2 != 0x00 ) socket.emit('upload_request', [0x7e, 0x7e, 7, mapIndex, 0x50, opcode_byte1, opcode_byte2, status])
            }

        }
        const controlModeSettingEvent = () =>{
        }

        return (
            <div>
                <div style={overViewBackgroundStyle} onClick={()=>{setOverview(false)}}></div>
                <div style={overViewContent}>
                    {/*title*/}
                    <div style={{display:'flex', borderBottom: '1px solid #EBEBEB', padding:'30px 0px 20px 20px'}}>
                        <div style={{cursor:'pointer'}}><Image src={'/cancle.png'} width={20} height={20} onClick={()=>{setOverview(false)}}/></div>
                        <h3 style={{marginLeft:'15px',  color: '#707070'}}>제어설정</h3>
                    </div>
                    {/*특수제어*/}
                    <div style={{padding: '20px', color: '#707070', fontSize: '15px',}}>
                        <h3>특수제어</h3>
                        <table style={{fontSize: '14px', textAlign:'left', fontWeight:'bold', margin:'10px 20px',}}>
                            <thead>
                            <tr>
                                <th colSpan={3} style={{color: '#727CF5', fontSize:'16px', height:'30px'}}>제어실행</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td><input type={"radio"} name={'controlItem'} id={'item-0'}/><label htmlFor={'item-0'}>주제어부 리셋</label></td>
                                <td><input type={"radio"} name={'controlItem'} id={'item-1'}/><label htmlFor={'item-1'}>점멸 시작</label></td>
                                <td><input type={"radio"} name={'controlItem'} id={'item-2'}/><label htmlFor={'item-2'}>점멸 종료</label></td>
                            </tr>
                            <tr>
                                <td><input type={"radio"} name={'controlItem'} id={'item-3'}/><label htmlFor={'item-3'}>모순 해제</label></td>
                                <td><input type={"radio"} name={'controlItem'} id={'item-4'}/><label htmlFor={'item-4'}>소등 시작</label></td>
                                <td><input type={"radio"} name={'controlItem'} id={'item-5'}/><label htmlFor={'item-5'}>소등 종료</label></td>
                            </tr>
                            <tr>
                                <td><input type={"radio"} name={'controlItem'} id={'item-6'}/><label htmlFor={'item-6'}>시차좌회전 시작</label></td>
                                <td><input type={"radio"} name={'controlItem'} id={'item-7'}/><label htmlFor={'item-7'}>조광 시작</label></td>
                                <td><input type={"radio"} name={'controlItem'} id={'item-8'}/><label htmlFor={'item-8'}>조광 종료</label></td>
                            </tr>
                            <tr>
                                <td><input type={"radio"} name={'controlItem'} id={'item-9'}/><label htmlFor={'item-9'}>시차좌회전 종료</label></td>
                                <td><input type={"radio"} name={'controlItem'} id={'item-10'}/><label htmlFor={'item-10'}>감응 시작</label></td>
                                <td><input type={"radio"} name={'controlItem'} id={'item-11'}/><label htmlFor={'item-11'}>감응 종료</label></td>
                            </tr>
                            <tr>
                                <td><input type={"radio"} name={'controlItem'} id={'item-12'}/><label htmlFor={'item-12'}>PPC 제어 시작</label></td>
                                <td><input type={"radio"} name={'controlItem'} id={'item-13'}/><label htmlFor={'item-13'}>보행자 버튼 활성</label></td>
                                <td><input type={"radio"} name={'controlItem'} id={'item-14'}/><label htmlFor={'item-14'}>보행자 버튼 해제</label></td>
                            </tr>
                            <tr>
                                <td><input type={"radio"} name={'controlItem'} id={'item-15'}/><label htmlFor={'item-15'}>PPC 제어 종료</label></td>
                                <td><input type={"radio"} name={'controlItem'} id={'item-16'}/><label htmlFor={'item-16'}>수동제어 허용</label></td>
                                <td><input type={"radio"} name={'controlItem'} id={'item-17'}/><label htmlFor={'item-17'}>수동제어 금지</label></td>
                            </tr>
                            <tr>
                                <td><input type={"radio"} name={'controlItem'} id={'item-18'}/><label htmlFor={'item-18'}>미설정</label></td>
                                <td><input type={"radio"} name={'controlItem'} id={'item-19'}/><label htmlFor={'item-19'}>모순제어 허용</label></td>
                                <td><input type={"radio"} name={'controlItem'} id={'item-20'}/><label htmlFor={'item-20'}>모순제어 금지</label></td>
                            </tr>
                            <tr>
                                <td colSpan={3} style={{height:'35px', textAlign:'center'}}>
                                    <input type={'checkbox'} id={'all-check-1'}/>
                                    <label htmlFor={'all-check-1'}>전체 교차로 선택</label>
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={3} style={{height:'35px', textAlign:'center'}}><button style={{width: '300px', height:'35px'}} onClick={specialCommandEvent}>제어실행</button></td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                    {/*제어기 운영모드 설정*/}
                    <div style={{padding: '20px', color: '#707070', fontSize: '15px',}}>
                        <h3>제어기 운영모드 설정</h3>
                        <table style={{width:'300px', textAlign:'left', margin:'5px 20px', fontWeight:'bold', fontSize: '14px',}}>
                            <thead>
                            <tr>
                                <th colSpan={2} style={{color: '#727CF5', fontSize:'16px', height:'30px'}}>운영모드</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td><input type={'radio'} name={'operationMode'} id={'op-1'}/><label htmlFor={'op-1'}>SINGLE-RING 운영</label></td>
                                <td><input type={'radio'} name={'operationMode'} id={'op-2'}/><label htmlFor={'op-2'}>DUAL-RING 운영</label></td>
                            </tr>
                            </tbody>
                        </table>
                        <table style={{width:'420px', textAlign:'left', margin:'5px 20px', fontWeight:'bold', fontSize: '14px',}}>
                            <thead>
                            <tr>
                                <th style={{color: '#727CF5', fontSize:'16px', height:'30px'}}>제어모드</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr><td><input type={'radio'} name={'controlMode'} id={'cm-1'}/><label htmlFor={'cm-1'}>LC SCU 고정제어</label></td></tr>
                            <tr><td><input type={'radio'} name={'controlMode'} id={'cm-2'}/><label htmlFor={'cm-2'}>LC 제어모드 (OFFLINE TOD 제어)</label></td></tr>
                            <tr><td><input type={'radio'} name={'controlMode'} id={'cm-3'}/><label htmlFor={'cm-3'}>LC + ACTUATION (OFFLINE + 감응제어)</label></td></tr>
                            <tr><td><input type={'radio'} name={'controlMode'} id={'cm-4'}/><label htmlFor={'cm-4'}>RC + ACTUATION (ONLINE + 감응제어)</label></td></tr>
                            <tr><td><input type={'radio'} name={'controlMode'} id={'cm-5'}/><label htmlFor={'cm-5'}>RC 제어모드 (ONLINE 제어)</label></td></tr>
                            <tr><td style={{height:'35px', textAlign:'center'}}><input type={'checkbox'} id={'all-check-2'}/><label htmlFor={'all-check-2'}>전체 교차로 설정</label></td></tr>
                            <tr><td style={{height:'35px', textAlign:'center'}}><button style={{width: '300px', height:'35px'}}>제어실행</button></td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )
    }
    const groupChangeEvent = (content) => {
        setGroupIndex(content.target.selectedIndex + 1)
        const _locationId = mapList.filter(e=>{return e.group.group_id == content.target.selectedIndex + 1})[0].location_id
        setMapIndex(_locationId)
        getMapDataAPI(_locationId).catch((e)=>{console.error(e)})
        document.getElementById('map-list-select-box').selectedIndex = 0
        router.push({ pathname: router.pathname, query:{id: content.target.selectedIndex+1, location_id: _locationId}})
    }
    const mapChangeEvent = (content) => {
        const _group = mapList.filter(e=>{return e.group.group_id == groupIndex})
        const _mapIndex = _group[content.target.selectedIndex].location_id
        setMapIndex(_mapIndex)
        getMapDataAPI(_mapIndex).catch((e)=>{console.error(e)})
        router.push({pathname: router.pathname, query:{id: groupIndex, location_id: _mapIndex}})
    }

    //데이터 처리 후 컨텐츠 생성
    const detectorStatus = () =>{
        let returnArray = []

        const _data = [0,0,0,0,0,0,0,0]
        for(let d in _data){
            returnArray.push(<td style={{border: '1px solid #EBEBEB'}} key={'detector-status-item-'+d}>
                {_data[d] == 0 ? statusBox('#C6C6C6') : _data[d] == 1 ? statusBox('#727CF5') : _data[d] == 2? statusBox('#FC6E51') : null}
            </td>)
        }

        return returnArray
    }
    const pedInputStatus = () => {
        let returnArray = []

        const _data = stsData[id-1][15].toString(2).padStart(8, '0').slice()
        for(let d in _data){
            returnArray.push(<td style={{border: '1px solid #EBEBEB'}} key={'ped-input-status-item-'+d}>
                {_data[d] == 0 ? statusBox('#C6C6C6') : _data[d] == 1 ? statusBox('#727CF5') : null}
            </td>)
        }

        return returnArray
    }
    const pedOutputStatus = () => {
        let returnArray = []

        const _data = stsData[mapIndex-1][14].toString(2).padStart(8, '0').slice()
        for(let d in _data){
            returnArray.push(<td style={{border: '1px solid #EBEBEB'}} key={'ped-output-status-item-'+d}>
                {_data[d] == 0 ? statusBox('#C6C6C6') : _data[d] == 1 ? statusBox('#727CF5') : null}
            </td>)
        }

        return returnArray
    }
    const pedErrorStatus = () => {
        let returnArray = []

        const _data = stsData[mapIndex-1][16].toString(2).padStart(8, '0').slice()
        for(let d in _data){
            returnArray.push(<td style={{border: '1px solid #EBEBEB'}} key={'ped-error-status-item-'+d}>
                {_data[d] == 0 ? statusBox('#C6C6C6') : _data[d] == 1 ? statusBox('#FC6E51') : null}
            </td>)
        }

        return returnArray
    }
    const statusBox = (color) => {
        return (
            <div style={{width: '12px', height: '12px', borderRadius:'3px', backgroundColor: color, margin: 'auto',}}>
            </div>
        )
    }

    const setDelta = () => {
        let day_sec = parseInt(stsData[mapIndex-1][6])+parseInt(stsData[mapIndex-1][5])*60+parseInt(stsData[mapIndex-1][4]*3600)
        let rs = day_sec-(parseInt(stsData[mapIndex-1][20])*parseInt(day_sec/stsData[mapIndex-1][20])+parseInt(stsData[mapIndex-1][21]))

        return Math.abs(stsData[mapIndex-1][18]-rs)>10 ? Math.abs(stsData[mapIndex-1][20]-Math.abs(stsData[mapIndex-1][18]-rs)) : Math.abs(stsData[mapIndex-1][18]-rs)
    }

    //marker
    const removeMarkers = () => {
        markers.map((item)=>{ item.setMap(false)})
        markers = []
    }
    const createMarkers = () => {
        //1. 현시 아이콘
        if(stsData != null){
            const phase = parseInt(stsData[mapIndex-1][9].toString(2).padStart(8, '0').slice(0,3), 2)
            if(movementIcon[phase] != undefined) {

                markers.push(
                    new naver.maps.Marker({
                        position: new naver.maps.LatLng({lat: mapData.location_lat, lng: mapData.location_long}),
                        map: naverMap,
                        title: 'phaseIcon',
                        icon: {
                            // url: '/72px/1.png',
                            content: [
                                '<div>',
                                '<img style="position: absolute; width: 70px; height: 70px;" src="/cycle.png"/>',
                                `<img style="position: absolute; width: 70px; height: 70px;" src="/phaseIcon/72px/${movementIcon[phase].ringA.arrow_image}"/>`,
                                `<img style="position: absolute; width: 70px; height: 70px;" src="/phaseIcon/72px/${movementIcon[phase].ringB.arrow_image}"/>`,
                                '</div>'
                            ].join(''),
                            size: new naver.maps.Size(35,35),
                            scaledSize: new naver.maps.Size(35,35),
                            origin: new naver.maps.Point(0,0),
                            anchor: new naver.maps.Point(30,40)
                        }
                    })
                )
            }
        }
    }


    return (
        <>
            { overview? overViewContent() : null }
            <div className={'control-button-box'} onClick={()=>{setOverview(true)}}>
                <div className={'control-button'}>
                    <Image src={'/list.png'} width={13} height={13} />
                    <span>제어설정</span>
                </div>
            </div>
            <div className={'display-flex'}>
                <h3>교차로 모니터링</h3>
                <select onChange={groupChangeEvent}>
                    {
                        groupList.map((item)=>(
                            <option key={'group-option-'+item.group_id}>{item.group_id}. {item.group_name}</option>
                        ))
                    }
                </select>
                <select onChange={mapChangeEvent} id={'map-list-select-box'}>
                    {
                        mapList.filter((e)=>e.group.group_id == groupIndex).map((item, index)=>(
                            <option key={'map-list-option-'+index}>{item.location_id}번 {item.location_name}</option>
                        ))
                    }
                </select>
                <div className={'controller-data'}>
                    <h4>IP</h4>
                    <label className={'highlight'}>{mapData ? mapData.location_lcIp : null}</label>
                    <h4>통신상태</h4>
                    <label className={'highlight'}>{stsData && stsData[mapIndex-1][0]===1 ? 'ONLINE' : 'OFFLINE'}</label>
                    <h4>제어기시각</h4>
                    <label className={'highlight'}>{stsData? stsData[mapIndex-1][4].toString().padStart(2, '0')+':'+stsData[mapIndex-1][5].toString().padStart(2, '0')+':'+stsData[mapIndex-1][6].toString().padStart(2, '0'): null}</label>
                    <h4>제어기종류</h4>
                    <label className={'highlight'}>
                        {mapData ? mapData.location_type+'년형': null}
                        ({mapData ? mapData.location_mfr: null})
                    </label>
                </div>
            </div>
            <div className={'display-flex'}>
                <div>
                    <div className={'display-flex'}>
                        <Container width={'335px'} height={'140px'} margin={'15px 15px 15px 0px'} padding={'10px'}>
                            <div className={'display-flex'}>
                                <label>위치도/이동류</label>
                                <div style={{marginLeft:'auto'}}></div>
                                <label>총현시</label>
                                <label className={'highlight'}>3</label>
                            </div>
                            <div className={'display-flex'}>
                                <Image src={'/sheetMap_1.png'} width={135} height={110}/>
                                <div className={'movement-table'}>
                                    <table>
                                        <thead>
                                        <tr>
                                            <th>현시</th>
                                            <th>1</th>
                                            <th>2</th>
                                            <th>3</th>
                                            <th>4</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        <tr>
                                            <th>이동류</th>
                                            <td>
                                                {movementIcon!=null && movementIcon[0] != undefined ?
                                                    <div style={{transform: `rotate(${movementIcon[0].degree}deg`}}>
                                                        <img style={{position: 'absolute'}} src={'/phaseIcon/32px/'+movementIcon[0].ringA.arrow_image}/>
                                                        <img src={'/phaseIcon/32px/'+movementIcon[0].ringB.arrow_image}/>
                                                    </div>
                                                    : null}
                                            </td>
                                            <td>
                                                {movementIcon!=null && movementIcon[1] != undefined ?
                                                    <div style={{transform: `rotate(${movementIcon[1].degree}deg`}}>
                                                        <img style={{position: 'absolute'}} src={'/phaseIcon/32px/'+movementIcon[1].ringA.arrow_image}/>
                                                        <img src={'/phaseIcon/32px/'+movementIcon[1].ringB.arrow_image}/>
                                                    </div>
                                                    : null}
                                            </td>
                                            <td>
                                                {movementIcon!=null && movementIcon[2] != undefined ?
                                                    <div style={{transform: `rotate(${movementIcon[2].degree}deg`}}>
                                                        <img style={{position: 'absolute'}} src={'/phaseIcon/32px/'+movementIcon[2].ringA.arrow_image}/>
                                                        <img src={'/phaseIcon/32px/'+movementIcon[2].ringB.arrow_image}/>
                                                    </div>
                                                    : null}
                                            </td>
                                            <td>
                                                {movementIcon!=null && movementIcon[3] != undefined ?
                                                    <div style={{transform: `rotate(${movementIcon[3].degree}deg`}}>
                                                        <img style={{position: 'absolute'}} src={'/phaseIcon/32px/'+movementIcon[3].ringA.arrow_image}/>
                                                        <img src={'/phaseIcon/32px/'+movementIcon[3].ringB.arrow_image}/>
                                                    </div>
                                                    : null}
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>적용</th>
                                            <td>{stsData ? stsData[mapIndex-1][43] : null}</td>
                                            <td>{stsData ? stsData[mapIndex-1][44] : null}</td>
                                            <td>{stsData ? stsData[mapIndex-1][45] : null}</td>
                                            <td>{stsData ? stsData[mapIndex-1][46] : null}</td>
                                        </tr>
                                        <tr>
                                            <th>목표</th>
                                            <td>{stsData ? stsData[mapIndex-1][43] : null}</td>
                                            <td>{stsData ? stsData[mapIndex-1][44] : null}</td>
                                            <td>{stsData ? stsData[mapIndex-1][45] : null}</td>
                                            <td>{stsData ? stsData[mapIndex-1][46] : null}</td>
                                        </tr>
                                        <tr>
                                            <th>현시</th>
                                            <th>5</th>
                                            <th>6</th>
                                            <th>7</th>
                                            <th>8</th>
                                        </tr>
                                        <tr>
                                            <th>이동류</th>
                                            <td>
                                                {movementIcon!=null && movementIcon[4] != undefined ?
                                                    <div style={{transform: `rotate(${movementIcon[4].degree}deg`}}>
                                                        <img style={{position: 'absolute'}} src={'/phaseIcon/32px/'+movementIcon[4].ringA.arrow_image}/>
                                                        <img src={'/phaseIcon/32px/'+movementIcon[4].ringB.arrow_image}/>
                                                    </div>
                                                    : null}
                                            </td>
                                            <td>
                                                {movementIcon!=null && movementIcon[5] != undefined ?
                                                    <div style={{transform: `rotate(${movementIcon[5].degree}deg`}}>
                                                        <img style={{position: 'absolute'}} src={'/phaseIcon/32px/'+movementIcon[5].ringA.arrow_image}/>
                                                        <img src={'/phaseIcon/32px/'+movementIcon[5].ringB.arrow_image}/>
                                                    </div>
                                                    : null}
                                            </td>
                                            <td>
                                                {movementIcon!=null && movementIcon[6] != undefined ?
                                                    <div style={{transform: `rotate(${movementIcon[6].degree}deg`}}>
                                                        <img style={{position: 'absolute'}} src={'/phaseIcon/32px/'+movementIcon[6].ringA.arrow_image}/>
                                                        <img src={'/phaseIcon/32px/'+movementIcon[6].ringB.arrow_image}/>
                                                    </div>
                                                    : null}
                                            </td>
                                            <td>
                                                {movementIcon!=null && movementIcon[7] != undefined ?
                                                    <div style={{transform: `rotate(${movementIcon[7].degree}deg`}}>
                                                        <img style={{position: 'absolute'}} src={'/phaseIcon/32px/'+movementIcon[7].ringA.arrow_image}/>
                                                        <img src={'/phaseIcon/32px/'+movementIcon[7].ringB.arrow_image}/>
                                                    </div>
                                                    : null}
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>적용</th>
                                            <td>{stsData ? stsData[mapIndex-1][47] : null}</td>
                                            <td>{stsData ? stsData[mapIndex-1][48] : null}</td>
                                            <td>{stsData ? stsData[mapIndex-1][49] : null}</td>
                                            <td>{stsData ? stsData[mapIndex-1][50] : null}</td>
                                        </tr>
                                        <tr>
                                            <th>목표</th>
                                            <td>{stsData ? stsData[mapIndex-1][47] : null}</td>
                                            <td>{stsData ? stsData[mapIndex-1][48] : null}</td>
                                            <td>{stsData ? stsData[mapIndex-1][49] : null}</td>
                                            <td>{stsData ? stsData[mapIndex-1][50] : null}</td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </Container>
                        <Container width={'340px'} height={'140px'} margin={'15px 15px 15px 0px'} padding={'10px'}>
                            <label>검지기 이력</label>
                            <div>
                                {detectLog.length > 0 ? <Line options={DetectChartOptions} data={DetectChartDatasets()} height={120} width={320}/> :null}
                            </div>
                        </Container>
                        <Container width={'335px'} height={'140px'} margin={'15px 20px 15px 0px'} padding={'10px'}>
                            <label>검지기 및 보행자 작동상태</label>
                            <div className={'detect-table'}>
                                <table>
                                    <thead>
                                    <tr>
                                        <th></th>
                                        <th>1</th>
                                        <th>2</th>
                                        <th>3</th>
                                        <th>4</th>
                                        <th>5</th>
                                        <th>6</th>
                                        <th>7</th>
                                        <th>8</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <tr>
                                        <th style={{width: '35px', height: '20px'}}>검지기</th>
                                        { stsData ? detectorStatus() : null }
                                    </tr>
                                    </tbody>

                                </table>
                            </div>
                            <div className={'ped-table'}>
                                <table>
                                    <thead>
                                    <tr>
                                        <th>보행자</th>
                                        <th>북</th>
                                        <th>동</th>
                                        <th>남</th>
                                        <th>서</th>
                                        <th>북동</th>
                                        <th>남동</th>
                                        <th>남서</th>
                                        <th>북서</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <tr>
                                        <th>출력</th>
                                        { stsData ? pedOutputStatus() : null }
                                    </tr>
                                    <tr>
                                        <th>입력</th>
                                        { stsData ? pedInputStatus() : null }
                                    </tr>
                                    <tr>
                                        <th>고장</th>
                                        { stsData ? pedErrorStatus() : null }
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </Container>
                    </div>
                    <Container width={'1060px'} height={'598px'} padding={'20px'}>
                        <h4 style={{float:'left',}}>{router.query.location_id}번 {mapData ? mapData.location_name : null} 교차로</h4>
                        <div className={'mapTypeButtonGroup'}>
                            <button onClick={changeMapType.bind()} className={'active'}>일반지도</button>
                            <button onClick={changeMapType.bind()}>지형도</button>
                            <button onClick={changeMapType.bind()}>위성지도</button>
                        </div>
                        <div className={'map'} id={'map'}></div>
                    </Container>
                </div>
                <div>
                    <Container width={'450px'} height={'160px'} margin={'15px 0px'}padding={'20px'}>
                        <h4>현시 및 주기</h4>
                        <div className={'display-flex'}>
                            <div>
                                <div className={'font-text'}><h3 style={{color: '#707070'}}>주기</h3><h5 style={{color: '#707070'}}>{stsData? stsData[mapIndex-1][20]: null}</h5></div>
                                {stsData ? <Doughnut options={PhaseChartOptions} data={PhaseChartDatasets()} width={200} height={100}/> : null}
                            </div>
                            <div className={'phase-content-table'}>
                                <table>
                                    <tbody>
                                    <tr>
                                        <td>현시(Phase)</td>
                                        <td style={{color: '#727CF5'}}>{stsData? parseInt(stsData[mapIndex-1][9].toString(2).padStart(8, '0').slice(0,3), 2) + 1: null}</td>
                                    </tr>
                                    <tr>
                                        <td>스텝(Step)</td>
                                        <td style={{color: '#727CF5'}}>{stsData? parseInt(stsData[mapIndex-1][9].toString(2).padStart(8, '0').slice(3), 2): null}</td>
                                    </tr>
                                    <tr>
                                        <td>Delta</td>
                                        <td style={{color: '#727CF5'}}>{
                                            stsData ? setDelta() :null
                                        }</td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className={'phase-table'}>
                            <table>
                                <thead>
                                <tr>
                                    <th>주기 COUNT</th>
                                    <th>전 주기</th>
                                    <th>현 주기</th>
                                    <th>연동값</th>
                                    <th>유지현시</th>
                                    <th>생략현시</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <td>{stsData? stsData[mapIndex-1][18]: null}</td>
                                    <td>{stsData? stsData[mapIndex-1][19]: null}</td>
                                    <td>{stsData? stsData[mapIndex-1][20]: null}</td>
                                    <td>{stsData? stsData[mapIndex-1][21]: null}</td>
                                    <td>{stsData? stsData[mapIndex-1][22]: null}</td>
                                    <td>{stsData? stsData[mapIndex-1][23]: null}</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </Container>
                    <Container width={'450px'} height={'220px'} margin={'15px 0px 0px 0px'}padding={'20px'}>
                        <h4>제어기 상태정보</h4>
                        <div className={'controller-table'}>
                            <table>
                                <tbody>
                                <tr>
                                    <th>제어 모드</th>
                                    <td>{stsData ? parseInt(stsData[mapIndex-1][8].toString(2).padStart(8,'0').slice(5), 2) == 0 ? 'SCU 고정주기'
                                        : parseInt(stsData[mapIndex-1][8].toString(2).padStart(8,'0').slice(5), 2) == 1 ? 'LC-비감응'
                                            :  parseInt(stsData[mapIndex-1][8].toString(2).padStart(8,'0').slice(5), 2) == 2 ? 'LC-감응'
                                                : parseInt(stsData[mapIndex-1][8].toString(2).padStart(8,'0').slice(5), 2) == 4 ? 'RC-감응'
                                                    : parseInt(stsData[mapIndex-1][8].toString(2).padStart(8,'0').slice(5), 2) == 5 ? 'RC-비감응' : 'ERROR' : null}</td>
                                    <th>Door 상태</th>
                                    <td>{stsData ? parseInt(stsData[mapIndex-1][12].toString(2).padStart(8,'0').slice(7),2) == 0? 'OPEN' : 'CLOSED' : null}</td>
                                </tr>
                                <tr>
                                    <th>링 구분</th>
                                    <td>{stsData ? parseInt(stsData[mapIndex-1][8].toString(2).padStart(8,'0')[3],2) == 0? 'SINGLE' : 'DUAL': null}</td>
                                    <th>DB 상태</th>
                                    <td>{stsData ? parseInt(stsData[mapIndex-1][11].toString(2).padStart(8,'0')[7],2) == 0? '정상' : '이상': null}</td>
                                </tr>
                                <tr>
                                    <th>점멸 상태</th>
                                    <td>{stsData ? parseInt(stsData[mapIndex-1][11].toString(2).padStart(8,'0')[6],2) == 0? '정상' : '점멸': null}</td>
                                    <th>수동 SW 상태</th>
                                    <td>{stsData ? parseInt(stsData[mapIndex-1][11].toString(2).padStart(8,'0')[1],2) == 0? 'OFF' : 'ON': null}</td>
                                </tr>
                                <tr>
                                    <th>소등 상태</th>
                                    <td>{stsData ? parseInt(stsData[mapIndex-1][11].toString(2).padStart(8,'0')[5],2) == 0? '정상' : '소등': null}</td>
                                    <th>CAN Cont.</th>
                                    <td>{stsData ? parseInt(stsData[mapIndex-1][7].toString(2).padStart(8,'0')[2], 2) == 0 ? '정상' : '고장' : null}</td>
                                </tr>
                                <tr>
                                    <th>모순 상태</th>
                                    <td>{stsData ? parseInt(stsData[mapIndex-1][11].toString(2).padStart(8,'0')[4],2) == 0? '정상' : '모순': null}</td>
                                    <th>MCU link</th>
                                    <td>{stsData ? parseInt(stsData[mapIndex-1][7].toString(2).padStart(8,'0')[3], 2) == 0 ? '정상' : '고장' : null}</td>
                                </tr>
                                <tr>
                                    <th>보행자버튼</th>
                                    <td>{stsData ? stsData[mapIndex-1][12].toString(2).padStart(8,'0').slice(0,1) == 0? '비활성' : '활성' : null}</td>
                                    <th>점멸동작원인</th>
                                    <td>{stsData ? parseInt(stsData[mapIndex-1][12].toString(2).padStart(8,'0').slice(1,4), 2) == 1 ? 'Power ON FLASH' :
                                        parseInt(stsData[mapIndex-1][12].toString(2).padStart(8,'0').slice(1,4), 2) == 2? 'NORMAL FLASH':
                                            parseInt(stsData[mapIndex-1][12].toString(2).padStart(8,'0').slice(1,4), 2) ==3? 'P.P S/W FLASH':
                                                parseInt(stsData[mapIndex-1][12].toString(2).padStart(8,'0').slice(1,4), 2) ==4? 'CONFLICT FLASH':
                                                    parseInt(stsData[mapIndex-1][12].toString(2).padStart(8,'0').slice(1,4), 2) ==5? 'DB ERROR FLASH':
                                                        parseInt(stsData[mapIndex-1][12].toString(2).padStart(8,'0').slice(1,4), 2) ==6? '소등(진입/해제)점멸':
                                                            parseInt(stsData[mapIndex-1][12].toString(2).padStart(8,'0').slice(1,4), 2) ==7? '장치이상': '알수없음': null}</td>
                                </tr>
                                <tr>
                                    <th>DB Error Code</th><td>--</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </Container>
                    <Container width={'450px'} height={'281px'} margin={'15px 0px 0px 0px'}padding={'20px'}>
                        <h4>검지기 영상</h4>
                        <div>
                            <div className={'cctv-radio-group'}>
                                <div className={'radio-item'}>
                                    <input type={'radio'} id={'id_1'} name={'video'} value={'1번 검지기'} />
                                    <label htmlFor='id_1'>1번 검지기</label>
                                </div>
                                <div className={'radio-item'}>
                                    <input type={'radio'} id={'id_2'} name={'video'} value={'2번 검지기'} />
                                    <label htmlFor='id_2'>2번 검지기</label>
                                </div>
                                <div className={'radio-item'}>
                                    <input type={'radio'} id={'id_3'} name={'video'} value={'3번 검지기'} />
                                    <label htmlFor='id_3'>3번 검지기</label>
                                </div>
                                <div className={'radio-item'}>
                                    <input type={'radio'} id={'id_4'} name={'video'} value={'4번 검지기'} />
                                    <label htmlFor='id_4'>4번 검지기</label>
                                </div>

                            </div>
                            <div className={'cctv-container'}>
                                <svg id='playButton' xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" className="bi bi-play-circle icon" viewBox="0 0 16 16" style={{left: '4px'}}>
                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                    <path d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445z"/>
                                </svg>
                                <svg id='stopButton' xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" className="bi bi-stop-circle icon" viewBox="0 0 16 16" style={{left: '32px'}}>
                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                    <path d="M5 6.5A1.5 1.5 0 0 1 6.5 5h3A1.5 1.5 0 0 1 11 6.5v3A1.5 1.5 0 0 1 9.5 11h-3A1.5 1.5 0 0 1 5 9.5v-3z"/>
                                </svg>
                                <Image src={'/nocctv.png'} width={320} height={260}/>
                            </div>
                        </div>

                    </Container>
                </div>
            </div>
            <style jsx>{`
              h1, h2, h3, h4, h5 {
                color: #707070;
                margin-right: 4px;
              }
              .controller-data {
                margin-top: 4px;
                display: flex;
                font-size: 14px;
              }
              .controller-data label {
                margin-right: 8px;
              }
              label {
                font-weight: bold;
                font-size: 14px;
                color: #707070;
              }
              .display-flex {
                display: flex;
                padding: 0;
              }
              .highlight {
                color: #727CF5;
              }
              .movement-table {
                overflow-y: auto;
                height: 130px;
                width: 60%;
                font-size: 13px;
                text-align: center;
              }
              th {
                background-color: #F7F9FC;
                border-bottom: 1px solid #EBEBEB;
                color: #707070;
              }
              .movement-table td {
                border-bottom: 1px solid #EBEBEB;
              }
              .movement-table td:not(:last-child) {
                border-right: 1px solid #EBEBEB;
              }
              .movement-table th:not(:first-child) {
                padding: 2px 12px;
                border-left: 1px solid #EBEBEB;
              }
              .detect-table {
                font-size: 12px;
              }
              .detect-table th, .detect-table td {
                border: 1px solid #EBEBEB;
              }
              .ped-table {
                font-size: 12px;
                margin-top: 5px;
              }
              .ped-table td, .ped-table th {
                border: 1px solid #EBEBEB;
                height: 20px;
                width: 15px;
              }
              .mapTypeButtonGroup {
                float: right;
              }
              .map {
                width: 1060px;
                height: 570px;
                background-color: #707070;
              }
              .phase-table {
                font-size: 13px;
                text-align: center;
                margin-top: 15px;
              }
              .phase-table th, .phase-table td {
                padding: 2px 0px;
                color: #707070;
                border: 1px solid #EBEBEB;
              }
              .font-text {
                position: absolute;
                right: 340px;
                top: 175px;
                text-align: center;
              }
              .phase-content-table {
                margin: 5px 30px;
                width: 150px;
                height: 70px;
              }
              .phase-content-table td {
                color: #707070;
                padding: 6px;
                font-weight: bold;
                font-size: 14px;
              }
              .controller-table {
                margin-top: 10px;
                color: #707070;
                font-size: 14px;
                font-weight: bold;
                text-align: left;
              }
              .controller-table td, .controller-table th {
                border: 1px solid #EBEBEB;
                padding: 5px 0px 5px 10px;
              }
              .cctv-container {
                position: relative;
                float: right;
              }
              .cctv-container .icon {
                cursor: pointer;
                position: absolute;
                z-index: 2;
                bottom: 10px;
              }
              .cctv-radio-group {
                float: left;
                margin-top: 10px;
              }

              select {
                margin: 0px 5px;
                border-radius: 4px;
                color: #707070;
                font-weight: bold;
              }
              .control-button-box{
                position: absolute;
                right: -35px;
                top:100px;
                width: 120px;
                height: 50px;
                background-color: white;
                box-shadow: 2px 1px .1px  rgb(204, 204, 204);
                border-radius: 5px;
                transform: rotate(90deg);
                cursor: pointer;
              }
              .control-button{
                width: 105px;
                height: 25px;
                background-color: #293042;
                color:white;
                padding: 5px 0px;
                margin-top: 6px;
                margin-left: 7.5px;
                border-radius: 7px;
                line-height: 25px;
                text-align: center;
              }
              .control-button span{
                color: white;
                margin-left: 5px;
              }
              
              .radio-item label::before{
                margin-right: 6px;
              }
            `}</style>
        </>
    );
};
export async function getServerSideProps(context) {
    return authCheck(context)
}
export default IntersectionMonitoring;
