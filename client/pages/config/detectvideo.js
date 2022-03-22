import React, {useEffect, useState} from 'react';
import Container from "../../components/Container";
import {authCheck} from "../../authCheck";
import {DateToString} from "../../service/dateToString";
import axios from "axios";
import swal from "sweetalert2";
const DetectVideoConfig = () => {

    const [optionEvent, setOptionEvent] = useState(false)

    const [pageIndex, setPageIndex] = useState(0)
    const [maxIndex, setMaxIndex] = useState(1)

    const [detectorList, setDetectorList] = useState([])
    const [groupList, setGroupList] = useState([])
    const [mapList, setMapList] = useState([])
    const [selectDetector, setSelectDetector] = useState(null)

    const [groupId, setGroupId] = useState(1)
    const [mapId, setMapId] = useState(1)

    useEffect(()=>{
        getGroupListAPI().catch((e)=>{console.error(e)})
        getMapListAPI().catch((e)=>{console.error(e)})
    },[])
    useEffect(() => {
        setMaxIndex(Math.ceil(detectorList.length/4))
    }, [detectorList]);
    useEffect(()=>{},[mapList])
    useEffect(()=>{},[groupList])
    useEffect(()=>{

    },[mapId])
    useEffect(()=>{
        if(optionEvent){
            const table_td = document.getElementsByClassName('detector-editor-table')[0].querySelectorAll('td')
            table_td[0].innerText = selectDetector.detector_name
            table_td[1].innerText = selectDetector.detector_ip
        }
    },[optionEvent])
    useEffect(()=>{
        if(optionEvent){
            const table_td = document.getElementsByClassName('detector-editor-table')[0].querySelectorAll('td')
            table_td[0].innerText = selectDetector.detector_name
            table_td[1].innerText = selectDetector.detector_ip
        }
    },[selectDetector])

    async function getGroupListAPI() {
        try{
            const url = 'http://192.168.1.43:3001/group/listAll'
            const response = await axios.get(url)
            setGroupList(response.data)
        }catch (e) {
            console.error(e)
        }
    }
    async function getMapListAPI() {
        try{
            const url = 'http://192.168.1.43:3001/locations/listAll'
            const response = await axios.get(url)
            setMapList(response.data)
        }catch (e) {
            console.error(e)
        }
    }
    async function getDetectListAPI() {
        try{
            const url = 'http://192.168.1.43:3001/detector/getList/location/'+mapId
            const response = await axios.get(url)
            console.log(response.data)
            setDetectorList(response.data)
        }catch (e) {
            console.error(e)
        }
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
        setPageIndex(indexItem.target.id.split('_')[1])
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

    const showEditor = () => {
        if(detectorList.length > 0){
            if(selectDetector != null){
                setOptionEvent(!optionEvent)
            }else {
                swal.fire({
                    icon: 'warning',
                    text: '검지기를 선택해주세요.'
                })
            }
        }
    }
    const updateGroupId = (select) =>{
        setGroupId(select.target.selectedIndex+1)
    }
    const updateMapId = (select) => {
        setMapId(select.target.options[select.target.selectedIndex].id)
    }
    const updateSelectDetector = (content) =>{
        setSelectDetector(detectorList[content.target.id.split('-')[1]-1])
    }

    const createDataTable = () => {
        let trs = []
        const max = Math.ceil(detectorList.length/4) - 1
        const startNumber = max < pageIndex ? 0 : pageIndex * 4
        if(pageIndex == max || max < pageIndex){
            for(let i = startNumber; i < detectorList.length; i++){
                trs.push(
                    <tr key={'data-table-tr-'+i}>
                        <td><input type={'radio'} name={'radio-button-group'} id={'item-'+detectorList[i].detector_channel} onClick={updateSelectDetector.bind()} /><label htmlFor={'item-'+detectorList[i].detector_channel}></label></td>
                        <td>{detectorList[i].detector_no}</td>
                        <td>{detectorList[i].detector_name}</td>
                        <td>{detectorList[i].detector_ip}</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                )
            }
        }else {
            for(let i = startNumber; i < startNumber + 4 ; i++){
                trs.push(
                    <tr key={'data-table-tr-'+i}>
                        <td><input type={'radio'} name={'radio-button-group'} id={'item-'+i} onClick={updateselectDetector.bind()} /><label htmlFor={'item-'+i}></label></td>
                        <td>{detectorList[i].detector_no}</td>
                        <td>{detectorList[i].detector_name}</td>
                        <td>{detectorList[i].detector_ip}</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                )
            }
        }
        return trs
    }

    return (
        <>
            <div className={'title-option'}>
                <h3>영상 검지기 설정</h3>
                <select onChange={updateGroupId.bind()}>
                    {
                        groupList.map((item, index)=>(<option key={'group-list-'+index}>{item.group_id}. {item.group_name}</option>))
                    }
                </select>
                <select onChange={updateMapId.bind()}>
                    {
                        mapList.filter((e)=>e.group.group_id == groupId).map((item, index)=>(
                            <option key={'map-list-option-'+index} id={item.location_id}>{item.location_id}번 {item.location_name}</option>
                        ))
                    }
                </select>
                <button onClick={getDetectListAPI}>조회</button>
                <div className={'option-button-group'}>
                    <button className={'option-button'} onClick={showEditor}>영상 검지기 편집</button>
                </div>
            </div>
            <Container width={'1570px'} height={'765px'} margin={'15px 0px 0px 0px'} padding={'20px'}>
                <div className={'detector-list-table'}>
                    <table>
                        <thead>
                            <tr>
                                <th></th>
                                <th>No</th>
                                <th>검지기 명칭</th>
                                <th>IP</th>
                                <th>검지영상</th>
                                <th>마지막 연결시간</th>
                                <th>연결상태</th>
                                <th>프로그램동작</th>
                                <th>CAN 연결</th>
                                <th>LMB 연결</th>
                                <th>DET 모드</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                createDataTable()
                            }
                        </tbody>
                    </table>
                    <div className={'data-table-index'}>
                        {createIndex()}
                    </div>
                </div>
                {
                    optionEvent ?
                        <div className={'setting-view'}>
                            <div className={'data-table'}>
                                <h4  className={'highlight'} style={{height: '28px'}}>검지기 정보</h4>
                                <table className={'detector-editor-table'}>
                                    <tbody>
                                    <tr>
                                        <th>검지기 명칭</th>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <th>IP</th>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <th>마지막 연결 시간</th>
                                        <td>2021-12-24 03:01:01</td>
                                    </tr>
                                    <tr>
                                        <th>연결상태</th>
                                        <td>연결안됨</td>
                                    </tr>
                                    <tr>
                                        <th>프로그램동작</th>
                                        <td>-</td>
                                    </tr>
                                    <tr>
                                        <th>CAN연결</th>
                                        <td>-</td>
                                    </tr>
                                    <tr>
                                        <th>LMB연결</th>
                                        <td >-</td>
                                    </tr>
                                    <tr>
                                        <th>DET모드</th>
                                        <td colSpan={2}>-</td>
                                    </tr>
                                    <tr>
                                        <th>표준편차</th>
                                        <td><div className={'detect-input-area'}><input type={'number'}/><button>설정</button></div></td>
                                    </tr>
                                    <tr>
                                        <th>검지모드</th>
                                        <td><div className={'detect-mode-button'}><select><option>강제검지모드</option></select><button>설정</button></div></td>
                                    </tr>
                                    </tbody>
                                </table>
                        </div>
                            <div className={'content-view'}>
                                <div className={'content-label'}>
                                    <h4  className={'highlight'} style={{height: '28px'}}>검지영역설정</h4>
                                    <div className={'content-button-group'}>
                                        <button>Clear</button>
                                        <button>영역설정</button>
                                    </div>
                                </div>
                                <div className={'content-video'}>
                                </div>
                            </div>
                            <div className={'content-view'}>
                                <h4 className={'highlight'} style={{height: '28px'}}>NANO 검지영상</h4>
                                <div className={'content-video'}>
                                </div>
                            </div>
                        </div> : null
                }
            </Container>

            <style jsx>{`
              h4, h3 {
                color: #707070;
              }

              .title-option {
                display: flex;
              }

              .option-button {
                margin-left: 4px;
              }

              .option-button-group {
                display: flex;
                margin-left: auto;
              }

              .detector-list-table {
                width: 100%;
                height: 220px;
              }

              .setting-view {
                width: 99%;
                height: 520px;
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

              input[type='radio'] + label {
                line-height: 22px;
                margin-top: 5px;
              }

              .data-table {
                margin-left: 10px;
                width: 20%;
              }

              .data-table td {
                border: none;
                height: 30px;
                text-align: left;
              }
              .data-table th {
                border: none;
                height: 30px;
                text-align: left;
              }

              .content-view {
                width: 650px;
                height: 520px;
                margin-left: 5px;
              }

              .content-button-group {
                margin-left: auto;
                display: flex;
              }

              .content-label {
                display: flex;
              }

              .content-video {
                width: 640px;
                height: 480px;
                background-color: #DEDEDE;
                border: 1px solid black;
              }
              .detect-mode-button{
                display: flex;
                height: 25px;
              }
              .detect-mode-button button, .detect-input-area button{
                font-size: 13px;
              }
              select{
                font-size: 13px;
              }
              .detect-input-area{
                display: flex;
                height: 25px;
                line-height: 25px;
              }
              .detect-input-area input[type='number']{
                width: 60px;
              }
              
              .highlight{
                color: #727CF5;
              }
              
              button + button {
                margin-left: 4px;
              }
              
              .input-item{
                width: 120px;
              }
              input{
                font-family: NanumSquareAcB;
                color: #707070;
              }
              select{
                font-family: NanumSquareAcB;
                color: #707070;
              }
              
              .title-option select{
                margin-left: 4px;
              }
            `}</style>
        </>
    );
};
export async function getServerSideProps(context) {
    return authCheck(context)
}
export default DetectVideoConfig;
