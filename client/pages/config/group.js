import {useState, useEffect} from 'react';
import Container from "../../components/Container";
import {authCheck} from "../../authCheck";
import axios from "axios";
import swal from "sweetalert2";

let naverMap = null
let markers = []
let infoWindows = []

let groupMarkers = []
let groupInfoWindows = []
let locationMarkers = []
let locationInfoWindows = []

let newGroupMarker = null

const GroupEditPage = () => {

    const [loaded, setLoaded] = useState(false)

    const [groupList, setGroupList] = useState([])
    const [selectGroup, setSelectGroup] = useState(null)

    const [targetGroup, setTargetGroup] = useState(null)
    const [targetMap, setTargetMap] = useState(null)

    const mapIcon = ['map-icon-gray.png','map-icon-red.png','map-icon-orange.png', 'map-icon-yellow.png', 'map-icon-lime.png', 'map-icon-green.png','map-icon-darkgreen.png', 'map-icon-blue.png', 'map-icon-navy.png', 'map-icon-purple.png', 'map-icon-pink.png']
    const groupIcon = ['group_0.png', 'group_1.png', 'group_2.png', 'group_3.png', 'group_4.png', 'group_5.png'
                        , 'group_6.png', 'group_7.png', 'group_8.png', 'group_9.png', 'group_10.png']
    const center = {lat: 35.96334033513462, lng: 127.02098276357472}
    const zoom = 12

    useEffect(()=>{
        const scriptTag = document.createElement('script')
        scriptTag.src= 'https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=r1c367pze3'
        scriptTag.addEventListener('load', ()=>setLoaded(true))
        document.body.appendChild(scriptTag)
    },[])
    useEffect(()=>{
        if(!loaded) return
        const navermaps = window.naver.maps
        if(navermaps!=null) initMap(null, null)
        getGroupList().catch((e)=>{console.error(e)})
    },[loaded])
    useEffect(()=>{
        if(groupList.length > 0) {
            //groupList가 업데이트 되면 모든 마커를 삭제하고 새로 생성한다.
            if(groupMarkers.length > 0){
                groupMarkers.map((item)=>{ item.setMap(null) })
                groupMarkers = []
                groupInfoWindows.map((item)=>{ item.setMap(null) })
                groupInfoWindows = []
            }
            if(locationMarkers.length > 0){
                locationMarkers.map((item)=>{
                    item.map((marker)=>{ marker.setMap(null) })
                })
                locationMarkers = []
                locationInfoWindows.map((item)=>{
                    item.map((info)=>{ info.setMap(null) })
                })
                locationInfoWindows = []
            }
            groupList.map((group, index)=>{
                groupMarkers.push(
                    new naver.maps.Marker({
                        position: new naver.maps.LatLng({lat: group.group_lat, lng: group.group_long}),
                        map: naverMap,
                        title: group.group_name,
                        icon: {
                            url: '/groupIcon/'+groupIcon[index],
                            size: new naver.maps.Size(50,56),
                            scaledSize: new naver.maps.Size(37, 34),
                            origin: new naver.maps.Point(0, 0),
                            anchor: new naver.maps.Point(35, 35)
                        }
                    })
                )
                groupInfoWindows.push(new naver.maps.InfoWindow({
                    content: `<div style="width: 120px; text-align: center; font-size: 14px;">${group.group_id}번 ${group.group_name}</div>`
                }))

                if(group.location.length > 0){

                    let _marker = []
                    let _info = []
                    group.location.map((map, mapIndex)=>{
                        _marker.push(
                            new naver.maps.Marker({
                                position: new naver.maps.LatLng({lat: map.location_lat, lng: map.location_long}),
                                map: naverMap,
                                icon: {
                                    url: '/mapIcon/'+mapIcon[index],
                                    size: new naver.maps.Size(50,56),
                                    scaledSize: new naver.maps.Size(25, 34),
                                    origin: new naver.maps.Point(0, 0),
                                    anchor: new naver.maps.Point(10, 35)
                                }
                            })
                        )
                        _info.push(new naver.maps.InfoWindow({
                            content: `<div style="width: 120px; text-align: center; font-size: 14px;">${map.location_id}번 ${map.location_name}</div>`
                        }))
                    })

                    locationMarkers.push(_marker)
                    locationInfoWindows.push(_info)
                }

            })
            groupMarkers.map((item, index)=>{
                naver.maps.Event.addListener(item, 'click', function(){
                    let marker = item, infoWindow = groupInfoWindows[index]
                    if(infoWindow.getMap()) infoWindow.close()
                    else infoWindow.open(naverMap, marker)
                })
            })
            locationMarkers.map((item, index)=>{
                item.map((map, mapIndex)=>{
                    naver.maps.Event.addListener(map, 'click', function(){
                        let marker = map, infoWindow = locationInfoWindows[index][mapIndex]
                        if(infoWindow.getMap()) infoWindow.close()
                        else infoWindow.open(naverMap, marker)
                    })
                })
            })

            naver.maps.Event.addListener(naverMap, 'click', function(){
                groupInfoWindows.map((item)=>{item.close()})
                locationInfoWindows.map((item)=>{
                    item.map((info)=>{info.close()})
                })
            })

            locationMarkers.map(item=>{
                item.map(marker=>{marker.setMap(null)})
            })
        }
    },[groupList])
    useEffect(()=>{
        if(selectGroup!=null){
            const group_editor_table_data = document.getElementsByClassName('group-data-editor')[0].querySelector('table').querySelectorAll('td')
            group_editor_table_data[0].innerText = selectGroup.group_id
            group_editor_table_data[1].querySelector('input').value = selectGroup.group_name
            group_editor_table_data[2].querySelector('input').value = selectGroup.group_lat
            group_editor_table_data[3].querySelector('input').value = selectGroup.group_long
            group_editor_table_data[4].innerText = selectGroup.location != undefined ? selectGroup.location.length : null
            group_editor_table_data[5].querySelector('input').value = selectGroup.group_comment

            if(selectGroup.group_id != ''){
                const groupIndex = groupList.findIndex((e)=>{return e.group_id == selectGroup.group_id})

                locationMarkers.map((array, index)=>{
                    if(index==groupIndex){
                        array.map(marker=>{ marker.setMap(naverMap) })
                    }else {
                        array.map(marker=>{ marker.setMap(null) })
                    }
                })
                groupMarkers.map((item, index)=>{
                    if(index == groupIndex){
                        item.setMap(naverMap)
                    }else {
                        item.setMap(null)
                    }
                })
                naver.maps.Event.addListener(naverMap, 'click', function(e){
                    groupMarkers[groupIndex].setPosition(e.coord)
                    group_editor_table_data[2].querySelector('input').value = e.coord._lat
                    group_editor_table_data[3].querySelector('input').value = e.coord._lng
                })
            }else {
                if(newGroupMarker != null){
                    newGroupMarker.setMap(null)
                    newGroupMarker = null
                }
                console.log(groupList.length)
                newGroupMarker = new naver.maps.Marker({
                    position: new naver.maps.LatLng({lat: selectGroup.group_lat, lng: selectGroup.group_long}),
                    map: naverMap,
                    title: selectGroup.group_name,
                    icon: {
                        url: '/groupIcon/'+groupIcon[groupList.length],
                        size: new naver.maps.Size(50,56),
                        scaledSize: new naver.maps.Size(37, 34),
                        origin: new naver.maps.Point(0, 0),
                        anchor: new naver.maps.Point(35, 35)
                    }
                })

                naver.maps.Event.addListener(naverMap, 'click', function(e){
                    newGroupMarker.setPosition(e.coord)
                    group_editor_table_data[2].querySelector('input').value = e.coord._lat
                    group_editor_table_data[3].querySelector('input').value = e.coord._lng
                })
            }
        }
    },[selectGroup])
    useEffect(()=>{
        if(targetGroup!= null || targetMap!=null){
            locationMarkers.map((array, index)=>{
                array.map(marker=>{ marker.setMap(naverMap) })
            })
        }
    },[targetMap,targetGroup])

    const initMap = () => {
        const map = new naver.maps.Map('map', {
            center: new naver.maps.LatLng(center),
            zoom: zoom,
            zoomControl: true,
            minZoom: 10,
            maxZoom: 25,
        });
        naverMap = map
    }

    //get
    async function getGroupList() {
        try {
            const url = 'http://192.168.1.43:3001/group/listAll'
            const response = await axios.get(url)
            setGroupList(response.data)
        }catch (e) {
            console.error(e)
        }
    }
    //post
    async function postGroupListAPI(_data){
        try {
            const url = 'http://192.168.1.43:3001/group/create'
            await axios.post(url, _data)
        }catch (e) {
            console.error(e)
        }
    }
    //patch
    async function patchMapDataUpdateAPI(_data, location_id){
        try{
            const url = 'http://192.168.1.43:3001/locations/update/'+location_id
            const options = {
                headers: {
                    'accept': '*/*',
                    'Content-Type': 'application/json'
                }
            }
            await axios.patch(url, _data, options)
        }catch (e) {
            console.error(e)
        }
    }
    async function patchGroupDataUpdateAPI(_data){
        try{
            const url = 'http://192.168.1.43:3001/group/update/'+selectGroup.group_id
            const options = {
                headers: {
                    'accept': '*/*',
                    'Content-Type': 'application/json'
                }
            }
            await axios.patch(url, _data, options)
        }catch (e) {
            console.error(e)
        }
    }
    //delete
    async function deleteGroupListAPI(){
        try{
            const url = 'http://192.168.1.43:3001/group/delete/'+selectGroup.group_id
            await axios.delete(url)
        }catch (e) {
            console.error(e)
        }
    }
    //button event
    const changeSelectGroup = (radioButton) => {
        const groupIndex = groupList.findIndex((e)=>{return e.group_id == radioButton.target.value})
        setSelectGroup(groupList[groupIndex])
        targetResetEvent()
    }
    const groupListClickEvent = (listItem) => {
        document.querySelectorAll('li.active').forEach((el)=>{
            el.classList.remove('active')
            el.style.color = '#707070'
            el.style.backgroundColor = 'white'
        })
        listItem.target.classList.add('active')
        listItem.target.style.color = 'white'
        listItem.target.style.backgroundColor = '#2e3648'

        const groupIndex = groupList.findIndex((e)=>{return e.group_id == listItem.target.classList[0].split('-')[1]})
        let mapIndex = 1;
        if(listItem.target.classList.contains('group-1')){
            //독립교차로
            document.querySelectorAll('summary.active').forEach(el=>{
                el.classList.remove('active')
            })
            setTargetGroup(groupList[0])
            mapIndex = groupList[0].location.findIndex((e)=>{return e.location_id == listItem.target.value})
            setTargetMap(groupList[0].location[mapIndex])
        }else {
            if(targetGroup.group_id == 1 ){
                //독립교차로가 선택되었다가 그룹 리스트의 맵을 선택했다.
                setTargetGroup(groupList[groupIndex])
                mapIndex = groupList[groupIndex].location.findIndex((e)=>{return e.location_id == listItem.target.value})
                setTargetMap(groupList[groupIndex].location[mapIndex])
            }else {
                mapIndex = targetGroup.location.findIndex((e)=>{return e.location_id == listItem.target.value})
                setTargetMap(targetGroup.location[mapIndex])
            }
        }
        cancelEvent()

        locationMarkers.map((item)=>{ item.map((marker)=>{ marker.setAnimation(null) })})
        locationMarkers[groupIndex][mapIndex].setAnimation(naver.maps.Animation.BOUNCE)

    }
    const updateTargetGroup = (content) => {
        cancelEvent()
        document.querySelectorAll('summary.active').forEach(el=>{
            el.classList.remove('active')
        })
        content.target.classList.add('active')
        const groupIndex = groupList.findIndex((e)=>{return e.group_id == content.target.parentNode.id.split('-')[1]})
        setTargetGroup(groupList[groupIndex])
    }
    const targetResetEvent = () => {
        if(targetGroup!=null){
            setTargetGroup(null)
        }
        document.querySelectorAll('details').forEach(el=>{
            el.open = false
        })
        document.querySelectorAll('summary.active').forEach(el=>{
            el.classList.remove('active')
        })
        if(targetMap!=null){
            setTargetMap(null)
        }
        document.querySelectorAll('li.active').forEach((el)=>{
            el.classList.remove('active')
            el.style.color = '#707070'
            el.style.backgroundColor = 'white'
        })
        //li active 제거
        if(locationMarkers.length>0){
            locationMarkers.map(item=>{
                item.map(marker=>{
                    marker.setMap(null)
                    marker.setAnimation(null)
                })
            })
        }

    }

    const moveLeft = () => {
        //location event update
        if(targetMap != null){
            if(targetGroup != null && targetGroup != 1){
                swal.fire({
                    icon: 'warning',
                    text: targetMap.location_name+'을 독립교차로로 변경하시겠습니까?',

                    showCancelButton: true,
                    confirmButtonColor: '#279CC8',
                    cancelButtonColor: '#EF4F4F',
                    confirmButtonText: '확인',
                    cancelButtonText: '취소',
                }).then(result=>{
                    if(result.isConfirmed){
                        const _data = {
                            location_name: targetMap.location_name,
                            location_mfr: targetMap.location_mfr,
                            location_type: targetMap.location_type,
                            location_long: targetMap.location_long,
                            location_lat: targetMap.location_lat,
                            location_group: 1,
                            location_distance: targetMap.location_distance,
                            location_routerIp: targetMap.location_routerIp,
                            location_lcIp: targetMap.location_lcIp,
                        }
                        patchMapDataUpdateAPI(_data, parseInt(targetMap.location_id)).then(()=>{
                            getGroupList().catch((e)=>{console.error(e)})
                            swal.fire({
                                icon:'success',
                                text: targetMap.location_name+'의 그룹이 독립교차로로 변경되었습니다.'
                            })
                        })
                        cancelEvent()
                        targetResetEvent()
                    }else if(result.isDismissed){
                        swal.fire({
                            icon: 'warning',
                            text: '그룹 변경을 취소했습니다.'
                        })
                    }
                })
            }else {
                swal.fire({
                    icon: 'warning',
                    text: '그룹에 속한 교차로를 선택해주세요.'
                })
            }
        }else {
            swal.fire({
                icon: 'warning',
                text: '교차로를 선택해주세요.'
            })
        }
        cancelEvent()
        targetResetEvent()
    }
    const moveRight = () => {
        //location event update
        if(targetMap != null){
            if(targetGroup != null && targetGroup.group_id != 1){
                swal.fire({
                    icon: 'warning',
                    text: targetMap.location_name+'의 그룹을 ' + targetGroup.group_name+'으로 변경하시겠습니까?',

                    showCancelButton: true,
                    confirmButtonColor: '#279CC8',
                    cancelButtonColor: '#EF4F4F',
                    confirmButtonText: '확인',
                    cancelButtonText: '취소',
                }).then(result=>{
                    if(result.isConfirmed){

                        const _data = {
                            location_name: targetMap.location_name,
                            location_mfr: targetMap.location_mfr,
                            location_type: targetMap.location_type,
                            location_long: targetMap.location_long,
                            location_lat: targetMap.location_lat,
                            location_group: targetGroup.group_id,
                            location_distance: targetMap.location_distance,
                            location_routerIp: targetMap.location_routerIp,
                            location_lcIp: targetMap.location_lcIp,
                        }
                        patchMapDataUpdateAPI(_data, parseInt(targetMap.location_id)).then(()=>{
                            getGroupList().catch((e)=>{console.error(e)})
                            swal.fire({
                                icon:'success',
                                text: targetMap.location_name+'의 그룹이 변경되었습니다.'
                            })
                        })
                        cancelEvent()
                        targetResetEvent()
                    }else if(result.isDismissed){
                        swal.fire({
                            icon: 'warning',
                            text: '그룹 변경을 취소했습니다.'
                        })
                    }
                })
            }else {
                swal.fire({
                    icon: 'warning',
                    text: '교차로를 이동할 그룹을 선택해주세요.'
                })
            }
        }else {
            swal.fire({
                icon: 'warning',
                text: '교차로를 선택해주세요.'
            })
        }
    }
    
    const createGroupEvent = () => {
        cancelEvent()
        targetResetEvent()
        const newGroup = {
            group_id: '',
            group_name: '',
            group_comment: '',
            group_lat: center.lat,
            group_long: center.lng,
            group_zoom: 19
        }
        setSelectGroup(newGroup)
    }
    const deleteGroupEvent = () => {
        if(selectGroup!=null){
            if(selectGroup.group_id!=1){
                swal.fire({
                    icon: 'warning',
                    text: selectGroup.group_name+'를 삭제하겠습니까?',

                    showCancelButton: true,
                    confirmButtonColor: '#279CC8',
                    cancelButtonColor: '#EF4F4F',
                    confirmButtonText: '확인',
                    cancelButtonText: '취소',
                }).then(result=>{
                    if(result.isConfirmed){
                        if(selectGroup.location != undefined && selectGroup.location.length > 0){
                            swal.fire({
                                icon: 'error',
                                text: '해당 그룹에 속해있는 교차로가 있습니다.'
                            })
                        }else {
                            deleteGroupListAPI().then(()=>{
                                getGroupList().catch((e)=>{console.error(e)})
                                swal.fire({
                                    icon: 'success',
                                    text: selectGroup.group_name+ '이/가 삭제되었습니다.'
                                })
                                cancelEvent()
                            })
                        }
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
                    text: '독립교차로는 삭제할 수 없습니다.'
                })
            }

        }else {
            swal.fire({
                icon: 'warning',
                text: '선택된 그룹이 없습니다.'
            })
        }
    }

    const saveEvent = () => {
        const group_editor_table_data = document.getElementsByClassName('group-data-editor')[0].querySelector('table').querySelectorAll('td')
        const _data = {
            group_name: group_editor_table_data[1].querySelector('input').value,
            group_comment: group_editor_table_data[5].querySelector('input').value,
            group_lat: group_editor_table_data[2].querySelector('input').value,
            group_long: group_editor_table_data[3].querySelector('input').value,
            group_zoom: 19
        }
        const group_id = group_editor_table_data[0].innerText
        if(_data.group_name!=''&&_data.latitude!='' && _data.longitude!='' && _data.comment!=''){
            if(group_id != ''){
                patchGroupDataUpdateAPI(_data).then(()=>{
                    getGroupList().catch(e=>{console.error(e)})
                    cancelEvent()
                    swal.fire({
                        icon: 'success',
                        text: '그룹 정보를 수정하였습니다.'
                    })
                    naverMap.setZoom(zoom, true)
                    naverMap.panTo(new naver.maps.LatLng(center))
                })
            }else {
                postGroupListAPI(_data).then(()=>{
                    getGroupList().catch(e=>{console.error(e)})
                    cancelEvent()
                })
                swal.fire({
                    icon: 'success',
                    text: '그룹 정보를 추가하였습니다.'
                })

                if(newGroupMarker != null){
                    newGroupMarker.setMap(null)
                    newGroupMarker = null
                }
                naverMap.setZoom(zoom, true)
                naverMap.panTo(new naver.maps.LatLng(center))

            }
        }else {
            swal.fire({
                icon: 'warning',
                text: '비어있는 데이터가 있습니다.'
            })
        }


    }
    const cancelEvent = () => {
        if(selectGroup!=null){
            const group_editor_table_data = document.getElementsByClassName('group-data-editor')[0].querySelector('table').querySelectorAll('td')
            group_editor_table_data[0].innerText = ''
            group_editor_table_data[1].querySelector('input').value = ''
            group_editor_table_data[2].querySelector('input').value = ''
            group_editor_table_data[3].querySelector('input').value = ''
            group_editor_table_data[4].innerText = ''
            group_editor_table_data[5].querySelector('input').value = ''

            document.querySelectorAll('input[type="radio"]').forEach((radio)=>{
                radio.checked = false
            })
            if(newGroupMarker != null){
                newGroupMarker.setMap(null)
                newGroupMarker = null
            }
            if(locationMarkers.length>0){
                locationMarkers.map(item=>{
                    item.map(marker=>{ marker.setMap(null) })
                })
            }
            groupMarkers.map((item)=>{ item.setMap(naverMap) })
            naver.maps.Event.clearListeners(naverMap, 'click')

            if(selectGroup.group_id != ''){
                const groupIndex = groupList.findIndex((e)=>{return  e.group_id == selectGroup.group_id})
                groupMarkers[groupIndex].setPosition(new naver.maps.LatLng({lat: selectGroup.group_lat, lng: selectGroup.group_long}))
            }

            setSelectGroup(null)

        }
    }

    const returnGroupList = (groupLocation, group_id) => {
        let mapList = []
        const liStyle = {
            fontSize: '14px',
            width: '280px',
            listStyle: 'none',
            marginLeft: '10px',
            marginTop: '10px',
            cursor: 'pointer',
            padding: '4px',
            color: '#707070'
        }
        if(groupLocation!=null){
            groupLocation.forEach(e=>{
                mapList.push(
                    <li key={'location-item-'+e.location_id} style={liStyle} value={e.location_id} className={'group-'+group_id} onClick={ groupListClickEvent.bind() }>
                        {e.location_id}. {e.location_name}
                    </li>
                )
            })
        }

        return mapList
    }

    return (
        <>
            <h3>그룹 설정</h3>
            <Container width={'1570px'} height={'256spx'} padding={'10px 20px'} margin={'15px 0px 0px 0px'}>
                <div style={{display:'flex', lineHeight: '30px'}}>
                    <h4>그룹 구성 정보 편집</h4>
                    <div className={'button-group'}>
                        <button onClick={createGroupEvent}>그룹 추가</button>
                        <button onClick={deleteGroupEvent}>그룹 삭제</button>
                    </div>
                </div>
                <div className={'group-data-content'}>
                    <div className={'group-list-table'}>
                        {
                            groupList.length > 0 ?
                                groupList.map((item, index)=>(
                                    <div className={'group-list-item'} key={'group-list-item-'+index}>
                                        <input type={'radio'} id={'id_'+index} name={'group'} value={item.group_id} onClick={changeSelectGroup.bind()}/>
                                        <label htmlFor={'id_'+index}>{item.group_name} ({item.location != undefined ? item.location.length : null})</label>
                                        <img src={'/mapIcon/'+mapIcon[index]} style={{marginLeft:'4px', width: '18px', height: '24px'}}/>
                                    </div>
                                    ))
                                 : null
                        }
                    </div>
                    <div className={'group-data-editor'}>
                        {selectGroup!=null?
                            <div style={{display: 'flex'}}>
                                <table>
                                    <tbody>
                                    <tr>
                                        <th>그룹 ID</th><td style={{paddingLeft: '10px',}}></td><th>그룹이름</th><td><input /></td>
                                    </tr>
                                    <tr>
                                        <th>위도</th><td><input type={'number'}/></td><th>경도</th><td><input type={'number'}/></td>
                                    </tr>
                                    <tr>
                                        <th>교차로 개수</th><td style={{paddingLeft: '10px',}}></td><th>비고</th><td><input /></td>
                                    </tr>
                                    <tr>
                                        <td colSpan={4}><button onClick={saveEvent}>저장</button><button onClick={cancelEvent}>취소</button></td>
                                    </tr>
                                    </tbody>
                                </table>
                                <div className={'group-location-list-view'}>
                                    <div className={'list-view'}>
                                        {
                                            selectGroup.location != undefined && selectGroup.location.length > 0 ?
                                                selectGroup.location.map((item, index)=>(
                                                    <li key={'list-view-li-'+index}>{item.location_id}. {item.location_name}</li>
                                                ))
                                                :null
                                        }
                                    </div>
                                </div>
                            </div>
                            : null}
                    </div>
                </div>
            </Container>
            <Container width={'1570px'} height={'507px'} padding={'20px'} margin={'15px 0px 0px 0px'}>
                <h4>교차로 그룹 편집</h4>
                <div className={'group-list-content'}>
                    <div>
                        <div className={'map'} id={'map'}></div>
                    </div>
                    <div className={'location-list-view'}>
                        <label className={'list-title'} >독립 교차로 리스트</label>
                        {
                            groupList.length > 0 ?
                                <ul>
                                    {
                                        returnGroupList(groupList[0].location, 1)
                                    }
                                </ul> : null
                        }
                    </div>
                    <div className={'move-button-group'}>
                        <button onClick={moveRight}>▶</button>
                        <button onClick={moveLeft}>◀</button>
                    </div>
                    <div className={'group-list-view'}>
                        <label className={'list-title'} >그룹 리스트</label>
                        {
                            groupList.map((group, groupIndex)=>(
                                groupIndex != 0 ?
                                <details key={'group-list-item-'+groupIndex} id={'details-'+group.group_id}>
                                    <summary onClick={updateTargetGroup.bind()}>{group.group_name}</summary>
                                    <ul>
                                        {
                                            returnGroupList(group.location, group.group_id)
                                        }
                                    </ul>
                                </details> : null
                            ))
                        }
                    </div>
                </div>
            </Container>
            <style jsx>{`
              h4, h3 {
                color: #707070;
              }
              .group-list-content, .group-data-content {
                display: flex;
                padding-top: 10px;
              }
              .group-list-table {
                width: 380px;
                height: 160px;
                padding: 15px;
                box-shadow: 2px 2px .1px #DADBDE inset;
                overflow: auto;
                font-size: 15px;
              }

              .group-data-editor {
                width: 1200px;
                height: 160px;
                margin-left: 20px;
                padding: 15px;
                box-shadow: 2px 2px .1px #DADBDE inset;
                display: flex;
              }
              .group-location-list-view{
                width: 500px;
                padding: 4px 10px;
                border-left: 1px solid #DADBDE
              }
              .group-location-list-view label{
                font-size: 14px;
                color: #707070;
              }
              .group-location-list-view .list-view{
                height: 160px;
                overflow: auto;
                border: 1px solid #EBEBEB;
              }
              .group-location-list-view .list-view li{
                font-size: 13px;
                width: 430px;
                border: 1px solid #EBEBEB;
                //background-color: #DEDEDE;
              }

              .location-list-view {
                width: 400px;
                height: 480px;
                box-shadow: 2px 2px .1px #DADBDE inset;
                overflow: auto;
              }

              .group-list-view {
                width: 400px;
                height: 480px;
                box-shadow: 2px 2px .1px #DADBDE inset;
                overflow: auto;
              }

              .move-button-group {
                width: 50px;
                height: 30px;
                margin: 0px 10px;
                text-align: center;
                padding: 200px 0px;
              }

              button {
                width: 30px;
                height: 30px;
                padding: 0;
              }

              .list-title {
                margin: 5px;
                padding: 10px;
                display: inline-block;
                color: #707070;
                font-size: 14px;
                border-bottom: 1px solid #BEBEBE;
                width: 90%;
                cursor: pointer;
              }

              .group-data-editor table {
                width: 600px;
                text-align: left;
                font-size: 15px;
                color: #707070;
              }

              .group-data-editor td {
                height: 30px;
              }

              .group-data-editor table button {
                width: 80px;
                height: 25px;
              }

              .group-data-editor td input {
                outline: none;
                border: none;
                border-bottom: 1px solid #707070;
                margin-left: 10px;
                color: #707070;
                font-family: NanumSquareAcB;
                width: 180px;
              }

              .group-list-item {
                display: flex;
              }

              input[type='radio'] + label::before {
                margin-right: 6px;
              }

              details {
                margin-left: 10px;
                margin-top: 5px;
                font-size: 15px;
                padding: 4px;
                color: #707070
              }
              li {
                list-style: none;
                margin-left: 10px;
                margin-top: 10px;
                cursor: pointer;
                font-size: 14px;
                width: 130px;
                padding: 5px;
                color: #707070
              }

              li.active {
                color: white;
                background-color: #2e3648;
              }

              summary {
                height: 20px;
                padding: 5px;
              }

              summary.active {
                background-color: #f3f3f3;
              }
              .button-group{
                margin-left: auto;
                display: flex;
              }
              .button-group button {
                width: 80px;
              }
              .button-group button + button {
                margin-left: 4px;
              }
              
              
              .map {
                width: 800px;
                height: 480px;
                margin-right: 10px;
                background-color: #707070;
              }
            `}</style>
        </>
    );
};
export async function getServerSideProps(context) {
    return authCheck(context)
}
export default GroupEditPage;
