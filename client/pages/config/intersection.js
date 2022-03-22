import {useEffect, useState} from 'react';
import Container from "../../components/Container";
import {authCheck} from "../../authCheck";
import axios from "axios";
import swal from "sweetalert2";

let naverMap = null
let markers = []
let infoWindows = []
let detectorMarkers = []
let phaseIconMarker = null
let newMarker = null

const IntersectionConfig = () => {
    const [loaded, setLoaded] = useState(false)
    const [pageIndex, setPageIndex] = useState(0)
    const [maxIndex, setMaxIndex] = useState(1)
    const [dataType, setDataType] = useState(0)
    const [mapImage, setMapImage] = useState()
    const [center, setCenter] = useState({ //지도별 중심 좌표
        lat: 35.96334033513462, lng: 127.02098276357472
    })
    const [detectorList, setDetectorList] =useState([])
    const [selectedCameraItem, setSelectedCameraItem] = useState(null)
    const [selectedPhaseIcon, setSelectedPhaseIcon] = useState(0)
    const [phaseList, setPhaseList] = useState([])
    const [selectMap, setSelectMap] = useState(null)

    const [mapList, setMapList] = useState([])
    const [groupList, setGroupList] = useState([])

    useEffect(()=>{
        const scriptTag = document.createElement('script')
        scriptTag.src= 'https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=r1c367pze3'
        scriptTag.addEventListener('load', ()=>setLoaded(true))
        document.body.appendChild(scriptTag)
        setMaxIndex(Math.ceil(mapList.length/4))
    },[]) //naver api 연동
    useEffect(()=>{
        initMap()
        getMapListAPI().catch((e)=>{console.error(e)})
        getGroupListAPI().catch((e)=>{console.error(e)})
    },[loaded]) //naver map api 지도 연동
    useEffect(()=>{
        setMaxIndex(Math.ceil(mapList.length/4))
        UpdateMapListEvent()
        if(selectMap!=null){
            setSelectMap(mapList[parseInt(selectMap.location_id)-1])
        }
    },[mapList]) //페이지 인덱스 업데이트 및 정렬
    // useEffect(()=>{
    //     console.log(maxIndex) },[maxIndex])
    useEffect(()=>{
        if(detectorList.length > 0){
            console.log(detectorList)
            if(dataType == 3){
                detectorMarkers.map((item)=>{item.setMap(null)})
                detectorMarkers = []
                detectorList.map((item, index)=>{
                    detectorMarkers.push(
                        new naver.maps.Marker({
                            position: new naver.maps.LatLng({lat: item.camera_latitude, lng: item.camera_longitude}),
                            map: naverMap,
                            title: 'detectorIcon_'+(index+1),
                            icon: {
                                content: [
                                    `<img style="position: absolute; width: 58px; height: 77px; transform: rotate(${item.camera_angle}deg)" src="/signal_icon_gray.png"/>`
                                ].join(''),
                                size: new naver.maps.Size(58,75),
                                scaledSize: new naver.maps.Size(58,75),
                                origin: new naver.maps.Point(0,0),
                                anchor: new naver.maps.Point(30,40)
                            }
                        })
                    )
                })
            }
            if(dataType == 2) {
                const selectBox = document.getElementById('camera-select-td').querySelector('select')
                selectBox.innerHTML = ''
                detectorList.map((item)=>{
                    const optionItem = document.createElement('option')
                    optionItem.innerText = item.detector_name
                    selectBox.appendChild(optionItem)
                })
                document.getElementById('camera-position-x').querySelector('input').value = detectorList[0].camera_latitude
                document.getElementById('camera-position-y').querySelector('input').value = detectorList[0].camera_longitude
                document.getElementById('camera-angle').querySelector('input').value = detectorList[0].camera_angle
            }
        }else if(dataType == 2){
            const selectBox = document.getElementById('camera-select-td').querySelector('select')
            selectBox.innerHTML = ''
            document.getElementById('camera-position-x').querySelector('input').value = ''
            document.getElementById('camera-position-y').querySelector('input').value = ''
            document.getElementById('camera-angle').querySelector('input').value = ''
        }
    },[detectorList])
    useEffect(()=>{
        if(!loaded) return
        naverMapOptionUpdate()
        selectMapUpdate()
    },[dataType])
    useEffect(()=>{
        selectMapUpdate()
    },[selectMap])
    useEffect(()=>{
        if(document.getElementById('movement-list-data-table')!=undefined && dataType == 3){
            if(phaseList.length > 0 ){
                const table_td = document.getElementById('movement-list-data-table').querySelectorAll('td')
                table_td[0].innerText = phaseList[0].phase_number
                table_td[1].querySelector('img').src = '/phaseIcon/72px/'+phaseList[0].ringA.arrow_image
                table_td[2].querySelector('img').src = '/phaseIcon/72px/'+phaseList[0].ringB.arrow_image
                table_td[3].querySelector('select').selectedIndex = phaseList[0].ringA.arrow_id-1
                table_td[4].querySelector('select').selectedIndex = phaseList[0].ringB.arrow_id-1
                table_td[5].querySelector('input').value = phaseList[0].degree
                document.querySelectorAll(".movement-list-item li")[0].classList.add('active')
                document.querySelectorAll(".movement-list-item li")[0].style.color = '#727CF5'

                if(phaseIconMarker!= null){
                    phaseIconMarker.setMap(null)
                    phaseIconMarker = null
                }
                phaseIconMarker =  new naver.maps.Marker({
                    position: new naver.maps.LatLng({lat: selectMap.location_lat, lng: selectMap.location_long}),
                    map: naverMap,
                    title: 'phaseIcon',
                    icon: {
                        content: [
                            '<div>',
                            '<img style="position: absolute; width: 70px; height: 70px;" src="/cycle.png"/>',
                            `<img style="position: absolute; width: 70px; height: 70px; transform: rotate(${table_td[5].querySelector('input').value}deg);" src="/phaseIcon/72px/${phaseList[selectedPhaseIcon].ringA.arrow_image}"/>`,
                            `<img style="position: absolute; width: 70px; height: 70px; transform: rotate(${table_td[5].querySelector('input').value}deg);" src="/phaseIcon/72px/${phaseList[selectedPhaseIcon].ringB.arrow_image}"/>`,
                            '</div>'
                        ].join(''),
                        size: new naver.maps.Size(35,35),
                        scaledSize: new naver.maps.Size(35,35),
                        origin: new naver.maps.Point(0,0),
                        anchor: new naver.maps.Point(30,40)
                    }
                })
            }else {
                const table_td = document.getElementById('movement-list-data-table').querySelectorAll('td')
                table_td[0].innerText = ''
                table_td[1].querySelector('img').src ='/phaseIcon/72px/1.png'
                table_td[2].querySelector('img').src = '/phaseIcon/72px/1.png'
                table_td[3].querySelector('select').selectedIndex = 0
                table_td[4].querySelector('select').selectedIndex = 0
                table_td[5].querySelector('input').value = ''
            }
        }
        if(dataType == 2) {
            if(phaseList.length > 0){
                const selectBox = document.getElementById('phase-select-th').querySelector('select')
                selectBox.innerHTML = ''
                phaseList.map((item)=>{
                    const optionItem = document.createElement('option')
                    optionItem.innerText = item.phase_number + '현시'
                    selectBox.appendChild(optionItem)
                })
                const ring_a = document.getElementById('phase-image').querySelectorAll('img')[0]
                ring_a.src = '/phaseIcon/72px/'+phaseList[0].ringA.arrow_image
                ring_a.style.transform = `rotate(${phaseList[0].degree})`

                const ring_b = document.getElementById('phase-image').querySelectorAll('img')[1]
                ring_b.src = '/phaseIcon/72px/'+phaseList[0].ringB.arrow_image
                ring_b.style.transform = `rotate(${phaseList[0].degree})`

                document.getElementById('phase-angle').querySelector('input').value = phaseList[0].degree
            }else {
                const selectBox = document.getElementById('phase-select-th').querySelector('select')
                selectBox.innerHTML = ''
                document.getElementById('phase-image').querySelectorAll('img')[0].src = ''
                document.getElementById('phase-image').querySelectorAll('img')[1].src = ''
                document.getElementById('phase-angle').querySelector('input').value = ''
            }

        }

    },[phaseList])

    //GET
    async function getMapListAPI(){
        try{
            const response = await axios.get('http://192.168.1.43:3001/locations/listAll')
            setMapList(response.data)
        }catch(error){
            console.error(error)
        }
    }
    async function getGroupListAPI(){
        try{
            const response = await axios.get('http://192.168.1.43:3001/group/listAll')
            setGroupList(response.data)
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

    const CreateMapMarker = () => {
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

        naver.maps.Event.addListener(naverMap, 'idle', function(){
            let mapBounds = naverMap.getBounds()
            let marker, position

            markers.map((item, index)=>{
                marker = item
                position = item.getPosition()
                if(mapBounds.hasLatLng(position)){
                    if(!marker.getMap()) marker.setMap(naverMap)
                }else {
                    if(marker.getMap()) marker.setMap(null)
                }
            })

        })
    }
    const UpdateMapListEvent = () =>{
        if(newMarker != null){
            newMarker.setMap(null)
            newMarker = null
            removeEventListeners()
        }
        if(phaseIconMarker != null) {
            phaseIconMarker.setMap(null)
            phaseIconMarker = null
        }
        if(mapList.length > 0 && naverMap!=null){
            markers.map((item)=>{ item.setMap(null) })
            removeEventListeners()
            markers = []
            infoWindows = []
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
    }
    //naver map
    const initMap = () => {
        if(loaded){
            const map = new naver.maps.Map('map', {
                center: new naver.maps.LatLng(center),
                zoom: 13,
                zoomControl: true,
                minZoom: 10,
                maxZoom: 25,

            });
            naverMap = map
            CreateMapMarker()
        }
    }
    const selectMapUpdate = () => {
        if(newMarker!=null) {
            newMarker.setMap(null)
            newMarker = null
            removeEventListeners()
        }
        if(phaseIconMarker!=null){
            phaseIconMarker.setMap(null)
            phaseIconMarker = null
        }
        if(detectorMarkers.length > 0){
            detectorMarkers.map((item)=>{item.setMap(null)})
            detectorMarkers = []
        }
        if(dataType == 1){
            naver.maps.Event.clearListeners(naverMap, 'click')

            if(markers.length == 0) {
                CreateMapMarker()
            }

            if(newMarker==null){
                newMarker = new naver.maps.Marker({
                    position: new naver.maps.LatLng(center),
                    map: naverMap,
                    icon: {
                        url: '/new-map-icon.png',
                        size: new naver.maps.Size(50,56),
                        scaledSize: new naver.maps.Size(25, 34),
                        origin: new naver.maps.Point(0, 0),
                        anchor: new naver.maps.Point(10, 35)
                    }
                })
                naver.maps.Event.addListener(naverMap, 'click', function(e){
                    newMarker.setPosition(e.coord)
                    table_td_group[6].querySelector('input').value = e.coord._lat
                    table_td_group[7].querySelector('input').value = e.coord._lng
                })
            }
            markers.map((item)=>{
                item.setIcon({
                    url: '/service-map-icon.png',
                    size: new naver.maps.Size(50,56),
                    scaledSize: new naver.maps.Size(25, 34),
                    origin: new naver.maps.Point(0, 0),
                    anchor: new naver.maps.Point(10, 35)
                })
            })

            const table_td_group = document.getElementById('map-data-table').querySelectorAll('td')
            table_td_group[0].querySelector('select').selectedIndex = 0
            table_td_group[1].querySelector('input').value = ''
            table_td_group[2].querySelector('input').value = ''
            table_td_group[3].querySelector('input').value = ''
            table_td_group[4].querySelector('select').selectedIndex = 0
            table_td_group[5].querySelector('select').selectedIndex = 0
            // table_td_group[6].querySelector('select').selectedIndex = 0
            table_td_group[6].querySelector('input').value = ''
            table_td_group[7].querySelector('input').value = ''
            table_td_group[8].querySelector('input').value = ''

            document.getElementById('camera-select-td').querySelector('select').innerHTML = ''
            document.getElementById('camera-position-x').querySelector('input').value = ''
            document.getElementById('camera-position-y').querySelector('input').value = ''
            document.getElementById('camera-angle').querySelector('input').value = ''

            const selectBox = document.getElementById('phase-select-th').querySelector('select')
            selectBox.innerHTML = ''
            document.getElementById('phase-image').querySelectorAll('img')[0].src = ''
            document.getElementById('phase-image').querySelectorAll('img')[1].src = ''
            document.getElementById('phase-angle').querySelector('input').value = ''
        }
        else if(selectMap!==null) {

            if(dataType ==2 ){

                if(markers.length == 0) {
                    CreateMapMarker()
                }

                const table_td_group = document.getElementById('map-data-table').querySelectorAll('td') //('map-data-table')[0].querySelectorAll('td')

                naverMap.setZoom(19, true)
                naverMap.panTo(new naver.maps.LatLng({lat: mapList[parseInt(selectMap.location_id)-1].location_lat, lng: mapList[parseInt(selectMap.location_id)-1].location_long}))
                naver.maps.Event.clearListeners(naverMap, 'click')
                markers.map((item, index)=>{
                    if(index == parseInt(selectMap.location_id)-1){
                        item.setIcon({
                            url: '/new-map-icon.png',
                            size: new naver.maps.Size(50,56),
                            scaledSize: new naver.maps.Size(25, 34),
                            origin: new naver.maps.Point(0, 0),
                            anchor: new naver.maps.Point(10, 35)
                        })
                        naver.maps.Event.addListener(naverMap, 'click', function(e){
                            markers[index].setPosition(e.coord)
                            table_td_group[6].querySelector('input').value = e.coord._lat
                            table_td_group[7].querySelector('input').value = e.coord._lng
                        })
                    }else {
                        item.setIcon({
                            url: '/service-map-icon.png',
                            size: new naver.maps.Size(50,56),
                            scaledSize: new naver.maps.Size(25, 34),
                            origin: new naver.maps.Point(0, 0),
                            anchor: new naver.maps.Point(10, 35)
                        })
                    }
                })

                table_td_group[0].querySelector('select').selectedIndex = selectMap.group.group_id-1
                table_td_group[1].querySelector('input').value = selectMap.location_routerIp
                table_td_group[2].querySelector('input').value = selectMap.location_lcIp
                table_td_group[3].querySelector('input').value = selectMap.location_name
                for(let i =0 ; i < table_td_group[4].querySelector('select').options.length; i++){
                    if(table_td_group[4].querySelector('select').options[i].text == selectMap.location_type){
                        table_td_group[4].querySelector('select').options[i].selected = true
                    }
                }
                for(let i =0 ; i < table_td_group[5].querySelector('select').options.length; i++){
                    if(table_td_group[5].querySelector('select').options[i].text == selectMap.location_mfr){
                        table_td_group[5].querySelector('select').options[i].selected = true
                    }
                }
                table_td_group[6].querySelector('input').value = selectMap.location_lat
                table_td_group[7].querySelector('input').value = selectMap.location_long
                table_td_group[8].querySelector('input').value = selectMap.location_distance

                //api 요청하기 -> 검지기,이동류
                getDetectorListAPI().catch((e)=>{console.error(e)})
                getPhaseIconListAPI().catch((e)=>{console.error(e)})
            }
            if(dataType == 3){
                removeEventListeners()
                getPhaseIconListAPI().catch((e)=>{console.error(e)})
                getDetectorListAPI().catch((e)=>{console.error(e)})
                markers.map((item) => {item.setMap(null)})
                markers = []
                naverMap.setZoom(19, true)
                naverMap.panTo(new naver.maps.LatLng({lat: mapList[parseInt(selectMap.location_id)-1].location_lat, lng: mapList[parseInt(selectMap.location_id)-1].location_long}))

                document.getElementById('detector-list-data-table').querySelectorAll('td').forEach((el) => {
                    el.querySelector('input').value = ''
                })
            }
        }

    }
    const naverMapOptionUpdate = () => {
        if(selectMap!==null){
            if(dataType==3){
                naverMap.setOptions({
                    scrollWheel: false,
                    draggable: false,
                    zoomControl: false,
                })
            }else {
                naverMap.setOptions({
                    scrollWheel: true,
                    draggable: true,
                    zoomControl: true,
                })
            }
        }
    }
    const removeEventListeners = () =>{
        naver.maps.Event.clearInstanceListeners(naverMap)
        naver.maps.Event.addListener(naverMap, 'idle', function(){
            let mapBounds = naverMap.getBounds()
            let marker, position

            markers.map((item, index)=>{
                marker = item
                position = item.getPosition()
                if(mapBounds.hasLatLng(position)){
                    if(!marker.getMap()) marker.setMap(naverMap)
                }else {
                    if(marker.getMap()) marker.setMap(null)
                }
            })
        })
    }

    //table index
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
        console.log('changeIndex')
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

    //data table
    const createDataTable = (pageIndex) => {
        let trs = []
        let tmp = mapList.slice(pageIndex*4, pageIndex*4+4)
        const updateSelectMap = (content) => {
            setSelectMap(mapList[content.target.id.split('-')[1]])
        }
        const tdLastChildStyle = { borderBottom: '1px solid #EBEBEB', height: '24px', fontSize: '13px',  }
        const tdStyle = { height: '24px', fontSize: '13px', borderBottom: '1px solid #EBEBEB', borderRight: '1px solid #EBEBEB' }
        for(let i = 0; i < tmp.length ; i++){
            trs.push(
                <tr key={'intersection-data-table-tbody-tr-'+i}>
                    <td style={tdStyle}><input type={'radio'} name={'radio-button-group'} id={'item-'+i} onClick={updateSelectMap.bind()} /><label htmlFor={'item-'+i}></label></td>
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

    //component
    const MapEventView = () => {
        const containerStyle={marginLeft: '20px', fontSize: '14px', textAlign:'left', display: 'flex'}
        const titleStyle={ color: '#727CF5', height: '20px'}
        const redColor = {color: 'red'}
        const tdStyle = { height: '35px', color: '#707070'}
        const tableStyle = {width: '230px', fontFamily:'NanumSquareAcB'}
        const inputDataStyle = {width: '100px', fontFamily:'NanumSquareAcB', color: '#707070'}
        const selectStyle = {width: '105px', fontFamily:'NanumSquareAcB', color: '#707070'}
        const buttonGroup = {marginLeft: '200px', marginTop: '20px'}
        const mapImageStyle = {textAlign: 'right'}

        const onChangeImage = (file) => {
            let reader = new FileReader()
            reader.addEventListener('load', function(){
                setMapImage(reader.result)
                // downloadImg(reader.result)
            })
            reader.readAsDataURL(file.target.files[0])
        }

        const dataURLtoBlob = (dataurl) => {
            const arr = dataurl.split(',')
            const mime = arr[0].match(/:(.*?);/)[1]
            const bstr = atob(arr[1])
            let n = bstr.length
            let u8arr = new Uint8Array(n)
            while(n--){
               u8arr[n] = bstr.charCodeAt(n)
            }
            return new Blob([u8arr], {type: mime})
        }
        const downloadImg = (imgSrc) =>{
            let image = new Image()
            image.crossOrigin = 'anonymous'
            image.src = imgSrc
            let fileName = image.src.split('/').pop()
            image.onload = function(){
                const canvas = document.createElement('canvas')
                canvas.width = this.width
                canvas.height = this.height
                canvas.getContext('2d').drawImage(this, 0, 0)
                if(typeof window.navigator.msSaveBlob != 'undefined'){
                    window.navigator.msSaveBlob(dataURLtoBlob(canvas.toDataURL()), fileName)
                }else{
                    let link = document.createElement('a')
                    link.href = canvas.toDataURL()
                    link.download = 'mapImage_'+selectMap.location_id+'.png'
                    link.click()
                }
            }
        }


        const cancelEvent = () => {
            setDataType(0)
            naverMap.setZoom(13, true)
            naverMap.panTo(center)
            UpdateMapListEvent()
        }
        const addMapList = () =>{
            const table_td = document.getElementById('map-data-table').querySelectorAll('td')
            const newData = {
                "location_name": table_td[3].querySelector('input').value,
                "location_mfr": table_td[5].querySelector('select').options[table_td[5].querySelector('select').selectedIndex].value,
                "location_type": table_td[4].querySelector('select').options[table_td[4].querySelector('select').selectedIndex].value,
                "location_long":  table_td[7].querySelector('input').value,
                "location_lat":  table_td[6].querySelector('input').value,
                "location_group": 1,
                "location_distance": table_td[8].querySelector('input').value,
                "location_routerIp": table_td[1].querySelector('input').value,
                "location_lcIp": table_td[2].querySelector('input').value,
            }
            if(newData.location_name!='' && newData.location_lat!=''&& newData.location_long!='' && newData.location_distance != '' && newData.location_routerIp != '' && newData.location_lcIp !=''){
                postMapCreateAPI(newData).then(()=>{
                    getMapListAPI().catch((e)=>{console.error(e)})
                    cancelEvent()
                    swal.fire('[Success]', '교차로 추가 이벤트 성공', 'success')
                }).catch((e)=>{console.error(e)})
                //이미지를 저장...
            }
            else {
                swal.fire({
                    icon: 'warning',
                    text: '비어있는 데이터가 있습니다.'
                })
            }
        }
        const updateMapList = () =>{
            const table_td = document.getElementById('map-data-table').querySelectorAll('td')
            if(table_td[1].querySelector('input').value.length != 0 && table_td[2].querySelector('input').value.length != 0 &&table_td[3].querySelector('input').value.length != 0){
                const newData = {
                    "location_name": table_td[3].querySelector('input').value,
                    "location_mfr": table_td[5].querySelector('select').options[table_td[5].querySelector('select').selectedIndex].value,
                    "location_type": table_td[4].querySelector('select').options[table_td[4].querySelector('select').selectedIndex].value,
                    "location_long":  table_td[7].querySelector('input').value,
                    "location_lat":  table_td[6].querySelector('input').value,
                    "location_group": table_td[0].querySelector('select').selectedIndex+1,
                    "location_distance": table_td[8].querySelector('input').value,
                    "location_routerIp": table_td[1].querySelector('input').value,
                    "location_lcIp": table_td[2].querySelector('input').value,
                }

                patchMapUpdateAPI(newData).then(()=>{
                    getMapListAPI().catch(e=>{console.error(e)})
                    cancelEvent()
                    swal.fire('[Success]', '교차로 업데이트 이벤트 성공', 'success')
                }).catch(e=>{console.error(e)})
            }
        }

        const changeCameraSelect = (select) => {
            document.getElementById('camera-position-x').querySelector('input').value = detectorList[select.target.selectedIndex].camera_latitude
            document.getElementById('camera-position-y').querySelector('input').value = detectorList[select.target.selectedIndex].camera_longitude
            document.getElementById('camera-angle').querySelector('input').value = detectorList[select.target.selectedIndex].camera_angle
        }
        const changePhaseSelect = (select) => {
            const ring_a = document.getElementById('phase-image').querySelectorAll('img')[0]
            ring_a.src = '/phaseIcon/72px/'+phaseList[select.target.selectedIndex].ringA.arrow_image
            ring_a.style.transform = `rotate(${phaseList[select.target.selectedIndex].degree})`

            const ring_b = document.getElementById('phase-image').querySelectorAll('img')[1]
            ring_b.src = '/phaseIcon/72px/'+phaseList[select.target.selectedIndex].ringB.arrow_image
            ring_b.style.transform = `rotate(${phaseList[select.target.selectedIndex].degree})`

            document.getElementById('phase-angle').querySelector('input').value = phaseList[select.target.selectedIndex].degree
        }

        return (
            <div>
                <div style={containerStyle}>
                    <div>
                        <table style={tableStyle} id={'map-data-table'}>
                            <thead>
                            <tr>
                                <th colSpan={2} style={titleStyle}>교차로 정보</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <th style={tdStyle}>그룹 번호</th>
                                <td>
                                    <select disabled={true}>
                                        {
                                            groupList.length > 0 ? groupList.map((item, index)=>(
                                                <option key={'group-number-'+index}>{item.group_name}</option>
                                            )) : null
                                        }
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <th style={tdStyle}>라우터 IP<span style={redColor}>*</span></th>
                                <td><input style={inputDataStyle}/></td>
                            </tr>
                            <tr>
                                <th style={tdStyle}>제어기 IP<span style={redColor}>*</span></th>
                                <td><input style={inputDataStyle}/></td>
                            </tr>
                            <tr>
                                <th style={tdStyle}>교차로명<span style={redColor}>*</span></th>
                                <td><input style={inputDataStyle}/></td>
                            </tr>
                            <tr>
                                <th style={tdStyle}>제어기 연식</th>
                                <td><select style={selectStyle}><option>2004</option><option>2010</option></select></td>
                            </tr>
                            <tr>
                                <th style={tdStyle}>제어기 제조사</th>
                                <td><select style={selectStyle}><option>더로드아이앤씨</option><option>서돌</option></select></td>
                            </tr>
                            <tr>
                                <th style={tdStyle}>위도<span style={redColor}>*</span></th>
                                <td><input style={inputDataStyle}/></td>
                            </tr>
                            <tr>
                                <th style={tdStyle}>경도<span style={redColor}>*</span></th>
                                <td><input style={inputDataStyle}/></td>
                            </tr>
                            <tr>
                                <th style={tdStyle}>거리</th>
                                <td><input style={inputDataStyle}/></td>
                            </tr>
                            <tr>
                                <th style={tdStyle}>기타</th>
                                <td><input style={inputDataStyle}/></td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                    <div>
                        <table style={tableStyle} id={'base-data-table'}>
                            <thead>
                            <tr>
                                <th colSpan={2} style={titleStyle}>기반정보</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <th style={tdStyle} colSpan={2}>위치도 <input type={'file'} id={'file_item'} accept={'image/*'} style={{width: '180px', marginLeft:'10px'}} onChange={onChangeImage.bind(this)}/></th>
                            </tr>
                            <tr>
                                <th colSpan={2}>
                                    <div className={'mapImage'} style={mapImageStyle}>
                                        <img src={mapImage} width={135} height={130}/>
                                    </div>
                                </th>
                            </tr>
                            <tr>
                                <th style={tdStyle} colSpan={2} id={'camera-select-td'}>카메라 <select onChange={changeCameraSelect.bind()} style={{width: '120px', marginLeft:'10px', fontFamily:'NanumSquareAcB', color: '#707070'}}></select></th>
                            </tr>
                            <tr>
                                <th style={tdStyle}>X축</th>
                                <td id={'camera-position-x'}><input style={inputDataStyle} disabled={true}/></td>
                            </tr>
                            <tr>
                                <th style={tdStyle}>Y축</th>
                                <td id={'camera-position-y'}><input style={inputDataStyle} disabled={true}/></td>
                            </tr>
                            <tr>
                                <th style={tdStyle}>ANGLE</th>
                                <td id={'camera-angle'}><input style={inputDataStyle} disabled={true}/></td>
                            </tr>
                            <tr>
                                <th style={tdStyle} colSpan={2} id={'phase-select-th'}>현시 <select onChange={changePhaseSelect.bind()} style={{width: '120px', marginLeft:'10px', fontFamily:'NanumSquareAcB', color: '#707070'}}></select></th>
                            </tr>
                            <tr>
                                <th style={{height: '70px', color: '#707070'}}>이동류</th>
                                <td id={'phase-image'}>
                                    <div style={{position:'relative'}}>
                                        <img id={'phase-image-a'} style={{height: '70px', position: 'absolute'}}/>
                                        <img id={'phase-image-b'} style={{height: '70px'}}/>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <th style={tdStyle}>ANGLE</th>
                                <td id={'phase-angle'}><input style={inputDataStyle} disabled={true}/></td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div style={buttonGroup}>
                    {dataType == 1? <button onClick={addMapList}>추가</button> : <button onClick={updateMapList}>수정</button>}
                    <button onClick={cancelEvent}>취소</button>
                </div>
            </div>
        )
    }
    const updateSettingEventView = () => {
        const containerStyle={ marginLeft: '10px',}
        const cameraContainerStyle = { width: '480px', height:'270px'}
        const movementContainerStyle = {width: '480px', height: '270px', marginTop: '20px'}
        const headerOptionButtonStyle = { marginLeft: 'auto'}
        const content = {display:'flex', marginTop: '5px'}
        const itemListStyle = {  border: '2px solid #DADBDE', width: '190px', height: '230px', borderRadius: '5px', padding: '10px', fontSize: '14px', color: '#707070'}
        const tdStyle = { height: '25px', color: '#707070'}
        const itemDataAreaStyle = {
            border: '2px solid #DADBDE',
            width:'260px',
            height: '230px',
            borderRadius: '5px',
            marginLeft: '5px',
            overflow: 'auto',
            fontSize: '14px',
            padding: '10px',
            textAlign: 'left',
            color: '#707070'
        }
        const inputDataStyle = {width: '120px', fontFamily:'NanumSquareAcB', color: '#707070'}
        const phaseTableTd = {fontFamily:'NanumSquareAcB', color: '#707070', padding: '5px'}
        
        //검지기 카메라 데이터 수정, 추가, 삭제 이벤트
        const detectorListItemClickEvent = (item) => {
            //list 클릭 -> 여기서 마커 활성화
            removeEventListeners()
            document.querySelectorAll(".camera-list-item li").forEach((el) => {
                el.classList.remove("active");
                el.style.color= '#707070'
            });
            let _index = 0
            if(item.target != undefined){
                item.target.classList.add('active')
                item.target.style.color = '#727CF5'
                _index = item.target.id.split('-')[3]-1

                const table_td =  document.getElementById('detector-list-data-table').querySelectorAll('td')
                setSelectedCameraItem(detectorList[_index])
                table_td[0].querySelector('input').value = detectorList[_index].detector_channel
                table_td[1].querySelector('input').value = detectorList[_index].detector_name
                table_td[2].querySelector('input').value = detectorList[_index].detector_ip
                table_td[3].querySelector('input').value = detectorList[_index].detector_camera_ip
                table_td[4].querySelector('input').value = detectorList[_index].internal_nano_link
                table_td[5].querySelector('input').value = detectorList[_index].internal_camera_link
                table_td[6].querySelector('input').value = detectorList[_index].external_nano_link
                table_td[7].querySelector('input').value = detectorList[_index].external_camera_link
                table_td[8].querySelector('input').value = detectorList[_index].camera_latitude
                table_td[9].querySelector('input').value = detectorList[_index].camera_longitude
                table_td[10].querySelector('input').value = detectorList[_index].camera_angle
                naver.maps.Event.addListener(naverMap, 'click', function (e){
                    detectorMarkers[_index].setPosition(e.coord)
                    table_td[8].querySelector('input').value = e.coord._lat
                    table_td[9].querySelector('input').value = e.coord._lng
                })
            }else {
                item.classList.add('active')
                item.style.color = '#727CF5'

                const table_td =  document.getElementById('detector-list-data-table').querySelectorAll('td')
                setSelectedCameraItem(detectorList[_index])
                table_td[0].querySelector('input').value = ''
                table_td[1].querySelector('input').value = ''
                table_td[2].querySelector('input').value = ''
                table_td[3].querySelector('input').value = ''
                table_td[4].querySelector('input').value = ''
                table_td[5].querySelector('input').value = ''
                table_td[6].querySelector('input').value = ''
                table_td[7].querySelector('input').value = ''
                table_td[8].querySelector('input').value = ''
                table_td[9].querySelector('input').value = ''
                table_td[10].querySelector('input').value = ''

                naver.maps.Event.addListener(naverMap, 'click', function (e){
                    detectorMarkers[_index].setPosition(e.coord)
                    table_td[8].querySelector('input').value = e.coord._lat
                    table_td[9].querySelector('input').value = e.coord._lng
                })
            }
        }
        const detectorListItemUpdateEvent = () => {
            //selectedCameraItem != null && document.getElementsByClassName('camera-list-item')[0].childElementCount == detectorList.length => 업데이트
            //아니면 새로 추가했다고 보면 되려나?
            const table_td = document.getElementById('detector-list-data-table').querySelectorAll('td')
            const _data = {
                "detector_name": table_td[1].querySelector('input').value,
                "detector_ip": table_td[2].querySelector('input').value,
                "detector_camera_ip": table_td[3].querySelector('input').value,
                "internal_nano_link": table_td[4].querySelector('input').value,
                "internal_camera_link": table_td[5].querySelector('input').value,
                "external_nano_link": table_td[6].querySelector('input').value,
                "external_camera_link": table_td[7].querySelector('input').value,
                "camera_latitude": table_td[8].querySelector('input').value,
                "camera_longitude": table_td[9].querySelector('input').value,
                "camera_angle": table_td[10].querySelector('input').value,
                "location_id": selectMap.location_id,
                "detector_channel":table_td[0].querySelector('input').value
            }
            if(document.getElementsByClassName('camera-list-item')[0].childElementCount == detectorList.length){
                if(selectedCameraItem != null){
                    console.log('업데이트')
                    patchDetectorCameraUpdateAPI(_data).then(()=>{
                        getDetectorListAPI()

                        document.getElementById('detector-list-data-table').querySelectorAll('td').forEach((el) => {
                            el.querySelector('input').value = ''
                        })
                        if(document.getElementsByClassName('camera-list-item')[0].childElementCount > detectorList.length){
                            let parent = document.getElementsByClassName('camera-list-item')[0]
                            parent.removeChild(parent.lastChild)
                        }
                        document.querySelectorAll(".camera-list-item li").forEach((el) => {
                            el.classList.remove("active");
                            el.style.color= '#707070'
                        });
                        removeEventListeners()
                        swal.fire('[Success]', '검지기 업데이트 이벤트 성공', 'success')
                    })
                }
            }else {
                console.log('추가')
                if(_data.detector_channel!='' && _data.detector_name!=''){
                    postDetectorCameraCreateAPI(_data).then(()=>{
                        getDetectorListAPI()
                        detectorListItemAddEventCancel()
                        swal.fire('[Success]', '검지기 추가 이벤트 성공', 'success')
                    }).catch((e)=>{
                        console.log(e)
                    })
                }else{
                    swal.fire({
                        icon:'warning',
                        text: '비어있는 데이터가 있습니다.'
                    })
                }
            }
            
        } //저장버튼
        const detectorListItemAddEventCancel = () => {
            //취소버튼
            document.getElementById('detector-list-data-table').querySelectorAll('td').forEach((el) => {
                el.querySelector('input').value = ''
            })
            if(document.getElementsByClassName('camera-list-item')[0].childElementCount > detectorList.length){
                let parent = document.getElementsByClassName('camera-list-item')[0]
                parent.removeChild(parent.lastChild)
            }
            document.querySelectorAll(".camera-list-item li").forEach((el) => {
                el.classList.remove("active");
                el.style.color= '#707070'
            });
            removeEventListeners()

            detectorMarkers.map((item)=>{item.setMap(null)})
            detectorMarkers = []

            detectorList.map((item, index)=>{
                detectorMarkers.push(
                    new naver.maps.Marker({
                        position: new naver.maps.LatLng({lat: item.camera_latitude, lng: item.camera_longitude}),
                        map: naverMap,
                        title: 'detectorIcon_'+(index+1),
                        icon: {
                            content: [
                                `<img style="position: absolute; width: 58px; height: 77px; transform: rotate(${item.camera_angle}deg)" src="/signal_icon_gray.png"/>`
                            ].join(''),
                            size: new naver.maps.Size(58,75),
                            scaledSize: new naver.maps.Size(58,75),
                            origin: new naver.maps.Point(0,0),
                            anchor: new naver.maps.Point(30,40)
                        }
                    })
                )
            })
            setSelectedCameraItem(null)

        } //취소버튼
        const detectorListItemAddEvent = () => {
            if(detectorList.length < 4){
                if(document.getElementsByClassName('camera-list-item')[0].childElementCount == detectorList.length){
                    document.querySelectorAll(".camera-list-item li").forEach((el) => {
                        el.classList.remove("active");
                        el.style.color = '#707070'
                    });
                    setSelectedCameraItem(null)
                    removeEventListeners()
                    let newElement = document.createElement('li')
                    newElement.addEventListener('click', ()=>{detectorListItemClickEvent(newElement)})
                    newElement.innerHTML = '새로운 검지기'
                    newElement.classList.add('active')
                    newElement.id = 'camera-list-item-'+(detectorList.length+1)
                    newElement.style.color = '#727CF5'
                    document.getElementsByClassName('camera-list-item')[0].appendChild(newElement)
                    const table_td = document.getElementById('detector-list-data-table').querySelectorAll('td')
                    table_td.forEach((el) => {
                        el.querySelector('input').value = ''
                    })
                    const _marker = new naver.maps.Marker({
                        position: new naver.maps.LatLng({lat: selectMap.latitude, lng: selectMap.longitude}),
                        map: naverMap,
                        title: 'detectorIcon_'+(detectorList.length + 1),
                        icon: {
                            content: [
                                `<img style="position: absolute; width: 58px; height: 77px;" src="/signal_icon_blue.png"/>`
                            ].join(''),
                            size: new naver.maps.Size(58,75),
                            scaledSize: new naver.maps.Size(58,75),
                            origin: new naver.maps.Point(0,0),
                            anchor: new naver.maps.Point(30,40)
                        }
                    })
                    naver.maps.Event.addListener(naverMap, 'click', function (e){
                        _marker.setPosition(e.coord)
                        table_td[8].querySelector('input').value = e.coord._lat
                        table_td[9].querySelector('input').value = e.coord._lng
                    })

                    detectorMarkers.push(_marker)
                }
                else {
                    swal.fire({
                        icon: 'warning',
                        text: '저장하지 않은 새로운 검지기가 존재합니다.'
                    })
                }
            }else {
                swal.fire({
                    icon: 'warning',
                    text: '검지기는 최대 4개까지 설정할 수 있습니다.'
                })
            }
        } //추가버튼
        const detectorListItemDeleteEvent = () => {
            const table_td = document.getElementById('detector-list-data-table').querySelectorAll('td')
            if(selectedCameraItem != null){
                swal.fire({
                    icon: 'warning',
                    text: table_td[1].querySelector('input').value+'를 삭제하겠습니까?',

                    showCancelButton: true,
                    confirmButtonColor: '#279CC8',
                    cancelButtonColor: '#EF4F4F',
                    confirmButtonText: '확인',
                    cancelButtonText: '취소',
                }).then(result=>{
                    if(result.isConfirmed){
                        swal.fire({
                            icon: 'success',
                            text: table_td[0].innerText+ '현시가 삭제되었습니다.'
                        })

                        deleteDetectorCameraDeleteAPI(parseInt(table_td[0].querySelector('input').value)).then(()=>{
                            getDetectorListAPI()
                            document.getElementById('detector-list-data-table').querySelectorAll('td').forEach((el) => {
                                el.querySelector('input').value = ''
                            })
                        })
                    }else if(result.isDismissed){
                        swal.fire({
                            icon: 'error',
                            text: '삭제를 취소했습니다.'
                        })
                    }
                })
            }
        } //삭제버튼

        const phaseListItemClickEvent = (item) => {
            document.querySelectorAll(".movement-list-item li").forEach(el=>{
                el.classList.remove("active");
                el.style.color = '#707070'
            })
            if(item.target != undefined){
                item.target.classList.add('active')
                item.target.style.color = '#727CF5'

                const table_td = document.getElementById('movement-list-data-table').querySelectorAll('td')
                const phase_id = item.target.id.split('-')[3]
                table_td[0].innerText = phaseList[phase_id-1].phase_number
                table_td[1].querySelector('img').src = '/phaseIcon/72px/'+phaseList[phase_id-1].ringA.arrow_image
                table_td[2].querySelector('img').src = '/phaseIcon/72px/'+phaseList[phase_id-1].ringB.arrow_image
                table_td[3].querySelector('select').selectedIndex = phaseList[phase_id-1].ringA.arrow_id-1
                table_td[4].querySelector('select').selectedIndex = phaseList[phase_id-1].ringB.arrow_id-1
                table_td[5].querySelector('input').value = phaseList[phase_id-1].degree
                if(phaseIconMarker != null){
                    phaseIconMarker.setMap(null)
                    phaseIconMarker = null
                }
                phaseIconMarker =  new naver.maps.Marker({
                    position: new naver.maps.LatLng({lat: selectMap.location_lat, lng: selectMap.location_long}),
                    map: naverMap,
                    title: 'phaseIcon',
                    icon: {
                        content: [
                            '<div>',
                            `<img style="position: absolute; width: 70px; height: 70px; transform: rotate(${phaseList[phase_id-1].degree})" src="/cycle.png"/>`,
                            `<img style="position: absolute; width: 70px; height: 70px; transform: rotate(${phaseList[phase_id-1].degree})" src="/phaseIcon/72px/${phaseList[phase_id-1].ringA.arrow_image}"/>`,
                            `<img style="position: absolute; width: 70px; height: 70px; transform: rotate(${phaseList[phase_id-1].degree})" src="/phaseIcon/72px/${phaseList[phase_id-1].ringB.arrow_image}"/>`,
                            '</div>'
                        ].join(''),
                        size: new naver.maps.Size(35,35),
                        scaledSize: new naver.maps.Size(35,35),
                        origin: new naver.maps.Point(0,0),
                        anchor: new naver.maps.Point(30,40)
                    }
                })
                setSelectedPhaseIcon(phase_id-1)
            }else {
                item.classList.add('active')
                item.style.color = '#727CF5'
                const table_td = document.getElementById('movement-list-data-table').querySelectorAll('td')
                table_td[0].innerText = phaseList.length+1
                table_td[1].querySelector('img').src = '/phaseIcon/72px/1.png'
                table_td[2].querySelector('img').src = '/phaseIcon/72px/1.png'
                table_td[3].querySelector('select').selectedIndex = 0
                table_td[4].querySelector('select').selectedIndex = 0
                table_td[5].querySelector('input').value = ''

                if(phaseIconMarker != null){
                    phaseIconMarker.setMap(null)
                    phaseIconMarker = null
                }
                phaseIconMarker =  new naver.maps.Marker({
                    position: new naver.maps.LatLng({lat: selectMap.location_lat, lng: selectMap.location_long}),
                    map: naverMap,
                    title: 'phaseIcon',
                    icon: {
                        content: [
                            '<div>',
                            `<img style="position: absolute; width: 70px; height: 70px; transform: rotate(${phaseList[0].degree})" src="/cycle.png"/>`,
                            `<img style="position: absolute; width: 70px; height: 70px; transform: rotate(${phaseList[0].degree})" src="/phaseIcon/72px/1.png"/>`,
                            `<img style="position: absolute; width: 70px; height: 70px; transform: rotate(${phaseList[0].degree})" src="/phaseIcon/72px/1.png"/>`,
                            '</div>'
                        ].join(''),
                        size: new naver.maps.Size(35,35),
                        scaledSize: new naver.maps.Size(35,35),
                        origin: new naver.maps.Point(0,0),
                        anchor: new naver.maps.Point(30,40)
                    }
                })
            }

        } //선택
        const changeSelectedPhaseIcon = () => {
            const selectTag = document.getElementById('movement-list-data-table').querySelectorAll('select')
            console.log(selectTag[0].selectedIndex+1)
            const table_td = document.getElementById('movement-list-data-table').querySelectorAll('td')
            table_td[1].querySelector('img').src = '/phaseIcon/72px/'+(selectTag[0].selectedIndex+1)+'.png'
            table_td[2].querySelector('img').src = '/phaseIcon/72px/'+(selectTag[1].selectedIndex+1)+'.png'

            if(phaseIconMarker != null) {
                phaseIconMarker.setMap(null)
                phaseIconMarker = null
            }

            phaseIconMarker =  new naver.maps.Marker({
                position: new naver.maps.LatLng({lat: selectMap.location_lat, lng: selectMap.location_long}),
                map: naverMap,
                title: 'phaseIcon',
                icon: {
                    content: [
                        '<div>',
                        `<img style="position: absolute; width: 70px; height: 70px;" src="/cycle.png"/>`,
                        `<img style="position: absolute; width: 70px; height: 70px; transform: rotate(${table_td[5].querySelector('input').value}deg);" src="/phaseIcon/72px/${(selectTag[0].selectedIndex+1)}.png"/>`,
                        `<img style="position: absolute; width: 70px; height: 70px; transform: rotate(${table_td[5].querySelector('input').value}deg);" src="/phaseIcon/72px/${(selectTag[1].selectedIndex+1)}.png"/>`,
                        '</div>'
                    ].join(''),
                    size: new naver.maps.Size(35,35),
                    scaledSize: new naver.maps.Size(35,35),
                    origin: new naver.maps.Point(0,0),
                    anchor: new naver.maps.Point(30,40)
                }
            })


        } //select box update
        const phaseListItemUpdateEvent = () => {
            const table_td = document.getElementById('movement-list-data-table').querySelectorAll('td')
            const _index = parseInt(table_td[0].innerText)
            const _data = {
                'location_id' : selectMap.location_id,
                'phase_number' : parseInt(table_td[0].innerText),
                'ringA': table_td[3].querySelector('select').selectedIndex + 1,
                'ringB': table_td[4].querySelector('select').selectedIndex +1,
                'degree': table_td[5].querySelector('input').value
            }
            if(document.getElementsByClassName('movement-list-item')[0].querySelectorAll('li').length == phaseList.length) {
                if(selectedPhaseIcon<=phaseList.length){
                    console.log('업데이트')
                    patchPhaseIconUpdateAPI(_data).then(()=>{
                        getPhaseIconListAPI().catch((e)=>{console.error(e)})
                        swal.fire('[Success]', '이동류 업데이트 이벤트 성공', 'success')
                    }).catch((e)=>{
                        console.error(e)
                    })
                }
            }else {
                console.log('추가')
                if(_data.degree != ''){
                    postPhaseIconCreateAPI(_data).then(()=>{
                        getPhaseIconListAPI().catch((e)=>{console.error(e)})
                        phaseListItemCancelEvent()
                        swal.fire('[Success]', '이동류 추가 이벤트 성공', 'success')
                    }).catch((e)=>{
                        console.error(e)
                    })
                }else {
                    swal.fire({
                        icon: 'warning',
                        text: '이동류 회전값이 비어있습니다.'
                    })
                }
            }
        } //이동류저장버튼(UPDATE/CREATE)
        const phaseListItemCancelEvent = () => {
            if(phaseIconMarker!=null){
                phaseIconMarker.setMap(null)
                phaseIconMarker = null
            }

            const ListLength = document.querySelectorAll(".movement-list-item li").length
            if(phaseList.length < ListLength){
                let parent = document.getElementsByClassName('movement-list-item')[0]
                parent.removeChild(parent.lastChild)
            }

            const table_td = document.getElementById('movement-list-data-table').querySelectorAll('td')
            table_td[0].innerText = phaseList[selectedPhaseIcon].phase_number
            table_td[1].querySelector('img').src = '/phaseIcon/72px/'+phaseList[selectedPhaseIcon].ringA.arrow_image
            table_td[2].querySelector('img').src = '/phaseIcon/72px/'+phaseList[selectedPhaseIcon].ringB.arrow_image
            table_td[3].querySelector('select').selectedIndex = phaseList[selectedPhaseIcon].ringA.arrow_id-1
            table_td[4].querySelector('select').selectedIndex = phaseList[selectedPhaseIcon].ringB.arrow_id-1
            table_td[5].querySelector('input').value = phaseList[selectedPhaseIcon].degree

            document.querySelectorAll('.movement-list-item li').forEach(e=>{
                e.classList.remove('active')
                e.style.color = '#707070'
            })
            document.querySelectorAll('.movement-list-item li')[selectedPhaseIcon].style.color = '#727CF5'
            document.querySelectorAll('.movement-list-item li')[selectedPhaseIcon].classList.add('active')

            phaseIconMarker =  new naver.maps.Marker({
                position: new naver.maps.LatLng({lat: selectMap.location_lat, lng: selectMap.location_long}),
                map: naverMap,
                title: 'phaseIcon',
                icon: {
                    content: [
                        '<div>',
                        '<img style="position: absolute; width: 70px; height: 70px;" src="/cycle.png"/>',
                        `<img style="position: absolute; width: 70px; height: 70px; transform: rotate(${table_td[5].querySelector('input').value}deg);" src="/phaseIcon/72px/${phaseList[selectedPhaseIcon].ringA.arrow_image}"/>`,
                        `<img style="position: absolute; width: 70px; height: 70px; transform: rotate(${table_td[5].querySelector('input').value}deg);" src="/phaseIcon/72px/${phaseList[selectedPhaseIcon].ringB.arrow_image}"/>`,
                        '</div>'
                    ].join(''),
                    size: new naver.maps.Size(35,35),
                    scaledSize: new naver.maps.Size(35,35),
                    origin: new naver.maps.Point(0,0),
                    anchor: new naver.maps.Point(30,40)
                }
            })

        } //취소버튼
        const phaseListItemAddEvent = () => {
            if(document.getElementsByClassName('movement-list-item')[0].querySelectorAll('li').length<=phaseList.length){
                document.querySelectorAll(".movement-list-item li").forEach(el=>{
                    el.classList.remove("active");
                    el.style.color = '#707070'
                })
                let newElement = document.createElement('li')
                newElement.addEventListener('click', ()=>{phaseListItemClickEvent(newElement)})
                newElement.innerText = phaseList.length+1 + ' 현시'
                newElement.style.color = '#727CF5'
                newElement.classList.add('active')
                document.getElementsByClassName('movement-list-item')[0].appendChild(newElement)

                const table_td = document.getElementById('movement-list-data-table').querySelectorAll('td')
                table_td[0].innerText = phaseList.length+1
                table_td[1].querySelector('img').src ='/phaseIcon/72px/1.png'
                table_td[2].querySelector('img').src = '/phaseIcon/72px/1.png'
                table_td[3].querySelector('select').selectedIndex = 0
                table_td[4].querySelector('select').selectedIndex = 0
                table_td[5].querySelector('input').value = ''
            }else {
                swal.fire({
                    icon: 'warning',
                    text: '저장하지 않은 현시가 존재합니다.'
                })
            }
        } //추가버튼
        const phaseListItemDeleteEvent = () => {
            const table_td = document.getElementById('movement-list-data-table').querySelectorAll('td')
            if(selectedPhaseIcon != null){
                swal.fire({
                    icon: 'warning',
                    text: table_td[0].innerText+'현시를 삭제하시겠습니까?',

                    showCancelButton: true,
                    confirmButtonColor: '#279CC8',
                    cancelButtonColor: '#EF4F4F',
                    confirmButtonText: '확인',
                    cancelButtonText: '취소',
                }).then(result=>{
                    if(result.isConfirmed){
                        swal.fire({
                            icon: 'success',
                            text: table_td[0].innerText+ '현시가 삭제되었습니다.'
                        })

                        setSelectedPhaseIcon(0)
                        deletePhaseIconDeleteAPI(parseInt(table_td[0].innerText)).then(()=>{
                            getPhaseIconListAPI().catch((e)=>{console.error(e)})

                        })
                    }else if(result.isDismissed){
                        swal.fire({
                            icon: 'error',
                            text: '삭제를 취소했습니다.'
                        })
                    }
                })
            }
        } //이동류삭제버튼(DELETE)

        //검지기 아이콘 회전값 
        const changeAngleEvent = (content) => {
            const listItem = document.getElementsByClassName('camera-list-item')[0].querySelectorAll('li')
            let _activeIndex = 0
            listItem.forEach(e=>{
              if(e.classList.contains('active')){
                  _activeIndex = parseInt(e.id.split('-')[3])
              }
            })
            if(_activeIndex != 0){
                const icon = document.querySelector(`div[title|='detectorIcon_${_activeIndex}']`).querySelector('img')
                icon.style.transform = `rotate(${content.target.value}deg)`
            }
        }
        const changePhaseAngleEvent = (content) => {
            const imageGroup = document.querySelector(`div[title|='phaseIcon']`).querySelectorAll('img')
            imageGroup[1].style.transform = `rotate(${content.target.value}deg)`
            imageGroup[2].style.transform = `rotate(${content.target.value}deg)`
        }
        return (
            <div style={containerStyle}>
                <div style={cameraContainerStyle}>
                    <div style={{ display: 'flex'}}>
                        <h4 style={{ color: 'black', fontSize: '14px' }}>검지기 카메라</h4>
                        <div style={headerOptionButtonStyle}>
                            <button style={{height: '20px', lineHeight:'13px', fontSize: '13px', marginRight: '4px'}} onClick={detectorListItemAddEvent}>추가</button>
                            <button style={{height: '20px', lineHeight:'13px', fontSize: '13px'}} onClick={detectorListItemDeleteEvent}>삭제</button>
                        </div>
                    </div>
                    <div style={content}>
                        <div style={itemListStyle}>
                            <ul style={{listStyle:'none',}} className={'camera-list-item'}>
                                {detectorList.map((item, index)=>(
                                    <li key={'detectorList-item-'+index} style={{height: '30px', cursor: 'pointer'}} onClick={detectorListItemClickEvent.bind()} id={'camera-list-item-'+item.detector_channel}>{item.detector_name}</li>
                                ))}
                            </ul>
                        </div>
                        <div style={itemDataAreaStyle}>
                            <table id={'detector-list-data-table'}>
                                <tbody>
                                    <tr>
                                        <th>검지기 채널</th>
                                        <td style={tdStyle}><input style={inputDataStyle}/></td>
                                    </tr>
                                    <tr>
                                        <th>검지기 이름</th>
                                        <td style={tdStyle}><input style={inputDataStyle}/></td>
                                    </tr>
                                    <tr>
                                        <th>검지기 IP</th>
                                        <td style={tdStyle}><input style={inputDataStyle} /></td>
                                    </tr>
                                    <tr>
                                        <th>카메라 IP</th>
                                        <td style={tdStyle}><input style={inputDataStyle}/></td>
                                    </tr>
                                    <tr>
                                        <th>검지기 VPN IP</th>
                                        <td style={tdStyle}><input style={inputDataStyle}/></td>
                                    </tr>
                                    <tr>
                                        <th>카메라 VPN IP</th>
                                        <td style={tdStyle}><input style={inputDataStyle}/></td>
                                    </tr>
                                    <tr>
                                        <th>검지기 서비스 IP</th>
                                        <td style={tdStyle}><input style={inputDataStyle}/></td>
                                    </tr>
                                    <tr>
                                        <th>카메라 서비스 IP</th>
                                        <td style={tdStyle}><input style={inputDataStyle}/></td>
                                    </tr>
                                    <tr>
                                        <th>검지기 위도</th>
                                        <td style={tdStyle}><input style={inputDataStyle}/></td>
                                    </tr>
                                    <tr>
                                        <th>검지기 경도</th>
                                        <td style={tdStyle}><input style={inputDataStyle}/></td>
                                    </tr>
                                    <tr>
                                        <th>검지기 회전각</th>
                                        <td style={tdStyle}><input type={'number'} style={inputDataStyle} onChange={changeAngleEvent.bind()}/></td>
                                    </tr>
                                </tbody>
                            </table>
                            <div style={headerOptionButtonStyle}>
                                <button style={{height: '20px', lineHeight:'13px', fontSize: '13px', marginRight: '4px'}} onClick={detectorListItemUpdateEvent}>저장</button>
                                <button style={{height: '20px', lineHeight:'13px', fontSize: '13px'}} onClick={detectorListItemAddEventCancel}>취소</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div style={movementContainerStyle}>
                    <div style={{ display: 'flex'}}>
                        <h4 style={{ color: 'black', fontSize: '14px' }}>이동류</h4>
                        <div style={headerOptionButtonStyle}>
                            <button style={{height: '20px', lineHeight:'13px', fontSize: '13px', marginRight: '4px'}} onClick={phaseListItemAddEvent}>추가</button>
                            <button style={{height: '20px', lineHeight:'13px', fontSize: '13px'}} onClick={phaseListItemDeleteEvent}>삭제</button>
                        </div>
                    </div>
                    <div style={content}>
                        <div style={itemListStyle}>
                            <ul style={{listStyle:'none',}} className={'movement-list-item'}>
                                {phaseList.map((item, index)=>(
                                    <li key={'movement-list-item-'+index} style={{height: '30px', cursor: 'pointer'}} id={'movement-list-item-'+item.phase_number} onClick={phaseListItemClickEvent.bind()}>
                                        {item.phase_number} 현시
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div style={itemDataAreaStyle}>
                            <table id={'movement-list-data-table'}>
                                <tbody>
                                <tr>
                                    <th>현시</th>
                                    <td style={phaseTableTd} colSpan={3}></td>
                                </tr>
                                <tr>
                                    <th rowSpan={2}>이동류</th>
                                    <td style={{textAlign: 'center', padding: '5px',}}><img style={{width: '72px'}} /></td>
                                    <td style={{textAlign: 'center'}}><img style={{width: '72px'}} /></td>
                                </tr>
                                <tr>
                                    <td style={phaseTableTd}>
                                        <span>A링 : </span>
                                        <select onChange={changeSelectedPhaseIcon}>
                                            <option>1번</option>
                                            <option>2번</option>
                                            <option>3번</option>
                                            <option>4번</option>
                                            <option>5번</option>
                                            <option>6번</option>
                                            <option>7번</option>
                                            <option>8번</option>
                                            <option>9번</option>
                                            <option>10번</option>
                                            <option>11번</option>
                                            <option>12번</option>
                                            <option>13번</option>
                                            <option>14번</option>
                                            <option>15번</option>
                                            <option>16번</option>
                                        </select>
                                    </td>
                                    <td style={phaseTableTd}>
                                        <span>B링 : </span>
                                        <select onChange={changeSelectedPhaseIcon}>
                                            <option>1번</option>
                                            <option>2번</option>
                                            <option>3번</option>
                                            <option>4번</option>
                                            <option>5번</option>
                                            <option>6번</option>
                                            <option>7번</option>
                                            <option>8번</option>
                                            <option>9번</option>
                                            <option>10번</option>
                                            <option>11번</option>
                                            <option>12번</option>
                                            <option>13번</option>
                                            <option>14번</option>
                                            <option>15번</option>
                                            <option>16번</option>
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <th>ANGLE</th>
                                    <td style={phaseTableTd} colSpan={3}><input type={'number'} style={inputDataStyle} onChange={changePhaseAngleEvent.bind()}/></td>
                                </tr>
                                </tbody>
                            </table>
                            <div style={headerOptionButtonStyle}>
                                <button style={{height: '20px', lineHeight:'13px', fontSize: '13px', marginRight: '4px'}} onClick={phaseListItemUpdateEvent}>저장</button>
                                <button style={{height: '20px', lineHeight:'13px', fontSize: '13px'}} onClick={phaseListItemCancelEvent}>취소</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    //button event
    const createMapEvent = () => {
        if(dataType == 1){
            setDataType(0)
            naverMap.setZoom(13, true)
            naverMap.panTo(center)
            UpdateMapListEvent()
        }else {
            setDataType(1)
        }
    }
    const updateMapEvent = () => {
        if(selectMap!==null){
            if(dataType == 2){
                setDataType(0)
                naverMap.setZoom(13, true)
                naverMap.panTo(center)
                UpdateMapListEvent()
            }else {
                setDataType(2)
            }
        }else {
            swal.fire({
                icon: 'warning',
                text: '선택된 교차로가 없습니다.'
            })
        }
    }
    const updateSettingEvent = () => {
        //기반정보 업데이트
        if(selectMap!==null){
            if(dataType == 3){
                setDataType(0)
                naverMap.setZoom(13, true)
                naverMap.panTo(center)
                UpdateMapListEvent()
            }else {
                setDataType(3)
                //여기서 아이콘 그려버리쟈
                removeEventListeners()
                detectorList.map((item, index)=>{
                    if(item.camera_pointX!=0 && item.camera_pointY != 0){
                        const _marker = new naver.maps.Marker({
                            position: new naver.maps.LatLng({lat: item.camera_pointX, lng: item.camera_pointY}),
                            map: naverMap,
                            title: 'cameraIcon_'+detectorList[index].detector_channel,
                            icon: {
                                url: '/signal_icon_gray.png',
                                size: new naver.maps.Size(50,69),
                                scaledSize: new naver.maps.Size(50,69),
                                origin: new naver.maps.Point(0,0),
                                anchor: new naver.maps.Point(10,35)
                            }
                        })

                        detectorMarkers.push(_marker)

                        const icon = document.querySelector(`div[title|="cameraIcon_${detectorList[index].detector_channel}"]`)
                        icon.style.transform = `rotate(${detectorList[index].camera_angle}deg)`
                    }
                })
            }
        }else {
            swal.fire({
                icon: 'warning',
                text: '선택된 교차로가 없습니다.'
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
                        getMapListAPI().then(()=>{

                        })
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

    return (
        <>
            <div className={'title-option'}>
                <h3>기반 데이터 설정</h3>
                <div className={'option-button-group'}>
                    <button className={'option-button'} onClick={deleteMapEvent}>교차로 삭제</button>
                    <button className={'option-button'} onClick={createMapEvent}>교차로 추가</button>
                    <button className={'option-button'} onClick={updateMapEvent}>교차로 수정</button>
                    <button className={'option-button'} onClick={updateSettingEvent}>기반정보 수정</button>
                </div>
            </div>
            <Container width={'1570px'} height={'765px'} margin={'15px 0px 0px 0px'} padding={'20px'}>
                <div className={'content-list-table'}>
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
                            {mapList.length > 0 ? createDataTable(pageIndex) : null}
                        </tbody>
                    </table>
                    <div>
                        {createIndex()}
                    </div>
                </div>
                <div className={'setting-view'}>
                    <div className={'map'} id={'map'}>
                    </div>
                    {dataType == 1 ? MapEventView() : dataType == 2 ? MapEventView() : dataType == 3 ? updateSettingEventView() : null }
                </div>
            </Container>

            <style jsx>{`
              h4, h3{
                color: #707070;
              }
              .title-option{
                display: flex;
              }
              .option-button{
                margin-left: 4px;
              }
              .option-button-group{
                display: flex;
                margin-left: auto;
              }
              .setting-view {
                width: 99%;
                height: 560px;
                box-shadow: 2px 2px .1px #DADBDE inset;
                padding: 10px;
                display: flex;
              }
              table {
                text-align: center;
                font-size: 14px;
                color: #707070;
              }
              th {
                border-bottom: 1px solid #EBEBEB;
                border-right: 1px solid #EBEBEB;
                background-color: #F7F9FC;
                height: 20px;
              }

              td:not(:last-child) {
                border-right: 1px solid #EBEBEB;
              }

              td {
                height: 20px;
                border-bottom: 1px solid #EBEBEB;
              }
              .content-list-table{
                width: 100%;
                height: 185px;
              }
              .map{
                width: 1060px;
                height: 570px;
                background-color: #707070;
              }
            `}</style>
        </>
    );
};
export async function getServerSideProps(context) {
    return authCheck(context)
}
export default IntersectionConfig;
