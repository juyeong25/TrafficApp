import React, {useState, useEffect} from 'react';
import Container from "../../components/Container";
import axios from "axios";
import {authCheck} from "../../authCheck";
import io from 'socket.io-client';
import swal from "sweetalert2";

const socket =  io.connect('http://192.168.1.182:9000/')
const DetectConfig = () => {


    const [groupList, setGroupList] = useState([])
    const [groupIndex, setGroupIndex] = useState(1)
    const [mapList, setMapList] = useState([])
    const [mapIndex, setMapIndex] =useState(1)

    const [detectorData32, setDetectorData32] = useState([])
    const [detectorData64, setDetectorData64] = useState([])

    useEffect(()=>{
        getGroupListAPI().catch((e)=>{console.error(e)})
        getMapListAPI().catch((e)=>{console.error(e)})

        socket.on('DetconfigUpload', (_data)=>{
            console.log('detector config plan : ',_data)
            if(_data[4] == 205){
                setDetectorData64(_data)
            }else {
                setDetectorData32(_data)
            }
        })
    },[])
    useEffect(()=>{
        clearInterval(timerInterval)
        if(detectorData32.length > 0){
            swal.fire('업로드 완료','','success')

            const trs = document.getElementById('A-table').querySelectorAll('tr')
            for(let i = 1 ; i < trs.length ; i++){
                const tds = trs[i].querySelectorAll('td')
                tds[0].querySelector('select').selectedIndex = detectorData32[5+7*(i-1)]
                tds[1].querySelector('select').selectedIndex = detectorData32[6+7*(i-1)]
                tds[2].querySelector('input').value = detectorData32[7+7*(i-1)]
                tds[3].querySelector('input').value = detectorData32[8+7*(i-1)]
                tds[4].querySelector('select').selectedIndex = detectorData32[9+7*(i-1)]
                tds[5].querySelector('select').selectedIndex = detectorData32[10+7*(i-1)]
                tds[6].querySelector('input').value = detectorData32[11+7*(i-1)]
            }

        }
    }, [detectorData32])
    useEffect(()=>{
        clearInterval(timerInterval)
        if(detectorData64.length > 0){
            swal.fire('업로드 완료','','success')

            const trs = document.getElementById('B-table').querySelectorAll('tr')
            for(let i = 1 ; i < trs.length ; i++){
                const tds = trs[i].querySelectorAll('td')
                tds[0].querySelector('select').selectedIndex = detectorData64[5+7*(i-1)]
                tds[1].querySelector('select').selectedIndex = detectorData64[6+7*(i-1)]
                tds[2].querySelector('input').value = detectorData64[7+7*(i-1)]
                tds[3].querySelector('input').value = detectorData64[8+7*(i-1)]
                tds[4].querySelector('select').selectedIndex = detectorData64[9+7*(i-1)]
                tds[5].querySelector('select').selectedIndex = detectorData64[10+7*(i-1)]
                tds[6].querySelector('input').value = detectorData64[11+7*(i-1)]
            }

        }
    }, [detectorData64])

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

    const updateGroupIndex = (content) => {
        setGroupIndex(content.target.selectedIndex + 1)
    }
    const updateMapIndex = (content) =>{
        setMapIndex(content.target.selectedIndex + 1)
    }
    const thStyle = { borderBottom: '1px solid #EBEBEB', backgroundColor: '#F7F9FC', height: '24px', fontSize: '13px', borderRight: '1px solid #EBEBEB',}
    const tdStyle = { height: '24px', fontSize: '13px', borderBottom: '1px solid #EBEBEB', borderRight: '1px solid #EBEBEB' }
    const inputStyle = {width:'60px'}
    const createTable = (startNumber, type) => {
        let trs = []

        for(let i = startNumber ; i < startNumber+32; i++){
            let tds = []
            tds.push(<th style={thStyle} key={'detect-config-th-'+startNumber+'-'+i}>{i}</th>)
            tds.push(<td style={tdStyle} key={'detect-config-td-'+startNumber+'-1'+'-'+i}><select>
                <option>1.8X1.8</option>
                <option>4.0X1.8</option>
                <option>원형</option>
                <option>루프호환</option>
                <option>MAGNETIC</option>
                <option>영상</option>
                <option>기타</option>
            </select></td>)
            tds.push(<td style={tdStyle} key={'detect-config-td-'+startNumber+'-2'+'-'+i}><select>
                <option>---</option>
                <option>북</option>
                <option>동</option>
                <option>남</option>
                <option>서</option>
                <option>북동</option>
                <option>남동</option>
                <option>남서</option>
                <option>북서</option>
            </select></td>)
            tds.push(<td style={tdStyle} key={'detect-config-td-'+startNumber+'-3'+'-'+i}><input type={'number'} style={inputStyle}/></td>)
            tds.push(<td style={tdStyle} key={'detect-config-td-'+startNumber+'-4'+'-'+i}><input type={'number'} style={inputStyle}/></td>)
            tds.push(<td style={tdStyle} key={'detect-config-td-'+startNumber+'-5'+'-'+i}><select>
                <option>---</option>
                <option>직진</option>
                <option>좌회전</option>
                <option>대기행렬</option>
                <option>앞막힘</option>
                <option>좌회전대기</option>
                <option>쌍루프 IN</option>
                <option>쌍루프 OUT</option>
                <option>보행</option>
                <option>단속</option>
                <option>기타</option>
            </select></td>)
            tds.push(<td style={tdStyle} key={'detect-config-td-'+startNumber+'-6'+'-'+i}><select><option>---</option><option>A</option><option>B</option></select></td>)
            tds.push(<td style={tdStyle} key={'detect-config-td-'+startNumber+'-7'+'-'+i}><input type={'number'} style={inputStyle}/></td>)

            trs.push(<tr key={'detect-config-tr-'+type+'-'+startNumber+'-'+i}>{tds}</tr>)
        }

        return trs
    }

    const resetButton = (content) =>{
        switch (content.target.id.split('-')[0]){
            case 'A':
                document.getElementById('A-table').querySelectorAll('td').forEach(e=>{
                    if(e.querySelector('select')!=null) e.querySelector('select').selectedIndex = 0
                    if(e.querySelector('input')!=null) e.querySelector('input').value = ''
                })
                break
            case 'B':
                document.getElementById('B-table').querySelectorAll('td').forEach(e=>{
                    if(e.querySelector('select')!=null) e.querySelector('select').selectedIndex = 0
                    if(e.querySelector('input')!=null) e.querySelector('input').value = ''
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

    const detectorData32UploadEvent = () => {
        setDetectorData32([])
        socket.emit('upload_request', [0x7e, 0x7e, 4, mapIndex, 0xC6])
        funcSwal();
    }
    const detectorData64UploadEvent = () => {
        setDetectorData64([])
        socket.emit('upload_request', [0x7e, 0x7e, 4, mapIndex, 0xCC])
        funcSwal();
    }

    return (
        <>
            <div className={'simulator'}>
                <Container width={'1580px'} height={'15px'} margin={'0px 0px 15px 0px'} padding={'15px'}>
                    <div className={'select-view'}>
                        <h3>검지기 설정</h3>
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
                    <div className={'detector-setting-view-1'}>
                        <div className={'title-view'}>
                            <h4>검지기 설정 (1~32)</h4>
                            <div className={'button-group'}>
                                <button id={'A-detector-config-table'} onClick={resetButton.bind()}>초기화</button>
                                <button onClick={detectorData32UploadEvent}>업로드</button>
                                <button>다운로드</button>
                            </div>
                        </div>
                        <Container width={'755px'} height={'705px'} margin={'15px 20px 0px 0px'} padding={'20px'}>
                            <div className={'detector-config-table'}>
                                <table id={'A-table'}>
                                    <colgroup>
                                        <col width={'4%'}/>
                                        <col width={'15%'}/>
                                        <col width={'10%'}/>
                                        <col width={'10%'}/>
                                        <col width={'10%'}/>
                                        <col width={'18%'}/>
                                        <col width={'10%'}/>
                                        <col width={'12%'}/>
                                    </colgroup>
                                    <thead>
                                        <tr>
                                            <th></th>
                                            <th>타입</th>
                                            <th>방향</th>
                                            <th>위치(m)</th>
                                            <th>차로</th>
                                            <th>용도</th>
                                            <th>RING</th>
                                            <th>현시</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    {createTable(1, 'A')}
                                    </tbody>
                                </table>
                            </div>
                        </Container>
                    </div>
                    <div>
                        <div className={'title-view'}>
                            <h4>검지기 설정 (33~64)</h4>
                            <div className={'button-group'}>
                                <button id={'B-detector-config-table'} onClick={resetButton.bind()}>초기화</button>
                                <button onClick={detectorData64UploadEvent}>업로드</button>
                                <button>다운로드</button>
                            </div>
                        </div>
                        <Container width={'755px'} height={'705px'} margin={'15px 0px 0px 0px'} padding={'20px'}>
                            <div className={'detector-config-table'}>
                                <table id={'B-table'}>
                                    <colgroup>
                                        <col width={'4%'}/>
                                        <col width={'15%'}/>
                                        <col width={'10%'}/>
                                        <col width={'10%'}/>
                                        <col width={'10%'}/>
                                        <col width={'18%'}/>
                                        <col width={'10%'}/>
                                        <col width={'12%'}/>
                                    </colgroup>
                                    <thead>
                                    <tr>
                                        <th></th>
                                        <th>타입</th>
                                        <th>방향</th>
                                        <th>위치(m)</th>
                                        <th>차로</th>
                                        <th>용도</th>
                                        <th>RING</th>
                                        <th>현시</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {createTable(33, 'B')}
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
              .detector-setting-view-1 .button-group{
                margin-right: 20px;
              }
              .detector-config-table{
                height: 693px;
                overflow-y: auto;
                overflow-x: hidden;
              }
              table{
                text-align: center;
                color: #707070;
              }
              th{
                border-bottom: 1px solid #EBEBEB;
                background-color: #F7F9FC;
                height: 24px;
                font-size: 13px;
              }
              th:not(:last-child), td:not(:last-child){
                 border-right: 1px solid #EBEBEB;
              }
              td{
                height: 24px;
                font-size: 13px;
              }
            `}</style>
        </>
    );
};
export async function getServerSideProps(context) {
    return authCheck(context)
}
export default DetectConfig;
