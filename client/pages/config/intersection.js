import {useEffect, useState} from 'react';
import Container from "../../components/Container";
import {authCheck} from "../../authCheck";
import axios from "axios";
import swal from "sweetalert2";

let naverMap = null
let locationMarkers = []
let locationInfoWindows = []
let newLocationMarker = null

let detectorMarkers = []
let newDetectorMarker = null

const IntersectionConfig = () => {

    //useState
    const [loaded, setLoaded] = useState(false)
    const [pageIndex, setPageIndex] = useState(0)
    const [maxIndex, setMaxIndex] = useState(1)
    const [mapList, setMapList] = useState([])
    const [phaseList, setPhaseList] = useState([])
    const [detectorList, setDetectorList] = useState([])

    const [selectMap, setSelectMap] = useState(null)
    const [selectDetector, setSelectDetector] = useState(null)
    const [selectPhaseItem, setSelectPhaseItem] = useState(null)
    const [eventType, setEventType] = useState(0) //0: 조회, 1: 교차로추가, 2: 교차로수정, 3: 기반정보수정

    const center = { lat: 35.96334033513462, lng: 127.02098276357472 }
    //useEffect
    useEffect(()=>{
        const scriptTag = document.createElement('script')
        scriptTag.src= 'https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=r1c367pze3'
        scriptTag.addEventListener('load', ()=>setLoaded(true))
        document.body.appendChild(scriptTag)
    },[])
    useEffect(()=>{
        if(!loaded) return
        initMap()
        getMapListAPI().catch((e)=>{console.error(e)})
    },[loaded])
    useEffect(()=>{
        //마커를 생성한다.
        if(mapList.length > 0){
            setMaxIndex(Math.ceil(mapList.length/4))
            if(locationMarkers.length > 0) {
                locationMarkers.map((marker) => { marker.setMap(null) })
                locationMarkers = []
                locationInfoWindows.map((info) => { info.setMap(null) })
                locationInfoWindows = []
            }

            mapList.map((map)=>{
                locationMarkers.push(
                    new naver.maps.Marker({
                        position: new naver.maps.LatLng({lat: map.location_lat, lng: map.location_long}),
                        map: naverMap,
                        title: map.location_name,
                        icon: {
                            url: '/service-map-icon.png',
                            size: new naver.maps.Size(50,56),
                            scaledSize: new naver.maps.Size(25, 34),
                            origin: new naver.maps.Point(0, 0),
                            anchor: new naver.maps.Point(10, 35)
                        }
                    })
                )
                locationInfoWindows.push(
                    new naver.maps.InfoWindow({
                        content: `<div style="width: 120px; text-align: center; font-size: 14px;">${map.location_id}번 ${map.location_name}</div>`
                    })
                )
            })
            locationMarkers.map((marker, markerIndex) => {
                naver.maps.Event.addListener(marker, 'click', function(){
                    let _marker = marker, infoWindow = locationInfoWindows[markerIndex]
                    if(infoWindow.getMap()) infoWindow.close()
                    else infoWindow.open(naverMap, _marker)
                })
            })
            naver.maps.Event.addListener(naverMap, 'click', function(){
                locationInfoWindows.map((info)=>{info.close()})
            })

        }
    },[mapList])
    useEffect(()=>{
        if(selectMap!=null){
            getPhaseIconListAPI().catch((e)=>{console.error(e)})
            getDetectorListAPI().catch((e)=>{console.error(e)})
            contentViewSetDataEvent()
            setSelectDetector(null)
            setSelectPhaseItem(null)
        }
    },[selectMap])
    useEffect(()=>{
        if(newLocationMarker != null){
            newLocationMarker.setMap(null)
            newLocationMarker = null
            naver.maps.Event.clearListeners(naverMap, 'click')
        }
        setSelectDetector(null)
        setSelectPhaseItem(null)

        if(eventType != 0){
            if(eventType == 3){
                naverMap.setZoom(19)
                naverMap.panTo(new naver.maps.LatLng({lat: selectMap.location_lat, lng: selectMap.location_long}))
            }else {
                const mapDataTableTD = document.querySelector('.map-editor-view table').querySelectorAll('td')
                const contentDataTable = document.querySelector('.data-content-view table')

                const cameraSelect = contentDataTable.querySelectorAll('select')[0]
                const phaseSelect = contentDataTable.querySelectorAll('select')[1]
                const contentTd = contentDataTable.querySelectorAll('td')

                if(eventType === 1){
                    mapDataTableTD[0].innerText = 1
                    mapDataTableTD[1].querySelector('input').value = ''
                    mapDataTableTD[2].querySelector('input').value = ''
                    mapDataTableTD[3].querySelector('input').value = ''
                    mapDataTableTD[4].querySelector('input').value = ''
                    mapDataTableTD[5].querySelector('input').value = ''
                    mapDataTableTD[6].querySelector('input').value = ''
                    mapDataTableTD[7].querySelector('input').value = ''
                    mapDataTableTD[8].querySelector('input').value = ''

                    cameraSelect.innerHTML = ''
                    phaseSelect.innerHTML = ''

                    contentTd[0].innerText = ''
                    contentTd[1].innerText = ''
                    contentTd[2].innerText = ''
                    contentTd[3].querySelectorAll('img')[0].src = ''
                    contentTd[3].querySelectorAll('img')[1].src = ''
                    contentTd[4].innerText = ''

                    newLocationMarker = new naver.maps.Marker({
                        position: new naver.maps.LatLng(center),
                        map: naverMap,
                        title: map.location_name,
                        icon: {
                            url: '/new-map-icon.png',
                            size: new naver.maps.Size(50,56),
                            scaledSize: new naver.maps.Size(25, 34),
                            origin: new naver.maps.Point(0, 0),
                            anchor: new naver.maps.Point(10, 35)
                        }
                    })
                    naver.maps.Event.addListener(naverMap, 'click', function(e){
                        newLocationMarker.setPosition(e.coord)
                        mapDataTableTD[6].querySelector('input').value = e.coord._lat
                        mapDataTableTD[7].querySelector('input').value = e.coord._lng
                    })

                }
                contentViewSetDataEvent()
            }
        }else {
            locationMarkers.map((marker)=>{
                const icon = marker.getIcon()
                icon.url = '/service-map-icon.png'
                marker.setIcon(icon)
            })

            if(naverMap != null){
                naverMap.setZoom(13)
                naverMap.panTo(center)
            }
        }
    },[eventType])
    useEffect(()=>{
        if(selectMap!=null){
            document.getElementsByName('radio-button-group').forEach((e)=>{
                e.checked = false
                console.log(e.id)
                if(selectMap != null && parseInt(e.id.split('-')[1]) == selectMap.location_id){
                    e.checked  = true
                }
            })
        }
    },[pageIndex])
    useEffect(()=>{
        if(selectDetector!=null){
            const tds = document.getElementsByClassName('detector-data-view')[0].querySelectorAll('td')
            tds[0].querySelector('input').value  = selectDetector.detector_channel
            tds[1].querySelector('input').value = selectDetector.detector_name
            tds[2].querySelector('input').value = selectDetector.detector_ip
            tds[3].querySelector('input').value = selectDetector.detector_camera_ip
            tds[4].querySelector('input').value = selectDetector.internal_nano_link
            tds[5].querySelector('input').value = selectDetector.internal_camera_link
            tds[6].querySelector('input').value = selectDetector.external_nano_link
            tds[7].querySelector('input').value = selectDetector.external_camera_link
            tds[8].querySelector('input').value = selectDetector.camera_latitude
            tds[9].querySelector('input').value = selectDetector.camera_longitude
            tds[10].querySelector('input').value = selectDetector.camera_angle
            
            //선택한 검지기 아이콘 편집모드로 변환
            if(newDetectorMarker==null){

            }else {

            }

        }else {
            document.querySelectorAll('.detector-list li').forEach((e)=>{
                e.classList.remove('active')
                e.style.color= '#707070'
            })
        }
    },[selectDetector])
    useEffect(()=>{
        if(detectorMarkers.length > 0){
            detectorMarkers.map((marker)=>{marker.setMap(null)})
            detectorMarkers = []
        }
        if(detectorList.length > 0){
            detectorList.map((detector)=>{
                detectorMarkers.push(
                    new naver.maps.Marker({
                        position: new naver.maps.LatLng({lat: detector.camera_latitude, lng: detector.camera_longitude}),
                        map: naverMap,
                        title: 'cameraIcon_'+detector.detector_channel,
                        icon: {
                            url: '/signal_icon_gray.png',
                            size: new naver.maps.Size(50,69),
                            scaledSize: new naver.maps.Size(50,69),
                            origin: new naver.maps.Point(0,0),
                            anchor: new naver.maps.Point(10,35)
                        }
                    })
                )
            })

            if(eventType == 3) {
                detectorMarkers.map((marker)=>{marker.setMap(naverMap)})
            }else {
                detectorMarkers.map((marker)=>{marker.setMap(null)})
            }
        }
    },[detectorList])

    //GET
    async function getMapListAPI(){
        try{
            const response = await axios.get('http://192.168.1.43:3001/locations/listAll')
            setMapList(response.data)
        }catch(error){
            console.error(error)
        }
    }
    async function getPhaseIconListAPI(){
        try{
            const response = await axios.get('http://192.168.1.43:3001/phase/read/phases/location/'+selectMap.location_id)
            setPhaseList(response.data.sort(function(a,b){return a.phase_number > b.phase_number ? 1 : a.phase_number < b.phase_number? -1 : 0}))
        }catch(error){
            console.error(error)
        }
    }
    async function getDetectorListAPI(){
        try{
            const response = await axios.get('http://192.168.1.43:3001/detector/getList/location/'+selectMap.location_id)
            setDetectorList(response.data)
        }catch(error){
            console.error(error)
        }
    }
    //POST
    async function postPhaseIconCreateAPI(_data){
        try{
            const url = 'http://192.168.1.43:3001/phase/create'
            await axios.post(url, _data)
        }catch (error){
            console.error(error)
        }
    }
    async function postDetectorCameraCreateAPI(_data){
        try{
            const url = 'http://192.168.1.43:3001/detector/create/location/'+selectMap.location_id+'/channel/'+_data.detector_channel
            await axios.post(url, _data)
        }catch (error){
            console.error(error)
        }
    }
    async function postMapCreateAPI(_data){
        try {
            const url = 'http://192.168.1.43:3001/locations/create'
            await axios.post(url, _data)
        }catch (e){
            console.error(e)
        }
    }
    //PATCH
    async function patchPhaseIconUpdateAPI(_data){
        try{
            const url = 'http://192.168.1.43:3001/phase/update/phase/'+_data.phase_number+'/location/'+selectMap.location_id
            const options = {
                headers: {
                    'accept': '*/*',
                    'Content-Type': 'application/json'
                }
            }
            await axios.patch(url, _data, options)
        }catch (error){
            console.error(error)
        }
    }
    async function patchDetectorCameraUpdateAPI(_data){
        try{
            const url = 'http://192.168.1.43:3001/detector/update/location/'+selectMap.location_id+'/channel/'+_data.detector_channel
            const options = {
                headers: {
                    'accept': '*/*',
                    'Content-Type': 'application/json'
                }
            }
            await axios.patch(url, _data, options)
        }catch (error){
            console.error(error)
        }
    }
    async function patchMapUpdateAPI(_data){
        try {
            const url = 'http://192.168.1.43:3001/locations/update/'+selectMap.location_id
            const options = {
                headers: {
                    'accept': '*/*',
                    'Content-Type': 'application/json'
                }
            }
            await axios.patch(url, _data, options)
        }catch (e){
            console.error(e)
        }
    }
    //DELETE
    async function deletePhaseIconDeleteAPI(phase_number){
        try{
            const url = 'http://192.168.1.43:3001/phase/delete/phase/'+phase_number+'/location/'+selectMap.location_id
            await axios.delete(url)
        }catch (error){
            console.error(error)
        }
    }
    async function deleteDetectorCameraDeleteAPI(channel){
        try{
            const url = 'http://192.168.1.43:3001/detector/delete/location/'+selectMap.location_id+'/channel/'+channel
            await axios.delete(url)
        }catch (error){
            console.error(error)
        }
    }
    async function deleteMapAPI(id){
        try {
            const url = 'http://192.168.1.43:3001/locations/delete/'+id
            await  axios.delete(url)
        }catch (e){
            console.error(e)
        }
    }

    const initMap = () => {
        const map = new naver.maps.Map('map', {
            center: new naver.maps.LatLng(center),
            zoom: 13,
            zoomControl: true,
            minZoom: 10,
            maxZoom: 25,

        });
        naverMap = map
    }

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
                setPageIndex(parseInt(10*Math.floor(pageIndex/10) - 10))
            }
        }else if(listUpdateButton.target.id === 'nextButton') {
            if(10*Math.floor(pageIndex/10)+10 < maxIndex){
                setPageIndex(parseInt(10*Math.floor(pageIndex/10) + 10))
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
    }
    const createMapListTable = (pageIndex) => {
        let trs = []
        let tmp = mapList.slice(pageIndex*4, pageIndex*4+4)
        const updateSelectMap = (content) => {
            const mapIndex = mapList.findIndex((e)=>{return e.location_id == content.target.id.split('-')[1]})
            setSelectMap(mapList[mapIndex])
        }
        const tdLastChildStyle = { borderBottom: '1px solid #EBEBEB', height: '24px', fontSize: '13px',  }
        const tdStyle = { height: '24px', fontSize: '13px', borderBottom: '1px solid #EBEBEB', borderRight: '1px solid #EBEBEB' }
        for(let i = 0; i < tmp.length ; i++){
            trs.push(
                <tr key={'intersection-data-table-tbody-tr-'+i}>
                    <td style={tdStyle}><input type={'radio'} name={'radio-button-group'} id={'item-'+tmp[i].location_id} onClick={updateSelectMap.bind()} /><label htmlFor={'item-'+tmp[i].location_id}></label></td>
                    <td style={tdStyle}>{tmp[i].group.group_id}</td>
                    <td style={tdStyle}>{tmp[i].location_id}</td>
                    <td style={tdStyle}>{tmp[i].location_routerIp}</td>
                    <td style={tdStyle}>{tmp[i].location_lcIp}</td>
                    <td style={tdStyle}>{tmp[i].location_name}</td>
                    <td style={tdStyle}>{tmp[i].location_type}</td>
                    <td style={tdStyle}>{tmp[i].location_mfr}</td>
                    <td style={tdStyle}>{tmp[i].location_lat}</td>
                    <td style={tdStyle}>{tmp[i].location_long}</td>
                    <td style={tdStyle}></td>
                    <td style={tdStyle}></td>
                    <td style={tdStyle}></td>
                    <td style={tdLastChildStyle}></td>
                </tr>
            )
        }
        return trs
    }

    const createMapEvent = () => {
        setEventType(1)
    }
    const updateMapEvent = () => {
        if(selectMap!=null){
            setEventType(2)
        }else {
            swal.fire({
                icon: 'warning',
                text: '선택된 교차로가 없습니다.'
            })
        }
    }
    const saveMapDataEvent = () => {
        const mapDataTableTD = document.querySelector('.map-editor-view table').querySelectorAll('td')
        const _data = {
            location_name: mapDataTableTD[1].querySelector('input').value,
            location_mfr: mapDataTableTD[5].querySelector('input').value,
            location_type: mapDataTableTD[4].querySelector('input').value,
            location_long: mapDataTableTD[7].querySelector('input').value,
            location_lat: mapDataTableTD[6].querySelector('input').value,
            location_group: mapDataTableTD[0].innerText,
            location_distance: mapDataTableTD[8].querySelector('input').value,
            location_routerIp: mapDataTableTD[2].querySelector('input').value,
            location_lcIp: mapDataTableTD[3].querySelector('input').value
        }
        if(_data.location_name != '' && _data.location_mfr != '' && _data.location_type!=''&&_data.location_long!=''
        && _data.location_lat != '' && _data.location_distance != '' && _data.location_routerIp != '' && _data.location_lcIp != ''){
            if(eventType == 1){
                //create
                postMapCreateAPI(_data).then(()=>{
                    swal.fire({
                        icon: 'success',
                        text: '교차로를 추가했습니다.'
                    })
                    getMapListAPI().catch((e)=>{console.error(e)})
                    setEventType(0)
                })
            }else if(eventType == 2){
                //update
                patchMapUpdateAPI(_data).then(()=>{
                    swal.fire({
                        icon: 'success',
                        text: selectMap.location_name+'를 수정했습니다.'
                    })
                    getMapListAPI().catch((e)=>{console.error(e)})
                    setEventType(0)
                })
            }
        }else {
            swal.fire({
                icon: 'warning',
                text: '비어있는 데이터가 있습니다.'
            })
        }
    }
    const deleteMapEvent = () => {
        if(selectMap!=null){
            const name = selectMap.location_name.includes('교차로') ? selectMap.location_name : selectMap.location_name + '교차로'
            swal.fire({
                icon: 'warning',
                title: name + '를 삭제하겠습니까?',
                text: '교차로 이력 및 기반정보 데이터가 모두 삭제됩니다.',

                showCancelButton: true,
                confirmButtonColor: '#279CC8',
                cancelButtonColor: '#EF4F4F',
                confirmButtonText: '확인',
                cancelButtonText: '취소',
            }).then(result=>{
                if(result.isConfirmed){
                    swal.fire({
                        icon: 'success',
                        text: name+ '가 삭제되었습니다.'
                    })
                    console.log('삭제이벤트 발생')

                    deleteMapAPI(selectMap.location_id).then(()=>{
                        getMapListAPI().catch((e)=>{console.error(e)})
                        setSelectMap(null)
                    })
                }else if(result.isDismissed){
                    swal.fire({
                        icon: 'error',
                        text: '삭제를 취소했습니다.'
                    })
                }
            })
        }else {
            swal.fire({
                icon: 'warning',
                text: '선택된 교차로가 없습니다.'
            })
        }
    }
    const updateDataEvent = () => {
        if(selectMap!=null){
            setEventType(3)
        }else {
            swal.fire({
                icon: 'warning',
                text: '선택된 교차로가 없습니다.'
            })
        }
    }

    const contentViewSetDataEvent = () => {
        if(eventType == 2) {

            const mapDataTableTD = document.querySelector('.map-editor-view table').querySelectorAll('td')
            const contentDataTable = document.querySelector('.data-content-view table')

            const cameraSelect = contentDataTable.querySelectorAll('select')[0]
            const phaseSelect = contentDataTable.querySelectorAll('select')[1]
            const contentTd = contentDataTable.querySelectorAll('td')

            mapDataTableTD[0].innerText = selectMap.group.group_id
            mapDataTableTD[1].querySelector('input').value = selectMap.location_name
            mapDataTableTD[2].querySelector('input').value = selectMap.location_routerIp
            mapDataTableTD[3].querySelector('input').value = selectMap.location_lcIp
            mapDataTableTD[4].querySelector('input').value = selectMap.location_type
            mapDataTableTD[5].querySelector('input').value = selectMap.location_mfr
            mapDataTableTD[6].querySelector('input').value = selectMap.location_lat
            mapDataTableTD[7].querySelector('input').value = selectMap.location_long
            mapDataTableTD[8].querySelector('input').value = selectMap.location_distance

            cameraSelect.innerHTML = ''
            detectorList.map((item)=>{
                const optionItem = document.createElement('option')
                optionItem.innerText = item.detector_name
                cameraSelect.appendChild(optionItem)
            })
            phaseSelect.innerHTML = ''
            phaseList.map((item)=>{
                const optionItem = document.createElement('option')
                optionItem.innerText = item.phase_number + '현시'
                phaseSelect.appendChild(optionItem)
            })

            contentTd[0].innerText = detectorList[0] != undefined ? detectorList[0].camera_latitude : ''
            contentTd[1].innerText = detectorList[0] != undefined ? detectorList[0].camera_longitude : ''
            contentTd[2].innerText = detectorList[0] != undefined ? detectorList[0].camera_angle : ''
            contentTd[3].querySelectorAll('img')[0].src = phaseList[0] != undefined ? '/phaseIcon/72px/'+phaseList[0].ringA.arrow_image : ''
            contentTd[3].querySelectorAll('img')[0].style.transform =  phaseList[0] != undefined ?  `rotate(${phaseList[0].degree})` : 'rotate(0deg)'
            contentTd[3].querySelectorAll('img')[1].src = phaseList[0] != undefined ? '/phaseIcon/72px/'+phaseList[0].ringB.arrow_image : ''
            contentTd[3].querySelectorAll('img')[1].style.transform =  phaseList[0] != undefined ?  `rotate(${phaseList[0].degree})` : 'rotate(0deg)'
            contentTd[4].innerText = phaseList[0] != undefined ? phaseList[0].degree : ''

            const mapIndex = mapList.findIndex((e)=>{return e.location_id == selectMap.location_id})
            locationMarkers.map((marker, markerIndex)=>{
                const icon = marker.getIcon()
                if(mapIndex == markerIndex){
                    icon.url = '/new-map-icon.png'
                    marker.setIcon(icon)

                    naver.maps.Event.addListener(naverMap, 'click', function(e){
                        marker.setPosition(e.coord)
                        mapDataTableTD[6].querySelector('input').value = e.coord._lat
                        mapDataTableTD[7].querySelector('input').value = e.coord._lng
                    })
                }else {
                    icon.url = '/service-map-icon.png'
                    marker.setIcon(icon)
                }
            })

            naverMap.setZoom(19)
            naverMap.panTo(new naver.maps.LatLng({lat: selectMap.location_lat, lng: selectMap.location_long}))
        }
    }

    const onChangeMapImage = (file) => {
        let reader = new FileReader()
        reader.addEventListener('load', function(){
            document.getElementById('mapImage').src = reader.result
        })
        reader.readAsDataURL(file.target.files[0])
    }
    const onChangeMapCameraSelected = (select) => {

    }
    const onChangeMapPhaseSelected = (select) => {

    }

    const detectorListClickEvent = (listItem) => {
        const _index = detectorList.findIndex((e)=>{return e.detector_channel == parseInt(listItem.target.id.split('-')[1])})
        setSelectDetector(detectorList[_index])

        document.querySelectorAll('.detector-list li').forEach((e)=>{
            e.classList.remove('active')
            e.style.color= '#707070'
        })
        listItem.target.classList.add('active')
        listItem.target.style.color = '#727CF5'

    }
    const detectorListAddEvent = () => {
        if(newDetectorMarker!=null){
            swal.fire({
                icon:'warning',
                text:'저장되지 않은 검지기 정보가 있습니다.'
            })
        }else {
            if(detectorList.length > 4){
                swal.fire({
                    icon:'warning',
                    text:'검지기는 최대 4개까지 추가할 수 있습니다.'
                })
            }else {
                setSelectDetector({
                    detector_channel: '',
                    detector_name: "",
                    detector_ip: "",
                    detector_camera_ip: "",
                    internal_nano_link: "",
                    internal_camera_link: "",
                    external_nano_link: "",
                    external_camera_link: "P",
                    camera_latitude: "",
                    camera_longitude: "",
                    camera_angle: 0
                })

                newDetectorMarker = new naver.maps.Marker({
                    position: new naver.maps.LatLng({lat: selectMap.location_lat, lng: selectMap.location_long}),
                    map: naverMap,
                    title: 'cameraIcon_newIcon',
                    icon: {
                        url: '/signal_icon_gray.png',
                        size: new naver.maps.Size(50,69),
                        scaledSize: new naver.maps.Size(50,69),
                        origin: new naver.maps.Point(0,0),
                        anchor: new naver.maps.Point(10,35)
                    }
                })
            }
        }
    }
    const phaseListClickEvent = (listItem) => {

    }

    return (
        <>
            <div style={{display: 'flex'}}>
                <h3>기반 데이터 설정</h3>
                <div className={'option-button-group'}>
                    <button onClick={createMapEvent}>교차로 추가</button>
                    <button onClick={updateMapEvent}>교차로 수정</button>
                    <button onClick={deleteMapEvent}>교차로 삭제</button>
                    <button onClick={updateDataEvent}>기반정보수정</button>
                </div>
            </div>
            <Container width={'1570px'} height={'765px'} margin={'15px 0px 0px 0px'} padding={'20px'}>
                <div className={'table-view'}>
                    <table>
                        <thead>
                            <tr>
                                <th></th>
                                <th>그룹</th>
                                <th>ID</th>
                                <th>라우터 IP</th>
                                <th>제어기 IP</th>
                                <th>교차로명</th>
                                <th>제어기 연식</th>
                                <th>제어기 제조사</th>
                                <th>위도</th>
                                <th>경도</th>
                                <th>총 현시</th>
                                <th>카메라</th>
                                <th>교차로 등록 날짜</th>
                                <th>기타</th>
                            </tr>
                        </thead>
                        <tbody>
                            {createMapListTable(pageIndex)}
                        </tbody>
                    </table>
                    {createIndex()}
                </div>
                <div className={'event-view'}>
                    <div id={'map'}></div>
                    <div className={'data-view'}>
                        {
                            eventType == 3 ?
                                <div className={'data-editor-view'}>
                                    <div className={'content-container'}>
                                        <div className={'content-title'}>
                                            <label>검지기 카메라</label>
                                            <div className={'content-button-group'}>
                                                <button onClick={detectorListAddEvent}>추가</button>
                                                <button>삭제</button>
                                            </div>
                                        </div>
                                        <div className={'content-list-view'}>
                                            <div className={'detector-list'}>
                                                <ul>
                                                    {
                                                        detectorList.length > 0 ?
                                                            detectorList.map((detector, index)=>(
                                                                <li key={'detector-list-'+index} id={'detector-'+detector.detector_channel} onClick={detectorListClickEvent.bind()}>{detector.detector_name}</li>
                                                            ))
                                                            : null
                                                    }
                                                </ul>
                                            </div>
                                            {selectDetector!=null ? <div className={'detector-data-view'}>
                                                <table>
                                                    <tbody>
                                                    <tr>
                                                        <th>검지기 채널</th><td><input /></td>
                                                    </tr>
                                                    <tr>
                                                        <th>검지기 이름</th><td><input /></td>
                                                    </tr>
                                                    <tr>
                                                        <th>검지기 IP</th><td><input /></td>
                                                    </tr>
                                                    <tr>
                                                        <th>카메라 IP</th><td><input /></td>
                                                    </tr>
                                                    <tr>
                                                        <th>검지기 VPN IP</th><td><input /></td>
                                                    </tr>
                                                    <tr>
                                                        <th>카메라 VPN IP</th><td><input /></td>
                                                    </tr>
                                                    <tr>
                                                        <th>검지기 서비스 IP</th><td><input /></td>
                                                    </tr>
                                                    <tr>
                                                        <th>카메라 서비스 IP</th><td><input /></td>
                                                    </tr>
                                                    <tr>
                                                        <th>검지기 위도</th><td><input /></td>
                                                    </tr>
                                                    <tr>
                                                        <th>검지기 경도</th><td><input /></td>
                                                    </tr>
                                                    <tr>
                                                        <th>검지기 회전각</th><td><input type={"number"}/></td>
                                                    </tr>
                                                    <tr>
                                                        <th colSpan={2}>
                                                            <button style={{height: '25px', lineHeight:'12px'}}>저장</button>
                                                            <button style={{height: '25px', lineHeight:'12px'}} onClick={()=>{setSelectDetector(null)}}>취소</button>
                                                        </th>
                                                    </tr>
                                                    </tbody>
                                                </table>
                                            </div>:null}
                                        </div>
                                    </div>
                                    <div className={'content-container'}>
                                        <div className={'content-title'}>
                                            <label>이동류</label>
                                            <div className={'content-button-group'}>
                                                <button>추가</button>
                                                <button>삭제</button>
                                            </div>
                                        </div>
                                        <div className={'content-list-view'}>

                                        </div>
                                    </div>
                                </div>
                                : eventType != 0 ?
                                    <div>
                                        <div style={{display: 'flex'}}>
                                            <div className={'map-editor-view'}>
                                                <table>
                                                    <thead>
                                                    <tr>
                                                        <th colSpan={2} className={'event-view-title'}>교차로정보</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <th>그룹번호</th>
                                                            <td></td>
                                                        </tr>
                                                        <tr>
                                                            <th>교차로이름</th>
                                                            <td><input /></td>
                                                        </tr>
                                                        <tr>
                                                            <th>라우터 IP</th>
                                                            <td><input /></td>
                                                        </tr>
                                                        <tr>
                                                            <th>제어기 IP</th>
                                                            <td><input /></td>
                                                        </tr>
                                                        <tr>
                                                            <th>제어기 타입</th>
                                                            <td><input /></td>
                                                        </tr>
                                                        <tr>
                                                            <th>제어기 제조사</th>
                                                            <td><input /></td>
                                                        </tr>
                                                        <tr>
                                                            <th>위도</th>
                                                            <td><input /></td>
                                                        </tr>
                                                        <tr>
                                                            <th>경도</th>
                                                            <td><input /></td>
                                                        </tr>
                                                        <tr>
                                                            <th>거리</th>
                                                            <td><input /></td>
                                                        </tr>
                                                        <tr>
                                                            <th>기타</th>
                                                            <td><input /></td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div className={'data-content-view'}>
                                                <table>
                                                    <thead>
                                                        <tr>
                                                            <th colSpan={2} className={'event-view-title'}>기반정보</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <th colSpan={2}>위치도 <input type={'file'} id={'file_item'} accept={'image/*'} style={{width: '180px', marginLeft:'10px'}} onChange={onChangeMapImage.bind()}/></th>
                                                        </tr>
                                                        <tr>
                                                            <th colSpan={2}>
                                                                <img id={'mapImage'} width={135} height={130}/>
                                                            </th>
                                                        </tr>
                                                        <tr>
                                                            <th colSpan={2}>카메라 <select onChange={onChangeMapCameraSelected.bind()}></select></th>
                                                        </tr>
                                                        <tr>
                                                            <th>X축</th>
                                                            <td></td>
                                                        </tr>
                                                        <tr>
                                                            <th>Y축</th>
                                                            <td></td>
                                                        </tr>
                                                        <tr>
                                                            <th>ANGLE</th>
                                                            <td></td>
                                                        </tr>
                                                        <tr>
                                                            <th colSpan={2}>현시 <select onChange={onChangeMapPhaseSelected.bind()}></select></th>
                                                        </tr>
                                                        <tr>
                                                            <th>이동류</th>
                                                            <td>
                                                                <div style={{position:'relative'}}>
                                                                    <img style={{position: 'absolute', height: '70px'}} />
                                                                    <img style={{height: '70px'}} />
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <th>ANGLE</th>
                                                            <td></td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                        <div className={'editor-button-group'}>
                                            <button onClick={saveMapDataEvent}>저장</button>
                                            <button onClick={()=>{setEventType(0)}}>취소</button>
                                        </div>
                                    </div>
                                    : null
                        }
                    </div>
                </div>
            </Container>

            <style jsx>{`
              .option-button-group{
                margin-left: auto
              }
              .table-view{
                width: 100%;
                height: 195px;
                margin-bottom: 5px;
                color: #707070;
                font-size: 14px;
                text-align: center;
              }
              th{
                border-bottom: 1px solid #EBEBEB;
                border-right: 1px solid #EBEBEB;
                background-color: #F7F9FC;
                height: 30px;
              }
              .event-view{
                display: flex;
                box-shadow: 2px 2px .1px #DADBDE inset;
                padding: 10px;
                color: #707070;
              }
              #map{
                width: 1060px;
                height: 560px;
              }
              .data-view{
                padding: 10px;
                margin-left: 5px;
                width: 465px;
                height: 540px;
              }
              .map-editor-view{
                width: 48%;
              }
              .data-content-view{
                margin-left: 10px;
              }
              .map-editor-view table, .data-content-view table{
                font-size: 14px;
              }
              .map-editor-view th, .data-content-view th, .detector-data-view th{
                text-align: left;
                background-color: white;
                border: none;
                height: 30px;
              }
              .map-editor-view input, .detector-data-view input{
                color: #707070;
                font-family: NanumSquareAcB, sans-serif;
                width: 120px;
              }
              .data-content-view select{
                color: #707070;
                font-family: NanumSquareAcB, sans-serif;
                width: 120px;
                margin-left: 20px;
              }
              .event-view-title{
                font-size: 15px;
                color: #727CF5;
              }
              .editor-button-group{
                text-align: center;
                margin: 20px;
              }
              .content-title{
                display: flex;
                line-height: 30px;
                margin-bottom: 5px;
              }
              .content-button-group{
                margin-left: auto;
              }
              .content-list-view{
                width: 100%;
                height: 230px;
                box-shadow: 2px 2px .1px #DADBDE inset;
                margin-bottom: 5px;
                display: flex;
              }
              .detector-data-view{
                overflow: auto;
                height: 210px;
                font-size: 14px;
                text-align: left;
                width: 55%;
                margin-left: 10px;
                margin-top: 5px;
                background-color: white;
                padding: 10px;
              }
              .detector-list{
                width: 40%;
                border-right: 1px solid #EBEBEB;
                padding: 20px;
                font-size: 14px;
              }
              ul{
                list-style: none;
              }
              li{
                cursor: pointer
              }
            `}</style>
        </>
    );
};
export async function getServerSideProps(context) {
    return authCheck(context)
}
export default IntersectionConfig;
