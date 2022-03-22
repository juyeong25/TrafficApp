import React, {useState, useEffect} from 'react';
import Container from "../../components/Container";
import axios from "axios";
import {authCheck} from "../../authCheck";
import io from 'socket.io-client';
import swal from "sweetalert2";

const socket =  io.connect('http://192.168.1.182:9000/')
const TODPlan = () => {

    const [groupList, setGroupList] = useState([])
    const [groupIndex, setGroupIndex] = useState(1)
    const [mapList, setMapList] = useState([])

    const [weekPlan, setWeekPlan] = useState([])
    const [dayPlan, setDayPlan] = useState([])
    const [holidayPlan, setHolidayPlan] = useState([])

    useEffect(()=>{
        getGroupListAPI().catch((e)=>{console.error(e)})
        getMapListAPI().catch((e)=>{console.error(e)})

        socket.on('WeekplanUpload', (_data)=>{
            console.log('week plan : ',_data)
            setWeekPlan(_data)
        })
        socket.on('DayplanUpload', (_data)=>{
            console.log('day plan : ',_data)
            setDayPlan(_data)
        })
        socket.on('HolidayUpload', (_data)=>{
            console.log('holiday plan : ',_data)
            setHolidayPlan(_data)
        })
        socket.on('error_msg', (_data)=>{
            swal.fire('[Error]', _data, 'error')
        })
    },[])
    useEffect(()=>{
        clearInterval(timerInterval)
        if(dayPlan.length>0){
            swal.fire('업로드 완료','','success')
            const table = document.getElementById('day-plan-table')
            const tds = table.querySelectorAll('td')
            const dayPlanData = dayPlan.slice(6, -1)
            tds.forEach((e, index)=>{
                e.querySelector('input').value = dayPlanData[index] != undefined ? dayPlanData[index] : 0
            })
        }
    },[dayPlan])
    useEffect(()=>{
        clearInterval(timerInterval)
        if(weekPlan.length>0){
            swal.fire('업로드 완료','','success')
            const table = document.getElementById('week-plan-table')
            const tds = table.querySelectorAll('td')
            tds.forEach((e, index)=>{
                e.querySelector('input').value = weekPlan[5+index]
            })
        }
    },[weekPlan])
    useEffect(()=>{
        clearInterval(timerInterval)
        if(holidayPlan.length>0){
            swal.fire('업로드 완료','','success')
            const table = document.getElementById('holiday-plan-table')
            const tds = table.querySelectorAll('td')
            tds.forEach((e, index)=>{
                e.querySelector('input').value = holidayPlan[5+index]
            })
        }
    },[holidayPlan])

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
        setGroupIndex(content.target.value)
    }

    const planIndexList = ['1번', '2번', '3번', '4번', '5번', '6번', '7번', '8번', '9번', '10번']
    const dayPlanTable = () => {
        let trs = []
        const tdStyle = { borderBottom: '1px solid #EBEBEB', height: '24px', fontSize: '14px', borderRight: '1px solid #EBEBEB'}
        const tdStyle_lastChild = {borderBottom: '1px solid #EBEBEB', height: '24px', fontSize: '14px'}
        const thStyle = { borderBottom: '1px solid #EBEBEB', backgroundColor: '#F7F9FC', height: '24px', fontSize: '14px'}
        for(let i = 0; i < 16; i++){
            let tds= []
            tds.push(<th style={thStyle} key={'dayPlan-table-td-index-'+ i}>{i+1}</th>)
            for(let j = 0 ; j < 19; j++){
                tds.push(<td style={tdStyle} key={'dayPlan-table-td-'+i+'-'+j}><input type={'number'} style={{width: '25px'}}/></td>)
            }
            tds.push(<td style={tdStyle_lastChild} key={'dayPlan-table-td-'+i+'-'+20}><input type={'number'} style={{width: '25px'}}/></td>)
            trs.push(<tr key={'dayPlan-table-tr-'+i}>{tds}</tr>)
        }
        return trs
    }
    const holidayPlanTable = () =>{
        let trs = []
        const tdStyle = { borderBottom: '1px solid #EBEBEB', height: '24px', fontSize: '14px', borderRight: '1px solid #EBEBEB'}
        const tdStyle_lastChild = {borderBottom: '1px solid #EBEBEB', height: '24px', fontSize: '14px'}
        const thStyle = { borderBottom: '1px solid #EBEBEB', backgroundColor: '#F7F9FC', height: '24px', fontSize: '14px'}
        for(let i = 0; i < 25; i++){
            let tds= []
            tds.push(<th style={thStyle} key={'dayPlan-table-td-index-'+ i}>{i+1}</th>)
            for(let j = 0 ; j < 2; j++){
                tds.push(<td style={tdStyle} key={'dayPlan-table-td-'+i+'-'+j}>
                    <input type={'number'} style={{width: '50px'}}/>
                </td>)
            }
            tds.push(<td style={tdStyle_lastChild} key={'dayPlan-table-td-'+i+'-'+20}><input type={'number'}/></td>)
            trs.push(<tr key={'holiday-table-tr-'+i}>{tds}</tr>)
        }
        return trs
    }

    const resetButton = (content) => {
        switch (content.target.id.split('-')[0]){
            case 'week':
                document.getElementById('week-plan-table').querySelectorAll('td').forEach(e=>{
                    e.querySelector('input').value = ''
                })
                break
            case 'day':
                document.getElementById('day-plan-table').querySelectorAll('td').forEach(e=>{
                    e.querySelector('input').value = ''
                })
                break
            case 'holiday':
                document.getElementById('holiday-plan-table').querySelectorAll('td').forEach(e=>{
                    e.querySelector('input').value = ''
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
    const weekPlanUploadEvent = () => {
        setWeekPlan([])
        const mapIndex = parseInt(document.getElementById('location_id').value)
        socket.emit('upload_request', [0x7e, 0x7e, 4, mapIndex, 0xAA])
        funcSwal();
    }
    const dayPlanUploadEvent = () => {
        const mapIndex = parseInt(document.getElementById('location_id').value)
        const selectIndex = document.getElementsByClassName('planIndex-view')[0].querySelector('select').selectedIndex
        const planIndex = parseInt(parseInt(selectIndex.toString(2).padStart(4, '0') + '0000', 2).toString(16), 16)
        socket.emit('upload_request', [0x7e, 0x7e, 5, mapIndex, 0xB2, planIndex])
        funcSwal()
    }
    const holidayPlanUploadEvent = () => {
        const mapIndex = parseInt(document.getElementById('location_id').value)
        socket.emit('upload_request', [0x7e, 0x7e, 4, mapIndex, 0xA6])
        funcSwal()
    }

    return (
        <>
            <div className={'simulator'}>

                <Container width={'1580px'} height={'15px'} margin={'0px 0px 15px 0px'} padding={'15px'}>
                    <div className={'select-view'}>
                        <h3>TOD PLAN</h3>
                        <h4>그룹</h4>
                        <select onChange={updateGroupIndex.bind()}>
                            {groupList.map((item, index)=>(
                                <option key={'group-list-'+index} value={item.group_id}>{item.group_id}. {item.group_name}</option>
                            ))}
                        </select>
                        <h4>교차로</h4>
                        <select id={'location_id'}>
                            {mapList.filter((e)=>e.group.group_id == groupIndex).map((item, index)=>(
                                <option key={'map-list-option-'+index} value={item.location_id}>{item.location_id}번 {item.location_name}</option>
                            ))}
                        </select>
                    </div>
                </Container>
                <div className={'content-view'}>
                    <div>
                        <div className={'title-view'}>
                            <h4>WEEK PLAN</h4>
                            <div className={'button-group'}>
                                <button id={'week-plan-table-reset'} onClick={resetButton.bind()}>초기화</button>
                                <button onClick={weekPlanUploadEvent}>업로드</button>
                                <button>다운로드</button>
                            </div>
                        </div>
                        <Container width={'1100px'} height={'50px'} margin={'15px 20px 15px 0px'} padding={'30px 20px'}>
                            <table id={'week-plan-table'}>
                                <thead>
                                <tr>
                                    <th>일요일</th>
                                    <th>월요일</th>
                                    <th>화요일</th>
                                    <th>수요일</th>
                                    <th>목요일</th>
                                    <th>금요일</th>
                                    <th>토요일</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <td><input type={'number'} style={{width: '70px'}}/></td>
                                    <td><input type={'number'} style={{width: '70px'}}/></td>
                                    <td><input type={'number'} style={{width: '70px'}}/></td>
                                    <td><input type={'number'} style={{width: '70px'}}/></td>
                                    <td><input type={'number'} style={{width: '70px'}}/></td>
                                    <td><input type={'number'} style={{width: '70px'}}/></td>
                                    <td><input type={'number'} style={{width: '70px'}}/></td>
                                </tr>
                                </tbody>
                            </table>
                        </Container>
                        <div className={'title-view'}>
                            <h4>DAY PLAN</h4>
                            <div className={'button-group'}>
                                <button id={'day-plan-table-reset'} onClick={resetButton.bind()}>초기화</button>
                                <button onClick={dayPlanUploadEvent}>업로드</button>
                                <button>다운로드</button>
                            </div>
                        </div>
                        <Container width={'1100px'} height={'518px'} margin={'15px 0px 0px 0px'} padding={'30px 20px'}>
                            <div className={'planIndex-view'}>
                                <h4>PLAN INDEX</h4>
                                <select>
                                    {planIndexList.map((item, index)=>(<option id={'id_'+index} key={'planIndex-option-'+index}>{item}</option>))}
                                </select>
                                <button>이전</button>
                                <button>다음</button>
                                <button>플랜복사</button>
                                <button>붙여넣기</button>
                            </div>
                            <table id={'day-plan-table'}>
                                <thead>
                                <tr>
                                    <th>#</th>
                                    <th>시</th>
                                    <th>분</th>
                                    <th>주기</th>
                                    <th>변동</th>
                                    <th>1A</th>
                                    <th>1B</th>
                                    <th>2A</th>
                                    <th>2B</th>
                                    <th>3A</th>
                                    <th>3B</th>
                                    <th>4A</th>
                                    <th>4B</th>
                                    <th>5A</th>
                                    <th>5B</th>
                                    <th>6A</th>
                                    <th>6B</th>
                                    <th>7A</th>
                                    <th>7B</th>
                                    <th>8A</th>
                                    <th>8B</th>
                                </tr>
                                </thead>
                                <tbody>
                                {dayPlanTable()}
                                </tbody>
                            </table>
                        </Container>
                    </div>
                    <div className={'holiday-plan-view'}>
                        <div className={'title-view'}>
                            <h4>HOLIDAY PLAN</h4>
                            <div className={'button-group'}>
                                <button id={'holiday-plan-table-reset'} onClick={resetButton.bind()}>초기화</button>
                                <button onClick={holidayPlanUploadEvent}>업로드</button>
                                <button>다운로드</button>
                            </div>
                        </div>
                        <Container width={'410px'} height={'685px'} margin={'15px 0px 0px 0px'} padding={'30px 20px'}>
                            <table id={'holiday-plan-table'}>
                                <thead>
                                <tr>
                                    <th></th>
                                    <th>월</th>
                                    <th>일</th>
                                    <th>계획번호</th>
                                </tr>
                                </thead>
                                <tbody>
                                {holidayPlanTable()}
                                </tbody>
                            </table>
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
              .content-view, .planIndex-view{
                display: flex;
              }
              .title-view{
                display: flex;
                align-items: center;
              }
              .button-group{
                margin-left: auto;
                margin-right: 20px;
              }
              button{
                margin-left: 5px;
              }
              .holiday-plan-view .button-group {
                margin-right: 0px;
              }
              table{
                text-align: center;
                color: #707070;
              }
              th{
                border-bottom: 1px solid #EBEBEB;
                background-color: #F7F9FC;
                height: 24px;
                font-size: 14px;
              }
              th:not(:last-child), td:not(:last-child){
                border-right: 1px solid #EBEBEB;
              }
              td{
                height: 24px;
                font-size: 14px;
              }
              .planIndex-view{
                height: 20px;
                align-items: center;
                margin-bottom: 20px;
              }
              .planIndex-view button{
                height: 18px;
                padding: 5.5px;
                margin-left: 4px;
                line-height: 5px;
              }
            `}</style>
        </>
    );
};
export async function getServerSideProps(context) {
    return authCheck(context)
}
export default TODPlan;
