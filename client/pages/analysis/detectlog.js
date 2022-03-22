import React, { useEffect, useState } from "react";
import Container from "../../components/Container";
import DatePickerButton from "../../components/DatePickerButton";
import axios from "axios";


import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, Title, Tooltip, Legend, Filler} from 'chart.js'
import { Line } from 'react-chartjs-2'
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {DateToString} from "../../service/dateToString";
import {authCheck} from "../../authCheck";

ChartJS.register(
    CategoryScale,
    LinearScale,
    LineElement,
    Filler,
    Title,
    Tooltip,
    Legend,
    ChartDataLabels,
)

const Detectlog = () => {
    //date
    const [startDate, setStartDate] = useState()
    const [endDate, setEndDate] = useState()
    const [maxDate, setMaxDate] = useState()
    //table index
    const [pageIndex, setPageIndex] = useState(0)
    const [maxIndex, setMaxIndex] = useState(1)
    //selectBox
    const [groupIndex, setGroupIndex] = useState(1)
    const [groupList, setGroupList] = useState([])
    const [mapList, setMapList] = useState([])
    //data
    const [logData, setLogData] = useState([])

    useEffect(()=>{
        getGroupListAPI().catch((e)=>{console.error(e)})
        getMapListAPI().catch((e)=>{console.error(e)})
    },[])
    useEffect(()=>{},[groupList])
    useEffect(()=>{},[mapList])
    useEffect(()=>{
        setMaxIndex(Math.ceil(logData.length/24))
    },[logData])
    useEffect(()=>{},[pageIndex])

    //select box
    const setGroupEvent = (content) => {
        setGroupIndex(content.target.value)
    }
    //조회버튼 이벤트
    async function getDetectLogList(){
        try{
            const mapIndex = parseInt(document.getElementById('location_id').value)
            const url = 'http://192.168.1.43:3001/detect-log/'+DateToString(startDate)+'/'+DateToString(endDate)+'/'+mapIndex+'/listAll'
            const response = await axios.get(url)
            setLogData(response.data)
            console.log(url)
            console.log(response.data)
        }catch (e) {
            console.error(e)
        }
    }
    //api
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


    //table
    const setDataTable = () => {
        let trs = []
        const max = Math.ceil(logData.length/24) - 1
        const startNumber = max < pageIndex ? 0 : pageIndex * 24
        if(pageIndex == max || max < pageIndex){
            for(let i = startNumber; i < logData.length ; i++){
                trs.push(
                    <tr key={'data-table-tr-'+i}>
                        <th>{i+1}</th>
                        <td>{logData[i].log_time}</td>
                        <td>{logData[i].vol_1}</td>
                        <td>{logData[i].occ_1}</td>
                        <td>{logData[i].vol_2}</td>
                        <td>{logData[i].occ_2}</td>
                        <td>{logData[i].vol_3}</td>
                        <td>{logData[i].occ_3}</td>
                        <td>{logData[i].vol_4}</td>
                        <td>{logData[i].occ_4}</td>
                    </tr>)
            }
        }else {
            for(let i = startNumber; i < startNumber + 24 ; i++){
                trs.push(
                    <tr key={'data-table-tr-'+i}>
                        <th>{i+1}</th>
                        <td>{logData[i].log_time}</td>
                        <td>{logData[i].vol_1}</td>
                        <td>{logData[i].occ_1}</td>
                        <td>{logData[i].vol_2}</td>
                        <td>{logData[i].occ_2}</td>
                        <td>{logData[i].vol_3}</td>
                        <td>{logData[i].occ_3}</td>
                        <td>{logData[i].vol_4}</td>
                        <td>{logData[i].occ_4}</td>
                    </tr>
                )
            }
        }
        return trs
    }
    //chart
    const chartOptions = {
        responsive: false,
        plugins: {
            legend: {
                position: 'top'
            },
            title: {
                display: true,
            },
            datalabels: {
                formatter : () => { return null },
                color: 'black'
            }
        },
        elements: {
            point: {
                radius: 0,
            }
        },
        scales: {
            x: {
                display: false,
            },
            y: {
                beginAtZero: true,
            }
        }
    }
    const dataset = (dataType) => {
        let labels = logData.map((item)=>{return item.log_time})

        if(dataType === 'vol'){
            let JsonArray = new Array()
            let volData = new Array()
            let prevData = 0;
            JsonArray[0] = logData.map((item, index)=>{
                prevData = index === 0 ? item.vol_1 : item.vol_1 + prevData
                return prevData
            })
            JsonArray[1] = logData.map((item, index)=>{
                prevData = index === 0 ? item.vol_2 : item.vol_2 + prevData
                return prevData
            })
            JsonArray[2] = logData.map((item, index)=>{
                prevData = index === 0 ? item.vol_3 : item.vol_3 + prevData
                return prevData
            })
            JsonArray[3] = logData.map((item, index)=>{
                prevData = index === 0 ? item.vol_4 : item.vol_4 + prevData
                return prevData
            })

            for(var i = 0; i<JsonArray.length;i++){
                volData[i] = JsonArray[i].map((item, index)=>{ return index === 0? item:item+JsonArray[i][index-1]})
            }

            return {labels, datasets: [
                    {
                        label: 'vol_1',
                        data: volData[0],
                        borderColor: 'rgb(39, 156, 200)',
                        backgroundColor: 'rgba(39, 156, 200, 0.5)',
                        borderWidth: 1,
                    }, {
                        label: 'vol_2',
                        data: volData[1],
                        borderColor: 'rgb(72, 207, 173)',
                        backgroundColor: 'rgba(72, 207, 173, 0.5)',
                        borderWidth: 1,
                    }, {
                        label: 'vol_3',
                        data: volData[2],
                        borderColor: 'rgb(252, 110, 81)',
                        backgroundColor: 'rgba(252, 110, 81, 0.5)',
                        borderWidth: 1,
                    }, {
                        label: 'vol_4',
                        data: volData[3],
                        borderColor: 'rgb(255, 206, 84)',
                        backgroundColor: 'rgba(255, 206, 84, 0.5)',
                        borderWidth: 1,
                    }
                ]}

        }else {
            //dataType === 'occ'
            let occData = new Array()
            occData[0] = logData.map((item)=>{ return item.occ_1 })
            occData[1] = logData.map((item)=>{ return item.occ_2 })
            occData[2] = logData.map((item)=>{ return item.occ_3 })
            occData[3] = logData.map((item)=>{ return item.occ_4 })
            return {labels, datasets: [
                    {
                        label: 'occ_1',
                        data: occData[0],
                        borderColor: 'rgb(39, 156, 200)',
                        backgroundColor: 'rgba(39, 156, 200, 0.5)',
                        borderWidth: 1,
                    }, {
                        label: 'occ_2',
                        data: occData[1],
                        borderColor: 'rgb(72, 207, 173)',
                        backgroundColor: 'rgba(72, 207, 173, 0.5)',
                        borderWidth: 1,
                    }, {
                        label: 'occ_3',
                        data: occData[2],
                        borderColor: 'rgb(252, 110, 81)',
                        backgroundColor: 'rgba(252, 110, 81, 0.5)',
                        borderWidth: 1,
                    }, {
                        label: 'occ_4',
                        data: occData[3],
                        borderColor: 'rgb(255, 206, 84)',
                        backgroundColor: 'rgba(255, 206, 84, 0.5)',
                        borderWidth: 1,
                    }
                ]}
        }
    }

    const exportCSVData = () =>{
        const mapIndex = parseInt(document.getElementById('location_id').value)
        let text = ''
        text += 'no,log_time,id,vol_1,vol_2,vol_3,vol_4,occ_1,occ_2,occ_3,occ_4\r\n'
        logData.map((item, index)=>{
            text += (index+1)+','+item.log_time+','+mapIndex+','+item.vol_1+','+item.vol_2+','+item.vol_3+','+item.vol_4+','+item.occ_1+','+item.occ_2+','+item.occ_3+','+item.occ_4+'\r\n'
        })
        const downloadLink = document.createElement('a')
        const blob = new Blob([text], {type:'text/csv;charset=utf-8'})
        const url = URL.createObjectURL(blob)
        downloadLink.href = url
        downloadLink.download = 'data.csv'
        downloadLink.click()
    }
    const exportGraphImage = () => {
        if(logData.length>0){
            const volGraph = document.getElementsByClassName('vol_chart')[0].querySelector('canvas')
            const occGraph = document.getElementsByClassName('occ_chart')[0].querySelector('canvas')

            const image_vol = volGraph.toDataURL()
            const link_vol = document.createElement('a')
            link_vol.href = image_vol;
            link_vol.download = 'graph_vol'
            link_vol.click()

            const image_occ = occGraph.toDataURL()
            const link_occ = document.createElement('a')
            link_occ.href = image_occ;
            link_occ.download = 'graph_occ'
            link_occ.click()

        }else {
            alert('데이터 조회 후 사용해주세요.')
        }
    }
    return (
        <>
            <h3>검지기 이력 분석</h3>
            <Container width={'1570px'} height={'772px'} margin={'15px 0px 0px 0px'} padding={'20px'}>
                <div className={'select-container'}>
                    <h4>시작일</h4>
                    <div key={'startDatePicker'}> <DatePickerButton startpicker={'true'} start_date={startDate} end_date={endDate} date_update={setStartDate}/> </div>
                    <h4>종료일</h4>
                    <div key={'endDatePicker'}> <DatePickerButton startpicker={'false'} start_date={startDate} end_date={endDate} min_date={startDate} date_update={setEndDate}/> </div>
                    <h4>그룹</h4>
                    <select className={'group-select-box'} onChange={setGroupEvent}>{
                        groupList.map((item, index)=>(<option key={'group-list-'+index} value={item.group_id}>{item.group_id}. {item.group_name}</option>))
                    }</select>
                    <h4>교차로</h4>
                    <select className={'intersection-select-box'} id={'location_id'}>{
                        mapList.filter((e)=>e.group.group_id == groupIndex).map((item, index)=>(
                            <option key={'map-list-option-'+index} id={item.location_id} value={item.location_id}>{item.location_id}번 {item.location_name}</option>
                        ))
                    }</select>
                    <button onClick={getDetectLogList}>조회</button>
                    <div style={{marginLeft: 'auto'}}>
                        <button onClick={exportCSVData}>CSV내보내기</button>
                        <button onClick={exportGraphImage}>그래프저장</button>
                    </div>
                </div>
                <div className={'content-container'}>
                    <div className={'data-table-area'}>
                        <div className={'data-table'}>
                            <table className={'data-list'}>
                                <thead>
                                <tr>
                                    <th>No</th>
                                    <th>로그시간</th>
                                    <th>vol_1</th>
                                    <th>occ_1</th>
                                    <th>vol_2</th>
                                    <th>occ_2</th>
                                    <th>vol_3</th>
                                    <th>occ_3</th>
                                    <th>vol_4</th>
                                    <th>occ_4</th>
                                </tr>
                                </thead>
                                <tbody>
                                {setDataTable()}
                                </tbody>
                            </table>
                        </div>
                        <div className={'data-table-index'}>{createIndex()}</div>
                    </div>
                    <div className={'content-chart-area'}>
                        <h4>그래프</h4>
                        <div className={'vol_chart'}>
                            <Line options={chartOptions} data={dataset('vol')} width={650} height={350}/>
                        </div>
                        <div className={'occ_chart'}>
                            <Line options={chartOptions} data={dataset('occ')} width={650} height={350}/>
                        </div>
                    </div>
                </div>
            </Container>
            <style jsx>{`
              h3, h4{
                color: #707070;
              }
              .select-container{
                display: flex;
                align-items: center;
              }
              .select-container h4{
                margin-right: 10px;
              }
              select{
                padding: 4px 12px;
                border: 2px solid #707070;
                border-radius: 5px;
                margin-right: 8px;
                color: #707070;
                font-family: NanumSquareAcB;
              }
              .content-container{
                display: flex;
                width: 100%;
                height: 95%;
                margin-top: 10px;
              }
              table{
                color: #707070;
                text-align: center;
                font-size: 13px;
                border-collapse: collapse;
              }
              th{
                background-color: #FAFAFA;
                border-bottom: 1px solid #DEDEDE;
                padding: 2px;
              }
              td{
                color: #707070;
              }
              .data-table-area{
                height: 95%;
                width: 60%;
                box-shadow: 2px 2px .1px #DADBDE inset;
                padding: 20px;
              }
              .content-chart-area{
                width: 45%;
                height: 95%;
                box-shadow: 2px 2px .1px #DADBDE inset;
                padding: 20px;
              }

            `}</style>
        </>
    );
};
export async function getServerSideProps(context) {
    return authCheck(context)
}
export default Detectlog;
