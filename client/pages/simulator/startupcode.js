import React, {useState, useEffect} from 'react';
import Container from "../../components/Container";
import axios from "axios";
import {authCheck} from "../../authCheck";
import io from 'socket.io-client';
import swal from "sweetalert2";

const socket =  io.connect('http://192.168.1.182:9000/')
const StartUpCode = () => {


    const [groupList, setGroupList] = useState([])
    const [groupIndex, setGroupIndex] = useState(1)
    const [mapList, setMapList] = useState([])
    const [mapIndex, setMapIndex] =useState(1)

    const [startUpCode, setStartUpCode] = useState([])
    const [functionCode, setFunctionCode] = useState([])
    const [parameter, setParameter] = useState([])

    useEffect(()=>{
        getGroupListAPI().catch((e)=>{console.error(e)})
        getMapListAPI().catch((e)=>{console.error(e)})

        socket.on('StartupUpload', (_data)=>{
            console.log('startUpCode : ',_data)
            setStartUpCode(_data)
        })
        socket.on('FunctionUpload', (_data)=>{
            console.log('functionCode : ',_data)
            setFunctionCode(_data)
        })

        socket.on('error_msg', (_data)=>{
            swal.fire('[Error]', _data, 'error')
        })
    },[])

    useEffect(()=>{
        clearInterval(timerInterval)
        if(startUpCode.length > 0){
            swal.fire('업로드 완료','','success')
            const table = document.getElementsByClassName('startup-code-table')[0].querySelectorAll('table')
            //table[0] : RING운영방법 및 주현시지정
            table[0].querySelectorAll('td')[0].querySelector('select').selectedIndex = startUpCode[5].toString(2).padStart(8, '0')[7]
            table[0].querySelectorAll('td')[1].querySelector('select').selectedIndex = parseInt(startUpCode[5].toString(2).padStart(8,'0').slice(5,7), 2)
            table[0].querySelectorAll('td')[2].querySelector('select').selectedIndex = startUpCode[5].toString(2).padStart(8, '0')[4]
            table[0].querySelectorAll('td')[3].querySelector('input').value = parseInt(startUpCode[5].toString(2).padStart(8,'0').slice(1,4),2)
            table[0].querySelectorAll('td')[4].querySelector('select').selectedIndex = startUpCode[5].toString(2).padStart(8, '0')[0]
            table[0].querySelectorAll('td')[5].querySelector('input').value = parseInt(startUpCode[6].toString(2).padStart(8, '0').slice(4), 2)
            table[0].querySelectorAll('td')[6].querySelector('select').selectedIndex = parseInt(startUpCode[6].toString(2).padStart(8, '0').slice(0, 4), 2)
            //table[1] : 시차제주현시, GAP 감응 시간값, 한계손실 감응 시간값
            table[1].querySelectorAll('td')[0].querySelector('input').value = startUpCode[9]
            table[1].querySelectorAll('td')[1].querySelector('input').value = startUpCode[11]
            table[1].querySelectorAll('td')[2].querySelector('input').value = startUpCode[12]
            //table[2] : DUAL 운영 현시 지정
            table[2].querySelectorAll('td').forEach((td, index)=>{
                if(index == 8 ){
                    td.querySelector('input[type="checkbox"]').checked = startUpCode[7] == 255 ? true : false
                }else {
                    td.querySelector('input[type="checkbox"]').checked = startUpCode[7].toString(2).padStart(8, '0')[7-index] == 1 ? true : false
                }
            })
            //table[3] : 특수옵션
            table[3].querySelectorAll('td').forEach((td, index)=>{
                td.querySelector('select').selectedIndex = startUpCode[8].toString(2).padStart(8, '0')[7-index]
            })
            //table[4] : 시차제좌회전 DUAL 운영 현시 지정
            table[4].querySelectorAll('td').forEach((td, index)=>{
                if(index == 8 ){
                    td.querySelector('input[type="checkbox"]').checked = startUpCode[10] == 255 ? true : false
                }else {
                    td.querySelector('input[type="checkbox"]').checked = startUpCode[10].toString(2).padStart(8, '0')[7-index] == 1 ? true : false
                }
            })
            //table[5] : 감응제어현시
            table[5].querySelectorAll('td').forEach((td, index)=>{
                if(index>7){
                    td.querySelector('input[type="checkbox"]').checked = startUpCode[21].toString(2).padStart(8, '0')[7-(index-8)] == 1 ? true : false
                }else {
                    td.querySelector('input[type="checkbox"]').checked = startUpCode[20].toString(2).padStart(8, '0')[7-index] == 1 ? true : false
                }
            })
            //table[6] : 시차제DUAL운영지정
            table[6].querySelectorAll('tbody tr').forEach((tr, index)=>{
                tr.querySelectorAll('td').forEach((td, td_index)=>{
                    if(td_index == 8){
                        td.querySelector('input[type="checkbox"]').checked = startUpCode[13+index] == 255 ? true : false
                    }else {
                        td.querySelector('input[type="checkbox"]').checked = startUpCode[13+index].toString(2).padStart(8, '0')[7-td_index] == 1 ? true : false
                    }
                })
            })
            //table[7] : 긴급/UPS 제어옵션
            table[7].querySelectorAll('td')[0].querySelector('select').selectedIndex = parseInt(startUpCode[18].toString(2).padStart(8, '0')[0], 2)
            table[7].querySelectorAll('td')[1].querySelector('select').selectedIndex = parseInt(startUpCode[18].toString(2).padStart(8, '0')[1], 2)
            table[7].querySelectorAll('td')[2].querySelector('select').selectedIndex = parseInt(startUpCode[18].toString(2).padStart(8, '0')[2], 2)
            table[7].querySelectorAll('td')[3].querySelector('select').selectedIndex = parseInt(startUpCode[19].toString(2).padStart(8, '0')[7], 2)
            table[7].querySelectorAll('td')[4].querySelector('select').selectedIndex = parseInt(startUpCode[19].toString(2).padStart(8, '0')[3], 2)
            table[7].querySelectorAll('td')[5].querySelector('select').selectedIndex = parseInt(startUpCode[19].toString(2).padStart(8, '0')[2], 2)
            //table[8] : 보행자 버튼 입력장치
            table[8].querySelectorAll('td')[0].querySelector('select').selectedIndex = parseInt(startUpCode[22].toString(2).padStart(8, '0').slice(6), 2)
            table[8].querySelectorAll('td')[1].querySelector('select').selectedIndex = parseInt(startUpCode[22].toString(2).padStart(8, '0').slice(4, 6), 2)
            table[8].querySelectorAll('td')[2].querySelector('select').selectedIndex = parseInt(startUpCode[22].toString(2).padStart(8, '0').slice(2, 4), 2)
            table[8].querySelectorAll('td')[3].querySelector('select').selectedIndex = parseInt(startUpCode[22].toString(2).padStart(8, '0')[1], 2)
            table[8].querySelectorAll('td')[4].querySelector('select').selectedIndex = parseInt(startUpCode[23].toString(2).padStart(8, '0').slice(5), 2)
            table[8].querySelectorAll('td')[5].querySelector('select').selectedIndex = parseInt(startUpCode[23].toString(2).padStart(8, '0').slice(2,5), 2)
        }
    },[startUpCode])
    useEffect(()=>{
        clearInterval(timerInterval)
        if(functionCode.length > 0){
            swal.fire('업로드 완료','','success')
            document.getElementsByClassName('function-code-table')[0].querySelectorAll('tbody tr').forEach((e, index)=>{
                const tds = e.querySelectorAll('td')
                tds[0].querySelector('input').value = functionCode[5+(8*index)]
                tds[1].querySelector('input').value = functionCode[6+(8*index)]
                tds[2].querySelector('select').selectedIndex = functionCode[7+(8*index)]
                tds[3].querySelector('input').value = functionCode[8+(8*index)]
                tds[4].querySelector('input').value = functionCode[9+(8*index)]
                tds[5].querySelector('input').value = functionCode[10+(8*index)]
                tds[6].querySelector('input').value = functionCode[11+(8*index)]
                tds[8].querySelector('select').selectedIndex = parseInt(parseInt(functionCode[12+(8*index)].toString(2).padStart(8,'0').slice(3), 2).toString(2), 2)
            })


        }
    },[functionCode])
    useEffect(()=>{
        clearInterval(timerInterval)
        if(parameter.length > 0){

        }
    },[parameter])

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

    const startupCodeUploadEvent = () => {
        setStartUpCode([])
        socket.emit('upload_request', [0x7e, 0x7e, 4, mapIndex, 0xA2])
        funcSwal();
    }
    const functionCodeUploadEvent = () => {
        setFunctionCode([])
        socket.emit('upload_request', [0x7e, 0x7e, 4, mapIndex, 0xB6])
        funcSwal();
    }
    const parameterUploadEvent = () => {
        setParameter([])
        alert('준비중입니다.')
    }

    const updateGroupIndex = (content) => {
        setGroupIndex(content.target.selectedIndex + 1)
    }
    const updateMapIndex = (content) =>{
        setMapIndex(content.target.selectedIndex + 1)
    }
    const thStyle = { borderBottom: '1px solid #EBEBEB', backgroundColor: '#F7F9FC', height: '15px', fontSize: '13px', borderRight: '1px solid #EBEBEB',}
    const tdStyle = { height: '15px', fontSize: '13px', borderBottom: '1px solid #EBEBEB', borderRight: '1px solid #EBEBEB' }
    const labelStyle = {lineHeight: '20px',}
    const createCheckBoxTable = (index, header,number, indexLabel) => {
        let table = []
        if(index){
            let thead = []
            let thead_data = []
            thead_data.push(<th key={'startup-code-checkbox-table-'+number+'-thead-th-index'} style={thStyle}></th>)
            header.map((item, index)=>{
                thead_data.push(<th key={'startup-code-checkbox-table-'+number+'-thead-th-'+index} style={thStyle}>{item}</th>)
            })
            thead.push(<tr key={'startup-code-checkbox-table-thead-tr-'+number}>{thead_data}</tr>)
            table.push(<thead key={'checkboxTable-thead'}>{thead}</thead>)

            let tbody = []
            for(let i = 0 ; i < indexLabel.length ; i++){
                let tbody_data = []
                tbody_data.push(<th key={'startup-code-table-th-'+i} style={thStyle}>{indexLabel[i]}</th>)
                header.map((item, index)=>{
                    tbody_data.push(<td key={'startup-code-checkbox-table-'+number+'-tbody-td-'+index} style={tdStyle}>
                        <input type={'checkbox'} id={'startup-code-table-'+i+'-'+number+'-input-'+index}/>
                        <label htmlFor={'startup-code-table-'+i+'-'+number+'-input-'+index} style={labelStyle}/>
                    </td>)
                })
                tbody.push(<tr key={'startup-code-table-tr'+i}>{tbody_data}</tr>)
            }
            table.push(<tbody key={'checkboxTable-tbody'}>{tbody}</tbody>)

        }else {
            let thead = []
            let thead_data = []
            header.map((item, index)=>{
                thead_data.push(<th key={'startup-code-checkbox-table-'+number+'-thead-th-'+index} style={thStyle}>{item}</th>)
            })
            thead.push(<tr key={'thead-data-table-tr'}>{thead_data}</tr>)
            table.push(<thead key={'data-table-thead'}>{thead}</thead>)
            let tbody = []
            let tbody_data = []
            header.map((item, index)=>{
                tbody_data.push(<td key={'startup-code-checkbox-table-'+number+'-tbody-td-'+index} style={tdStyle}>
                    <input type={'checkbox'} id={'startup-code-table-'+number+'-input-'+index}/>
                    <label htmlFor={'startup-code-table-'+number+'-input-'+index} style={labelStyle}/>
                </td>)
            })
            tbody.push(<tr key={'data-table-tr'}>{tbody_data}</tr>)
            table.push(<tbody key={'data-table-tbody'}>{tbody}</tbody>)
        }

        return table
    }
    const resetButton = (content) => {
        switch (content.target.id.split('-')[0]){
            case 'startup':
                document.getElementsByClassName('startup-code-table')[0].querySelectorAll('td').forEach(e=>{
                    if(e.querySelector('select')!=null) e.querySelector('select').selectedIndex = 0
                    if(e.querySelector('input[type="number"]')!=null) e.querySelector('input[type="number"]').value = ''
                    if(e.querySelector('input[type="checkbox"]') != null) e.querySelector('input[type="checkbox"]').checked = false
                })
                break
            case 'function':
                document.getElementsByClassName('function-code-table')[0].querySelectorAll('td').forEach(e=>{
                    if(e.querySelector('select')!=null) e.querySelector('select').selectedIndex = 0
                    if(e.querySelector('input')!=null) e.querySelector('input').value = ''
                })
                break
            case 'parameter' :
                document.getElementsByClassName('parameter-table')[0].querySelectorAll('td').forEach(e=>{
                    e.querySelector('select').selectedIndex = 0;
                })
                break
            default: break
        }
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

    return (
        <>
            <div className={'simulator'}>
                <Container width={'1580px'} height={'15px'} margin={'0px 0px 15px 0px'} padding={'15px'}>
                    <div className={'select-view'}>
                        <h3>STARTUP CODE</h3>
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
                <div className={'content-view'}>
                    <div className={'startup-code-view'}>
                        <div className={'title-view'}>
                            <h4>STARTUP CODE</h4>
                            <div className={'button-group'}>
                                <button id={'startup-code-table-reset-button'} onClick={resetButton.bind()}>초기화</button>
                                <button onClick={startupCodeUploadEvent}>업로드</button>
                                <button>다운로드</button>
                            </div>
                        </div>
                        <Container width={'750px'} height={'705px'} margin={'15px 20px 0px 0px'} padding={'20px'}>
                            <div className={'startup-code-table'}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th colSpan={5}>RING 운영 방법</th>
                                            <th colSpan={2}>주현시 지정</th>
                                        </tr>
                                        <tr>
                                            <th>모드</th>
                                            <th>앞막힘수행</th>
                                            <th>앞막힘처리</th>
                                            <th>듀얼시간차</th>
                                            <th>현시생략</th>
                                            <th>주현시</th>
                                            <th>감응여부</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>
                                                <select>
                                                    <option>싱글</option><option>듀얼</option>
                                                </select>
                                            </td>
                                            <td>
                                                <select>
                                                    <option>---</option><option>MG무시</option><option>MG유지</option>
                                                </select>
                                            </td>
                                            <td>
                                                <select>
                                                    <option>출력마스크</option><option>현시진행</option>
                                                </select>
                                            </td>
                                            <td>
                                                <input type={'number'}/>
                                            </td>
                                            <td>
                                                <select>
                                                    <option>---</option><option>허용</option>
                                                </select>
                                            </td>
                                            <td>
                                                <input type={'number'}/>
                                            </td>
                                            <td>
                                                <select>
                                                    <option>---</option><option>GAP</option><option>한계손실</option><option>GAP+감응</option>
                                                </select>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>시차제 주현시</th>
                                            <th>GAP 감응 시간값</th>
                                            <th>한계손실 감응 시간값</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td><input type={'number'} /></td>
                                            <td><input type={'number'} /></td>
                                            <td><input type={'number'} /></td>
                                        </tr>
                                    </tbody>
                                </table>
                                <h5>DUAL 운영현시지정</h5>
                                <table>
                                    {createCheckBoxTable(false,
                                        ['1현시', '2현시', '3현시', '4현시', '5현시', '6현시', '7현시', '8현시', '전체'],1)}
                                </table>
                                <h5>특수옵션</h5>
                                <table>
                                    <thead>
                                    <tr>
                                        <th rowSpan={2}>수동진행</th>
                                        <th colSpan={2}>푸쉬버튼고장</th>
                                        <th colSpan={2}>보행자 작동신호</th>
                                        <th colSpan={2}>현시생략감응</th>
                                        <th rowSpan={2}>맵적용</th>
                                    </tr>
                                    <tr>
                                        <th>정상</th>
                                        <th>점멸</th>
                                        <th>점멸 시</th>
                                        <th>처리단위</th>
                                        <th>주기</th>
                                        <th>CALL</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td><select><option>MG유지</option><option>MG무시</option></select></td>
                                            <td><select><option>단선</option><option>전체</option></select></td>
                                            <td><select><option>지속</option><option>해지</option></select></td>
                                            <td><select><option>보행맵</option><option>운영맵</option></select></td>
                                            <td><select><option>해당현시</option><option>한주기만</option></select></td>
                                            <td><select><option>유지</option><option>전감응</option></select></td>
                                            <td><select><option>현시</option><option>종결</option></select></td>
                                            <td><select><option>리셋 후</option><option>다음주기</option></select></td>
                                        </tr>
                                    </tbody>
                                </table>
                                <h5>시차제좌회전 DUAL 운영현시지정</h5>
                                <table>
                                    {createCheckBoxTable(false,
                                        ['1현시', '2현시', '3현시', '4현시', '5현시', '6현시', '7현시', '8현시', '전체'],2)}
                                </table>
                                <h5>감응제어현시</h5>
                                <table>
                                    {createCheckBoxTable(true,
                                        ['1현시', '2현시', '3현시', '4현시', '5현시', '6현시', '7현시', '8현시'],
                                        3,['A링', 'B링'])}
                                </table>
                                <h5>시차제 DUAL 운영지정</h5>
                                <table>
                                    {createCheckBoxTable(true,
                                        ['1현시', '2현시', '3현시', '4현시', '5현시', '6현시', '7현시', '8현시', '전체'],
                                        4,['플랜#6', '플랜#7', '플랜#8', '플랜#9', '플랜#10'])}
                                </table>
                                <h5>긴급/UPS 제어옵션</h5>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>긴급차량</th><th>긴급현시점프</th><th>버스우선</th><th>UPS시험</th><th>정전 조광</th><th>정전 점멸</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>
                                                <select><option>---</option><option>허용</option></select>
                                            </td>
                                            <td>
                                                <select><option>---</option><option>허용</option></select>
                                            </td>
                                            <td>
                                                <select><option>---</option><option>허용</option></select>
                                            </td>
                                            <td>
                                                <select><option>---</option><option>실행</option></select>
                                            </td>
                                            <td>
                                                <select><option>조광</option><option>정상</option></select>
                                            </td>
                                            <td>
                                                <select><option>정상</option><option>점멸</option></select>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <h5>보행자 버튼 입력장치</h5>
                                <table>
                                    <thead>
                                        <tr>
                                            <th rowSpan={2}>음성출력간격</th>
                                            <th colSpan={2}>음량 설정</th>
                                            <th rowSpan={2}>시각장애인 음향</th>
                                            <th colSpan={2}>심야시간 설정</th>
                                        </tr>
                                        <tr>
                                            <th>주간</th>
                                            <th>심야</th>
                                            <th>시작</th>
                                            <th>종료</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>
                                                <select>
                                                    <option>자동</option>
                                                    <option>15초</option>
                                                    <option>30초</option>
                                                    <option>45초</option>
                                                </select>
                                            </td>
                                            <td>
                                                <select>
                                                    <option>소거</option>
                                                    <option>50%</option>
                                                    <option>75%</option>
                                                    <option>100%</option>
                                                </select>
                                            </td>
                                            <td>
                                                <select>
                                                    <option>소거</option>
                                                    <option>25%</option>
                                                    <option>50%</option>
                                                    <option>75%</option>
                                                </select>
                                            </td>
                                            <td>
                                                <select>
                                                    <option>억제</option>
                                                    <option>발생</option>
                                                </select>
                                            </td>
                                            <td>
                                                <select>
                                                    <option>미사용</option>
                                                    <option>18:00</option>
                                                    <option>19:00</option>
                                                    <option>20:00</option>
                                                    <option>21:00</option>
                                                    <option>22:00</option>
                                                    <option>23:00</option>
                                                    <option>24:00</option>
                                                </select>
                                            </td>
                                            <td>
                                                <select>
                                                    <option>미사용</option>
                                                    <option>04:00</option>
                                                    <option>05:00</option>
                                                    <option>06:00</option>
                                                    <option>07:00</option>
                                                    <option>08:00</option>
                                                    <option>09:00</option>
                                                    <option>10:00</option>
                                                </select>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </Container>
                    </div>
                    <div>
                        <div className={'title-view'}>
                            <h4>FUNCTION CODE</h4>
                            <div className={'button-group'}>
                                <button id={'function-code-table-reset-button'} onClick={resetButton.bind()}>초기화</button>
                                <button onClick={functionCodeUploadEvent}>업로드</button>
                                <button>다운로드</button>
                            </div>
                        </div>
                        <Container width={'760px'} height={'345px'} margin={'15px 0px 15px 0px'} padding={'20px'}>
                            <div className={'function-code-table'}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th rowSpan={2} style={{width: '40px'}}></th>
                                            <th rowSpan={2}>월</th>
                                            <th rowSpan={2}>일</th>
                                            <th rowSpan={2}>주</th>
                                            <th colSpan={2}>시작</th>
                                            <th colSpan={2}>종료</th>
                                            <th rowSpan={2}>플랜</th>
                                            <th rowSpan={2}>FUNCTION</th>
                                        </tr>
                                        <tr>
                                            <th>시</th>
                                            <th>분</th>
                                            <th>시</th>
                                            <th>분</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <th>1</th>
                                            <td><input type={'number'}/></td>
                                            <td><input type={'number'}/></td>
                                            <td>
                                                <select>
                                                    <option>---</option>
                                                    <option>일</option>
                                                    <option>월</option>
                                                    <option>화</option>
                                                    <option>수</option>
                                                    <option>목</option>
                                                    <option>금</option>
                                                    <option>토</option>
                                                    <option>공휴일</option>
                                                    <option>모든 주중(월~금)</option>
                                                    <option>모든 주말(토~일)</option>
                                                    <option>매월 격주 첫번째 토요일</option>
                                                    <option>매월 격주 두번째 토요일</option>
                                                </select>
                                            </td>
                                            <td><input type={'number'}/></td>
                                            <td><input type={'number'}/></td>
                                            <td><input type={'number'}/></td>
                                            <td><input type={'number'}/></td>
                                            <td>
                                                <select disabled={true}>
                                                    <option>---</option>
                                                </select>
                                            </td>
                                            <td>
                                                <select>
                                                    <option>---</option>
                                                    <option>조광제어</option>
                                                    <option>점멸제어</option>
                                                    <option>소등제어</option>
                                                    <option>시차제어</option>
                                                    <option>감응제어</option>
                                                    <option>푸쉬버튼활성</option>
                                                    <option>음향발생</option>
                                                    <option>감응+푸쉬</option>
                                                    <option>시차+감응+푸쉬</option>
                                                    <option>시차+감응+푸쉬</option>
                                                    <option>PPC제어</option>
                                                    <option>단독앞막힘제어</option>
                                                    <option>예약</option>
                                                </select>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>2</th>
                                            <td><input type={'number'}/></td>
                                            <td><input type={'number'}/></td>
                                            <td>
                                                <select>
                                                    <option>---</option>
                                                    <option>일</option>
                                                    <option>월</option>
                                                    <option>화</option>
                                                    <option>수</option>
                                                    <option>목</option>
                                                    <option>금</option>
                                                    <option>토</option>
                                                    <option>공휴일</option>
                                                    <option>모든 주중(월~금)</option>
                                                    <option>모든 주말(토~일)</option>
                                                    <option>매월 격주 첫번째 토요일</option>
                                                    <option>매월 격주 두번째 토요일</option>
                                                </select>
                                            </td>
                                            <td><input type={'number'}/></td>
                                            <td><input type={'number'}/></td>
                                            <td><input type={'number'}/></td>
                                            <td><input type={'number'}/></td>
                                            <td>
                                                <select disabled={true}>
                                                    <option>---</option>
                                                </select>
                                            </td>
                                            <td>
                                                <select>
                                                    <option>---</option>
                                                    <option>조광제어</option>
                                                    <option>점멸제어</option>
                                                    <option>소등제어</option>
                                                    <option>시차제어</option>
                                                    <option>감응제어</option>
                                                    <option>푸쉬버튼활성</option>
                                                    <option>음향발생</option>
                                                    <option>감응+푸쉬</option>
                                                    <option>시차+감응+푸쉬</option>
                                                    <option>시차+감응+푸쉬</option>
                                                    <option>PPC제어</option>
                                                    <option>단독앞막힘제어</option>
                                                    <option>예약</option>
                                                </select>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>3</th>
                                            <td><input type={'number'}/></td>
                                            <td><input type={'number'}/></td>
                                            <td>
                                                <select>
                                                    <option>---</option>
                                                    <option>일</option>
                                                    <option>월</option>
                                                    <option>화</option>
                                                    <option>수</option>
                                                    <option>목</option>
                                                    <option>금</option>
                                                    <option>토</option>
                                                    <option>공휴일</option>
                                                    <option>모든 주중(월~금)</option>
                                                    <option>모든 주말(토~일)</option>
                                                    <option>매월 격주 첫번째 토요일</option>
                                                    <option>매월 격주 두번째 토요일</option>
                                                </select>
                                            </td>
                                            <td><input type={'number'}/></td>
                                            <td><input type={'number'}/></td>
                                            <td><input type={'number'}/></td>
                                            <td><input type={'number'}/></td>
                                            <td>
                                                <select disabled={true}>
                                                    <option>---</option>
                                                </select>
                                            </td>
                                            <td>
                                                <select>
                                                    <option>---</option>
                                                    <option>조광제어</option>
                                                    <option>점멸제어</option>
                                                    <option>소등제어</option>
                                                    <option>시차제어</option>
                                                    <option>감응제어</option>
                                                    <option>푸쉬버튼활성</option>
                                                    <option>음향발생</option>
                                                    <option>감응+푸쉬</option>
                                                    <option>시차+감응+푸쉬</option>
                                                    <option>시차+감응+푸쉬</option>
                                                    <option>PPC제어</option>
                                                    <option>단독앞막힘제어</option>
                                                    <option>예약</option>
                                                </select>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>4</th>
                                            <td><input type={'number'}/></td>
                                            <td><input type={'number'}/></td>
                                            <td>
                                                <select>
                                                    <option>---</option>
                                                    <option>일</option>
                                                    <option>월</option>
                                                    <option>화</option>
                                                    <option>수</option>
                                                    <option>목</option>
                                                    <option>금</option>
                                                    <option>토</option>
                                                    <option>공휴일</option>
                                                    <option>모든 주중(월~금)</option>
                                                    <option>모든 주말(토~일)</option>
                                                    <option>매월 격주 첫번째 토요일</option>
                                                    <option>매월 격주 두번째 토요일</option>
                                                </select>
                                            </td>
                                            <td><input type={'number'}/></td>
                                            <td><input type={'number'}/></td>
                                            <td><input type={'number'}/></td>
                                            <td><input type={'number'}/></td>
                                            <td>
                                                <select disabled={true}>
                                                    <option>---</option>
                                                </select>
                                            </td>
                                            <td>
                                                <select>
                                                    <option>---</option>
                                                    <option>조광제어</option>
                                                    <option>점멸제어</option>
                                                    <option>소등제어</option>
                                                    <option>시차제어</option>
                                                    <option>감응제어</option>
                                                    <option>푸쉬버튼활성</option>
                                                    <option>음향발생</option>
                                                    <option>감응+푸쉬</option>
                                                    <option>시차+감응+푸쉬</option>
                                                    <option>시차+감응+푸쉬</option>
                                                    <option>PPC제어</option>
                                                    <option>단독앞막힘제어</option>
                                                    <option>예약</option>
                                                </select>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>5</th>
                                            <td><input type={'number'}/></td>
                                            <td><input type={'number'}/></td>
                                            <td>
                                                <select>
                                                    <option>---</option>
                                                    <option>일</option>
                                                    <option>월</option>
                                                    <option>화</option>
                                                    <option>수</option>
                                                    <option>목</option>
                                                    <option>금</option>
                                                    <option>토</option>
                                                    <option>공휴일</option>
                                                    <option>모든 주중(월~금)</option>
                                                    <option>모든 주말(토~일)</option>
                                                    <option>매월 격주 첫번째 토요일</option>
                                                    <option>매월 격주 두번째 토요일</option>
                                                </select>
                                            </td>
                                            <td><input type={'number'}/></td>
                                            <td><input type={'number'}/></td>
                                            <td><input type={'number'}/></td>
                                            <td><input type={'number'}/></td>
                                            <td>
                                                <select disabled={true}>
                                                    <option>---</option>
                                                </select>
                                            </td>
                                            <td>
                                                <select>
                                                    <option>---</option>
                                                    <option>조광제어</option>
                                                    <option>점멸제어</option>
                                                    <option>소등제어</option>
                                                    <option>시차제어</option>
                                                    <option>감응제어</option>
                                                    <option>푸쉬버튼활성</option>
                                                    <option>음향발생</option>
                                                    <option>감응+푸쉬</option>
                                                    <option>시차+감응+푸쉬</option>
                                                    <option>시차+감응+푸쉬</option>
                                                    <option>PPC제어</option>
                                                    <option>단독앞막힘제어</option>
                                                    <option>예약</option>
                                                </select>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>6</th>
                                            <td><input type={'number'}/></td>
                                            <td><input type={'number'}/></td>
                                            <td>
                                                <select>
                                                    <option>---</option>
                                                    <option>일</option>
                                                    <option>월</option>
                                                    <option>화</option>
                                                    <option>수</option>
                                                    <option>목</option>
                                                    <option>금</option>
                                                    <option>토</option>
                                                    <option>공휴일</option>
                                                    <option>모든 주중(월~금)</option>
                                                    <option>모든 주말(토~일)</option>
                                                    <option>매월 격주 첫번째 토요일</option>
                                                    <option>매월 격주 두번째 토요일</option>
                                                </select>
                                            </td>
                                            <td><input type={'number'}/></td>
                                            <td><input type={'number'}/></td>
                                            <td><input type={'number'}/></td>
                                            <td><input type={'number'}/></td>
                                            <td>
                                                <select disabled={true}>
                                                    <option>---</option>
                                                </select>
                                            </td>
                                            <td>
                                                <select>
                                                    <option>---</option>
                                                    <option>조광제어</option>
                                                    <option>점멸제어</option>
                                                    <option>소등제어</option>
                                                    <option>시차제어</option>
                                                    <option>감응제어</option>
                                                    <option>푸쉬버튼활성</option>
                                                    <option>음향발생</option>
                                                    <option>감응+푸쉬</option>
                                                    <option>시차+감응+푸쉬</option>
                                                    <option>시차+감응+푸쉬</option>
                                                    <option>PPC제어</option>
                                                    <option>단독앞막힘제어</option>
                                                    <option>예약</option>
                                                </select>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>7</th>
                                            <td><input type={'number'}/></td>
                                            <td><input type={'number'}/></td>
                                            <td>
                                                <select>
                                                    <option>---</option>
                                                    <option>일</option>
                                                    <option>월</option>
                                                    <option>화</option>
                                                    <option>수</option>
                                                    <option>목</option>
                                                    <option>금</option>
                                                    <option>토</option>
                                                    <option>공휴일</option>
                                                    <option>모든 주중(월~금)</option>
                                                    <option>모든 주말(토~일)</option>
                                                    <option>매월 격주 첫번째 토요일</option>
                                                    <option>매월 격주 두번째 토요일</option>
                                                </select>
                                            </td>
                                            <td><input type={'number'}/></td>
                                            <td><input type={'number'}/></td>
                                            <td><input type={'number'}/></td>
                                            <td><input type={'number'}/></td>
                                            <td>
                                                <select disabled={true}>
                                                    <option>---</option>
                                                </select>
                                            </td>
                                            <td>
                                                <select>
                                                    <option>---</option>
                                                    <option>조광제어</option>
                                                    <option>점멸제어</option>
                                                    <option>소등제어</option>
                                                    <option>시차제어</option>
                                                    <option>감응제어</option>
                                                    <option>푸쉬버튼활성</option>
                                                    <option>음향발생</option>
                                                    <option>감응+푸쉬</option>
                                                    <option>시차+감응+푸쉬</option>
                                                    <option>시차+감응+푸쉬</option>
                                                    <option>PPC제어</option>
                                                    <option>단독앞막힘제어</option>
                                                    <option>예약</option>
                                                </select>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>8</th>
                                            <td><input type={'number'}/></td>
                                            <td><input type={'number'}/></td>
                                            <td>
                                                <select>
                                                    <option>---</option>
                                                    <option>일</option>
                                                    <option>월</option>
                                                    <option>화</option>
                                                    <option>수</option>
                                                    <option>목</option>
                                                    <option>금</option>
                                                    <option>토</option>
                                                    <option>공휴일</option>
                                                    <option>모든 주중(월~금)</option>
                                                    <option>모든 주말(토~일)</option>
                                                    <option>매월 격주 첫번째 토요일</option>
                                                    <option>매월 격주 두번째 토요일</option>
                                                </select>
                                            </td>
                                            <td><input type={'number'}/></td>
                                            <td><input type={'number'}/></td>
                                            <td><input type={'number'}/></td>
                                            <td><input type={'number'}/></td>
                                            <td>
                                                <select disabled={true}>
                                                    <option>---</option>
                                                </select>
                                            </td>
                                            <td>
                                                <select>
                                                    <option>---</option>
                                                    <option>조광제어</option>
                                                    <option>점멸제어</option>
                                                    <option>소등제어</option>
                                                    <option>시차제어</option>
                                                    <option>감응제어</option>
                                                    <option>푸쉬버튼활성</option>
                                                    <option>음향발생</option>
                                                    <option>감응+푸쉬</option>
                                                    <option>시차+감응+푸쉬</option>
                                                    <option>시차+감응+푸쉬</option>
                                                    <option>PPC제어</option>
                                                    <option>단독앞막힘제어</option>
                                                    <option>예약</option>
                                                </select>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>9</th>
                                            <td><input type={'number'}/></td>
                                            <td><input type={'number'}/></td>
                                            <td>
                                                <select>
                                                    <option>---</option>
                                                    <option>일</option>
                                                    <option>월</option>
                                                    <option>화</option>
                                                    <option>수</option>
                                                    <option>목</option>
                                                    <option>금</option>
                                                    <option>토</option>
                                                    <option>공휴일</option>
                                                    <option>모든 주중(월~금)</option>
                                                    <option>모든 주말(토~일)</option>
                                                    <option>매월 격주 첫번째 토요일</option>
                                                    <option>매월 격주 두번째 토요일</option>
                                                </select>
                                            </td>
                                            <td><input type={'number'}/></td>
                                            <td><input type={'number'}/></td>
                                            <td><input type={'number'}/></td>
                                            <td><input type={'number'}/></td>
                                            <td>
                                                <select disabled={true}>
                                                    <option>---</option>
                                                </select>
                                            </td>
                                            <td>
                                                <select>
                                                    <option>---</option>
                                                    <option>조광제어</option>
                                                    <option>점멸제어</option>
                                                    <option>소등제어</option>
                                                    <option>시차제어</option>
                                                    <option>감응제어</option>
                                                    <option>푸쉬버튼활성</option>
                                                    <option>음향발생</option>
                                                    <option>감응+푸쉬</option>
                                                    <option>시차+감응+푸쉬</option>
                                                    <option>시차+감응+푸쉬</option>
                                                    <option>PPC제어</option>
                                                    <option>단독앞막힘제어</option>
                                                    <option>예약</option>
                                                </select>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>10</th>
                                            <td><input type={'number'}/></td>
                                            <td><input type={'number'}/></td>
                                            <td>
                                                <select>
                                                    <option>---</option>
                                                    <option>일</option>
                                                    <option>월</option>
                                                    <option>화</option>
                                                    <option>수</option>
                                                    <option>목</option>
                                                    <option>금</option>
                                                    <option>토</option>
                                                    <option>공휴일</option>
                                                    <option>모든 주중(월~금)</option>
                                                    <option>모든 주말(토~일)</option>
                                                    <option>매월 격주 첫번째 토요일</option>
                                                    <option>매월 격주 두번째 토요일</option>
                                                </select>
                                            </td>
                                            <td><input type={'number'}/></td>
                                            <td><input type={'number'}/></td>
                                            <td><input type={'number'}/></td>
                                            <td><input type={'number'}/></td>
                                            <td>
                                                <select disabled={true}>
                                                    <option>---</option>
                                                </select>
                                            </td>
                                            <td>
                                                <select>
                                                    <option>---</option>
                                                    <option>조광제어</option>
                                                    <option>점멸제어</option>
                                                    <option>소등제어</option>
                                                    <option>시차제어</option>
                                                    <option>감응제어</option>
                                                    <option>푸쉬버튼활성</option>
                                                    <option>음향발생</option>
                                                    <option>감응+푸쉬</option>
                                                    <option>시차+감응+푸쉬</option>
                                                    <option>시차+감응+푸쉬</option>
                                                    <option>PPC제어</option>
                                                    <option>단독앞막힘제어</option>
                                                    <option>예약</option>
                                                </select>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </Container>
                        <div className={'title-view'}>
                            <h4>PARAMETER</h4>
                            <div className={'button-group'}>
                                <button id={'parameter-table-reset-button'} onClick={resetButton.bind()}>초기화</button>
                                <button onClick={parameterUploadEvent}>업로드</button>
                                <button>다운로드</button>
                            </div>
                        </div>
                        <Container width={'760px'} height={'261px'} margin={'15px 0px 0px 0px'} padding={'20px'}>
                            <div className={'parameter-table'}>
                                <table>
                                    <tbody>
                                    <tr>
                                        <th>1</th>
                                        <th>통신방식</th>
                                        <td>
                                            <select>
                                                <option>DIAL</option>
                                                <option>NON-DIAL</option>
                                            </select>
                                        </td>
                                        <th>11</th>
                                        <th>RED BOARD</th>
                                        <td>
                                            <select>
                                                <option>NONE</option>
                                                <option>OPTION</option>
                                                <option>LOOP</option>
                                                <option>PWIO</option>
                                            </select>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>2</th>
                                        <th>동기모순</th>
                                        <td>
                                            <select>
                                                <option>모순 금지</option>
                                                <option>모순 허용</option>
                                            </select>
                                        </td>
                                        <th>12</th>
                                        <th>단일로OFF푸쉬버튼(3색)</th>
                                        <td>
                                            <select>
                                                <option>Disable</option>
                                                <option>Enable</option>
                                            </select>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>3</th>
                                        <th>현시생략</th>
                                        <td>
                                            <select>
                                                <option>현시 생략 금지</option>
                                                <option>현시 생략 허용</option>
                                            </select>
                                        </td>
                                        <th>13</th>
                                        <th>푸시버튼 예비시간</th>
                                        <td>
                                            <select>
                                                <option>0초</option>
                                                <option>5초</option>
                                                <option>10초</option>
                                                <option>15초</option>
                                                <option>20초</option>
                                            </select>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>4</th>
                                        <th>COMPANY</th>
                                        <td>
                                            <select>
                                                <option>The-ROAD I&C</option>
                                                <option>SHIN-HO</option>
                                                <option>HANJIN</option>
                                                <option>DAMON</option>
                                                <option>COMPANY 1</option>
                                                <option>COMPANY 2</option>
                                                <option>COMPANY 3</option>
                                            </select>
                                        </td>
                                        <th>14</th>
                                        <th>Parameter 14</th>
                                        <td>
                                            <select>
                                                <option>--</option>
                                            </select>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>5</th>
                                        <th>연동</th>
                                        <td>
                                            <select>
                                                <option>연동 허용</option>
                                                <option>연동 금지</option>
                                            </select>
                                        </td>
                                        <th>15</th>
                                        <th>Parameter 15</th>
                                        <td>
                                            <select>
                                                <option>--</option>
                                            </select>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>6</th>
                                        <th>연동허용</th>
                                        <td>
                                            <select>
                                                <option>표준</option>
                                                <option>TOD PLAN</option>
                                            </select>
                                        </td>
                                        <th>16</th>
                                        <th>Parameter 16</th>
                                        <td>
                                            <select>
                                                <option>--</option>
                                            </select>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>7</th>
                                        <th>MMI MODE</th>
                                        <td>
                                            <select>
                                                <option>NEW</option>
                                                <option>OLD</option>
                                                <option>3C</option>
                                            </select>
                                        </td>
                                        <th>17</th>
                                        <th>Parameter 17</th>
                                        <td>
                                            <select>
                                                <option>--</option>
                                            </select>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>8</th>
                                        <th>POLICE PANEL FLASH</th>
                                        <td>
                                            <select>
                                                <option>Disable</option>
                                                <option>Enable</option>
                                            </select>
                                        </td>
                                        <th>18</th>
                                        <th>Parameter 18</th>
                                        <td>
                                            <select>
                                                <option>--</option>
                                            </select>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>9</th>
                                        <th>POLICE PANEL SHUTDOWN</th>
                                        <td>
                                            <select>
                                                <option>Disable</option>
                                                <option>Enable</option>
                                            </select>
                                        </td>
                                        <th>19</th>
                                        <th>Parameter 19</th>
                                        <td>
                                            <select>
                                                <option>--</option>
                                            </select>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>10</th>
                                        <th>TIME ZONE</th>
                                        <td>
                                            <select>
                                                <option>KTC</option>
                                                <option>UTC</option>
                                            </select>
                                        </td>
                                        <th>20</th>
                                        <th>Parameter 20</th>
                                        <td>
                                            <select>
                                                <option>--</option>
                                            </select>
                                        </td>
                                    </tr>

                                    </tbody>
                                </table>
                            </div>
                        </Container>
                    </div>
                </div>
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
              .content-view{
                display: flex;
              }
              .title-view{
                display: flex;
                align-items: center;
              }
              .button-group{
                margin-left: auto;
              }
              button{
                margin-left: 5px;
              }
              .startup-code-view .button-group{
                margin-right: 20px;
              }
              .parameter-table select{
                width: 120px;
              }  
              table{
                text-align: center;
                font-size: 13px;
                color: #707070;
              }
              th{
                border-bottom: 1px solid #EBEBEB;
                border-right: 1px solid #EBEBEB;
                background-color: #F7F9FC;
                height: 20px;
              }
              td:not(:last-child){
                 border-right: 1px solid #EBEBEB;
              }
              td{
                height: 24px;
                border-bottom: 1px solid #EBEBEB;
              }
              .function-code-table input[type='number']{
                width: 40px;
              }
              .startup-code-table table{
                table-layout: fixed;
                margin-top: 3px;
                margin-bottom: 3px;
                
              }
              .startup-code-table input[type='number']{
                width: 60px;
              }
              
            `}</style>
        </>
    );
};
export async function getServerSideProps(context) {
    return authCheck(context)
}
export default StartUpCode;
