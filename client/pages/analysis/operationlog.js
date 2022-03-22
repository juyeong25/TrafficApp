import React, { useEffect, useState } from "react";
import Container from "../../components/Container";
import DatePickerButton from "../../components/DatePickerButton";
import axios from "axios";

import Highcharts from 'highcharts/highstock';
import HighchartsReact from "highcharts-react-official";
import HighchartsExporting from 'highcharts/modules/exporting';
import {DateToString, TimeToString} from "../../service/dateToString";
import {authCheck} from "../../authCheck";
const Operationlog = () => {
    if (typeof Highcharts === 'object') {
        HighchartsExporting(Highcharts)
    }

    //date
    const [targetDate, setTargetDate] = useState()
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

    //select box
    const setGroupEvent = (content) => {
        setGroupIndex(content.target.value)
    }

    //조회버튼 이벤트
    async function getOperationLogList(){
        try{
            const mapIndex = parseInt(document.getElementById('location_id').value)
            const url = 'http://192.168.1.43:3001/cycle-log/'+DateToString(targetDate)+'/'+DateToString(targetDate)+'/'+mapIndex+'/listAll'
            const response = await axios.get(url)
            console.log(url)
            setLogData(response.data)
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
                        <td>{logData[i].cycle}</td>
                        <td>{logData[i].offset_value}</td>
                        <td>{logData[i].split_1}</td>
                        <td>{logData[i].split_2}</td>
                        <td>{logData[i].split_3}</td>
                        <td>{logData[i].split_4}</td>
                        <td>{logData[i].split_5}</td>
                        <td>{logData[i].split_6}</td>
                        <td>{logData[i].split_7}</td>
                        <td>{logData[i].split_8}</td>
                        <td>{logData[i].ped_1}</td>
                        <td>{logData[i].ped_2}</td>
                        <td>{logData[i].ped_3}</td>
                        <td>{logData[i].ped_4}</td>
                        <td>{logData[i].ped_5}</td>
                        <td>{logData[i].ped_6}</td>
                        <td>{logData[i].ped_7}</td>
                        <td>{logData[i].ped_8}</td>
                    </tr>)
            }
        }else {
            for(let i = startNumber; i < startNumber + 24 ; i++){
                trs.push(
                    <tr key={'data-table-tr-'+i}>
                        <th>{i+1}</th>
                        <td>{logData[i].log_time}</td>
                        <td>{logData[i].cycle}</td>
                        <td>{logData[i].offset_value}</td>
                        <td>{logData[i].split_1}</td>
                        <td>{logData[i].split_2}</td>
                        <td>{logData[i].split_3}</td>
                        <td>{logData[i].split_4}</td>
                        <td>{logData[i].split_5}</td>
                        <td>{logData[i].split_6}</td>
                        <td>{logData[i].split_7}</td>
                        <td>{logData[i].split_8}</td>
                        <td>{logData[i].ped_1}</td>
                        <td>{logData[i].ped_2}</td>
                        <td>{logData[i].ped_3}</td>
                        <td>{logData[i].ped_4}</td>
                        <td>{logData[i].ped_5}</td>
                        <td>{logData[i].ped_6}</td>
                        <td>{logData[i].ped_7}</td>
                        <td>{logData[i].ped_8}</td>
                    </tr>
                )
            }
        }
        return trs
    }
    //chart
    const options = {
        chart:{
            height: 660,
            width: 700,
            defaultSeriesType: "column",
        },
        xAxis:{
            categories: logData.map((item)=>{return TimeToString(new Date(item.log_time))}),
            type: 'datetime',
            labels: {format: '{value:%H:%M}'},
        },
        yAxis: {
            title: {text: '주기(초)'},
            opposite:false,
            stackLabels: true,
            max: 150,
        },
        legend: {
            enabled: true,
            width: 450,
            backgroundColor: '#ffffff',
            borderColor: 'black',
            borderWidth: 1,
        },
        plotOptions: {
            column: {
                dataGrouping: {groupPixelWidth: 1, enabled: false}, //
                stacking: 'normal',
                grouping: true,
            },
            pointRange: 1,
            series: {
                selected: true,
            }
        },
        rangeSelector:{
            inputEnabled: false,
            buttons: [],
        },
        scrollbar: { enabled: false },
        series: [
            {
                name: 'offset',
                type: 'spline',
                data: logData.map((item)=>{return item.offset}),
            },
            {
                name: 'cycle',
                type: 'spline',
                data: logData.map((item)=>{return item.cycle}),
            },
            {
                name: 'split_1',
                type: 'column',
                data: logData.map((item)=>{return item.split_1}),
                stack: 1,
            },
            {
                name: 'split_2',
                type: 'column',
                data: logData.map((item)=>{return item.split_2}),
                stack: 1,
            },
            {
                name: 'split_3',
                type: 'column',
                data: logData.map((item)=>{return item.split_3}),
                stack: 1,
            },
            {
                name: 'split_4',
                type: 'column',
                data: logData.map((item)=>{return item.split_4}),
                stack: 1,
            },
            {
                name: 'split_5',
                type: 'column',
                data: logData.map((item)=>{return item.split_5}),
                stack: 1,
            },
            {
                name: 'split_6',
                type: 'column',
                data: logData.map((item)=>{return item.split_6}),
                stack: 1,
            },
            {
                name: 'split_7',
                type: 'column',
                data: logData.map((item)=>{return item.split_7}),
                stack: 1,

            },
            {
                name: 'split_8',
                type: 'column',
                data: logData.map((item)=>{return item.split_8}),
                stack: 1,

            },

        ]
    };

    const exportCSVData = () =>{
        const mapIndex = parseInt(document.getElementById('location_id').value)
        let text = ''
        text += 'no,log_time,id,cycle,offset,split_1,split_2,split_3,split_4,split_5,split_6,split_7,split_8,ped_1,ped_2,ped_3,ped_4,ped_5,ped_6,ped_7,ped_8\r\n'
        logData.map((item, index)=>{
            text+=(index+1)+','+item.log_time+','+mapIndex+','+item.cycle+','+item.offset_value+','
                +item.split_1+','+item.split_2+','+item.split_3+','+item.split_4+','+item.split_5+','+item.split_6+','+item.split_7+','+item.split_8+','
                +item.ped_1+','+item.ped_2+','+item.ped_3+','+item.ped_4+','+item.ped_5+','+item.ped_6+','+item.ped_7+','+item.ped_8+'\r\n'
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
            const graph_svg = document.getElementsByClassName('highcharts-container ')[0].querySelector('svg').outerHTML
            const svgBlob = new Blob([graph_svg], {type:'image/svg+xml; charset=utf-8'})
            const svgUrl = URL.createObjectURL(svgBlob)

            let downloadLink = document.createElement('a')
            downloadLink.href = svgUrl
            downloadLink.download = 'operationLogGraph'
            document.body.appendChild(downloadLink)
            downloadLink.click()
            document.body.removeChild(downloadLink)
            URL.revokeObjectURL(svgUrl)
        }else {
            alert('데이터 조회 후 사용해주세요.')
        }
    }



    return (
        <>
            <h3>운영 이력 분석</h3>
            <Container width={'1570px'} height={'772px'} margin={'15px 0px 0px 0px'} padding={'20px'}>
                <div className={'select-container'}>
                    <h4>날짜</h4>
                    <div key={'startDatePicker'}> <DatePickerButton startpicker={'true'} start_date={targetDate} date_update={setTargetDate}/> </div>
                    <h4>그룹</h4>
                    <select className={'group-select-box'} onChange={setGroupEvent}>{
                        groupList.map((item, index)=>(<option key={'group-list-'+index} value={item.group_id}>{item.group_id}. {item.group_name}</option>))
                    }</select>
                    <h4>교차로</h4>
                    <select className={'intersection-select-box'} id={'location_id'}>{
                        mapList.filter((e)=>e.group.group_id == groupIndex).map((item, index)=>(
                            <option key={'map-list-option-'+index} value={item.location_id}>{item.location_id}번 {item.location_name}</option>
                        ))
                    }</select>
                    <button onClick={getOperationLogList}>조회</button>
                    <div style={{marginLeft: 'auto'}}>
                        <button onClick={exportCSVData}>CSV내보내기</button>
                        <button onClick={exportGraphImage}>그래프저장</button>
                    </div>
                </div>
                <div className={'content'}>
                    <div className={'data-table-container'}>
                        <div className={'data-table-item'}>
                            <table className={'data-list'}>
                                <thead>
                                <tr>
                                    <th>No</th>
                                    <th>로그 시간</th>
                                    <th>Cycle</th>
                                    <th>offset</th>
                                    <th>split_1</th>
                                    <th>split_2</th>
                                    <th>split_3</th>
                                    <th>split_4</th>
                                    <th>split_5</th>
                                    <th>split_6</th>
                                    <th>split_7</th>
                                    <th>split_8</th>
                                    <th>pad_1</th>
                                    <th>pad_2</th>
                                    <th>pad_3</th>
                                    <th>pad_4</th>
                                    <th>pad_5</th>
                                    <th>pad_6</th>
                                    <th>pad_7</th>
                                    <th>pad_8</th>
                                </tr>
                                </thead>
                                <tbody>
                                {/*데이터를 불러와서 그릴 공간*/}
                                {logData ? setDataTable() : null}
                                </tbody>
                            </table>
                        </div>
                        <div className={'data-table-index'}>
                            {createIndex()}
                        </div>
                    </div>
                    <div className={'data-chart-container'}>
                        <div><h4>그래프</h4></div>
                        {logData ? <HighchartsReact highcharts={Highcharts} constructorType={'stockChart'} options={options}/>: null}
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
              .content{
                display: flex;
                width: 100%;
                height: 95%;
                margin-top: 10px;
              }
              .content .data-table-container{
                height: 95%;
                box-shadow: 2px 2px .1px #DADBDE inset;
                padding: 20px;
              }
              .content .data-chart-container{
                width: 45%;
                height: 95%;
                box-shadow: 2px 2px .1px #DADBDE inset;
                padding: 20px;
              }

              .content .data-table-container table{
                color: #707070;
                text-align: center;
                font-size: 15px;
                border-collapse: collapse;
                width: 1300px;
              }
              .data-table-item{
                width: 800px;
                height: 99%;
                overflow: auto;
              }
              .data-table-index{
                width: 100%;
                height: 2%;
              }
              th{
                background-color: #FAFAFA;
                border-bottom: 1px solid #DEDEDE;
                padding: 2px;
              }
              td{
                color: #707070;
              }
              .data-chart-container{
              }
            `}</style>
        </>
    );
};
export async function getServerSideProps(context) {
    return authCheck(context)
}
export default Operationlog;
