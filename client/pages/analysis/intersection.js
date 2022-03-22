import React, {useState, useEffect} from 'react';
import Container from "../../components/Container";
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, BarElement, Title, Tooltip, Legend, Filler} from 'chart.js'
import { Line } from 'react-chartjs-2'
import ChartDataLabels from 'chartjs-plugin-datalabels';
import axios from "axios";
import group from "../config/group";
import {authCheck} from "../../authCheck";

ChartJS.register(
    CategoryScale,
    LinearScale,
    LineElement,
    BarElement,
    Filler,
    Title,
    Tooltip,
    Legend,
    ChartDataLabels,
)

const IntersectionData = () => {

    const [selectedID, setSelectedID] = useState(0)
    const [mapList, setMapList] = useState([])

    const [pageIndex, setPageIndex] = useState(0)
    const [maxIndex, setMaxIndex] = useState(1)
    const [chartOptions, setChartOptions] = useState({
        offset: true, band: false, chart_tooltip: true, type: 'horizontal'
    })
    const [chartSpeed, setChartSpeed] = useState(60)

    const [groupList, setGroupList] = useState([])
    const [groupID, setGroupID] = useState(1)

    //시공도
    const [maxHeight, setMaxHeight] = useState(3000)
    const timeArray = ['0시', '1시', '2시', '3시', '4시', '5시', '6시', '7시', '8시', '9시', '10시', '11시', '12시', 
        '13시', '14시', '15시', '16시', '17시', '18시', '19시', '20시', '21시', '22시', '23시']
    useEffect(()=>{
        getGroupListAPI().catch((e)=>{console.error(e)})
        setMaxIndex(Math.ceil(mapList.length/10))
        document.querySelectorAll(".chart-options input[type='checkbox']")[0].checked = true
        document.querySelectorAll(".chart-options input[type='checkbox']")[2].checked = true
    },[])
    useEffect(()=>{},[selectedID])
    useEffect(()=>{
        updateMaxHeight()
        setMaxIndex(Math.ceil(mapList.length/10))
        setSelectedID(0)
    },[mapList])
    useEffect(()=>{

    }, [groupList])
    useEffect(()=>{
    }, [chartOptions])
    useEffect(()=>{},[chartSpeed])


    async function getGroupListAPI(){
        try{
            const response = await axios.get('http://192.168.1.43:3001/group/listAll')
            setGroupList(response.data)
            console.log(response.data)
            setSelectedID(0)
        }catch (e) {
            console.error(e)
        }
    }
    const updateReportData = (button) =>{
        setSelectedID(button.target.id)
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

    //data table
    const setDataTable = () => {
        let trs = []
        const max = Math.ceil(mapList.length/10) - 1
        const startNumber = max < pageIndex ? 0 : pageIndex * 10
        if(pageIndex == max || max < pageIndex){
            for(let i = startNumber; i < mapList.length ; i++){
                trs.push(
                    <tr key={'data-table-tr-'+i}>
                        <th>{i+1}</th>
                        <td>{mapList[i].location_name}</td>
                        <td>{mapList[i].location_distance}m</td>
                        <td>{0}</td>
                        <td>{0}</td>
                        <td>{0}</td>
                        <td><div className={'intersection-report-button'} >
                            <img style={{width:'20px'}} src={'/clipboard2-check.svg'} onClick={updateReportData.bind()} id={i+1}/>
                        </div></td>
                    </tr>
                )
            }
        }else {
            for(let i = startNumber; i < startNumber + 10 ; i++){
                trs.push(
                    <tr key={'data-table-tr-'+i}>
                        <th>{i+1}</th>
                        <td>{mapList[i].location_name}</td>
                        <td>{mapList[i].location_distance}m</td>
                        <td>{0}</td>
                        <td>{0}</td>
                        <td>{0}</td>
                        <td><div className={'intersection-report-button'} >
                            <img style={{width:'20px'}} src={'/clipboard2-check.svg'} onClick={updateReportData.bind()} id={i+1}/>
                        </div></td>
                    </tr>
                )
            }
        }
        return trs
    }
    async function getMapListDate(){
        try{
            const response = await axios.get('http://192.168.1.43:3001/locations/listAll')
            setMapList(response.data.filter((e)=>e.group.group_id == groupID))
        }catch (e) {
            console.error(e)
        }
    }
    //시공도
    const changeChartType = (typeButton) =>{
        document.querySelectorAll('span.active').forEach((el)=>{
            el.classList.remove("active")
        })
        typeButton.target.classList.toggle("active")
        setChartOptions({offset: chartOptions.offset, band: chartOptions.band, chart_tooltip: chartOptions.chart_tooltip, type: typeButton.target.innerText})
    }
    const options={
        responsive : false,
        scales: {
            x:{
                stacked: true,
                type:'linear',
                title:{
                    display: true,
                    text: '거리(m)'
                },
                grid: {
                    color: "rgba(0, 0, 0, 0)",
                },
                display: true,
                ticks:{
                    callback: function(val, index){
                        return val+"m";
                    },
                    font:{
                        size: 10,
                    },
                    minRotation: 0,
                    beginAtZero:true
                },
            },
            y: {
                stacked: true,
                ticks: {
                    beginAtZero:true
                },
                title:{
                    display: true,
                    text: '시간(s)'
                },
                grid: {
                    color: "rgba(0, 0, 0, 0)",
                },
                min: 0,
                max: maxHeight,
            },
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                enabled : chartOptions.chart_tooltip,
                usePointStyle: true,
                callbacks: {
                    title: function(context){
                        const label = context[0].dataset.label.split('_')[0] || '';
                        const data_index = context[0].dataset.label.split('_')[2]
                        return label != 'speed' ? mapList[data_index].location_name : null
                    },
                    label: function(context) {
                        let label = context.dataset.label.split('_')[0] || '';
                        const data_index = context.dataset.label.split('_')[2]
                        switch (label){
                            case 'phase': label = label+ ": " + mapList[data_index].phase; break;
                            case 'cycle': label = label+'-phase: ' + (mapList[data_index].cycle - mapList[data_index].phase); break;
                            default: break;
                        }
                        return label;
                    }
                }
            },
            datalabels: {
                formatter : () => { return null },
                color: 'black'
            },
        }
    }
    const dataset=()=>{
        const labels = mapList.map((item)=>{return item.location_name})
        let sum = mapList[0].distance
        let distanceArray = []
        let minCycle = mapList[0].cycle

        mapList.map((item, index)=>{
            sum+=item.distance
            distanceArray.push(sum)
            minCycle = minCycle > item.cycle ? item.cycle : minCycle
        })

        const stackCount = maxHeight/minCycle + 1
        let dataArray = []
        const speed = chartSpeed /3.6

        dataArray.push({
            type: 'line',
            label: 'speed',
            data: [{x:0, y:mapList[0].phase},{x: sum, y:sum/speed}],
            backgroundColor:'rgba(255, 146, 144, 0)',
            borderColor: 'rgb(255,72,70)',
            borderWidth: 1,
            barThickness: 15,
            barPercentage: 0.6,
            maxBarThickness: 15,
            minBarLength: 5,
        })
        if(chartOptions.band){
            const targetIndex = dataArray.findIndex(e=>e.label =='speed')
            dataArray.push({
                type: 'line',
                label: 'speed-band',
                data: [{x:0, y:200},{x: sum, y:200}],
                backgroundColor:'rgba(255, 146, 144, 0)',
                borderColor: 'rgb(255,72,70)',
                borderWidth: 1,
                barThickness: 15,
                barPercentage: 0.6,
                maxBarThickness: 15,
                minBarLength: 5,
                fill:{above: 'rgba(255, 146, 144, 0.39)', below: 'rgba(255, 146, 144, 0.2)', target: targetIndex},
            })
        }
        if(chartOptions.offset){
            dataArray.push({
                type: 'bar',
                label: 'offset',
                data: mapList.map((item, index)=>{
                    return {x: distanceArray[index], y:item.offset}
                }),
                backgroundColor: 'rgba(78, 107, 128, 1)',
                borderColor: 'rgba(0,0,0,1)',
                borderWidth: 1,
                barThickness: 15,
                barPercentage: 0.6,
                maxBarThickness: 15,
                minBarLength: 5,
            })
        }
        mapList.map((item, index)=>{
            for(let j = 1; j < stackCount; j++){
                dataArray.push({
                        type: 'bar',
                        label: 'phase_'+j+'_'+index,
                        data: [{x: distanceArray[index], y:item.phase}],
                        backgroundColor: 'rgba(79, 182, 255, 1)',
                        borderColor: 'rgba(0,0,0,1)',
                        borderWidth: 1,
                        barThickness: 15,
                        barPercentage: 0.6,
                        maxBarThickness: 15,
                        minBarLength: 5,
                    },
                    {
                        type: 'bar',
                        label: 'cycle_'+j+'_'+index,
                        data: [{x: distanceArray[index], y:item.cycle-item.phase}],
                        backgroundColor: 'rgba(156, 214, 255, 1)',
                        borderColor: 'rgba(0,0,0,1)',
                        borderWidth: 1,
                        barThickness: 15,
                        barPercentage: 0.6,
                        maxBarThickness: 15,
                        minBarLength: 5,
                    },)
            }
        })
        return {labels, datasets: dataArray}
    }
    const onChangeNumberHandler = (Number) => {
        setChartSpeed(Number.target.value)
    }
    const updateMaxHeight = () =>{
        if(mapList.length > 0){
            let distance = 0
            mapList.map((item)=>{distance += item.distance})
            setMaxHeight(distance/chartSpeed * 3.6 + 500)
        }
    }
    const handleClick = (content) =>{
        switch (content.target.id){
            case 'offset-checkbox':
                setChartOptions({offset: content.target.checked, band: chartOptions.band, chart_tooltip: chartOptions.chart_tooltip, type: 'horizontal'});
                break;
            case 'band-checkbox':
                setChartOptions({offset: chartOptions.offset, band: content.target.checked, chart_tooltip: chartOptions.chart_tooltip, type: 'horizontal'});
                break;
            case 'tooltip-checkbox':
                setChartOptions({offset: chartOptions.offset, band: chartOptions.band, chart_tooltip: content.target.checked, type: 'horizontal'});
                break;
            default: break;
        }
    }
    //교차로 보고서 테이블
    const createPlanTable = (key, className, labels, id) => {

        let rows = []
        const reportTableStyle = {
            fontSize: '12px',
            marginRight: className == 'HolyDayTable' ? '':'5px',
            color: '#707070',
        }
        const thStyle={
            border: '1px solid #DEDEDE',
            backgroundColor: '#FAFAFA',
        }
        const tdStyle={
            border: '1px solid #DEDEDE',
            height: '14px',
        }

        const startIndex = className == 'HolyDayTable' && id == 2 ? 10 : 0
        for(let i = startIndex ; i < startIndex+10 ; i++){
            let tds = []
            labels.map((item, index)=>{
                index==0?tds.push(
                    <th style={thStyle} key={key+'item-index-'+i}>{i+1}</th>)
                    : tds.push(<td style={tdStyle} key={key+'item-td-'+item+i}></td>
                    )
            })
            rows.push(<tr key={key+'item-tr-'+i}>{tds}</tr>)
        }

        return (
            <table className={className} style={reportTableStyle}>
                <thead>
                    <tr>
                        {labels.map((item, index)=>(<th style={thStyle} key={key+'item-th-'+index}>{item}</th>))}
                    </tr>
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </table>
        )
    }
    const setGroupEvent = (content) => {
        setGroupID(content.target.selectedIndex+1)
    }

    const exportCSVData = () =>{
        if(mapList.length > 0){
            let text = ''
            text += 'no,location_name,distance,cycle,offset,phase\r\n'
            mapList.map((item, index)=>{
                console.log(item)
                text += (index+1)+','+item.location_name+','+item.location_distance+',0,0,0\r\n'
            })
            const downloadLink = document.createElement('a')
            const blob = new Blob(["\ufeff"+text], {type:'text/csv;charset=utf-8'})
            const url = URL.createObjectURL(blob)
            downloadLink.href = url
            downloadLink.download = 'data.csv'
            downloadLink.click()
        }
    }
    const exportGraphImage = () => {
        if(mapList.length>0){
            const canvas = document.querySelector('canvas')

            const image = canvas.toDataURL()
            const link = document.createElement('a')
            link.href = image;
            link.download = 'timeSpaceGraph'
            link.click()
        }else {
            alert('데이터 조회 후 사용해주세요.')
        }
    }
    const printReport = () => {
        const printContent = document.getElementsByClassName('report-area')[0].contentWindow
        const originalContent = document.body.innerHTML
    }

    return (
        <>
            <h3>교차로 분석</h3>
            <div className={'content'}>
                <div>
                    <Container width={'760px'} height={'345px'} margin={'15px 20px 0px 0px'} padding={'20px'}>
                        <div className={'select-view'}>
                            <h4>DATA TABLE</h4>
                            <h4>그룹</h4>
                            <select className={'group-select-box'} onChange={setGroupEvent}>{
                                groupList.map((item, index)=>(<option key={'group-list-'+index}>{item.group_id}. {item.group_name}</option>))
                            }</select>
                            <h4>기준 시간</h4>
                            <select>
                                {timeArray.map((item, index)=>(<option key={'time-list-'+index} id={'id_'+index}>{item}</option>))}
                            </select>
                            <button onClick={getMapListDate}>조회</button>
                            <div style={{marginLeft: 'auto'}}>
                                <button onClick={exportCSVData}>CSV내보내기</button>
                                <button onClick={exportGraphImage}>시공도저장</button>
                            </div>
                        </div>
                        <div className={'data-table'}>
                            {mapList.length>0 ?
                                <table className={'data-list'}>
                                    <thead>
                                    <tr>
                                        <th></th>
                                        <th>교차로</th>
                                        <th>이전 교차로와의 거리</th>
                                        <th>주기</th>
                                        <th>offset</th>
                                        <th>phase</th>
                                        <th></th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {
                                        setDataTable()
                                    }
                                    </tbody>
                                </table> :
                                <div className={'placeholder-text'}>그룹과 시간 선택 후 조회버튼을 눌러주세요.</div>
                            }
                            <div>{createIndex()}</div>
                        </div>
                    </Container>
                    <Container width={'760px'} height={'373px'} margin={'15px 20px 0px 0px'} padding={'20px'}>
                        <div className={'chart-option-view'}>
                            <h4>시공도</h4>
                            {/*<div className={'chart-type-toggle'}>*/}
                            {/*    <span className={'chart-type active'} onClick={changeChartType.bind()}>Horizontal</span><span className={'chart-type'} onClick={changeChartType.bind()}>Vertical</span>*/}
                            {/*</div>*/}
                            <div className={'chart-options'}>
                                <div className={'slider-item'}>
                                    <span>속도</span>
                                    <input type={'number'} step={10} min={0} max={200} value={chartSpeed} onChange={onChangeNumberHandler}/>
                                </div>
                                <input type={'checkbox'} id={'offset-checkbox'} onClick={handleClick.bind()} /><label htmlFor={'offset-checkbox'}>offset</label>
                                <input type={'checkbox'} id={'band-checkbox'} onClick={handleClick.bind()} /><label htmlFor={'band-checkbox'}>band</label>
                                <input type={'checkbox'} id={'tooltip-checkbox'} onClick={handleClick.bind()} /><label htmlFor={'tooltip-checkbox'}>tooltip</label>
                            </div>
                        </div>
                        <div className={'timeSpaceDiagramView'}>
                            {mapList.length > 0 ?<Line options={options} data={dataset()} width={750} height={340}/> : null}
                        </div>
                    </Container>
                </div>
                <Container width={'750px'} height={'772px'} margin={'15px 0px 0px 0px'} padding={'20px'}>
                    <div style={{display:'flex'}}>
                        <h4>교차로 보고서</h4>
                        <button style={{marginLeft: 'auto', height:'20px', lineHeight:'10px', fontSize:'13px'}} onClick={printReport}>인쇄</button>
                    </div>

                    <div className={'report-area'}>
                        <div className={'intersection-data-table'}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>위치도</th>
                                        <td colSpan={6}>
                                            <table className={'text-data-table'}>
                                                <tbody>
                                                    <tr>
                                                        <th width={'8%'}>그룹</th>
                                                        <td width={'8%'}>{selectedID != 0 ? mapList[selectedID-1].group_id : null}</td>
                                                        <th width={'14%'}>교차로번호</th>
                                                        <td width={'8%'}>{ selectedID != 0 ? mapList[selectedID-1].location_id : null}</td>
                                                        <th width={'12%'}>교차로명</th>
                                                        <td width={'20%'}>{ selectedID != 0 ? mapList[selectedID-1].location_name : null}</td>
                                                        <th width={'12%'}>시행일</th>
                                                        <td width={'16%'}></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td rowSpan={2} width={'25%'}></td>
                                        <th>1현시</th>
                                        <th>2현시</th>
                                        <th>3현시</th>
                                        <th>4현시</th>
                                        <th>5현시</th>
                                        <th>6현시</th>
                                    </tr>
                                    <tr>
                                        <td className={'movement'} id={'movement-1'}></td>
                                        <td className={'movement'} id={'movement-2'}></td>
                                        <td className={'movement'} id={'movement-3'}></td>
                                        <td className={'movement'} id={'movement-4'}></td>
                                        <td className={'movement'} id={'movement-5'}></td>
                                        <td className={'movement'} id={'movement-6'}></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className={'signal-table'}>
                            <table>
                                <tbody>
                                    <tr>
                                        <th rowSpan='6' width={'4%'}>일반</th>
                                        <th colSpan='6' width={'21%'}>주현시</th>
                                        <th colSpan='6' width={'21%'}>최소녹색(MG)</th>
                                        <th colSpan='6' width={'21%'}>제어기최대녹색</th>
                                        <th colSpan='6' width={'21%'}>보행녹색</th>
                                    </tr>
                                    <tr>
                                        {/*주현시*/}
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        {/*최소녹색*/}
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        {/*제어기최대녹색*/}
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        {/*보행녹색*/}
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        {/*주현시*/}
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        {/*최소녹색*/}
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        {/*제어기최대녹색*/}
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        {/*보행녹색*/}
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <th colSpan='6'>보행점멸</th>
                                        <th colSpan='6'>황색신호</th>
                                        <th colSpan='6'>전적색신호</th>
                                        <th colSpan='6'>보행전시간</th>
                                    </tr>
                                    <tr>
                                        {/*보행점멸*/}
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        {/*황색신호*/}
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        {/*전적색신호*/}
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        {/*보행전시간*/}
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        {/*보행점멸*/}
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        {/*황색신호*/}
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        {/*전적색신호*/}
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        {/*보행전시간*/}
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className={'plan-table'}>
                            {createPlanTable('plan-table-1-','planTable', ['번호', '시각', '주기', '패턴'], '1')}
                            {createPlanTable('plan-table-1-','planTable',['번호', '시각', '주기', '패턴'], '2')}
                            {createPlanTable('plan-table-1-','planTable',['번호', '시각', '주기', '패턴'], '3')}
                            {createPlanTable('plan-table-1-','planTable',['번호', '시각', '주기', '패턴'], '4')}
                            {createPlanTable('holyData-planTable-1-','HolyDayTable',['번호', 'DAY', 'TOD'], '1')}
                            {createPlanTable('holyData-planTable-2-','HolyDayTable',['번호', 'DAY', 'TOD'], '2')}
                        </div>
                        <div className={'time-table-container'}>
                            <table>
                                <thead>
                                    <tr>
                                        <th rowSpan={2} width={'6%'}>주기번호</th>
                                        <th rowSpan={2} width={'6%'}>주기값</th>
                                        <th rowSpan={2} width={'6%'}>패턴</th>
                                        <th colSpan={7}>일반1</th>
                                        <th rowSpan={2} width={'6%'}>패턴</th>
                                        <th colSpan={7}>일반2</th>
                                    </tr>
                                    <tr>
                                        <th width={'6%'}>연동</th>
                                        <th colSpan={6}>현시</th>
                                        <th width={'6%'}>연동</th>
                                        <th colSpan={6}>현시</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th rowSpan={2}>1</th>
                                        <td rowSpan={2}></td>
                                        <th rowSpan={2}>1</th>
                                        <td rowSpan={2}></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <th rowSpan={2}>17</th>
                                        <td rowSpan={2}></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <th rowSpan={6}>2</th>
                                        <td rowSpan={6}></td>
                                        <th rowSpan={2}>2</th>
                                        <td rowSpan={2}></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <th rowSpan={2}>18</th>
                                        <td rowSpan={2}></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <th rowSpan={2}>3</th>
                                        <td rowSpan={2}></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <th rowSpan={2}>19</th>
                                        <td rowSpan={2}></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <th rowSpan={2}>4</th>
                                        <td rowSpan={2}></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <th rowSpan={2}>20</th>
                                        <td rowSpan={2}></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <th rowSpan={6}>3</th>
                                        <td rowSpan={6}></td>
                                        <th rowSpan={2}>5</th>
                                        <td rowSpan={2}></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <th rowSpan={2}>21</th>
                                        <td rowSpan={2}></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <th rowSpan={2}>6</th>
                                        <td rowSpan={2}></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <th rowSpan={2}>22</th>
                                        <td rowSpan={2}></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <th rowSpan={2}>7</th>
                                        <td rowSpan={2}></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <th rowSpan={2}>23</th>
                                        <td rowSpan={2}></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <th rowSpan={2}>4</th>
                                        <td rowSpan={2}></td>
                                        <th rowSpan={2}>8</th>
                                        <td rowSpan={2}></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <th rowSpan={2}>24</th>
                                        <td rowSpan={2}></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </table>
                            <table>
                                <thead>
                                    <tr>
                                        <th rowSpan={2} width={'6%'}>주기번호</th>
                                        <th rowSpan={2} width={'6%'}>주기값</th>
                                        <th rowSpan={2} width={'6%'}>패턴</th>
                                        <th colSpan={7}>일반1</th>
                                        <th rowSpan={2} width={'6%'}>패턴</th>
                                        <th colSpan={7}>일반2</th>
                                    </tr>
                                    <tr>
                                        <th width={'6%'}>연동</th>
                                        <th colSpan={6}>현시</th>
                                        <th width={'6%'}>연동</th>
                                        <th colSpan={6}>현시</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th rowSpan={4}>4</th>
                                        <td rowSpan={4}></td>
                                        <th rowSpan={2}>9</th>
                                        <td rowSpan={2}></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <th rowSpan={2}>25</th>
                                        <td rowSpan={2}></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <th rowSpan={2}>10</th>
                                        <td rowSpan={2}></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <th rowSpan={2}>26</th>
                                        <td rowSpan={2}></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <th rowSpan={6}>5</th>
                                        <td rowSpan={6}></td>
                                        <th rowSpan={2}>11</th>
                                        <td rowSpan={2}></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <th rowSpan={2}>27</th>
                                        <td rowSpan={2}></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <th rowSpan={2}>12</th>
                                        <td rowSpan={2}></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <th rowSpan={2}>28</th>
                                        <td rowSpan={2}></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <th rowSpan={2}>13</th>
                                        <td rowSpan={2}></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <th rowSpan={2}>29</th>
                                        <td rowSpan={2}></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <th rowSpan={6}>6</th>
                                        <td rowSpan={6}></td>
                                        <th rowSpan={2}>14</th>
                                        <td rowSpan={2}></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <th rowSpan={2}>30</th>
                                        <td rowSpan={2}></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <th rowSpan={2}>15</th>
                                        <td rowSpan={2}></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <th rowSpan={2}>31</th>
                                        <td rowSpan={2}></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <th rowSpan={2}>16</th>
                                        <td rowSpan={2}></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <th rowSpan={2}>32</th>
                                        <td rowSpan={2}></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                    </div>
                </Container>
            </div>
            <style jsx>{`
              h3, h4{
                color: #707070;
              }
              h4{
                margin-bottom: 10px;
                margin-right: 10px;
              }
              
              .content{
                display: flex;
              }
              table{
                text-align: center;
                color: #707070;
                border-collapse: collapse;
              }
              .plan-table{
                display: flex;
              }
              .report-area table{
                font-size: 12px;
              }
              .report-area th{
                border: 1px solid #DEDEDE;
                background-color: #FAFAFA;
              }
              .report-area td{
                border: 1px solid #DEDEDE;
              }
              .signal-table{
                margin-top: 5px;
                margin-bottom: 5px;
              }
              .text-data-table th{
                border-top: none;
                border-bottom: none;
              }
              .text-data.table td{
                border: none;
              }
              .text-data-table th:first-child{
                border-left: none;
              }
              .movement{
                height: 150px;
              }
              .signal-table td{
                height: 14px;
              }
              .time-table-container{
                display: flex;
                margin-top: 5px;
              }
              .time-table-container table:first-child{
                margin-right: 5px;
              }
              .time-table-container table{
                height: 280px;
              }
              .time-table-container td{
                font-size: 6px;
                width: 5%;
                height: 14px;
              }
              .timeSpaceDiagramView{
                box-shadow: 2px 2px .1px #DADBDE inset;
                width: 765px;
                height: 335px;
              }
              .select-view{
                display: flex;
                align-items: center;
                margin-bottom: 5px;
              }
              .select-view h4{
                margin-bottom: 2px;
              }
              select{
                padding: 2px 8px;
                border: 2px solid #707070;
                border-radius: 5px;
                margin-right: 8px;
                color: #707070;
                font-family: NanumSquareAcB;
              }
              .chart-option-view{
                display: flex;
              }
              .chart-type-toggle span{
                border: 1px solid #293042;
                padding: 2px 6px;
                cursor: pointer;
                font-size: 13px;
              }
              .chart-type-toggle span:first-child{
                border-radius: 8px 0px 0px 8px;
              }
              .chart-type-toggle span:last-child{
                border-radius: 0px 8px 8px 0px;
              }
              .chart-type.active{
                background-color: #293042;
                border: 1px solid #293042;
                color: white;
              }
              .chart-type:hover{
                background-color: #66789d;
                color: white;
              }
              .placeholder-text{
                width: 760px;
                height: 280px;
                text-align: center;
                line-height: 280px;
              }
              .chart-options{
                margin-left: auto;
                display: flex;
                font-size: 15px;
              }
            `}</style>
        </>
    );
};
export async function getServerSideProps(context) {
    return authCheck(context)
}
export default IntersectionData;
