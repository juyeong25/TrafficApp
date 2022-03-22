import React, {useState, useEffect} from 'react';
import Container from "../../components/Container";
import axios from "axios";
import {authCheck} from "../../authCheck";
import io from 'socket.io-client';
import swal from "sweetalert2";

const socket =  io.connect('http://192.168.1.182:9000/')
const SignalMap = () => {

    const [groupList, setGroupList] = useState([])
    const [groupIndex, setGroupIndex] = useState(1)
    const [mapList, setMapList] = useState([])
    const [mapIndex, setMapIndex] =useState(1)
    const [detectorType, setDetectorType] = useState(3)

    const [signalMapA, setSignalMapA] = useState([])
    const [signalMapB, setSignalMapB] = useState([])
    const [flashMap, setFlashMap] = useState([])

    useEffect(()=>{
        getGroupListAPI().catch((e)=>{console.error(e)})
        getMapListAPI().catch((e)=>{console.error(e)})

        socket.on('SignalmapUpload', (_data)=>{
            console.log('signalMap : ',_data)
            const _type = _data[5].toString(2).padStart(8, '0').slice(0,4)
            const _index = parseInt(_data[5].toString(2).padStart(8, '0').slice(4), 2)
            document.getElementById('signal-map-type-select').selectedIndex = _index

            if(_type == '0011' || _type == '0001'){ //A링
                setSignalMapA(_data)
            }else if(_type == '0100' || _type == '0010'){ //B링
                setSignalMapB(_data)
            }
        })
        socket.on('FlashmapUpload', (_data)=>{
            console.log('flashMap : ', _data)
            setFlashMap(_data)
        })
    },[])
    useEffect(()=>{
        clearInterval(timerInterval)
        if(signalMapA.length > 0){
            const table = document.getElementById('A-signal-map-table')
            setSignalMapTable(table,signalMapA)
            if(signalMapB.length > 0){
                swal.fire('업로드 완료','','success')
            }
        }
    },[signalMapA])
    useEffect(()=>{
        clearInterval(timerInterval)
        if(signalMapB.length > 0){
            const table = document.getElementById('B-signal-map-table')
            setSignalMapTable(table,signalMapB)
            if(signalMapA.length > 0){
                swal.fire('업로드 완료','','success')
            }
        }
    },[signalMapB])
    useEffect(()=>{
        clearInterval(timerInterval)
        if(flashMap.length > 0){
            swal.fire('업로드 완료','','success')
            const dataArray = []
            for(let i = 5 ; i < flashMap.length-2; i++){
                dataArray.push(flashMap[i].toString(2).padStart(8, '0'))
            }
            document.getElementsByClassName('flash-time-item')[0].querySelector('input').value = flashMap[flashMap.length-2]
            document.getElementById('flash-map-table').querySelectorAll('td').forEach((td)=>{
                if(td.parentElement.rowIndex == 1){
                    td.innerText = flashData_detectorType3(dataArray[td.cellIndex-1].slice(4))
                    td.style.color = td.innerText == 'G' ? 'green' : td.innerText == 'R' ? 'red' : td.innerText == 'Y' ? '#F28100' : '#707070'
                }else {
                    td.innerText = flashData_detectorType3(dataArray[td.cellIndex-1].slice(0, 4))
                    td.style.color = td.innerText == 'G' ? 'green' : td.innerText == 'R' ? 'red' : td.innerText == 'Y' ? '#F28100' : '#707070'
                }
            })
        }
    },[flashMap])

    async function getGroupListAPI(){
        try{
            const response = await axios.get('http://192.168.1.43:3001/group/listAll')
            setGroupList(response.data)
        }catch (e) {
            console.error(e)
        }
    }
    async function getMapListAPI(){
        try{
            const response = await axios.get('http://192.168.1.43:3001/locations/listAll')
            setMapList(response.data)
        }catch (e) {
            console.error(e)
        }
    }

    const signalMapUploadEvent = () => {
        setSignalMapA([])
        setSignalMapB([])
        const signalMap_mapIndex = document.getElementById('signal-map-type-select').selectedIndex.toString(2).padStart(4, '0')
        const signalMap_mapType_A = parseInt(parseInt(detectorType == 3? '0011' + signalMap_mapIndex : '0001' + signalMap_mapIndex, 2).toString(16), 16)
        const signalMap_mapType_B = parseInt(parseInt(detectorType == 3? '0100' + signalMap_mapIndex : '0010' + signalMap_mapIndex, 2).toString(16), 16)
        socket.emit('upload_request', [0x7e, 0x7e, 5, mapIndex, 0xBE, signalMap_mapType_A])
        socket.emit('upload_request', [0x7e, 0x7e, 5, mapIndex, 0xBE, signalMap_mapType_B])
        funcSwal()
    }
    const flashMapUploadEvent = () => {
        setFlashMap([])
        socket.emit('upload_request', [0x7e, 0x7e, 4, mapIndex, 0xC2])
        funcSwal()
    }

    var timerInterval
    const funcSwal = () => {
        swal.fire({
            title: '업로드 요청중...',
            html: '남은 요청 시간 : <b></b> sec',
            timer: 6000,
            timerProgressBar: true,
            didOpen: ()=>{
                swal.showLoading();
                const b = swal.getHtmlContainer().querySelector('b')
                timerInterval = setInterval(() => {
                    b.textContent = (swal.getTimerLeft())/1000
                }, 100)
            }
            ,willClose: ()=>{
                clearInterval(timerInterval);
                swal.hideLoading();
            }
        }).then((result)=>{
            if(result.dismiss === 'timer') {
                swal.fire('Timeout','요청 시간 초과','error')
            }
        })
    }

    const setSignalMapTable = (table,array) => {
        const _data = array.slice(7, -1)

        const sliceIndex = []
        let index = _data.indexOf(0)
        while(index != -1){
            sliceIndex.push(index)
            index = _data.indexOf(0, index + 1)
        }
        const _code = _data.slice(0, sliceIndex[0])
        console.log(_code)
        const _stepData = _data.slice(sliceIndex[0]+1, sliceIndex[1])
        const _stepTime = _data.slice(sliceIndex[1]+1, sliceIndex[2])
        const _checkCode = _data.slice(sliceIndex[2]+1)

        setCodeDataTable(table,_code)
        setStepDataTable(table,_stepData, _stepTime)
    }
    const setCodeDataTable = (table,array) => {
        let _code = []
        let _data = []
        for(let e in array){
            _data.push(array[e].toString(2).padStart(8, '0'))
        }
        //압축풀기
        for(let i = 0 ; i < _data.length; i++){
            if(_data[i].slice(0,3) === '110'){
                //32회 미만 반복
                const length = parseInt('000'+_data[i].slice(3), 2)
                if(_data[i+1].slice(0,2) === '11'){
                    //0반복
                    for(let  j = 0 ; j < length; j++){
                        _code.push('00000000')
                    }
                }else {
                    //0이 아닌 값 반복
                    for(let j = 0 ; j < length; j++){
                        _code.push(_data[i+1])
                    }
                    i++
                }
            }else if(_data[i].slice(0,3) === '111'){
                //32회 이상 반복
                const length = parseInt('000'+_data[i].slice(3)+_data[i+1], 2)
                if(_data[i+2].slice(0, 2) === '11'){
                    //0 반복
                    for(let j = 0 ; j < length ; j++){
                        _code.push('00000000')
                    }
                    i++
                }else {
                    //0이 아닌 값 반복
                    for(let j = 0 ; j < length; j++){
                        _code.push(_data[i+2])
                    }
                    i = i + 2
                }
            }else {
                //일회성 0이 아닌 값
                _code.push(_data[i])
            }
        }
        if(_code.length < 512 ){ //32행 * 16열
            while(_code.length < 512){
                _code.push('00000000')
            }
        }
        //테이블에 데이터 뿌리기
        const trs = table.querySelectorAll('tr')
        const tds_length = trs[3].querySelectorAll('td').length
        let g1 = 0;
        let g2 = 0
        for(let i = 1 ; i < tds_length - 2; i++){
            for(let j = 2; j < trs.length; j++){
                if(i%2 !== 0){
                    const data =  signalData_detectorType3(_code[g2].slice(0,4))
                    table.rows[j].cells[i].innerText = data
                    table.rows[j].cells[i].style.color = data == 'G' || data == 'GF' ? 'green' : data == 'Y' || data == 'YF' ? '#F28100' : data =='R' || data =='RF' ? 'red' : '#707070'
                    g2++
                }else {
                    const data = signalData_detectorType3(_code[g1].slice(4))
                    table.rows[j].cells[i].innerText = data
                    table.rows[j].cells[i].style.color = data == 'G' || data == 'GF' ? 'green' : data == 'Y' || data == 'YF' ? '#F28100' : data =='R' || data =='RF' ? 'red' : '#707070'
                    g1++
                }
            }
        }
    }
    const setStepDataTable = (table,_data, _time) => {
        let _step = []
        let _array = []
        for(let e in _data){
            _array.push(_data[e].toString(2).padStart(8, '0'))
        }
        let _timeArray = []
        for(let e in _time) {
            _timeArray.push(_time[e].toString(2).padStart(8, '0'))
        }

        //압축풀기
        let _rows = []
        let count = 0
        _array.forEach((e)=>{
            _rows.push(e.slice(6))
            _rows.push(e.slice(4,6))
            _rows.push(e.slice(2,4))
            _rows.push(e.slice(0,2))
        })
        for(let i = 0 ; i < _rows.length; i++ ){
            let code, min, max, eop = ''
            switch (_rows[i]){
                case '10':
                    min = 3
                    max = 0
                    eop = 0
                    break
                case '11':
                    min = 3
                    max = 0
                    eop = 1
                    break
                case '01':
                    min = _timeArray[count].slice(0,1) == 1 ? parseInt('0'+_timeArray[count].slice(1), 2) : parseInt(_timeArray[count], 2)
                    max = 0
                    eop = _timeArray[count].slice(0,1) == 1 ? 1 : 0
                    count++
                    break
                case '00':
                    if(_timeArray[count] == '00000001'){
                        min = _timeArray[count+1].slice(0,1) == '1' ? parseInt('0'+_timeArray[count+1].slice(1,8), 2) : 0
                        max = _timeArray[count+1].slice(0,1) == '1' ? parseInt(_timeArray[count+2],2) : parseInt(_timeArray[count+1],2)
                        eop = 1
                    }else {
                        min = 0
                        max = _timeArray[count] != undefined ? parseInt(_timeArray[count], 2) : 0
                        eop = 0
                    }
                    count++
                    break
            }
            code = _rows[i]
            _step.push({code, min, max, eop})
        }
        const trs = table.querySelectorAll('tr')
        for(let i = 2 ; i < trs.length; i++){
            if(_step[i-2] != undefined){
                table.rows[i].cells[33].innerText = _step[i-2].min
                table.rows[i].cells[34].innerText = _step[i-2].max
                table.rows[i].cells[35].querySelector('input[type="checkbox"]').checked = _step[i-2].eop == 1 ? true : false
                table.rows[i].style.backgroundColor = _step[i-2].eop == 1 ? '#F2F2F2' : 'white'
            }else {
                table.rows[i].cells[33].innerText = 0
                table.rows[i].cells[34].innerText = 0
                table.rows[i].cells[35].querySelector('input[type="checkbox"]').checked = false
            }
        }
    }
    const flashData_detectorType3 = (_data) => {
        let d = 'OFF'
        switch (_data){
            case '1000' :
                d = 'OFF'
                break
            case '0101' :
                d = 'G'
                break
            case '0001' :
                d = 'G'
                break
            case '0100' :
                d = 'R'
                break
            case '0010' :
                d = 'Y'
                break
            case '0011':
                d = 'Y'
                break
            default :
                d = 'OFF'
                break
        }
        return d
    }
    const signalData_detectorType3 = (_data) => {
        let d = ''
        switch (_data){
            case '0000' :
                d = ''
                break
            case '0001' :
                d = 'G'
                break
            case '0010' :
                d = 'Y'
                break
            case '0011' :
                d = 'YF'
                break
            case '0100' :
                d = 'RF'
                break
            case '0101' :
                d = 'GF'
                break
            default: break
        }
        return d
    }

    const updateGroupIndex = (content) => {
        setGroupIndex(content.target.selectedIndex + 1)
    }
    const updateMapIndex = (content) =>{
        setMapIndex(content.target.selectedIndex + 1)
    }

    //table style
    const thStyle = { borderBottom: '1px solid #EBEBEB', backgroundColor: '#F7F9FC', height: '24px', fontSize: '13px', borderRight: '1px solid #EBEBEB',}
    const tdStyle = { height: '24px', fontSize: '13px', borderBottom: '1px solid #EBEBEB', borderRight: '1px solid #EBEBEB', userSelect: 'none', cursor: 'pointer'}
    const thLastChildStyle = { borderBottom: '1px solid #EBEBEB', backgroundColor: '#F7F9FC', height: '24px', fontSize: '13px', }
    const tdLastChildStyle = { borderBottom: '1px solid #EBEBEB', height: '24px', fontSize: '13px',  }
    const tdStyle_disabled = { backgroundColor: '#F0F0F0', height: '24px', fontSize: '13px', borderBottom: '1px solid #EBEBEB', borderRight: '1px solid #EBEBEB' }

    const createSignalMapTable = (Ring) => {
        const signalMapStepItem = { width: '30px', background: 'transparent'}
        let table = []
        const highlightEvent = (cell) => {
            if(cell.target.checked){
                cell.target.parentNode.parentNode.style.backgroundColor = '#F2F2F2'//'#A8DCFA'
            }else {
                cell.target.parentNode.parentNode.style.backgroundColor = 'white'
            }
        }
        if(detectorType == 3){
            let thead = []
            for(let i = 0 ; i < 2 ; i++){
                let thead_tr = []
                thead_tr.push(<th key={'signal-map-table-thead-th-index-'+(i+1)} style={thStyle}></th>)
                if(i == 0){
                    for(let j = 0 ; j < 16; j++){
                        thead_tr.push(<th key={'signal-map-table-thead-th-'+(i+1)+'-'+(j+1)} style={thStyle} colSpan={2}>LSU{j+1}</th>)
                    }
                    thead_tr.push(<th key={'signal-map-table-thead-th-'+(i+1)+'step-index'} style={thLastChildStyle} colSpan={3}></th>)
                }else {
                    for(let j = 0 ; j < 32; j++){
                        if(j%2 == 0){
                            thead_tr.push(<th key={'signal-map-table-thead-th-'+(i+1)+'-'+(j+1)} style={thStyle}>G2</th>)
                        }else {
                            thead_tr.push(<th key={'signal-map-table-thead-th-'+(i+1)+'-'+(j+1)} style={thStyle}>G1</th>)
                        }
                    }
                    thead_tr.push(<th key={'signal-map-table-thead-th-'+(i+1)+'step-item-1'} style={thStyle}>MIN</th>)
                    thead_tr.push(<th key={'signal-map-table-thead-th-'+(i+1)+'step-item-2'} style={thStyle}>MAX</th>)
                    thead_tr.push(<th key={'signal-map-table-thead-th-'+(i+1)+'step-item-3'} style={thLastChildStyle}>EOP</th>)
                }
                thead.push(<tr key={'signal-map-table-thead-tr-'+(i+1)}>{thead_tr}</tr>)
            }
            table.push(<thead key={'signal-map-table-thead-1'}>{thead}</thead>)

            let tbody = []
            for(let i = 0 ; i < 32; i++){
                let tbody_tr = []
                tbody_tr.push(<th key={'signal-map-table-tbody-index-'+(i+1)} style={thStyle}>{i+1}</th>)
                for(let j = 0 ; j < 32; j++){
                    tbody_tr.push(<td key={'signal-map-table-tbody-td'+(i+1)+'-'+(j+1)} style={tdStyle} onClick={CellClickEvent.bind()}></td>)
                }
                tbody_tr.push(<td key={'signal-map-table-tbody-td'+(i+1)+'-step-item-1'} style={tdStyle}><input type={'number'} style={signalMapStepItem}/></td>)
                tbody_tr.push(<td key={'signal-map-table-tbody-td'+(i+1)+'-step-item-2'} style={tdStyle}><input type={'number'} style={signalMapStepItem}/></td>)
                tbody_tr.push(<td key={'signal-map-table-tbody-td'+(i+1)+'-step-item-3'} style={tdLastChildStyle}>
                    <input type={'checkbox'} id={'signal-map-table-eop-cell-'+(i+1)+Ring} onClick={highlightEvent.bind()}/><label htmlFor={'signal-map-table-eop-cell-'+(i+1)+Ring}></label>
                </td>)
                tbody.push(<tr key={'signal-map-table-tbody-tr-'+(i+1)}>{tbody_tr}</tr>)
            }
            table.push(<tbody key={'signal-map-table-tbody-1'}>{tbody}</tbody>)
        }
        else if(detectorType == 4){
            let thead = []

            for(let i = 0 ; i < 2 ; i++){
                let thead_tr = []
                thead_tr.push(<th key={'signal-map-table-thead-th-index-'+(i+1)} style={thStyle}></th>)
                if(i == 0){
                    for(let j = 0 ; j < 8; j++){
                        thead_tr.push(<th key={'signal-map-table-thead-th-'+(i+1)+'-'+(j+1)} style={thStyle} colSpan={3}>LSU{j+1}</th>)
                    }
                    thead_tr.push(<th key={'signal-map-table-thead-th-'+(i+1)+'step-index'} style={thLastChildStyle} colSpan={3}></th>)
                }else {
                    let th_index = 0;
                    for(let j = 1 ; j < 25; j++){
                        if((j-1)==0 || (j-1)%3 == 0){
                            //j = 1, 4, 7, ...
                            th_index++;
                            thead_tr.push(<th key={'signal-map-table-thead-th-'+(i+1)+'-'+(j+1)} style={thStyle}>{th_index}G</th>)
                        }
                        else if((j-2)==0 || (j-2)%3 == 0){
                            //j = 2, 5, 8, ...
                            thead_tr.push(<th key={'signal-map-table-thead-th-'+(i+1)+'-'+(j+1)} style={thStyle}>{th_index}A</th>)
                        }
                        else if((j-3)==0 || (j-3)%3 == 0){
                            //j = 3, 6, 9, ...
                            thead_tr.push(<th key={'signal-map-table-thead-th-'+(i+1)+'-'+(j+1)} style={thStyle}>{th_index}W</th>)
                        }
                    }
                    thead_tr.push(<th key={'signal-map-table-thead-th-'+(i+1)+'step-item-1'} style={thStyle}>MIN</th>)
                    thead_tr.push(<th key={'signal-map-table-thead-th-'+(i+1)+'step-item-2'} style={thStyle}>MAX</th>)
                    thead_tr.push(<th key={'signal-map-table-thead-th-'+(i+1)+'step-item-3'} style={thLastChildStyle}>EOP</th>)
                }
                thead.push(<tr key={'signal-map-table-thead-tr-'+(i+1)}>{thead_tr}</tr>)
            }
            table.push(<thead key={'signal-map-table-thead-2'}>{thead}</thead>)

            let tbody = []

            for(let i = 0 ; i < 32; i++){
                let tbody_tr = []
                tbody_tr.push(<th key={'signal-map-table-tbody-index-'+(i+1)} style={thStyle}>{i+1}</th>)
                for(let j = 0 ; j < 24; j++){
                    tbody_tr.push(<td key={'signal-map-table-tbody-td'+(i+1)+'-'+(j+1)} style={tdStyle} onClick={CellClickEvent.bind()}></td>)
                }
                tbody_tr.push(<td key={'signal-map-table-tbody-td'+(i+1)+'-step-item-1'} style={tdStyle}><input type={'number'} style={signalMapStepItem}/></td>)
                tbody_tr.push(<td key={'signal-map-table-tbody-td'+(i+1)+'-step-item-2'} style={tdStyle}><input type={'number'} style={signalMapStepItem}/></td>)
                tbody_tr.push(<td key={'signal-map-table-tbody-td'+(i+1)+'-step-item-3'} style={tdLastChildStyle}>
                    <input type={'checkbox'} id={'signal-map-table-eop-cell-'+(i+1)+Ring}/><label htmlFor={'signal-map-table-eop-cell-'+(i+1)+Ring}></label>
                </td>)
                tbody.push(<tr key={'signal-map-table-tbody-tr-'+(i+1)}>{tbody_tr}</tr>)
            }
            table.push(<tbody key={'signal-map-table-tbody-2'}>{tbody}</tbody>)
        }

        return table
    }
    const createFlashMapTable =() =>{

        let table = []

        if(detectorType == 3){
            let thead = []
            let thead_th = []
            thead_th.push(<th key={'flash-map-table-thead-th-index'} style={thStyle}></th>)
            for(let i = 0 ; i < 15; i++){
                thead_th.push(<th key={'flash-map-table-thead-th-'+(i+1)} style={thStyle}>LSU{i+1}</th>)
            }
            thead_th.push(<th key={'flash-map-table-thead-th-16'}>LSU16</th>)
            thead.push(<tr key={'flash-map-table-tr-1'} style={thLastChildStyle}>{thead_th}</tr>)
            table.push(<thead key={'flash-map-table-thead-1'}>{thead}</thead>)

            let tbody = []
            for(let i = 0 ; i < 2; i++){
                let tbody_data = []
                tbody_data.push(<th key={'flash-map-table-tbody-th-index'+(i+1)} style={thStyle}>{i+1}</th>)
                for(let j = 0 ; j < 15 ; j++){
                    tbody_data.push(<td key={'flash-map-table-tbody-td-'+(i+1)+'-'+(j+1)} style={tdStyle} onClick={CellClickEvent.bind()}>OFF</td>)
                }
                tbody_data.push(<td key={'flash-map-table-tbody-td-16'} style={tdLastChildStyle}>OFF</td>)
                tbody.push(<tr key={'flash-map-table-tr-'+(i+2)}>{tbody_data}</tr>)
            }
            table.push(<tbody key={'flash-map-table-tbody-1'}>{tbody}</tbody>)

        }
        else if(detectorType == 4){

            let thead = []
            let thead_th = []
            thead_th.push(<th key={'flash-map-table-thead-th-index'} style={thStyle}></th>)
            for(let  i = 0 ; i < 7; i ++){
                thead_th.push(<th key={'flash-map-table-thead-th-'+(i+1)} style={thStyle}>LSU{i+1}</th>)
            }
            thead_th.push(<th key={'flash-map-table-thead-th-8'} style={thLastChildStyle}>LSU8</th>)
            thead.push(<tr key={'flash-map-table-tr-1'}>{thead_th}</tr>)
            table.push(<thead key={'flash-map-table-thead-2'}>{thead}</thead>)

            let tbody = []
            const index_array = ['VEH', 'PED']
            for(let i = 0 ; i < 2 ; i++){
                let tbody_data = []
                tbody_data.push(<th key={'flash-map-table-tbody-th-index'+(i+1)} style={thStyle}>{index_array[i]}</th>)
                for(let j = 0 ; j < 6; j++){
                    tbody_data.push(<td key={'flash-map-table-tbody-td-'+(i+1)+'-'+(j+1)} style={tdStyle} onClick={CellClickEvent.bind()}>OFF</td>)
                }
                tbody_data.push(<td key={'flash-map-table-tbody-td-'+(i+1)+'-7'} id={'disable-cell'} style={tdStyle_disabled}></td>)
                tbody_data.push(<td key={'flash-map-table-tbody-td-'+(i+1)+'-8'} id={'disable-cell'} style={tdStyle_disabled}></td>)
                tbody.push(<tr key={'flash-map-table-tr-'+(i+2)}>{tbody_data}</tr>)
            }
            table.push(<tbody key={'flash-map-table-tbody-2'}>{tbody}</tbody>)
        }

        return table

    }

    const CellClickEvent = (cell) => {
        const setData = (cell, dataArray, value) => {
            const index = dataArray.findIndex(e=>{return e.value == value})
            if(dataArray.length - 1 < index + 1 ){
                cell.target.innerText = dataArray[0].value
                cell.target.style.color = dataArray[0].color
            }else {
                cell.target.innerText = dataArray[index+1].value
                cell.target.style.color = dataArray[index+1].color
            }
        }
        const table = cell.target.parentNode.parentNode.parentNode
        const table_id = table.id.split('-')[0]
        if(table_id == 'flash'){ //flash map
            const value = cell.target.innerText
            if(detectorType == 3){
                const flashMapData = [
                    {value: 'OFF', color: '#707070'},
                    {value: 'Y', color: '#F28100'},
                    {value: 'R', color: 'red'},
                    {value: 'G', color: 'green'}]
                setData(cell, flashMapData, value)
            }
            else if(detectorType == 4) {
                if(cell.target.parentNode.rowIndex == 1){
                    //VEH
                    const flashMapData = [
                        {value: 'R', color: 'red'},
                        {value: 'Y', color: '#F28100'},
                        {value: 'G', color: 'green'},
                        {value: '0', color: '#707070'}]
                    setData(cell, flashMapData, value)
                }
                else { //PED
                    const flashMapData = [
                        {value: '0', color: '#707070'},
                        {value: 'R', color: 'red'},
                        {value: 'G', color: 'green'}]
                    setData(cell, flashMapData, value)
                }
            }
        }
        else { //signal map
            const value = cell.target.innerText
            if(detectorType == 3){
                const signalMapData = [
                    {value: '',color: '#707070'},
                    {value: 'G',color: 'green'},
                    {value: 'Y',color: '#F28100'},
                    {value: 'YF',color: '#F28100'},
                    {value: 'RF',color: 'red'},
                    {value: 'GF',color: 'green'}
                ]
                setData(cell, signalMapData, value)
            }
            else if(detectorType == 4) {
                if(cell.target.cellIndex%3 == 1){ //G
                    const signalMapData = [
                        {value: '',color: '#707070'},
                        {value: 'G',color: 'green'},
                        {value: 'Y',color: '#F28100'},
                        {value: 'RF',color: 'red'},
                    ]
                    setData(cell, signalMapData, value)
                }
                else if(cell.target.cellIndex%3 == 2){ //A
                    const signalMapData = [
                        {value: '',color: '#707070'},
                        {value: 'A',color: 'blue'},
                        {value: 'Y',color: '#F28100'},
                        {value: 'YF',color: '#F28100'},
                    ]
                    setData(cell, signalMapData, value)
                }
                else if(cell.target.cellIndex%3 == 0){ //W
                    const signalMapData = [
                        {value: '',color: '#707070'},
                        {value: 'G',color: 'green'},
                        {value: 'F',color: 'indigo'},
                    ]
                    setData(cell, signalMapData, value)
                }
            }
        }
    }
    const resetButton = (content) =>{
        switch (content.target.id.split('-')[0]){
            case 'A':
                document.getElementById('A-signal-map-table').querySelectorAll('td').forEach(e=>{
                    if(e.querySelector('input[type="number"]')!=null){
                        e.querySelector('input[type="number"]').value = ''
                    }else if(e.querySelector('input[type="checkbox"]')!=null){
                        e.querySelector('input[type="checkbox"]').checked = false
                    }else {
                        e.innerText = ''
                    }
                })
                document.getElementById('A-signal-map-table').querySelectorAll('tr').forEach(e=>{
                    e.style.backgroundColor = 'white'
                })
                break
            case 'B':
                document.getElementById('B-signal-map-table').querySelectorAll('td').forEach(e=>{
                    if(e.querySelector('input[type="number"]')!=null){
                        e.querySelector('input[type="number"]').value = ''
                    }else if(e.querySelector('input[type="checkbox"]')!=null){
                        e.querySelector('input[type="checkbox"]').checked = false
                    }else {
                        e.innerText = ''
                    }
                })
                document.getElementById('B-signal-map-table').querySelectorAll('tr').forEach(e=>{
                    e.style.backgroundColor = 'white'
                })
                break
            case 'flash':
                document.getElementById('flash-map-table').querySelectorAll('td').forEach(e=>{
                    if(e.id != 'disable-cell') {
                        e.innerText = 'OFF'
                        e.style.color = '#707070'
                    }else {
                        e.innerText = ''
                    }

                })
                break
            default: break
        }
    }
    
    return (
        <>
            <div className={'simulator'}>
                <Container width={'1580px'} height={'15px'} margin={'0px 0px 15px 0px'} padding={'15px'}>
                    <div className={'select-view'}>
                        <h3>SIGNAL MAP</h3>
                        <h4>그룹</h4>
                        <select onChange={updateGroupIndex.bind()}>
                            {groupList.map((item, index)=>(
                                <option key={'group-list-'+index}>{item.group_id}. {item.group_name}</option>
                            ))}
                        </select>
                        <h4>교차로</h4>
                        <select onChange={updateMapIndex.bind()}>
                            {mapList.filter((e)=>e.group.group_id == groupIndex).map((item, index)=>(
                                <option key={'map-list-option-'+index}>{item.location_id}번 {item.location_name}</option>
                            ))}
                        </select>
                    </div>
                </Container>
                <div className={'title-view'}>
                    <h4>SIGNAL MAP</h4>
                    <select id={'signal-map-type-select'}>
                        <option>일반제</option>
                        <option>시차제 #1</option>
                        <option>시차제 #2</option>
                        <option>시차제 #3</option>
                        <option>시차제 #4</option>
                        <option>시차제 #5</option>
                        <option>보행맵</option>
                    </select>
                    <div className={'button-group'}>
                        <button id={'A-signal-map-reset-event'} onClick={resetButton.bind()}>A링 초기화</button>
                        <button id={'B-signal-map-reset-event'} onClick={resetButton.bind()}>B링 초기화</button>
                        {/*<button>맵 복사</button>*/}
                        <button onClick={signalMapUploadEvent}>업로드</button>
                        <button>다운로드</button>
                    </div>
                </div>
                <Container width={'1570px'} height={'527px'} margin={'15px 0px 15px 0px'} padding={'20px'}>
                    <div className={'signal-map-table'}>
                        <h3>A</h3>
                        <div className={'a-ring-table'}>
                            <table id={'A-signal-map-table'}>
                                {createSignalMapTable('A')}
                            </table>
                        </div>
                    </div>
                    <div className={'signal-map-table'}>
                        <h3>B</h3>
                        <div className={'b-ring-table'}>
                            <table id={'B-signal-map-table'}>
                                {createSignalMapTable('B')}
                            </table>
                        </div>
                    </div>
                </Container>
                <div className={'title-view'}>
                    <h4>FLASH MAP</h4>
                    <div className={'button-group'}>
                        <div className={'flash-time-item'}>
                            <h5>POWER ON FLASH TIME</h5>
                            <input type={'number'} />
                        </div>
                        <button id={'flash-map-reset-event'} onClick={resetButton.bind()}>초기화</button>
                        <button onClick={flashMapUploadEvent}>업로드</button>
                        <button>다운로드</button>
                    </div>
                </div>
                <Container width={'1570px'} height={'80px'} margin={'15px 0px 0px 0px'} padding={'20px'}>
                    <table id={'flash-map-table'}>
                        {createFlashMapTable()}
                    </table>
                </Container>
            </div>
            <style jsx>{`
              h3, h4{
                color: #707070;
              }
              .select-view{
                display: flex;
                align-items: center;
              }
               select {
                margin: 0px 5px;
                border-radius: 4px;
                color: #707070;
                font-weight: bold;
              }
              .select-view h4{
                margin-left: 15px;
                margin-right: 5px;
              }
              .title-view{
                display: flex;
                align-items: center;
              }
              .button-group{
                margin-left: auto;
                display: flex;
              }
              button{
                margin-left: 5px;
              }
              table{
                table-layout: fixed;
                text-align: center;
                color: #707070;
              }
              .flash-time-item{
                display: flex;
                line-height: 25px;
              }
              .flash-time-item input[type='number']{
                margin-left: 10px;
                margin-right: 10px;
                width: 50px;
                border: 1px solid #EBEBEB;
              }
              .a-ring-table{
                height: 255px;
                border: 1px solid #EBEBEB;
                overflow: auto;
              }
              .b-ring-table{
                height: 255px;
                border: 1px solid #EBEBEB;
                overflow: auto;
              }
              .signal-map-table{
                display: flex;
                border: 1px solid #EBEBEB;
                border-collapse: collapse;
              }
              .signal-map-table h3{
                transform: translateY(50%);
                color: black;
                font-weight: bold;
                margin: 0px 5px;
              }
            `}</style>
        </>
    );
};
export async function getServerSideProps(context) {
    return authCheck(context)
}
export default SignalMap;
